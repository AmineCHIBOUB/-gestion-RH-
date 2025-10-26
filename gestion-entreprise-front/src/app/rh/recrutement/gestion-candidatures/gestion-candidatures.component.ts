import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
// Ajout des imports manquants pour mat-datepicker
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CandidatureService } from '../../services/candidature.service';
import { PosteService } from '../../services/poste.service';
import { Candidature } from '../../models/candidature.model';
import { Poste } from '../../models/poste.model';

@Component({
  selector: 'app-gestion-candidatures',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    // Ajout des modules manquants pour mat-datepicker
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './gestion-candidatures.component.html',
  styleUrls: ['./gestion-candidatures.component.css']
})
export class GestionCandidaturesComponent implements OnInit {
  candidatures: Candidature[] = [];
  filteredCandidatures: Candidature[] = [];
  postes: Poste[] = [];
  filterForm!: FormGroup;
  loading = false;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Tri
  sortField = 'datePostulation';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Statistiques
  stats = {
    total: 0,
    nouvelles: 0,
    enCours: 0,
    acceptees: 0,
    refusees: 0
  };
  
  displayedColumns = [
    'nom',
    'prenom', 
    'email',
    'poste',
    'datePostulation',
    'statut',
    'score',
    'actions'
  ];
  
  statutOptions = [
    { value: 'nouvelle', label: 'Nouvelle' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'entretien', label: 'Entretien' },
    { value: 'acceptee', label: 'Acceptée' },
    { value: 'refusee', label: 'Refusée' }
  ];

  constructor(
    private fb: FormBuilder,
    private candidatureService: CandidatureService,
    private posteService: PosteService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      nom: [''],
      email: [''],
      posteId: [''],
      statut: [''],
      dateDebut: [''],
      dateFin: [''],
      scoreMin: [''],
      scoreMax: ['']
    });
  }

  ngOnInit(): void {
    this.loadPostes();
    this.loadCandidatures();
    this.setupFilters();
  }

  loadPostes(): void {
    this.posteService.getPostes().subscribe({
      next: (postes) => {
        this.postes = postes;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des postes:', error);
      }
    });
  }

  loadCandidatures(): void {
    this.loading = true;
    const filters = this.getFilters();
    
    this.candidatureService.getCandidatures(filters).subscribe({
      next: (response: any) => {
        this.candidatures = response.data || response; // Gérer les deux cas
        this.totalItems = response.total || response.length || 0;
        this.applyFiltersAndSort();
        this.calculateStats();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des candidatures:', error);
        this.loading = false;
      }
    });
  }

  setupFilters(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadCandidatures();
    });
  }

  getFilters(): any {
    const formValue = this.filterForm.value;
    const filters: any = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      sortField: this.sortField,
      sortDirection: this.sortDirection
    };

    Object.keys(formValue).forEach(key => {
      if (formValue[key]) {
        filters[key] = formValue[key];
      }
    });

    return filters;
  }

  applyFiltersAndSort(): void {
    let filtered = [...this.candidatures];

    // Tri
    filtered.sort((a, b) => {
      const aValue = this.getFieldValue(a, this.sortField);
      const bValue = this.getFieldValue(b, this.sortField);
      
      if (this.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredCandidatures = filtered;
  }

  getFieldValue(obj: any, field: string): any {
    return field.split('.').reduce((o, f) => o && o[f], obj);
  }

  calculateStats(): void {
    this.stats = {
      total: this.candidatures.length,
      nouvelles: this.candidatures.filter(c => c.statut === 'nouvelle').length,
      enCours: this.candidatures.filter(c => c.statut === 'en_cours').length,
      acceptees: this.candidatures.filter(c => c.statut === 'acceptee').length,
      refusees: this.candidatures.filter(c => c.statut === 'refusee').length
    };
  }

  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.loadCandidatures();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCandidatures();
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  // Correction des méthodes avec typage explicite des paramètres
  changerStatut(candidature: Candidature, nouveauStatut: string): void {
    this.candidatureService.changerStatut(candidature.id, nouveauStatut).subscribe({
      next: (response: any) => {
        // Mettre à jour la candidature dans la liste
        const index = this.candidatures.findIndex(c => c.id === candidature.id);
        if (index !== -1) {
          this.candidatures[index] = response;
          this.applyFiltersAndSort();
          this.calculateStats();
        }
        this.snackBar.open('Statut mis à jour avec succès', 'Fermer', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Erreur lors du changement de statut:', error);
        this.snackBar.open('Erreur lors du changement de statut', 'Fermer', { duration: 3000 });
      }
    });
  }

  exporterCandidatures(): void {
    const filters = this.getFilters();
    
    this.candidatureService.exporterCandidatures(filters).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `candidatures_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Export réussi', 'Fermer', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'export:', error);
        this.snackBar.open('Erreur lors de l\'export', 'Fermer', { duration: 3000 });
      }
    });
  }

  voirCV(candidature: Candidature): void {
    if (candidature.cvPath) {
      window.open(candidature.cvPath, '_blank');
    }
  }

  voirLettreMotivation(candidature: Candidature): void {
    if (candidature.lettreMotivationPath) {
      window.open(candidature.lettreMotivationPath, '_blank');
    }
  }

  planifierEntretien(candidature: Candidature): void {
    // Ouvrir un dialog pour planifier l'entretien
    console.log('Planifier entretien pour:', candidature);
  }

  supprimerCandidature(candidature: Candidature): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      this.candidatureService.deleteCandidature(candidature.id).subscribe({
        next: () => {
          this.loadCandidatures();
          this.snackBar.open('Candidature supprimée avec succès', 'Fermer', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }

  getStatutColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'nouvelle': 'primary',
      'en_cours': 'accent',
      'entretien': 'warn',
      'acceptee': 'success',
      'refusee': 'danger'
    };
    return colors[statut] || 'default';
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warn';
    return 'danger';
  }
}
