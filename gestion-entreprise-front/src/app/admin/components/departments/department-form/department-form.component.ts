import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DepartmentService } from '../../../services/department.service';
import { Department } from '../../../models/department.model';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.css']
})
export class DepartmentFormComponent implements OnInit {
  departmentForm: FormGroup;
  isEditMode = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private dialogRef: MatDialogRef<DepartmentFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Department
  ) {
    this.isEditMode = !!data;
    this.departmentForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      this.populateForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]], // Changé de 'nom' à 'name'
      description: ['', Validators.required],
      code: [''], // Ajouté le champ code qui existe dans le modèle
      manager_id: [null] // Changé de 'manager' à 'manager_id' pour correspondre au modèle
    });
  }

  // Dans la méthode populateForm()
  populateForm(): void {
    if (this.data) {
      this.departmentForm.patchValue({
        name: this.data.name,
        description: this.data.description,
        code: this.data.code,
        manager_id: this.data.manager_id
      });
    }
  }

  onSubmit(): void {
    if (this.departmentForm.valid) {
      this.loading = true;
      const formData = this.departmentForm.value;

      const request = this.isEditMode 
        ? this.departmentService.updateDepartment(this.data.id, formData)
        : this.departmentService.createDepartment(formData);

      request.subscribe({
        next: (department) => {
          this.snackBar.open(
            this.isEditMode ? 'Département mis à jour' : 'Département créé',
            'Fermer',
            { duration: 3000 }
          );
          this.dialogRef.close(department);
        },
        error: (error: any) => {
          console.error('Error saving department:', error);
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
