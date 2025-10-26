import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { EmployeService } from '../../services/employe.service';
import { EmployeProfile } from '../../models/employe.model';

@Component({
  selector: 'app-profil-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  templateUrl: './profil-edit.component.html',
  styleUrls: ['./profil-edit.component.css']
})
export class ProfilEditComponent implements OnInit {
  profilForm: FormGroup;
  employe: any = null;
  profil: EmployeProfile | null = null;
  loading = false;
  saving = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private employeService: EmployeService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.profilForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern(/^[+]?[0-9\s\-\(\)]+$/)]],
      date_naissance: [''],
      adresse: [''],
      poste: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  public loadProfile(): void {
    this.loading = true;
    this.error = null;
    this.employeService.getMyProfile().subscribe({
      next: (employe) => {
        this.employe = employe;
        this.profil = employe;
        
        // Formater la date de naissance pour l'input date HTML
        let dateNaissance = '';
        if (employe.date_naissance) {
          const date = new Date(employe.date_naissance);
          if (!isNaN(date.getTime())) {
            dateNaissance = date.toISOString().split('T')[0];
          }
        }
        
        this.profilForm.patchValue({
          nom: employe.nom,
          prenom: employe.prenom,
          email: employe.email,
          telephone: employe.telephone || '',
          date_naissance: dateNaissance,
          adresse: employe.adresse || '',
          poste: employe.poste
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du profil';
        this.snackBar.open('Erreur lors du chargement du profil', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadProfil(): void {
    this.loadProfile();
  }

  onSubmit(): void {
    if (this.profilForm.valid) {
      this.saving = true;
      this.employeService.updateMyProfile(this.profilForm.value).subscribe({
        next: () => {
          this.snackBar.open('Profil mis à jour avec succès', 'Fermer', { duration: 3000 });
          this.saving = false;
          // Ajouter la redirection vers la page profil
          this.router.navigate(['/employe/profil']);
        },
        error: () => {
          this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
          this.saving = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/employe/profil']);
  }

  getErrorMessage(fieldPath: string, subField?: string): string {
    const fieldName = subField ? `${fieldPath}.${subField}` : fieldPath;
    const control = this.profilForm.get(fieldName);
    
    if (!control || !control.errors) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Ce champ est requis';
    }
    
    if (control.hasError('email')) {
      return 'Format d\'email invalide';
    }
    
    if (control.hasError('pattern')) {
      if (fieldName.includes('telephone')) {
        return 'Format de téléphone invalide';
      }
    }
    
    return 'Champ invalide';
  }

  changePassword(): void {
    this.router.navigate(['/employe/change-password']);
  }
}
