package com.workshop.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderServiceDTO {
    private Long id;
    private Long serviceItemId;
    private String serviceName;
    private BigDecimal price;
    private Integer quantity;
    private String notes;
    private boolean completed;
}
