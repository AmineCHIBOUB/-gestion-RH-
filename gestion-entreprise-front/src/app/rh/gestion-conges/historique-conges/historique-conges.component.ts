import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CongeService } from '../../services/conge.service';
import { DemandeConge, StatutConge } from '../../models/demande-conge.model';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-historique-conges',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatExpansionModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatNativeDateModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './historique-conges.component.html',
  styleUrls: ['./historique-conges.component.css']
})
export class HistoriqueCongesComponent implements OnInit {
  conges: DemandeConge[] = [];
  filteredConges: DemandeConge[] = [];
  loading = false;
  
  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  
  // Filtres
  filters = {
    employe: '',
    dateDebut: null as Date | null,
    dateFin: null as Date | null,
    statut: '' as StatutConge | '',
    typeConge: ''
  };
  
  displayedColumns: string[] = [
    'employe',
    'typeConge', 
    'dateDebut',
    'dateFin',
    'nbJours',
    'statut',
    'dateValidation',
    'validePar',
    'actions'
  ];
  
  // Correction: utiliser les valeurs du type StatutConge
  statutOptions = ['en_attente', 'approuve', 'refuse', 'annule'] as StatutConge[];
  
  constructor(private congeService: CongeService) {}
  
  ngOnInit(): void {
    this.loadHistorique();
  }
  
  loadHistorique(): void {
    this.loading = true;
    // Correction: utiliser getDemandes au lieu de getHistoriqueConges
    this.congeService.getDemandes({
      search: this.filters.employe || undefined,
      statut: this.filters.statut || undefined,
      typeConge: this.filters.typeConge || undefined,
      dateDebut: this.filters.dateDebut?.toISOString().split('T')[0] || undefined,
      dateFin: this.filters.dateFin?.toISOString().split('T')[0] || undefined
    }).subscribe({
      next: (response: DemandeConge[]) => {
        this.conges = response;
        this.filteredConges = response;
        this.totalItems = response.length;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement de l\'historique:', error);
        this.loading = false;
      }
    });
  }
  
  applyFilters(): void {
    this.pageIndex = 0;
    this.loadHistorique();
  }
  
  clearFilters(): void {
    this.filters = {
      employe: '',
      dateDebut: null,
      dateFin: null,
      statut: '',
      typeConge: ''
    };
    this.applyFilters();
  }
  
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadHistorique();
  }
  
  sortData(sort: Sort): void {
    // Implémentation du tri
    if (!sort.active || sort.direction === '') {
      this.filteredConges = [...this.conges];
      return;
    }
    
    this.filteredConges = this.conges.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'employe':
          // Correction: vérifier si employe existe
          const nomA = a.employe ? `${a.employe.nom} ${a.employe.prenom}` : '';
          const nomB = b.employe ? `${b.employe.nom} ${b.employe.prenom}` : '';
          return this.compare(nomA, nomB, isAsc);
        case 'dateDebut':
          return this.compare(new Date(a.dateDebut), new Date(b.dateDebut), isAsc);
        case 'dateFin':
          return this.compare(new Date(a.dateFin), new Date(b.dateFin), isAsc);
        case 'nbJours':
          // Correction: utiliser nombreJours au lieu de nbJours
          return this.compare(a.nombreJours, b.nombreJours, isAsc);
        case 'statut':
          return this.compare(a.statut, b.statut, isAsc);
        default:
          return 0;
      }
    });
  }
  
  private compare(a: any, b: any, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  
  exportHistorique(): void {
    // Correction: implémentation temporaire avec getDemandes
    this.congeService.getDemandes({
      search: this.filters.employe || undefined,
      statut: this.filters.statut || undefined,
      typeConge: this.filters.typeConge || undefined,
      dateDebut: this.filters.dateDebut?.toISOString().split('T')[0] || undefined,
      dateFin: this.filters.dateFin?.toISOString().split('T')[0] || undefined
    }).subscribe({
      next: (conges: DemandeConge[]) => {
        // Conversion en CSV
        const csvContent = this.convertToCSV(conges);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `historique-conges-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'export:', error);
      }
    });
  }
  
  private convertToCSV(conges: DemandeConge[]): string {
    const headers = ['Employé', 'Type', 'Date début', 'Date fin', 'Nb jours', 'Statut'];
    const rows = conges.map(c => [
      c.employe ? `${c.employe.prenom} ${c.employe.nom}` : 'N/A',
      c.typeConge,
      c.dateDebut.toString(),
      c.dateFin.toString(),
      c.nombreJours.toString(),
      c.statut
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\\n');
  }
  
  getStatutColor(statut: StatutConge): string {
    switch (statut) {
      case 'approuve': // Correction: utiliser les valeurs string
        return 'success';
      case 'refuse': // Correction: utiliser les valeurs string
        return 'warn';
      case 'en_attente': // Correction: utiliser les valeurs string
        return 'accent';
      default:
        return 'primary';
    }
  }
}
