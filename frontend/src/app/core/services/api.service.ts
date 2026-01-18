import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Customer, Vehicle, ServiceItem, WorkOrder, Invoice, Dashboard, Page } from '@shared/models/domain.model';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Dashboard
    getDashboard(): Observable<Dashboard> {
        return this.http.get<Dashboard>(`${this.baseUrl}/dashboard`);
    }

    // Customers
    getCustomers(page = 0, size = 10, search?: string): Observable<Page<Customer>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (search) params = params.set('search', search);
        return this.http.get<Page<Customer>>(`${this.baseUrl}/customers`, { params });
    }

    getCustomer(id: number): Observable<Customer> {
        return this.http.get<Customer>(`${this.baseUrl}/customers/${id}`);
    }

    createCustomer(customer: Customer): Observable<Customer> {
        return this.http.post<Customer>(`${this.baseUrl}/customers`, customer);
    }

    updateCustomer(id: number, customer: Customer): Observable<Customer> {
        return this.http.put<Customer>(`${this.baseUrl}/customers/${id}`, customer);
    }

    deleteCustomer(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/customers/${id}`);
    }

    // Vehicles
    getVehicles(page = 0, size = 10, search?: string): Observable<Page<Vehicle>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (search) params = params.set('search', search);
        return this.http.get<Page<Vehicle>>(`${this.baseUrl}/vehicles`, { params });
    }

    getVehicle(id: number): Observable<Vehicle> {
        return this.http.get<Vehicle>(`${this.baseUrl}/vehicles/${id}`);
    }

    getVehiclesByCustomer(customerId: number): Observable<Vehicle[]> {
        return this.http.get<Vehicle[]>(`${this.baseUrl}/vehicles/customer/${customerId}`);
    }

    createVehicle(vehicle: Vehicle): Observable<Vehicle> {
        return this.http.post<Vehicle>(`${this.baseUrl}/vehicles`, vehicle);
    }

    updateVehicle(id: number, vehicle: Vehicle): Observable<Vehicle> {
        return this.http.put<Vehicle>(`${this.baseUrl}/vehicles/${id}`, vehicle);
    }

    deleteVehicle(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/vehicles/${id}`);
    }

    // Services
    getServices(): Observable<ServiceItem[]> {
        return this.http.get<ServiceItem[]>(`${this.baseUrl}/services`);
    }

    getService(id: number): Observable<ServiceItem> {
        return this.http.get<ServiceItem>(`${this.baseUrl}/services/${id}`);
    }

    createService(service: ServiceItem): Observable<ServiceItem> {
        return this.http.post<ServiceItem>(`${this.baseUrl}/services`, service);
    }

    updateService(id: number, service: ServiceItem): Observable<ServiceItem> {
        return this.http.put<ServiceItem>(`${this.baseUrl}/services/${id}`, service);
    }

    // Work Orders
    getWorkOrders(page = 0, size = 10, status?: string): Observable<Page<WorkOrder>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (status) params = params.set('status', status);
        return this.http.get<Page<WorkOrder>>(`${this.baseUrl}/workorders`, { params });
    }

    getWorkOrder(id: number): Observable<WorkOrder> {
        return this.http.get<WorkOrder>(`${this.baseUrl}/workorders/${id}`);
    }

    getRecentWorkOrders(limit = 10): Observable<WorkOrder[]> {
        return this.http.get<WorkOrder[]>(`${this.baseUrl}/workorders/recent?limit=${limit}`);
    }

    createWorkOrder(workOrder: WorkOrder): Observable<WorkOrder> {
        return this.http.post<WorkOrder>(`${this.baseUrl}/workorders`, workOrder);
    }

    updateWorkOrder(id: number, workOrder: WorkOrder): Observable<WorkOrder> {
        return this.http.put<WorkOrder>(`${this.baseUrl}/workorders/${id}`, workOrder);
    }

    updateWorkOrderStatus(id: number, status: string): Observable<WorkOrder> {
        return this.http.patch<WorkOrder>(`${this.baseUrl}/workorders/${id}/status`, { status });
    }

    addServiceToWorkOrder(workOrderId: number, service: any): Observable<WorkOrder> {
        return this.http.post<WorkOrder>(`${this.baseUrl}/workorders/${workOrderId}/services`, service);
    }

    // Invoices
    getInvoices(page = 0, size = 10, status?: string): Observable<Page<Invoice>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (status) params = params.set('status', status);
        return this.http.get<Page<Invoice>>(`${this.baseUrl}/invoices`, { params });
    }

    getInvoice(id: number): Observable<Invoice> {
        return this.http.get<Invoice>(`${this.baseUrl}/invoices/${id}`);
    }

    createInvoice(workOrderId: number): Observable<Invoice> {
        return this.http.post<Invoice>(`${this.baseUrl}/invoices/workorder/${workOrderId}`, {});
    }

    sendInvoice(id: number): Observable<Invoice> {
        return this.http.post<Invoice>(`${this.baseUrl}/invoices/${id}/send`, {});
    }

    recordPayment(id: number, amount: number): Observable<Invoice> {
        return this.http.post<Invoice>(`${this.baseUrl}/invoices/${id}/payment`, { amount });
    }
}
