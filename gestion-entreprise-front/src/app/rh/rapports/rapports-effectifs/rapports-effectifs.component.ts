import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { 
  RapportEffectifs, 
  RepartitionDepartement, 
  PyramideAge, 
  EffectifData, 
  EffectifStatistics,
  EffectifFilters 
} from '../../models/rapport.model';

// Interface étendue pour correspondre au template HTML
interface EffectifDataExtended {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  position: string;
  contractType: string;
  startDate: Date;
  seniority: string;
  age: number;
  status: string;
}

@Component({
  selector: 'app-rapports-effectifs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rapports-effectifs.component.html',
  styleUrls: ['./rapports-effectifs.component.css']
})
export class RapportsEffectifsComponent implements OnInit, AfterViewInit, OnDestroy {
  rapport: RapportEffectifs | null = null;
  
  @ViewChild('evolutionChart', { static: false }) evolutionChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('departmentsChart', { static: false }) departmentsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('contractsChart', { static: false }) contractsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ageChart', { static: false }) ageChart!: ElementRef<HTMLCanvasElement>;
  
  effectifs: EffectifDataExtended[] = [];
  filteredEffectifs: EffectifDataExtended[] = [];
  paginatedEffectifs: EffectifDataExtended[] = [];
  departments: any[] = [];
  
  // Propriétés pour le template HTML
  filteredData: EffectifDataExtended[] = [];
  paginatedData: EffectifDataExtended[] = [];
  
  statistics: EffectifStatistics & {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    newEmployees: number;
    departingEmployees: number;
    turnoverRate: number;
    averageSeniority: number;
    contractTypes: string;
  } = {
    totalEmployes: 0,
    employesActifs: 0,
    employesInactifs: 0,
    nouveauxEmployes: 0,
    departsEmployes: 0,
    tauxRotation: 0,
    ancienneteMoyenne: 0,
    repartitionContrats: {},
    // Propriétés supplémentaires pour le template
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    newEmployees: 0,
    departingEmployees: 0,
    turnoverRate: 0,
    averageSeniority: 0,
    contractTypes: ''
  };

  filters: EffectifFilters = {
    startDate: '',
    endDate: '',
    department: '',
    status: '',
    contractType: ''
  };

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  searchTerm = '';
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  loading = false;

  evolutionChartInstance?: Chart;
  departmentsChartInstance?: Chart;
  contractsChartInstance?: Chart;
  ageChartInstance?: Chart;

  ngOnInit(): void {
    this.initializeDates();
    this.loadDepartments();
    this.loadEffectifs();
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
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    this.filters.startDate = firstDayOfMonth.toISOString().split('T')[0];
    this.filters.endDate = lastDayOfMonth.toISOString().split('T')[0];
  }

  private loadDepartments(): void {
    // Simulation de chargement des départements
    this.departments = [
      { id: 1, name: 'Ressources Humaines' },
      { id: 2, name: 'Informatique' },
      { id: 3, name: 'Commercial' },
      { id: 4, name: 'Marketing' }
    ];
  }

  private loadEffectifs(): void {
    this.loading = true;
    // Simulation de chargement des données
    setTimeout(() => {
      this.effectifs = this.generateMockEffectifs();
      this.applyFilters();
      this.loading = false;
    }, 1000);
  }

  private generateMockEffectifs(): EffectifDataExtended[] {
    const mockData: EffectifDataExtended[] = [];
    const departments = ['Ressources Humaines', 'Informatique', 'Commercial', 'Marketing'];
    const positions = ['Manager', 'Développeur', 'Analyste', 'Assistant', 'Directeur'];
    const contractTypes = ['CDI', 'CDD', 'Stage', 'Freelance'];
    const statuses = ['active', 'inactive', 'suspended'];
    
    for (let i = 1; i <= 50; i++) {
      const startDate = new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const age = 25 + Math.floor(Math.random() * 35);
      
      mockData.push({
        id: i,
        name: `Employé ${i}`,
        email: `employe${i}@entreprise.com`,
        avatar: `assets/avatars/avatar${i % 10 + 1}.png`,
        department: departments[Math.floor(Math.random() * departments.length)],
        position: positions[Math.floor(Math.random() * positions.length)],
        contractType: contractTypes[Math.floor(Math.random() * contractTypes.length)],
        startDate: startDate,
        seniority: this.getAnciennete(startDate),
        age: age,
        status: statuses[Math.floor(Math.random() * statuses.length)]
      });
    }
    
    return mockData;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  // Rendre cette méthode publique pour le template
  applyFilters(): void {
    let filtered = [...this.effectifs];

    if (this.filters.startDate) {
      filtered = filtered.filter(e => new Date(e.startDate) >= new Date(this.filters.startDate));
    }

    if (this.filters.endDate) {
      filtered = filtered.filter(e => new Date(e.startDate) <= new Date(this.filters.endDate));
    }

    if (this.filters.department) {
      filtered = filtered.filter(e => e.department === this.filters.department);
    }

    if (this.filters.status) {
      filtered = filtered.filter(e => e.status === this.filters.status);
    }

    if (this.filters.contractType) {
      filtered = filtered.filter(e => e.contractType === this.filters.contractType);
    }

    this.filteredEffectifs = filtered;
    this.filteredData = filtered;
    this.calculateStatistics();
    this.updatePagination();
  }

  private calculateStatistics(): void {
    const total = this.filteredEffectifs.length;
    const actifs = this.filteredEffectifs.filter(e => e.status === 'active').length;
    const inactifs = this.filteredEffectifs.filter(e => e.status === 'inactive').length;
    
    // Calcul des nouveaux employés (embauchés dans les 30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const nouveaux = this.filteredEffectifs.filter(e => new Date(e.startDate) >= thirtyDaysAgo).length;
    
    // Calcul de la répartition des contrats
    const repartitionContrats: { [key: string]: number } = {};
    this.filteredEffectifs.forEach(e => {
      repartitionContrats[e.contractType] = (repartitionContrats[e.contractType] || 0) + 1;
    });
    
    // Calcul de l'ancienneté moyenne
    const totalAnciennete = this.filteredEffectifs.reduce((sum, e) => {
      const anciennete = (new Date().getTime() - new Date(e.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
      return sum + anciennete;
    }, 0);
    const ancienneteMoyenne = total > 0 ? totalAnciennete / total : 0;
    
    this.statistics = {
      ...this.statistics,
      totalEmployes: total,
      employesActifs: actifs,
      employesInactifs: inactifs,
      nouveauxEmployes: nouveaux,
      departsEmployes: 0, // À calculer selon la logique métier
      tauxRotation: 0, // À calculer selon la logique métier
      ancienneteMoyenne: ancienneteMoyenne,
      repartitionContrats: repartitionContrats,
      // Synchronisation des propriétés pour le template
      totalEmployees: total,
      activeEmployees: actifs,
      inactiveEmployees: inactifs,
      newEmployees: nouveaux,
      departingEmployees: 0,
      turnoverRate: 0,
      averageSeniority: ancienneteMoyenne,
      contractTypes: Object.keys(repartitionContrats).length.toString()
    };
  }

  resetFilters(): void {
    this.filters = {
      startDate: '',
      endDate: '',
      department: '',
      status: '',
      contractType: ''
    };
    this.initializeDates();
    this.applyFilters();
  }

  onSearch(): void {
    this.filterData();
  }

  // Méthode publique pour filtrer les données (utilisée dans le template)
  filterData(): void {
    if (!this.searchTerm) {
      this.filteredData = [...this.filteredEffectifs];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredData = this.filteredEffectifs.filter(emp => 
        emp.name?.toLowerCase().includes(term) ||
        emp.department?.toLowerCase().includes(term) ||
        emp.position?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term)
      );
    }
    this.updatePagination();
  }

  // Méthode publique pour trier les données (utilisée dans le template)
  sortData(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.filteredData.sort((a, b) => {
      let aValue = (a as any)[field];
      let bValue = (b as any)[field];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    this.updatePagination();
  }

  sort(field: string): void {
    this.sortData(field);
  }

  updatePagination(): void {
    this.totalItems = this.filteredData.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
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

  private initializeCharts(): void {
    this.createEvolutionChart();
    this.createDepartmentsChart();
    this.createContractsChart();
    this.createAgeChart();
  }

  private createEvolutionChart(): void {
    if (this.evolutionChart?.nativeElement) {
      const ctx = this.evolutionChart.nativeElement.getContext('2d');
      if (ctx) {
        this.evolutionChartInstance = new Chart(ctx, {
          type: 'line',
          data: this.getEvolutionData(),
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Évolution des Effectifs'
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    }
  }

  private createDepartmentsChart(): void {
    if (this.departmentsChart?.nativeElement) {
      const ctx = this.departmentsChart.nativeElement.getContext('2d');
      if (ctx) {
        this.departmentsChartInstance = new Chart(ctx, {
          type: 'pie',
          data: this.getDepartmentData(),
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Répartition par Département'
              }
            }
          }
        });
      }
    }
  }

  private createContractsChart(): void {
    if (this.contractsChart?.nativeElement) {
      const ctx = this.contractsChart.nativeElement.getContext('2d');
      if (ctx) {
        this.contractsChartInstance = new Chart(ctx, {
          type: 'bar',
          data: this.getContractData(),
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Types de Contrats'
              }
            }
          }
        });
      }
    }
  }

  private createAgeChart(): void {
    if (this.ageChart?.nativeElement) {
      const ctx = this.ageChart.nativeElement.getContext('2d');
      if (ctx) {
        this.ageChartInstance = new Chart(ctx, {
          type: 'bar',
          data: this.getAgeData(),
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Répartition par Âge'
              }
            }
          }
        });
      }
    }
  }

  private updateCharts(): void {
    if (this.evolutionChartInstance) {
      this.evolutionChartInstance.data = this.getEvolutionData();
      this.evolutionChartInstance.update();
    }
    
    if (this.departmentsChartInstance) {
      this.departmentsChartInstance.data = this.getDepartmentData();
      this.departmentsChartInstance.update();
    }
    
    if (this.contractsChartInstance) {
      this.contractsChartInstance.data = this.getContractData();
      this.contractsChartInstance.update();
    }
    
    if (this.ageChartInstance) {
      this.ageChartInstance.data = this.getAgeData();
      this.ageChartInstance.update();
    }
  }

  private destroyCharts(): void {
    if (this.evolutionChartInstance) {
      this.evolutionChartInstance.destroy();
    }
    if (this.departmentsChartInstance) {
      this.departmentsChartInstance.destroy();
    }
    if (this.contractsChartInstance) {
      this.contractsChartInstance.destroy();
    }
    if (this.ageChartInstance) {
      this.ageChartInstance.destroy();
    }
  }

  private getEvolutionData(): any {
    return {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
      datasets: [{
        label: 'Effectifs',
        data: [45, 48, 52, 49, 53, 55],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }]
    };
  }

  private getDepartmentData(): any {
    const departmentCounts: { [key: string]: number } = {};
    this.filteredData.forEach(emp => {
      departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
    });
    
    return {
      labels: Object.keys(departmentCounts),
      datasets: [{
        data: Object.values(departmentCounts),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0'
        ]
      }]
    };
  }

  private getContractData(): any {
    const contractCounts: { [key: string]: number } = {};
    this.filteredData.forEach(emp => {
      contractCounts[emp.contractType] = (contractCounts[emp.contractType] || 0) + 1;
    });
    
    return {
      labels: Object.keys(contractCounts),
      datasets: [{
        label: 'Nombre d\'employés',
        data: Object.values(contractCounts),
        backgroundColor: '#36A2EB'
      }]
    };
  }

  private getAgeData(): any {
    const ageRanges = {
      '20-30': 0,
      '31-40': 0,
      '41-50': 0,
      '51-60': 0,
      '60+': 0
    };
    
    this.filteredData.forEach(emp => {
      if (emp.age <= 30) ageRanges['20-30']++;
      else if (emp.age <= 40) ageRanges['31-40']++;
      else if (emp.age <= 50) ageRanges['41-50']++;
      else if (emp.age <= 60) ageRanges['51-60']++;
      else ageRanges['60+']++;
    });
    
    return {
      labels: Object.keys(ageRanges),
      datasets: [{
        label: 'Nombre d\'employés',
        data: Object.values(ageRanges),
        backgroundColor: '#FFCE56'
      }]
    };
  }

  exportToPDF(): void {
    console.log('Export PDF en cours...');
    // Implémentation de l'export PDF
  }

  exportToExcel(): void {
    console.log('Export Excel en cours...');
    // Implémentation de l'export Excel
  }

  printReport(): void {
    window.print();
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'suspended': 'Suspendu'
    };
    return labels[status] || status;
  }

  getContractTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'CDI': 'CDI',
      'CDD': 'CDD',
      'Stage': 'Stage',
      'Freelance': 'Freelance'
    };
    return labels[type] || type;
  }

  getAnciennete(dateEmbauche: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(dateEmbauche).getTime();
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    
    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''} ${months > 0 ? `et ${months} mois` : ''}`;
    }
    return `${months} mois`;
  }

  Math = Math;
}
