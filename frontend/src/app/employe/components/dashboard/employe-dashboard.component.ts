import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { EmployeService } from '../../services/employe.service';
import { CongeEmployeService } from '../../services/conge-employe.service';
import { BulletinPaieService } from '../../services/bulletin-paie.service';
import { DocumentService } from '../../services/document.service';
import { AnnonceService } from '../../services/annonce.service';

import { EmployeProfile } from '../../models/employe.model';
import { CongeEmploye } from '../../models/conge-employe.model';
import { BulletinPaie } from '../../models/bulletin-paie.model';
import { Annonce } from '../../models/annonce.model';

@Component({
  selector: 'app-employe-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatListModule
  ],
  templateUrl: './employe-dashboard.component.html',
  styleUrls: ['./employe-dashboard.component.css']
})
export class EmployeDashboardComponent implements OnInit {
  profil?: EmployeProfile;
  congesEnAttente: CongeEmploye[] = [];
  dernierBulletin?: BulletinPaie;
  annoncesNonLues: Annonce[] = [];
  statistiques = {
    congesRestants: 25,
    heuresTravaillees: 160,
    documentsNonLus: 3,
    annoncesNonLues: 0
  };
  loading = true;

  menuItems = [
    {
      title: 'Mon Profil',
      icon: 'person',
      route: '/employe/profil',
      description: 'Consulter et modifier mes informations personnelles'
    },
    {
      title: 'Mes Congés',
      icon: 'event_available',
      route: '/employe/conges',
      description: 'Gérer mes demandes de congés',
      badge: 0
    }
  ];

  constructor(
    private employeService: EmployeService,
    private congeService: CongeEmployeService,
    private bulletinService: BulletinPaieService,
    private documentService: DocumentService,
    private annonceService: AnnonceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    let loadingCount = 0;
    const totalRequests = 4;

    const checkLoadingComplete = () => {
      loadingCount++;
      if (loadingCount >= totalRequests) {
        this.loading = false;
      }
    };

    // Charger le profil
    this.employeService.getMyProfile().subscribe({
      next: (profil: EmployeProfile) => {
        this.profil = profil;
        checkLoadingComplete();
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement du profil:', error);
        checkLoadingComplete();
      }
    });

    // Charger les congés en attente
    this.congeService.getMesConges().subscribe({
      next: (response: { conges: CongeEmploye[] }) => {
        this.congesEnAttente = response.conges.filter((c: CongeEmploye) => c.statut === 'en_attente');
        this.menuItems[1].badge = this.congesEnAttente.length;
        checkLoadingComplete();
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des congés:', error);
        checkLoadingComplete();
      }
    });

    // Charger le dernier bulletin
    this.bulletinService.getMesBulletins().subscribe({
      next: (response: { bulletins: any[] }) => {
        if (response.bulletins.length > 0) {
          this.bulletinService.getBulletin(response.bulletins[0].id).subscribe({
            next: (bulletin: BulletinPaie) => {
              this.dernierBulletin = bulletin;
              checkLoadingComplete();
            },
            error: (error: any) => {
              console.error('Erreur lors du chargement du bulletin:', error);
              checkLoadingComplete();
            }
          });
        } else {
          checkLoadingComplete();
        }
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des bulletins:', error);
        checkLoadingComplete();
      }
    });

    // Charger les annonces non lues
    this.annonceService.getAnnonces(1, 10, undefined, undefined, true).subscribe({
      next: (response: { annonces: Annonce[] }) => {
        this.annoncesNonLues = response.annonces;
        this.menuItems[5].badge = response.annonces.length;
        this.statistiques.annoncesNonLues = response.annonces.length;
        checkLoadingComplete();
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des annonces:', error);
        checkLoadingComplete();
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Méthode pour le typage explicite dans le template
  // Ajouter cette fonction pour typer explicitement le paramètre conge
  trackByCongeId(index: number, conge: CongeEmploye): number {
    return conge.id;
  }
}
