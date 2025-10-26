import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  DemandeConge, 
  DemandeCongeRequest, 
  ValidationCongeRequest, 
  CongeFilter, 
  SoldeConge 
} from '../models/demande-conge.model';

@Injectable({
  providedIn: 'root'
})
export class CongeService {
  private apiUrl = `${environment.apiUrl}/admin/conges`;

  constructor(private http: HttpClient) {}

  // Get all congés (matches Laravel route: /admin/conges)
  getDemandes(filter?: CongeFilter): Observable<any> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<any>(`${this.apiUrl}`, { params });
  }
  
  // Get pending congés (matches Laravel route: /admin/conges/pending)
  getCongesPending(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pending`);
  }
  
  // Get approved congés (matches Laravel route: /admin/conges/approved)
  getCongesApproved(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/approved`);
  }
  
  // Get rejected congés (matches Laravel route: /admin/conges/rejected)
  getCongesRejected(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/rejected`);
  }
  
  // Get congés statistics (matches Laravel route: /admin/conges/statistics)
  getCongesStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`);
  }
  
  // Approve congé (matches Laravel route: PUT /admin/conges/{id}/approve)
  approuverDemande(id: number, commentaire?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/approve`, { commentaire });
  }
  
  // Reject congé (matches Laravel route: PUT /admin/conges/{id}/reject)
  rejeterDemande(id: number, commentaire?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/reject`, { commentaire });
  }
  
  // Get single congé (matches Laravel route: /admin/conges/{conge})
  getDemande(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Get calendar data (matches Laravel route: /admin/conges/calendar)
  getCalendrierConges(annee?: number, mois?: number): Observable<any> {
    let params = new HttpParams();
    if (annee) params = params.set('annee', annee.toString());
    if (mois) params = params.set('mois', mois.toString());
    return this.http.get(`${this.apiUrl}/calendar`, { params });
  }

  // Legacy methods for backward compatibility
  createDemande(demande: DemandeCongeRequest): Observable<DemandeConge> {
    const formData = new FormData();
    Object.keys(demande).forEach(key => {
      const value = (demande as any)[key];
      if (value !== undefined && value !== null) {
        if (key === 'pieceJointe' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    return this.http.post<DemandeConge>(this.apiUrl, formData);
  }

  updateDemande(id: number, demande: Partial<DemandeCongeRequest>): Observable<DemandeConge> {
    return this.http.put<DemandeConge>(`${this.apiUrl}/${id}`, demande);
  }

  validerDemande(id: number, validation: ValidationCongeRequest): Observable<DemandeConge> {
    return this.http.post<DemandeConge>(`${this.apiUrl}/${id}/valider`, validation);
  }

  annulerDemande(id: number): Observable<DemandeConge> {
    return this.http.post<DemandeConge>(`${this.apiUrl}/${id}/annuler`, {});
  }

  getSoldeConges(employeId: number, annee?: number): Observable<SoldeConge> {
    let params = new HttpParams();
    if (annee) {
      params = params.set('annee', annee.toString());
    }
    return this.http.get<SoldeConge>(`${this.apiUrl}/solde/${employeId}`, { params });
  }
}
