import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StatistiquesPaie, RapportPaie, EvolutionPaie, RepartitionPaie } from '../models/rapport-paie.model';

@Injectable({
  providedIn: 'root'
})
export class RapportsService {
  private apiUrl = `${environment.apiUrl}/rh/rapports`;

  constructor(private http: HttpClient) {}

  // Rapports de paie
  getStatistiquesPaie(filtres: any): Observable<StatistiquesPaie> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get<StatistiquesPaie>(`${this.apiUrl}/paie/statistiques`, { params });
  }

  getRapportsPaie(filtres: any): Observable<{ data: RapportPaie[], total: number }> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get<{ data: RapportPaie[], total: number }>(`${this.apiUrl}/paie`, { params });
  }

  getEvolutionPaie(filtres: any): Observable<EvolutionPaie> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get<EvolutionPaie>(`${this.apiUrl}/paie/evolution`, { params });
  }

  getRepartitionPaieDepartements(filtres: any): Observable<RepartitionPaie> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get<RepartitionPaie>(`${this.apiUrl}/paie/repartition/departements`, { params });
  }

  getRepartitionPaieCategories(filtres: any): Observable<RepartitionPaie> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get<RepartitionPaie>(`${this.apiUrl}/paie/repartition/categories`, { params });
  }

  exporterRapportPaiePDF(filtres: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get(`${this.apiUrl}/paie/export/pdf`, { 
      params, 
      responseType: 'blob' 
    });
  }

  exporterRapportPaieExcel(filtres: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get(`${this.apiUrl}/paie/export/excel`, { 
      params, 
      responseType: 'blob' 
    });
  }

  // Rapports d'effectifs
  getStatistiquesEffectifs(filtres: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get<any>(`${this.apiUrl}/effectifs/statistiques`, { params });
  }

  getRapportsEffectifs(filtres: any): Observable<{ data: any[], total: number }> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get<{ data: any[], total: number }>(`${this.apiUrl}/effectifs`, { params });
  }

  // Rapports de congés
  getStatistiquesConges(filtres: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get<any>(`${this.apiUrl}/conges/statistiques`, { params });
  }

  getRapportsConges(filtres: any): Observable<{ data: any[], total: number }> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get<{ data: any[], total: number }>(`${this.apiUrl}/conges`, { params });
  }
}
