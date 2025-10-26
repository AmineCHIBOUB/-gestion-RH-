import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { AnnonceService } from '../../../services/annonce.service';
import { Annonce, TypeAnnonce, PrioriteAnnonce, AnnonceStats } from '../../../models/annonce.model';

@Component({
  selector: 'app-annonces-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatBadgeModule
  ],
  templateUrl: './annonces-list.component.html',
  styleUrls: ['./annonces-list.component.css']
})
export class AnnoncesListComponent implements OnInit {
  annonces: Annonce[] = [];
  annonceStats: AnnonceStats | null = null;
  isLoading = false;
  error: string | null = null;
  selectedType: TypeAnnonce | 'all' = 'all';
  selectedPriorite: PrioriteAnnonce | 'all' = 'all';
  showOnlyUnread = false;
  
  typeOptions = [
    { value: 'all', label: 'Tous les types' },
    { value: TypeAnnonce.GENERALE, label: 'Générale' },
    { value: TypeAnnonce.URGENTE, label: 'Urgente' },
    { value: TypeAnnonce.PROCEDURE, label: 'Procédure' }, // Remplacer MAINTENANCE
    { value: TypeAnnonce.FORMATION, label: 'Formation' },
    { value: TypeAnnonce.EVENEMENT, label: 'Événement' }
  ];

  prioriteOptions = [
    { value: 'all', label: 'Toutes priorités' },
    { value: PrioriteAnnonce.BASSE, label: 'Basse' },
    { value: PrioriteAnnonce.NORMALE, label: 'Normale' },
    { value: PrioriteAnnonce.HAUTE, label: 'Haute' },
    { value: PrioriteAnnonce.CRITIQUE, label: 'Critique' }
  ];

  constructor(
    private annonceService: AnnonceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAnnonces();
    this.loadStats();
  }

  loadAnnonces(): void {
    this.isLoading = true;
    this.error = null;

    this.annonceService.getAnnonces().subscribe({
      next: (response) => {
        this.annonces = response.annonces;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des annonces';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  loadStats(): void {
    this.annonceService.getStatsAnnonces().subscribe({
      next: (stats: AnnonceStats) => {
        this.annonceStats = stats;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
  }

  markAsRead(annonce: Annonce): void {
    if (!annonce.lue) {
      this.annonceService.marquerCommeLue(annonce.id).subscribe({
        next: () => {
          annonce.lue = true;
          annonce.dateLecture = new Date();
          this.loadStats();
        },
        error: (error: any) => {
          console.error('Erreur marquage lecture:', error);
        }
      });
    }
  }

  markAllAsRead(): void {
    const unreadAnnonces = this.annonces.filter(a => !a.lue);
    if (unreadAnnonces.length === 0) {
      this.snackBar.open('Toutes les annonces sont déjà lues', 'Fermer', {
        duration: 3000
      });
      return;
    }

    this.annonceService.marquerToutesCommeLues().subscribe({
      next: () => {
        this.annonces.forEach(annonce => {
          if (!annonce.lue) {
            annonce.lue = true;
            annonce.dateLecture = new Date();
          }
        });
        this.loadStats();
        this.snackBar.open('Toutes les annonces ont été marquées comme lues', 'Fermer', {
          duration: 3000
        });
      },
      error: (error: any) => {
        this.snackBar.open('Erreur lors du marquage', 'Fermer', {
          duration: 3000
        });
        console.error('Erreur:', error);
      }
    });
  }

  applyFilters(): void {
    let filteredAnnonces = [...this.annonces];

    // Filtre par type
    if (this.selectedType !== 'all') {
      filteredAnnonces = filteredAnnonces.filter(annonce => annonce.typeAnnonce === this.selectedType);
    }

    // Filtre par priorité
    if (this.selectedPriorite !== 'all') {
      filteredAnnonces = filteredAnnonces.filter(annonce => annonce.priorite === this.selectedPriorite);
    }

    // Filtre non lues
    if (this.showOnlyUnread) {
      filteredAnnonces = filteredAnnonces.filter(annonce => !annonce.lue);
    }

    this.annonces = filteredAnnonces;
  }

  onFiltersChange(): void {
    this.applyFilters();
  }

  getTypeLabel(type: TypeAnnonce): string {
    const option = this.typeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  }

  getPrioriteLabel(priorite: PrioriteAnnonce): string {
    const option = this.prioriteOptions.find(opt => opt.value === priorite);
    return option ? option.label : priorite;
  }

  getPrioriteColor(priorite: PrioriteAnnonce): string {
    switch (priorite) {
      case PrioriteAnnonce.BASSE:
        return 'primary';
      case PrioriteAnnonce.NORMALE:
        return 'accent';
      case PrioriteAnnonce.HAUTE:
        return 'warn';
      case PrioriteAnnonce.CRITIQUE:
        return 'warn';
      default:
        return 'primary';
    }
  }

  isRecent(date: Date): boolean {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return new Date(date) >= threeDaysAgo;
  }

  getTypeIcon(type: TypeAnnonce): string {
    switch (type) {
      case TypeAnnonce.GENERALE: return 'info';
      case TypeAnnonce.URGENTE: return 'priority_high';
      case TypeAnnonce.EVENEMENT: return 'event';
      case TypeAnnonce.FORMATION: return 'school';
      case TypeAnnonce.PROCEDURE: return 'description';
      case TypeAnnonce.SOCIALE: return 'people';
      default: return 'campaign';
    }
  }

  retry(): void {
    this.loadAnnonces();
    this.loadStats();
  }

  getNouvellesCetteSemaine(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.annonces.filter(annonce => 
      new Date(annonce.datePublication) >= oneWeekAgo
    ).length;
  }
}
