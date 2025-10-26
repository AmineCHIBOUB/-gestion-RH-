import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReportService } from '../../../services/report.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// Ajouter ces interfaces au début du fichier
interface FinancialData {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentage: number;
  salaries?: number;
  charges?: number;
  training?: number;
  others?: number;
}

interface ChartDataItem {
  name: string;
  value: number;
}

interface ReportFilters {
  year: number;
  month: string;
  department: string;
}

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './financial-reports.component.html',
  styleUrls: ['./financial-reports.component.css']
})
export class FinancialReportsComponent implements OnInit {
  filterForm: FormGroup;
  financialData: FinancialData = {
    totalBudget: 0,
    totalSpent: 0,
    remaining: 0,
    percentage: 0
  };
  loading = false;
  chartData: ChartDataItem[] = [];

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      year: [new Date().getFullYear()],
      month: [''],
      department: ['']
    });
  }

  ngOnInit(): void {
    this.loadFinancialReports();
  }

  loadFinancialReports(): void {
    this.loading = true;
    this.reportService.getFinancialReports(this.filterForm.value).subscribe({
      next: (data: FinancialData) => {
        this.financialData = data;
        this.prepareChartData();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading financial reports:', error);
        this.snackBar.open('Erreur lors du chargement des rapports', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // Ajouter cette méthode manquante
  prepareChartData(): void {
    // Simulation de données pour le graphique
    this.chartData = [
      { name: 'Salaires', value: this.financialData.salaries || 150000 },
      { name: 'Charges', value: this.financialData.charges || 45000 },
      { name: 'Formation', value: this.financialData.training || 12000 },
      { name: 'Autres', value: this.financialData.others || 8000 }
    ];
  }

  exportReport(): void {
    this.reportService.exportFinancialReports(this.filterForm.value).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rapport-financier.xlsx';
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

  onFilterChange(): void {
    this.loadFinancialReports();
  }
}
