import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Document, TypeDocument, DocumentStats } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  // Obtenir les documents accessibles à l'employé
  getDocuments(page: number = 1, limit: number = 10, type?: TypeDocument, nonLusSeuls: boolean = false): Observable<{documents: Document[], total: number}> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (type) {
      params = params.set('type', type);
    }
    if (nonLusSeuls) {
      params = params.set('nonLusSeuls', 'true');
    }

    return this.http.get<{documents: Document[], total: number}>(`${this.apiUrl}/me`, { params });
  }

  // Obtenir un document spécifique
  getDocument(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`);
  }

  // Télécharger un document
  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { 
      responseType: 'blob'
    });
  }

  // Ajouter la méthode manquante getDocumentUrl
  getDocumentUrl(id: number): Observable<string> {
    return this.http.get<{url: string}>(`${this.apiUrl}/${id}/url`)
      .pipe(
        map(response => response.url)
      );
  }

  // Marquer un document comme lu
  marquerCommeLu(id: number): Observable<{success: boolean}> {
    return this.http.post<{success: boolean}>(`${this.apiUrl}/${id}/lu`, {});
  }

  // Rechercher des documents
  rechercherDocuments(terme: string, type?: TypeDocument): Observable<Document[]> {
    let params = new HttpParams().set('q', terme);
    
    if (type) {
      params = params.set('type', type);
    }

    return this.http.get<Document[]>(`${this.apiUrl}/me/recherche`, { params });
  }

  // Obtenir les statistiques des documents - méthode corrigée
  getDocumentStats(): Observable<DocumentStats> {
    return this.http.get<DocumentStats>(`${this.apiUrl}/me/stats`);
  }

  // Obtenir les types de documents disponibles
  getTypesDisponibles(): Observable<TypeDocument[]> {
    return this.http.get<TypeDocument[]>(`${this.apiUrl}/types`);
  }

  // Marquer tous les documents comme lus
  marquerTousCommeLus(): Observable<{success: boolean; count: number}> {
    return this.http.post<{success: boolean; count: number}>(`${this.apiUrl}/me/marquer-tous-lus`, {});
  }
}
