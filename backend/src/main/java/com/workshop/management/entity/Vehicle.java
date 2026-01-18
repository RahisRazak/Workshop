package com.workshop.management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle extends BaseEntity {

    @Size(max = 17)
    @Column(unique = true)
    private String vin;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false)
    private String make;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private Integer year;

    @Size(max = 30)
    private String color;

    @Size(max = 20)
    @Column(unique = true)
    private String licensePlate;

    private Integer mileage;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    @Builder.Default
    private List<WorkOrder> workOrders = new ArrayList<>();

    public String getDisplayName() {
        return year + " " + make + " " + model;
    }
}
