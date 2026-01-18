import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container" [class.with-sidebar]="authService.isLoggedIn()">
      <!-- Mobile Header -->
      <header class="mobile-header" *ngIf="authService.isLoggedIn()">
        <button class="menu-toggle" (click)="toggleSidebar()">
          <span class="material-icons">{{ sidebarOpen ? 'close' : 'menu' }}</span>
        </button>
        <div class="mobile-logo">
          <span class="material-icons">build</span>
          <span>Workshop</span>
        </div>
        <div class="spacer"></div>
      </header>

      <!-- Sidebar Overlay -->
      <div class="sidebar-overlay" 
           *ngIf="authService.isLoggedIn() && sidebarOpen" 
           (click)="closeSidebar()"></div>

      <!-- Sidebar Navigation -->
      <aside class="sidebar" 
             *ngIf="authService.isLoggedIn()" 
             [class.open]="sidebarOpen">
        <div class="sidebar-header">
          <div class="logo">
            <span class="material-icons">build</span>
            <span class="logo-text">Workshop</span>
          </div>
          <button class="close-sidebar" (click)="closeSidebar()">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="material-icons">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a routerLink="/customers" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="material-icons">people</span>
            <span>Customers</span>
          </a>
          <a routerLink="/vehicles" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="material-icons">directions_car</span>
            <span>Vehicles</span>
          </a>
          <a routerLink="/work-orders" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="material-icons">assignment</span>
            <span>Work Orders</span>
          </a>
          <a routerLink="/invoices" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="material-icons">receipt_long</span>
            <span>Invoices</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">
              {{ authService.getCurrentUser()?.fullName?.charAt(0) || 'U' }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ authService.getCurrentUser()?.fullName }}</span>
              <span class="user-role">{{ authService.getCurrentUser()?.role }}</span>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">
            <span class="material-icons">logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    // Mobile Header
    .mobile-header {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--header-height);
      background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
      padding: 0 16px;
      align-items: center;
      z-index: 101;
      gap: 12px;

      .menu-toggle {
        width: 44px;
        height: 44px;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-sm);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .mobile-logo {
        display: flex;
        align-items: center;
        gap: 8px;
        color: white;
        font-weight: 600;

        .material-icons {
          color: var(--primary-light);
        }
      }

      .spacer {
        flex: 1;
      }
    }

    // Sidebar Overlay
    .sidebar-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99;
    }

    .sidebar {
      width: var(--sidebar-width);
      background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: 100;
    }

    .close-sidebar {
      display: none;
      width: 36px;
      height: 36px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-sm);
      color: white;
      cursor: pointer;
      align-items: center;
      justify-content: center;
    }

    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;

      .material-icons {
        font-size: 32px;
        color: var(--primary-light);
      }

      .logo-text {
        font-size: 20px;
        font-weight: 700;
        letter-spacing: -0.5px;
      }
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      border-radius: var(--radius-sm);
      margin-bottom: 4px;
      transition: all 0.2s;

      .material-icons {
        font-size: 22px;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: white;
      }

      &.active {
        background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
        color: white;
        box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
      }
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 16px;
      flex-shrink: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .user-name {
      color: white;
      font-weight: 500;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
      text-transform: capitalize;
    }

    .logout-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-sm);
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;

      &:hover {
        background: var(--error-color);
        color: white;
      }
    }

    .main-content {
      flex: 1;
      min-height: 100vh;
      background: var(--background-color);
    }

    .with-sidebar .main-content {
      margin-left: var(--sidebar-width);
    }

    // ==================
    // RESPONSIVE STYLES
    // ==================
    @media (max-width: 768px) {
      .app-container {
        flex-direction: column;
      }

      .mobile-header {
        display: flex;
      }

      .sidebar-overlay {
        display: block;
      }

      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        width: 280px;

        &.open {
          transform: translateX(0);
        }
      }

      .close-sidebar {
        display: flex;
      }

      .with-sidebar .main-content {
        margin-left: 0;
        padding-top: var(--header-height);
      }
    }

    @media (max-width: 480px) {
      .sidebar {
        width: 100%;
      }
    }
  `]
})
export class AppComponent {
  sidebarOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeSidebar();
    this.router.navigate(['/login']);
  }
}
