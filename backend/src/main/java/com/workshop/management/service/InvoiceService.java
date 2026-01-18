package com.workshop.management.service;

import com.workshop.management.dto.InvoiceDTO;
import com.workshop.management.entity.Invoice;
import com.workshop.management.entity.InvoiceStatus;
import com.workshop.management.entity.WorkOrder;
import com.workshop.management.entity.WorkOrderStatus;
import com.workshop.management.exception.BadRequestException;
import com.workshop.management.exception.ResourceNotFoundException;
import com.workshop.management.repository.InvoiceRepository;
import com.workshop.management.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final WorkOrderRepository workOrderRepository;

    public Page<InvoiceDTO> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<InvoiceDTO> getInvoicesByStatus(InvoiceStatus status, Pageable pageable) {
        return invoiceRepository.findByStatus(status, pageable).map(this::toDTO);
    }

    public InvoiceDTO getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
        return toDTO(invoice);
    }

    public InvoiceDTO getInvoiceByWorkOrderId(Long workOrderId) {
        Invoice invoice = invoiceRepository.findByWorkOrderId(workOrderId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Invoice for work order " + workOrderId + " not found"));
        return toDTO(invoice);
    }

    @Transactional
    public InvoiceDTO createInvoice(Long workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", workOrderId));

        if (workOrder.getStatus() != WorkOrderStatus.COMPLETED) {
            throw new BadRequestException("Can only create invoice for completed work orders");
        }

        if (invoiceRepository.findByWorkOrderId(workOrderId).isPresent()) {
            throw new BadRequestException("Invoice already exists for this work order");
        }

        Invoice invoice = Invoice.builder()
                .workOrder(workOrder)
                .subtotal(workOrder.getTotalCost())
                .status(InvoiceStatus.DRAFT)
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .build();

        invoice.calculateTotals();
        invoice = invoiceRepository.save(invoice);
        return toDTO(invoice);
    }

    @Transactional
    public InvoiceDTO updateInvoice(Long id, InvoiceDTO dto) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BadRequestException("Cannot update a paid invoice");
        }

        invoice.setTaxRate(dto.getTaxRate());
        invoice.setDueDate(dto.getDueDate());
        invoice.setNotes(dto.getNotes());
        invoice.calculateTotals();

        invoice = invoiceRepository.save(invoice);
        return toDTO(invoice);
    }

    @Transactional
    public InvoiceDTO sendInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));

        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new BadRequestException("Can only send draft invoices");
        }

        invoice.setStatus(InvoiceStatus.SENT);
        invoice.setIssueDate(LocalDate.now());
        invoice = invoiceRepository.save(invoice);
        return toDTO(invoice);
    }

    @Transactional
    public InvoiceDTO recordPayment(Long id, BigDecimal amount) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be positive");
        }

        if (amount.compareTo(invoice.getBalanceDue()) > 0) {
            throw new BadRequestException("Payment amount exceeds balance due");
        }

        invoice.recordPayment(amount);
        invoice = invoiceRepository.save(invoice);
        return toDTO(invoice);
    }

    public BigDecimal calculateMonthlyRevenue() {
        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        BigDecimal revenue = invoiceRepository.calculateRevenueForPeriod(start, end);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    public BigDecimal calculateOutstandingBalance() {
        BigDecimal balance = invoiceRepository.calculateOutstandingBalance();
        return balance != null ? balance : BigDecimal.ZERO;
    }

    public long countPendingInvoices() {
        return invoiceRepository.countByStatus(InvoiceStatus.SENT) +
                invoiceRepository.countByStatus(InvoiceStatus.PARTIALLY_PAID);
    }

    private InvoiceDTO toDTO(Invoice invoice) {
        WorkOrder workOrder = invoice.getWorkOrder();
        return InvoiceDTO.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .workOrderId(workOrder.getId())
                .workOrderNumber(workOrder.getOrderNumber())
                .customerName(workOrder.getVehicle().getCustomer().getFullName())
                .vehicleInfo(workOrder.getVehicle().getDisplayName())
                .subtotal(invoice.getSubtotal())
                .taxRate(invoice.getTaxRate())
                .taxAmount(invoice.getTaxAmount())
                .totalAmount(invoice.getTotalAmount())
                .paidAmount(invoice.getPaidAmount())
                .balanceDue(invoice.getBalanceDue())
                .status(invoice.getStatus())
                .issueDate(invoice.getIssueDate())
                .dueDate(invoice.getDueDate())
                .paidDate(invoice.getPaidDate())
                .notes(invoice.getNotes())
                .build();
    }
}
