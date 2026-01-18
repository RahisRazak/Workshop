import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ApiService } from '@core/services/api.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { Dashboard, WorkOrderStatus } from '@shared/models/domain.model';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let apiServiceSpy: jasmine.SpyObj<ApiService>;

    const mockDashboard: Dashboard = {
        totalCustomers: 25,
        totalVehicles: 40,
        pendingWorkOrders: 8,
        inProgressWorkOrders: 5,
        completedWorkOrdersToday: 3,
        pendingInvoices: 6,
        monthlyRevenue: 15000.50,
        outstandingBalance: 3500.00,
        recentWorkOrders: [
            {
                id: 1,
                orderNumber: 'WO-001',
                customerName: 'John Doe',
                vehicleInfo: '2022 Toyota Camry',
                status: WorkOrderStatus.PENDING,
                createdAt: '2024-01-15',
                vehicleId: 1
            }
        ],
        upcomingAppointments: []
    };

    beforeEach(async () => {
        apiServiceSpy = jasmine.createSpyObj('ApiService', ['getDashboard']);

        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: [
                provideRouter([]),
                { provide: ApiService, useValue: apiServiceSpy }
            ]
        }).compileComponents();
    });

    describe('on successful load', () => {
        beforeEach(() => {
            apiServiceSpy.getDashboard.and.returnValue(of(mockDashboard));
            fixture = TestBed.createComponent(DashboardComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should load dashboard data on init', () => {
            expect(apiServiceSpy.getDashboard).toHaveBeenCalled();
            expect(component.dashboard).toBeTruthy();
            expect(component.loading).toBe(false);
        });

        it('should display stat cards', () => {
            const statCards = fixture.debugElement.queryAll(By.css('.stat-card'));
            expect(statCards.length).toBe(6);
        });

        it('should display correct customer count', () => {
            const customerCard = fixture.debugElement.query(By.css('.stat-card.customers .stat-content h3'));
            expect(customerCard.nativeElement.textContent).toContain('25');
        });

        it('should display recent work orders', () => {
            const tableRows = fixture.debugElement.queryAll(By.css('.data-table tbody tr'));
            expect(tableRows.length).toBe(1);
        });

        it('should display quick action buttons', () => {
            const actionBtns = fixture.debugElement.queryAll(By.css('.action-btn'));
            expect(actionBtns.length).toBe(4);
        });
    });

    describe('on error', () => {
        beforeEach(() => {
            apiServiceSpy.getDashboard.and.returnValue(throwError(() => new Error('API Error')));
            fixture = TestBed.createComponent(DashboardComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should stop loading on error', () => {
            expect(component.loading).toBe(false);
        });
    });

    describe('helper methods', () => {
        beforeEach(() => {
            apiServiceSpy.getDashboard.and.returnValue(of(mockDashboard));
            fixture = TestBed.createComponent(DashboardComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should return correct status class', () => {
            expect(component.getStatusClass('PENDING')).toBe('badge-pending');
            expect(component.getStatusClass('IN_PROGRESS')).toBe('badge-in-progress');
            expect(component.getStatusClass('COMPLETED')).toBe('badge-completed');
            expect(component.getStatusClass('CANCELLED')).toBe('badge-cancelled');
        });

        it('should format status correctly', () => {
            expect(component.formatStatus('IN_PROGRESS')).toBe('IN PROGRESS');
            expect(component.formatStatus('WAITING_FOR_PARTS')).toBe('WAITING FOR PARTS');
        });
    });

    describe('loading state', () => {
        it('should show spinner while loading', () => {
            apiServiceSpy.getDashboard.and.returnValue(of(mockDashboard));
            fixture = TestBed.createComponent(DashboardComponent);
            component = fixture.componentInstance;

            expect(component.loading).toBe(true);
        });
    });
});
