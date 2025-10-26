import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { map } from 'rxjs/operators';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    map(user => {
      if (!user) {
        router.navigate(['/auth/login']);
        return false;
      }

      const requiredRoles = route.data?.['roles'] as string[];
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
          router.navigate(['/dashboard']);
          return false;
        }
      }

      return true;
    })
  );
};
