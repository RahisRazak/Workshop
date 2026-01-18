import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthService } from '@core/services/auth.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [LoginComponent, FormsModule],
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with empty credentials', () => {
        expect(component.credentials.username).toBe('');
        expect(component.credentials.password).toBe('');
        expect(component.loading).toBe(false);
        expect(component.error).toBe('');
    });

    describe('fillCredentials', () => {
        it('should fill credentials when demo credential clicked', () => {
            component.fillCredentials('admin', 'admin123');

            expect(component.credentials.username).toBe('admin');
            expect(component.credentials.password).toBe('admin123');
        });
    });

    describe('login', () => {
        it('should call authService.login on form submit', fakeAsync(() => {
            const mockResponse = {
                token: 'test-token',
                type: 'Bearer',
                id: 1,
                username: 'admin',
                email: 'admin@test.com',
                fullName: 'Admin',
                role: 'ADMIN'
            };
            authServiceSpy.login.and.returnValue(of(mockResponse));

            component.credentials = { username: 'admin', password: 'admin123' };
            component.login();
            tick();

            expect(authServiceSpy.login).toHaveBeenCalledWith({ username: 'admin', password: 'admin123' });
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
        }));

        it('should set loading to true while logging in', () => {
            authServiceSpy.login.and.returnValue(of({} as any));

            component.login();

            // Loading should have been true at start
            expect(component.loading).toBe(true);
        });

        it('should show error message on login failure', fakeAsync(() => {
            authServiceSpy.login.and.returnValue(throwError(() => new Error('Invalid credentials')));

            component.login();
            tick();

            expect(component.loading).toBe(false);
            expect(component.error).toBe('Invalid username or password');
        }));

        it('should clear error before login attempt', fakeAsync(() => {
            component.error = 'Previous error';
            authServiceSpy.login.and.returnValue(of({} as any));

            component.login();

            expect(component.error).toBe('');
        }));
    });

    describe('template', () => {
        it('should have username and password inputs', () => {
            const usernameInput = fixture.debugElement.query(By.css('#username'));
            const passwordInput = fixture.debugElement.query(By.css('#password'));

            expect(usernameInput).toBeTruthy();
            expect(passwordInput).toBeTruthy();
        });

        it('should have demo credential buttons', () => {
            const credentials = fixture.debugElement.queryAll(By.css('.credential'));
            expect(credentials.length).toBe(3); // Admin, Mechanic, Receptionist
        });

        it('should show error message when error exists', () => {
            component.error = 'Test error';
            fixture.detectChanges();

            const errorMessage = fixture.debugElement.query(By.css('.error-message'));
            expect(errorMessage).toBeTruthy();
            expect(errorMessage.nativeElement.textContent).toContain('Test error');
        });

        it('should show spinner when loading', () => {
            component.loading = true;
            fixture.detectChanges();

            const spinner = fixture.debugElement.query(By.css('.spinner'));
            expect(spinner).toBeTruthy();
        });

        it('should disable button when loading', () => {
            component.loading = true;
            fixture.detectChanges();

            const button = fixture.debugElement.query(By.css('.btn-login'));
            expect(button.nativeElement.disabled).toBe(true);
        });
    });
});
