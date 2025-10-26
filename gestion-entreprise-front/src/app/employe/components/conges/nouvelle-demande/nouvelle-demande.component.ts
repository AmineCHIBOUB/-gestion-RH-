import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
// Ensure all Material modules are imported
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CongeEmployeService } from '../../../services/conge-employe.service';
import { TypeConge, DemandeConge, SoldeConges } from '../../../models/conge-employe.model';
import { AuthService } from '../../../../core/services/auth.service';
// Interface pour les types de congé avec toutes les propriétés nécessaires
interface TypeCongeOption {
  id: string;
  nom: string;
  description?: string;
  code: string;
  value: TypeConge;
}

@Component({
  selector: 'app-nouvelle-demande',
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
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './nouvelle-demande.component.html',
  styleUrls: ['./nouvelle-demande.component.css']
})
export class NouvelleDemandeComponent implements OnInit {
  demandeForm: FormGroup;
  
  // Créer un tableau d'objets avec toutes les propriétés nécessaires
  // Updated types to match backend validation
  typesConge: TypeCongeOption[] = [
    {
      id: 'conge_paye',
      nom: 'Congés Payés',
      description: 'Congés payés annuels',
      code: 'CP',
      value: TypeConge.CONGE_PAYE
    },
    {
      id: 'rtt',
      nom: 'RTT',
      description: 'Réduction du Temps de Travail',
      code: 'RTT',
      value: TypeConge.RTT
    },
    {
      id: 'conge_maladie',
      nom: 'Congé Maladie',
      description: 'Arrêt maladie',
      code: 'CM',
      value: TypeConge.CONGE_MALADIE
    },
    {
      id: 'conge_maternite',
      nom: 'Congé Maternité',
      description: 'Congé de maternité',
      code: 'CMAT',
      value: TypeConge.CONGE_MATERNITE
    },
    {
      id: 'conge_paternite',
      nom: 'Congé Paternité',
      description: 'Congé de paternité',
      code: 'CPAT',
      value: TypeConge.CONGE_PATERNITE
    },
    {
      id: 'formation',
      nom: 'Congé Formation',
      description: 'Congé pour formation professionnelle',
      code: 'CF',
      value: TypeConge.FORMATION
    },
    {
      id: 'conge_sans_solde',
      nom: 'Congé Sans Solde',
      description: 'Congé sans rémunération',
      code: 'CE',
      value: TypeConge.CONGE_SANS_SOLDE
    }
  ];
  
  loading = false;
  submitting = false;
  error: string | null = null;
  soldeConges: SoldeConges | null = null;
  
  // Propriétés pour les dates
  minDate = new Date();
  maxDate = new Date(new Date().getFullYear() + 1, 11, 31);
  
  // Propriétés calculées
  get nbJoursCalcule(): number {
    return this.calculerNombreJours();
  }
  
  get nbJoursOuvrables(): number {
    return this.calculerJoursOuvrables();
  }

  constructor(
    private fb: FormBuilder,
    private congeService: CongeEmployeService,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.demandeForm = this.fb.group({
      typeCongeId: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      nbJours: [{ value: 0, disabled: true }],
      motif: [''],
      commentaire: ['']
    });
    
    // Écouter les changements de dates pour recalculer
    this.demandeForm.get('dateDebut')?.valueChanges.subscribe(() => {
      this.updateNbJours();
    });

    
    this.demandeForm.get('dateFin')?.valueChanges.subscribe(() => {
      this.updateNbJours();
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }
  
  loadInitialData(): void {
    this.error = null;
    this.loadSoldeConges();
  }

  private loadSoldeConges(): void {
    this.loading = true;
    this.congeService.getSoldeConges().subscribe({
      next: (solde) => {
        this.soldeConges = solde;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur getSoldeConges:', error);
        // Don't redirect on error, just show error message
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
        // Set default values to match the SoldeConges interface
        this.soldeConges = {
          congesPayes: { total: 0, utilise: 0, restant: 0 },
          rtt: { total: 0, utilise: 0, restant: 0 },
          maladie: { total: 0, utilise: 0, restant: 0 },
          formation: { total: 0, utilise: 0, restant: 0 }
        };
      }
    });
  }
  
  onCancel(): void {
    this.router.navigate(['/employe/conges']);
  }
  
  isFormValid(): boolean {
    return this.demandeForm.valid && this.nbJoursOuvrables > 0;
  }
  
  getErrorMessage(fieldName: string): string {
    const field = this.demandeForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    return '';
  }
  
  getSelectedTypeConge(): TypeCongeOption | undefined {
    const typeId = this.demandeForm.get('typeCongeId')?.value;
    return this.typesConge.find(type => type.id === typeId);
  }
  
  getSoldeDisponible(): number {
    const selectedType = this.getSelectedTypeConge();
    if (!selectedType || !this.soldeConges) return 0;
    
    switch (selectedType.code) {
      case 'CP':
        return this.soldeConges.congesPayes?.restant || 0;
      case 'RTT':
        return this.soldeConges.rtt?.restant || 0;
      default:
        return 999; // Pour les congés exceptionnels
    }
  }
  
  private updateNbJours(): void {
    const nbJours = this.calculerJoursOuvrables();
    this.demandeForm.patchValue({ nbJours }, { emitEvent: false });
  }
  
  private calculerJoursOuvrables(): number {
    const dateDebut = this.demandeForm.get('dateDebut')?.value;
    const dateFin = this.demandeForm.get('dateFin')?.value;
    
    if (!dateDebut || !dateFin) return 0;
    
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    if (fin < debut) return 0;
    
    let count = 0;
    const current = new Date(debut);
    
    while (current <= fin) {
      const dayOfWeek = current.getDay();
      // Exclure samedi (6) et dimanche (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }

  onSubmit(): void {
    if (this.demandeForm.valid) {
      this.submitting = true;
      const selectedType = this.getSelectedTypeConge();
      const currentUser = this.authService.getCurrentUser();
      
      if (!selectedType) {
        this.error = 'Veuillez sélectionner un type de congé';
        this.submitting = false;
        return;
      }
      
      console.log('Current user from auth service:', currentUser);
      console.log('User ID:', currentUser?.id);
      
      const formData: DemandeConge = {
        typeConge: selectedType.value,
        dateDebut: this.demandeForm.get('dateDebut')?.value,
        dateFin: this.demandeForm.get('dateFin')?.value,
        motif: this.demandeForm.get('motif')?.value,
        employeId: currentUser.employe.id
 // Changed from employe_id to employeId
      };
      
      console.log('Form data being sent:', formData);
      
      this.congeService.creerDemandeConge(formData).subscribe({
        next: () => {
          this.snackBar.open('Demande de congé créée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/employe/conges']);
        },
        error: (error) => {
          console.log('Full error response:', error);
          this.snackBar.open('Erreur lors de la création de la demande', 'Fermer', { duration: 3000 });
          this.submitting = false;
        }
      });
    }
  }

  calculerNombreJours(): number {
    const dateDebut = this.demandeForm.get('dateDebut')?.value;
    const dateFin = this.demandeForm.get('dateFin')?.value;
    
    if (dateDebut && dateFin) {
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);
      const diffTime = Math.abs(fin.getTime() - debut.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  }
}
