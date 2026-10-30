import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips'; // Ajouter cet import
import { DocumentService } from '../../../services/document.service';
import { Document, TypeDocument, DocumentStats } from '../../../models/document.model';

@Component({
  selector: 'app-documents-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule // Ajouter ce module
  ],
  templateUrl: './documents-list.component.html',
  styleUrls: ['./documents-list.component.css']
})
export class DocumentsListComponent implements OnInit {
  // Corriger la colonne dans displayedColumns
  displayedColumns: string[] = ['titre', 'type', 'taille', 'dateCreation', 'actions'];
  dataSource = new MatTableDataSource<Document>();
  documentStats: DocumentStats | null = null;
  isLoading = false;
  error: string | null = null;
  selectedType: TypeDocument | 'all' = 'all';
  searchTerm = '';
  
  typeOptions = [
    { value: 'all', label: 'Tous les types' },
    { value: TypeDocument.PROCEDURE, label: 'Procédures' },
    { value: TypeDocument.POLITIQUE, label: 'Politiques' },
    { value: TypeDocument.FORMATION, label: 'Formations' },
    { value: TypeDocument.SECURITE, label: 'Sécurité' },
    { value: TypeDocument.QUALITE, label: 'Qualité' },
    { value: TypeDocument.ADMINISTRATIF, label: 'Administratif' },
    { value: TypeDocument.AUTRE, label: 'Autres' }
  ];

  constructor(
    private documentService: DocumentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
    this.loadStats();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.error = null;
    
    this.documentService.getDocuments().subscribe({
      next: (response) => {
        this.dataSource.data = response.documents;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des documents';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  loadStats(): void {
    this.documentService.getDocumentStats().subscribe({
      next: (stats) => {
        this.documentStats = stats;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
  }

  applyFilters(): void {
    let filteredData = [...this.dataSource.data];

    // Filtre par type - Corriger la propriété
    if (this.selectedType !== 'all') {
      filteredData = filteredData.filter(doc => doc.type === this.selectedType);
    }

    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(doc => 
        doc.titre.toLowerCase().includes(term) ||
        doc.description?.toLowerCase().includes(term)
      );
    }

    this.dataSource.data = filteredData;
  }

  onTypeChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  downloadDocument(document: Document): void {
    this.documentService.downloadDocument(document.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        // Résoudre le conflit en utilisant window.document
        const link = window.document.createElement('a');
        link.href = url;
        link.download = document.titre;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.markAsRead(document);
        
        this.snackBar.open('Document téléchargé avec succès', 'Fermer', {
          duration: 3000
        });
      },
      error: (error) => {
        this.snackBar.open('Erreur lors du téléchargement', 'Fermer', {
          duration: 3000
        });
        console.error('Erreur téléchargement:', error);
      }
    });
  }

  viewDocument(document: Document): void {
    this.documentService.getDocumentUrl(document.id).subscribe({
      next: (url: string) => {
        window.open(url, '_blank');
        this.markAsRead(document);
      },
      error: (error: any) => {
        this.snackBar.open('Erreur lors de l\'ouverture du document', 'Fermer', {
          duration: 3000
        });
        console.error('Erreur ouverture document:', error);
      }
    });
  }

  markAsRead(document: Document): void {
    if (!document.lu) {
      this.documentService.marquerCommeLu(document.id).subscribe({
        next: () => {
          document.lu = true;
          document.dateLecture = new Date();
        },
        error: (error) => {
          console.error('Erreur marquage lecture:', error);
        }
      });
    }
  }

  getTypeLabel(type: TypeDocument): string {
    const option = this.typeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  retry(): void {
    this.loadDocuments();
    this.loadStats();
  }
  
  // Ajouter cette méthode pour les couleurs des chips
  getTypeColor(type: TypeDocument): string {
    const colorMap: { [key: string]: string } = {
      [TypeDocument.PROCEDURE]: 'primary',
      [TypeDocument.POLITIQUE]: 'accent',
      [TypeDocument.FORMATION]: 'warn',
      [TypeDocument.SECURITE]: 'primary',
      [TypeDocument.QUALITE]: 'accent',
      [TypeDocument.ADMINISTRATIF]: 'basic',
      [TypeDocument.AUTRE]: 'basic'
    };
    return colorMap[type] || 'basic';
  }
}
