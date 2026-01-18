import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="login-page">
      <div class="login-container">
        <div class="login-header">
          <div class="brand">
            <span class="material-icons">build</span>
            <h1>Workshop Management</h1>
          </div>
          <p>Sign in to your account</p>
        </div>

        <form class="login-form" (ngSubmit)="login()">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              [(ngModel)]="credentials.username" 
              name="username"
              placeholder="Enter your username"
              required>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              [(ngModel)]="credentials.password" 
              name="password"
              placeholder="Enter your password"
              required>
          </div>

          <div class="error-message" *ngIf="error">
            <span class="material-icons">error</span>
            {{ error }}
          </div>

          <button type="submit" class="btn-login" [disabled]="loading">
            <span class="spinner" *ngIf="loading"></span>
            <span *ngIf="!loading">Sign In</span>
          </button>
        </form>

        <div class="demo-credentials">
          <h4>Demo Credentials</h4>
          <div class="credential-list">
            <div class="credential" (click)="fillCredentials('admin', 'admin123')">
              <strong>Admin:</strong> admin / admin123
            </div>
            <div class="credential" (click)="fillCredentials('mechanic', 'mechanic123')">
              <strong>Mechanic:</strong> mechanic / mechanic123
            </div>
            <div class="credential" (click)="fillCredentials('receptionist', 'receptionist123')">
              <strong>Receptionist:</strong> receptionist / receptionist123
            </div>
          </div>
        </div>
      </div>

      <div class="login-illustration">
        <div class="illustration-content">
          <span class="material-icons hero-icon">engineering</span>
          <h2>Streamline Your Workshop</h2>
          <p>Manage customers, vehicles, work orders, and invoices all in one place.</p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
    }

    .login-container {
      flex: 1;
      max-width: 480px;
      padding: 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: white;
    }

    .login-header {
      margin-bottom: 40px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .material-icons {
        font-size: 40px;
        color: var(--primary-color);
      }

      h1 {
        font-size: 24px;
        font-weight: 700;
        color: var(--text-primary);
      }
    }

    .login-header p {
      color: var(--text-secondary);
      font-size: 16px;
    }

    .login-form {
      margin-bottom: 32px;
    }

    .btn-login {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(25, 118, 210, 0.4);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .spinner {
        width: 20px;
        height: 20px;
        border-width: 2px;
      }
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #fee2e2;
      color: #991b1b;
      border-radius: var(--radius-sm);
      margin-bottom: 20px;
      font-size: 14px;

      .material-icons {
        font-size: 20px;
      }
    }

    .demo-credentials {
      padding: 20px;
      background: var(--background-color);
      border-radius: var(--radius-md);

      h4 {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 12px;
      }
    }

    .credential {
      padding: 10px 14px;
      background: white;
      border-radius: var(--radius-sm);
      margin-bottom: 8px;
      font-size: 13px;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid var(--border-color);

      &:hover {
        border-color: var(--primary-color);
        background: rgba(25, 118, 210, 0.05);
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    .login-illustration {
      flex: 1;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
    }

    .illustration-content {
      text-align: center;
      color: white;

      .hero-icon {
        font-size: 120px;
        color: var(--primary-light);
        margin-bottom: 32px;
      }

      h2 {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 16px;
      }

      p {
        font-size: 18px;
        color: rgba(255, 255, 255, 0.7);
        max-width: 400px;
      }
    }

    @media (max-width: 768px) {
      .login-illustration {
        display: none;
      }

      .login-container {
        max-width: 100%;
        padding: 40px 24px;
      }
    }
  `]
})
export class LoginComponent {
    credentials = {
        username: '',
        password: ''
    };
    loading = false;
    error = '';

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    fillCredentials(username: string, password: string): void {
        this.credentials.username = username;
        this.credentials.password = password;
    }

    login(): void {
        this.loading = true;
        this.error = '';

        this.authService.login(this.credentials).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.loading = false;
                this.error = 'Invalid username or password';
            }
        });
    }
}
