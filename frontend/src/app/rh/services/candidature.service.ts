import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidature, CandidatureRequest, CandidatureFilter, CandidatureResponse, EtapeSuivi, StatutCandidature } from '../models/candidature.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CandidatureService {
  private apiUrl = `${environment.apiUrl}/candidatures`;

  constructor(private http: HttpClient) {}

  // Récupérer toutes les candidatures avec filtres
  getCandidatures(filters?: CandidatureFilter): Observable<CandidatureResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.search) {
        params = params.set('search', filters.search);
      }
      if (filters.posteId) {
        params = params.set('poste_id', filters.posteId.toString());
      }
      if (filters.statut) {
        params = params.set('statut', filters.statut);
      }
      if (filters.dateDebut) {
        params = params.set('date_debut', filters.dateDebut.toISOString());
      }
      if (filters.dateFin) {
        params = params.set('date_fin', filters.dateFin.toISOString());
      }
      if (filters.departementId) {
        params = params.set('departement_id', filters.departementId.toString());
      }
    }

    return this.http.get<CandidatureResponse>(this.apiUrl, { params });
  }

  // Récupérer une candidature par ID
  getCandidature(id: number): Observable<Candidature> {
    return this.http.get<Candidature>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle candidature
  createCandidature(candidature: CandidatureRequest): Observable<Candidature> {
    return this.http.post<Candidature>(this.apiUrl, candidature);
  }

  // Mettre à jour une candidature
  updateCandidature(id: number, candidature: Partial<CandidatureRequest>): Observable<Candidature> {
    return this.http.put<Candidature>(`${this.apiUrl}/${id}`, candidature);
  }

  // Supprimer une candidature
  deleteCandidature(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Changer le statut d'une candidature
  changerStatut(id: number, statut: string, commentaire?: string): Observable<Candidature> {
    const body = { statut, commentaire };
    return this.http.patch<Candidature>(`${this.apiUrl}/${id}/statut`, body);
  }

  // Ajouter une étape de suivi
  ajouterEtapeSuivi(candidatureId: number, etape: Omit<EtapeSuivi, 'id' | 'candidatureId' | 'createdAt'>): Observable<EtapeSuivi> {
    return this.http.post<EtapeSuivi>(`${this.apiUrl}/${candidatureId}/etapes`, etape);
  }

  // Récupérer les étapes de suivi d'une candidature
  getEtapesSuivi(candidatureId: number): Observable<EtapeSuivi[]> {
    return this.http.get<EtapeSuivi[]>(`${this.apiUrl}/${candidatureId}/etapes`);
  }

  // Mettre à jour une étape de suivi
  updateEtapeSuivi(candidatureId: number, etapeId: number, etape: Partial<EtapeSuivi>): Observable<EtapeSuivi> {
    return this.http.put<EtapeSuivi>(`${this.apiUrl}/${candidatureId}/etapes/${etapeId}`, etape);
  }

  // Supprimer une étape de suivi
  deleteEtapeSuivi(candidatureId: number, etapeId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${candidatureId}/etapes/${etapeId}`);
  }

  // Récupérer les candidatures par poste
  getCandidaturesByPoste(posteId: number): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.apiUrl}/poste/${posteId}`);
  }

  // Récupérer les statistiques des candidatures
  getStatistiques(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistiques`);
  }

  // Télécharger le CV d'un candidat
  telechargerCV(candidatureId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${candidatureId}/cv`, {
      responseType: 'blob'
    });
  }

  // Télécharger la lettre de motivation
  telechargerLettreMotivation(candidatureId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${candidatureId}/lettre-motivation`, {
      responseType: 'blob'
    });
  }

  // Planifier un entretien
  planifierEntretien(candidatureId: number, entretien: {
    date: Date;
    heure: string;
    lieu: string;
    type: 'physique' | 'visio' | 'telephonique';
    intervieweurs: number[];
    commentaires?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${candidatureId}/entretien`, entretien);
  }

  // Envoyer un email au candidat
  envoyerEmail(candidatureId: number, email: {
    sujet: string;
    message: string;
    template?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${candidatureId}/email`, email);
  }

  // Archiver une candidature
  archiverCandidature(id: number): Observable<Candidature> {
    return this.http.patch<Candidature>(`${this.apiUrl}/${id}/archiver`, {});
  }

  // Restaurer une candidature archivée
  restaurerCandidature(id: number): Observable<Candidature> {
    return this.http.patch<Candidature>(`${this.apiUrl}/${id}/restaurer`, {});
  }

  // Exporter les candidatures
  exporterCandidatures(filters?: CandidatureFilter): Observable<Blob> {
    let params = new HttpParams();
    
    if (filters) {
      // Ajouter les filtres aux paramètres
    }
    
    return this.http.get(`${this.apiUrl}/export`, { 
      params, 
      responseType: 'blob' 
    });
  }
}
