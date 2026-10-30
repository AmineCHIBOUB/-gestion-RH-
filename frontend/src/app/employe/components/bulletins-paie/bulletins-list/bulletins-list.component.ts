import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { BulletinPaieService, StatsAnnuelles } from '../../../services/bulletin-paie.service';
import { BulletinSummary } from '../../../models/bulletin-paie.model';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-bulletins-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './bulletins-list.component.html',
  styleUrls: ['./bulletins-list.component.css']
})
export class BulletinsListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<BulletinSummary>();
  displayedColumns: string[] = ['periode', 'salaireBrut', 'salaireNet', 'statut', 'actions'];
  loading = false;
  selectedYear = new Date().getFullYear();
  
  // Propriétés existantes
  bulletins: BulletinSummary[] = [];
  total = 0;
  anneeSelectionnee = new Date().getFullYear();
  annees: number[] = [];
  data: { bulletins: BulletinSummary[]; total: number; } = { bulletins: [], total: 0 };
  
  // Nouvelles propriétés manquantes
  statsAnnuelles: StatsAnnuelles = {
    totalBrut: 0,
    totalNet: 0,
    moyenneBrut: 0,
    moyenneNet: 0,
    nombreBulletins: 0
  };
  anneeControl = new FormControl<number>(new Date().getFullYear());
  error: string | null = null;
  
  constructor(
    private bulletinService: BulletinPaieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBulletins();
    this.loadAnnees();
    this.loadStatsAnnuelles();
    
    // Écouter les changements d'année
    this.anneeControl.valueChanges.subscribe(annee => {
      if (annee) {
        this.anneeSelectionnee = annee;
        this.loadBulletins();
        this.loadStatsAnnuelles();
      }
    });
  }

  private loadBulletins(): void {
    this.loading = true;
    this.error = null;
    
    this.bulletinService.getBulletins(this.anneeSelectionnee).subscribe({
      next: (response) => {
        this.bulletins = response.bulletins;
        this.total = response.total;
        this.dataSource.data = this.bulletins;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des bulletins';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  telechargerPDF(bulletin: BulletinSummary): void {
    if (bulletin.fichierPdf) {
      this.bulletinService.downloadBulletin(bulletin.id).subscribe({
        next: (blob) => {
          saveAs(blob, `bulletin-${bulletin.periode}.pdf`);
        },
        error: (error) => {
          console.error('Erreur lors du téléchargement:', error);
        }
      });
    }
  }

  voirDetails(bulletin: BulletinSummary): void {
    this.router.navigate(['/employe/bulletins', bulletin.id.toString()]);
  }

  private loadAnnees(): void {
    const currentYear = new Date().getFullYear();
    this.annees = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      this.annees.push(i);
    }
  }

  onAnneeChange(): void {
    this.loadBulletins();
    this.loadStatsAnnuelles();
  }

  getPeriodeLabel(bulletin: any): string {
    const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${mois[bulletin.mois - 1]} ${bulletin.annee}`;
  }
  
  // Nouvelles méthodes manquantes
  onRetry(): void {
    this.loadBulletins();
    this.loadStatsAnnuelles();
  }
  
  getStatutColor(statut: string): string {
    switch (statut?.toLowerCase()) {
      case 'valide':
      case 'validé':
        return 'primary';
      case 'en_attente':
      case 'en attente':
        return 'warn';
      case 'brouillon':
        return 'accent';
      default:
        return 'primary';
    }
  }
  
  getStatutLabel(statut: string): string {
    switch (statut?.toLowerCase()) {
      case 'valide':
      case 'validé':
        return 'Validé';
      case 'en_attente':
      case 'en attente':
        return 'En attente';
      case 'brouillon':
        return 'Brouillon';
      default:
        return statut || 'Inconnu';
    }
  }
  
  telechargerBulletin(bulletin: BulletinSummary): void {
    this.telechargerPDF(bulletin);
  }
  
  private loadStatsAnnuelles(): void {
    this.bulletinService.getStatsAnnuelles(this.anneeSelectionnee).subscribe({
      next: (stats) => {
        this.statsAnnuelles = stats;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        // Réinitialiser les stats en cas d'erreur
        this.statsAnnuelles = {
          totalBrut: 0,
          totalNet: 0,
          moyenneBrut: 0,
          moyenneNet: 0,
          nombreBulletins: 0
        };
      }
    });
  }
}
