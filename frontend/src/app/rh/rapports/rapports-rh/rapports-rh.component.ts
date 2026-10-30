import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RapportService } from '../../services/rapport.service';
import { EmployeService } from '../../services/employe.service';
import { DepartementService } from '../../services/departement.service';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-rapports-rh',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatSnackBarModule
  ],
  templateUrl: './rapports-rh.component.html',
  styleUrls: ['./rapports-rh.component.css']
})
export class RapportsRhComponent implements OnInit, OnDestroy {
  @ViewChild('effectifsChart', { static: false }) effectifsChart!: ElementRef;
  @ViewChild('ageChart', { static: false }) ageChart!: ElementRef;
  @ViewChild('departementChart', { static: false }) departementChart!: ElementRef;
  @ViewChild('turnoverChart', { static: false }) turnoverChart!: ElementRef;

  filterForm!: FormGroup;
  loading = false;
  
  // Interface pour les données du rapport avec types appropriés
  rapportData: {
    details?: Array<{
      departement: string;
      effectifs: number;
      nouveaux: number;
      departs: number;
      turnover: number;
    }>;
    effectifs?: number[];
    repartitionAge?: number[];
    departements?: Array<{ name: string; effectif: number }>; // Changé 'nom' en 'name'
    turnover?: number[];
  } = {
    details: [] // Initialiser la propriété details pour le tableau
  };
  
  // Charts
  charts: { [key: string]: Chart } = {};
  
  // Options de filtres
  departements: Array<{id: number, name: string}> = []; // Changé 'nom' en 'name'
  annees: number[] = [];
  
  // Statistiques générales
  stats = {
    totalEmployes: 0,
    nouveauxEmployes: 0,
    departsEmployes: 0,
    tauxTurnover: 0,
    ageMoyen: 0,
    ancienneteMoyenne: 0
  };
  
  // Types de rapports disponibles
  typesRapports = [
    { value: 'effectifs', label: 'Évolution des effectifs' },
    { value: 'repartition_age', label: 'Répartition par âge' },
    { value: 'repartition_departement', label: 'Répartition par département' },
    { value: 'turnover', label: 'Taux de turnover' },
    { value: 'conges', label: 'Analyse des congés' },
    { value: 'presences', label: 'Analyse des présences' },
    { value: 'recrutement', label: 'Analyse du recrutement' }
  ];

  constructor(
    private fb: FormBuilder,
    private rapportService: RapportService,
    private employeService: EmployeService,
    private departementService: DepartementService,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      typeRapport: ['effectifs'],
      annee: [new Date().getFullYear()],
      departementId: [''],
      dateDebut: [''],
      dateFin: ['']
    });
  }

  ngOnInit(): void {
    this.initializeData();
    this.setupFilters();
    this.loadRapportData();
  }

  initializeData(): void {
    // Générer les années (5 dernières années)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.annees.push(currentYear - i);
    }

    // Charger les départements
    this.departementService.getDepartements().subscribe({
      next: (departements) => {
        this.departements = departements;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des départements:', error);
      }
    });
  }

  setupFilters(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.loadRapportData();
    });
  }

  loadRapportData(): void {
    this.loading = true;
    const formValue = this.filterForm.value;
    
    this.rapportService.getRapportRH(formValue).subscribe({
      next: (data: any) => {
        this.rapportData = data;
        // Initialiser les détails si pas présents
        if (!this.rapportData.details) {
          this.rapportData.details = this.generateMockDetails();
        }
        this.updateStats(data);
        this.updateCharts();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des données:', error);
        // Générer des données mock en cas d'erreur
        this.rapportData = {
          details: this.generateMockDetails(),
          effectifs: [120, 125, 130, 128, 135, 140, 138, 142, 145, 148, 150, 152],
          repartitionAge: [25, 45, 35, 30, 15],
          departements: [
            { name: 'IT', effectif: 40 },
            { name: 'Marketing', effectif: 25 },
            { name: 'RH', effectif: 15 },
            { name: 'Finance', effectif: 20 },
            { name: 'Production', effectif: 35 }
          ],
          turnover: [2.5, 3.1, 2.8, 3.5, 4.2, 3.8, 4.1, 3.6, 3.2, 2.9, 3.4, 3.7]
        };
        this.updateStats(this.rapportData);
        this.updateCharts();
        this.snackBar.open('Erreur lors du chargement des données', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  generateMockDetails(): Array<{
    departement: string;
    effectifs: number;
    nouveaux: number;
    departs: number;
    turnover: number;
  }> {
    return [
      { departement: 'IT', effectifs: 40, nouveaux: 5, departs: 2, turnover: 5.0 },
      { departement: 'Marketing', effectifs: 25, nouveaux: 3, departs: 1, turnover: 4.0 },
      { departement: 'RH', effectifs: 15, nouveaux: 1, departs: 0, turnover: 0.0 },
      { departement: 'Finance', effectifs: 20, nouveaux: 2, departs: 1, turnover: 5.0 },
      { departement: 'Production', effectifs: 35, nouveaux: 4, departs: 3, turnover: 8.6 }
    ];
  }

  updateStats(data: any): void {
    this.stats = {
      totalEmployes: data.effectifs ? data.effectifs[data.effectifs.length - 1] : 152,
      nouveauxEmployes: data.details ? data.details.reduce((sum: number, dept: any) => sum + dept.nouveaux, 0) : 15,
      departsEmployes: data.details ? data.details.reduce((sum: number, dept: any) => sum + dept.departs, 0) : 7,
      tauxTurnover: data.details ? (data.details.reduce((sum: number, dept: any) => sum + dept.turnover, 0) / data.details.length) : 4.5,
      ageMoyen: 35.2,
      ancienneteMoyenne: 4.8
    };
  }

  updateCharts(): void {
    // Détruire les graphiques existants
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
    
    // Créer les nouveaux graphiques
    setTimeout(() => {
      this.createEffectifsChart();
      this.createAgeChart();
      this.createDepartementChart();
      this.createTurnoverChart();
    }, 100);
  }

  createEffectifsChart(): void {
    if (this.effectifsChart?.nativeElement) {
      const ctx = this.effectifsChart.nativeElement.getContext('2d');
      if (ctx) {
        this.charts['effectifs'] = new Chart(ctx, {
          type: 'line' as ChartType,
          data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
            datasets: [{
              label: 'Effectifs',
              data: this.rapportData.effectifs || [120, 125, 130, 128, 135, 140, 138, 142, 145, 148, 150, 152],
              borderColor: '#007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Évolution des effectifs'
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

  createAgeChart(): void {
    if (this.ageChart?.nativeElement) {
      const ctx = this.ageChart.nativeElement.getContext('2d');
      if (ctx) {
        this.charts['age'] = new Chart(ctx, {
          type: 'bar' as ChartType,
          data: {
            labels: ['18-25', '26-35', '36-45', '46-55', '56-65'],
            datasets: [{
              label: 'Nombre d\'employés',
              data: this.rapportData.repartitionAge || [25, 45, 35, 30, 15],
              backgroundColor: [
                '#007bff',
                '#28a745',
                '#ffc107',
                '#dc3545',
                '#6c757d'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Répartition par âge'
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

  createDepartementChart(): void {
    if (this.departementChart?.nativeElement) {
      const ctx = this.departementChart.nativeElement.getContext('2d');
      if (ctx) {
        this.charts['departement'] = new Chart(ctx, {
          type: 'pie' as ChartType,
          data: {
            labels: this.rapportData.departements?.map((d: any) => d.nom) || ['IT', 'Marketing', 'RH', 'Finance', 'Production'],
            datasets: [{
              data: this.rapportData.departements?.map((d: any) => d.effectif) || [40, 25, 15, 20, 35],
              backgroundColor: [
                '#007bff',
                '#28a745',
                '#ffc107',
                '#dc3545',
                '#6c757d'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
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

  createTurnoverChart(): void {
    if (this.turnoverChart?.nativeElement) {
      const ctx = this.turnoverChart.nativeElement.getContext('2d');
      if (ctx) {
        this.charts['turnover'] = new Chart(ctx, {
          type: 'line' as ChartType,
          data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
            datasets: [{
              label: 'Taux de turnover (%)',
              data: this.rapportData.turnover || [2.5, 3.1, 2.8, 3.5, 4.2, 3.8, 4.1, 3.6, 3.2, 2.9, 3.4, 3.7],
              borderColor: '#dc3545',
              backgroundColor: 'rgba(220, 53, 69, 0.1)',
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Évolution du taux de turnover'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
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

  // Méthode pour les classes CSS du turnover dans le tableau
  public getTurnoverClass(turnover: number): string {
    if (turnover < 3) return 'turnover-low';
    if (turnover < 6) return 'turnover-medium';
    return 'turnover-high';
  }

  // Méthode manquante pour l'impression
  public imprimerRapport(): void {
    window.print();
  }

  public exporterRapport(): void {
    // Implémentation de l'export PDF
    console.log('Export du rapport en PDF');
    this.snackBar.open('Fonctionnalité d\'export en cours de développement', 'Fermer', {
      duration: 3000
    });
  }

  ngOnDestroy(): void {
    // Nettoyer les graphiques
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
  }
}
