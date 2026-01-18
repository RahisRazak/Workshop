package com.workshop.management.repository;

import com.workshop.management.entity.Invoice;
import com.workshop.management.entity.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByWorkOrderId(Long workOrderId);

    List<Invoice> findByStatus(InvoiceStatus status);

    Page<Invoice> findByStatus(InvoiceStatus status, Pageable pageable);

    @Query("SELECT i FROM Invoice i WHERE i.dueDate < :today AND i.status NOT IN ('PAID', 'CANCELLED')")
    List<Invoice> findOverdueInvoices(@Param("today") LocalDate today);

    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.status = 'PAID' AND i.paidDate BETWEEN :start AND :end")
    BigDecimal calculateRevenueForPeriod(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT SUM(i.totalAmount - i.paidAmount) FROM Invoice i WHERE i.status NOT IN ('PAID', 'CANCELLED')")
    BigDecimal calculateOutstandingBalance();

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = :status")
    long countByStatus(@Param("status") InvoiceStatus status);
}
