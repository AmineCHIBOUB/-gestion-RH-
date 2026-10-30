import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PointageService {
  private apiUrl = `${environment.apiUrl}/pointages`;

  constructor(private http: HttpClient) {}

  // Pointer l'arrivée
  clockIn(): Observable<any> {
    return this.http.post(`${this.apiUrl}/clock-in`, {});
  }

  // Pointer la sortie
  clockOut(): Observable<any> {
    return this.http.post(`${this.apiUrl}/clock-out`, {});
  }

  // Obtenir le statut actuel
  getCurrentStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/current-status`);
  }

  // Obtenir mes pointages
  getMesPointages(page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', limit.toString());
    
    return this.http.get(`${this.apiUrl}/my-pointages`, { params });
  }

  // Créer un pointage manuel
  creerPointage(pointage: any): Observable<any> {
    return this.http.post(this.apiUrl, pointage);
  }

  // Modifier un pointage
  modifierPointage(id: number, pointage: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, pointage);
  }
}
