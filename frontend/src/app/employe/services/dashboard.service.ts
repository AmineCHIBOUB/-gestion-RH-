import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  congesRestants: number;  // était conges_restants
  congesPris: number;      // était conges_pris
  heuresTravaillees: number;  // était heures_travaillees_mois
  heuresSupplementaires: number;  // était heures_supplementaires
  documentsNonLus: number;    // était documents_non_lus
  annoncesNonLues: number;    // était notifications_non_lues
  dernierBulletin?: any;      // était dernier_bulletin
  prochainConge?: any;        // était prochain_conge
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Obtenir toutes les données du dashboard
  getDashboardData(): Observable<{
    profile: any;
    stats: DashboardStats;
    recent_conges: any[];
    recent_documents: any[];
    notifications: any[];
  }> {
    return forkJoin({
      profile: this.http.get(`${this.apiUrl}/profile`),
      stats: this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`),
      recent_conges: this.http.get<any[]>(`${this.apiUrl}/conges/my-conges?limit=5`),
      recent_documents: this.http.get<any[]>(`${this.apiUrl}/fichiers/my-files?limit=5`),
      notifications: this.http.get<any[]>(`${this.apiUrl}/notifications?limit=10`)
    });
  }

  // Marquer une notification comme lue
  markNotificationAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/${id}/read`, {});
  }
}
