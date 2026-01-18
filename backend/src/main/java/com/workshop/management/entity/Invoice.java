package com.workshop.management.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String invoiceNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxRate = new BigDecimal("8.25");

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal taxAmount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    private LocalDate issueDate;

    private LocalDate dueDate;

    private LocalDate paidDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public BigDecimal getBalanceDue() {
        return totalAmount.subtract(paidAmount);
    }

    public void calculateTotals() {
        if (workOrder != null) {
            this.subtotal = workOrder.getTotalCost();
        }
        this.taxAmount = subtotal.multiply(taxRate).divide(new BigDecimal("100"));
        this.totalAmount = subtotal.add(taxAmount);
    }

    public void recordPayment(BigDecimal amount) {
        this.paidAmount = this.paidAmount.add(amount);
        if (this.paidAmount.compareTo(this.totalAmount) >= 0) {
            this.status = InvoiceStatus.PAID;
            this.paidDate = LocalDate.now();
        } else if (this.paidAmount.compareTo(BigDecimal.ZERO) > 0) {
            this.status = InvoiceStatus.PARTIALLY_PAID;
        }
    }

    @PrePersist
    public void generateInvoiceNumber() {
        if (invoiceNumber == null) {
            this.invoiceNumber = "INV-" + System.currentTimeMillis();
        }
        if (issueDate == null) {
            this.issueDate = LocalDate.now();
        }
        if (dueDate == null) {
            this.dueDate = issueDate.plusDays(30);
        }
    }
}
