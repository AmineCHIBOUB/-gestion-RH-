import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Poste, PosteRequest, PosteFilter, PosteUpdateRequest } from '../models/poste.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PosteService {
  private apiUrl = `${environment.apiUrl}/postes`;

  constructor(private http: HttpClient) {}

  // Récupérer tous les postes avec filtres
  getPostes(filters?: PosteFilter): Observable<Poste[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.search) {
        params = params.set('search', filters.search);
      }
      if (filters.departementId) {
        params = params.set('departement_id', filters.departementId.toString());
      }
      if (filters.typeContrat) {
        params = params.set('type_contrat', filters.typeContrat);
      }
      if (filters.statut) {
        params = params.set('statut', filters.statut);
      }
      if (filters.salaireMin) {
        params = params.set('salaire_min', filters.salaireMin.toString());
      }
      if (filters.salaireMax) {
        params = params.set('salaire_max', filters.salaireMax.toString());
      }
    }

    return this.http.get<Poste[]>(this.apiUrl, { params });
  }

  // Récupérer un poste par ID
  getPoste(id: number): Observable<Poste> {
    return this.http.get<Poste>(`${this.apiUrl}/${id}`);
  }

  // Créer un nouveau poste
  createPoste(poste: PosteRequest): Observable<Poste> {
    return this.http.post<Poste>(this.apiUrl, poste);
  }

  // Mettre à jour un poste
  updatePoste(id: number, poste: PosteUpdateRequest): Observable<Poste> {
    return this.http.put<Poste>(`${this.apiUrl}/${id}`, poste);
  }

  // Supprimer un poste
  deletePoste(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Publier un poste
  publierPoste(id: number): Observable<Poste> {
    return this.http.patch<Poste>(`${this.apiUrl}/${id}/publier`, {});
  }

  // Fermer un poste
  fermerPoste(id: number): Observable<Poste> {
    return this.http.patch<Poste>(`${this.apiUrl}/${id}/fermer`, {});
  }

  // Marquer un poste comme pourvu
  marquerPourvu(id: number): Observable<Poste> {
    return this.http.patch<Poste>(`${this.apiUrl}/${id}/pourvu`, {});
  }

  // Récupérer les statistiques des postes
  getStatistiques(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistiques`);
  }

  // Récupérer les postes par département
  getPostesByDepartement(departementId: number): Observable<Poste[]> {
    return this.http.get<Poste[]>(`${this.apiUrl}/departement/${departementId}`);
  }

  // Dupliquer un poste
  dupliquerPoste(id: number): Observable<Poste> {
    return this.http.post<Poste>(`${this.apiUrl}/${id}/dupliquer`, {});
  }

  // Archiver un poste
  archiverPoste(id: number): Observable<Poste> {
    return this.http.patch<Poste>(`${this.apiUrl}/${id}/archiver`, {});
  }

  // Restaurer un poste archivé
  restaurerPoste(id: number): Observable<Poste> {
    return this.http.patch<Poste>(`${this.apiUrl}/${id}/restaurer`, {});
  }
}
