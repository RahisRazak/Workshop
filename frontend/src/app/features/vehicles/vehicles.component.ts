import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { Vehicle, Customer, Page } from '@shared/models/domain.model';

@Component({
    selector: 'app-vehicles',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h1>Vehicles</h1>
        <button class="btn btn-primary" (click)="openModal()">
          <span class="material-icons">add</span>
          Add Vehicle
        </button>
      </div>

      <div class="search-bar">
        <span class="material-icons">search</span>
        <input 
          type="text" 
          placeholder="Search by make, model, VIN, or license plate..." 
          [(ngModel)]="searchTerm"
          (input)="onSearch()">
      </div>

      <div class="loading-container" *ngIf="loading">
        <div class="spinner"></div>
      </div>

      <div class="card" *ngIf="!loading">
        <table class="data-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>License Plate</th>
              <th>VIN</th>
              <th>Owner</th>
              <th>Mileage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let vehicle of vehicles">
              <td>
                <div class="vehicle-info">
                  <strong>{{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}</strong>
                  <span class="color-tag" *ngIf="vehicle.color">{{ vehicle.color }}</span>
                </div>
              </td>
              <td>{{ vehicle.licensePlate || '-' }}</td>
              <td class="vin">{{ vehicle.vin || '-' }}</td>
              <td>{{ vehicle.customerName }}</td>
              <td>{{ vehicle.mileage | number }} mi</td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn" (click)="editVehicle(vehicle)" title="Edit">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="icon-btn danger" (click)="deleteVehicle(vehicle)" title="Delete">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty-state" *ngIf="!vehicles.length">
          <span class="material-icons">directions_car</span>
          <p>No vehicles found</p>
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
          <h2>{{ editingVehicle ? 'Edit Vehicle' : 'Add Vehicle' }}</h2>
          <button class="close-btn" (click)="closeModal()"><span class="material-icons">close</span></button>
        </div>
        
        <form class="modal-body" (ngSubmit)="saveVehicle()">
          <div class="form-group">
            <label>Customer *</label>
            <select [(ngModel)]="formData.customerId" name="customerId" required>
              <option [ngValue]="null">Select a customer</option>
              <option *ngFor="let c of customersList" [ngValue]="c.id">{{ c.firstName }} {{ c.lastName }}</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Make *</label>
              <input type="text" [(ngModel)]="formData.make" name="make" required placeholder="e.g. Toyota">
            </div>
            <div class="form-group">
              <label>Model *</label>
              <input type="text" [(ngModel)]="formData.model" name="model" required placeholder="e.g. Camry">
            </div>
            <div class="form-group">
              <label>Year *</label>
              <input type="number" [(ngModel)]="formData.year" name="year" required min="1900" max="2030">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>VIN</label>
              <input type="text" [(ngModel)]="formData.vin" name="vin" maxlength="17" placeholder="17 characters">
            </div>
            <div class="form-group">
              <label>License Plate</label>
              <input type="text" [(ngModel)]="formData.licensePlate" name="licensePlate">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Color</label>
              <input type="text" [(ngModel)]="formData.color" name="color">
            </div>
            <div class="form-group">
              <label>Mileage</label>
              <input type="number" [(ngModel)]="formData.mileage" name="mileage" min="0">
            </div>
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea [(ngModel)]="formData.notes" name="notes" rows="2"></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="saving">{{ saving ? 'Saving...' : 'Save Vehicle' }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
    styles: [`
    .search-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      background: white;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      margin-bottom: 24px;
      box-shadow: var(--shadow-sm);

      .material-icons { color: var(--text-secondary); }
      input { flex: 1; border: none; font-size: 14px; outline: none; }
    }

    .loading-container { display: flex; justify-content: center; padding: 60px; }

    .vehicle-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .color-tag {
      font-size: 11px;
      padding: 2px 8px;
      background: var(--background-color);
      border-radius: 10px;
      color: var(--text-secondary);
    }

    .vin { font-family: monospace; font-size: 12px; color: var(--text-secondary); }

    .action-btns { display: flex; gap: 8px; }

    .icon-btn {
      width: 36px; height: 36px; border: none;
      background: var(--background-color);
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;

      .material-icons { font-size: 18px; color: var(--text-secondary); }
      &:hover { background: var(--primary-color); .material-icons { color: white; } }
      &.danger:hover { background: var(--error-color); }
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
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding-top: 20px; border-top: 1px solid var(--border-color); margin-top: 20px; }
  `]
})
export class VehiclesComponent implements OnInit {
    vehicles: Vehicle[] = [];
    customersList: Customer[] = [];
    loading = true;
    searchTerm = '';
    currentPage = 0;
    totalPages = 0;
    showModal = false;
    editingVehicle: Vehicle | null = null;
    saving = false;
    searchTimeout: any;

    formData: Vehicle = this.getEmptyForm();

    constructor(private apiService: ApiService) { }

    ngOnInit(): void {
        this.loadVehicles();
        this.loadCustomers();
    }

    loadVehicles(): void {
        this.loading = true;
        this.apiService.getVehicles(this.currentPage, 10, this.searchTerm || undefined).subscribe({
            next: (page) => { this.vehicles = page.content; this.totalPages = page.totalPages; this.loading = false; },
            error: () => this.loading = false
        });
    }

    loadCustomers(): void {
        this.apiService.getCustomers(0, 100).subscribe({
            next: (page) => this.customersList = page.content
        });
    }

    onSearch(): void {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => { this.currentPage = 0; this.loadVehicles(); }, 300);
    }

    goToPage(page: number): void { this.currentPage = page; this.loadVehicles(); }

    getEmptyForm(): Vehicle {
        return { make: '', model: '', year: new Date().getFullYear(), customerId: 0 };
    }

    openModal(): void { this.formData = this.getEmptyForm(); this.showModal = true; }

    editVehicle(vehicle: Vehicle): void {
        this.editingVehicle = vehicle;
        this.formData = { ...vehicle };
        this.showModal = true;
    }

    closeModal(): void { this.showModal = false; this.editingVehicle = null; this.formData = this.getEmptyForm(); }

    saveVehicle(): void {
        this.saving = true;
        const operation = this.editingVehicle
            ? this.apiService.updateVehicle(this.editingVehicle.id!, this.formData)
            : this.apiService.createVehicle(this.formData);

        operation.subscribe({
            next: () => { this.saving = false; this.closeModal(); this.loadVehicles(); },
            error: () => this.saving = false
        });
    }

    deleteVehicle(vehicle: Vehicle): void {
        if (confirm(`Delete ${vehicle.year} ${vehicle.make} ${vehicle.model}?`)) {
            this.apiService.deleteVehicle(vehicle.id!).subscribe({ next: () => this.loadVehicles() });
        }
    }
}
