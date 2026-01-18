package com.workshop.management.repository;

import com.workshop.management.entity.ServiceCategory;
import com.workshop.management.entity.ServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {
    List<ServiceItem> findByActiveTrue();

    List<ServiceItem> findByCategoryAndActiveTrue(ServiceCategory category);

    List<ServiceItem> findByNameContainingIgnoreCase(String name);
}
