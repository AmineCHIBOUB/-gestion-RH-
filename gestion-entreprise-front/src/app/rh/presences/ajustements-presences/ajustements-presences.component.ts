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
import { Presence, AjustementPresence } from '../../models/presence.model';

@Component({
  selector: 'app-ajustements-presences',
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
  templateUrl: './ajustements-presences.component.html',
  styleUrls: ['./ajustements-presences.component.css']
})
export class AjustementsPresencesComponent implements OnInit {
  ajustements: AjustementPresence[] = [];
  filteredAjustements: AjustementPresence[] = [];
  filterForm: FormGroup;
  ajustementForm: FormGroup;
  isLoading = false;
  showForm = false;
  editingAjustement: AjustementPresence | null = null;

  // Pagination
  pageSize = 10;
  currentPage = 0;
  totalItems = 0;

  // Statistiques
  stats = {
    totalAjustements: 0,
    ajustementsEnAttente: 0,
    ajustementsApprouves: 0,
    ajustementsRejetes: 0,
    totalHeuresAjustees: 0
  };

  displayedColumns: string[] = [
    'employe',
    'date',
    'heureOriginale',
    'heureAjustee',
    'motif',
    'statut',
    'demandePar',
    'dateCreation',
    'actions'
  ];

  motifs = [
    { value: 'erreur_pointage', label: 'Erreur de pointage' },
    { value: 'oubli_pointage', label: 'Oubli de pointage' },
    { value: 'probleme_technique', label: 'Problème technique' },
    { value: 'mission_externe', label: 'Mission externe' },
    { value: 'formation', label: 'Formation' },
    { value: 'autre', label: 'Autre' }
  ];

  statuts = [
    { value: 'en_attente', label: 'En attente', color: 'orange' },
    { value: 'approuve', label: 'Approuvé', color: 'green' },
    { value: 'rejete', label: 'Rejeté', color: 'red' }
  ];

  constructor(
    private fb: FormBuilder,
    private presenceService: PresenceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      employe: [''],
      dateDebut: [''],
      dateFin: [''],
      statut: [''],
      typeAjustement: ['']
    });
    
    this.ajustementForm = this.fb.group({
      presenceId: ['', Validators.required],
      typeAjustement: ['', Validators.required],
      nouvelleValeur: ['', Validators.required],
      motif: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAjustements();
    this.loadStatistics();
  }

  initializeForms(): void {
    this.filterForm = this.fb.group({
      dateDebut: [''],
      dateFin: [''],
      employe: [''],
      statut: [''],
      motif: ['']
    });

    this.ajustementForm = this.fb.group({
      employeId: ['', Validators.required],
      date: ['', Validators.required],
      heureEntreeOriginale: [''],
      heureSortieOriginale: [''],
      heureEntreeAjustee: ['', Validators.required],
      heureSortieAjustee: ['', Validators.required],
      motif: ['', Validators.required],
      commentaire: ['', Validators.required],
      justificatif: ['']
    });
  }

  loadAjustements(): void {
    this.isLoading = true;
    this.presenceService.getAjustements().subscribe({
      next: (data: AjustementPresence[]) => {
        this.ajustements = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des ajustements:', error);
        this.snackBar.open('Erreur lors du chargement des ajustements', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  loadStatistics(): void {
    this.presenceService.getAjustementsStatistics().subscribe({
      next: (stats: any) => {
        this.stats = stats;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
  }

  saveAjustement(): void {
    if (this.ajustementForm.valid) {
      this.isLoading = true;
      const ajustementData = this.ajustementForm.value;

      const request = this.editingAjustement
        ? this.presenceService.updateAjustement(this.editingAjustement.id, ajustementData)
        : this.presenceService.createAjustement(ajustementData);

      request.subscribe({
        next: () => {
          this.snackBar.open(
            this.editingAjustement ? 'Ajustement modifié avec succès' : 'Ajustement créé avec succès',
            'Fermer',
            { duration: 3000 }
          );
          this.closeForm();
          this.loadAjustements();
          this.loadStatistics();
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Erreur lors de la sauvegarde:', error);
          this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', {
            duration: 3000
          });
          this.isLoading = false;
        }
      });
    }
  }

  approuverAjustement(ajustement: AjustementPresence): void {
    this.presenceService.approuverAjustement(ajustement.id).subscribe({
      next: () => {
        this.snackBar.open('Ajustement approuvé', 'Fermer', { duration: 3000 });
        this.loadAjustements();
        this.loadStatistics();
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'approbation:', error);
        this.snackBar.open('Erreur lors de l\'approbation', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  rejeterAjustement(ajustement: AjustementPresence): void {
    this.presenceService.rejeterAjustement(ajustement.id).subscribe({
      next: () => {
        this.snackBar.open('Ajustement rejeté', 'Fermer', { duration: 3000 });
        this.loadAjustements();
        this.loadStatistics();
      },
      error: (error: any) => {
        console.error('Erreur lors du rejet:', error);
        this.snackBar.open('Erreur lors du rejet', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  deleteAjustement(ajustement: AjustementPresence): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet ajustement ?')) {
      this.presenceService.deleteAjustement(ajustement.id).subscribe({
        next: () => {
          this.snackBar.open('Ajustement supprimé', 'Fermer', { duration: 3000 });
          this.loadAjustements();
          this.loadStatistics();
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }

  exportAjustements(): void {
    this.presenceService.exportAjustements(this.filterForm.value).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ajustements_presences_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'export:', error);
        this.snackBar.open('Erreur lors de l\'export', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.ajustements];
    const filters = this.filterForm.value;

    if (filters.employe) {
      filtered = filtered.filter((ajustement: AjustementPresence) => 
        ajustement.employe.nom.toLowerCase().includes(filters.employe.toLowerCase()) ||
        ajustement.employe.prenom.toLowerCase().includes(filters.employe.toLowerCase())
      );
    }

    if (filters.dateDebut) {
      filtered = filtered.filter((ajustement: AjustementPresence) => 
        new Date(ajustement.presence.date) >= new Date(filters.dateDebut)
      );
    }

    if (filters.dateFin) {
      filtered = filtered.filter((ajustement: AjustementPresence) => 
        new Date(ajustement.presence.date) <= new Date(filters.dateFin)
      );
    }

    if (filters.statut) {
      filtered = filtered.filter((ajustement: AjustementPresence) => 
        ajustement.statut === filters.statut
      );
    }

    if (filters.typeAjustement) {
      filtered = filtered.filter((ajustement: AjustementPresence) => 
        ajustement.typeAjustement === filters.typeAjustement
      );
    }

    this.filteredAjustements = filtered;
    this.totalItems = filtered.length;
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  openForm(ajustement?: AjustementPresence): void {
    this.editingAjustement = ajustement || null;
    if (ajustement) {
      this.ajustementForm.patchValue(ajustement);
    } else {
      this.ajustementForm.reset();
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingAjustement = null;
    this.ajustementForm.reset();
  }

  getStatutColor(statut: string): string {
    const statutObj = this.statuts.find(s => s.value === statut);
    return statutObj ? statutObj.color : 'gray';
  }

  getMotifLabel(motif: string): string {
    const motifObj = this.motifs.find(m => m.value === motif);
    return motifObj ? motifObj.label : motif;
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getPaginatedData(): AjustementPresence[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.filteredAjustements.slice(startIndex, startIndex + this.pageSize);
  }
}
