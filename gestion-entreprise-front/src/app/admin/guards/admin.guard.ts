import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// Assuming you have an auth service
// import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router
    // private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // For now, return true. Replace with actual admin role check
    // return this.authService.hasRole('admin').pipe(
    //   map(hasRole => {
    //     if (!hasRole) {
    //       this.router.navigate(['/auth/login']);
    //       return false;
    //     }
    //     return true;
    //   })
    // );
    
    // Temporary implementation
    const isAdmin = localStorage.getItem('userRole') === 'admin';
    if (!isAdmin) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    return true;
  }
}
