package com.workshop.management.repository;

import com.workshop.management.entity.WorkOrderService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderServiceRepository extends JpaRepository<WorkOrderService, Long> {
    List<WorkOrderService> findByWorkOrderId(Long workOrderId);

    void deleteByWorkOrderId(Long workOrderId);
}
