import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';
import { ImportResult, ImportSettings } from '../../../models/admin.models';

@Component({
  selector: 'app-data-import',
  standalone: true,
  imports: [
    CommonModule,
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
    MatSnackBarModule
  ],
  templateUrl: './data-import.component.html',
  styleUrls: ['./data-import.component.css']
})
export class DataImportComponent implements OnInit {
  importForm!: FormGroup;
  selectedFile: File | null = null;
  importing = false;
  importProgress = 0;
  importResult: ImportResult | null = null;
  previewData: any[] = [];
  showPreview = false;

  supportedFormats = [
    { value: 'csv', label: 'CSV', icon: 'description' },
    { value: 'xlsx', label: 'Excel (XLSX)', icon: 'table_chart' },
    { value: 'json', label: 'JSON', icon: 'code' },
    { value: 'xml', label: 'XML', icon: 'code' }
  ];

  // Propriété manquante - alias pour supportedFormats
  importFormats = this.supportedFormats;

  importTypes = [
    { value: 'users', label: 'Utilisateurs', icon: 'people' },
    { value: 'departments', label: 'Départements', icon: 'business' },
    { value: 'roles', label: 'Rôles', icon: 'security' },
    { value: 'employees', label: 'Employés', icon: 'badge' }
  ];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {}

  private initializeForm(): void {
    this.importForm = this.fb.group({
      importType: ['', Validators.required],
      fileFormat: ['', Validators.required],
      format: ['', Validators.required], // Propriété manquante
      skipFirstRow: [true],
      validateData: [true],
      updateExisting: [false],
      createMissing: [true],
      batchSize: [100, [Validators.min(1), Validators.max(1000)]]
    });
  }

  // Méthode manquante
  onImportTypeChange(): void {
    const importType = this.importForm.get('importType')?.value;
    // Logique pour changer les formats disponibles selon le type
    console.log('Import type changed to:', importType);
  }

  // Méthode manquante
  getAcceptedFileTypes(): string {
    const format = this.importForm.get('format')?.value || this.importForm.get('fileFormat')?.value;
    switch (format) {
      case 'csv':
        return '.csv,text/csv';
      case 'xlsx':
        return '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'json':
        return '.json,application/json';
      case 'xml':
        return '.xml,text/xml';
      default:
        return '.csv,.xlsx,.json,.xml';
    }
  }

  // Méthode manquante
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.validateFile(file);
    }
  }

  private validateFile(file: File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json', 'text/xml'];

    if (file.size > maxSize) {
      this.snackBar.open('Le fichier est trop volumineux (max 10MB)', 'Fermer', { duration: 3000 });
      this.selectedFile = null;
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      this.snackBar.open('Format de fichier non supporté', 'Fermer', { duration: 3000 });
      this.selectedFile = null;
      return;
    }

    // Auto-detect format
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension) {
      this.importForm.patchValue({ 
        fileFormat: extension,
        format: extension // Mise à jour des deux propriétés
      });
    }
  }

  previewImport(): void {
    if (!this.selectedFile || !this.importForm.valid) {
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('settings', JSON.stringify(this.importForm.value));

    this.adminService.previewImport(formData).subscribe({
      next: (preview: any) => {
        this.previewData = preview.data.slice(0, 10);
        this.showPreview = true;
      },
      error: (error: any) => {
        console.error('Erreur lors de la prévisualisation:', error);
        this.snackBar.open('Erreur lors de la prévisualisation', 'Fermer', { duration: 3000 });
      }
    });
  }

  startImport(): void {
    if (!this.selectedFile || !this.importForm.valid) {
      return;
    }

    this.importing = true;
    this.importProgress = 0;
    this.importResult = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('settings', JSON.stringify(this.importForm.value));

    this.adminService.importData(formData).subscribe({
      next: (result: ImportResult) => {
        this.importResult = result;
        this.importing = false;
        this.importProgress = 100;
        
        if (result.success) {
          this.snackBar.open(`Import réussi: ${result.successCount} éléments importés`, 'Fermer', { duration: 5000 });
        } else {
          this.snackBar.open(`Import terminé avec des erreurs: ${result.errors?.length} erreurs`, 'Fermer', { duration: 5000 });
        }
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'import:', error);
        this.snackBar.open('Erreur lors de l\'import', 'Fermer', { duration: 3000 });
        this.importing = false;
      }
    });
  }

  downloadTemplate(): void {
    const importType = this.importForm.get('importType')?.value;
    const fileFormat = this.importForm.get('fileFormat')?.value || this.importForm.get('format')?.value;
    
    if (importType && fileFormat) {
      this.adminService.downloadImportTemplate(importType, fileFormat).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `template_${importType}.${fileFormat}`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error: any) => {
          console.error('Erreur lors du téléchargement du template:', error);
          this.snackBar.open('Erreur lors du téléchargement', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  resetImport(): void {
    this.selectedFile = null;
    this.importing = false;
    this.importProgress = 0;
    this.importResult = null;
    this.previewData = [];
    this.showPreview = false;
    this.importForm.reset({
      skipFirstRow: true,
      validateData: true,
      updateExisting: false,
      createMissing: true,
      batchSize: 100
    });
  }

  getFileIcon(format: string): string {
    const icons: { [key: string]: string } = {
      'csv': 'description',
      'xlsx': 'table_chart',
      'json': 'code',
      'xml': 'code'
    };
    return icons[format] || 'insert_drive_file';
  }
}
