import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '@environments/environment';

describe('ApiService', () => {
    let service: ApiService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ApiService]
        });

        service = TestBed.inject(ApiService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Dashboard', () => {
        it('should fetch dashboard data', () => {
            const mockDashboard = {
                totalCustomers: 10,
                totalVehicles: 15,
                pendingWorkOrders: 5,
                inProgressWorkOrders: 3,
                completedWorkOrdersToday: 2,
                pendingInvoices: 4,
                monthlyRevenue: 5000,
                outstandingBalance: 1500,
                recentWorkOrders: [],
                upcomingAppointments: []
            };

            service.getDashboard().subscribe(data => {
                expect(data.totalCustomers).toBe(10);
                expect(data.monthlyRevenue).toBe(5000);
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/dashboard`);
            expect(req.request.method).toBe('GET');
            req.flush(mockDashboard);
        });
    });

    describe('Customers', () => {
        it('should fetch customers with pagination', () => {
            const mockPage = {
                content: [{ id: 1, firstName: 'John', lastName: 'Doe', phone: '555-1234' }],
                totalElements: 1,
                totalPages: 1,
                size: 10,
                number: 0,
                first: true,
                last: true
            };

            service.getCustomers(0, 10).subscribe(page => {
                expect(page.content.length).toBe(1);
                expect(page.content[0].firstName).toBe('John');
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/customers?page=0&size=10`);
            expect(req.request.method).toBe('GET');
            req.flush(mockPage);
        });

        it('should fetch customers with search', () => {
            const mockPage = { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0, first: true, last: true };

            service.getCustomers(0, 10, 'John').subscribe();

            const req = httpMock.expectOne(`${environment.apiUrl}/customers?page=0&size=10&search=John`);
            expect(req.request.method).toBe('GET');
            req.flush(mockPage);
        });

        it('should create a customer', () => {
            const newCustomer = { firstName: 'Jane', lastName: 'Doe', phone: '555-5678' };
            const createdCustomer = { id: 2, ...newCustomer };

            service.createCustomer(newCustomer).subscribe(customer => {
                expect(customer.id).toBe(2);
                expect(customer.firstName).toBe('Jane');
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/customers`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(newCustomer);
            req.flush(createdCustomer);
        });

        it('should update a customer', () => {
            const updatedCustomer = { id: 1, firstName: 'John', lastName: 'Smith', phone: '555-1234' };

            service.updateCustomer(1, updatedCustomer).subscribe(customer => {
                expect(customer.lastName).toBe('Smith');
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/customers/1`);
            expect(req.request.method).toBe('PUT');
            req.flush(updatedCustomer);
        });

        it('should delete a customer', () => {
            service.deleteCustomer(1).subscribe();

            const req = httpMock.expectOne(`${environment.apiUrl}/customers/1`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('Vehicles', () => {
        it('should fetch vehicles', () => {
            const mockPage = {
                content: [{ id: 1, make: 'Toyota', model: 'Camry', year: 2022, customerId: 1 }],
                totalElements: 1, totalPages: 1, size: 10, number: 0, first: true, last: true
            };

            service.getVehicles().subscribe(page => {
                expect(page.content[0].make).toBe('Toyota');
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/vehicles?page=0&size=10`);
            req.flush(mockPage);
        });

        it('should fetch vehicles by customer', () => {
            const mockVehicles = [{ id: 1, make: 'Honda', model: 'Civic', year: 2021, customerId: 1 }];

            service.getVehiclesByCustomer(1).subscribe(vehicles => {
                expect(vehicles.length).toBe(1);
                expect(vehicles[0].make).toBe('Honda');
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/vehicles/customer/1`);
            expect(req.request.method).toBe('GET');
            req.flush(mockVehicles);
        });
    });

    describe('Work Orders', () => {
        it('should fetch work orders with status filter', () => {
            const mockPage = {
                content: [{ id: 1, orderNumber: 'WO-001', status: 'PENDING', vehicleId: 1 }],
                totalElements: 1, totalPages: 1, size: 10, number: 0, first: true, last: true
            };

            service.getWorkOrders(0, 10, 'PENDING').subscribe(page => {
                expect(page.content[0].status as string).toBe('PENDING');
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/workorders?page=0&size=10&status=PENDING`);
            req.flush(mockPage);
        });

        it('should update work order status', () => {
            const mockWorkOrder = { id: 1, orderNumber: 'WO-001', status: 'IN_PROGRESS', vehicleId: 1 };

            service.updateWorkOrderStatus(1, 'IN_PROGRESS').subscribe(order => {
                expect(order.status as string).toBe('IN_PROGRESS');
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/workorders/1/status`);
            expect(req.request.method).toBe('PATCH');
            expect(req.request.body).toEqual({ status: 'IN_PROGRESS' });
            req.flush(mockWorkOrder);
        });
    });

    describe('Invoices', () => {
        it('should record payment', () => {
            const mockInvoice = { id: 1, invoiceNumber: 'INV-001', paidAmount: 100, status: 'PARTIALLY_PAID' };

            service.recordPayment(1, 100).subscribe(invoice => {
                expect(invoice.paidAmount).toBe(100);
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/invoices/1/payment`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ amount: 100 });
            req.flush(mockInvoice);
        });

        it('should create invoice from work order', () => {
            const mockInvoice = { id: 1, invoiceNumber: 'INV-001', workOrderId: 1 };

            service.createInvoice(1).subscribe(invoice => {
                expect(invoice.workOrderId).toBe(1);
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/invoices/workorder/1`);
            expect(req.request.method).toBe('POST');
            req.flush(mockInvoice);
        });
    });
});
