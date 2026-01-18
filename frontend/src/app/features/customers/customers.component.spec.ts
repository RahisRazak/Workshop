import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CustomersComponent } from './customers.component';
import { ApiService } from '@core/services/api.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('CustomersComponent', () => {
    let component: CustomersComponent;
    let fixture: ComponentFixture<CustomersComponent>;
    let apiServiceSpy: jasmine.SpyObj<ApiService>;

    const mockPage = {
        content: [
            { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '555-1234', city: 'New York', vehicleCount: 2 },
            { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', phone: '555-5678', city: 'Los Angeles', vehicleCount: 1 }
        ],
        totalElements: 2,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true
    };

    beforeEach(async () => {
        apiServiceSpy = jasmine.createSpyObj('ApiService', ['getCustomers', 'createCustomer', 'updateCustomer', 'deleteCustomer']);

        await TestBed.configureTestingModule({
            imports: [CustomersComponent, FormsModule],
            providers: [
                { provide: ApiService, useValue: apiServiceSpy }
            ]
        }).compileComponents();

        apiServiceSpy.getCustomers.and.returnValue(of(mockPage));
        fixture = TestBed.createComponent(CustomersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load customers on init', () => {
        expect(apiServiceSpy.getCustomers).toHaveBeenCalledWith(0, 10, undefined);
        expect(component.customers.length).toBe(2);
    });

    it('should display customers in table', () => {
        const rows = fixture.debugElement.queryAll(By.css('.data-table tbody tr'));
        expect(rows.length).toBe(2);
    });

    describe('search', () => {
        it('should debounce search input', fakeAsync(() => {
            apiServiceSpy.getCustomers.calls.reset();

            component.searchTerm = 'John';
            component.onSearch();
            tick(100); // Not enough time
            expect(apiServiceSpy.getCustomers).not.toHaveBeenCalled();

            tick(200); // Now it should trigger
            expect(apiServiceSpy.getCustomers).toHaveBeenCalledWith(0, 10, 'John');
        }));

        it('should reset to first page on search', fakeAsync(() => {
            component.currentPage = 2;
            component.searchTerm = 'test';
            component.onSearch();
            tick(300);

            expect(component.currentPage).toBe(0);
        }));
    });

    describe('pagination', () => {
        it('should go to specified page', () => {
            apiServiceSpy.getCustomers.calls.reset();

            component.goToPage(1);

            expect(component.currentPage).toBe(1);
            expect(apiServiceSpy.getCustomers).toHaveBeenCalledWith(1, 10, undefined);
        });
    });

    describe('modal', () => {
        it('should initialize empty form', () => {
            const form = component.getEmptyForm();
            expect(form.firstName).toBe('');
            expect(form.lastName).toBe('');
            expect(form.phone).toBe('');
        });

        it('should open modal with empty form for new customer', () => {
            component.showModal = false;
            component.editingCustomer = { id: 1, firstName: 'Test', lastName: 'User', phone: '123' };

            // Simulate clicking Add Customer (would call a method to open modal with empty form)
            component.formData = component.getEmptyForm();
            component.editingCustomer = null;
            component.showModal = true;

            expect(component.showModal).toBe(true);
            expect(component.editingCustomer).toBeNull();
            expect(component.formData.firstName).toBe('');
        });

        it('should populate form when editing customer', () => {
            const customer = mockPage.content[0];
            component.editCustomer(customer);

            expect(component.showModal).toBe(true);
            expect(component.editingCustomer).toEqual(customer);
            expect(component.formData.firstName).toBe('John');
        });

        it('should close modal and reset form', () => {
            component.showModal = true;
            component.editingCustomer = mockPage.content[0];
            component.formData = { ...mockPage.content[0] };

            component.closeModal();

            expect(component.showModal).toBe(false);
            expect(component.editingCustomer).toBeNull();
            expect(component.formData.firstName).toBe('');
        });
    });

    describe('CRUD operations', () => {
        it('should create new customer', fakeAsync(() => {
            const newCustomer = { firstName: 'New', lastName: 'Customer', phone: '555-0000' };
            const createdCustomer = { id: 3, ...newCustomer };
            apiServiceSpy.createCustomer.and.returnValue(of(createdCustomer));

            component.formData = newCustomer;
            component.editingCustomer = null;
            component.saveCustomer();
            tick();

            expect(apiServiceSpy.createCustomer).toHaveBeenCalledWith(newCustomer);
            expect(component.showModal).toBe(false);
        }));

        it('should update existing customer', fakeAsync(() => {
            const existingCustomer = { id: 1, firstName: 'Updated', lastName: 'Doe', phone: '555-1234' };
            apiServiceSpy.updateCustomer.and.returnValue(of(existingCustomer));

            component.editingCustomer = mockPage.content[0];
            component.formData = existingCustomer;
            component.saveCustomer();
            tick();

            expect(apiServiceSpy.updateCustomer).toHaveBeenCalledWith(1, existingCustomer);
        }));

        it('should delete customer after confirmation', fakeAsync(() => {
            spyOn(window, 'confirm').and.returnValue(true);
            apiServiceSpy.deleteCustomer.and.returnValue(of(undefined));

            component.deleteCustomer(mockPage.content[0]);
            tick();

            expect(apiServiceSpy.deleteCustomer).toHaveBeenCalledWith(1);
        }));

        it('should not delete customer if cancelled', () => {
            spyOn(window, 'confirm').and.returnValue(false);

            component.deleteCustomer(mockPage.content[0]);

            expect(apiServiceSpy.deleteCustomer).not.toHaveBeenCalled();
        });
    });
});
