import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { Sort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface BulletinPaie {
  id: number;
  employe_id: number;
  mois: number;
  annee: number;
  salaire_base: number;
  heures_travaillees: number;
  primes: number;
  bonus: number;
  deductions: number;
  cotisations_sociales: number;
  impots: number;
  salaire_net: number;
  statut: string;
  date_generation: string;
  employe: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    salaire: number;
    user: {
      nom: string;
      prenom: string;
    };
    post?: {
      titre: string;
    };
    department?: {
      name: string;
    };
  };
}

export interface GenerationResult {
  success: boolean;
  message: string;
  bulletins_generes: number;
  details: any[];
  erreurs: string[];
  periode: {
    mois: number;
    annee: number;
  };
}

export interface Stats {
  totalBulletins: number;
  bulletinsGeneres: number;
  enAttente: number;
  montantTotal: number;
}

@Component({
  selector: 'app-calcul-paie',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatTabsModule
  ],
  templateUrl: './calcul-paie.component.html',
  styleUrls: ['./calcul-paie.component.css']
})
export class CalculPaieComponent implements OnInit {
  bulletins: BulletinPaie[] = [];
  filteredBulletins: BulletinPaie[] = [];
  stats: Stats = {
    totalBulletins: 0,
    bulletinsGeneres: 0,
    enAttente: 0,
    montantTotal: 0
  };

  // Forms
  filterForm!: FormGroup;
  generationForm!: FormGroup;

  // UI State
  loading = false;
  generating = false;
  showGenerationForm = false;
  selectedTab = 0;

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  sortField = 'date_generation';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Table columns
  displayedColumns: string[] = [
    'employe',
    'departement',
    'periode',
    'heures_travaillees',
    'salaire_base',
    'impots',
    'salaire_net',
    'statut',
    'actions'
  ];

  // Options
  moisOptions = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];

  anneeOptions: number[] = [];
  statutOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'genere', label: 'Généré' },
    { value: 'valide', label: 'Validé' },
    { value: 'envoye', label: 'Envoyé' }
  ];

  private apiUrl = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.initializeForms();
    this.initializeYearOptions();
  }

  ngOnInit(): void {
    this.loadBulletins();
  }

  private initializeForms(): void {
    this.filterForm = this.fb.group({
      recherche: [''],
      mois: [''],
      annee: [''],
      statut: [''],
      departement: ['']
    });

    this.generationForm = this.fb.group({
      mois: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
      annee: [new Date().getFullYear(), [Validators.required, Validators.min(2020)]]
    });

    // Subscribe to filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private initializeYearOptions(): void {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 5; year--) {
      this.anneeOptions.push(year);
    }
  }

  loadBulletins(): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/bulletins/all`).subscribe({
      next: (response) => {
        this.bulletins = response.data || response.bulletins || [];
        this.applyFilters();
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des bulletins:', error);
        this.snackBar.open('Erreur lors du chargement des bulletins', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private calculateStats(): void {
    this.stats = {
      totalBulletins: this.bulletins.length,
      bulletinsGeneres: this.bulletins.filter(b => b.statut === 'genere').length,
      enAttente: this.bulletins.filter(b => b.statut === 'en_attente').length,
      montantTotal: this.bulletins.reduce((sum, b) => sum + (b.salaire_net || 0), 0)
    };
  }

  applyFilters(): void {
    let filtered = [...this.bulletins];
    const filters = this.filterForm.value;

    if (filters.recherche) {
      const search = filters.recherche.toLowerCase();
      filtered = filtered.filter(b => 
        b.employe?.user?.nom?.toLowerCase().includes(search) ||
        b.employe?.user?.prenom?.toLowerCase().includes(search) ||
        b.employe?.email?.toLowerCase().includes(search)
      );
    }

    if (filters.mois) {
      filtered = filtered.filter(b => b.mois === filters.mois);
    }

    if (filters.annee) {
      filtered = filtered.filter(b => b.annee === filters.annee);
    }

    if (filters.statut) {
      filtered = filtered.filter(b => b.statut === filters.statut);
    }

    if (filters.departement) {
      filtered = filtered.filter(b => 
        b.employe?.department?.name?.toLowerCase().includes(filters.departement.toLowerCase())
      );
    }

    this.filteredBulletins = filtered;
    this.totalItems = filtered.length;
    this.pageIndex = 0;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getPaginatedData(): BulletinPaie[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredBulletins.slice(startIndex, startIndex + this.pageSize);
  }

  sortData(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc';
    
    this.filteredBulletins.sort((a, b) => {
      const isAsc = this.sortDirection === 'asc';
      switch (sort.active) {
        case 'employe':
          return this.compare(a.employe?.user?.nom || '', b.employe?.user?.nom || '', isAsc);
        case 'periode':
          return this.compare(`${a.annee}-${a.mois}`, `${b.annee}-${b.mois}`, isAsc);
        case 'salaire_net':
          return this.compare(a.salaire_net, b.salaire_net, isAsc);
        case 'date_generation':
          return this.compare(new Date(a.date_generation), new Date(b.date_generation), isAsc);
        default:
          return 0;
      }
    });
  }

  private compare(a: string | number | Date, b: string | number | Date, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  // Generation functions
  openGenerationForm(): void {
    this.showGenerationForm = true;
  }

  closeGenerationForm(): void {
    this.showGenerationForm = false;
    this.generationForm.reset({
      mois: new Date().getMonth() + 1,
      annee: new Date().getFullYear()
    });
  }

  generateBulletins(): void {
    if (this.generationForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', { duration: 3000 });
      return;
    }

    const formData = this.generationForm.value;
    this.generating = true;

    this.http.post<GenerationResult>(`${this.apiUrl}/bulletins/generate-all`, formData).subscribe({
      next: (response) => {
        this.generating = false;
        this.closeGenerationForm();
        
        if (response.success) {
          this.snackBar.open(
            `${response.bulletins_generes} bulletins générés avec succès`, 
            'Fermer', 
            { duration: 5000 }
          );
          
          if (response.erreurs && response.erreurs.length > 0) {
            console.warn('Erreurs lors de la génération:', response.erreurs);
          }
          
          this.loadBulletins(); // Reload data
        } else {
          this.snackBar.open(response.message || 'Erreur lors de la génération', 'Fermer', { duration: 3000 });
        }
      },
      error: (error) => {
        this.generating = false;
        console.error('Erreur lors de la génération:', error);
        this.snackBar.open('Erreur lors de la génération des bulletins', 'Fermer', { duration: 3000 });
      }
    });
  }

  // Action functions
  downloadBulletin(bulletin: BulletinPaie): void {
    this.http.get(`${this.apiUrl}/bulletins/${bulletin.id}/download`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bulletin_${bulletin.employe?.user?.nom}_${bulletin.mois}_${bulletin.annee}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
        this.snackBar.open('Erreur lors du téléchargement', 'Fermer', { duration: 3000 });
      }
    });
  }

  downloadAllBulletins(): void {
    const filters = this.filterForm.value;
    if (!filters.mois || !filters.annee) {
      this.snackBar.open('Veuillez sélectionner un mois et une année pour télécharger', 'Fermer', { duration: 3000 });
      return;
    }

    this.http.get(`${this.apiUrl}/bulletins/download-all/${filters.mois}/${filters.annee}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bulletins_${filters.mois}_${filters.annee}.zip`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
        this.snackBar.open('Erreur lors du téléchargement', 'Fermer', { duration: 3000 });
      }
    });
  }

  viewDetails(bulletin: BulletinPaie): void {
    // Open dialog with bulletin details
    console.log('Voir détails:', bulletin);
  }

  deleteBulletin(bulletin: BulletinPaie): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bulletin ?')) {
      this.http.delete(`${this.apiUrl}/bulletins/${bulletin.id}`).subscribe({
        next: () => {
          this.snackBar.open('Bulletin supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadBulletins();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  // Utility functions
  getStatutColor(statut: string): string {
    switch (statut) {
      case 'genere': return 'primary';
      case 'valide': return 'accent';
      case 'envoye': return 'warn';
      default: return '';
    }
  }

  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'genere': return 'check_circle';
      case 'valide': return 'verified';
      case 'envoye': return 'send';
      default: return 'pending';
    }
  }

  formatCurrency(amount: number | string): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount || 0;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(numericAmount);
  }

  formatPeriode(mois: number, annee: number): string {
    const moisLabel = this.moisOptions.find(m => m.value === mois)?.label || mois.toString();
    return `${moisLabel} ${annee}`;
  }

  get hasNoData(): boolean {
    return !this.loading && this.filteredBulletins.length === 0;
  }
}