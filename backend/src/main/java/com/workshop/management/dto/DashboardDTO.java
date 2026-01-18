package com.workshop.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private long totalCustomers;
    private long totalVehicles;
    private long pendingWorkOrders;
    private long inProgressWorkOrders;
    private long completedWorkOrdersToday;
    private long pendingInvoices;
    private BigDecimal monthlyRevenue;
    private BigDecimal outstandingBalance;
    private List<WorkOrderDTO> recentWorkOrders;
    private List<WorkOrderDTO> upcomingAppointments;
}
