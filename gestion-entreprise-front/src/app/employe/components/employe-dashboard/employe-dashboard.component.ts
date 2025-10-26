import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';

@Component({
  selector: 'app-employe-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './employe-dashboard.component.html',
  styleUrls: ['./employe-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EmployeDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  employe: any = null;
  stats: DashboardStats | null = null;
  derniersConges: any[] = [];
  documentsRecents: any[] = [];
  notifications: any[] = [];
  annoncesRecentes: any[] = []; // Ajouter cette propriété
  
  loading = true;
  error: string | null = null;

  navigationCards = [
    {
      title: 'Mon Profil',
      description: 'Consulter et modifier mes informations personnelles',
      icon: 'person',
      route: '/employe/profil',
      color: 'primary'
    },
    {
      title: 'Mes Congés',
      description: 'Gérer mes demandes de congés et consulter mon solde',
      icon: 'event_available',
      route: '/employe/conges',
      color: 'accent'
    },
    {
      title: 'Bulletins de Paie',
      description: 'Consulter et télécharger mes bulletins de paie',
      icon: 'receipt',
      route: '/employe/bulletins',
      color: 'warn'
    },
    {
      title: 'Pointages',
      description: 'Gérer mes pointages et feuilles de temps',
      icon: 'schedule',
      route: '/employe/pointages',
      color: 'primary'
    },
    {
      title: 'Documents',
      description: 'Accéder aux documents et procédures',
      icon: 'folder',
      route: '/employe/documents',
      color: 'accent'
    }
  ];

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.employe = data.profile;
          this.stats = data.stats;
          this.derniersConges = data.recent_conges || [];
          this.documentsRecents = data.recent_documents || [];
          this.notifications = data.notifications || [];
          this.annoncesRecentes = this.getAnnoncesRecentes(); // Initialiser les annonces
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des données:', error);
          this.error = 'Erreur lors du chargement des données du tableau de bord';
          this.loading = false;
          this.snackBar.open('Erreur lors du chargement des données', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  // Ajouter cette méthode
  getAnnoncesRecentes(): any[] {
    // Filtrer les notifications pour ne garder que les annonces
    return this.notifications
      .filter(notif => notif.type === 'annonce' || notif.typeAnnonce)
      .slice(0, 5);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  markNotificationAsRead(notification: any): void {
    this.dashboardService.markNotificationAsRead(notification.id)
      .subscribe(() => {
        notification.read_at = new Date();
      });
  }

  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  // Ajouter une méthode pour le trackBy des congés
  trackByCongeId(index: number, conge: any): any {
    return conge ? conge.id : index;
  }

  // Ajouter ces méthodes manquantes
  getStatutColor(statut: string): string {
    switch (statut) {
      case 'approuve': return 'primary';
      case 'en_attente': return 'accent';
      case 'rejete': return 'warn';
      default: return 'basic';
    }
  }

  getCongeStatutColor(statut: string): string {
    return this.getStatutColor(statut);
  }
}
