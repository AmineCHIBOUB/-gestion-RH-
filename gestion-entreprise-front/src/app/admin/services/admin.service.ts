import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PayrollSettings, GeneralSettings, ImportResult, ExportSettings, ExportResult } from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/stats`);
  }

  getSystemHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/system/health`);
  }

  getRecentActivities(limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activities/recent?limit=${limit}`);
  }

  // Gestion globale des approbations
  getPendingApprovals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/approvals/pending`);
  }

  approveRequest(requestId: number, type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/approvals/${requestId}/approve`, { type });
  }

  rejectRequest(requestId: number, type: string, reason?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/approvals/${requestId}/reject`, { type, reason });
  }

  // Substitution RH
  actAsHR(action: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/act-as-hr/${action}`, data);
  }

  // Alertes système
  getSystemAlerts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/alerts`);
  }

  dismissAlert(alertId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/alerts/${alertId}`);
  }

  // MÉTHODES POUR LES PARAMÈTRES
  getPayrollSettings(): Observable<PayrollSettings> {
    return this.http.get<PayrollSettings>(`${this.apiUrl}/settings/payroll`);
  }

  updatePayrollSettings(settings: PayrollSettings): Observable<PayrollSettings> {
    return this.http.put<PayrollSettings>(`${this.apiUrl}/settings/payroll`, settings);
  }

  getGeneralSettings(): Observable<GeneralSettings> {
    return this.http.get<GeneralSettings>(`${this.apiUrl}/settings/general`);
  }

  updateGeneralSettings(settings: GeneralSettings): Observable<GeneralSettings> {
    return this.http.put<GeneralSettings>(`${this.apiUrl}/settings/general`, settings);
  }

  testStoragePath(path: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/settings/test-storage`, { path });
  }

  // NOUVELLES MÉTHODES POUR L'IMPORT DE DONNÉES
  previewImport(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/import/preview`, formData);
  }

  importData(formData: FormData): Observable<ImportResult> {
    return this.http.post<ImportResult>(`${this.apiUrl}/import/data`, formData);
  }

  downloadImportTemplate(importType: string, fileFormat: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/import/template/${importType}?format=${fileFormat}`, { responseType: 'blob' });
  }

  // NOUVELLE MÉTHODE POUR L'EXPORT DE DONNÉES
  exportData(settings: ExportSettings): Observable<ExportResult> {
    return this.http.post<ExportResult>(`${this.apiUrl}/export/data`, settings);
  }
}
