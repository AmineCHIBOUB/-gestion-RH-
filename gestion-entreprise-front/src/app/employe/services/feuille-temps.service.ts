import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { FeuilleTemps, SaisieTemps, StatutFeuilleTemps, TempsStats } from '../models/feuille-temps.model';

@Injectable({
  providedIn: 'root'
})
export class FeuilleTempsService {
  private apiUrl = `${environment.apiUrl}/feuilles-temps`;

  constructor(private http: HttpClient) {}

  // Obtenir mes feuilles de temps
  getMesFeuillesTemps(page: number = 1, limit: number = 10, annee?: number, statut?: StatutFeuilleTemps): Observable<{feuilles: FeuilleTemps[], total: number}> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (annee) {
      params = params.set('annee', annee.toString());
    }
    if (statut) {
      params = params.set('statut', statut);
    }

    return this.http.get<{feuilles: FeuilleTemps[], total: number}>(`${this.apiUrl}/me`, { params });
  }

  // Obtenir une feuille de temps spécifique
  // ✅ AJOUTER cette méthode manquante après la ligne 50
  getFeuilleById(id: string): Observable<FeuilleTemps> {
    return this.http.get<FeuilleTemps>(`${this.apiUrl}/${id}`);
  }

  // Obtenir la feuille de temps pour une semaine donnée
  getFeuilleParSemaine(annee: number, semaine: number): Observable<FeuilleTemps | null> {
    const params = new HttpParams()
      .set('annee', annee.toString())
      .set('semaine', semaine.toString());

    return this.http.get<FeuilleTemps | null>(`${this.apiUrl}/me/semaine`, { params });
  }

  // Créer une nouvelle feuille de temps
  creerFeuilleTemps(saisie: SaisieTemps): Observable<FeuilleTemps> {
    return this.http.post<FeuilleTemps>(`${this.apiUrl}/me`, saisie);
  }

  // Mettre à jour une feuille de temps
  mettreAJourFeuilleTemps(id: number, saisie: Partial<SaisieTemps>): Observable<FeuilleTemps> {
    return this.http.put<FeuilleTemps>(`${this.apiUrl}/${id}`, saisie);
  }

  // Soumettre une feuille de temps pour validation
  soumettreFeuilleTemps(id: number): Observable<FeuilleTemps> {
    return this.http.post<FeuilleTemps>(`${this.apiUrl}/${id}/soumettre`, {});
  }

  // Supprimer une feuille de temps (si brouillon)
  supprimerFeuilleTemps(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Obtenir les statistiques de temps
  getStatsTemps(annee?: number, mois?: number): Observable<TempsStats> {
    let params = new HttpParams();
    
    if (annee) {
      params = params.set('annee', annee.toString());
    }
    if (mois) {
      params = params.set('mois', mois.toString());
    }

    return this.http.get<TempsStats>(`${this.apiUrl}/me/stats`, { params });
  }

  // Obtenir les projets disponibles
  getProjetsDisponibles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/projets`);
  }

  // Calculer les heures pour une journée
  calculerHeuresJour(heureDebut: string, heureFin: string, pauseMinutes: number = 0): number {
    const debut = new Date(`2000-01-01T${heureDebut}:00`);
    const fin = new Date(`2000-01-01T${heureFin}:00`);
    
    const diffMs = fin.getTime() - debut.getTime();
    const diffHeures = diffMs / (1000 * 60 * 60);
    
    return Math.max(0, diffHeures - (pauseMinutes / 60));
  }

  // Obtenir le numéro de semaine pour une date
  getNumeroSemaine(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
