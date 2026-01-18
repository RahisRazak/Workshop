import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: 'customers',
        canActivate: [authGuard],
        loadComponent: () => import('./features/customers/customers.component').then(m => m.CustomersComponent)
    },
    {
        path: 'vehicles',
        canActivate: [authGuard],
        loadComponent: () => import('./features/vehicles/vehicles.component').then(m => m.VehiclesComponent)
    },
    {
        path: 'work-orders',
        canActivate: [authGuard],
        loadComponent: () => import('./features/work-orders/work-orders.component').then(m => m.WorkOrdersComponent)
    },
    {
        path: 'invoices',
        canActivate: [authGuard],
        loadComponent: () => import('./features/invoices/invoices.component').then(m => m.InvoicesComponent)
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
