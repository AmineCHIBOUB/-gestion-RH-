import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { RapportConges, CongeReport, CongeStatistics, CongeFilters } from '../../models/rapport.model';

// Enregistrer les composants Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-rapports-conges',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './rapports-conges.component.html',
  styleUrls: ['./rapports-conges.component.css']
})
export class RapportsCongesComponent implements OnInit {
  @ViewChild('evolutionChart', { static: false }) evolutionChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('typesChart', { static: false }) typesChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('departmentsChart', { static: false }) departmentsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('utilizationChart', { static: false }) utilizationChart!: ElementRef<HTMLCanvasElement>;

  conges: CongeReport[] = [];
  filteredConges: CongeReport[] = [];
  paginatedConges: CongeReport[] = [];
  departments: any[] = [];
  employees: any[] = [];
  
  statistics: CongeStatistics = {
    totalConges: 0,
    congesApprouves: 0,
    congesEnAttente: 0,
    congesRejetes: 0,
    totalJoursConges: 0,
    moyenneCongesParEmploye: 0,
    tauxUtilisationConges: 0
  };

  filters: CongeFilters = {
    startDate: '',
    endDate: '',
    department: '',
    employee: '',
    type: '',
    status: ''
  };

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Search and Sort
  searchTerm = '';
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  loading = false;

  // Charts
  evolutionChartInstance?: Chart;
  typesChartInstance?: Chart;
  departmentsChartInstance?: Chart;
  utilizationChartInstance?: Chart;

  constructor() { }

  ngOnInit(): void {
    this.initializeDates();
    this.loadDepartments();
    this.loadEmployees();
    this.loadConges();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private initializeDates(): void {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    
    this.filters.startDate = startOfYear.toISOString().split('T')[0];
    this.filters.endDate = endOfYear.toISOString().split('T')[0];
  }

  private loadDepartments(): void {
    // Simulation des données
    this.departments = [
      { id: 1, nom: 'Ressources Humaines' },
      { id: 2, nom: 'Informatique' },
      { id: 3, nom: 'Comptabilité' },
      { id: 4, nom: 'Commercial' },
      { id: 5, nom: 'Production' }
    ];
  }

  private loadEmployees(): void {
    // Simulation des données
    this.employees = [
      { id: 1, prenom: 'Jean', nom: 'Dupont', matricule: 'EMP001' },
      { id: 2, prenom: 'Marie', nom: 'Martin', matricule: 'EMP002' },
      { id: 3, prenom: 'Pierre', nom: 'Durand', matricule: 'EMP003' },
      { id: 4, prenom: 'Sophie', nom: 'Leroy', matricule: 'EMP004' },
      { id: 5, prenom: 'Michel', nom: 'Moreau', matricule: 'EMP005' }
    ];
  }

  private loadConges(): void {
    this.loading = true;
    
    // Simulation des données
    setTimeout(() => {
      this.conges = this.generateMockConges();
      this.applyFilters();
      this.calculateStatistics();
      this.updateCharts();
      this.loading = false;
    }, 1000);
  }

  private generateMockConges(): CongeReport[] {
    const conges: CongeReport[] = [];
    const types: ('conge_paye' | 'conge_maladie' | 'conge_maternite' | 'conge_formation' | 'rtt')[] = ['conge_paye', 'conge_maladie', 'conge_maternite', 'conge_formation', 'rtt'];
    const statuses: ('approuve' | 'en_attente' | 'rejete')[] = ['approuve', 'en_attente', 'rejete'];
    
    for (let i = 1; i <= 50; i++) {
      const startDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const duration = Math.floor(Math.random() * 15) + 1;
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + duration - 1);
      
      conges.push({
        id: i,
        employee: this.employees[Math.floor(Math.random() * this.employees.length)],
        type: types[Math.floor(Math.random() * types.length)],
        startDate,
        endDate,
        numberOfDays: duration,
        duration,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        requestDate: new Date(startDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        approvedBy: Math.random() > 0.5 ? 'Manager' : undefined,
        comment: Math.random() > 0.7 ? 'Commentaire sur le congé' : undefined
      });
    }
    
    return conges;
  }

  onFilterChange(): void {
    this.applyFilters();
    this.calculateStatistics();
    this.updateCharts();
  }

  private applyFilters(): void {
    this.filteredConges = this.conges.filter(conge => {
      const matchesDateRange = (!this.filters.startDate || conge.startDate >= new Date(this.filters.startDate)) &&
                              (!this.filters.endDate || conge.endDate <= new Date(this.filters.endDate));
      const matchesDepartment = !this.filters.department || conge.employee.department?.id.toString() === this.filters.department;
      const matchesEmployee = !this.filters.employee || conge.employee.id.toString() === this.filters.employee;
      const matchesType = !this.filters.type || conge.type === this.filters.type;
      const matchesStatus = !this.filters.status || conge.status === this.filters.status;
      const matchesSearch = !this.searchTerm || 
        conge.employee.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        conge.employee.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        conge.employee.matricule.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesDateRange && matchesDepartment && matchesEmployee && matchesType && matchesStatus && matchesSearch;
    });
    
    this.totalItems = this.filteredConges.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.currentPage = 1;
    this.updatePagination();
  }

  private calculateStatistics(): void {
    this.statistics.totalConges = this.filteredConges.length;
    this.statistics.congesApprouves = this.filteredConges.filter(c => c.status === 'approuve').length;
    this.statistics.congesEnAttente = this.filteredConges.filter(c => c.status === 'en_attente').length;
    this.statistics.congesRejetes = this.filteredConges.filter(c => c.status === 'rejete').length;
    this.statistics.totalJoursConges = this.filteredConges.reduce((sum, c) => sum + c.duration, 0);
    
    const uniqueEmployees = new Set(this.filteredConges.map(c => c.employee.id));
    this.statistics.moyenneCongesParEmploye = uniqueEmployees.size > 0 ? 
      Math.round((this.statistics.totalConges / uniqueEmployees.size) * 100) / 100 : 0;
    
    // Calcul du taux d'utilisation (exemple: sur 25 jours de congés par an)
    const totalEmployees = this.employees.length;
    const maxCongesPerYear = totalEmployees * 25;
    this.statistics.tauxUtilisationConges = maxCongesPerYear > 0 ? 
      Math.round((this.statistics.totalJoursConges / maxCongesPerYear) * 10000) / 100 : 0;
  }

  resetFilters(): void {
    this.filters = {
      startDate: '',
      endDate: '',
      department: '',
      employee: '',
      type: '',
      status: ''
    };
    this.searchTerm = '';
    this.initializeDates();
    this.onFilterChange();
  }

  onSearch(): void {
    this.applyFilters();
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.filteredConges.sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch (field) {
        case 'employee':
          valueA = `${a.employee.prenom} ${a.employee.nom}`;
          valueB = `${b.employee.prenom} ${b.employee.nom}`;
          break;
        case 'department':
          valueA = a.employee.department?.nom || '';
          valueB = b.employee.department?.nom || '';
          break;
        case 'type':
          valueA = a.type;
          valueB = b.type;
          break;
        case 'startDate':
          valueA = a.startDate;
          valueB = b.startDate;
          break;
        case 'endDate':
          valueA = a.endDate;
          valueB = b.endDate;
          break;
        case 'duration':
          valueA = a.duration;
          valueB = b.duration;
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        default:
          return 0;
      }
      
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.updatePagination();
  }

  // Pagination methods
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedConges = this.filteredConges.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, this.currentPage - halfVisible);
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Chart methods
  private initializeCharts(): void {
    this.createEvolutionChart();
    this.createTypesChart();
    this.createDepartmentsChart();
    this.createUtilizationChart();
  }

  private createEvolutionChart(): void {
    if (!this.evolutionChart?.nativeElement) return;
    
    const ctx = this.evolutionChart.nativeElement.getContext('2d');
    if (!ctx) return;
    
    // Données d'évolution par mois
    const monthlyData = this.getMonthlyEvolutionData();
    
    this.evolutionChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: monthlyData.labels,
        datasets: [{
          label: 'Congés Demandés',
          data: monthlyData.requested,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4
        }, {
          label: 'Congés Approuvés',
          data: monthlyData.approved,
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39, 174, 96, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  private createTypesChart(): void {
    if (!this.typesChart?.nativeElement) return;
    
    const ctx = this.typesChart.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const typeData = this.getTypeDistributionData();
    
    this.typesChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: typeData.labels,
        datasets: [{
          data: typeData.values,
          backgroundColor: [
            '#3498db',
            '#e74c3c',
            '#f39c12',
            '#9b59b6',
            '#1abc9c'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  private createDepartmentsChart(): void {
    if (!this.departmentsChart?.nativeElement) return;
    
    const ctx = this.departmentsChart.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const deptData = this.getDepartmentData();
    
    this.departmentsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: deptData.labels,
        datasets: [{
          label: 'Nombre de Congés',
          data: deptData.values,
          backgroundColor: '#3498db'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  private createUtilizationChart(): void {
    if (!this.utilizationChart?.nativeElement) return;
    
    const ctx = this.utilizationChart.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const utilizationData = this.getUtilizationData();
    
    this.utilizationChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: utilizationData.labels,
        datasets: [{
          label: 'Jours Utilisés',
          data: utilizationData.used,
          backgroundColor: '#27ae60'
        }, {
          label: 'Jours Restants',
          data: utilizationData.remaining,
          backgroundColor: '#ecf0f1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true,
            beginAtZero: true
          }
        }
      }
    });
  }

  private updateCharts(): void {
    if (this.evolutionChartInstance) {
      const monthlyData = this.getMonthlyEvolutionData();
      this.evolutionChartInstance.data.datasets[0].data = monthlyData.requested;
      this.evolutionChartInstance.data.datasets[1].data = monthlyData.approved;
      this.evolutionChartInstance.update();
    }
    
    if (this.typesChartInstance) {
      const typeData = this.getTypeDistributionData();
      this.typesChartInstance.data.datasets[0].data = typeData.values;
      this.typesChartInstance.update();
    }
    
    if (this.departmentsChartInstance) {
      const deptData = this.getDepartmentData();
      this.departmentsChartInstance.data.datasets[0].data = deptData.values;
      this.departmentsChartInstance.update();
    }
    
    if (this.utilizationChartInstance) {
      const utilizationData = this.getUtilizationData();
      this.utilizationChartInstance.data.datasets[0].data = utilizationData.used;
      this.utilizationChartInstance.data.datasets[1].data = utilizationData.remaining;
      this.utilizationChartInstance.update();
    }
  }

  private destroyCharts(): void {
    if (this.evolutionChartInstance) {
      this.evolutionChartInstance.destroy();
    }
    if (this.typesChartInstance) {
      this.typesChartInstance.destroy();
    }
    if (this.departmentsChartInstance) {
      this.departmentsChartInstance.destroy();
    }
    if (this.utilizationChartInstance) {
      this.utilizationChartInstance.destroy();
    }
  }

  private getMonthlyEvolutionData(): any {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const requested = new Array(12).fill(0);
    const approved = new Array(12).fill(0);
    
    this.filteredConges.forEach(conge => {
      const month = conge.requestDate.getMonth();
      requested[month]++;
      if (conge.status === 'approuve') {
        approved[month]++;
      }
    });
    
    return {
      labels: months,
      requested,
      approved
    };
  }

  private getTypeDistributionData(): any {
    const typeLabels: { [key: string]: string } = {
      'conge_paye': 'Congé Payé',
      'conge_maladie': 'Congé Maladie',
      'conge_maternite': 'Congé Maternité',
      'conge_formation': 'Congé Formation',
      'rtt': 'RTT'
    };
    
    const typeCounts: { [key: string]: number } = {};
    
    this.filteredConges.forEach(conge => {
      typeCounts[conge.type] = (typeCounts[conge.type] || 0) + 1;
    });
    
    return {
      labels: Object.keys(typeCounts).map(type => typeLabels[type] || type),
      values: Object.values(typeCounts)
    };
  }

  private getDepartmentData(): any {
    const deptCounts: { [key: string]: number } = {};
    
    this.filteredConges.forEach(conge => {
      const deptName = conge.employee.department?.nom || 'Non assigné';
      deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
    });
    
    return {
      labels: Object.keys(deptCounts),
      values: Object.values(deptCounts)
    };
  }

  private getUtilizationData(): any {
    const employeeUtilization: { [key: string]: { used: number, total: number } } = {};
    
    this.filteredConges.forEach(conge => {
      if (conge.status === 'approuve') {
        const empName = `${conge.employee.prenom} ${conge.employee.nom}`;
        if (!employeeUtilization[empName]) {
          employeeUtilization[empName] = { used: 0, total: 25 }; // 25 jours par défaut
        }
        employeeUtilization[empName].used += conge.duration;
      }
    });
    
    const labels = Object.keys(employeeUtilization);
    const used = labels.map(emp => employeeUtilization[emp].used);
    const remaining = labels.map(emp => Math.max(0, employeeUtilization[emp].total - employeeUtilization[emp].used));
    
    return { labels, used, remaining };
  }

  // Export methods
  exportToPDF(): void {
    console.log('Export PDF des rapports de congés');
    // Implémentation de l'export PDF
  }

  exportToExcel(): void {
    console.log('Export Excel des rapports de congés');
    // Implémentation de l'export Excel
  }

  printReport(): void {
    window.print();
  }

  // Utility methods
  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'conge_paye': 'Congé Payé',
      'conge_maladie': 'Congé Maladie',
      'conge_maternite': 'Congé Maternité',
      'conge_formation': 'Congé Formation',
      'rtt': 'RTT'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'approuve': 'Approuvé',
      'en_attente': 'En Attente',
      'rejete': 'Rejeté'
    };
    return labels[status] || status;
  }

  Math = Math;
}
