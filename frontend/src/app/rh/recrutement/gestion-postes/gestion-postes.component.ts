import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips'; // Ajout pour mat-chip
import { MatDividerModule } from '@angular/material/divider'; // Ajout pour mat-divider
import { PosteService } from '../../services/poste.service';
import { DepartementService } from '../../services/departement.service';
import { Poste, PosteRequest, PosteUpdateRequest } from '../../models/poste.model';
import { Departement } from '../../models/departement.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-postes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, // Ajouté pour ngModel
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatDividerModule // Ajout pour résoudre l'erreur mat-divider
  ],
  templateUrl: './gestion-postes.component.html',
  styleUrls: ['./gestion-postes.component.css']
})
export class GestionPostesComponent implements OnInit {
  postes: Poste[] = [];
  filteredPostes: Poste[] = [];
  departements: Departement[] = [];
  departments: Departement[] = []; // Alias pour le template
  filterForm!: FormGroup;
  posteForm!: FormGroup;
  loading = false;
  showForm = false;
  editingPoste: Poste | null = null;
  isEditing = false;
  
  // CORRECTION 1: Supprimer selectedDepartement et garder seulement selectedDepartment
  selectedDepartment: string = ''; // Garder cette propriété pour le template
  selectedContractType: 'CDI' | 'CDD' | 'Stage' | 'Freelance' | '' = '';
  selectedStatus: 'ouvert' | 'ferme' | 'pourvue' | '' = '';
  searchTerm: string = '';
  
  // CORRECTION 2: Supprimer la propriété onSearch: string = ''; qui entre en conflit
  // onSearch: string = ''; // SUPPRIMER CETTE LIGNE
  
  dataSource: any[] = [];
  pageSize = 10;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Tri
  sortField = 'titre';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  displayedColumns = [
    'titre',
    'departement',
    'typeContrat',
    'salaire',
    'statut',
    'dateCreation',
    'candidatures',
    'actions'
  ];
  
  typeContratOptions: { value: 'CDI' | 'CDD' | 'Stage' | 'Freelance'; label: string }[] = [
    { value: 'CDI', label: 'CDI' },
    { value: 'CDD', label: 'CDD' },
    { value: 'Stage', label: 'Stage' },
    { value: 'Freelance', label: 'Freelance' }
  ];
  
  statutOptions: { value: 'ouvert' | 'ferme' | 'pourvue'; label: string }[] = [
    { value: 'ouvert', label: 'Ouvert' },
    { value: 'ferme', label: 'Fermé' },
    { value: 'pourvue', label: 'Pourvue' }
  ];

  constructor(
    private fb: FormBuilder,
    private posteService: PosteService,
    private departementService: DepartementService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadDepartements();
    this.loadPostes();
    this.setupFilters();
  }

  // CORRECTION 3: Garder seulement la méthode onSearch
  onSearch(): void {
    this.applyFiltersAndSort();
  }

  initializeForms(): void {
    this.filterForm = this.fb.group({
      search: [''],
      departement: [''],
      typeContrat: [''],
      statut: ['']
    });
  
    this.posteForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      departementId: ['', Validators.required],
      typeContrat: ['', Validators.required],
      salaire: [''],
      salaireMin: [''],
      salaireMax: [''],
      experience: [''],
      competences: [[] as string[]], // Correction du type
      formation: [''],
      statut: ['ouvert', Validators.required],
      dateLimite: ['']
    });
  }

  loadDepartements(): void {
    this.departementService.getDepartements().subscribe({
      next: (departements: any) => {
        this.departements = departements;
        this.departments = departements; // Alias pour le template
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des départements:', error);
      }
    });
  }

  loadPostes(): void {
    this.loading = true;
    const filters = this.getFilters();
    
    this.posteService.getPostes(filters).subscribe({
      next: (response: any) => {
        this.postes = response.data || response;
        this.totalItems = response.total || response.length || 0;
        this.applyFiltersAndSort();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des postes:', error);
        this.loading = false;
      }
    });
  }

  setupFilters(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadPostes();
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
    let filtered = [...this.postes];

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

    this.filteredPostes = filtered;
  }

  getFieldValue(obj: any, field: string): any {
    return field.split('.').reduce((o, f) => o && o[f], obj);
  }

  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.loadPostes();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPostes();
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  showAddForm(): void {
    this.editingPoste = null;
    this.posteForm.reset();
    this.posteForm.patchValue({ statut: 'ouvert' });
    this.showForm = true;
  }

  editPoste(poste: Poste): void {
    this.editingPoste = poste;
    this.posteForm.patchValue(poste);
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingPoste = null;
    this.posteForm.reset();
  }

  // Ajout de la méthode onSubmit manquante
  onSubmit(): void {
    if (this.posteForm.valid) {
      this.savePoste();
    }
  }
  
  // CORRECTION 4: Corriger la méthode savePoste pour les types
  savePoste(): void {
    if (this.posteForm.valid) {
      const formValue = this.posteForm.value;
      
      if (this.isEditing && this.editingPoste) {
        // Pour la mise à jour, utiliser PosteUpdateRequest
        const posteUpdateData: PosteUpdateRequest = {
          titre: formValue.titre,
          description: formValue.description,
          departementId: formValue.departementId,
          typeContrat: formValue.typeContrat,
          salaire: formValue.salaire,
          salaireMin: formValue.salaireMin,
          salaireMax: formValue.salaireMax,
          experience: formValue.experience,
          competences: Array.isArray(formValue.competences) 
            ? formValue.competences 
            : formValue.competences ? [formValue.competences] : [],
          formation: formValue.formation,
          statut: formValue.statut
        };

        this.posteService.updatePoste(this.editingPoste.id!, posteUpdateData).subscribe({
          next: (response: any) => {
            this.snackBar.open('Poste modifié avec succès', 'Fermer', { duration: 3000 });
            this.loadPostes();
            this.cancelForm();
          },
          error: (error: any) => {
            console.error('Erreur lors de la modification:', error);
            this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
          }
        });
      } else {
        // Pour la création, utiliser PosteRequest
        const posteData: PosteRequest = {
          titre: formValue.titre,
          description: formValue.description,
          departementId: formValue.departementId,
          typeContrat: formValue.typeContrat,
          salaire: formValue.salaire,
          salaireMin: formValue.salaireMin,
          salaireMax: formValue.salaireMax,
          experience: formValue.experience,
          competences: Array.isArray(formValue.competences) 
            ? formValue.competences 
            : formValue.competences ? [formValue.competences] : [],
          formation: formValue.formation,
          statut: formValue.statut
        };

        this.posteService.createPoste(posteData).subscribe({
          next: (response: any) => {
            this.snackBar.open('Poste créé avec succès', 'Fermer', { duration: 3000 });
            this.loadPostes();
            this.cancelForm();
          },
          error: (error: any) => {
            console.error('Erreur lors de la création:', error);
            this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
          }
        });
      }
    }
  }

  // CORRECTION 5: Corriger la méthode duplicatePoste
  duplicatePoste(poste: Poste): void {
    const posteRequest: PosteRequest = {
      titre: `${poste.titre} (Copie)`,
      description: poste.description,
      departementId: poste.departementId,
      typeContrat: poste.typeContrat,
      salaire: poste.salaire,
      salaireMin: poste.salaireMin,
      salaireMax: poste.salaireMax,
      experience: poste.experience || '',
      competences: poste.competences || [],
      formation: poste.formation,
      statut: 'ouvert'
    };
    
    this.posteService.createPoste(posteRequest).subscribe({
      next: (response: any) => {
        this.snackBar.open('Poste dupliqué avec succès', 'Fermer', { duration: 3000 });
        this.loadPostes();
      },
      error: (error: any) => {
        console.error('Erreur lors de la duplication:', error);
        this.snackBar.open('Erreur lors de la duplication', 'Fermer', { duration: 3000 });
      }
    });
  }

  changeStatus(poste: Poste, newStatus: string): void {
    this.posteService.updatePoste(poste.id, { statut: newStatus } as any).subscribe({
      next: (response: any) => {
        this.snackBar.open('Statut mis à jour avec succès', 'Fermer', { duration: 3000 });
        this.loadPostes();
      },
      error: (error: any) => {
        console.error('Erreur lors du changement de statut:', error);
        this.snackBar.open('Erreur lors du changement de statut', 'Fermer', { duration: 3000 });
      }
    });
  }

  deletePoste(poste: Poste): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le poste "${poste.titre}" ?`)) {
      this.posteService.deletePoste(poste.id).subscribe({
        next: (response: any) => {
          this.snackBar.open('Poste supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadPostes();
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  changerStatut(poste: Poste, nouveauStatut: 'ouvert' | 'ferme' | 'pourvue'): void {
    this.posteService.updatePoste(poste.id, { statut: nouveauStatut } as any).subscribe({
      next: (response: any) => {
        this.snackBar.open('Statut mis à jour avec succès', 'Fermer', { duration: 3000 });
        this.loadPostes();
      },
      error: (error: any) => {
        console.error('Erreur lors du changement de statut:', error);
        this.snackBar.open('Erreur lors du changement de statut', 'Fermer', { duration: 3000 });
      }
    });
  }

  voirCandidatures(poste: Poste): void {
    // Navigation vers les candidatures du poste
    console.log('Voir candidatures pour:', poste);
  }

  getStatutColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'ouvert': 'primary',
      'ferme': 'warn',
      'pourvue': 'accent'
    };
    return colors[statut] || 'default';
  }

  getDepartementNom(departementId: number): string {
    const departement = this.departements.find(d => d.id === departementId);
    return departement ? departement.name : '';
  }

  onFilterChange(): void {
    this.applyFiltersAndSort();
  }
  
  resetFilters(): void {
    this.clearFilters();
  }
  
  exportPostes(): void {
    // Logique d'exportation des postes
    const csvData = this.filteredPostes.map(poste => ({
      titre: poste.titre,
      departement: this.getDepartementNom(poste.departementId),
      typeContrat: poste.typeContrat,
      salaire: poste.salaire,
      statut: poste.statut,
      dateCreation: poste.dateCreation
    }));
    
    // Conversion en CSV et téléchargement
    const csvContent = this.convertToCSV(csvData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'postes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
  
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    
    return [headers, ...rows].join('\n');
  }

  // Méthodes manquantes pour les chips et autres fonctionnalités
  getContractTypeColor(typeContrat: string): string {
    const colors: { [key: string]: string } = {
      'CDI': 'primary',
      'CDD': 'accent',
      'Stage': 'warn',
      'Freelance': 'basic'
    };
    return colors[typeContrat] || 'basic';
  }

  getContractTypeLabel(typeContrat: string): string {
    const labels: { [key: string]: string } = {
      'CDI': 'CDI',
      'CDD': 'CDD', 
      'Stage': 'Stage',
      'Freelance': 'Freelance'
    };
    return labels[typeContrat] || typeContrat;
  }

  getStatusColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'ouvert': 'primary',
      'ferme': 'warn',
      'pourvue': 'accent'
    };
    return colors[statut] || 'basic';
  }

  getStatusLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'ouvert': 'Ouvert',
      'ferme': 'Fermé',
      'pourvue': 'Pourvue'
    };
    return labels[statut] || statut;
  }

  isExpired(dateLimite: string): boolean {
    return new Date(dateLimite) < new Date();
  }

  // Getters pour contourner les erreurs *ngIf
  get isLoading(): boolean {
    return this.loading;
  }
  
  get isNotLoading(): boolean {
    return !this.loading;
  }
  
  get hasPostes(): boolean {
    return this.filteredPostes.length > 0;
  }
}
