import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RapportService } from '../../services/rapport.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-rapports-absences',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './rapports-absences.component.html',
  styleUrls: ['./rapports-absences.component.css']
})
export class RapportsAbsencesComponent implements OnInit {
  filterForm!: FormGroup;
  isLoading = false;
  rapportData: any = null;
  charts: { [key: string]: Chart } = {};
  loading = false;

  // Propriété statistics manquante
  statistics = {
    totalAbsences: 0,
    absenteeismRate: 0,
    averageAbsencesPerEmployee: 0,
    totalAbsenceDays: 0,
    justifiedAbsences: 0,
    unjustifiedAbsences: 0
  };

  // Propriétés de filtres manquantes
  filters = {
    startDate: '',
    endDate: '',
    department: '',
    employee: '',
    reason: ''
  };

  // Données pour les listes déroulantes
  departments: any[] = [];
  employees: any[] = [];

  // Propriétés de recherche et pagination
  searchTerm = '';
  paginatedAbsences: any[] = [];
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 1;
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Statistiques existantes
  stats = {
    totalAbsences: 0,
    tauxAbsenteisme: 0,
    absencesMoyennesParEmploye: 0,
    joursAbsenceTotal: 0,
    absencesJustifiees: 0,
    absencesNonJustifiees: 0
  };

  // Données pour les tableaux
  absencesParEmploye: any[] = [];
  absencesParMotif: any[] = [];
  evolutionAbsences: any[] = [];

  displayedColumnsEmploye = ['employe', 'totalAbsences', 'joursAbsence', 'tauxAbsenteisme', 'principalMotif'];
  displayedColumnsMotif = ['motif', 'nombreAbsences', 'joursTotal', 'pourcentage'];

  constructor(
    private fb: FormBuilder,
    private rapportService: RapportService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadRapport();
  }

  initializeForm(): void {
    this.filterForm = this.fb.group({
      dateDebut: [null],
      dateFin: [null],
      departement: [''],
      employe: [''],
      motif: ['']
    });
  }

  loadRapport(): void {
    this.isLoading = true;
    const filters = this.filterForm.value;

    this.rapportService.getRapportAbsences(filters).subscribe({
      next: (data) => {
        this.rapportData = data;
        this.stats = data.statistiques;
        this.absencesParEmploye = data.absencesParEmploye;
        this.absencesParMotif = data.absencesParMotif;
        this.evolutionAbsences = data.evolutionAbsences;
        this.createCharts();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du rapport:', error);
        this.snackBar.open('Erreur lors du chargement du rapport', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  createCharts(): void {
    this.createEvolutionChart();
    this.createMotifChart();
    this.createDepartementChart();
    this.createTauxAbsenteismeChart();
  }

  createEvolutionChart(): void {
    const ctx = document.getElementById('evolutionChart') as HTMLCanvasElement;
    if (ctx && this.evolutionAbsences.length > 0) {
      if (this.charts['evolution']) {
        this.charts['evolution'].destroy();
      }

      this.charts['evolution'] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.evolutionAbsences.map(item => item.periode),
          datasets: [{
            label: 'Nombre d\'absences',
            data: this.evolutionAbsences.map(item => item.nombreAbsences),
            borderColor: '#2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.4
          }, {
            label: 'Taux d\'absentéisme (%)',
            data: this.evolutionAbsences.map(item => item.tauxAbsenteisme),
            borderColor: '#ff9800',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            tension: 0.4,
            yAxisID: 'y1'
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: {
                drawOnChartArea: false,
              },
            }
          }
        }
      });
    }
  }

  createMotifChart(): void {
    const ctx = document.getElementById('motifChart') as HTMLCanvasElement;
    if (ctx && this.absencesParMotif.length > 0) {
      if (this.charts['motif']) {
        this.charts['motif'].destroy();
      }

      this.charts['motif'] = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.absencesParMotif.map(item => item.motif),
          datasets: [{
            data: this.absencesParMotif.map(item => item.nombreAbsences),
            backgroundColor: [
              '#2196f3', '#4caf50', '#ff9800', '#f44336',
              '#9c27b0', '#00bcd4', '#ffeb3b', '#795548'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }

  createDepartementChart(): void {
    const ctx = document.getElementById('departementChart') as HTMLCanvasElement;
    if (ctx && this.rapportData?.absencesParDepartement?.length > 0) {
      if (this.charts['departement']) {
        this.charts['departement'].destroy();
      }

      this.charts['departement'] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.rapportData.absencesParDepartement.map((item: any) => item.departement),
          datasets: [{
            label: 'Nombre d\'absences',
            data: this.rapportData.absencesParDepartement.map((item: any) => item.nombreAbsences),
            backgroundColor: '#2196f3'
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  createTauxAbsenteismeChart(): void {
    const ctx = document.getElementById('tauxChart') as HTMLCanvasElement;
    if (ctx && this.absencesParEmploye.length > 0) {
      if (this.charts['taux']) {
        this.charts['taux'].destroy();
      }

      const topEmployes = this.absencesParEmploye
        .sort((a, b) => b.tauxAbsenteisme - a.tauxAbsenteisme)
        .slice(0, 10);

      this.charts['taux'] = new Chart(ctx, {
        type: 'bar', // Remplacer 'horizontalBar' par 'bar'
        data: {
          labels: topEmployes.map(item => `${item.employe.prenom} ${item.employe.nom}`),
          datasets: [{
            label: 'Taux d\'absentéisme (%)',
            data: topEmployes.map(item => item.tauxAbsenteisme),
            backgroundColor: '#ff9800'
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y', // Ajouter cette ligne pour l'orientation horizontale
          scales: {
            x: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
    }
  }

  exportPDF(): void {
    this.rapportService.exportRapportAbsencesPDF(this.filterForm.value).subscribe({
      next: (blob: Blob) => { // Typer explicitement le paramètre
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport_absences_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => { // Typer explicitement le paramètre
        console.error('Erreur lors de l\'export PDF:', error);
        this.snackBar.open('Erreur lors de l\'export PDF', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  exportExcel(): void {
    this.rapportService.exportRapportAbsencesExcel(this.filterForm.value).subscribe({
      next: (blob: Blob) => { // Typer explicitement le paramètre
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport_absences_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => { // Typer explicitement le paramètre
        console.error('Erreur lors de l\'export Excel:', error);
        this.snackBar.open('Erreur lors de l\'export Excel', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  print(): void {
    window.print();
  }

  onFilterChange(): void {
    this.loadRapport();
  }

  // Méthodes de filtres manquantes
  resetFilters(): void {
    this.filters = {
      startDate: '',
      endDate: '',
      department: '',
      employee: '',
      reason: ''
    };
    this.onFilterChange();
  }

  // Méthodes de recherche et pagination manquantes
  onSearch(): void {
    this.currentPage = 1;
    this.updatePaginatedData();
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.updatePaginatedData();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedData();
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getReasonLabel(reason: string): string {
    const labels: { [key: string]: string } = {
      'maladie': 'Maladie',
      'conge': 'Congé',
      'formation': 'Formation',
      'personnel': 'Personnel',
      'autre': 'Autre'
    };
    return labels[reason] || reason;
  }

  updatePaginatedData(): void {
    // Logique de mise à jour des données paginées
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  }

  // Méthodes d'export manquantes
  exportToPDF(): void {
    console.log('Export PDF');
  }

  exportToExcel(): void {
    console.log('Export Excel');
  }

  printReport(): void {
    window.print();
  }

  // Propriété Math pour le template
  Math = Math;

  ngOnDestroy(): void {
    // Détruire tous les graphiques
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
  }
}
