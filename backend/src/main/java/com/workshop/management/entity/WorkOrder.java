package com.workshop.management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "work_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrder extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_mechanic_id")
    private User assignedMechanic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private WorkOrderStatus status = WorkOrderStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String customerConcerns;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String workPerformed;

    private LocalDateTime scheduledDate;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private Integer estimatedMinutes;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal laborCost = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal partsCost = BigDecimal.ZERO;

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkOrderService> services = new ArrayList<>();

    @OneToOne(mappedBy = "workOrder", cascade = CascadeType.ALL)
    private Invoice invoice;

    public BigDecimal getTotalCost() {
        BigDecimal serviceCost = services.stream()
                .map(WorkOrderService::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return serviceCost.add(laborCost).add(partsCost);
    }

    public void addService(WorkOrderService service) {
        services.add(service);
        service.setWorkOrder(this);
    }

    public void removeService(WorkOrderService service) {
        services.remove(service);
        service.setWorkOrder(null);
    }

    @PrePersist
    public void generateOrderNumber() {
        if (orderNumber == null) {
            this.orderNumber = "WO-" + System.currentTimeMillis();
        }
    }
}
