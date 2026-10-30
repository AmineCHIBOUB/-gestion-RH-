import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Annonce, TypeAnnonce, PrioriteAnnonce, AnnonceStats } from '../models/annonce.model';

@Injectable({
  providedIn: 'root'
})
export class AnnonceService {
  private apiUrl = `${environment.apiUrl}/annonces`;

  constructor(private http: HttpClient) {}

  // Obtenir les annonces accessibles à l'employé
  getAnnonces(page: number = 1, limit: number = 10, type?: TypeAnnonce, priorite?: PrioriteAnnonce, nonLuesSeules: boolean = false): Observable<{annonces: Annonce[], total: number}> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (type) {
      params = params.set('type', type);
    }
    if (priorite) {
      params = params.set('priorite', priorite);
    }
    if (nonLuesSeules) {
      params = params.set('nonLuesSeules', 'true');
    }

    return this.http.get<{annonces: Annonce[], total: number}>(`${this.apiUrl}/me`, { params });
  }

  // Obtenir une annonce spécifique
  getAnnonce(id: number): Observable<Annonce> {
    return this.http.get<Annonce>(`${this.apiUrl}/${id}`);
  }

  // Marquer une annonce comme lue - Correction du type de retour
  marquerCommeLue(id: number): Observable<{success: boolean}> {
    return this.http.post<{success: boolean}>(`${this.apiUrl}/${id}/lue`, {});
  }

  // Télécharger le fichier joint d'une annonce
  downloadFichierJoint(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/fichier`, { 
      responseType: 'blob'
    });
  }

  // Rechercher des annonces
  rechercherAnnonces(terme: string, type?: TypeAnnonce, priorite?: PrioriteAnnonce): Observable<Annonce[]> {
    let params = new HttpParams().set('q', terme);
    
    if (type) {
      params = params.set('type', type);
    }
    if (priorite) {
      params = params.set('priorite', priorite);
    }

    return this.http.get<Annonce[]>(`${this.apiUrl}/me/recherche`, { params });
  }

  // Obtenir les statistiques des annonces
  getStatsAnnonces(): Observable<AnnonceStats> {
    return this.http.get<AnnonceStats>(`${this.apiUrl}/me/stats`);
  }

  // Obtenir les annonces urgentes non lues
  getAnnoncesUrgentes(): Observable<Annonce[]> {
    return this.http.get<Annonce[]>(`${this.apiUrl}/me/urgentes`);
  }

  // Marquer toutes les annonces comme lues - Correction du type de retour
  marquerToutesCommeLues(): Observable<{success: boolean, count: number}> {
    return this.http.post<{success: boolean, count: number}>(`${this.apiUrl}/me/marquer-toutes-lues`, {});
  }
}
