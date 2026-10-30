import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { PresenceService } from '../../services/presence.service';
import { RapportService } from '../../services/rapport.service';
import { EmployeService } from '../../services/employe.service';
import { Employe } from '../../models/employe.model';
import { RapportPresence, StatistiquesPresence } from '../../models/rapport.model';

@Component({
  selector: 'app-rapports-presences',
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './rapports-presences.component.html',
  styleUrls: ['./rapports-presences.component.css']
})
export class RapportsPresencesComponent implements OnInit {
  @ViewChild('exportDialog') exportDialog!: TemplateRef<any>;

  filtresForm: FormGroup;
  employes: Employe[] = [];
  departements: string[] = ['IT', 'RH', 'Finance', 'Marketing', 'Ventes'];
  
  // Propriétés de filtres manquantes
  selectedReportType: string = 'mensuel';
  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedDepartment: string = '';
  departments: any[] = [];
  selectedEmployee: string = '';
  employees: Employe[] = [];
  selectedStatus: string = '';
  
  // Propriétés de données et états
  reportData: any = null;
  loading: boolean = false;
  
  // Propriétés de tableau manquantes
  tableDataSource: any[] = [];
  tableDisplayedColumns: string[] = ['employe', 'heures', 'retards', 'absences', 'actions'];
  totalItems: number = 0;
  
  statistiques: StatistiquesPresence = {
    totalHeuresTravaillees: 0,
    totalHeuresSupplementaires: 0,
    tauxPresence: 0,
    tauxRetard: 0,
    tempsMoyenJour: 0,
    joursOuvres: 0,
    totalEmployes: 0,
    presentsAujourdhui: 0,
    enRetard: 0,
    absents: 0,
    nombreRetards: 0,
    nombreAbsences: 0
  };
  
  rapportData: RapportPresence[] = [];
  
  // Charts
  evolutionChart: Chart | null = null;
  distributionChart: Chart | null = null;
  retardsChart: Chart | null = null;
  
  // États
  isLoading = false;
  isGeneratingReport = false;
  
  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalElements = 0;
  
  // Export
  exportFormats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' }
  ];
  selectedExportFormat = 'pdf';

  constructor(
    private fb: FormBuilder,
    private presenceService: PresenceService,
    private rapportService: RapportService,
    private employeService: EmployeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.filtresForm = this.createFiltresForm();
  }

  ngOnInit(): void {
    this.loadEmployes();
    this.loadInitialData();
  }

  private createFiltresForm(): FormGroup {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return this.fb.group({
      dateDebut: [firstDayOfMonth],
      dateFin: [today],
      departement: [''],
      employe: [''],
      typeRapport: ['general']
    });
  }

  private async loadEmployes(): Promise<void> {
    try {
      this.employes = await this.employeService.getEmployes().toPromise() || [];
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    }
  }

  private async loadInitialData(): Promise<void> {
    await this.genererRapport();
  }

  async genererRapport(): Promise<void> {
    if (this.isGeneratingReport) return;
    
    this.isGeneratingReport = true;
    
    try {
      const filtres = this.filtresForm.value;
      
      // Charger les statistiques
      this.statistiques = await this.rapportService.getStatistiquesPresence(filtres).toPromise() || this.statistiques;
      
      // Charger les données du rapport
      const response = await this.rapportService.getRapportPresences({
        ...filtres,
        page: this.pageIndex + 1,
        limit: this.pageSize
      }).toPromise();
      
      if (response) {
        this.rapportData = response.data || [];
        this.totalElements = response.total || 0;
      }
      
      // Générer les graphiques
      await this.genererGraphiques(filtres);
      
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      this.snackBar.open('Erreur lors de la génération du rapport', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isGeneratingReport = false;
    }
  }

  private async genererGraphiques(filtres: any): Promise<void> {
    try {
      // Données pour l'évolution des présences
      const evolutionData = await this.rapportService.getEvolutionPresences(filtres).toPromise();
      this.createEvolutionChart(evolutionData || []);
      
      // Données pour la distribution des présences
      const distributionData = await this.rapportService.getDistributionPresences(filtres).toPromise();
      this.createDistributionChart(distributionData || []);
      
      // Données pour les retards par département
      const retardsData = await this.rapportService.getRetardsParDepartement(filtres).toPromise();
      this.createRetardsChart(retardsData || []);
      
    } catch (error) {
      console.error('Erreur lors de la génération des graphiques:', error);
    }
  }

  private createEvolutionChart(data: any[]): void {
    const ctx = document.getElementById('evolutionChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    if (this.evolutionChart) {
      this.evolutionChart.destroy();
    }
    
    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: data.map(d => d.date),
        datasets: [
          {
            label: 'Présents',
            data: data.map(d => d.presents),
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4
          },
          {
            label: 'Absents',
            data: data.map(d => d.absents),
            borderColor: '#f44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            tension: 0.4
          },
          {
            label: 'En retard',
            data: data.map(d => d.retards),
            borderColor: '#ff9800',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Évolution des présences'
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    };
    
    this.evolutionChart = new Chart(ctx, config);
  }

  private createDistributionChart(data: any[]): void {
    const ctx = document.getElementById('distributionChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    if (this.distributionChart) {
      this.distributionChart.destroy();
    }
    
    const config: ChartConfiguration = {
      type: 'doughnut' as ChartType,
      data: {
        labels: ['Présents', 'Absents', 'En congé', 'En retard'],
        datasets: [{
          data: [
            data.find(d => d.status === 'present')?.count || 0,
            data.find(d => d.status === 'absent')?.count || 0,
            data.find(d => d.status === 'conge')?.count || 0,
            data.find(d => d.status === 'retard')?.count || 0
          ],
          backgroundColor: ['#4caf50', '#f44336', '#2196f3', '#ff9800']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribution des présences'
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    };
    
    this.distributionChart = new Chart(ctx, config);
  }

  private createRetardsChart(data: any[]): void {
    const ctx = document.getElementById('retardsChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    if (this.retardsChart) {
      this.retardsChart.destroy();
    }
    
    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: data.map(d => d.departement),
        datasets: [{
          label: 'Nombre de retards',
          data: data.map(d => d.retards),
          backgroundColor: '#ff9800',
          borderColor: '#f57c00',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Retards par département'
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    };
    
    this.retardsChart = new Chart(ctx, config);
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.genererRapport();
  }

  resetFiltres(): void {
    this.filtresForm.reset();
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.filtresForm.patchValue({
      dateDebut: firstDayOfMonth,
      dateFin: today,
      typeRapport: 'general'
    });
    
    this.genererRapport();
  }

  ouvrirDialogExport(): void {
    const dialogRef = this.dialog.open(this.exportDialog, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.exporterRapport();
      }
    });
  }

  async exporterRapport(): Promise<void> {
    try {
      this.isLoading = true;
      
      const filtres = {
        ...this.filtresForm.value,
        format: this.selectedExportFormat
      };
      
      const blob = await this.rapportService.exporterRapportPresences(filtres).toPromise();
      
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport-presences-${new Date().toISOString().split('T')[0]}.${this.selectedExportFormat}`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Rapport exporté avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      this.snackBar.open('Erreur lors de l\'export du rapport', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  imprimer(): void {
    window.print();
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'present': return 'present';
      case 'absent': return 'absent';
      case 'retard': return 'retard';
      case 'conge': return 'conge';
      default: return '';
    }
  }

  formatDuree(minutes: number): string {
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${heures}h${mins.toString().padStart(2, '0')}`;
  }

  calculerTauxPresence(presents: number, total: number): number {
    return total > 0 ? Math.round((presents / total) * 100) : 0;
  }

  ngOnDestroy(): void {
    if (this.evolutionChart) {
      this.evolutionChart.destroy();
    }
    if (this.distributionChart) {
      this.distributionChart.destroy();
    }
    if (this.retardsChart) {
      this.retardsChart.destroy();
    }
  }

  // Méthodes manquantes ajoutées à l'intérieur de la classe
  onFilterChange(): void {
    // Logique de filtrage - regénérer le rapport avec les nouveaux filtres
    if (this.selectedReportType && (this.startDate || this.endDate)) {
      this.genererRapport();
    }
  }
  
  generateReport(): void {
    this.genererRapport();
  }
  
  exportToPDF(): void {
    this.selectedExportFormat = 'pdf';
    this.exporterRapport();
  }
  
  exportToExcel(): void {
    this.selectedExportFormat = 'excel';
    this.exporterRapport();
  }
  
  printReport(): void {
    this.imprimer();
  }
  
  getPresenceRateClass(rate: number): string {
    if (rate >= 95) return 'excellent';
    if (rate >= 85) return 'good';
    if (rate >= 70) return 'average';
    return 'poor';
  }
}
