package com.workshop.management.controller;

import com.workshop.management.dto.WorkOrderDTO;
import com.workshop.management.dto.WorkOrderServiceDTO;
import com.workshop.management.entity.WorkOrderStatus;
import com.workshop.management.service.WorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workorders")
@RequiredArgsConstructor
@Tag(name = "Work Orders", description = "Work order management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @GetMapping
    @Operation(summary = "Get all work orders with pagination")
    public ResponseEntity<Page<WorkOrderDTO>> getAllWorkOrders(
            @RequestParam(required = false) WorkOrderStatus status,
            @PageableDefault(size = 10) Pageable pageable) {
        if (status != null) {
            return ResponseEntity.ok(workOrderService.getWorkOrdersByStatus(status, pageable));
        }
        return ResponseEntity.ok(workOrderService.getAllWorkOrders(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get work order by ID")
    public ResponseEntity<WorkOrderDTO> getWorkOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getWorkOrderById(id));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent work orders")
    public ResponseEntity<List<WorkOrderDTO>> getRecentWorkOrders(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(workOrderService.getRecentWorkOrders(limit));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming appointments")
    public ResponseEntity<List<WorkOrderDTO>> getUpcomingAppointments(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(workOrderService.getUpcomingAppointments(days));
    }

    @PostMapping
    @Operation(summary = "Create a new work order")
    public ResponseEntity<WorkOrderDTO> createWorkOrder(@Valid @RequestBody WorkOrderDTO workOrderDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workOrderService.createWorkOrder(workOrderDTO));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing work order")
    public ResponseEntity<WorkOrderDTO> updateWorkOrder(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderDTO workOrderDTO) {
        return ResponseEntity.ok(workOrderService.updateWorkOrder(id, workOrderDTO));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update work order status")
    public ResponseEntity<WorkOrderDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        WorkOrderStatus newStatus = WorkOrderStatus.valueOf(statusUpdate.get("status"));
        return ResponseEntity.ok(workOrderService.updateStatus(id, newStatus));
    }

    @PostMapping("/{id}/services")
    @Operation(summary = "Add a service to work order")
    public ResponseEntity<WorkOrderDTO> addServiceToWorkOrder(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderServiceDTO serviceDTO) {
        return ResponseEntity.ok(workOrderService.addServiceToWorkOrder(id, serviceDTO));
    }
}
