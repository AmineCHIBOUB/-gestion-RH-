import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { EmployeService } from '../../services/employe.service';
import { DepartmentService } from '../../../admin/services/department.service';
import { Employe, EmployeRequest } from '../../models/employe.model';

@Component({
  selector: 'app-formulaire-employe',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './formulaire-employe.component.html',
  styleUrls: ['./formulaire-employe.component.css']
})
export class FormulaireEmployeComponent implements OnInit {
  employeForm!: FormGroup;
  isEditMode = false;
  employeId?: number;
  loading = false;
  submitting = false;

  departments: any[] = [];
  posts: any[] = [];
  filteredPosts: any[] = [];
  statuts = ['actif', 'inactif'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeService: EmployeService,
    private departmentService: DepartmentService,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadPosts();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.employeId = +params['id'];
        this.chargerEmploye();
      }
    });

    // Filter posts when department changes
    this.employeForm.get('departement')?.valueChanges.subscribe(departmentId => {
      this.filterPostsByDepartment(departmentId);
      this.employeForm.get('poste')?.setValue(null); // Reset post selection
    });
  }

  private initForm(): void {
    this.employeForm = this.fb.group({
      user_name: ['', [Validators.required]],
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required]],
      adresse: [''],
      departement: ['', [Validators.required]], // Keep as 'departement'
      poste: ['', [Validators.required]], // Keep as 'poste'
      salaire: ['', [Validators.required, Validators.min(0)]],
      date_embauche: ['', [Validators.required]],
      numero_securite_sociale: ['', [Validators.required, Validators.pattern(/^\d{13,15}$/)]],
      statut: ['actif', [Validators.required]]
    });
  }



  onSubmit(): void {
    if (this.employeForm.valid) {
      this.loading = true;
      const formData = this.employeForm.value;
      
      // Map form fields to database field names
      const employeData: EmployeRequest = {
        user_name: formData.user_name,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        post_id: Number(formData.poste), // Map 'poste' to 'post_id'
        department_id: Number(formData.departement), // Map 'departement' to 'department_id'
        salaire: Number(formData.salaire),
        date_embauche: formData.date_embauche,
        numero_securite_sociale: formData.numero_securite_sociale,
        statut: formData.statut,
        user_password: formData.user_password,
        user_password_confirmation: formData.user_password_confirmation
      };
      
      const request = this.isEditMode 
        ? this.employeService.updateEmploye(this.employeId!, employeData)
        : this.employeService.createEmploye(employeData);

      request.subscribe({
        next: (response) => {
          this.submitting = false;
          this.snackBar.open(
            this.isEditMode ? 'Employé modifié avec succès' : 'Employé créé avec succès',
            'Fermer',
            { duration: 3000 }
          );
          this.router.navigate(['/rh/employes']);
        },
        error: (error) => {
          this.submitting = false;
          console.error('Erreur:', error);
          
          // Handle validation errors
          if (error.status === 422 && error.error.errors) {
            const errors = error.error.errors;
            Object.keys(errors).forEach(field => {
              const control = this.employeForm.get(field);
              if (control) {
                control.setErrors({ serverError: errors[field][0] });
              }
            });
          }
          
          this.snackBar.open(
            error.error?.message || 'Erreur lors de la sauvegarde',
            'Fermer',
            { duration: 5000 }
          );
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.employeForm.controls).forEach(key => {
        this.employeForm.get(key)?.markAsTouched();
      });
    }
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (response: any) => {
        this.departments = Array.isArray(response) ? response : response.data || [];
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.snackBar.open('Erreur lors du chargement des départements', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadPosts(): void {
    this.departmentService.getPosts().subscribe({
      next: (response: any) => {
        this.posts = Array.isArray(response) ? response : response.data || [];
        this.filteredPosts = this.posts;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.snackBar.open('Erreur lors du chargement des postes', 'Fermer', { duration: 3000 });
      }
    });
  }

  filterPostsByDepartment(departmentId: number): void {
    if (departmentId) {
      this.filteredPosts = this.posts.filter(post => post.department_id === departmentId);
    } else {
      this.filteredPosts = this.posts;
    }
  }

  chargerEmploye(): void {
    if (this.employeId) {
      this.loading = true;
      this.employeService.getEmployeById(this.employeId).subscribe({
        next: (employe: Employe) => {
          this.populateForm(employe);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading employee:', error);
          this.snackBar.open('Erreur lors du chargement de l\'employé', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  populateForm(employe: Employe): void {
    // Find the department for this employee's post
    const employeePost = this.posts.find(post => post.id === employe.poste);
    const departmentId = employeePost?.department_id;

    this.employeForm.patchValue({
      user_name: employe.user?.name || `${employe.prenom}.${employe.nom}`.toLowerCase(),
      nom: employe.nom,
      prenom: employe.prenom,
      email: employe.email,
      telephone: employe.telephone,
      adresse: employe.adresse,
      poste: employe.poste, // This is the post ID
      salaire: employe.salaire,
      date_embauche: employe.date_embauche,
      numero_securite_sociale: employe.numero_securite_sociale,
      statut: employe.statut,
      departement: departmentId // Set department for filtering
    });

    // Filter posts if department is found
    if (departmentId) {
      this.filterPostsByDepartment(departmentId);
    }
  }

  onCancel(): void {
    this.router.navigate(['/rh/employes']);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.employeForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (field?.hasError('email')) {
      return 'Email invalide';
    }
    if (field?.hasError('min')) {
      return 'La valeur doit être positive';
    }
    return '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.employeForm.controls).forEach(key => {
      const control = this.employeForm.get(key);
      control?.markAsTouched();
    });
  }
}
