import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { UserManagementService } from '../../../services/user-management.service';
import { RoleService } from '../../../services/role.service';
import { DepartmentService } from '../../../services/department.service';
import { User, CreateUserRequest, UpdateUserRequest } from '../../../models/user.model';
import { Role } from '../../../models/role.model';
import { Department, Post } from '../../../models/department.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  roles: Role[] = [];
  departments: Department[] = [];
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  isEditMode = false;
  loading = false;

  // Utilisation de inject() pour l'injection de dépendances
  private userService = inject(UserManagementService);
  private roleService = inject(RoleService);
  private departmentService = inject(DepartmentService);
  private dialogRef = inject(MatDialogRef<UserFormComponent>);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: User | null
  ) {
    this.isEditMode = !!data;
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadDepartments();
    this.loadPosts();
    if (this.isEditMode) {
      this.populateForm();
    }
    
    // Listen for department changes to filter posts
    this.userForm.get('department_id')?.valueChanges.subscribe(departmentId => {
      this.filterPostsByDepartment(departmentId);
      // Reset post selection when department changes
      this.userForm.get('post_id')?.setValue(null);
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [this.isEditMode ? '' : '', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      department_id: [null, Validators.required],
      post_id: [null, Validators.required],
      isActive: [true]
    });
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  loadPosts(): void {
    this.departmentService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
      }
    });
  }

  filterPostsByDepartment(departmentId: number | null): void {
    if (departmentId) {
      this.filteredPosts = this.posts.filter(post => post.department_id === departmentId);
    } else {
      this.filteredPosts = [];
    }
  }

  loadRoles(): void {
    // Static roles since there's no role table in backend
    this.roles = [
      {
        id: 1,
        name: 'admin',
        displayName: 'Administrateur',
        description: 'Accès complet au système',
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: []
      },
      {
        id: 2,
        name: 'rh',
        displayName: 'Ressources Humaines',
        description: 'Gestion des employés et des ressources humaines',
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: []
      },
      {
        id: 3,
        name: 'employe',
        displayName: 'Employé',
        description: 'Accès standard pour les employés',
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: []
      }
    ];
  }

  populateForm(): void {
    if (this.data) {
      this.userForm.patchValue({
        firstName: this.data.firstName,
        lastName: this.data.lastName,
        email: this.data.email,
        role: this.data.role,
        department_id: this.data.department_id,
        post_id: this.data.post_id,
        isActive: this.data.isActive
      });
      
      // Filter posts when editing and department is already selected
      if (this.data.department_id) {
        this.filterPostsByDepartment(this.data.department_id);
      }
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;
      const formData = this.userForm.value;

      // Transform camelCase to snake_case for backend
      const transformedData: any = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        role: formData.role,
        department_id: formData.department_id,
        post_id: formData.post_id,
        is_active: formData.isActive
      };

      // Add password only for create requests
      if (!this.isEditMode) {
        transformedData.password = formData.password;
      }

      const request = this.isEditMode 
        ? this.userService.updateUser(this.data!.id, transformedData as UpdateUserRequest)
        : this.userService.createUser(transformedData as CreateUserRequest);

      request.subscribe({
        next: (user: User) => {
          this.snackBar.open(
            this.isEditMode ? 'Utilisateur mis à jour' : 'Utilisateur créé',
            'Fermer',
            { duration: 3000 }
          );
          this.dialogRef.close(user);
        },
        error: (error: any) => {
          console.error('Error saving user:', error);
          this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
