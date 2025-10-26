import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { EmployeService } from '../../services/employe.service';
import { CongeService } from '../../services/conge.service';
import { PointageService } from '../../services/pointage.service'; // Changed from PresenceService
import { PaieService } from '../../services/paie.service';
import { RapportService } from '../../services/rapport.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-rh-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatListModule
  ],
  templateUrl: './rh-dashboard.component.html',
  styleUrls: ['./rh-dashboard.component.css']
})
export class RhDashboardComponent implements OnInit {
  statistiques = {
    totalEmployes: 0,
    employesActifs: 0,
    demandesCongesEnAttente: 0,
    pointagesAujourdhui: 0, // Changed from presencesAujourdhui
    bulletinsPaieGeneres: 0
  };

  dernieresActivites: any[] = [];
  congesAValider: any[] = [];
  pointagesRecents: any[] = []; // Changed from presencesManquantes
  employes: any[] = [];
  loading = true;

  constructor(
    private employeService: EmployeService,
    private congeService: CongeService,
    private pointageService: PointageService, // Changed from presenceService
    private paieService: PaieService,
    private rapportService: RapportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerDonneesDashboard();
  }

  chargerDonneesDashboard(): void {
    this.loading = true;
    
    const today = new Date().toISOString().split('T')[0];
    
    forkJoin({
      employes: this.employeService.getEmployes(),
      congesEnAttente: this.congeService.getDemandes({ statut: 'en_attente' }),
      pointagesAujourdhui: this.pointageService.getPointagesByDate(today) // Changed to use pointage
    }).subscribe({
      next: (data) => {
        this.statistiques.totalEmployes = data.employes.length;
        this.statistiques.employesActifs = data.employes.filter(e => e.statut === 'actif').length;
        this.statistiques.demandesCongesEnAttente = data.congesEnAttente.length;
        this.statistiques.pointagesAujourdhui = data.pointagesAujourdhui.data ? data.pointagesAujourdhui.data.length : 0;
        
        this.congesAValider = data.congesEnAttente.slice(0, 5);
        this.pointagesRecents = data.pointagesAujourdhui.data ? data.pointagesAujourdhui.data.slice(0, 5) : [];
        this.employes = data.employes.slice(0, 8);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du dashboard:', error);
        this.loading = false;
      }
    });
  }

  naviguerVers(route: string): void {
    this.router.navigate([route]);
  }
}
