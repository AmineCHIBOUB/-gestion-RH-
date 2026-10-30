import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { PresenceService } from '../../services/presence.service';
import { Presence } from '../../models/presence.model';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-suivi-presences',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatChipsModule,
    MatMenuModule
  ],
  templateUrl: './suivi-presences.component.html',
  styleUrls: ['./suivi-presences.component.css']
})
export class SuiviPresencesComponent implements OnInit {
  presences: Presence[] = [];
  filteredPresences: Presence[] = [];
  loading = false;
  
  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  
  // Filtres
  // Corriger les filtres (lignes 25-31)
  filters = {
    employe: '',
    dateDebut: null as any,
    dateFin: null as any,
    departement: '',
    statut: ''
  };
  
  displayedColumns: string[] = [
    'employe',
    'date',
    'heureArrivee',
    'heureDepart',
    'tempsTravaille',
    'tempsPause',
    'statut',
    'actions'
  ];
  
  departements: string[] = [];
  
  constructor(private presenceService: PresenceService) {}
  
  ngOnInit(): void {
    this.loadPresences();
    this.loadDepartements();
  }
  
  loadPresences(): void {
    this.loading = true;
    this.presenceService.getPresences({
      page: this.pageIndex + 1,
      limit: this.pageSize,
      ...this.filters
    }).subscribe({
      next: (response) => {
        this.presences = response.data;
        this.filteredPresences = response.data;
        this.totalItems = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des présences:', error);
        this.loading = false;
      }
    });
  }
  
  loadDepartements(): void {
    this.presenceService.getDepartements().subscribe({
      next: (departements) => {
        this.departements = departements;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des départements:', error);
      }
    });
  }
  
  applyFilters(): void {
    this.pageIndex = 0;
    this.loadPresences();
  }
  
  clearFilters(): void {
    this.filters = {
      employe: '',
      dateDebut: null as any,
      dateFin: null as any,
      departement: '',
      statut: ''
    };
    this.applyFilters();
  }
  
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPresences();
  }
  
  sortData(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      this.filteredPresences = [...this.presences];
      return;
    }
    
    this.filteredPresences = this.presences.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'employe':
          return this.compare(a.employe.nom + ' ' + a.employe.prenom, 
                            b.employe.nom + ' ' + b.employe.prenom, isAsc);
        case 'date':
          return this.compare(new Date(a.date), new Date(b.date), isAsc);
        case 'heureArrivee':
          return this.compare(a.heureArrivee || '', b.heureArrivee || '', isAsc);
        case 'heureDepart':
          return this.compare(a.heureDepart || '', b.heureDepart || '', isAsc);
        default:
          return 0;
      }
    });
  }
  
  private compare(a: any, b: any, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  
  getTempsTravaille(presence: Presence): string {
    if (!presence.heureArrivee) return '00:00';
    
    const debut = new Date(presence.heureArrivee);
    const fin = presence.heureDepart ? new Date(presence.heureDepart) : new Date();
    
    const diffMs = fin.getTime() - debut.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}`;
  }
  
  getTempsPause(presence: Presence): string {
    if (!presence.pauses || presence.pauses.length === 0) return '00:00';
    
    let totalPauseMs = 0;
    presence.pauses.forEach(pause => {
      if (pause.debut && pause.fin) {
        const debut = new Date(pause.debut);
        const fin = new Date(pause.fin);
        totalPauseMs += fin.getTime() - debut.getTime();
      }
    });
    
    const totalHours = Math.floor(totalPauseMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor((totalPauseMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}`;
  }
  
  getStatutPresence(presence: Presence): string {
    if (!presence.heureArrivee) return 'Absent';
    if (presence.heureDepart) return 'Complet';
    return 'En cours';
  }
  
  getStatutColor(presence: Presence): string {
    const statut = this.getStatutPresence(presence);
    switch (statut) {
      case 'Complet': return 'success';
      case 'En cours': return 'accent';
      case 'Absent': return 'warn';
      default: return 'primary';
    }
  }
  
  exportPresences(): void {
    this.presenceService.exportPresences(this.filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `presences-${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors de l\'export:', error);
      }
    });
  }
  
  voirDetails(presence: Presence): void {
    // Ouvrir un dialog avec les détails de la présence
    console.log('Détails présence:', presence);
  }
  
  modifierPresence(presence: Presence): void {
    // Ouvrir un dialog pour modifier la présence
    console.log('Modifier présence:', presence);
  }
}
