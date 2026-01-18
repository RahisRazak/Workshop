import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Dashboard, WorkOrder } from '@shared/models/domain.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p class="subtitle">Welcome back! Here's what's happening today.</p>
      </div>

      <div class="loading-container" *ngIf="loading">
        <div class="spinner"></div>
      </div>

      <div *ngIf="!loading && dashboard">
        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card customers">
            <div class="stat-icon">
              <span class="material-icons">people</span>
            </div>
            <div class="stat-content">
              <h3>{{ dashboard.totalCustomers }}</h3>
              <p>Total Customers</p>
            </div>
          </div>

          <div class="stat-card vehicles">
            <div class="stat-icon">
              <span class="material-icons">directions_car</span>
            </div>
            <div class="stat-content">
              <h3>{{ dashboard.totalVehicles }}</h3>
              <p>Registered Vehicles</p>
            </div>
          </div>

          <div class="stat-card pending">
            <div class="stat-icon">
              <span class="material-icons">pending_actions</span>
            </div>
            <div class="stat-content">
              <h3>{{ dashboard.pendingWorkOrders }}</h3>
              <p>Pending Work Orders</p>
            </div>
          </div>

          <div class="stat-card in-progress">
            <div class="stat-icon">
              <span class="material-icons">engineering</span>
            </div>
            <div class="stat-content">
              <h3>{{ dashboard.inProgressWorkOrders }}</h3>
              <p>In Progress</p>
            </div>
          </div>

          <div class="stat-card revenue">
            <div class="stat-icon">
              <span class="material-icons">payments</span>
            </div>
            <div class="stat-content">
              <h3>\${{ dashboard.monthlyRevenue | number:'1.2-2' }}</h3>
              <p>Monthly Revenue</p>
            </div>
          </div>

          <div class="stat-card outstanding">
            <div class="stat-icon">
              <span class="material-icons">account_balance_wallet</span>
            </div>
            <div class="stat-content">
              <h3>\${{ dashboard.outstandingBalance | number:'1.2-2' }}</h3>
              <p>Outstanding Balance</p>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="activity-section">
          <div class="card recent-orders">
            <div class="card-header">
              <h3>Recent Work Orders</h3>
              <a routerLink="/work-orders" class="view-all">View All →</a>
            </div>
            
            <div class="empty-state" *ngIf="!dashboard.recentWorkOrders?.length">
              <span class="material-icons">inbox</span>
              <p>No recent work orders</p>
            </div>

            <table class="data-table" *ngIf="dashboard.recentWorkOrders?.length">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of dashboard.recentWorkOrders">
                  <td><strong>{{ order.orderNumber }}</strong></td>
                  <td>{{ order.customerName }}</td>
                  <td>{{ order.vehicleInfo }}</td>
                  <td>
                    <span class="badge" [ngClass]="getStatusClass(order.status!)">
                      {{ formatStatus(order.status!) }}
                    </span>
                  </td>
                  <td>{{ order.createdAt | date:'short' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="card quick-actions">
            <div class="card-header">
              <h3>Quick Actions</h3>
            </div>
            
            <div class="action-buttons">
              <a routerLink="/customers" class="action-btn">
                <span class="material-icons">person_add</span>
                <span>Add Customer</span>
              </a>
              <a routerLink="/vehicles" class="action-btn">
                <span class="material-icons">directions_car</span>
                <span>Add Vehicle</span>
              </a>
              <a routerLink="/work-orders" class="action-btn">
                <span class="material-icons">add_task</span>
                <span>New Work Order</span>
              </a>
              <a routerLink="/invoices" class="action-btn">
                <span class="material-icons">receipt</span>
                <span>View Invoices</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .subtitle {
      color: var(--text-secondary);
      margin-top: 8px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 60px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      border-radius: var(--radius-md);
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
      }

      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;

        .material-icons {
          font-size: 28px;
          color: white;
        }
      }

      .stat-content {
        h3 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: 4px;
        }

        p {
          color: var(--text-secondary);
          font-size: 13px;
        }
      }

      &.customers .stat-icon { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
      &.vehicles .stat-icon { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
      &.pending .stat-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
      &.in-progress .stat-icon { background: linear-gradient(135deg, #10b981, #059669); }
      &.revenue .stat-icon { background: linear-gradient(135deg, #ec4899, #db2777); }
      &.outstanding .stat-icon { background: linear-gradient(135deg, #6366f1, #4f46e5); }
    }

    .activity-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .recent-orders {
      .view-all {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 500;
        font-size: 14px;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);

      .material-icons {
        font-size: 48px;
        margin-bottom: 12px;
        opacity: 0.5;
      }
    }

    .quick-actions {
      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .action-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: var(--background-color);
        border-radius: var(--radius-sm);
        text-decoration: none;
        color: var(--text-primary);
        font-weight: 500;
        transition: all 0.2s;

        .material-icons {
          color: var(--primary-color);
        }

        &:hover {
          background: var(--primary-color);
          color: white;

          .material-icons {
            color: white;
          }
        }
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
    dashboard: Dashboard | null = null;
    loading = true;

    constructor(private apiService: ApiService) { }

    ngOnInit(): void {
        this.loadDashboard();
    }

    loadDashboard(): void {
        this.apiService.getDashboard().subscribe({
            next: (data) => {
                this.dashboard = data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    getStatusClass(status: string): string {
        const classes: Record<string, string> = {
            'PENDING': 'badge-pending',
            'SCHEDULED': 'badge-pending',
            'IN_PROGRESS': 'badge-in-progress',
            'WAITING_FOR_PARTS': 'badge-pending',
            'COMPLETED': 'badge-completed',
            'CANCELLED': 'badge-cancelled'
        };
        return classes[status] || '';
    }

    formatStatus(status: string): string {
        return status.replace(/_/g, ' ');
    }
}
