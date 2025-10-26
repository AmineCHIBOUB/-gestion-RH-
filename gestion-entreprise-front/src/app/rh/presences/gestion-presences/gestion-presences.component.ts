import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Presence, StatistiquesPresence, StatutPresence } from '../../models/presence.model';
import { Employe } from '../../models/employe.model';
import { PresenceService } from '../../services/presence.service';
import { EmployeService } from '../../services/employe.service';

@Component({
  selector: 'app-gestion-presences',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './gestion-presences.component.html',
  styleUrls: ['./gestion-presences.component.css']
})
export class GestionPresencesComponent implements OnInit, AfterViewInit {
  presences: Presence[] = [];
  filteredPresences: Presence[] = [];
  dataSource = new MatTableDataSource<Presence>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterForm!: FormGroup;
  loading = false;

  statistics: StatistiquesPresence = {
    totalPresences: 0,
    totalAbsences: 0,
    totalRetards: 0,
    totalHeuresTravaillees: 0,
    totalHeuresSupplementaires: 0,
    tauxPresence: 0,
    moyenneHeuresParJour: 0,
    totalEmployes: 0,
    presentsAujourdhui: 0,
    absentsAujourdhui: 0,
    retardsAujourdhui: 0
  };
  
  // Pagination
  pageSize = 25;
  totalItems = 0;
  
  // Options pour les filtres
  employees: Employe[] = [];
  departments: string[] = [];
  statusOptions: StatutPresence[] = ['Présent', 'Absent', 'Retard', 'Congé', 'Maladie', 'Formation'];
  
  // Propriétés de filtres
  selectedDate: Date | null = null;
  selectedDepartment: string = '';
  selectedEmployee: number | null = null;
  selectedStatus: string = '';
  searchTerm: string = '';
  
  displayedColumns: string[] = ['employe', 'date', 'heures', 'statut', 'heuresSupplementaires', 'actions'];

  constructor(
    private fb: FormBuilder,
    private presenceService: PresenceService,
    private employeService: EmployeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      dateDebut: [''],
      dateFin: [''],
      employeId: [''],
      departement: [''],
      statut: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.loadEmployees();
    this.loadDepartments();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData(): void {
    this.loading = true;
    const filters = this.filterForm.value;
    
    this.presenceService.getPresences(filters).subscribe({
      next: (response) => {
        this.presences = response.data;
        this.totalItems = response.total;
        this.dataSource.data = this.presences;
        this.calculateStatistics();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des présences:', error);
        this.loading = false;
      }
    });
  }

  loadEmployees(): void {
    this.employeService.getEmployes().subscribe({
      next: (employes) => {
        this.employees = employes;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des employés:', error);
      }
    });
  }

  loadDepartments(): void {
    this.presenceService.getDepartements().subscribe({
      next: (departments) => {
        this.departments = departments;
      }
    });
  }

  calculateStatistics(): void {
    // Calcul des statistiques basé sur les présences chargées
    this.statistics = {
      totalPresences: this.presences.filter(p => p.statut === 'Présent').length,
      totalAbsences: this.presences.filter(p => p.statut === 'Absent').length,
      totalRetards: this.presences.filter(p => p.statut === 'Retard').length,
      totalHeuresTravaillees: this.presences.reduce((sum, p) => sum + p.heuresTravaillees, 0),
      totalHeuresSupplementaires: this.presences.reduce((sum, p) => sum + p.heuresSupplementaires, 0),
      tauxPresence: this.presences.length > 0 ? (this.presences.filter(p => p.statut === 'Présent').length / this.presences.length) * 100 : 0,
      moyenneHeuresParJour: this.presences.length > 0 ? this.presences.reduce((sum, p) => sum + p.heuresTravaillees, 0) / this.presences.length : 0,
      totalEmployes: this.employees.length,
      presentsAujourdhui: this.presences.filter(p => p.statut === 'Présent' && this.isToday(p.date)).length,
      absentsAujourdhui: this.presences.filter(p => p.statut === 'Absent' && this.isToday(p.date)).length,
      retardsAujourdhui: this.presences.filter(p => p.statut === 'Retard' && this.isToday(p.date)).length
    };
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    const checkDate = new Date(date);
    return checkDate.toDateString() === today.toDateString();
  }

  applyFilters(): void {
    this.loadData();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.loadData();
  }

  addPresence(): void {
    // Ouvrir dialog pour ajouter une présence
  }

  editPresence(presence: Presence): void {
    // Ouvrir dialog pour modifier une présence
  }

  deletePresence(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette présence ?')) {
      this.presenceService.deletePresence(id).subscribe({
        next: () => {
          this.loadData();
          this.showSnackBar('Présence supprimée avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.showSnackBar('Erreur lors de la suppression');
        }
      });
    }
  }

  validatePresence(id: number): void {
    this.presenceService.updatePresence(id, { statut: 'Présent' }).subscribe({
      next: () => {
        this.loadData();
        this.showSnackBar('Présence validée avec succès');
      }
    });
  }

  exportPresences(): void {
    const filters = this.filterForm.value;
    this.presenceService.exportPresences(filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'presences.xlsx';
        a.click();
      }
    });
  }

  importPresences(): void {
    // Ouvrir dialog pour importer des présences
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Présent': return 'primary';
      case 'Absent': return 'warn';
      case 'Retard': return 'accent';
      case 'Congé': return 'primary';
      case 'Maladie': return 'warn';
      case 'Formation': return 'accent';
      default: return 'basic';
    }
  }

  getStatusLabel(status: string): string {
    return status;
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000
    });
  }
}
