import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { AdminService } from '../../../services/admin.service';
import { ExportSettings, ExportResult } from '../../../models/admin.models';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-data-export',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatCheckboxModule,
    MatInputModule,
    MatDividerModule,
    MatListModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './data-export.component.html',
  styleUrls: ['./data-export.component.css']
})
export class DataExportComponent implements OnInit {
  exportForm!: FormGroup;
  exporting = false;
  exportProgress = 0;
  exportResult: ExportResult | null = null;
  availableFields: { [key: string]: string[] } = {};

  exportFormats = [
    { value: 'csv', label: 'CSV', icon: 'description' },
    { value: 'xlsx', label: 'Excel (XLSX)', icon: 'table_chart' },
    { value: 'json', label: 'JSON', icon: 'code' },
    { value: 'pdf', label: 'PDF', icon: 'picture_as_pdf' }
  ];

  exportTypes = [
    { value: 'users', label: 'Utilisateurs', icon: 'people' },
    { value: 'departments', label: 'Départements', icon: 'business' },
    { value: 'roles', label: 'Rôles', icon: 'security' },
    { value: 'employees', label: 'Employés', icon: 'badge' },
    { value: 'audit_logs', label: 'Logs d\'audit', icon: 'history' },
    { value: 'system_logs', label: 'Logs système', icon: 'bug_report' }
  ];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
    this.loadAvailableFields();
  }

  ngOnInit(): void {}

  private initializeForm(): void {
    this.exportForm = this.fb.group({
      exportType: ['', Validators.required],
      format: ['csv', Validators.required],
      fields: [[], Validators.required],
      includeHeaders: [true],
      dateStart: [''],
      dateEnd: [''],
      status: [''],
      department: [''],
      role: [''],
      compression: [false],
      password: [''],
      maxRecords: [10000, [Validators.min(1), Validators.max(100000)]]
    });
  }

  private loadAvailableFields(): void {
    this.availableFields = {
      users: ['id', 'name', 'email', 'role', 'department', 'status', 'created_at', 'updated_at'],
      departments: ['id', 'name', 'description', 'manager', 'budget', 'created_at'],
      roles: ['id', 'name', 'permissions', 'description', 'created_at'],
      employees: ['id', 'first_name', 'last_name', 'email', 'position', 'salary', 'hire_date'],
      audit_logs: ['id', 'user', 'action', 'resource', 'timestamp', 'ip_address'],
      system_logs: ['id', 'level', 'message', 'context', 'timestamp']
    };
  }

  onExportTypeChange(): void {
    const exportType = this.exportForm.get('exportType')?.value;
    if (exportType && this.availableFields[exportType]) {
      this.exportForm.patchValue({
        fields: this.availableFields[exportType]
      });
    }
  }

  startExport(): void {
    if (!this.exportForm.valid) {
      return;
    }
  
    this.exporting = true;
    this.exportProgress = 0;
    this.exportResult = null;
  
    const formValue = this.exportForm.value;
    const settings: ExportSettings = {
      ...formValue,
      dateRange: {
        start: formValue.dateStart,
        end: formValue.dateEnd
      },
      filters: {
        status: formValue.status,
        department: formValue.department,
        role: formValue.role
      }
    };

    this.adminService.exportData(settings).subscribe({
      next: (result: ExportResult) => {
        this.exportResult = result;
        this.exporting = false;
        this.exportProgress = 100;
        
        if (result.success) {
          this.snackBar.open(`Export réussi: ${result.recordCount} enregistrements exportés`, 'Fermer', { duration: 5000 });
          
          // Auto-download if file is ready
          if (result.downloadUrl) {
            this.downloadFile(result.downloadUrl, result.filename || 'export');
          }
        } else {
          this.snackBar.open('Erreur lors de l\'export', 'Fermer', { duration: 3000 });
        }
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'export:', error);
        this.snackBar.open('Erreur lors de l\'export', 'Fermer', { duration: 3000 });
        this.exporting = false;
      }
    });

    // Simulate progress
    this.simulateProgress();
  }

  private simulateProgress(): void {
    const interval = setInterval(() => {
      if (this.exportProgress < 90 && this.exporting) {
        this.exportProgress += Math.random() * 10;
      } else {
        clearInterval(interval);
      }
    }, 500);
  }

  downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  }

  resetExport(): void {
    this.exporting = false;
    this.exportProgress = 0;
    this.exportResult = null;
    this.exportForm.reset({
      format: 'csv',
      includeHeaders: true,
      compression: false,
      maxRecords: 10000,
      dateStart: '',
      dateEnd: '',
      status: '',
      department: '',
      role: ''
    });
  }

  getFormatIcon(format: string): string {
    const icons: { [key: string]: string } = {
      'csv': 'description',
      'xlsx': 'table_chart',
      'json': 'code',
      'pdf': 'picture_as_pdf'
    };
    return icons[format] || 'get_app';
  }

  toggleFieldSelection(field: string): void {
    const fields = this.exportForm.get('fields')?.value || [];
    const index = fields.indexOf(field);
    
    if (index > -1) {
      fields.splice(index, 1);
    } else {
      fields.push(field);
    }
    
    this.exportForm.patchValue({ fields });
  }

  isFieldSelected(field: string): boolean {
    const fields = this.exportForm.get('fields')?.value || [];
    return fields.includes(field);
  }

  selectAllFields(): void {
    const exportType = this.exportForm.get('exportType')?.value;
    if (exportType && this.availableFields[exportType]) {
      this.exportForm.patchValue({
        fields: [...this.availableFields[exportType]]
      });
    }
  }

  deselectAllFields(): void {
    this.exportForm.patchValue({ fields: [] });
  }
}
