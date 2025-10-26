import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PresenceService } from '../../services/presence.service';
import { FeuilleTemps } from '../../models/presence.model';
import { Employe } from '../../models/employe.model';

@Component({
  selector: 'app-feuilles-temps',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './feuilles-temps.component.html',
  styleUrls: ['./feuilles-temps.component.css']
})
export class FeuillesTempsComponent implements OnInit {
  feuilles: FeuilleTemps[] = [];
  filteredFeuilles: FeuilleTemps[] = [];
  employes: Employe[] = [];
  filterForm: FormGroup;
  feuilleForm: FormGroup;
  isLoading = false;
  showForm = false;
  editingFeuille: FeuilleTemps | null = null;

  // Pagination
  pageSize = 10;
  currentPage = 0;
  totalItems = 0;

  // Statistiques
  stats = {
    totalFeuilles: 0,
    feuillesEnAttente: 0,
    feuillesValidees: 0,
    feuillesRejetees: 0,
    totalHeures: 0,
    moyenneHeuresParJour: 0
  };

  displayedColumns: string[] = [
    'employe',
    'periode',
    'totalHeures',
    'heuresNormales',
    'heuresSupplementaires',
    'statut',
    'dateCreation',
    'actions'
  ];

  statuts = [
    { value: 'brouillon', label: 'Brouillon', color: 'gray' },
    { value: 'soumise', label: 'Soumise', color: 'orange' },
    { value: 'validee', label: 'Validée', color: 'green' },
    { value: 'rejetee', label: 'Rejetée', color: 'red' }
  ];

  constructor(
    private fb: FormBuilder,
    private presenceService: PresenceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      dateDebut: [''],
      dateFin: [''],
      employe: [''],
      statut: [''],
      periode: ['']
    });

    this.feuilleForm = this.fb.group({
      employeId: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      commentaire: [''],
      lignes: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadFeuilles();
    this.loadEmployes();
    this.loadStatistics();
  }

  loadFeuilles(): void {
    this.isLoading = true;
    this.presenceService.getFeuillesTemps().subscribe({
      next: (data) => {
        this.feuilles = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des feuilles de temps:', error);
        this.snackBar.open('Erreur lors du chargement des feuilles de temps', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  loadEmployes(): void {
    this.presenceService.getEmployes().subscribe({
      next: (data) => {
        this.employes = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des employés:', error);
      }
    });
  }

  loadStatistics(): void {
    this.presenceService.getFeuillesTempsStatistics().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.feuilles];
    const filters = this.filterForm.value;

    if (filters.dateDebut) {
      filtered = filtered.filter(f => new Date(f.dateDebut) >= new Date(filters.dateDebut));
    }

    if (filters.dateFin) {
      filtered = filtered.filter(f => new Date(f.dateFin) <= new Date(filters.dateFin));
    }

    if (filters.employe) {
      filtered = filtered.filter(f => 
        f.employe.nom.toLowerCase().includes(filters.employe.toLowerCase()) ||
        f.employe.prenom.toLowerCase().includes(filters.employe.toLowerCase())
      );
    }

    if (filters.statut) {
      filtered = filtered.filter(f => f.statut === filters.statut);
    }

    if (filters.periode) {
      const [annee, mois] = filters.periode.split('-');
      filtered = filtered.filter(f => {
        const dateDebut = new Date(f.dateDebut);
        return dateDebut.getFullYear() === parseInt(annee) && 
               dateDebut.getMonth() === parseInt(mois) - 1;
      });
    }

    this.filteredFeuilles = filtered;
    this.totalItems = filtered.length;
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  openForm(feuille?: FeuilleTemps): void {
    this.editingFeuille = feuille || null;
    if (feuille) {
      this.feuilleForm.patchValue(feuille);
    } else {
      this.feuilleForm.reset();
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingFeuille = null;
    this.feuilleForm.reset();
  }

  saveFeuille(): void {
    if (this.feuilleForm.valid) {
      this.isLoading = true;
      const feuilleData = this.feuilleForm.value;

      const request = this.editingFeuille
        ? this.presenceService.updateFeuilleTemps(this.editingFeuille.id, feuilleData)
        : this.presenceService.createFeuilleTemps(feuilleData);

      request.subscribe({
        next: () => {
          this.snackBar.open(
            this.editingFeuille ? 'Feuille de temps modifiée avec succès' : 'Feuille de temps créée avec succès',
            'Fermer',
            { duration: 3000 }
          );
          this.closeForm();
          this.loadFeuilles();
          this.loadStatistics();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde:', error);
          this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', {
            duration: 3000
          });
          this.isLoading = false;
        }
      });
    }
  }

  validerFeuille(feuille: FeuilleTemps): void {
    this.presenceService.validerFeuilleTemps(feuille.id).subscribe({
      next: () => {
        this.snackBar.open('Feuille de temps validée', 'Fermer', { duration: 3000 });
        this.loadFeuilles();
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Erreur lors de la validation:', error);
        this.snackBar.open('Erreur lors de la validation', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  rejeterFeuille(feuille: FeuilleTemps): void {
    this.presenceService.rejeterFeuilleTemps(feuille.id).subscribe({
      next: () => {
        this.snackBar.open('Feuille de temps rejetée', 'Fermer', { duration: 3000 });
        this.loadFeuilles();
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Erreur lors du rejet:', error);
        this.snackBar.open('Erreur lors du rejet', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  deleteFeuille(feuille: FeuilleTemps): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette feuille de temps ?')) {
      this.presenceService.deleteFeuilleTemps(feuille.id).subscribe({
        next: () => {
          this.snackBar.open('Feuille de temps supprimée', 'Fermer', { duration: 3000 });
          this.loadFeuilles();
          this.loadStatistics();
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

  exportFeuilles(): void {
    this.presenceService.exportFeuillesTemps(this.filterForm.value).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feuilles_temps_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors de l\'export:', error);
        this.snackBar.open('Erreur lors de l\'export', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  getStatutColor(statut: string): string {
    const statutObj = this.statuts.find(s => s.value === statut);
    return statutObj ? statutObj.color : 'gray';
  }

  getStatutLabel(statut: string): string {
    const statutObj = this.statuts.find(s => s.value === statut);
    return statutObj ? statutObj.label : statut;
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getPaginatedData(): FeuilleTemps[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.filteredFeuilles.slice(startIndex, startIndex + this.pageSize);
  }

  generateFeuilleAutomatique(employeId: number, dateDebut: string, dateFin: string): void {
    this.presenceService.generateFeuilleTempsAutomatique(employeId, dateDebut, dateFin).subscribe({
      next: () => {
        this.snackBar.open('Feuille de temps générée automatiquement', 'Fermer', { duration: 3000 });
        this.loadFeuilles();
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Erreur lors de la génération automatique:', error);
        this.snackBar.open('Erreur lors de la génération automatique', 'Fermer', {
          duration: 3000
        });
      }
    });
  }
}
