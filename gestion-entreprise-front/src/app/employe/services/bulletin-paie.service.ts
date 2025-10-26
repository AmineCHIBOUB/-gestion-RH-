import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { BulletinPaie, BulletinSummary, StatutBulletin } from '../models/bulletin-paie.model';

// Interface pour les statistiques annuelles
export interface StatsAnnuelles {
  totalBrut: number;
  totalNet: number;
  moyenneBrut: number;
  moyenneNet: number;
  nombreBulletins: number;
}

@Injectable({
  providedIn: 'root'
})
export class BulletinPaieService {
  // CHANGE THIS:
  // private apiUrl = `${environment.apiUrl}/bulletins-paie`;
  
  // TO THIS:
  private apiUrl = `${environment.apiUrl}/bulletins`;

  constructor(private http: HttpClient) {}

  // Obtenir mes bulletins de paie (résumé)
  // Type de retour spécifique
  getMesBulletins(page: number = 1, limit: number = 12, annee?: number): Observable<{bulletins: BulletinSummary[], total: number}> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (annee) {
      params = params.set('annee', annee.toString());
    }

    // CHANGE FROM /me TO /my-bulletins:
    return this.http.get<{bulletins: BulletinSummary[], total: number}>(`${this.apiUrl}/my-bulletins`, { params });
  }

  // Obtenir un bulletin de paie détaillé
  getBulletin(id: number): Observable<BulletinPaie> {
    return this.http.get<BulletinPaie>(`${this.apiUrl}/${id}`);
  }

  // Télécharger un bulletin de paie en PDF
  downloadBulletinPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { 
      responseType: 'blob',
      headers: { 'Accept': 'application/pdf' }
    });
  }

  // Marquer un bulletin comme consulté
  // Type de retour spécifique
  marquerCommeConsulte(id: number): Observable<{success: boolean, bulletin?: BulletinPaie}> {
    return this.http.post<{success: boolean, bulletin?: BulletinPaie}>(`${this.apiUrl}/${id}/consulte`, {});
  }

  // Obtenir les années disponibles
  getAnneesDisponibles(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/me/annees`);
  }

  // Rechercher des bulletins
  rechercherBulletins(criteres: {
    annee?: number;
    mois?: number;
    salaireMin?: number;
    salaireMax?: number;
  }): Observable<BulletinSummary[]> {
    let params = new HttpParams();
    
    Object.keys(criteres).forEach(key => {
      // Dans la méthode de recherche :
      // Type casting corrigé
      const value = (criteres as Record<string, unknown>)[key]; // ✅ Au lieu de (criteres as any)[key]
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<BulletinSummary[]>(`${this.apiUrl}/me/recherche`, { params });
  }

  // Ajouter cette méthode manquante
  getBulletins(annee?: number): Observable<{bulletins: BulletinSummary[], total: number}> {
    return this.getMesBulletins(1, 12, annee);
  }

  // ✅ Méthodes unifiées - garder seulement ces versions
  getBulletinDetail(id: number): Observable<BulletinPaie> {
    return this.http.get<BulletinPaie>(`${this.apiUrl}/${id}`);
  }

  downloadBulletin(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  getStatsAnnuelles(annee: number): Observable<StatsAnnuelles> {
    return this.http.get<StatsAnnuelles>(`${this.apiUrl}/stats/${annee}`);
  }
}
