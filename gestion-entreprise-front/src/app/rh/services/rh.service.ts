import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmployeService } from './employe.service';
import { CongeService } from './conge.service';
import { PointageService } from './pointage.service';
import { PresenceService } from './presence.service';
import { RapportService } from './rapport.service';

@Injectable({
  providedIn: 'root'
})
export class RhService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private employeService: EmployeService,
    private congeService: CongeService,
    private pointageService: PointageService,
    private presenceService: PresenceService,
    private rapportService: RapportService
  ) {}

  // Dashboard RH - Statistiques globales
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/rh-stats`);
  }

  // Statistiques combinées pour le dashboard
  getCombinedStats(): Observable<any> {
    return forkJoin({
      employes: this.employeService.getEmployeStatistics(),
      conges: this.congeService.getCongesStatistics(),
      pointages: this.pointageService.getPointagesStats(),
      dashboard: this.getDashboardStats()
    });
  }

  // Recherche globale dans le module RH
  searchGlobal(query: string, modules: string[] = ['employes', 'conges', 'pointages']): Observable<any> {
    const searches: any = {};
    
    if (modules.includes('employes')) {
      searches.employes = this.employeService.searchEmployes(query);
    }
    
    return forkJoin(searches);
  }

  // Export global des données RH
  exportGlobalData(modules: string[], format: 'excel' | 'pdf' = 'excel'): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/rh/export-global`, {
      modules,
      format
    }, {
      responseType: 'blob'
    });
  }
}
