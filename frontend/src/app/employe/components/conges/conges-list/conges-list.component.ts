import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { CongeEmployeService } from '../../../services/conge-employe.service';
import { AuthService } from '../../../../core/services/auth.service'; // Chemin corrigé

@Component({
  selector: 'app-conges-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule
  ],
  templateUrl: './conges-list.component.html',
  styleUrls: ['./conges-list.component.css']
})
export class CongesListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<any>();
  displayedColumns = ['dateDebut', 'dateFin', 'typeConge', 'nbJours', 'statut', 'dateCreation', 'actions'];
  
  loading = true;
  error: string | null = null;
  soldeConges: any = null;
  totalConges = 0;
  
  // Propriétés pour les filtres
  selectedAnnee: number = new Date().getFullYear();
  availableYears: number[] = [];
  selectedStatut: string = 'tous';
  statutOptions = [
    { value: 'tous', label: 'Tous les statuts' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'approuve', label: 'Approuvé' },
    { value: 'refuse', label: 'Refusé' },
    { value: 'annule', label: 'Annulé' }
  ];

  constructor(
    private congeService: CongeEmployeService,
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService // Service correctement injecté
  ) {
    // Initialiser les années disponibles (5 années : 2 précédentes, actuelle, 2 suivantes)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      this.availableYears.push(i);
    }
  }

  ngOnInit(): void {
    this.loadConges();
    this.loadSoldeConges();
  }

  private loadConges(): void {
    this.loading = true;
    this.error = null;
    this.congeService.getMesConges().subscribe({
      next: (response) => {
        console.log(response);
        // Fix: Use response.conges instead of response.data
        this.dataSource.data = response.conges || response.data || response;
        this.totalConges = response.total || response.length;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des congés';
        this.loading = false;
      }
    });
  }

  // Add this method to handle type_conge labels
  getTypeCongeLabel(typeConge: string): string {
    switch (typeConge) {
      case 'conge_paye':
        return 'Congé Payé';
      case 'rtt':
        return 'RTT';
      case 'conge_maladie':
        return 'Congé Maladie';
      case 'conge_maternite':
        return 'Congé Maternité';
      case 'conge_paternite':
        return 'Congé Paternité';
      case 'conge_sans_solde':
        return 'Congé Sans Solde';
      default:
        return typeConge;
    }
  }

  private loadSoldeConges(): void {
    this.congeService.getSoldeConges().subscribe({
      next: (solde) => {
        this.soldeConges = solde;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du solde des congés:', error);
      }
    });
  }

  // Méthodes de navigation et actions
  navigateToNewDemande(): void {
    console.log('Navigation vers nouvelle demande');
    console.log('Token:', this.authService.getToken());
    console.log('User:', this.authService.getCurrentUser());
    this.router.navigate(['/employe/conges/nouvelle-demande']);
  }

  onAnneeChange(): void {
    this.loadConges();
    this.loadSoldeConges();
  }

  onStatutChange(): void {
    this.loadConges();
  }

  onRefresh(): void {
    this.loadConges();
    this.loadSoldeConges();
  }

  // Méthodes utilitaires pour le template
  getStatutClass(statut: string): string {
    switch (statut) {
      case 'en_attente':
        return 'statut-en-attente';
      case 'approuve':
        return 'statut-approuve';
      case 'refuse':
        return 'statut-refuse';
      case 'annule':
        return 'statut-annule';
      default:
        return 'statut-default';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'en_attente':
        return 'En attente';
      case 'approuve':
        return 'Approuvé';
      case 'refuse':
        return 'Refusé';
      case 'annule':
        return 'Annulé';
      default:
        return statut;
    }
  }

  canCancelConge(conge: any): boolean {
    return conge.statut === 'en_attente';
  }

  onCancelConge(conge: any): void {
    if (this.canCancelConge(conge)) {
      this.congeService.annulerDemandeConge(conge.id).subscribe({
        next: () => {
          this.loadConges();
        },
        error: (error) => {
          this.error = 'Erreur lors de l\'annulation du congé';
        }
      });
    }
  }

  // Méthodes existantes
  nouvelleDemandeConge(): void {
    this.navigateToNewDemande();
  }

  voirDetails(conge: any): void {
    // Voir les détails du congé
  }

  annulerConge(conge: any): void {
    this.onCancelConge(conge);
  }
}
