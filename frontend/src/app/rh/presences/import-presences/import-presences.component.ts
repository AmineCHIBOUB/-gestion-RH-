import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { PresenceService } from '../../services/presence.service';
import { ImportResult, ImportError } from '../../models/presence.model';

@Component({
  selector: 'app-import-presences',
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
    MatStepperModule,
    MatTableModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatExpansionModule
  ],
  templateUrl: './import-presences.component.html',
  styleUrls: ['./import-presences.component.css']
})
export class ImportPresencesComponent implements OnInit {
  importForm!: FormGroup;  // Utilisation de l'assertion de définition
  isLoading = false;
  selectedFile: File | null = null;
  importResult: ImportResult | null = null;
  importErrors: ImportError[] = [];
  showPreview = false;
  previewData: any[] = [];

  // Configuration d'import
  importTypes = [
    { value: 'pointeuse', label: 'Pointeuse automatique' },
    { value: 'excel', label: 'Fichier Excel' },
    { value: 'csv', label: 'Fichier CSV' },
    { value: 'manuel', label: 'Saisie manuelle' }
  ];

  formatOptions = [
    { value: 'standard', label: 'Format standard' },
    { value: 'custom', label: 'Format personnalisé' }
  ];

  separators = [
    { value: ',', label: 'Virgule (,)' },
    { value: ';', label: 'Point-virgule (;)' },
    { value: '\t', label: 'Tabulation' }
  ];

  // Colonnes disponibles pour le mapping
  availableColumns = [
    'matricule',
    'nom',
    'prenom',
    'date',
    'heure_entree',
    'heure_sortie',
    'pause_debut',
    'pause_fin',
    'commentaire'
  ];

  columnMapping: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private presenceService: PresenceService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Initialisation
  }

  initializeForm(): void {
    this.importForm = this.fb.group({
      type: ['excel', Validators.required],
      format: ['standard'],
      separator: [','],
      hasHeader: [true],
      dateFormat: ['DD/MM/YYYY'],
      timeFormat: ['HH:mm'],
      validateData: [true],
      skipErrors: [false],
      periode: [''],
      commentaire: ['']
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.validateFile();
    }
  }

  validateFile(): void {
    if (!this.selectedFile) return;

    const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(this.selectedFile.type)) {
      this.snackBar.open('Type de fichier non supporté', 'Fermer', { duration: 3000 });
      this.selectedFile = null;
      return;
    }

    if (this.selectedFile.size > maxSize) {
      this.snackBar.open('Fichier trop volumineux (max 10MB)', 'Fermer', { duration: 3000 });
      this.selectedFile = null;
      return;
    }

    this.previewFile();
  }

  previewFile(): void {
    if (!this.selectedFile) return;

    this.isLoading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('preview', 'true');
    formData.append('config', JSON.stringify(this.importForm.value));

    this.presenceService.previewImport(formData).subscribe({
      next: (data) => {
        this.previewData = data.preview;
        this.showPreview = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la prévisualisation:', error);
        this.snackBar.open('Erreur lors de la prévisualisation', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  importData(): void {
    if (!this.selectedFile || !this.importForm.valid) {
      this.snackBar.open('Veuillez sélectionner un fichier et remplir tous les champs requis', 'Fermer', {
        duration: 3000
      });
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('config', JSON.stringify(this.importForm.value));
    formData.append('mapping', JSON.stringify(this.columnMapping));

    this.presenceService.importPresences(formData).subscribe({
      next: (result) => {
        this.importResult = result;
        this.importErrors = result.errors || [];
        this.isLoading = false;

        if (result.success) {
          this.snackBar.open(
            `Import réussi: ${result.imported} présences importées`,
            'Fermer',
            { duration: 5000 }
          );
        } else {
          this.snackBar.open(
            `Import terminé avec des erreurs: ${result.imported} importées, ${result.errors?.length || 0} erreurs`,
            'Fermer',
            { duration: 5000 }
          );
        }
      },
      error: (error) => {
        console.error('Erreur lors de l\'import:', error);
        this.snackBar.open('Erreur lors de l\'import', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  downloadTemplate(): void {
    const type = this.importForm.get('type')?.value;
    this.presenceService.downloadImportTemplate(type).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template_import_presences.${type === 'csv' ? 'csv' : 'xlsx'}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement du template:', error);
        this.snackBar.open('Erreur lors du téléchargement du template', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  exportErrors(): void {
    if (this.importErrors.length === 0) return;

    const csvContent = this.generateErrorsCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erreurs_import_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  generateErrorsCsv(): string {
    const headers = ['Ligne', 'Colonne', 'Valeur', 'Erreur'];
    const rows = this.importErrors.map(error => [
      error.row.toString(),
      error.column,
      error.value,
      error.message
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  resetImport(): void {
    this.selectedFile = null;
    this.importResult = null;
    this.importErrors = [];
    this.showPreview = false;
    this.previewData = [];
    this.columnMapping = {};
    this.importForm.reset({
      type: 'excel',
      format: 'standard',
      separator: ',',
      hasHeader: true,
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      validateData: true,
      skipErrors: false
    });
  }

  updateColumnMapping(sourceColumn: string, targetColumn: string): void {
    if (targetColumn) {
      this.columnMapping[sourceColumn] = targetColumn;
    } else {
      delete this.columnMapping[sourceColumn];
    }
  }

  getPreviewColumns(): string[] {
    return this.previewData.length > 0 ? Object.keys(this.previewData[0]) : [];
  }

  importFromPointeuse(): void {
    this.isLoading = true;
    const config = {
      dateDebut: this.importForm.get('periode')?.value?.split('/')[0],
      dateFin: this.importForm.get('periode')?.value?.split('/')[1],
      validateData: this.importForm.get('validateData')?.value
    };

    this.presenceService.importFromPointeuse(config).subscribe({
      next: (result) => {
        this.importResult = result;
        this.isLoading = false;
        this.snackBar.open(
          `Import pointeuse réussi: ${result.imported} présences importées`,
          'Fermer',
          { duration: 5000 }
        );
      },
      error: (error) => {
        console.error('Erreur lors de l\'import pointeuse:', error);
        this.snackBar.open('Erreur lors de l\'import pointeuse', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }
}
