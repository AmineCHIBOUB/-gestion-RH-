import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips'; // Module ajouté
import { RoleService } from '../../services/role.service';
import { Role } from '../../models/role.model';
import { RoleFormComponent } from './role-form.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
    MatChipsModule // Module ajouté aux imports
  ],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {
  roles: Role[] = [];
  displayedColumns: string[] = ['id', 'name', 'description', 'permissions', 'actions'];
  loading = false;

  constructor(
    private roleService: RoleService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
        console.log('Roles loaded successfully:', roles);
      },
      error: (error: any) => {
        console.error('Error loading roles:', error);
        this.loading = false;
        
        // Gestion spécifique des erreurs
        if (error.status === 401) {
          this.snackBar.open('Session expirée. Veuillez vous reconnecter.', 'Fermer', { duration: 5000 });
        } else if (error.status === 403) {
          this.snackBar.open('Accès non autorisé.', 'Fermer', { duration: 5000 });
        } else if (error.status === 500) {
          this.snackBar.open('Erreur serveur. Veuillez réessayer plus tard.', 'Fermer', { duration: 5000 });
        } else {
          this.snackBar.open('Erreur lors du chargement des rôles', 'Fermer', { duration: 3000 });
        }
      }
    });
  }

  openRoleForm(role?: Role): void {
    const dialogRef = this.dialog.open(RoleFormComponent, {
      width: '700px',
      data: role || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRoles();
      }
    });
  }

  deleteRole(role: Role): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer le rôle',
        message: `Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roleService.deleteRole(role.id).subscribe({
          next: () => {
            this.snackBar.open('Rôle supprimé avec succès', 'Fermer', { duration: 3000 });
            this.loadRoles();
          },
          error: (error: any) => {
            console.error('Error deleting role:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }
}
