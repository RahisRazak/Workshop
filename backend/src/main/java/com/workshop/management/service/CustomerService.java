package com.workshop.management.service;

import com.workshop.management.dto.CustomerDTO;
import com.workshop.management.entity.Customer;
import com.workshop.management.exception.BadRequestException;
import com.workshop.management.exception.ResourceNotFoundException;
import com.workshop.management.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public Page<CustomerDTO> getAllCustomers(Pageable pageable) {
        return customerRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<CustomerDTO> searchCustomers(String search, Pageable pageable) {
        return customerRepository.searchCustomers(search, pageable).map(this::toDTO);
    }

    public CustomerDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        return toDTO(customer);
    }

    @Transactional
    public CustomerDTO createCustomer(CustomerDTO dto) {
        if (dto.getEmail() != null && customerRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new BadRequestException("Email is already in use");
        }
        if (customerRepository.findByPhone(dto.getPhone()).isPresent()) {
            throw new BadRequestException("Phone number is already in use");
        }

        Customer customer = toEntity(dto);
        customer = customerRepository.save(customer);
        return toDTO(customer);
    }

    @Transactional
    public CustomerDTO updateCustomer(Long id, CustomerDTO dto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));

        customer.setFirstName(dto.getFirstName());
        customer.setLastName(dto.getLastName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setAddress(dto.getAddress());
        customer.setCity(dto.getCity());
        customer.setState(dto.getState());
        customer.setZipCode(dto.getZipCode());
        customer.setNotes(dto.getNotes());

        customer = customerRepository.save(customer);
        return toDTO(customer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        if (!customer.getVehicles().isEmpty()) {
            throw new BadRequestException("Cannot delete customer with associated vehicles");
        }
        customerRepository.delete(customer);
    }

    public long getTotalCount() {
        return customerRepository.count();
    }

    private CustomerDTO toDTO(Customer customer) {
        return CustomerDTO.builder()
                .id(customer.getId())
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .city(customer.getCity())
                .state(customer.getState())
                .zipCode(customer.getZipCode())
                .notes(customer.getNotes())
                .vehicleCount(customer.getVehicles().size())
                .build();
    }

    private Customer toEntity(CustomerDTO dto) {
        return Customer.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .zipCode(dto.getZipCode())
                .notes(dto.getNotes())
                .build();
    }
}
