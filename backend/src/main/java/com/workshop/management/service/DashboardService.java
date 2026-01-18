package com.workshop.management.service;

import com.workshop.management.dto.DashboardDTO;
import com.workshop.management.entity.WorkOrderStatus;
import com.workshop.management.repository.CustomerRepository;
import com.workshop.management.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CustomerService customerService;
    private final WorkOrderService workOrderService;
    private final InvoiceService invoiceService;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;

    public DashboardDTO getDashboardData() {
        return DashboardDTO.builder()
                .totalCustomers(customerRepository.count())
                .totalVehicles(vehicleRepository.count())
                .pendingWorkOrders(workOrderService.countByStatus(WorkOrderStatus.PENDING))
                .inProgressWorkOrders(workOrderService.countByStatus(WorkOrderStatus.IN_PROGRESS))
                .completedWorkOrdersToday(workOrderService.countByStatus(WorkOrderStatus.COMPLETED))
                .pendingInvoices(invoiceService.countPendingInvoices())
                .monthlyRevenue(invoiceService.calculateMonthlyRevenue())
                .outstandingBalance(invoiceService.calculateOutstandingBalance())
                .recentWorkOrders(workOrderService.getRecentWorkOrders(5))
                .upcomingAppointments(workOrderService.getUpcomingAppointments(7))
                .build();
    }
}
