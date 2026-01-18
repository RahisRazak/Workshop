package com.workshop.management.service;

import com.workshop.management.dto.ServiceItemDTO;
import com.workshop.management.entity.ServiceCategory;
import com.workshop.management.entity.ServiceItem;
import com.workshop.management.exception.ResourceNotFoundException;
import com.workshop.management.repository.ServiceItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceItemService {

    private final ServiceItemRepository serviceItemRepository;

    public List<ServiceItemDTO> getAllActiveServices() {
        return serviceItemRepository.findByActiveTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ServiceItemDTO> getAllServices() {
        return serviceItemRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ServiceItemDTO> getServicesByCategory(ServiceCategory category) {
        return serviceItemRepository.findByCategoryAndActiveTrue(category).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ServiceItemDTO getServiceById(Long id) {
        ServiceItem service = serviceItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", id));
        return toDTO(service);
    }

    @Transactional
    public ServiceItemDTO createService(ServiceItemDTO dto) {
        ServiceItem service = toEntity(dto);
        service = serviceItemRepository.save(service);
        return toDTO(service);
    }

    @Transactional
    public ServiceItemDTO updateService(Long id, ServiceItemDTO dto) {
        ServiceItem service = serviceItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", id));

        service.setName(dto.getName());
        service.setDescription(dto.getDescription());
        service.setBasePrice(dto.getBasePrice());
        service.setEstimatedMinutes(dto.getEstimatedMinutes());
        service.setCategory(dto.getCategory());
        service.setActive(dto.isActive());

        service = serviceItemRepository.save(service);
        return toDTO(service);
    }

    @Transactional
    public void deleteService(Long id) {
        ServiceItem service = serviceItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", id));
        service.setActive(false);
        serviceItemRepository.save(service);
    }

    private ServiceItemDTO toDTO(ServiceItem service) {
        return ServiceItemDTO.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .basePrice(service.getBasePrice())
                .estimatedMinutes(service.getEstimatedMinutes())
                .category(service.getCategory())
                .active(service.isActive())
                .build();
    }

    private ServiceItem toEntity(ServiceItemDTO dto) {
        return ServiceItem.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .basePrice(dto.getBasePrice())
                .estimatedMinutes(dto.getEstimatedMinutes() != null ? dto.getEstimatedMinutes() : 60)
                .category(dto.getCategory() != null ? dto.getCategory() : ServiceCategory.GENERAL)
                .active(dto.isActive())
                .build();
    }
}
