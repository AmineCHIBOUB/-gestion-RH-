import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // Module manquant pour mat-icon
import { MatSelectModule } from '@angular/material/select'; // Module manquant pour mat-select
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LogService } from '../../../services/log.service';
import { AuditLog, AuditFilters } from '../../../interfaces/admin.interfaces';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule, // Ajouté pour les icônes
    MatSelectModule, // Ajouté pour mat-select
    MatProgressSpinnerModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule
  ],
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.css']
})
export class AuditLogsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['timestamp', 'user', 'action', 'resource', 'details', 'ipAddress'];
  dataSource = new MatTableDataSource<AuditLog>();
  filterForm: FormGroup;
  loading = false;

  constructor(
    private logService: LogService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      dateFrom: [''],
      dateTo: [''],
      user: [''],
      action: [''],
      resource: ['']
    });
  }

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
      case 'login':
      case 'connexion':
        return 'primary';
      case 'logout':
      case 'déconnexion':
        return '';
      default:
        return '';
    }
  }

  loadAuditLogs(): void {
    this.loading = true;
    this.logService.getAuditLogs(this.filterForm.value as AuditFilters).subscribe({
      next: (logs: AuditLog[]) => {
        this.dataSource.data = logs;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des logs d\'audit:', error);
        this.loading = false;
      }
    });
  }

  exportLogs(): void {
    this.logService.exportAuditLogs(this.filterForm.value as AuditFilters).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => console.error('Erreur lors de l\'export:', error)
    });
  }

  onFilterChange(): void {
    this.loadAuditLogs();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
