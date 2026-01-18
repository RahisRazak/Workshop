import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { WorkOrder, Vehicle, ServiceItem, Page, WorkOrderStatus } from '@shared/models/domain.model';

@Component({
    selector: 'app-work-orders',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h1>Work Orders</h1>
        <button class="btn btn-primary" (click)="openModal()">
          <span class="material-icons">add</span>
          New Work Order
        </button>
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
              <th>Order #</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Scheduled</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of workOrders">
              <td><strong>{{ order.orderNumber }}</strong></td>
              <td>{{ order.customerName }}</td>
              <td>{{ order.vehicleInfo }}</td>
              <td>
                <span class="badge" [ngClass]="getStatusClass(order.status!)">
                  {{ formatStatus(order.status!) }}
                </span>
              </td>
              <td>{{ order.scheduledDate | date:'short' }}</td>
              <td>\${{ order.totalCost | number:'1.2-2' }}</td>
              <td>
                <div class="action-btns">
                  <select 
                    class="status-select" 
                    [ngModel]="order.status" 
                    (change)="updateStatus(order, $event)"
                    [disabled]="order.status === 'COMPLETED' || order.status === 'CANCELLED'">
                    <option *ngFor="let s of allStatuses" [value]="s">{{ formatStatus(s) }}</option>
                  </select>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty-state" *ngIf="!workOrders.length">
          <span class="material-icons">assignment</span>
          <p>No work orders found</p>
        </div>

        <div class="pagination" *ngIf="totalPages > 1">
          <button class="btn btn-secondary" [disabled]="currentPage === 0" (click)="goToPage(currentPage - 1)">Previous</button>
          <span class="page-info">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
          <button class="btn btn-secondary" [disabled]="currentPage >= totalPages - 1" (click)="goToPage(currentPage + 1)">Next</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>New Work Order</h2>
          <button class="close-btn" (click)="closeModal()"><span class="material-icons">close</span></button>
        </div>
        
        <form class="modal-body" (ngSubmit)="createWorkOrder()">
          <div class="form-group">
            <label>Vehicle *</label>
            <select [(ngModel)]="formData.vehicleId" name="vehicleId" required>
              <option [ngValue]="0">Select a vehicle</option>
              <option *ngFor="let v of vehiclesList" [ngValue]="v.id">
                {{ v.year }} {{ v.make }} {{ v.model }} - {{ v.customerName }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="formData.description" name="description" rows="2" placeholder="Brief description of work needed"></textarea>
          </div>

          <div class="form-group">
            <label>Customer Concerns</label>
            <textarea [(ngModel)]="formData.customerConcerns" name="customerConcerns" rows="2" placeholder="What issues is the customer experiencing?"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Scheduled Date</label>
              <input type="datetime-local" [(ngModel)]="formData.scheduledDate" name="scheduledDate">
            </div>
            <div class="form-group">
              <label>Estimated Time (minutes)</label>
              <input type="number" [(ngModel)]="formData.estimatedMinutes" name="estimatedMinutes" min="0">
            </div>
          </div>

          <div class="form-group">
            <label>Services</label>
            <div class="services-list">
              <label *ngFor="let service of servicesList" class="service-item">
                <input type="checkbox" [checked]="isServiceSelected(service)" (change)="toggleService(service)">
                <span class="service-name">{{ service.name }}</span>
                <span class="service-price">\${{ service.basePrice | number:'1.2-2' }}</span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Creating...' : 'Create Work Order' }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
    styles: [`
    .filters {
      display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap;
    }

    .filter-btn {
      padding: 8px 16px; border: 1px solid var(--border-color);
      background: white; border-radius: 20px;
      font-size: 13px; cursor: pointer; transition: all 0.2s;

      &:hover { border-color: var(--primary-color); }
      &.active { background: var(--primary-color); color: white; border-color: var(--primary-color); }
    }

    .loading-container { display: flex; justify-content: center; padding: 60px; }

    .status-select {
      padding: 6px 10px; border: 1px solid var(--border-color);
      border-radius: var(--radius-sm); font-size: 13px;
      background: white; cursor: pointer;
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .action-btns { display: flex; gap: 8px; }

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
      width: 100%; max-width: 600px; max-height: 90vh;
      overflow-y: auto; box-shadow: var(--shadow-lg);
    }

    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid var(--border-color);
      h2 { font-size: 20px; font-weight: 600; }
      .close-btn { width: 36px; height: 36px; border: none; background: none; cursor: pointer; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; &:hover { background: var(--background-color); } }
    }

    .modal-body { padding: 24px; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; }

    .services-list {
      max-height: 200px; overflow-y: auto;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm); padding: 8px;
    }

    .service-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px; cursor: pointer;
      border-radius: var(--radius-sm);
      &:hover { background: var(--background-color); }
      .service-name { flex: 1; }
      .service-price { color: var(--text-secondary); font-size: 13px; }
    }

    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding-top: 20px; border-top: 1px solid var(--border-color); margin-top: 20px; }
  `]
})
export class WorkOrdersComponent implements OnInit {
    workOrders: WorkOrder[] = [];
    vehiclesList: Vehicle[] = [];
    servicesList: ServiceItem[] = [];
    loading = true;
    selectedStatus = '';
    currentPage = 0;
    totalPages = 0;
    showModal = false;
    saving = false;
    selectedServices: ServiceItem[] = [];

    statusFilters = [
        { value: '', label: 'All' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'COMPLETED', label: 'Completed' }
    ];

    allStatuses = ['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'WAITING_FOR_PARTS', 'COMPLETED', 'CANCELLED'];

    formData: WorkOrder = { vehicleId: 0 };

    constructor(private apiService: ApiService) { }

    ngOnInit(): void {
        this.loadWorkOrders();
        this.loadVehicles();
        this.loadServices();
    }

    loadWorkOrders(): void {
        this.loading = true;
        this.apiService.getWorkOrders(this.currentPage, 10, this.selectedStatus || undefined).subscribe({
            next: (page) => { this.workOrders = page.content; this.totalPages = page.totalPages; this.loading = false; },
            error: () => this.loading = false
        });
    }

    loadVehicles(): void {
        this.apiService.getVehicles(0, 100).subscribe({ next: (page) => this.vehiclesList = page.content });
    }

    loadServices(): void {
        this.apiService.getServices().subscribe({ next: (services) => this.servicesList = services });
    }

    filterByStatus(status: string): void { this.selectedStatus = status; this.currentPage = 0; this.loadWorkOrders(); }
    goToPage(page: number): void { this.currentPage = page; this.loadWorkOrders(); }

    getStatusClass(status: string): string {
        const classes: Record<string, string> = {
            'PENDING': 'badge-pending', 'SCHEDULED': 'badge-pending',
            'IN_PROGRESS': 'badge-in-progress', 'WAITING_FOR_PARTS': 'badge-pending',
            'COMPLETED': 'badge-completed', 'CANCELLED': 'badge-cancelled'
        };
        return classes[status] || '';
    }

    formatStatus(status: string): string { return status.replace(/_/g, ' '); }

    updateStatus(order: WorkOrder, event: Event): void {
        const newStatus = (event.target as HTMLSelectElement).value;
        this.apiService.updateWorkOrderStatus(order.id!, newStatus).subscribe({
            next: () => this.loadWorkOrders()
        });
    }

    openModal(): void { this.formData = { vehicleId: 0 }; this.selectedServices = []; this.showModal = true; }
    closeModal(): void { this.showModal = false; this.formData = { vehicleId: 0 }; this.selectedServices = []; }

    isServiceSelected(service: ServiceItem): boolean { return this.selectedServices.some(s => s.id === service.id); }

    toggleService(service: ServiceItem): void {
        if (this.isServiceSelected(service)) {
            this.selectedServices = this.selectedServices.filter(s => s.id !== service.id);
        } else {
            this.selectedServices.push(service);
        }
    }

    createWorkOrder(): void {
        this.saving = true;
        this.formData.services = this.selectedServices.map(s => ({
            serviceItemId: s.id!,
            price: s.basePrice,
            quantity: 1
        }));

        this.apiService.createWorkOrder(this.formData).subscribe({
            next: () => { this.saving = false; this.closeModal(); this.loadWorkOrders(); },
            error: () => this.saving = false
        });
    }
}
