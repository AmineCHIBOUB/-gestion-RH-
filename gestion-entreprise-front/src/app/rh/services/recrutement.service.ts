import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  OffreEmploi, 
  OffreEmploiRequest, 
  Candidature, 
  CandidatureRequest,
  EvaluationCandidat
} from '../models/recrutement.model';

@Injectable({
  providedIn: 'root'
})
export class RecrutementService {
  private apiUrl = `${environment.apiUrl}/rh/recrutement`;

  constructor(private http: HttpClient) {}

  // Gestion des offres d'emploi
  getOffres(): Observable<OffreEmploi[]> {
    return this.http.get<OffreEmploi[]>(`${this.apiUrl}/offres`);
  }

  getOffre(id: number): Observable<OffreEmploi> {
    return this.http.get<OffreEmploi>(`${this.apiUrl}/offres/${id}`);
  }

  createOffre(offre: OffreEmploiRequest): Observable<OffreEmploi> {
    return this.http.post<OffreEmploi>(`${this.apiUrl}/offres`, offre);
  }

  updateOffre(id: number, offre: Partial<OffreEmploiRequest>): Observable<OffreEmploi> {
    return this.http.put<OffreEmploi>(`${this.apiUrl}/offres/${id}`, offre);
  }

  deleteOffre(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/offres/${id}`);
  }

  publierOffre(id: number): Observable<OffreEmploi> {
    return this.http.post<OffreEmploi>(`${this.apiUrl}/offres/${id}/publier`, {});
  }

  fermerOffre(id: number): Observable<OffreEmploi> {
    return this.http.post<OffreEmploi>(`${this.apiUrl}/offres/${id}/fermer`, {});
  }

  // Gestion des candidatures
  getCandidatures(offreId?: number): Observable<Candidature[]> {
    let params = new HttpParams();
    if (offreId) {
      params = params.set('offreId', offreId.toString());
    }
    return this.http.get<Candidature[]>(`${this.apiUrl}/candidatures`, { params });
  }

  getCandidature(id: number): Observable<Candidature> {
    return this.http.get<Candidature>(`${this.apiUrl}/candidatures/${id}`);
  }

  createCandidature(candidature: CandidatureRequest): Observable<Candidature> {
    const formData = new FormData();
    Object.keys(candidature).forEach(key => {
      const value = (candidature as any)[key];
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    return this.http.post<Candidature>(`${this.apiUrl}/candidatures`, formData);
  }

  updateStatutCandidature(id: number, statut: string, note?: string): Observable<Candidature> {
    return this.http.put<Candidature>(`${this.apiUrl}/candidatures/${id}/statut`, { statut, note });
  }

  planifierEntretien(id: number, dateEntretien: Date): Observable<Candidature> {
    return this.http.post<Candidature>(`${this.apiUrl}/candidatures/${id}/entretien`, { dateEntretien });
  }

  ajouterEvaluation(candidatureId: number, evaluation: Omit<EvaluationCandidat, 'id' | 'candidatureId' | 'dateEvaluation'>): Observable<EvaluationCandidat> {
    return this.http.post<EvaluationCandidat>(`${this.apiUrl}/candidatures/${candidatureId}/evaluations`, evaluation);
  }
}
