import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { FormControl, FormGroup } from '@angular/forms';
import { CongeService } from '../../services/conge.service';
import { DemandeConge, DemandeCongeFilter, StatutConge } from '../../models/demande-conge.model';

@Component({
  selector: 'app-demandes-conges',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './demandes-conges.component.html',
  styleUrls: ['./demandes-conges.component.css']
})
export class DemandesCongesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['employe', 'type', 'dateDebut', 'dateFin', 'duree', 'statut', 'actions'];
  dataSource = new MatTableDataSource<DemandeConge>();
  loading = false;
  totalElements = 0;

  filterForm = new FormGroup({
    employe: new FormControl<string>(''),
    type: new FormControl<string>(''),
    statut: new FormControl<string>(''),
    dateDebut: new FormControl<Date | null>(null),
    dateFin: new FormControl<Date | null>(null)
  });

  typesConges = [
    { value: 'Congés payés', label: 'Congés payés' },
    { value: 'RTT', label: 'RTT' },
    { value: 'Congé maladie', label: 'Congé maladie' },
    { value: 'Congé maternité', label: 'Congé maternité' },
    { value: 'Congé paternité', label: 'Congé paternité' },
    { value: 'Congé sans solde', label: 'Congé sans solde' },
    { value: 'Formation', label: 'Formation' }
  ];

  statutsConges = [
    { value: 'en_attente', label: 'En attente' },
    { value: 'approuve', label: 'Approuvé' },
    { value: 'refuse', label: 'Refusé' },
    { value: 'annule', label: 'Annulé' }
  ];

  constructor(
    private congeService: CongeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.chargerDemandes();
    this.setupFilterListener();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  chargerDemandes(): void {
    this.loading = true;
    const filters = this.getFilters();
    
    this.congeService.getDemandes(filters).subscribe({
      next: (response: DemandeConge[]) => {
        this.dataSource.data = response;
        this.totalElements = response.length;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des demandes:', error);
        this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  setupFilterListener(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.chargerDemandes();
    });
  }

  getFilters(): DemandeCongeFilter {
    const formValue = this.filterForm.value;
    return {
      search: formValue.employe || undefined,
      typeConge: formValue.type || undefined,
      statut: (formValue.statut as StatutConge) || undefined,
      dateDebut: formValue.dateDebut ? formValue.dateDebut.toISOString().split('T')[0] : undefined,
      dateFin: formValue.dateFin ? formValue.dateFin.toISOString().split('T')[0] : undefined
    };
  }

  resetFilters(): void {
    this.filterForm.reset();
  }

  approuverDemande(demande: DemandeConge): void {
    if (confirm('Êtes-vous sûr de vouloir approuver cette demande ?')) {
      this.congeService.validerDemande(demande.id, {
        statut: 'approuve',
        commentaire: ''
      }).subscribe({
        next: () => {
          this.snackBar.open('Demande approuvée avec succès', 'Fermer', { duration: 3000 });
          this.chargerDemandes();
        },
        error: (error: any) => {
          console.error('Erreur lors de l\'approbation:', error);
          this.snackBar.open('Erreur lors de l\'approbation', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  refuserDemande(demande: DemandeConge): void {
    const commentaire = prompt('Commentaire (optionnel):');
    if (commentaire !== null) {
      this.congeService.validerDemande(demande.id, {
        statut: 'refuse',
        commentaire: commentaire
      }).subscribe({
        next: () => {
          this.snackBar.open('Demande refusée', 'Fermer', { duration: 3000 });
          this.chargerDemandes();
        },
        error: (error: any) => {
          console.error('Erreur lors du refus:', error);
          this.snackBar.open('Erreur lors du refus', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  getStatutColor(statut: StatutConge): string {
    switch (statut) {
      case 'en_attente': return 'warn';
      case 'approuve': return 'primary';
      case 'refuse': return 'accent';
      case 'annule': return '';
      default: return '';
    }
  }

  calculerDuree(dateDebut: string | Date, dateFin: string | Date): number {
    const debut = typeof dateDebut === 'string' ? new Date(dateDebut) : dateDebut;
    const fin = typeof dateFin === 'string' ? new Date(dateFin) : dateFin;
    const diffTime = Math.abs(fin.getTime() - debut.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  exporterDemandes(): void {
    this.congeService.getDemandes(this.getFilters()).subscribe({
      next: (demandes: DemandeConge[]) => {
        const csvContent = this.convertToCSV(demandes);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `demandes-conges-${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'export:', error);
        this.snackBar.open('Erreur lors de l\'export', 'Fermer', { duration: 3000 });
      }
    });
  }

  private convertToCSV(demandes: DemandeConge[]): string {
    const headers = ['Employé', 'Type', 'Date début', 'Date fin', 'Durée', 'Statut'];
    const csvArray = [headers.join(',')];
    
    demandes.forEach(demande => {
      const row = [
        `"${demande.employe?.nom} ${demande.employe?.prenom}"`,
        `"${demande.typeConge}"`,
        `"${demande.dateDebut}"`,
        `"${demande.dateFin}"`,
        `"${this.calculerDuree(demande.dateDebut, demande.dateFin)} jours"`,
        `"${demande.statut}"`
      ];
      csvArray.push(row.join(','));
    });
    
    return csvArray.join('\n');
  }
}
