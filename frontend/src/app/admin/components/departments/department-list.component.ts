import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department.model';
import { DepartmentFormComponent } from './department-form/department-form.component';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="department-list-container">
      <div class="header">
        <h2>Gestion des Départements</h2>
        <button mat-raised-button color="accent" (click)="openDialog()">
          <mat-icon>add</mat-icon>
          Nouveau Département
        </button>
      </div>
      
      <div class="table-container">
        <div *ngIf="loading" class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
        <mat-table [dataSource]="departments" *ngIf="!loading" class="departments-table">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef>Nom</mat-header-cell>
            <mat-cell *matCellDef="let department">{{ department.name }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="description">
            <mat-header-cell *matHeaderCellDef>Description</mat-header-cell>
            <mat-cell *matCellDef="let department">{{ department.description }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
            <mat-cell *matCellDef="let department">
              <button mat-icon-button (click)="editDepartment(department)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteDepartment(department)">
                <mat-icon>delete</mat-icon>
              </button>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
        </mat-table>
      </div>
    </div>
  `,
  styles: [`
    /* Variables de couleurs */
    :host {
      --primary-color: #6366f1;
      --secondary-color: #ec4899;
      --success-color: #10b981;
      --info-color: #06b6d4;
      --purple-color: #8b5cf6;
      --teal-color: #14b8a6;
      --background-white: #ffffff;
      --text-dark: #1f2937;
      --text-light: #6b7280;
      --border-light: #e5e7eb;
      --shadow-light: 0 1px 3px rgba(0, 0, 0, 0.1);
      --shadow-medium: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .department-list-container {
      padding: 1.5rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      min-height: 100vh;
    }

    /* Header avec dégradé */
    .header {
      background: linear-gradient(135deg, var(--primary-color), var(--purple-color), var(--secondary-color));
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-medium);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header h2 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    /* Table avec style amélioré */
    .table-container {
      background: var(--background-white);
      border-radius: 12px;
      box-shadow: var(--shadow-light);
      overflow: hidden;
      border: 1px solid var(--border-light);
    }

    .departments-table {
      width: 100%;
    }

    .departments-table .mat-mdc-header-cell {
      background: white;
      color: transparent;
      background-clip: text;
      -webkit-background-clip: text;
      background-image: linear-gradient(135deg, var(--primary-color), var(--purple-color), var(--secondary-color));
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid var(--border-light);
      padding: 1rem;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .departments-table .mat-mdc-header-cell:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      background-image: linear-gradient(135deg, var(--secondary-color), var(--primary-color), var(--purple-color));
    }

    .departments-table .mat-mdc-header-cell::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s;
    }

    .departments-table .mat-mdc-header-cell:hover::before {
      left: 100%;
    }

    .departments-table .mat-mdc-cell {
      padding: 1rem;
      border-bottom: 1px solid var(--border-light);
      vertical-align: middle;
    }

    .departments-table .mat-mdc-row:hover {
      background: linear-gradient(135deg, #f8faff 0%, #f0f9ff 100%);
      transition: all 0.3s ease;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
  `]
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  loading = false;
  displayedColumns: string[] = ['name', 'description', 'actions'];

  constructor(
    private departmentService: DepartmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des départements:', error);
        this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  openDialog(department?: Department): void {
    const dialogRef = this.dialog.open(DepartmentFormComponent, {
      width: '500px',
      data: department
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDepartments();
      }
    });
  }

  editDepartment(department: Department): void {
    this.openDialog(department);
  }

  deleteDepartment(department: Department): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le département "${department.name}" ?`)) {
      this.departmentService.deleteDepartment(department.id).subscribe({
        next: () => {
          this.snackBar.open('Département supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadDepartments();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }
}