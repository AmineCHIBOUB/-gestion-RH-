import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RoleService } from '../../services/role.service';
import { Role, Permission, CreateRoleRequest } from '../../models/role.model';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.css']
})
export class RoleFormComponent implements OnInit {
  roleForm: FormGroup;
  isEditMode = false;
  loading = false;
  availablePermissions: Permission[] = [];
  permissionCategories = {
    'Utilisateurs': ['users.view', 'users.create', 'users.edit', 'users.delete'],
    'Rôles': ['roles.view', 'roles.create', 'roles.edit', 'roles.delete'],
    'Départements': ['departments.view', 'departments.create', 'departments.edit', 'departments.delete'],
    'Employés': ['employees.view', 'employees.create', 'employees.edit', 'employees.delete'],
    'Paie': ['payroll.view', 'payroll.create', 'payroll.edit', 'payroll.delete'],
    'Présences': ['attendance.view', 'attendance.create', 'attendance.edit', 'attendance.delete'],
    'Rapports': ['reports.view', 'reports.create', 'reports.export'],
    'Paramètres': ['settings.view', 'settings.edit'],
    'Administration': ['admin.full_access', 'admin.system_config']
  };

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private dialogRef: MatDialogRef<RoleFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Role | null
  ) {
    this.isEditMode = !!data;
    this.roleForm = this.createForm();
    this.initializePermissions();
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      this.populateForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      permissions: this.fb.array([])
    });
  }

  initializePermissions(): void {
    const permissionsArray = this.roleForm.get('permissions') as FormArray;
    
    // Créer tous les permissions disponibles
    Object.values(this.permissionCategories).flat().forEach((permission, index) => {
      permissionsArray.push(new FormControl(false));
      this.availablePermissions.push({
        id: index + 1,
        name: permission,
        displayName: this.getPermissionDescription(permission),
        description: this.getPermissionDescription(permission),
        module: this.getModuleFromPermission(permission),
        action: this.getActionFromPermission(permission),
        resource: this.getResourceFromPermission(permission)
      });
    });
  }

  private getModuleFromPermission(permission: string): string {
    return permission.split('.')[0];
  }

  private getActionFromPermission(permission: string): string {
    return permission.split('.')[1] || 'view';
  }

  private getResourceFromPermission(permission: string): string {
    return permission.split('.')[0];
  }

  getPermissionDescription(permission: string): string {
    const descriptions: { [key: string]: string } = {
      'users.view': 'Voir les utilisateurs',
      'users.create': 'Créer des utilisateurs',
      'users.edit': 'Modifier les utilisateurs',
      'users.delete': 'Supprimer les utilisateurs',
      'roles.view': 'Voir les rôles',
      'roles.create': 'Créer des rôles',
      'roles.edit': 'Modifier les rôles',
      'roles.delete': 'Supprimer les rôles',
      'departments.view': 'Voir les départements',
      'departments.create': 'Créer des départements',
      'departments.edit': 'Modifier les départements',
      'departments.delete': 'Supprimer les départements',
      'employees.view': 'Voir les employés',
      'employees.create': 'Créer des employés',
      'employees.edit': 'Modifier les employés',
      'employees.delete': 'Supprimer les employés',
      'payroll.view': 'Voir la paie',
      'payroll.create': 'Créer des éléments de paie',
      'payroll.edit': 'Modifier la paie',
      'payroll.delete': 'Supprimer des éléments de paie',
      'attendance.view': 'Voir les présences',
      'attendance.create': 'Enregistrer des présences',
      'attendance.edit': 'Modifier les présences',
      'attendance.delete': 'Supprimer des présences',
      'reports.view': 'Voir les rapports',
      'reports.create': 'Créer des rapports',
      'reports.export': 'Exporter les rapports',
      'settings.view': 'Voir les paramètres',
      'settings.edit': 'Modifier les paramètres',
      'admin.full_access': 'Accès administrateur complet',
      'admin.system_config': 'Configuration système'
    };
    return descriptions[permission] || permission;
  }

  populateForm(): void {
    if (this.data) {
      this.roleForm.patchValue({
        name: this.data.name,
        description: this.data.description
      });

      // Cocher les permissions existantes
      const permissionsArray = this.roleForm.get('permissions') as FormArray;
      this.data.permissions.forEach(permission => {
        const index = this.availablePermissions.findIndex(p => p.name === permission.name);
        if (index !== -1) {
          permissionsArray.at(index).setValue(true);
        }
      });
    }
  }

  getPermissionsArray(): FormArray {
    return this.roleForm.get('permissions') as FormArray;
  }

  getPermissionsByCategory(category: string): { permission: Permission, control: FormControl, index: number }[] {
    const categoryPermissions = this.permissionCategories[category as keyof typeof this.permissionCategories];
    return categoryPermissions.map(permName => {
      const index = this.availablePermissions.findIndex(p => p.name === permName);
      return {
        permission: this.availablePermissions[index],
        control: this.getPermissionsArray().at(index) as FormControl,
        index
      };
    }).filter(item => item.permission);
  }

  selectAllInCategory(category: string, select: boolean): void {
    const categoryItems = this.getPermissionsByCategory(category);
    categoryItems.forEach(item => {
      item.control.setValue(select);
    });
  }

  isCategoryFullySelected(category: string): boolean {
    const categoryItems = this.getPermissionsByCategory(category);
    return categoryItems.length > 0 && categoryItems.every(item => item.control.value);
  }

  isCategoryPartiallySelected(category: string): boolean {
    const categoryItems = this.getPermissionsByCategory(category);
    const selectedCount = categoryItems.filter(item => item.control.value).length;
    return selectedCount > 0 && selectedCount < categoryItems.length;
  }

  onSubmit(): void {
    if (this.roleForm.valid) {
      this.loading = true;
      
      const selectedPermissionIds: number[] = [];
      const permissionsArray = this.getPermissionsArray();
      
      permissionsArray.controls.forEach((control, index) => {
        if (control.value) {
          selectedPermissionIds.push(this.availablePermissions[index].id);
        }
      });

      const roleData: CreateRoleRequest = {
        name: this.roleForm.value.name,
        displayName: this.roleForm.value.name,
        description: this.roleForm.value.description,
        permissionIds: selectedPermissionIds
      };

      const operation = this.isEditMode && this.data
        ? this.roleService.updateRole(this.data.id, roleData)
        : this.roleService.createRole(roleData);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            this.isEditMode ? 'Rôle modifié avec succès' : 'Rôle créé avec succès',
            'Fermer',
            { duration: 3000 }
          );
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde:', error);
          this.snackBar.open(
            'Erreur lors de la sauvegarde du rôle',
            'Fermer',
            { duration: 3000 }
          );
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getSelectedPermissionsCount(): number {
    return this.getPermissionsArray().controls.filter(control => control.value).length;
  }
}