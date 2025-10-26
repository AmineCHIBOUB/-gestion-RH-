import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Department, Post, CreateDepartmentRequest } from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = `${environment.apiUrl}/admin/departments`;

  constructor(private http: HttpClient) { }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl);
  }

  getDepartmentById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`);
  }

  createDepartment(department: CreateDepartmentRequest): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, department);
  }

  updateDepartment(id: number, department: Partial<Department>): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, department);
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPosts(): Observable<Post[]> {
    return this.http.get<{success: boolean, data: Post[]}>(`${environment.apiUrl}/admin/posts`)
      .pipe(map(response => response.data || []));
  }

  createPost(post: Partial<Post>): Observable<Post> {
    return this.http.post<{success: boolean, data: Post}>(`${environment.apiUrl}/admin/posts`, post)
      .pipe(map(response => response.data));
  }

  updatePost(id: number, post: Partial<Post>): Observable<Post> {
    return this.http.put<{success: boolean, data: Post}>(`${environment.apiUrl}/admin/posts/${id}`, post)
      .pipe(map(response => response.data));
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/posts/${id}`);
  }

  getDepartmentEmployees(departmentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${departmentId}/employees`);
  }
}
