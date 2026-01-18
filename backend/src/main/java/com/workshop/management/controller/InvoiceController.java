package com.workshop.management.controller;

import com.workshop.management.dto.InvoiceDTO;
import com.workshop.management.entity.InvoiceStatus;
import com.workshop.management.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Invoices", description = "Invoice management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    @Operation(summary = "Get all invoices with pagination")
    public ResponseEntity<Page<InvoiceDTO>> getAllInvoices(
            @RequestParam(required = false) InvoiceStatus status,
            @PageableDefault(size = 10) Pageable pageable) {
        if (status != null) {
            return ResponseEntity.ok(invoiceService.getInvoicesByStatus(status, pageable));
        }
        return ResponseEntity.ok(invoiceService.getAllInvoices(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get invoice by ID")
    public ResponseEntity<InvoiceDTO> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @GetMapping("/workorder/{workOrderId}")
    @Operation(summary = "Get invoice by work order ID")
    public ResponseEntity<InvoiceDTO> getInvoiceByWorkOrderId(@PathVariable Long workOrderId) {
        return ResponseEntity.ok(invoiceService.getInvoiceByWorkOrderId(workOrderId));
    }

    @PostMapping("/workorder/{workOrderId}")
    @Operation(summary = "Create invoice for a work order")
    public ResponseEntity<InvoiceDTO> createInvoice(@PathVariable Long workOrderId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.createInvoice(workOrderId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an invoice")
    public ResponseEntity<InvoiceDTO> updateInvoice(
            @PathVariable Long id,
            @Valid @RequestBody InvoiceDTO invoiceDTO) {
        return ResponseEntity.ok(invoiceService.updateInvoice(id, invoiceDTO));
    }

    @PostMapping("/{id}/send")
    @Operation(summary = "Send an invoice to customer")
    public ResponseEntity<InvoiceDTO> sendInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.sendInvoice(id));
    }

    @PostMapping("/{id}/payment")
    @Operation(summary = "Record a payment for an invoice")
    public ResponseEntity<InvoiceDTO> recordPayment(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> paymentRequest) {
        BigDecimal amount = paymentRequest.get("amount");
        return ResponseEntity.ok(invoiceService.recordPayment(id, amount));
    }
}
