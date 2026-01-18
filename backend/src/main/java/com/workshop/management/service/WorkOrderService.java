package com.workshop.management.service;

import com.workshop.management.dto.WorkOrderDTO;
import com.workshop.management.dto.WorkOrderServiceDTO;
import com.workshop.management.entity.*;
import com.workshop.management.exception.BadRequestException;
import com.workshop.management.exception.ResourceNotFoundException;
import com.workshop.management.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final ServiceItemRepository serviceItemRepository;
    private final WorkOrderServiceRepository workOrderServiceRepository;

    public Page<WorkOrderDTO> getAllWorkOrders(Pageable pageable) {
        return workOrderRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<WorkOrderDTO> getWorkOrdersByStatus(WorkOrderStatus status, Pageable pageable) {
        return workOrderRepository.findByStatus(status, pageable).map(this::toDTO);
    }

    public WorkOrderDTO getWorkOrderById(Long id) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", id));
        return toDTO(workOrder);
    }

    public List<WorkOrderDTO> getRecentWorkOrders(int limit) {
        return workOrderRepository.findRecentWorkOrders(PageRequest.of(0, limit)).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<WorkOrderDTO> getUpcomingAppointments(int days) {
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusDays(days);
        return workOrderRepository.findByScheduledDateBetween(start, end).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkOrderDTO createWorkOrder(WorkOrderDTO dto) {
        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", dto.getVehicleId()));

        WorkOrder workOrder = WorkOrder.builder()
                .vehicle(vehicle)
                .status(WorkOrderStatus.PENDING)
                .description(dto.getDescription())
                .customerConcerns(dto.getCustomerConcerns())
                .scheduledDate(dto.getScheduledDate())
                .estimatedMinutes(dto.getEstimatedMinutes())
                .build();

        if (dto.getAssignedMechanicId() != null) {
            User mechanic = userRepository.findById(dto.getAssignedMechanicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Mechanic", dto.getAssignedMechanicId()));
            workOrder.setAssignedMechanic(mechanic);
        }

        workOrder = workOrderRepository.save(workOrder);

        if (dto.getServices() != null && !dto.getServices().isEmpty()) {
            for (WorkOrderServiceDTO serviceDto : dto.getServices()) {
                addServiceToWorkOrder(workOrder, serviceDto);
            }
        }

        return toDTO(workOrderRepository.findById(workOrder.getId()).orElse(workOrder));
    }

    @Transactional
    public WorkOrderDTO updateWorkOrder(Long id, WorkOrderDTO dto) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", id));

        workOrder.setDescription(dto.getDescription());
        workOrder.setCustomerConcerns(dto.getCustomerConcerns());
        workOrder.setDiagnosis(dto.getDiagnosis());
        workOrder.setWorkPerformed(dto.getWorkPerformed());
        workOrder.setScheduledDate(dto.getScheduledDate());
        workOrder.setEstimatedMinutes(dto.getEstimatedMinutes());
        workOrder.setLaborCost(dto.getLaborCost());
        workOrder.setPartsCost(dto.getPartsCost());

        if (dto.getAssignedMechanicId() != null) {
            User mechanic = userRepository.findById(dto.getAssignedMechanicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Mechanic", dto.getAssignedMechanicId()));
            workOrder.setAssignedMechanic(mechanic);
        }

        workOrder = workOrderRepository.save(workOrder);
        return toDTO(workOrder);
    }

    @Transactional
    public WorkOrderDTO updateStatus(Long id, WorkOrderStatus newStatus) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", id));

        WorkOrderStatus currentStatus = workOrder.getStatus();
        validateStatusTransition(currentStatus, newStatus);

        workOrder.setStatus(newStatus);

        if (newStatus == WorkOrderStatus.IN_PROGRESS && workOrder.getStartedAt() == null) {
            workOrder.setStartedAt(LocalDateTime.now());
        } else if (newStatus == WorkOrderStatus.COMPLETED) {
            workOrder.setCompletedAt(LocalDateTime.now());
        }

        workOrder = workOrderRepository.save(workOrder);
        return toDTO(workOrder);
    }

    @Transactional
    public WorkOrderDTO addServiceToWorkOrder(Long workOrderId, WorkOrderServiceDTO serviceDto) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", workOrderId));
        addServiceToWorkOrder(workOrder, serviceDto);
        return toDTO(workOrderRepository.findById(workOrderId).orElse(workOrder));
    }

    private void addServiceToWorkOrder(WorkOrder workOrder, WorkOrderServiceDTO serviceDto) {
        ServiceItem serviceItem = serviceItemRepository.findById(serviceDto.getServiceItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Service", serviceDto.getServiceItemId()));

        com.workshop.management.entity.WorkOrderService wos = com.workshop.management.entity.WorkOrderService.builder()
                .workOrder(workOrder)
                .serviceItem(serviceItem)
                .price(serviceDto.getPrice() != null ? serviceDto.getPrice() : serviceItem.getBasePrice())
                .quantity(serviceDto.getQuantity() != null ? serviceDto.getQuantity() : 1)
                .notes(serviceDto.getNotes())
                .completed(false)
                .build();

        workOrderServiceRepository.save(wos);
    }

    public long countByStatus(WorkOrderStatus status) {
        return workOrderRepository.countByStatus(status);
    }

    private void validateStatusTransition(WorkOrderStatus from, WorkOrderStatus to) {
        // Allow any backward transitions for corrections
        if (to.ordinal() < from.ordinal()) {
            return;
        }
        // Validate forward transitions
        switch (from) {
            case PENDING:
                if (to != WorkOrderStatus.SCHEDULED && to != WorkOrderStatus.IN_PROGRESS
                        && to != WorkOrderStatus.CANCELLED) {
                    throw new BadRequestException("Invalid status transition from " + from + " to " + to);
                }
                break;
            case SCHEDULED:
                if (to != WorkOrderStatus.IN_PROGRESS && to != WorkOrderStatus.CANCELLED) {
                    throw new BadRequestException("Invalid status transition from " + from + " to " + to);
                }
                break;
            case IN_PROGRESS:
                if (to != WorkOrderStatus.WAITING_FOR_PARTS && to != WorkOrderStatus.COMPLETED
                        && to != WorkOrderStatus.CANCELLED) {
                    throw new BadRequestException("Invalid status transition from " + from + " to " + to);
                }
                break;
            case WAITING_FOR_PARTS:
                if (to != WorkOrderStatus.IN_PROGRESS && to != WorkOrderStatus.CANCELLED) {
                    throw new BadRequestException("Invalid status transition from " + from + " to " + to);
                }
                break;
            case COMPLETED:
            case CANCELLED:
                throw new BadRequestException("Cannot change status from " + from);
        }
    }

    private WorkOrderDTO toDTO(WorkOrder workOrder) {
        List<WorkOrderServiceDTO> serviceDTOs = workOrder.getServices().stream()
                .map(s -> WorkOrderServiceDTO.builder()
                        .id(s.getId())
                        .serviceItemId(s.getServiceItem().getId())
                        .serviceName(s.getServiceItem().getName())
                        .price(s.getPrice())
                        .quantity(s.getQuantity())
                        .notes(s.getNotes())
                        .completed(s.isCompleted())
                        .build())
                .collect(Collectors.toList());

        return WorkOrderDTO.builder()
                .id(workOrder.getId())
                .orderNumber(workOrder.getOrderNumber())
                .vehicleId(workOrder.getVehicle().getId())
                .vehicleInfo(workOrder.getVehicle().getDisplayName())
                .customerId(workOrder.getVehicle().getCustomer().getId())
                .customerName(workOrder.getVehicle().getCustomer().getFullName())
                .assignedMechanicId(
                        workOrder.getAssignedMechanic() != null ? workOrder.getAssignedMechanic().getId() : null)
                .assignedMechanicName(
                        workOrder.getAssignedMechanic() != null ? workOrder.getAssignedMechanic().getFullName() : null)
                .status(workOrder.getStatus())
                .description(workOrder.getDescription())
                .customerConcerns(workOrder.getCustomerConcerns())
                .diagnosis(workOrder.getDiagnosis())
                .workPerformed(workOrder.getWorkPerformed())
                .scheduledDate(workOrder.getScheduledDate())
                .startedAt(workOrder.getStartedAt())
                .completedAt(workOrder.getCompletedAt())
                .estimatedMinutes(workOrder.getEstimatedMinutes())
                .laborCost(workOrder.getLaborCost())
                .partsCost(workOrder.getPartsCost())
                .totalCost(workOrder.getTotalCost())
                .services(serviceDTOs)
                .createdAt(workOrder.getCreatedAt())
                .build();
    }
}
