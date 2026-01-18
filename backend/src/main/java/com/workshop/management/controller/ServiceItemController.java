package com.workshop.management.controller;

import com.workshop.management.dto.ServiceItemDTO;
import com.workshop.management.entity.ServiceCategory;
import com.workshop.management.service.ServiceItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@Tag(name = "Services", description = "Service catalog management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ServiceItemController {

    private final ServiceItemService serviceItemService;

    @GetMapping
    @Operation(summary = "Get all active services")
    public ResponseEntity<List<ServiceItemDTO>> getAllActiveServices() {
        return ResponseEntity.ok(serviceItemService.getAllActiveServices());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all services including inactive (Admin only)")
    public ResponseEntity<List<ServiceItemDTO>> getAllServices() {
        return ResponseEntity.ok(serviceItemService.getAllServices());
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get services by category")
    public ResponseEntity<List<ServiceItemDTO>> getServicesByCategory(@PathVariable ServiceCategory category) {
        return ResponseEntity.ok(serviceItemService.getServicesByCategory(category));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get service by ID")
    public ResponseEntity<ServiceItemDTO> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceItemService.getServiceById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new service (Admin only)")
    public ResponseEntity<ServiceItemDTO> createService(@Valid @RequestBody ServiceItemDTO serviceDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceItemService.createService(serviceDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing service (Admin only)")
    public ResponseEntity<ServiceItemDTO> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceItemDTO serviceDTO) {
        return ResponseEntity.ok(serviceItemService.updateService(id, serviceDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate a service (Admin only)")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceItemService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
