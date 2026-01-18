import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '@environments/environment';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthService]
        });

        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('login', () => {
        it('should login successfully and store token', () => {
            const mockResponse = {
                token: 'test-jwt-token',
                type: 'Bearer',
                id: 1,
                username: 'admin',
                email: 'admin@test.com',
                fullName: 'Admin User',
                role: 'ADMIN'
            };

            service.login({ username: 'admin', password: 'admin123' }).subscribe(response => {
                expect(response.token).toBe('test-jwt-token');
                expect(service.isLoggedIn()).toBe(true);
                expect(service.getToken()).toBe('test-jwt-token');
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ username: 'admin', password: 'admin123' });
            req.flush(mockResponse);
        });

        it('should handle login error', () => {
            service.login({ username: 'wrong', password: 'wrong' }).subscribe({
                error: (err) => {
                    expect(err.status).toBe(401);
                    expect(service.isLoggedIn()).toBe(false);
                }
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
            req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
        });
    });

    describe('logout', () => {
        it('should clear token and user on logout', () => {
            // Setup: simulate a logged-in state
            localStorage.setItem('workshop_token', 'test-token');
            localStorage.setItem('workshop_user', JSON.stringify({ id: 1, username: 'admin' }));

            service.logout();

            expect(service.isLoggedIn()).toBe(false);
            expect(service.getToken()).toBeNull();
            expect(service.getCurrentUser()).toBeNull();
        });
    });

    describe('isLoggedIn', () => {
        it('should return false when no token exists', () => {
            expect(service.isLoggedIn()).toBe(false);
        });

        it('should return true when token exists', () => {
            localStorage.setItem('workshop_token', 'test-token');
            // Recreate service to pick up the token
            service = TestBed.inject(AuthService);
            expect(service.isLoggedIn()).toBe(true);
        });
    });

    describe('hasRole', () => {
        it('should return true for matching role', () => {
            const mockUser = { id: 1, username: 'admin', email: 'admin@test.com', fullName: 'Admin', role: 'ADMIN' };
            localStorage.setItem('workshop_user', JSON.stringify(mockUser));

            // Recreate service to load stored user
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule],
                providers: [AuthService]
            });
            service = TestBed.inject(AuthService);

            expect(service.hasRole('ADMIN')).toBe(true);
            expect(service.isAdmin()).toBe(true);
        });

        it('should return false for non-matching role', () => {
            const mockUser = { id: 1, username: 'mechanic', email: 'mech@test.com', fullName: 'Mechanic', role: 'MECHANIC' };
            localStorage.setItem('workshop_user', JSON.stringify(mockUser));

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule],
                providers: [AuthService]
            });
            service = TestBed.inject(AuthService);

            expect(service.hasRole('ADMIN')).toBe(false);
            expect(service.isAdmin()).toBe(false);
        });
    });
});
