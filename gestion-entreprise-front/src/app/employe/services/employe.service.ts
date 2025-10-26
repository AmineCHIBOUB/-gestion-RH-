import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EmployeProfile } from '../models/employe.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeService {
  private apiUrl = `${environment.apiUrl}`;
  private currentEmployeSubject = new BehaviorSubject<EmployeProfile | null>(null);
  public currentEmploye$ = this.currentEmployeSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Obtenir mon profil (route Laravel: GET /api/profile)
  getMyProfile(): Observable<EmployeProfile> {
    console.log('🔍 Tentative de récupération du profil...');
    console.log('🌐 URL:', `${this.apiUrl}/profile`);
    console.log('🔑 Token présent:', !!localStorage.getItem('auth_token'));
    
    return this.http.get<EmployeProfile>(`${this.apiUrl}/profile`).pipe(
      map(employe => ({
        ...employe,
        // Mapper les propriétés snake_case vers camelCase pour le template
        dateNaissance: employe.date_naissance,
        dateEmbauche: employe.date_embauche
      })),
      tap(employe => {
        console.log('✅ Profil reçu:', employe);
        this.currentEmployeSubject.next(employe);
      }),
      catchError((error: any) => {
        console.error('❌ Erreur détaillée:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          error: error.error
        });
        return throwError(() => error);
      })
    );
  }

  // Mettre à jour mon profil (route Laravel: PUT /api/profile)
  updateMyProfile(profile: Partial<EmployeProfile>): Observable<EmployeProfile> {
    return this.http.put<EmployeProfile>(`${this.apiUrl}/profile`, profile).pipe(
      tap(employe => this.currentEmployeSubject.next(employe))
    );
  }

  // Obtenir les statistiques du dashboard
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/stats`);
  }

  // Changer le mot de passe
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password`, {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPassword
    });
  }
}
