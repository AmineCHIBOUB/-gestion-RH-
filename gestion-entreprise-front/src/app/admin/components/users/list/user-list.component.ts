import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Router } from '@angular/router';

import { User } from '../../../models/user.model';
import { UserManagementService } from '../../../services/user-management.service';
import { UserFormComponent } from '../form/user-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'email', 'phone', 'department', 'post', 'roles', 'isActive', 'actions'];
  loading = false;
  searchTerm = '';

  private userService = inject(UserManagementService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private authService = inject(AuthService);

  constructor() {
    // Alerte supprimée
  }

  ngOnInit(): void {
    // Alerte supprimée
    this.loadUsers();
  }

  loadUsers(): void {
    // Alerte supprimée
    console.log('UserService:', this.userService);
    console.log('Search term:', this.searchTerm);
    
    this.loading = true;
    
    console.log('Making API call to getUsers...');
    this.userService.getUsers(1, 100, this.searchTerm || undefined).subscribe({
      next: (response: any) => {
        console.log('✅ SUCCESS: API Response received');
        console.log('=== USER DATA DEBUGGING ===');
        console.log('Full API Response:', response);
        
        if (response && Array.isArray(response)) {
          this.users = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          this.users = response.data;
        } else if (response && response.users && Array.isArray(response.users)) {
          this.users = response.users;
        } else {
          console.warn('Format de réponse inattendu:', response);
          this.users = [];
        }
        
        if (this.users.length > 0) {
          console.log('=== DETAILED USER ANALYSIS ===');
          this.users.forEach((user, index) => {
            console.log(`User ${index + 1}:`, {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
              isActive: user.isActive,
              department: user.department,
              profile: user.profile,
              fullObject: user
            });
          });
          console.log('=== END USER ANALYSIS ===');
        }
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.loading = false;
        // Notification d'erreur supprimée
      }
    });
  }

  refreshUsers(): void {
    this.loadUsers();
  }

  openUserForm(user?: User): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      data: user
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer l\'utilisateur',
        message: `Êtes-vous sûr de vouloir supprimer ${user.firstName} ${user.lastName} ?`
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            // Notification de succès supprimée
            this.loadUsers();
          },
          error: (error: any) => {
            console.error('Error deleting user:', error);
            // Notification d'erreur supprimée
          }
        });
      }
    });
  }

  toggleUserStatus(user: User): void {
    this.userService.toggleUserStatus(user.id).subscribe({
      next: (updatedUser: User) => {
        // Reload all users to ensure data consistency
        this.loadUsers();
        console.log('User status updated, reloading user list');
      },
      error: (error: any) => {
        console.error('Error toggling user status:', error);
      }
    });
  }

  get filteredUsers(): User[] {
    if (!this.searchTerm) {
      return this.users;
    }
    
    return this.users.filter(user => 
      user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (user.phone && user.phone.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
      (user.department && user.department.name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
      (user.post && user.post.titre.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }
}
