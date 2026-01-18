import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './auth.guard';
import { AuthService } from '@core/services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('Auth Guards', () => {
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let mockRoute: ActivatedRouteSnapshot;
    let mockState: RouterStateSnapshot;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'isAdmin']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        });

        mockRoute = {} as ActivatedRouteSnapshot;
        mockState = { url: '/dashboard' } as RouterStateSnapshot;
    });

    describe('authGuard', () => {
        it('should allow access when user is logged in', () => {
            authServiceSpy.isLoggedIn.and.returnValue(true);

            const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

            expect(result).toBe(true);
            expect(routerSpy.navigate).not.toHaveBeenCalled();
        });

        it('should redirect to login when user is not logged in', () => {
            authServiceSpy.isLoggedIn.and.returnValue(false);

            const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

            expect(result).toBe(false);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/dashboard' } });
        });
    });

    describe('adminGuard', () => {
        it('should allow access when user is admin', () => {
            authServiceSpy.isLoggedIn.and.returnValue(true);
            authServiceSpy.isAdmin.and.returnValue(true);

            const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

            expect(result).toBe(true);
        });

        it('should redirect to dashboard when user is not admin', () => {
            authServiceSpy.isLoggedIn.and.returnValue(true);
            authServiceSpy.isAdmin.and.returnValue(false);

            const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

            expect(result).toBe(false);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
        });

        it('should redirect to dashboard when user is not logged in', () => {
            authServiceSpy.isLoggedIn.and.returnValue(false);
            authServiceSpy.isAdmin.and.returnValue(false);

            const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));

            expect(result).toBe(false);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
        });
    });

    describe('guestGuard', () => {
        it('should allow access when user is not logged in', () => {
            authServiceSpy.isLoggedIn.and.returnValue(false);

            const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

            expect(result).toBe(true);
            expect(routerSpy.navigate).not.toHaveBeenCalled();
        });

        it('should redirect to dashboard when user is logged in', () => {
            authServiceSpy.isLoggedIn.and.returnValue(true);

            const result = TestBed.runInInjectionContext(() => guestGuard(mockRoute, mockState));

            expect(result).toBe(false);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
        });
    });
});
