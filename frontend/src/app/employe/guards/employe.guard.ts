import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { map } from 'rxjs/operators';

export const EmployeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    map(user => {
      if (!user) {
        router.navigate(['/auth/login']);
        return false;
      }

      // Vérifier que l'utilisateur a le rôle 'employe'
      if (user.role !== 'employe') {
        router.navigate(['/unauthorized']);
        return false;
      }

      return true;
    })
  );
};
// Ce fichier doit exister avec la structure appropriée
