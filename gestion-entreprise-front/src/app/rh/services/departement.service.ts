import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Departement, DepartementRequest, DepartementStats } from '../models/departement.model';

@Injectable({
  providedIn: 'root'
})
export class DepartementService {
  private apiUrl = `${environment.apiUrl}/rh/departements`;

  constructor(private http: HttpClient) {}

  getDepartements(filtres?: any): Observable<Departement[]> {
    let params = new HttpParams();
    if (filtres) {
      Object.keys(filtres).forEach(key => {
        if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
          params = params.set(key, filtres[key]);
        }
      });
    }
    return this.http.get<Departement[]>(this.apiUrl, { params });
  }

  getDepartement(id: number): Observable<Departement> {
    return this.http.get<Departement>(`${this.apiUrl}/${id}`);
  }

  createDepartement(departement: DepartementRequest): Observable<Departement> {
    return this.http.post<Departement>(this.apiUrl, departement);
  }

  updateDepartement(id: number, departement: DepartementRequest): Observable<Departement> {
    return this.http.put<Departement>(`${this.apiUrl}/${id}`, departement);
  }

  deleteDepartement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStatistiques(id: number): Observable<DepartementStats> {
    return this.http.get<DepartementStats>(`${this.apiUrl}/${id}/statistiques`);
  }

  getEmployesDepartement(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/employes`);
  }
}
