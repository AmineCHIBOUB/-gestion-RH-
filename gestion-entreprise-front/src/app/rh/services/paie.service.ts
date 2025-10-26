import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ElementVariable, 
  ElementVariableRequest, 
  PreparationPaie, 
  PreparationPaieRequest,
  ElementPaie,
  ElementPaieRequest,
  PaieFilter
} from '../models/paie.model';
import { ElementCalculPaie, CalculPaie } from '../models/calcul-paie.model';

@Injectable({
  providedIn: 'root'
})
export class PaieService {
  private apiUrl = `${environment.apiUrl}/rh/paie`;

  constructor(private http: HttpClient) {}

  getElementsPaie(filter?: PaieFilter): Observable<ElementPaie[]> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<ElementPaie[]>(this.apiUrl, { params });
  }

  getElementPaie(id: number): Observable<ElementPaie> {
    return this.http.get<ElementPaie>(`${this.apiUrl}/${id}`);
  }

  createElementPaie(element: ElementPaieRequest): Observable<ElementPaie> {
    return this.http.post<ElementPaie>(this.apiUrl, element);
  }

  updateElementPaie(id: number, element: Partial<ElementPaieRequest>): Observable<ElementPaie> {
    return this.http.put<ElementPaie>(`${this.apiUrl}/${id}`, element);
  }

  calculerElementPaie(id: number): Observable<ElementPaie> {
    return this.http.post<ElementPaie>(`${this.apiUrl}/${id}/calculer`, {});
  }

  validerPaie(id: number): Observable<ElementPaie> {
    return this.http.post<ElementPaie>(`${this.apiUrl}/${id}/valider`, {});
  }

  genererBulletin(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/bulletin`, {
      responseType: 'blob'
    });
  }

  exportPaie(periode: string, format: 'excel' | 'pdf' = 'excel'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      params: { periode, format },
      responseType: 'blob'
    });
  }

  preparerPaieMasse(periode: string, departement?: string): Observable<any> {
    let params = new HttpParams().set('periode', periode);
    if (departement) {
      params = params.set('departement', departement);
    }
    return this.http.post(`${this.apiUrl}/preparer-masse`, {}, { params });
  }

  obtenirElementsPaie(employeId: string, mois: number, annee: number): Observable<ElementCalculPaie[]> {
    const params = new HttpParams()
      .set('employeId', employeId)
      .set('mois', mois.toString())
      .set('annee', annee.toString());
    return this.http.get<ElementCalculPaie[]>(`${this.apiUrl}/elements`, { params });
  }

  calculerPaie(donneesCalcul: any): Observable<CalculPaie> {
    return this.http.post<CalculPaie>(`${this.apiUrl}/calculer`, donneesCalcul);
  }

  sauvegarderCalcul(calcul: CalculPaie): Observable<CalculPaie> {
    return this.http.post<CalculPaie>(`${this.apiUrl}/sauvegarder`, calcul);
  }

  genererBulletinFromCalcul(calcul: CalculPaie): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/bulletin`, calcul, {
      responseType: 'blob'
    });
  }

  // Ajouter ces méthodes manquantes
  getElementsVariables(filter?: any): Observable<ElementVariable[]> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = filter[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<ElementVariable[]>(`${this.apiUrl}/elements-variables`, { params });
  }

  creerElementVariable(element: any): Observable<ElementVariable> {
    return this.http.post<ElementVariable>(`${this.apiUrl}/elements-variables`, element);
  }

  modifierElementVariable(id: number, element: any): Observable<ElementVariable> {
    return this.http.put<ElementVariable>(`${this.apiUrl}/elements-variables/${id}`, element);
  }

  supprimerElementVariable(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/elements-variables/${id}`);
  }

  exporterElementsVariables(filter?: any): Observable<Blob> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = filter[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get(`${this.apiUrl}/elements-variables/export`, {
      params,
      responseType: 'blob'
    });
  }

  // Ajouter ces méthodes manquantes
  getExportHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/export/history`);
  }

  exporterPaie(exportData: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export`, exportData, {
      responseType: 'blob'
    });
  }

  previewExport(exportData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/export/preview`, exportData);
  }

  retelechargerExport(exportId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${exportId}/download`, {
      responseType: 'blob'
    });
  }

  // Ajouter ces méthodes pour la gestion des calculs de paie
  getCalculsPaie(filter?: any): Observable<{data: CalculPaie[], total: number}> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = filter[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<{data: CalculPaie[], total: number}>(`${this.apiUrl}/calculs`, { params });
  }

  recalculerPaie(calculId: number): Observable<CalculPaie> {
    return this.http.post<CalculPaie>(`${this.apiUrl}/calculs/${calculId}/recalculer`, {});
  }

  validerCalculPaie(calculId: number): Observable<CalculPaie> {
    return this.http.post<CalculPaie>(`${this.apiUrl}/calculs/${calculId}/valider`, {});
  }

  exportCalculsPaie(filter?: any): Observable<Blob> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = filter[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get(`${this.apiUrl}/calculs/export`, {
      params,
      responseType: 'blob'
    });
  }

  // Méthodes pour la préparation de paie
  getPreparationPaie(filtres: any): Observable<PreparationPaie[]> {
    let params = new HttpParams();
    if (filtres) {
      Object.keys(filtres).forEach(key => {
        const value = filtres[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<PreparationPaie[]>(`${this.apiUrl}/preparation`, { params });
  }

  getStatistiquesPreparation(filtres: any): Observable<any> {
    let params = new HttpParams();
    if (filtres) {
      Object.keys(filtres).forEach(key => {
        const value = filtres[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<any>(`${this.apiUrl}/preparation/statistiques`, { params });
  }

  getEtapesPreparation(filtres: any): Observable<any[]> {
    let params = new HttpParams();
    if (filtres) {
      Object.keys(filtres).forEach(key => {
        const value = filtres[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<any[]>(`${this.apiUrl}/preparation/etapes`, { params });
  }

  calculerPaieEmploye(employeId: number, periode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/preparation/calculer-employe`, {
      employeId,
      periode
    });
  }

  calculerPaieTous(periode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/preparation/calculer-tous`, {
      periode
    });
  }

  validerPreparationPaie(periode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/preparation/valider`, {
      periode
    });
  }

  reinitialiserPreparationPaie(periode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/preparation/reinitialiser`, {
      periode
    });
  }
}
