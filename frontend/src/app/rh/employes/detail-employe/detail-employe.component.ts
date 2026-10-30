import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeService } from '../../services/employe.service';
import { Employe, DocumentEmploye } from '../../models/employe.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-detail-employe',
  standalone: true,
  imports: [
    CommonModule, // Contient NgIf, NgFor, etc.
    DatePipe, // Pour le pipe date
    CurrencyPipe, // Pour le pipe currency
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './detail-employe.component.html',
  styleUrls: ['./detail-employe.component.css']
})
export class DetailEmployeComponent implements OnInit {
  employe: Employe | null = null;
  documents: DocumentEmploye[] = [];
  loading = true;
  activeTab = 0;

  constructor(
    private route: ActivatedRoute,
    public router: Router, // Rendu public pour l'utiliser dans le template
    private employeService: EmployeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.chargerEmploye(+id);
      this.chargerDocuments(+id);
    }
  }

  chargerEmploye(id: number): void {
    this.employeService.getEmploye(id).subscribe({
      next: (employe) => {
        this.employe = employe;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'employé:', error);
        this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  chargerDocuments(employeId: number): void {
    this.employeService.getDocuments(employeId).subscribe({
      next: (documents: DocumentEmploye[]) => {
        this.documents = documents;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erreur lors du chargement des documents:', error);
      }
    });
  }

  modifier(): void {
    if (this.employe) {
      this.router.navigate(['/rh/employes', this.employe.id, 'modifier']);
    }
  }

  supprimer(): void {
    if (this.employe && confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      this.employeService.supprimerEmploye(this.employe.id).subscribe({
        next: () => {
          this.snackBar.open('Employé supprimé avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/rh/employes']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  telechargerDocument(document: DocumentEmploye): void {
    this.employeService.telechargerDocument(document.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = document.nom;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        console.error('Erreur lors du téléchargement:', error);
        this.snackBar.open('Erreur lors du téléchargement', 'Fermer', { duration: 3000 });
      }
    });
  }

  calculerAge(dateNaissance: Date | string): number {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  calculerAnciennete(dateEmbauche: Date | string): string {
    const today = new Date();
    const embaucheDate = new Date(dateEmbauche);
    const diffTime = Math.abs(today.getTime() - embaucheDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
    } else {
      return `${months} mois`;
    }
  }
}
