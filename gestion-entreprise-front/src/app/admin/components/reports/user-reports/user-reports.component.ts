import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ReportService } from '../../../services/report.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface UserReport {
  id: number;
  user: string;
  department: string;
  role: string;
  last_login: string;
  status: string;
}

interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  department: string;
  status: string;
}

@Component({
  selector: 'app-user-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './user-reports.component.html',
  styleUrls: ['./user-reports.component.css']
})
export class UserReportsComponent implements OnInit {
  filterForm: FormGroup;
  userReports: UserReport[] = [];
  loading = false;
  displayedColumns: string[] = ['user', 'department', 'role', 'last_login', 'status', 'actions'];

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      dateFrom: [''],
      dateTo: [''],
      department: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserReports();
  }

  loadUserReports(): void {
    this.loading = true;
    const filters: ReportFilters = this.filterForm.value;
    
    this.reportService.getUserReports(filters).subscribe({
      next: (reports: UserReport[]) => {
        this.userReports = reports;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading user reports:', error);
        this.snackBar.open('Erreur lors du chargement des rapports', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  exportReport(): void {
    const filters: ReportFilters = this.filterForm.value;
    
    this.reportService.exportUserReports(filters).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rapport-utilisateurs.xlsx';
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
    this.loadUserReports();
  }
}
