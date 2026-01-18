import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { Invoice, Page, InvoiceStatus } from '@shared/models/domain.model';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h1>Invoices</h1>
      </div>

      <!-- Filters -->
      <div class="filters">
        <button 
          *ngFor="let status of statusFilters" 
          class="filter-btn" 
          [class.active]="selectedStatus === status.value"
          (click)="filterByStatus(status.value)">
          {{ status.label }}
        </button>
      </div>

      <div class="loading-container" *ngIf="loading">
        <div class="spinner"></div>
      </div>

      <div class="card" *ngIf="!loading">
        <table class="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let invoice of invoices">
              <td><strong>{{ invoice.invoiceNumber }}</strong></td>
              <td>{{ invoice.customerName }}</td>
              <td>{{ invoice.vehicleInfo }}</td>
              <td>\${{ invoice.totalAmount | number:'1.2-2' }}</td>
              <td class="paid">\${{ invoice.paidAmount | number:'1.2-2' }}</td>
              <td class="balance" [class.overdue]="invoice.balanceDue! > 0">\${{ invoice.balanceDue | number:'1.2-2' }}</td>
              <td>
                <span class="badge" [ngClass]="getStatusClass(invoice.status!)">
                  {{ formatStatus(invoice.status!) }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button 
                    class="icon-btn" 
                    *ngIf="invoice.status === 'DRAFT'"
                    (click)="sendInvoice(invoice)" 
                    title="Send Invoice">
                    <span class="material-icons">send</span>
                  </button>
                  <button 
                    class="icon-btn success" 
                    *ngIf="invoice.status !== 'PAID' && invoice.status !== 'DRAFT' && invoice.status !== 'CANCELLED'"
                    (click)="openPaymentModal(invoice)" 
                    title="Record Payment">
                    <span class="material-icons">payments</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty-state" *ngIf="!invoices.length">
          <span class="material-icons">receipt_long</span>
          <p>No invoices found</p>
        </div>

        <div class="pagination" *ngIf="totalPages > 1">
          <button class="btn btn-secondary" [disabled]="currentPage === 0" (click)="goToPage(currentPage - 1)">Previous</button>
          <span class="page-info">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
          <button class="btn btn-secondary" [disabled]="currentPage >= totalPages - 1" (click)="goToPage(currentPage + 1)">Next</button>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div class="modal-overlay" *ngIf="showPaymentModal" (click)="closePaymentModal()">
      <div class="modal small" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Record Payment</h2>
          <button class="close-btn" (click)="closePaymentModal()"><span class="material-icons">close</span></button>
        </div>
        
        <form class="modal-body" (ngSubmit)="recordPayment()">
          <div class="payment-info" *ngIf="selectedInvoice">
            <p><strong>Invoice:</strong> {{ selectedInvoice.invoiceNumber }}</p>
            <p><strong>Balance Due:</strong> \${{ selectedInvoice.balanceDue | number:'1.2-2' }}</p>
          </div>

          <div class="form-group">
            <label>Payment Amount *</label>
            <input type="number" [(ngModel)]="paymentAmount" name="amount" required min="0.01" [attr.max]="selectedInvoice?.balanceDue ?? null" step="0.01">
          </div>

          <div class="quick-amounts" *ngIf="selectedInvoice">
            <button type="button" class="quick-btn" (click)="paymentAmount = selectedInvoice.balanceDue!">Full Amount</button>
            <button type="button" class="quick-btn" (click)="paymentAmount = selectedInvoice.balanceDue! / 2">Half</button>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closePaymentModal()">Cancel</button>
            <button type="submit" class="btn btn-success" [disabled]="processing">
              {{ processing ? 'Processing...' : 'Record Payment' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .filters { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }

    .filter-btn {
      padding: 8px 16px; border: 1px solid var(--border-color);
      background: white; border-radius: 20px;
      font-size: 13px; cursor: pointer; transition: all 0.2s;
      &:hover { border-color: var(--primary-color); }
      &.active { background: var(--primary-color); color: white; border-color: var(--primary-color); }
    }

    .loading-container { display: flex; justify-content: center; padding: 60px; }

    .paid { color: var(--success-color); font-weight: 500; }
    .balance { font-weight: 600; &.overdue { color: var(--error-color); } }

    .action-btns { display: flex; gap: 8px; }

    .icon-btn {
      width: 36px; height: 36px; border: none;
      background: var(--background-color);
      border-radius: var(--radius-sm);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      .material-icons { font-size: 18px; color: var(--text-secondary); }
      &:hover { background: var(--primary-color); .material-icons { color: white; } }
      &.success:hover { background: var(--success-color); }
    }

    .empty-state {
      text-align: center; padding: 60px; color: var(--text-secondary);
      .material-icons { font-size: 64px; margin-bottom: 16px; opacity: 0.3; }
    }

    .pagination {
      display: flex; align-items: center; justify-content: center; gap: 16px;
      padding: 20px; border-top: 1px solid var(--border-color);
      .page-info { color: var(--text-secondary); }
    }

    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }

    .modal {
      background: white; border-radius: var(--radius-lg);
      width: 100%; max-width: 400px;
      overflow-y: auto; box-shadow: var(--shadow-lg);
    }

    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid var(--border-color);
      h2 { font-size: 20px; font-weight: 600; }
      .close-btn { width: 36px; height: 36px; border: none; background: none; cursor: pointer; }
    }

    .modal-body { padding: 24px; }

    .payment-info {
      background: var(--background-color);
      padding: 16px; border-radius: var(--radius-sm);
      margin-bottom: 20px;
      p { margin-bottom: 8px; &:last-child { margin-bottom: 0; } }
    }

    .quick-amounts { display: flex; gap: 12px; margin-bottom: 20px; }

    .quick-btn {
      flex: 1; padding: 10px;
      border: 1px solid var(--border-color);
      background: white; border-radius: var(--radius-sm);
      cursor: pointer; transition: all 0.2s;
      &:hover { border-color: var(--primary-color); background: rgba(25, 118, 210, 0.05); }
    }

    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding-top: 20px; border-top: 1px solid var(--border-color); }

    .btn-success { background: var(--success-color); color: white; border: none; padding: 10px 20px; border-radius: var(--radius-sm); cursor: pointer; font-weight: 500; &:hover { background: darken(#10b981, 10%); } }
  `]
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  loading = true;
  selectedStatus = '';
  currentPage = 0;
  totalPages = 0;
  showPaymentModal = false;
  selectedInvoice: Invoice | null = null;
  paymentAmount = 0;
  processing = false;

  statusFilters = [
    { value: '', label: 'All' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SENT', label: 'Sent' },
    { value: 'PAID', label: 'Paid' },
    { value: 'PARTIALLY_PAID', label: 'Partial' }
  ];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void { this.loadInvoices(); }

  loadInvoices(): void {
    this.loading = true;
    this.apiService.getInvoices(this.currentPage, 10, this.selectedStatus || undefined).subscribe({
      next: (page) => { this.invoices = page.content; this.totalPages = page.totalPages; this.loading = false; },
      error: () => this.loading = false
    });
  }

  filterByStatus(status: string): void { this.selectedStatus = status; this.currentPage = 0; this.loadInvoices(); }
  goToPage(page: number): void { this.currentPage = page; this.loadInvoices(); }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'DRAFT': 'badge-pending', 'SENT': 'badge-in-progress',
      'PAID': 'badge-completed', 'PARTIALLY_PAID': 'badge-in-progress',
      'OVERDUE': 'badge-cancelled', 'CANCELLED': 'badge-cancelled'
    };
    return classes[status] || '';
  }

  formatStatus(status: string): string { return status.replace(/_/g, ' '); }

  sendInvoice(invoice: Invoice): void {
    this.apiService.sendInvoice(invoice.id!).subscribe({ next: () => this.loadInvoices() });
  }

  openPaymentModal(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.paymentAmount = invoice.balanceDue!;
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedInvoice = null;
    this.paymentAmount = 0;
  }

  recordPayment(): void {
    if (!this.selectedInvoice) return;
    this.processing = true;
    this.apiService.recordPayment(this.selectedInvoice.id!, this.paymentAmount).subscribe({
      next: () => { this.processing = false; this.closePaymentModal(); this.loadInvoices(); },
      error: () => this.processing = false
    });
  }
}
