import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SystemLog } from '../interfaces/admin.interfaces';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = `${environment.apiUrl}/admin/logs`;

  constructor(private http: HttpClient) { }

  // Méthode pour récupérer les logs système avec filtres
  getSystemLogs(filters?: any): Observable<SystemLog[]> {
    return this.http.post<SystemLog[]>(`${this.apiUrl}/system`, filters || {});
  }

  getAuditLogs(filters?: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/audit`, filters || {});
  }

  // Méthode ajoutée pour l'export des logs d'audit
  exportAuditLogs(filters?: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/audit/export`, filters || {}, { responseType: 'blob' });
  }

  // Méthode ajoutée pour l'export des logs système
  exportSystemLogs(filters?: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/system/export`, filters || {}, { responseType: 'blob' });
  }

  getLoginLogs(page: number = 1, limit: number = 50): Observable<any> {
    return this.http.get(`${this.apiUrl}/login?page=${page}&limit=${limit}`);
  }

  getErrorLogs(page: number = 1, limit: number = 50): Observable<any> {
    return this.http.get(`${this.apiUrl}/errors?page=${page}&limit=${limit}`);
  }

  exportLogs(type: 'audit' | 'system' | 'login' | 'error', format: 'csv' | 'json'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${type}/export?format=${format}`, { responseType: 'blob' });
  }

  clearLogs(type: string, olderThan?: string): Observable<any> {
    const params = olderThan ? `?olderThan=${olderThan}` : '';
    return this.http.delete(`${this.apiUrl}/${type}/clear${params}`);
  }

  getLogStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}
