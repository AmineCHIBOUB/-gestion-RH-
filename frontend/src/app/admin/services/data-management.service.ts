import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataManagementService {
  private apiUrl = `${environment.apiUrl}/admin/data`;

  constructor(private http: HttpClient) { }

  // Import functions
  importUsers(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import/users`, formData);
  }

  importDepartments(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import/departments`, formData);
  }

  importEmployees(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import/employees`, formData);
  }

  // Export functions
  exportAllData(format: 'csv' | 'excel' | 'json' = 'excel'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/all?format=${format}`, { responseType: 'blob' });
  }

  exportUsers(format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/users?format=${format}`, { responseType: 'blob' });
  }

  exportDepartments(format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/departments?format=${format}`, { responseType: 'blob' });
  }

  exportEmployees(format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/employees?format=${format}`, { responseType: 'blob' });
  }

  // Backup functions
  createBackup(): Observable<any> {
    return this.http.post(`${this.apiUrl}/backup/create`, {});
  }

  getBackups(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/backup/list`);
  }

  downloadBackup(backupId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/backup/download/${backupId}`, { responseType: 'blob' });
  }

  restoreBackup(backupId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/backup/restore/${backupId}`, {});
  }

  deleteBackup(backupId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/backup/delete/${backupId}`);
  }

  // Data validation
  validateImportFile(file: File, type: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return this.http.post(`${this.apiUrl}/validate`, formData);
  }

  getImportTemplate(type: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/template/${type}`, { responseType: 'blob' });
  }
}
