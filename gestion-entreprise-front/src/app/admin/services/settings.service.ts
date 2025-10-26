import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GeneralSettings, PayrollSettings, DocumentSettings } from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/admin/settings`;

  constructor(private http: HttpClient) { }

  getGeneralSettings(): Observable<GeneralSettings> {
    return this.http.get<GeneralSettings>(`${this.apiUrl}/general`);
  }

  updateGeneralSettings(settings: GeneralSettings): Observable<GeneralSettings> {
    return this.http.put<GeneralSettings>(`${this.apiUrl}/general`, settings);
  }

  getPayrollSettings(): Observable<PayrollSettings> {
    return this.http.get<PayrollSettings>(`${this.apiUrl}/payroll`);
  }

  updatePayrollSettings(settings: PayrollSettings): Observable<PayrollSettings> {
    return this.http.put<PayrollSettings>(`${this.apiUrl}/payroll`, settings);
  }

  getDocumentSettings(): Observable<DocumentSettings> {
    return this.http.get<DocumentSettings>(`${this.apiUrl}/documents`);
  }

  updateDocumentSettings(settings: DocumentSettings): Observable<DocumentSettings> {
    return this.http.put<DocumentSettings>(`${this.apiUrl}/documents`, settings);
  }

  getEmailSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/email`);
  }

  updateEmailSettings(settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/email`, settings);
  }

  testEmailConnection(settings: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/email/test`, settings);
  }

  getSecuritySettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/security`);
  }

  updateSecuritySettings(settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/security`, settings);
  }

  backupDatabase(): Observable<any> {
    return this.http.post(`${this.apiUrl}/backup`, {});
  }

  restoreDatabase(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('backup', file);
    return this.http.post(`${this.apiUrl}/restore`, formData);
  }

  // NOUVELLE MÉTHODE MANQUANTE
  resetToDefaults(): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-defaults`, {});
  }

  // NOUVELLE MÉTHODE MANQUANTE
  testStoragePath(path: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/test-storage`, { path });
  }
}
