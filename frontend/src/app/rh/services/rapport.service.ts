import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  RapportRH, 
  RapportEffectifs, 
  RapportAbsences, 
  RapportConges, 
  RapportPaie,
  PeriodeRapport
} from '../models/rapport.model';

@Injectable({
  providedIn: 'root'
})
export class RapportService {
  private apiUrl = `${environment.apiUrl}/rh/rapports`;

  constructor(private http: HttpClient) {}

  getRapports(): Observable<RapportRH[]> {
    return this.http.get<RapportRH[]>(this.apiUrl);
  }

  getRapport(id: number): Observable<RapportRH> {
    return this.http.get<RapportRH>(`${this.apiUrl}/${id}`);
  }

  genererRapportEffectifs(periode: PeriodeRapport): Observable<RapportEffectifs> {
    return this.http.post<RapportEffectifs>(`${this.apiUrl}/effectifs`, periode);
  }

  genererRapportAbsences(periode: PeriodeRapport): Observable<RapportAbsences> {
    return this.http.post<RapportAbsences>(`${this.apiUrl}/absences`, periode);
  }

  genererRapportConges(periode: PeriodeRapport): Observable<RapportConges> {
    return this.http.post<RapportConges>(`${this.apiUrl}/conges`, periode);
  }

  genererRapportPaie(periode: PeriodeRapport): Observable<RapportPaie> {
    return this.http.post<RapportPaie>(`${this.apiUrl}/paie`, periode);
  }

  exporterRapport(id: number, format: 'pdf' | 'excel' = 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/export`, {
      params: { format },
      responseType: 'blob'
    });
  }

  archiverRapport(id: number): Observable<RapportRH> {
    return this.http.post<RapportRH>(`${this.apiUrl}/${id}/archiver`, {});
  }

  // Méthode manquante pour les rapports RH généraux
  getRapportRH(filtres: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get<any>(`${this.apiUrl}/rh-general`, { params });
  }

  // Méthodes pour les rapports de présence
  getStatistiquesPresence(filtres: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get<any>(`${this.apiUrl}/presences/statistiques`, { params });
  }

  getRapportPresences(filtres: any): Observable<{ data: any[], total: number }> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get<{ data: any[], total: number }>(`${this.apiUrl}/presences`, { params });
  }

  getEvolutionPresences(filtres: any): Observable<any[]> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get<any[]>(`${this.apiUrl}/presences/evolution`, { params });
  }

  getDistributionPresences(filtres: any): Observable<any[]> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get<any[]>(`${this.apiUrl}/presences/distribution`, { params });
  }

  getRetardsParDepartement(filtres: any): Observable<any[]> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get<any[]>(`${this.apiUrl}/presences/retards-departement`, { params });
  }

  exporterRapportPresences(filtres: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filtres).forEach(key => {
      if (filtres[key] !== null && filtres[key] !== undefined && filtres[key] !== '') {
        params = params.set(key, filtres[key]);
      }
    });
    return this.http.get(`${this.apiUrl}/presences/export`, {
      params,
      responseType: 'blob'
    });
  }

  // Ajouter ces méthodes manquantes :
  getRapportAbsences(filters: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<any>(`${this.apiUrl}/absences`, { params });
  }

  exportRapportAbsencesPDF(filters: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get(`${this.apiUrl}/absences/export/pdf`, {
      params,
      responseType: 'blob'
    });
  }

  exportRapportAbsencesExcel(filters: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get(`${this.apiUrl}/absences/export/excel`, {
      params,
      responseType: 'blob'
    });
  }
}
