import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { DepartmentService } from '../../../../services/department.service';
import { Post } from '../../../../models/department.model';

@Component({
  selector: 'app-post-form',
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
    MatSelectModule
  ],
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.css']
})
export class PostFormComponent implements OnInit {
  postForm: FormGroup;
  isEditMode = false;
  loading = false;
  departments: any[] = [];

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private dialogRef: MatDialogRef<PostFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Post
  ) {
    this.isEditMode = !!data;
    this.postForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadDepartments();
    if (this.isEditMode) {
      this.populateForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', Validators.required],
      department_id: [null, Validators.required],
      niveau: ['', Validators.required],
      salaire_min: [null, [Validators.min(0)]],
      salaire_max: [null, [Validators.min(0)]],
      statut: ['actif', Validators.required]
    });
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error: any) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  populateForm(): void {
    if (this.data) {
      this.postForm.patchValue({
        titre: this.data.titre,
        description: this.data.description,
        department_id: this.data.department_id,
        niveau: this.data.niveau,
        salaire_min: this.data.salaire_min,
        salaire_max: this.data.salaire_max,
        statut: this.data.statut
      });
    }
  }

  onSubmit(): void {
    if (this.postForm.valid) {
      this.loading = true;
      const formData = this.postForm.value;

      const request = this.isEditMode 
        ? this.departmentService.updatePost(this.data.id, formData)
        : this.departmentService.createPost(formData);

      request.subscribe({
        next: (post) => {
          this.snackBar.open(
            this.isEditMode ? 'Poste mis à jour' : 'Poste créé',
            'Fermer',
            { duration: 3000 }
          );
          this.dialogRef.close(post);
        },
        error: (error: any) => {
          console.error('Error saving post:', error);
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