import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Employe, EmployeRequest, EmployeFilter, DocumentEmploye, EmployeUpdateRequest } from '../models/employe.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeService {
  private apiUrl = `${environment.apiUrl}/admin/employes`;
  private adminApiUrl = `${environment.apiUrl}/admin/employes`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getFileHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getEmployes(filter?: EmployeFilter): Observable<Employe[]> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<{data: Employe[]}>(`${this.apiUrl}`, { 
      params, 
      headers: this.getHeaders() 
    }).pipe(map(response => response.data));
  }

  getEmploye(id: number): Observable<Employe> {
    return this.http.get<Employe>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getEmployeById(id: number): Observable<Employe> {
    return this.http.get<Employe>(`${this.adminApiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createEmploye(employe: EmployeRequest): Observable<Employe> {
    return this.http.post<Employe>(this.adminApiUrl, employe, { headers: this.getHeaders() });
  }

  updateEmploye(id: number, employe: Partial<EmployeRequest> | EmployeUpdateRequest): Observable<Employe> {
    return this.http.put<Employe>(`${this.apiUrl}/${id}`, employe, { headers: this.getHeaders() });
  }

  deleteEmploye(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  supprimerEmploye(id: number): Observable<void> {
    return this.deleteEmploye(id);
  }

  uploadDocument(employeId: number, file: File, type: string): Observable<DocumentEmploye> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return this.http.post<DocumentEmploye>(`${this.apiUrl}/${employeId}/documents`, formData, {
      headers: this.getFileHeaders()
    });
  }

  getDocuments(employeId: number): Observable<DocumentEmploye[]> {
    return this.http.get<DocumentEmploye[]>(`${this.apiUrl}/${employeId}/documents`, { headers: this.getHeaders() });
  }

  deleteDocument(employeId: number, documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${employeId}/documents/${documentId}`, { headers: this.getHeaders() });
  }

  telechargerDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/documents/${documentId}/download`, {
      responseType: 'blob',
      headers: this.getHeaders()
    });
  }

  supprimerDocument(documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/documents/${documentId}`, {
      headers: this.getHeaders()
    });
  }

  exportEmployes(format: 'excel' | 'pdf' = 'excel'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      params: { format },
      responseType: 'blob',
      headers: this.getHeaders()
    });
  }

  importEmployes(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import`, formData, { headers: this.getFileHeaders() });
  }

  getEmployeProfile(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/profile`, { headers: this.getHeaders() });
  }

  getEmployeHistory(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/history`, { headers: this.getHeaders() });
  }

  getEmployeStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`, { headers: this.getHeaders() });
  }

  bulkAction(action: string, employeIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-action`, { 
      action, 
      employe_ids: employeIds 
    }, { headers: this.getHeaders() });
  }

  getMyProfile(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/profile`, { headers: this.getHeaders() });
  }

  updateMyProfile(profile: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/profile`, profile, { headers: this.getHeaders() });
  }

  searchEmployes(query: string): Observable<Employe[]> {
    return this.http.get<Employe[]>(`${this.apiUrl}/search`, {
      params: { q: query },
      headers: this.getHeaders()
    });
  }
}
