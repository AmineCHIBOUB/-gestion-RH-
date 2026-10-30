import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Presence, 
  PresenceRequest, 
  PresenceFilter, 
  FeuilleTemps,
  ImportResult,
  AjustementPresence,
  AjustementPresenceRequest
} from '../models/presence.model';
import { Employe } from '../models/employe.model';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private apiUrl = `${environment.apiUrl}/rh/presences`;

  constructor(private http: HttpClient) {}

  // Méthode principale pour récupérer les présences
  getPresences(params: any): Observable<{ data: Presence[], total: number, page: number }> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    return this.http.get<{ data: Presence[], total: number, page: number }>(`${this.apiUrl}`, { params: httpParams });
  }

  getPresence(id: number): Observable<Presence> {
    return this.http.get<Presence>(`${this.apiUrl}/${id}`);
  }

  createPresence(presence: PresenceRequest): Observable<Presence> {
    return this.http.post<Presence>(this.apiUrl, presence);
  }

  updatePresence(id: number, presence: Partial<PresenceRequest>): Observable<Presence> {
    return this.http.put<Presence>(`${this.apiUrl}/${id}`, presence);
  }

  deletePresence(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getFeuillesTemps(employeId?: number, semaine?: number, annee?: number): Observable<FeuilleTemps[]> {
    let params = new HttpParams();
    if (employeId) params = params.set('employe_id', employeId.toString());
    if (semaine) params = params.set('semaine', semaine.toString());
    if (annee) params = params.set('annee', annee.toString());
    return this.http.get<FeuilleTemps[]>(`${this.apiUrl}/feuilles-temps`, { params });
  }

  validerFeuilleTemps(id: number): Observable<FeuilleTemps> {
    return this.http.put<FeuilleTemps>(`${this.apiUrl}/feuilles-temps/${id}/valider`, {});
  }

  exportPresences(filter?: PresenceFilter, format: 'excel' | 'pdf' = 'excel'): Observable<Blob> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    params = params.set('format', format);
    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  importPresences(formData: FormData): Observable<ImportResult> {
    return this.http.post<ImportResult>(`${this.apiUrl}/import`, formData);
  }

  previewImport(formData: FormData): Observable<{preview: any[]}> {
    return this.http.post<{preview: any[]}>(`${this.apiUrl}/import/preview`, formData);
  }

  downloadImportTemplate(type: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/import/template`, {
      params: { type },
      responseType: 'blob'
    });
  }

  importFromPointeuse(config: any): Observable<ImportResult> {
    return this.http.post<ImportResult>(`${this.apiUrl}/import/pointeuse`, config);
  }

  // Méthode pour obtenir la présence du jour
  getPresenceAujourdhui(employeId: number): Observable<Presence | null> {
    return this.http.get<Presence | null>(`${environment.apiUrl}/pointages/employee/${employeId}`, {
      params: { date: new Date().toISOString().split('T')[0] }
    });
  }

  // Méthode pour enregistrer un pointage
  enregistrerPointage(pointageData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/pointages`, pointageData);
  }

  importerPresencesPourPaie(periode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/import-paie`, {
      periode
    });
  }
  
  // Méthodes pour la gestion des ajustements
  getAjustements(filter?: any): Observable<AjustementPresence[]> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = filter[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<AjustementPresence[]>(`${this.apiUrl}/ajustements`, { params });
  }

  getAjustementsStatistics(filter?: any): Observable<any> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = filter[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<any>(`${this.apiUrl}/ajustements/statistics`, { params });
  }

  createAjustement(ajustement: AjustementPresenceRequest): Observable<AjustementPresence> {
    return this.http.post<AjustementPresence>(`${this.apiUrl}/ajustements`, ajustement);
  }

  updateAjustement(id: number, ajustement: Partial<AjustementPresenceRequest>): Observable<AjustementPresence> {
    return this.http.put<AjustementPresence>(`${this.apiUrl}/ajustements/${id}`, ajustement);
  }

  approuverAjustement(id: number): Observable<AjustementPresence> {
    return this.http.put<AjustementPresence>(`${this.apiUrl}/ajustements/${id}/approuver`, {});
  }

  rejeterAjustement(id: number): Observable<AjustementPresence> {
    return this.http.put<AjustementPresence>(`${this.apiUrl}/ajustements/${id}/rejeter`, {});
  }

  deleteAjustement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/ajustements/${id}`);
  }

  exportAjustements(filter?: any): Observable<Blob> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = filter[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get(`${this.apiUrl}/ajustements/export`, {
      params,
      responseType: 'blob'
    });
  }

  getEmployes(): Observable<Employe[]> {
    return this.http.get<Employe[]>(`${this.apiUrl}/employes`);
  }

  getFeuillesTempsStatistics(filter?: any): Observable<any> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = filter[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<any>(`${this.apiUrl}/feuilles-temps/statistics`, { params });
  }

  createFeuilleTemps(feuille: any): Observable<FeuilleTemps> {
    return this.http.post<FeuilleTemps>(`${this.apiUrl}/feuilles-temps`, feuille);
  }

  updateFeuilleTemps(id: number, feuille: any): Observable<FeuilleTemps> {
    return this.http.put<FeuilleTemps>(`${this.apiUrl}/feuilles-temps/${id}`, feuille);
  }

  rejeterFeuilleTemps(id: number): Observable<FeuilleTemps> {
    return this.http.put<FeuilleTemps>(`${this.apiUrl}/feuilles-temps/${id}/rejeter`, {});
  }

  deleteFeuilleTemps(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/feuilles-temps/${id}`);
  }

  exportFeuillesTemps(filter?: any): Observable<Blob> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = filter[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get(`${this.apiUrl}/feuilles-temps/export`, {
      params,
      responseType: 'blob'
    });
  }

  generateFeuilleTempsAutomatique(employeId: number, dateDebut: string, dateFin: string): Observable<FeuilleTemps> {
    return this.http.post<FeuilleTemps>(`${this.apiUrl}/feuilles-temps/generate`, {
      employe_id: employeId,
      date_debut: dateDebut,
      date_fin: dateFin
    });
  }

  // Méthode séparée pour les filtres simples
  getPresencesList(filter?: PresenceFilter): Observable<Presence[]> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<Presence[]>(`${this.apiUrl}/list`, { params });
  }

  getDepartements(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/departements`);
  }
}
