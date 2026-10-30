import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BulletinPaieService } from '../../../services/bulletin-paie.service';
import { BulletinPaie } from '../../../models/bulletin-paie.model';

@Component({
  selector: 'app-bulletin-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './bulletin-detail.component.html',
  styleUrls: ['./bulletin-detail.component.css']
})
export class BulletinDetailComponent implements OnInit {
  bulletin: BulletinPaie | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bulletinService: BulletinPaieService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const bulletinId = this.route.snapshot.paramMap.get('id');
    if (bulletinId) {
      this.loadBulletin(bulletinId);
    } else {
      // CHANGE FROM /employe/bulletins-paie TO /employe/bulletins:
      this.router.navigate(['/employe/bulletins']);
    }
  }

  // ✅ Ajouter les méthodes manquantes
  loadBulletin(id: string): void {
    this.isLoading = true;
    this.error = null;
    
    // Convertir string en number
    const bulletinId = parseInt(id, 10);
    if (isNaN(bulletinId)) {
      this.error = 'ID de bulletin invalide';
      this.isLoading = false;
      return;
    }
    
    this.bulletinService.getBulletinDetail(bulletinId).subscribe({
      next: (bulletin) => {
        this.bulletin = bulletin;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du bulletin:', error);
        this.error = 'Erreur lors du chargement du bulletin de paie';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    // CHANGE FROM /employe/bulletins-paie TO /employe/bulletins:
    this.router.navigate(['/employe/bulletins']);
  }

  downloadBulletin(): void {
    if (!this.bulletin) return;
    
    // Utiliser directement l'ID number du bulletin
    this.bulletinService.downloadBulletin(this.bulletin.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bulletin-paie-${this.bulletin!.periode}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Bulletin téléchargé avec succès', 'Fermer', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
        this.snackBar.open('Erreur lors du téléchargement', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  retry(): void {
    const bulletinId = this.route.snapshot.paramMap.get('id');
    if (bulletinId) {
      this.loadBulletin(bulletinId);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  getPeriode(): string {
    if (!this.bulletin) return '';
    return this.bulletin.periode || `${this.getMonthName(this.bulletin.mois)} ${this.bulletin.annee}`;
  }

  private getMonthName(month: number): string {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month - 1] || '';
  }
}
