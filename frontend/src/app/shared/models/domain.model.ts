export interface Customer {
    id?: number;
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    notes?: string;
    vehicleCount?: number;
}

export interface Vehicle {
    id?: number;
    vin?: string;
    make: string;
    model: string;
    year: number;
    color?: string;
    licensePlate?: string;
    mileage?: number;
    notes?: string;
    customerId: number;
    customerName?: string;
}

export interface ServiceItem {
    id?: number;
    name: string;
    description?: string;
    basePrice: number;
    estimatedMinutes?: number;
    category?: ServiceCategory;
    active?: boolean;
}

export enum ServiceCategory {
    GENERAL = 'GENERAL',
    ENGINE = 'ENGINE',
    TRANSMISSION = 'TRANSMISSION',
    BRAKES = 'BRAKES',
    SUSPENSION = 'SUSPENSION',
    ELECTRICAL = 'ELECTRICAL',
    AC_HEATING = 'AC_HEATING',
    TIRES = 'TIRES',
    OIL_CHANGE = 'OIL_CHANGE',
    INSPECTION = 'INSPECTION',
    BODY_WORK = 'BODY_WORK'
}

export interface WorkOrder {
    id?: number;
    orderNumber?: string;
    vehicleId: number;
    vehicleInfo?: string;
    customerId?: number;
    customerName?: string;
    assignedMechanicId?: number;
    assignedMechanicName?: string;
    status?: WorkOrderStatus;
    description?: string;
    customerConcerns?: string;
    diagnosis?: string;
    workPerformed?: string;
    scheduledDate?: string;
    startedAt?: string;
    completedAt?: string;
    estimatedMinutes?: number;
    laborCost?: number;
    partsCost?: number;
    totalCost?: number;
    services?: WorkOrderService[];
    createdAt?: string;
}

export enum WorkOrderStatus {
    PENDING = 'PENDING',
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    WAITING_FOR_PARTS = 'WAITING_FOR_PARTS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface WorkOrderService {
    id?: number;
    serviceItemId: number;
    serviceName?: string;
    price: number;
    quantity?: number;
    notes?: string;
    completed?: boolean;
}

export interface Invoice {
    id?: number;
    invoiceNumber?: string;
    workOrderId: number;
    workOrderNumber?: string;
    customerName?: string;
    vehicleInfo?: string;
    subtotal?: number;
    taxRate?: number;
    taxAmount?: number;
    totalAmount?: number;
    paidAmount?: number;
    balanceDue?: number;
    status?: InvoiceStatus;
    issueDate?: string;
    dueDate?: string;
    paidDate?: string;
    notes?: string;
}

export enum InvoiceStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    PAID = 'PAID',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED'
}

export interface Dashboard {
    totalCustomers: number;
    totalVehicles: number;
    pendingWorkOrders: number;
    inProgressWorkOrders: number;
    completedWorkOrdersToday: number;
    pendingInvoices: number;
    monthlyRevenue: number;
    outstandingBalance: number;
    recentWorkOrders: WorkOrder[];
    upcomingAppointments: WorkOrder[];
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}
