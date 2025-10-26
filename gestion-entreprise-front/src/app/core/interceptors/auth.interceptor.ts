import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    console.log('Auth Interceptor: Added Authorization header');
  } else {
    console.warn('Auth Interceptor: No token found');
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Auth Interceptor Error:', {
        status: error.status,
        message: error.message,
        url: req.url
      });
      
      if (error.status === 401) {
        console.log('Auth Interceptor: 401 error, logging out');
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
