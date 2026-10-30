import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EmployeService } from '../../services/employe.service';
import { EmployeProfile } from '../../models/employe.model';
import { AuthService } from '../../../core/services/auth.service'; // Ajout

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {
  profil: EmployeProfile | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private employeService: EmployeService,
    private authService: AuthService, // Ajout
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Vérifier l'authentification avant de charger le profil
    if (!this.authService.isAuthenticated()) {
      console.error('Utilisateur non authentifié');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    console.log('Token disponible:', !!this.authService.getToken());
    console.log('Utilisateur connecté:', this.authService.getCurrentUser());
    
    this.loadProfil();
  }

  loadProfil(): void {
    this.loading = true;
    this.error = null;
    
    console.log('Chargement du profil...');
    
    this.employeService.getMyProfile().subscribe({
      next: (profil: EmployeProfile) => {
        console.log('Profil chargé avec succès:', profil);
        this.profil = profil;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur détaillée:', {
          status: error.status,
          message: error.message,
          error: error.error,
          url: error.url
        });
        
        let errorMessage = 'Erreur lors du chargement du profil';
        
        if (error.status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          this.authService.logout().subscribe(() => {
            this.router.navigate(['/auth/login']);
          });
        } else if (error.status === 404) {
          errorMessage = 'Profil non trouvé. Contactez l\'administrateur.';
        } else if (error.status === 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        }
        
        this.error = errorMessage;
        this.loading = false;
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  navigateToEdit(): void {
    this.router.navigate(['/employe/profil/modifier']);
  }

  onRefresh(): void {
    this.loadProfil();
  }
}
