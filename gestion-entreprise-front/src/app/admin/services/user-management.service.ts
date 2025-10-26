import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) { }

  getUsers(page: number = 1, limit: number = 10, search?: string): Observable<{data: User[], total: number, per_page: number, current_page: number, last_page: number}> {
    const token = localStorage.getItem('auth_token');
    const headers = token ? new HttpHeaders({
      'Authorization': `Bearer ${token}`
    }) : new HttpHeaders();
    
    let params = `page=${page}&limit=${limit}`;
    if (search) params += `&search=${search}`;
    
    return this.http.get<{data: User[], total: number, per_page: number, current_page: number, last_page: number}>(`${this.apiUrl}?${params}`, { headers });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleUserStatus(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  resetPassword(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reset-password`, {});
  }

  assignRole(userId: number, roleId: number): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/assign-role`, { roleId });
  }

  exportUsers(format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export?format=${format}`, { responseType: 'blob' });
  }

  importUsers(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import`, formData);
  }
}
