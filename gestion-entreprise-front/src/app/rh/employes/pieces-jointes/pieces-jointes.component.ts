import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { EmployeService } from '../../services/employe.service';
import { DocumentEmploye } from '../../models/employe.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-pieces-jointes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatListModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './pieces-jointes.component.html',
  styleUrls: ['./pieces-jointes.component.css']
})
export class PiecesJointesComponent implements OnInit {
  @Input() employeId!: number;
  @Input() employeeName: string = '';
  
  documents: DocumentEmploye[] = [];
  filteredDocuments: DocumentEmploye[] = [];
  loading = false;
  uploadProgress = 0;
  isUploading = false;
  uploading = false;
  
  // Propriétés pour le drag & drop
  isDragOver = false;
  selectedFiles: File[] = [];
  
  // Propriétés pour les filtres
  selectedType = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  searchTerm = '';
  
  // Formulaire d'upload
  uploadForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private employeService: EmployeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.uploadForm = this.fb.group({
      type: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    if (this.employeId) {
      this.chargerDocuments();
    }
  }

  chargerDocuments(): void {
    this.loading = true;
    this.employeService.getDocuments(this.employeId).subscribe({
      next: (documents) => {
        this.documents = documents;
        this.filteredDocuments = documents;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erreur lors du chargement des documents:', error);
        this.snackBar.open('Erreur lors du chargement des documents', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // Méthodes pour le drag & drop
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files) {
      this.selectedFiles = Array.from(files);
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = Array.from(files);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  uploadFiles(): void {
    if (this.selectedFiles.length === 0) return;
    
    this.uploading = true;
    this.uploadProgress = 0;
    
    const formData = this.uploadForm.value;
    
    this.selectedFiles.forEach((file, index) => {
      this.employeService.uploadDocument(this.employeId, file, formData.type || 'autre').subscribe({
        next: (response) => {
          this.uploadProgress = ((index + 1) / this.selectedFiles.length) * 100;
          if (index === this.selectedFiles.length - 1) {
            this.snackBar.open('Documents uploadés avec succès', 'Fermer', { duration: 3000 });
            this.chargerDocuments();
            this.cancelUpload();
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erreur lors de l\'upload:', error);
          this.snackBar.open('Erreur lors de l\'upload du document', 'Fermer', { duration: 3000 });
          this.uploading = false;
        }
      });
    });
  }

  cancelUpload(): void {
    this.selectedFiles = [];
    this.uploading = false;
    this.uploadProgress = 0;
    this.uploadForm.reset();
  }

  // Méthodes pour les filtres
  onFilterChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.selectedType = '';
    this.startDate = null;
    this.endDate = null;
    this.searchTerm = '';
    this.filteredDocuments = this.documents;
  }

  private applyFilters(): void {
    this.filteredDocuments = this.documents.filter(doc => {
      const matchesType = !this.selectedType || doc.type === this.selectedType;
      const matchesSearch = !this.searchTerm || doc.nom.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDateRange = (!this.startDate || new Date(doc.dateUpload) >= this.startDate) &&
                              (!this.endDate || new Date(doc.dateUpload) <= this.endDate);
      
      return matchesType && matchesSearch && matchesDateRange;
    });
  }

  // Méthodes pour les actions sur les documents
  viewDocument(doc: DocumentEmploye): void {
    // Ouvrir le document dans un nouvel onglet
    window.open(doc.fichier, '_blank');
  }

  downloadDocument(doc: DocumentEmploye): void {
    this.telechargerDocument(doc);
  }

  editDocument(doc: DocumentEmploye): void {
    // Ouvrir une boîte de dialogue pour éditer les métadonnées
    console.log('Éditer document:', doc);
  }

  deleteDocument(docId: number): void {
    const doc = this.documents.find(d => d.id === docId);
    if (doc) {
      this.supprimerDocument(doc);
    }
  }

  // Méthodes utilitaires - VERSION CORRIGÉE
  getFileIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'doc':
      case 'docx':
        return 'description';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'image';
      default:
        return 'insert_drive_file';
    }
  }

  getFileTypeClass(type: string): string {
    return `file-type-${type.toLowerCase()}`;
  }

  getTypeColor(type: string): 'primary' | 'accent' | 'warn' {
    switch (type.toLowerCase()) {
      case 'cv': return 'primary';
      case 'diplome': return 'accent';
      case 'contrat': return 'warn';
      default: return 'primary';
    }
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'cv': 'CV',
      'diplome': 'Diplôme',
      'certificat': 'Certificat',
      'contrat': 'Contrat',
      'piece_identite': 'Pièce d\'identité',
      'autre': 'Autre'
    };
    return labels[type.toLowerCase()] || type;
  }

  telechargerDocument(document: DocumentEmploye): void {
    this.employeService.telechargerDocument(document.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = document.nom;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erreur lors du téléchargement:', error);
        this.snackBar.open('Erreur lors du téléchargement', 'Fermer', { duration: 3000 });
      }
    });
  }

  supprimerDocument(document: DocumentEmploye): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le document "${document.nom}" ?`)) {
      this.employeService.supprimerDocument(document.id).subscribe({
        next: () => {
          this.snackBar.open('Document supprimé avec succès', 'Fermer', { duration: 3000 });
          this.chargerDocuments();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
