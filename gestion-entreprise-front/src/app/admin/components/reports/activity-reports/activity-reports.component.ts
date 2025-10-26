import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'; // Module manquant pour mat-select
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip'; // Module manquant pour matTooltip
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReportService } from '../../../services/report.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-activity-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule, // Ajouté pour mat-select
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSnackBarModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule // Ajouté pour matTooltip
  ],
  templateUrl: './activity-reports.component.html',
  styleUrls: ['./activity-reports.component.css']
})
export class ActivityReportsComponent implements OnInit {
  filterForm: FormGroup;
  activityReports: ActivityReport[] = [];
  loading = false;
  displayedColumns: string[] = ['date', 'user', 'action', 'target', 'status', 'details'];

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      dateFrom: [''],
      dateTo: [''],
      user: [''],
      action: ['']
    });
  }

  ngOnInit(): void {
    this.loadActivityReports();
  }

  // La méthode getActionColor existe déjà
  getActionColor(action: string): string {
    switch (action.toLowerCase()) {
      case 'create':
      case 'créer':
        return 'primary';
      case 'update':
      case 'modifier':
        return 'accent';
      case 'delete':
      case 'supprimer':
        return 'warn';
      case 'view':
      case 'consulter':
        return 'primary';
      case 'export':
      case 'exporter':
        return 'accent';
      default:
        return '';
    }
  }

  loadActivityReports(): void {
    this.loading = true;
    this.reportService.getActivityReports(this.filterForm.value).subscribe({
      next: (data: ActivityReport[]) => {
        this.activityReports = data;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading activity reports:', error);
        this.snackBar.open('Erreur lors du chargement des rapports', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  exportReport(): void {
    this.reportService.exportActivityReports(this.filterForm.value).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rapport-activite.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Rapport exporté avec succès', 'Fermer', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Error exporting report:', error);
        this.snackBar.open('Erreur lors de l\'export', 'Fermer', { duration: 3000 });
      }
    });
  }

  // Ajouter cette méthode manquante
  onFilterChange(): void {
    this.loadActivityReports();
  }
}

// Ajouter ces interfaces au début du fichier
interface ActivityReport {
  date: Date;
  user: string;
  action: string;
  target: string;
  status: 'success' | 'error';
  details?: string;
}

interface ActivityFilters {
  dateFrom: Date | null;
  dateTo: Date | null;
  user: string;
  action: string;
}
