import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CongeEmploye, DemandeConge, StatutConge } from '../models/conge-employe.model';

@Injectable({
  providedIn: 'root'
})
export class CongeEmployeService {
  private apiUrl = `${environment.apiUrl}/admin/conges`; // Added /admin prefix

  constructor(private http: HttpClient) {}

  // Obtenir mes congés (route Laravel: GET /api/admin/conges/my-conges)
  getMesConges(page: number = 1, limit: number = 10, statut?: StatutConge): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', limit.toString());
    
    if (statut) {
      params = params.set('statut', statut);
    }

    return this.http.get(`${this.apiUrl}/my-conges`, { params });
  }

  // Créer une demande de congé (route Laravel: POST /api/admin/conges)
  creerDemandeConge(demande: DemandeConge): Observable<CongeEmploye> {
    return this.http.post<CongeEmploye>(this.apiUrl, {
      type_conge: demande.typeConge,
      date_debut: demande.dateDebut,
      date_fin: demande.dateFin,
      motif: demande.motif,
      employe_id: demande.employeId // Add this line!
    });
  }

  // Obtenir le solde de congés (route Laravel: GET /api/admin/conges/my-balance)
  getSoldeConges(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-balance`);
  }

  // Modifier une demande de congé
  modifierDemandeConge(id: number, demande: Partial<DemandeConge>): Observable<CongeEmploye> {
    return this.http.put<CongeEmploye>(`${this.apiUrl}/${id}`, demande);
  }

  // Annuler une demande de congé
  annulerDemandeConge(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
