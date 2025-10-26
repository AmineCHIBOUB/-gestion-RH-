import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Fichier } from '../models/fichier.model';

@Injectable({
  providedIn: 'root'
})
export class FichierService {
  private apiUrl = `${environment.apiUrl}/fichiers`;

  constructor(private http: HttpClient) {}

  // ✅ Obtenir mes fichiers (route Laravel: GET /fichiers/my-files)
  getMesFichiers(page: number = 1, limit: number = 10): Observable<{data: Fichier[], total: number}> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', limit.toString());
    
    return this.http.get<{data: Fichier[], total: number}>(`${this.apiUrl}/my-files`, { params });
  }

  // ✅ Uploader un fichier (route Laravel: POST /fichiers/upload)
  uploadFichier(file: File, description?: string): Observable<Fichier> {
    const formData = new FormData();
    formData.append('fichier', file);
    if (description) {
      formData.append('description', description);
    }
    
    return this.http.post<Fichier>(`${this.apiUrl}/upload`, formData);
  }

  // ✅ Télécharger un fichier (route Laravel: GET /fichiers/{id}/download)
  downloadFichier(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }

  // ✅ Supprimer un fichier (route Laravel: DELETE /fichiers/{fichier})
  supprimerFichier(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ✅ Obtenir un fichier spécifique (route Laravel: GET /fichiers/{fichier})
  getFichier(id: number): Observable<Fichier> {
    return this.http.get<Fichier>(`${this.apiUrl}/${id}`);
  }

  // ✅ Mettre à jour un fichier (route Laravel: PUT /fichiers/{fichier})
  updateFichier(id: number, data: Partial<Fichier>): Observable<Fichier> {
    return this.http.put<Fichier>(`${this.apiUrl}/${id}`, data);
  }

  // ✅ Rechercher des fichiers (route Laravel: GET /fichiers/search)
  searchFichiers(query: string): Observable<Fichier[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Fichier[]>(`${this.apiUrl}/search`, { params });
  }
}
