import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { EmployeService } from '../../services/employe.service';
import { Employe, EmployeFilter } from '../../models/employe.model';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-liste-employes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './liste-employes.component.html',
  styleUrls: ['./liste-employes.component.css']
})
export class ListeEmployesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['nom', 'prenom', 'email', 'poste', 'departement', 'statut', 'actions'];
  dataSource = new MatTableDataSource<Employe>();
  loading = false;

  filterForm = new FormGroup({
    nom: new FormControl(''),
    departement: new FormControl(''),
    poste: new FormControl(''),
    statut: new FormControl(''),
    typeContrat: new FormControl('')
  });

  departements = ['IT', 'RH', 'Finance', 'Marketing', 'Ventes'];
  postes = ['Développeur', 'Manager', 'Analyste', 'Consultant'];
  statuts = ['actif', 'inactif', 'suspendu']; // Updated to match backend values
  typesContrat = ['CDI', 'CDD', 'Stage', 'Freelance', 'Apprentissage'];

  constructor(
    private employeService: EmployeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerEmployes();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  chargerEmployes(): void {
    this.loading = true;
    const filter = this.filterForm.value as EmployeFilter;
    
    this.employeService.getEmployes(filter).subscribe({
      next: (employes: Employe[]) => {
        this.dataSource.data = employes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des employés:', error);
        this.snackBar.open('Erreur lors du chargement des employés', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  appliquerFiltre(): void {
    this.chargerEmployes();
  }

  reinitialiserFiltre(): void {
    this.filterForm.reset();
    this.chargerEmployes();
  }

  voirDetail(employe: Employe): void {
    this.router.navigate(['/rh/employes', employe.id]);
  }

  modifierEmploye(employe: Employe): void {
    this.router.navigate(['/rh/employes', employe.id, 'modifier']);
  }

  supprimerEmploye(employe: Employe): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'employé ${employe.prenom} ${employe.nom} ?`)) {
      this.employeService.deleteEmploye(employe.id).subscribe({
        next: () => {
          this.snackBar.open('Employé supprimé avec succès', 'Fermer', { duration: 3000 });
          this.chargerEmployes();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  exporterEmployes(): void {
    this.employeService.exportEmployes('excel').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employes_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors de l\'export:', error);
        this.snackBar.open('Erreur lors de l\'export', 'Fermer', { duration: 3000 });
      }
    });
  }

  getStatutColor(statut: string): string {
    switch (statut?.toLowerCase()) {
      case 'actif': return 'primary';
      case 'inactif': return 'warn';
      case 'suspendu': return 'accent';
      default: return '';
    }
  }
}
