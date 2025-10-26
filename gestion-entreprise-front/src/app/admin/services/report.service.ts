import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/admin/reports`;

  constructor(private http: HttpClient) { }

  getUserReports(filters?: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, filters || {});
  }

  // Méthode ajoutée pour l'export des rapports utilisateurs
  exportUserReports(filters?: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/users/export`, filters || {}, { responseType: 'blob' });
  }

  getActivityReports(filters?: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/activities`, filters || {});
  }

  // Méthode manquante ajoutée
  exportActivityReports(filters?: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/activities/export`, filters || {}, { responseType: 'blob' });
  }

  getFinancialReports(period: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/financial?period=${period}`);
  }

  // Méthode ajoutée pour l'export des rapports financiers
  exportFinancialReports(filters?: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/financial/export`, filters || {}, { responseType: 'blob' });
  }

  getAttendanceReports(filters: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/attendance`, filters);
  }

  getLeaveReports(filters: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/leaves`, filters);
  }

  exportReport(type: string, format: 'pdf' | 'excel' | 'csv', filters?: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/${type}/export?format=${format}`, filters || {}, { responseType: 'blob' });
  }

  getReportTemplates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/templates`);
  }

  generateCustomReport(template: any, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/custom`, { template, data });
  }
}
