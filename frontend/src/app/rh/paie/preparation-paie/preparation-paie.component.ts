import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
// Correction des imports
import { PaieService } from '../../services/paie.service';
import { EmployeService } from '../../services/employe.service';
import { PresenceService } from '../../services/presence.service';
import { PreparationPaie, StatutPreparationPaie, ElementVariable } from '../../models/paie.model';
import { Employe } from '../../models/employe.model';

// Correction de l'interface - utilisation du bon type ElementVariable
interface PreparationPaieExtended extends PreparationPaie {
  employe?: Employe;
  heuresNormales?: number;
  heuresSupplementaires?: number;
  // Utilisation du type ElementVariable existant au lieu de redéfinir
}

@Component({
  selector: 'app-preparation-paie',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './preparation-paie.component.html',
  styleUrls: ['./preparation-paie.component.css']
})
export class PreparationPaieComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Suppression de la déclaration dupliquée de dataSource
  dataSource = new MatTableDataSource<PreparationPaieExtended>([]);

  // Propriétés de filtres
  selectedPeriod: string = '';
  periods = [
    { value: '2024-01', label: 'Janvier 2024' },
    { value: '2024-02', label: 'Février 2024' },
    { value: '2024-03', label: 'Mars 2024' },
    { value: '2024-04', label: 'Avril 2024' },
    { value: '2024-05', label: 'Mai 2024' },
    { value: '2024-06', label: 'Juin 2024' }
  ];
  
  selectedDepartment: string = '';
  departments: any[] = [];
  
  selectedEmployee: string = '';
  employees: Employe[] = [];
  
  selectedStatus: string = '';

  // Propriétés de statistiques
  statistics = {
    totalEmployees: 0,
    preparationStatus: {
      termine: 0,
      valide: 0
    },
    totalHours: 0
  };

  // Propriétés d'étapes
  preparationSteps = {
    presenceImport: false,
    variableElements: false,
    calculations: false,
    validation: false
  };
  currentStep: string = 'presenceImport';

  // Propriétés de recherche et tableau
  searchTerm: string = '';
  displayedColumns: string[] = ['employe', 'periode', 'heures', 'elementsVariables', 'statut', 'actions'];
  pageSize: number = 25;
  totalItems: number = 0;

  // Autres propriétés
  filtresForm!: FormGroup;
  loading = false;
  etapesPreparation: any[] = [];

  constructor(
    private paieService: PaieService,
    private employeService: EmployeService,
    private presenceService: PresenceService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadData();
    this.loadEmployees();
    this.loadDepartments();
  }

  private initForm(): void {
    this.filtresForm = this.fb.group({
      periode: [''],
      departement: [''],
      employe: [''],
      statut: ['']
    });
  }

  // Méthodes de filtres
  onFilterChange(): void {
    this.loadData();
  }

  resetFilters(): void {
    this.selectedPeriod = '';
    this.selectedDepartment = '';
    this.selectedEmployee = '';
    this.selectedStatus = '';
    this.filtresForm.reset();
    this.loadData();
  }

  // Correction des méthodes d'actions
  importPresences(): void {
    this.loading = true;
    // Utiliser importerPresencesPourPaie au lieu de importPresences
    this.presenceService.importerPresencesPourPaie(this.selectedPeriod).subscribe({
      next: (response) => {
        this.snackBar.open('Import des présences effectué avec succès', 'Fermer', {
          duration: 3000
        });
        this.preparationSteps.presenceImport = true;
        this.currentStep = 'variableElements';
        this.loading = false;
        this.loadData();
      },
      error: (error) => {
        this.snackBar.open('Erreur lors de l\'import des présences', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  calculateAllPayroll(): void {
    this.loading = true;
    // Utiliser calculerPaieTous au lieu de calculateAllPayroll
    this.paieService.calculerPaieTous(this.selectedPeriod).subscribe({
      next: (response) => {
        this.snackBar.open('Calculs effectués avec succès', 'Fermer', {
          duration: 3000
        });
        this.preparationSteps.calculations = true;
        this.currentStep = 'validation';
        this.loading = false;
        this.loadData();
      },
      error: (error) => {
        this.snackBar.open('Erreur lors des calculs', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  validateAllPayroll(): void {
    this.loading = true;
    // Utiliser validerPreparationPaie au lieu de validateAllPayroll
    this.paieService.validerPreparationPaie(this.selectedPeriod).subscribe({
      next: (response) => {
        this.snackBar.open('Validation effectuée avec succès', 'Fermer', {
          duration: 3000
        });
        this.preparationSteps.validation = true;
        this.loading = false;
        this.loadData();
      },
      error: (error) => {
        this.snackBar.open('Erreur lors de la validation', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  resetPreparation(): void {
    this.loading = true;
    // Utiliser reinitialiserPreparationPaie au lieu de resetPreparation
    this.paieService.reinitialiserPreparationPaie(this.selectedPeriod).subscribe({
      next: (response) => {
        this.snackBar.open('Réinitialisation effectuée avec succès', 'Fermer', {
          duration: 3000
        });
        // Réinitialiser les étapes
        this.preparationSteps = {
          presenceImport: false,
          variableElements: false,
          calculations: false,
          validation: false
        };
        this.currentStep = 'presenceImport';
        this.loading = false;
        this.loadData();
      },
      error: (error) => {
        this.snackBar.open('Erreur lors de la réinitialisation', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  // Méthodes de recherche et tableau
  onSearch(): void {
    this.loadData();
  }

  getStatusColor(status: StatutPreparationPaie): string {
    switch (status) {
      case 'En cours': return 'warn';
      case 'Validée': return 'accent';
      case 'Finalisée': return 'primary';
      default: return 'basic';
    }
  }

  getStatusLabel(status: StatutPreparationPaie): string {
    switch (status) {
      case 'En cours': return 'En cours';
      case 'Validée': return 'Validée';
      case 'Finalisée': return 'Finalisée';
      default: return status;
    }
  }

  calculateIndividualPayroll(id: number): void {
    // Utiliser calculerPaieEmploye au lieu de calculateIndividualPayroll
    this.paieService.calculerPaieEmploye(id, this.selectedPeriod).subscribe({
      next: (response) => {
        this.snackBar.open('Calcul effectué', 'Fermer', {
          duration: 3000
        });
        this.loadData();
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du calcul', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  validateIndividualPayroll(id: number): void {
    // Utiliser validerPaie au lieu de validateIndividualPayroll
    this.paieService.validerPaie(id).subscribe({
      next: (response) => {
        this.snackBar.open('Validation effectuée', 'Fermer', {
          duration: 3000
        });
        this.loadData();
      },
      error: (error) => {
        this.snackBar.open('Erreur lors de la validation', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  resetIndividualPreparation(id: number): void {
    // Cette méthode n'existe pas dans le service, on peut utiliser une approche alternative
    // ou créer une méthode spécifique dans le service
    this.snackBar.open('Fonctionnalité de réinitialisation individuelle à implémenter', 'Fermer', {
      duration: 3000
    });
  }

  viewDetails(element: PreparationPaieExtended): void {
    console.log('Voir détails:', element);
    // Implémentation à ajouter selon vos besoins
  }

  private loadData(): void {
    this.loading = true;
    const filters = {
      periode: this.selectedPeriod,
      departementId: this.selectedDepartment ? parseInt(this.selectedDepartment) : undefined,
      employeId: this.selectedEmployee ? parseInt(this.selectedEmployee) : undefined,
      statut: this.selectedStatus as StatutPreparationPaie || undefined
    };

    // Correction 1: Utiliser getPreparationPaie au lieu de getPreparationsPaie
    this.paieService.getPreparationPaie(filters).subscribe({
      next: (response: PreparationPaie[]) => {
        // Correction 2: Adapter le traitement car la méthode retourne directement un tableau
        this.dataSource.data = response || [];
        this.totalItems = response?.length || 0;
        this.updateStatistics();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des données:', error);
        this.loading = false;
      }
    });
  }

  private updateStatistics(): void {
    const data = this.dataSource.data;
    this.statistics.totalEmployees = data.length;
    this.statistics.preparationStatus.termine = data.filter(item => item.statut === 'Finalisée').length;
    this.statistics.preparationStatus.valide = data.filter(item => item.statut === 'Validée').length;
    this.statistics.totalHours = data.reduce((total, item) => {
      return total + (item.heuresNormales || 0) + (item.heuresSupplementaires || 0);
    }, 0);
  }

  private loadEmployees(): void {
    this.employeService.getEmployes().subscribe({
      next: (response: any) => {
        this.employees = response.data || [];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des employés:', error);
      }
    });
  }

  private loadDepartments(): void {
    // Extraction des départements uniques des employés
    const uniqueDepartments = [...new Set(this.employees.map(emp => emp.departement))]
      .filter(dept => dept)
      .map(dept => ({ value: dept, label: dept }));
    this.departments = uniqueDepartments;
  }
}
