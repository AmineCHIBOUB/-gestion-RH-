import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { RapportsService } from '../../services/rapports.service';
import { EmployeService } from '../../services/employe.service';
import { DepartementService } from '../../services/departement.service';
import { RapportPaie, StatistiquesPaie } from '../../models/rapport-paie.model';
import { Employe } from '../../models/employe.model';
import { Departement } from '../../models/departement.model';

// Interface étendue pour les données de paie avec propriétés du template
interface PayrollDataExtended {
  id: number;
  employee: string;
  position: string;
  department: string;
  period: string;
  grossSalary: number;
  charges: number;
  netSalary: number;
  bonuses: number;
  status: 'paid' | 'pending' | 'cancelled';
}

// Interface étendue pour les statistiques avec propriétés du template
interface PayrollStatisticsExtended extends StatistiquesPaie {
  totalPayroll: number;
  totalEmployees: number;
  averageSalary: number;
  totalCharges: number;
  totalNet: number;
  totalGross: number;
  chargesRate: number;
  payrollCost: number;
}

// Interface pour les filtres
interface PayrollFilters {
  startDate: string;
  endDate: string;
  department: string;
  employee: string;
  payrollType: string;
}

@Component({
  selector: 'app-rapports-paie',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './rapports-paie.component.html',
  styleUrls: ['./rapports-paie.component.css']
})
export class RapportsPaieComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('evolutionChart') evolutionChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('departmentsChart') departmentsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoriesChart') categoriesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chargesChart') chargesChartRef!: ElementRef<HTMLCanvasElement>;

  filtreForm: FormGroup;
  rapportsPaie: RapportPaie[] = [];
  
  // Propriétés étendues pour correspondre au template
  statistics: PayrollStatisticsExtended = {
    totalPaie: 0,
    totalEmployes: 0,
    salaireMoyen: 0,
    totalCharges: 0,
    totalNet: 0,
    totalBrut: 0,
    tauxCharges: 0,
    coutPaie: 0,
    // Propriétés en anglais pour le template
    totalPayroll: 0,
    totalEmployees: 0,
    averageSalary: 0,
    totalGross: 0,
    chargesRate: 0,
    payrollCost: 0
  };
  
  employes: Employe[] = [];
  departements: Departement[] = [];
  departments: { id: number; name: string }[] = []; // Pour le template
  
  // Propriétés pour les filtres (utilisées dans le template)
  filters: PayrollFilters = {
    startDate: '',
    endDate: '',
    department: '',
    employee: '',
    payrollType: ''
  };
  
  // Propriétés pour les données étendues
  payrollData: PayrollDataExtended[] = [];
  filteredData: PayrollDataExtended[] = [];
  paginatedData: PayrollDataExtended[] = [];
  
  // Charts
  evolutionChart: Chart | null = null;
  departementsChart: Chart | null = null;
  categoriesChart: Chart | null = null;
  chargesChart: Chart | null = null;
  
  // Loading states
  loading = false;
  loadingStats = false;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  pageSize = 10; // Propriété utilisée dans le template
  
  // Sorting
  sortField = 'periode';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Search
  searchTerm = '';

  constructor(
    private fb: FormBuilder,
    private rapportsService: RapportsService,
    private employeService: EmployeService,
    private departementService: DepartementService
  ) {
    this.filtreForm = this.fb.group({
      dateDebut: [''],
      dateFin: [''],
      departement: [''],
      employe: [''],
      statut: ['']
    });
  }

  ngOnInit(): void {
    this.chargerDonnees();
    this.chargerEmployes();
    this.chargerDepartements();
    this.generateMockData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.genererGraphiques();
    }, 100);
  }

  // Générer des données mock pour les tests
  generateMockData(): void {
    this.payrollData = [
      {
        id: 1,
        employee: 'Jean Dupont',
        position: 'Développeur',
        department: 'IT',
        period: '2024-01',
        grossSalary: 4500,
        charges: 1350,
        netSalary: 3150,
        bonuses: 500,
        status: 'paid'
      },
      {
        id: 2,
        employee: 'Marie Martin',
        position: 'Designer',
        department: 'Marketing',
        period: '2024-01',
        grossSalary: 3800,
        charges: 1140,
        netSalary: 2660,
        bonuses: 200,
        status: 'paid'
      },
      {
        id: 3,
        employee: 'Pierre Durand',
        position: 'Manager',
        department: 'RH',
        period: '2024-01',
        grossSalary: 5200,
        charges: 1560,
        netSalary: 3640,
        bonuses: 800,
        status: 'pending'
      }
    ];
    
    this.departments = [
      { id: 1, name: 'IT' },
      { id: 2, name: 'Marketing' },
      { id: 3, name: 'RH' },
      { id: 4, name: 'Finance' }
    ];
    
    this.filteredData = [...this.payrollData];
    this.updatePaginatedData();
    this.calculateStatistics();
  }

  // Calculer les statistiques
  calculateStatistics(): void {
    const totalGross = this.filteredData.reduce((sum, item) => sum + item.grossSalary, 0);
    const totalCharges = this.filteredData.reduce((sum, item) => sum + item.charges, 0);
    const totalNet = this.filteredData.reduce((sum, item) => sum + item.netSalary, 0);
    const totalEmployees = this.filteredData.length;
    const averageSalary = totalEmployees > 0 ? totalGross / totalEmployees : 0;
    const chargesRate = totalGross > 0 ? (totalCharges / totalGross) * 100 : 0;
    const payrollCost = totalGross + totalCharges;

    this.statistics = {
      // Propriétés françaises (existantes)
      totalPaie: payrollCost,
      totalEmployes: totalEmployees,
      salaireMoyen: averageSalary,
      totalCharges: totalCharges,
      totalNet: totalNet,
      totalBrut: totalGross,
      tauxCharges: chargesRate,
      coutPaie: payrollCost,
      // Propriétés anglaises (pour le template)
      totalPayroll: payrollCost,
      totalEmployees: totalEmployees,
      averageSalary: averageSalary,
      totalGross: totalGross,
      chargesRate: chargesRate,
      payrollCost: payrollCost
    };
  }

  public chargerDonnees(): void {
    this.loading = true;
    const filters = {
      dateDebut: this.filtreForm.get('dateDebut')?.value,
      dateFin: this.filtreForm.get('dateFin')?.value,
      departementId: this.filtreForm.get('departement')?.value,
      employeId: this.filtreForm.get('employe')?.value,
      statut: this.filtreForm.get('statut')?.value
    };

    this.rapportsService.getRapportsPaie(filters).subscribe({
      next: (response: { data: RapportPaie[], total: number }) => {
        this.rapportsPaie = response.data;
        this.totalItems = response.total;
        this.generateMockData();
        this.calculateStatistics();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données:', error);
        this.loading = false;
      }
    });
  }

  public chargerEmployes(): void {
    this.employeService.getEmployes().subscribe({
      next: (employes: Employe[]) => {
        this.employes = employes;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des employés:', error);
      }
    });
  }

  public chargerDepartements(): void {
    this.departementService.getDepartements().subscribe({
      next: (departements: Departement[]) => {
        this.departements = departements;
        this.departments = departements.map(d => ({ id: d.id, name: d.name }));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des départements:', error);
      }
    });
  }

  public appliquerFiltres(): void {
    this.currentPage = 1;
    this.chargerDonnees();
  }

  // Supprimer les méthodes dupliquées et garder seulement les versions correctes
  public genererGraphiqueEvolution(): void {
    if (this.evolutionChartRef?.nativeElement) {
      const ctx = this.evolutionChartRef.nativeElement.getContext('2d');
      if (ctx) {
        if (this.evolutionChart) {
          this.evolutionChart.destroy();
        }
        
        // Données mock pour l'évolution
        const labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
        const data = [45000, 47000, 46500, 48000, 49500, 51000];
        
        this.evolutionChart = new Chart(ctx, {
          type: 'line' as ChartType,
          data: {
            labels: labels,
            datasets: [{
              label: 'Masse salariale (€)',
              data: data,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Évolution de la masse salariale'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value: any) {
                    return new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(value as number);
                  }
                }
              }
            }
          }
        });
      }
    }
  }

  public genererGraphiqueDepartements(): void {
    if (this.departmentsChartRef?.nativeElement) {
      const ctx = this.departmentsChartRef.nativeElement.getContext('2d');
      if (ctx) {
        if (this.departementsChart) {
          this.departementsChart.destroy();
        }
        
        // Données mock pour les départements
        const labels = ['IT', 'Marketing', 'RH', 'Finance'];
        const data = [35, 25, 20, 20];
        const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545'];
        
        this.departementsChart = new Chart(ctx, {
          type: 'pie' as ChartType,
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: colors
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Répartition par département'
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        });
      }
    }
  }

  public genererGraphiqueCategories(): void {
    if (this.categoriesChartRef?.nativeElement) {
      const ctx = this.categoriesChartRef.nativeElement.getContext('2d');
      if (ctx) {
        if (this.categoriesChart) {
          this.categoriesChart.destroy();
        }
        
        // Données mock pour les catégories
        const labels = ['Salaire de base', 'Primes', 'Heures sup.', 'Avantages'];
        const data = [65, 20, 10, 5];
        const colors = ['#007bff', '#28a745', '#ffc107', '#17a2b8'];
        
        this.categoriesChart = new Chart(ctx, {
          type: 'doughnut' as ChartType,
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: colors
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Catégories de paie'
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        });
      }
    }
  }

  public genererGraphiqueCharges(): void {
    if (this.chargesChartRef?.nativeElement) {
      const ctx = this.chargesChartRef.nativeElement.getContext('2d');
      if (ctx) {
        if (this.chargesChart) {
          this.chargesChart.destroy();
        }
        
        // Données mock pour les charges
        const labels = ['Charges patronales', 'Charges salariales'];
        const data = [22, 23]; // Pourcentages
        const colors = ['#dc3545', '#fd7e14'];
        
        this.chargesChart = new Chart(ctx, {
          type: 'bar' as ChartType,
          data: {
            labels: labels,
            datasets: [{
              label: 'Taux (%)',
              data: data,
              backgroundColor: colors
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Répartition des charges'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 30,
                ticks: {
                  callback: function(value: any) {
                    return value + '%';
                  }
                }
              }
            }
          }
        });
      }
    }
  }

  public applyFilters(): void {
    this.filterData();
  }

  public resetFilters(): void {
    this.filters = {
      startDate: '',
      endDate: '',
      department: '',
      employee: '',
      payrollType: ''
    };
    this.searchTerm = '';
    this.filterData();
  }

  public filterData(): void {
    this.filteredData = this.payrollData.filter(item => {
      const matchesSearch = !this.searchTerm || 
        item.employee.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesDepartment = !this.filters.department || 
        item.department === this.filters.department;
      
      const matchesEmployee = !this.filters.employee || 
        item.employee === this.filters.employee;
      
      return matchesSearch && matchesDepartment && matchesEmployee;
    });
    
    this.totalItems = this.filteredData.length;
    this.currentPage = 1;
    this.updatePaginatedData();
  }

  public sortData(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredData.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (field) {
        case 'employee':
          aValue = a.employee;
          bValue = b.employee;
          break;
        case 'department':
          aValue = a.department;
          bValue = b.department;
          break;
        case 'grossSalary':
          aValue = a.grossSalary;
          bValue = b.grossSalary;
          break;
        case 'netSalary':
          aValue = a.netSalary;
          bValue = b.netSalary;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  public reinitialiserFiltres(): void {
    this.filtreForm.reset();
    this.chargerDonnees();
  }

  public onSearch(): void {
    this.filterData();
  }

  public onSort(field: string): void {
    this.sortData(field);
  }

  public onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedData();
  }

  public genererGraphiques(): void {
    setTimeout(() => {
      this.genererGraphiqueEvolution();
      this.genererGraphiqueDepartements();
      this.genererGraphiqueCategories();
      this.genererGraphiqueCharges();
    }, 100);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  public goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  public getPageNumbers(): number[] {
    const pages: number[] = [];
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    
    // Afficher au maximum 5 pages
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Ajuster si on est près de la fin
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Garder seulement une version de chaque méthode d'export
  public exportToPDF(): void {
    console.log('Export PDF');
    // Implémentation de l'export PDF
  }

  public exportToExcel(): void {
    console.log('Export Excel');
    // Implémentation de l'export Excel
  }

  public printReport(): void {
    window.print();
  }

  public exporterPDF(): void {
    this.exportToPDF();
  }

  public exporterExcel(): void {
    this.exportToExcel();
  }

  public imprimer(): void {
    this.printReport();
  }

  public getStatusLabel(status: string): string {
    switch (status) {
      case 'paid': return 'Payé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  }

  public formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  public formatPercentage(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }

  get pages(): number[] {
    return this.getPageNumbers();
  }

  Math = Math;

  ngOnDestroy(): void {
    if (this.evolutionChart) {
      this.evolutionChart.destroy();
    }
    if (this.departementsChart) {
      this.departementsChart.destroy();
    }
    if (this.categoriesChart) {
      this.categoriesChart.destroy();
    }
    if (this.chargesChart) {
      this.chargesChart.destroy();
    }
  }
}
