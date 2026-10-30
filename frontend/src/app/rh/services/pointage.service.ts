import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employe } from '../models/employe.model';

export interface PointageData {
  employe_id: number;
  date_pointage: string;
  heure_entree?: string;
  heure_sortie?: string;
  pause_debut?: string;
  pause_fin?: string;
  statut?: 'present' | 'absent' | 'retard' | 'conge';
}

export interface PointageResponse {
  data: any[];
  message: string;
}

export interface PointageStats {
  total_pointages: number;
  presents_aujourdhui: number;
  absents_aujourdhui: number;
  retards_aujourdhui: number;
  total_heures_travaillees: number;
  moyenne_heures_par_jour: number;
}

@Injectable({
  providedIn: 'root'
})
export class PointageService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Get all employees for pointage
  getAllEmployees(): Observable<{data: Employe[]}> {
    return this.http.get<{data: Employe[]}>(`${this.apiUrl}/employes`, {
      headers: this.getHeaders()
    });
  }

  // Get existing pointages for a specific date
  getPointagesByDate(date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pointages`, {
      params: { date_debut: date, date_fin: date },
      headers: this.getHeaders()
    });
  }

  // Submit multiple pointages at once
  submitBulkPointages(pointages: PointageData[]): Observable<PointageResponse> {
    return this.http.post<PointageResponse>(`${this.apiUrl}/pointages/bulk`, {
      pointages: pointages
    }, {
      headers: this.getHeaders()
    });
  }

  // Submit single pointage
  submitPointage(pointage: PointageData): Observable<any> {
    return this.http.post(`${this.apiUrl}/pointages`, pointage, {
      headers: this.getHeaders()
    });
  }

  // Get pointage statistics - ADDED METHOD
  getPointagesStats(): Observable<PointageStats> {
    return this.http.get<PointageStats>(`${this.apiUrl}/pointages/stats`, {
      headers: this.getHeaders()
    });
  }
}
