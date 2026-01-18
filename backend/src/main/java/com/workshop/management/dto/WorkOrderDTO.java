package com.workshop.management.dto;

import com.workshop.management.entity.WorkOrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderDTO {
    private Long id;
    private String orderNumber;

    @NotNull
    private Long vehicleId;

    private String vehicleInfo;
    private Long customerId;
    private String customerName;
    private Long assignedMechanicId;
    private String assignedMechanicName;
    private WorkOrderStatus status;
    private String description;
    private String customerConcerns;
    private String diagnosis;
    private String workPerformed;
    private LocalDateTime scheduledDate;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Integer estimatedMinutes;
    private BigDecimal laborCost;
    private BigDecimal partsCost;
    private BigDecimal totalCost;
    private List<WorkOrderServiceDTO> services;
    private LocalDateTime createdAt;
}
