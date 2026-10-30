import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LogService } from '../../../services/log.service';
import { SystemLog, LogFilters } from '../../../interfaces/admin.interfaces';

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './system-logs.component.html',
  styleUrls: ['./system-logs.component.css']
})
export class SystemLogsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['timestamp', 'level', 'service', 'message', 'details'];
  dataSource = new MatTableDataSource<SystemLog>();
  filterForm: FormGroup;
  loading = false;

  constructor(
    private logService: LogService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      dateFrom: [''],
      dateTo: [''],
      level: [''],
      service: ['']
    });
  }

  ngOnInit(): void {
    this.loadSystemLogs();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadSystemLogs(): void {
    this.loading = true;
    this.logService.getSystemLogs(this.filterForm.value as LogFilters).subscribe({
      next: (logs: SystemLog[]) => {
        this.dataSource.data = logs;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des logs système:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadSystemLogs();
  }

  getLevelColor(level: string): string {
    switch (level.toLowerCase()) {
      case 'error': return 'warn';
      case 'warning': return 'accent';
      case 'info': return 'primary';
      case 'debug': return '';
      default: return '';
    }
  }

  exportLogs(): void {
    this.logService.exportSystemLogs(this.filterForm.value as LogFilters).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => console.error('Erreur lors de l\'export:', error)
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
