package com.workshop.management.repository;

import com.workshop.management.entity.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByVin(String vin);

    Optional<Vehicle> findByLicensePlate(String licensePlate);

    List<Vehicle> findByCustomerId(Long customerId);

    @Query("SELECT v FROM Vehicle v WHERE " +
            "LOWER(v.make) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(v.model) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "v.licensePlate LIKE CONCAT('%', :search, '%') OR " +
            "v.vin LIKE CONCAT('%', :search, '%')")
    Page<Vehicle> searchVehicles(@Param("search") String search, Pageable pageable);
}
