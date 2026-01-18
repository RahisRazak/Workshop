package com.workshop.management.service;

import com.workshop.management.dto.VehicleDTO;
import com.workshop.management.entity.Customer;
import com.workshop.management.entity.Vehicle;
import com.workshop.management.exception.BadRequestException;
import com.workshop.management.exception.ResourceNotFoundException;
import com.workshop.management.repository.CustomerRepository;
import com.workshop.management.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;

    public Page<VehicleDTO> getAllVehicles(Pageable pageable) {
        return vehicleRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<VehicleDTO> searchVehicles(String search, Pageable pageable) {
        return vehicleRepository.searchVehicles(search, pageable).map(this::toDTO);
    }

    public VehicleDTO getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
        return toDTO(vehicle);
    }

    public List<VehicleDTO> getVehiclesByCustomer(Long customerId) {
        return vehicleRepository.findByCustomerId(customerId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehicleDTO createVehicle(VehicleDTO dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", dto.getCustomerId()));

        if (dto.getVin() != null && vehicleRepository.findByVin(dto.getVin()).isPresent()) {
            throw new BadRequestException("VIN is already registered");
        }
        if (dto.getLicensePlate() != null && vehicleRepository.findByLicensePlate(dto.getLicensePlate()).isPresent()) {
            throw new BadRequestException("License plate is already registered");
        }

        Vehicle vehicle = toEntity(dto);
        vehicle.setCustomer(customer);
        vehicle = vehicleRepository.save(vehicle);
        return toDTO(vehicle);
    }

    @Transactional
    public VehicleDTO updateVehicle(Long id, VehicleDTO dto) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));

        vehicle.setVin(dto.getVin());
        vehicle.setMake(dto.getMake());
        vehicle.setModel(dto.getModel());
        vehicle.setYear(dto.getYear());
        vehicle.setColor(dto.getColor());
        vehicle.setLicensePlate(dto.getLicensePlate());
        vehicle.setMileage(dto.getMileage());
        vehicle.setNotes(dto.getNotes());

        vehicle = vehicleRepository.save(vehicle);
        return toDTO(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
        if (!vehicle.getWorkOrders().isEmpty()) {
            throw new BadRequestException("Cannot delete vehicle with associated work orders");
        }
        vehicleRepository.delete(vehicle);
    }

    private VehicleDTO toDTO(Vehicle vehicle) {
        return VehicleDTO.builder()
                .id(vehicle.getId())
                .vin(vehicle.getVin())
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .color(vehicle.getColor())
                .licensePlate(vehicle.getLicensePlate())
                .mileage(vehicle.getMileage())
                .notes(vehicle.getNotes())
                .customerId(vehicle.getCustomer().getId())
                .customerName(vehicle.getCustomer().getFullName())
                .build();
    }

    private Vehicle toEntity(VehicleDTO dto) {
        return Vehicle.builder()
                .vin(dto.getVin())
                .make(dto.getMake())
                .model(dto.getModel())
                .year(dto.getYear())
                .color(dto.getColor())
                .licensePlate(dto.getLicensePlate())
                .mileage(dto.getMileage())
                .notes(dto.getNotes())
                .build();
    }
}
