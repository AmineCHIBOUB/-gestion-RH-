import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { FeuilleTempsService } from '../../../services/feuille-temps.service';
import { FeuilleTemps, StatutFeuilleTemps, TempsStats } from '../../../models/feuille-temps.model';

@Component({
  selector: 'app-temps-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './temps-list.component.html',
  styleUrls: ['./temps-list.component.css']
})
export class TempsListComponent implements OnInit {
  displayedColumns: string[] = ['periode', 'totalHeures', 'statut', 'dateCreation', 'actions'];
  dataSource = new MatTableDataSource<FeuilleTemps>();
  tempsStats: TempsStats | null = null;
  isLoading = false;
  error: string | null = null;
  selectedMonth: string = '01';
  selectedYear: number = new Date().getFullYear();
  availableYears: number[] = [];
  availableMonths: { value: string; label: string }[] = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  constructor(
    private feuilleTempsService: FeuilleTempsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {
    const currentDate = new Date();
    this.selectedMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  }

  ngOnInit(): void {
    this.loadAvailableYears();
    this.loadFeuillesTemps();
    this.loadStats();
  }

  loadAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    this.availableYears = [];
    for (let year = currentYear; year >= currentYear - 2; year--) {
      this.availableYears.push(year);
    }
  }

  loadFeuillesTemps(): void {
    this.isLoading = true;
    this.error = null;

    // Corriger le nom de la méthode et les paramètres
    this.feuilleTempsService.getMesFeuillesTemps(1, 50, this.selectedYear).subscribe({
      next: (response) => {
        this.dataSource.data = response.feuilles;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des feuilles de temps';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  loadStats(): void {
    // Corriger le nom de la méthode
    this.feuilleTempsService.getStatsTemps(this.selectedYear).subscribe({
      next: (stats) => {
        this.tempsStats = stats;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
  }

  editFeuille(feuille: FeuilleTemps): void {
    if (feuille.statut === StatutFeuilleTemps.VALIDEE) {
      this.snackBar.open('Cette feuille de temps est déjà validée et ne peut plus être modifiée', 'Fermer', {
        duration: 4000
      });
      return;
    }
    this.router.navigate(['/employe/feuilles-temps/edit', feuille.id]);
  }
  
  submitFeuille(feuille: FeuilleTemps): void {
    if (feuille.statut !== StatutFeuilleTemps.BROUILLON) {
      this.snackBar.open('Cette feuille de temps ne peut plus être soumise', 'Fermer', {
        duration: 3000
      });
      return;
    }

    // Corriger le nom de la méthode
    this.feuilleTempsService.soumettreFeuilleTemps(feuille.id).subscribe({
      next: () => {
        this.snackBar.open('Feuille de temps soumise avec succès', 'Fermer', {
          duration: 3000
        });
        this.loadFeuillesTemps();
      },
      error: (error) => {
        this.snackBar.open('Erreur lors de la soumission', 'Fermer', {
          duration: 3000
        });
        console.error('Erreur:', error);
      }
    });
  }
  
  getStatutLabel(statut: StatutFeuilleTemps): string {
    switch (statut) {
      case StatutFeuilleTemps.BROUILLON:
        return 'Brouillon';
      case StatutFeuilleTemps.SOUMISE:
        return 'Soumise';
      case StatutFeuilleTemps.VALIDEE:
        return 'Validée';
      case StatutFeuilleTemps.REFUSEE: // Corriger REJETEE -> REFUSEE
        return 'Refusée';
      default:
        return statut;
    }
  }

  getStatutColor(statut: StatutFeuilleTemps): string {
    switch (statut) {
      case StatutFeuilleTemps.BROUILLON:
        return 'accent';
      case StatutFeuilleTemps.SOUMISE:
        return 'primary';
      case StatutFeuilleTemps.VALIDEE:
        return 'primary';
      case StatutFeuilleTemps.REFUSEE: // Corriger REJETEE -> REFUSEE
        return 'warn';
      default:
        return '';
    }
  }

  canEdit(feuille: FeuilleTemps): boolean {
    return feuille.statut === StatutFeuilleTemps.BROUILLON || feuille.statut === StatutFeuilleTemps.REFUSEE; // Corriger REJETEE -> REFUSEE
  }

  canSubmit(feuille: FeuilleTemps): boolean {
    return feuille.statut === StatutFeuilleTemps.BROUILLON;
  }

  retry(): void {
    this.loadFeuillesTemps();
    this.loadStats();
  }

  // Ajouter les méthodes manquantes
  onPeriodChange(): void {
    this.loadFeuillesTemps();
    this.loadStats();
  }

  onYearChange(): void {
    this.loadFeuillesTemps();
    this.loadStats();
  }

  createNewFeuille(): void {
    this.router.navigate(['/employe/temps/nouveau']);
  }

  viewFeuille(feuille: FeuilleTemps): void {
    this.router.navigate(['/employe/temps', feuille.id]);
  }
  
  getSelectedMonthLabel(): string {
    const month = this.availableMonths.find(m => m.value === this.selectedMonth);
    return month ? month.label : '';
  }
}
