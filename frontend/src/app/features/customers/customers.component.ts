import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '@core/services/api.service';
import { Customer } from '@shared/models/domain.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h1>Customers</h1>
        <button mat-raised-button color="primary" (click)="openModal()">
          <mat-icon>add</mat-icon>
          Add Customer
        </button>
      </div>

      <!-- Search -->
      <mat-card class="search-card">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search customers</mat-label>
          <input matInput [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Search by name, email, or phone...">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
      </mat-card>

      <!-- Loading -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <!-- Customer Table -->
      <mat-card *ngIf="!loading" class="table-card">
        <table mat-table [dataSource]="dataSource" class="mat-elevation-z0">
          
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let customer">
              <strong>{{ customer.firstName }} {{ customer.lastName }}</strong>
            </td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let customer">{{ customer.email || '-' }}</td>
          </ng-container>

          <!-- Phone Column -->
          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>Phone</th>
            <td mat-cell *matCellDef="let customer">{{ customer.phone }}</td>
          </ng-container>

          <!-- City Column -->
          <ng-container matColumnDef="city">
            <th mat-header-cell *matHeaderCellDef>City</th>
            <td mat-cell *matCellDef="let customer">{{ customer.city || '-' }}</td>
          </ng-container>

          <!-- Vehicles Column -->
          <ng-container matColumnDef="vehicles">
            <th mat-header-cell *matHeaderCellDef>Vehicles</th>
            <td mat-cell *matCellDef="let customer">
              <mat-chip-set>
                <mat-chip highlighted>{{ customer.vehicleCount }}</mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let customer">
              <button mat-icon-button matTooltip="Edit" (click)="editCustomer(customer)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" matTooltip="Delete" (click)="deleteCustomer(customer)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div class="empty-state" *ngIf="!customers.length">
          <mat-icon>people_outline</mat-icon>
          <p>No customers found</p>
        </div>

        <mat-paginator 
          [length]="totalElements"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <mat-card class="modal-card" (click)="$event.stopPropagation()">
        <mat-card-header>
          <mat-card-title>{{ editingCustomer ? 'Edit Customer' : 'Add Customer' }}</mat-card-title>
          <button mat-icon-button class="close-btn" (click)="closeModal()">
            <mat-icon>close</mat-icon>
          </button>
        </mat-card-header>
        
        <mat-card-content>
          <form (ngSubmit)="saveCustomer()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>First Name</mat-label>
                <input matInput [(ngModel)]="formData.firstName" name="firstName" required>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Last Name</mat-label>
                <input matInput [(ngModel)]="formData.lastName" name="lastName" required>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" [(ngModel)]="formData.email" name="email">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput type="tel" [(ngModel)]="formData.phone" name="phone" required>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Address</mat-label>
              <input matInput [(ngModel)]="formData.address" name="address">
            </mat-form-field>

            <div class="form-row three-cols">
              <mat-form-field appearance="outline">
                <mat-label>City</mat-label>
                <input matInput [(ngModel)]="formData.city" name="city">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>State</mat-label>
                <input matInput [(ngModel)]="formData.state" name="state">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Zip Code</mat-label>
                <input matInput [(ngModel)]="formData.zipCode" name="zipCode">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes</mat-label>
              <textarea matInput [(ngModel)]="formData.notes" name="notes" rows="3"></textarea>
            </mat-form-field>

            <div class="modal-actions">
              <button mat-button type="button" (click)="closeModal()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="saving">
                <mat-spinner *ngIf="saving" diameter="20"></mat-spinner>
                <span *ngIf="!saving">{{ editingCustomer ? 'Update' : 'Save' }}</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .search-card {
      margin-bottom: 24px;
      padding: 16px;
    }

    .search-field {
      width: 100%;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 60px;
    }

    .table-card {
      overflow: hidden;
    }

    table {
      width: 100%;
    }

    .mat-column-actions {
      width: 120px;
      text-align: center;
    }

    .mat-column-vehicles {
      width: 100px;
    }

    .empty-state {
      text-align: center;
      padding: 60px;
      color: rgba(0, 0, 0, 0.54);

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        opacity: 0.3;
      }
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-card {
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-card mat-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    .modal-card mat-card-content {
      padding: 24px;
    }

    .close-btn {
      position: absolute;
      right: 8px;
      top: 8px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 8px;
    }

    .three-cols {
      grid-template-columns: repeat(3, 1fr);
    }

    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      margin-top: 16px;
    }

    mat-form-field {
      width: 100%;
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .three-cols {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CustomersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['name', 'email', 'phone', 'city', 'vehicles', 'actions'];
  dataSource = new MatTableDataSource<Customer>([]);
  customers: Customer[] = [];
  loading = true;
  searchTerm = '';
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  showModal = false;
  editingCustomer: Customer | null = null;
  saving = false;
  searchTimeout: any;

  formData: Customer = this.getEmptyForm();

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.apiService.getCustomers(this.currentPage, this.pageSize, this.searchTerm || undefined).subscribe({
      next: (page) => {
        this.customers = page.content;
        this.dataSource.data = page.content;
        this.totalElements = page.totalElements;
        this.totalPages = page.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load customers', 'Close', { duration: 3000 });
      }
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 0;
      this.loadCustomers();
    }, 300);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCustomers();
  }

  getEmptyForm(): Customer {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      notes: ''
    };
  }

  openModal(): void {
    this.formData = this.getEmptyForm();
    this.editingCustomer = null;
    this.showModal = true;
  }

  editCustomer(customer: Customer): void {
    this.editingCustomer = customer;
    this.formData = { ...customer };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCustomer = null;
    this.formData = this.getEmptyForm();
  }

  saveCustomer(): void {
    this.saving = true;
    const operation = this.editingCustomer
      ? this.apiService.updateCustomer(this.editingCustomer.id!, this.formData)
      : this.apiService.createCustomer(this.formData);

    operation.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadCustomers();
        this.snackBar.open(
          this.editingCustomer ? 'Customer updated successfully' : 'Customer created successfully',
          'Close',
          { duration: 3000 }
        );
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Failed to save customer', 'Close', { duration: 3000 });
      }
    });
  }

  deleteCustomer(customer: Customer): void {
    if (confirm(`Delete ${customer.firstName} ${customer.lastName}?`)) {
      this.apiService.deleteCustomer(customer.id!).subscribe({
        next: () => {
          this.loadCustomers();
          this.snackBar.open('Customer deleted successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Failed to delete customer', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
