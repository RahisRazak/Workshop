import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { AppComponent } from './app.component';
import { AuthService } from '@core/services/auth.service';
import { By } from '@angular/platform-browser';

// Mock RouterOutlet to avoid router initialization
@Component({ selector: 'router-outlet', template: '', standalone: true })
class MockRouterOutlet { }

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getCurrentUser', 'logout']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        })
            .overrideComponent(AppComponent, {
                remove: { imports: [] },
                add: { imports: [MockRouterOutlet] }
            })
            .compileComponents();
    });

    describe('component creation', () => {
        beforeEach(() => {
            authServiceSpy.isLoggedIn.and.returnValue(false);
            fixture = TestBed.createComponent(AppComponent);
            component = fixture.componentInstance;
        });

        it('should create the app', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize sidebarOpen as false', () => {
            expect(component.sidebarOpen).toBe(false);
        });
    });

    describe('sidebar toggle functionality', () => {
        beforeEach(() => {
            authServiceSpy.isLoggedIn.and.returnValue(true);
            authServiceSpy.getCurrentUser.and.returnValue({ id: 1, username: 'admin', email: '', fullName: 'Admin', role: 'ADMIN' });
            fixture = TestBed.createComponent(AppComponent);
            component = fixture.componentInstance;
        });

        it('should toggle sidebar open state', () => {
            expect(component.sidebarOpen).toBe(false);

            component.toggleSidebar();
            expect(component.sidebarOpen).toBe(true);

            component.toggleSidebar();
            expect(component.sidebarOpen).toBe(false);
        });

        it('should close sidebar', () => {
            component.sidebarOpen = true;
            component.closeSidebar();
            expect(component.sidebarOpen).toBe(false);
        });
    });

    describe('logout functionality', () => {
        beforeEach(() => {
            authServiceSpy.isLoggedIn.and.returnValue(true);
            authServiceSpy.getCurrentUser.and.returnValue({ id: 1, username: 'admin', email: '', fullName: 'Admin', role: 'ADMIN' });
            fixture = TestBed.createComponent(AppComponent);
            component = fixture.componentInstance;
        });

        it('should call authService.logout and navigate to login', () => {
            component.logout();

            expect(authServiceSpy.logout).toHaveBeenCalled();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
        });

        it('should close sidebar on logout', () => {
            component.sidebarOpen = true;
            component.logout();
            expect(component.sidebarOpen).toBe(false);
        });
    });
});
