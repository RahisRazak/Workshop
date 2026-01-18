package com.workshop.management.repository;

import com.workshop.management.entity.WorkOrder;
import com.workshop.management.entity.WorkOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    Optional<WorkOrder> findByOrderNumber(String orderNumber);

    List<WorkOrder> findByStatus(WorkOrderStatus status);

    List<WorkOrder> findByVehicleId(Long vehicleId);

    List<WorkOrder> findByAssignedMechanicId(Long mechanicId);

    @Query("SELECT wo FROM WorkOrder wo WHERE wo.status = :status")
    Page<WorkOrder> findByStatus(@Param("status") WorkOrderStatus status, Pageable pageable);

    @Query("SELECT wo FROM WorkOrder wo WHERE wo.scheduledDate BETWEEN :start AND :end")
    List<WorkOrder> findByScheduledDateBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT wo FROM WorkOrder wo ORDER BY wo.createdAt DESC")
    List<WorkOrder> findRecentWorkOrders(Pageable pageable);

    @Query("SELECT COUNT(wo) FROM WorkOrder wo WHERE wo.status = :status")
    long countByStatus(@Param("status") WorkOrderStatus status);

    @Query("SELECT wo FROM WorkOrder wo WHERE wo.vehicle.customer.id = :customerId")
    List<WorkOrder> findByCustomerId(@Param("customerId") Long customerId);
}
