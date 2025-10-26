import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FeuilleTempsService } from '../../../services/feuille-temps.service';
import { FeuilleTemps, HeuresJour, SaisieTemps, StatutFeuilleTemps } from '../../../models/feuille-temps.model';

@Component({
  selector: 'app-temps-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './temps-form.component.html',
  styleUrls: ['./temps-form.component.css']
})
export class TempsFormComponent implements OnInit {
  tempsForm!: FormGroup; // Utiliser ! au lieu de : pour indiquer qu'il sera initialisé
  feuille: FeuilleTemps | null = null;
  isEditMode = false;
  isLoading = false;
  error: string | null = null;
  selectedMonth: string = '';
  selectedYear: number = new Date().getFullYear();
  daysInMonth: Date[] = [];
  totalHeures = 0;
  
  availableMonths = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private feuilleTempsService: FeuilleTempsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    const currentDate = new Date();
    this.selectedMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    
    // Simplifier le typage du FormGroup
    this.tempsForm = this.fb.group({
      mois: [currentDate.getMonth() + 1, Validators.required],
      annee: [this.selectedYear, Validators.required],
      heuresJours: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const feuilleId = this.route.snapshot.paramMap.get('id');
    if (feuilleId) {
      this.isEditMode = true;
      this.loadFeuille(feuilleId);
    } else {
      this.generateDaysForMonth();
      this.initializeForm();
    }
  }

  get heuresJours(): FormArray {
    return this.tempsForm.get('heuresJours') as FormArray;
  }

  loadFeuille(id: string): void {
    this.isLoading = true;
    this.error = null;

    this.feuilleTempsService.getFeuilleById(id).subscribe({
      next: (feuille) => {
        this.feuille = feuille;
        // Corriger: utiliser les bonnes propriétés du modèle
        this.selectedMonth = new Date(feuille.dateDebut).getMonth().toString().padStart(2, '0');
        this.selectedYear = feuille.annee;
        this.generateDaysForMonth();
        this.populateForm();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement de la feuille de temps';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  generateDaysForMonth(): void {
    const year = this.selectedYear;
    const month = parseInt(this.selectedMonth) - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    this.daysInMonth = [];
    for (let day = 1; day <= daysInMonth; day++) {
      this.daysInMonth.push(new Date(year, month, day));
    }
  }

  initializeForm(): void {
    const heuresJoursArray = this.fb.array<FormGroup>([]);
    
    this.daysInMonth.forEach(date => {
      const dayForm = new FormGroup({
        jour: new FormControl(this.getDayName(date)),
        date: new FormControl(date),
        heureDebut: new FormControl(''),
        heureFin: new FormControl(''),
        pauseMinutes: new FormControl(0, [Validators.min(0), Validators.max(120)]),
        totalHeures: new FormControl(0, [Validators.min(0), Validators.max(12)]),
        heuresNormales: new FormControl(0, [Validators.min(0), Validators.max(12)]),
        heuresSupplementaires: new FormControl(0, [Validators.min(0), Validators.max(8)]),
        projet: new FormControl(''),
        tache: new FormControl(''),
        commentaire: new FormControl('')
      });
      
      // Ajouter les listeners pour le calcul automatique
      dayForm.get('heuresNormales')?.valueChanges.subscribe(() => this.calculateTotal());
      dayForm.get('heuresSupplementaires')?.valueChanges.subscribe(() => this.calculateTotal());
      
      heuresJoursArray.push(dayForm);
    });
    
    this.tempsForm.setControl('heuresJours', heuresJoursArray);
  }

  populateForm(): void {
    if (!this.feuille) return;

    this.tempsForm.patchValue({
      mois: new Date(this.feuille.dateDebut).getMonth() + 1,
      annee: this.feuille.annee
    });

    const heuresJoursArray = this.fb.array<FormGroup>([]);
    
    this.daysInMonth.forEach(date => {
      const existingHeure = this.feuille!.heuresParJour.find((h: HeuresJour) => 
        new Date(h.date).toDateString() === date.toDateString()
      );
      
      const dayForm = new FormGroup({
        jour: new FormControl(this.getDayName(date)),
        date: new FormControl(date),
        heureDebut: new FormControl(existingHeure?.heureDebut || ''),
        heureFin: new FormControl(existingHeure?.heureFin || ''),
        pauseMinutes: new FormControl(existingHeure?.pauseMinutes || 0),
        totalHeures: new FormControl(existingHeure?.totalHeures || 0),
        heuresNormales: new FormControl(existingHeure?.heuresNormales || 0, [Validators.min(0), Validators.max(12)]),
        heuresSupplementaires: new FormControl(existingHeure?.heuresSupplementaires || 0, [Validators.min(0), Validators.max(8)]),
        projet: new FormControl(existingHeure?.projet || ''),
        tache: new FormControl(existingHeure?.tache || ''),
        commentaire: new FormControl(existingHeure?.commentaire || '')
      });
      
      dayForm.get('heuresNormales')?.valueChanges.subscribe(() => this.calculateTotal());
      dayForm.get('heuresSupplementaires')?.valueChanges.subscribe(() => this.calculateTotal());
      
      heuresJoursArray.push(dayForm);
    });
    
    this.tempsForm.setControl('heuresJours', heuresJoursArray);
    this.calculateTotal();
  }

  onPeriodChange(): void {
    this.generateDaysForMonth();
    this.initializeForm();
  }

  calculateTotal(): void {
    let total = 0;
    this.heuresJours.controls.forEach(control => {
      const heuresNormales = control.get('heuresNormales')?.value || 0;
      const heuresSupplementaires = control.get('heuresSupplementaires')?.value || 0;
      total += heuresNormales + heuresSupplementaires;
    });
    this.totalHeures = total;
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  }

  saveDraft(): void {
    if (this.tempsForm.valid) {
      const formData = this.prepareFormData();
      formData.statut = StatutFeuilleTemps.BROUILLON;
      
      if (this.isEditMode && this.feuille) {
        this.feuilleTempsService.mettreAJourFeuilleTemps(this.feuille.id, formData).subscribe({
          next: () => {
            this.snackBar.open('Brouillon sauvegardé avec succès', 'Fermer', { duration: 3000 });
            this.router.navigate(['/employe/temps']);
          },
          error: (error: any) => {
            this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
            console.error('Erreur:', error);
          }
        });
      } else {
        this.feuilleTempsService.creerFeuilleTemps(formData).subscribe({
          next: () => {
            this.snackBar.open('Brouillon créé avec succès', 'Fermer', { duration: 3000 });
            this.router.navigate(['/employe/temps']);
          },
          error: (error: any) => {
            this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
            console.error('Erreur:', error);
          }
        });
      }
    }
  }

  submitForValidation(): void {
    if (this.tempsForm.valid) {
      const formData = this.prepareFormData();
      formData.statut = StatutFeuilleTemps.SOUMISE;
      
      if (this.isEditMode && this.feuille) {
        this.feuilleTempsService.mettreAJourFeuilleTemps(this.feuille.id, formData).subscribe({
          next: () => {
            this.snackBar.open('Feuille de temps soumise pour validation', 'Fermer', { duration: 3000 });
            this.router.navigate(['/employe/temps']);
          },
          error: (error: any) => {
            this.snackBar.open('Erreur lors de la soumission', 'Fermer', { duration: 3000 });
            console.error('Erreur:', error);
          }
        });
      } else {
        this.feuilleTempsService.creerFeuilleTemps(formData).subscribe({
          next: (feuille) => {
            // Soumettre immédiatement après création
            this.feuilleTempsService.soumettreFeuilleTemps(feuille.id).subscribe({
              next: () => {
                this.snackBar.open('Feuille de temps soumise pour validation', 'Fermer', { duration: 3000 });
                this.router.navigate(['/employe/temps']);
              },
              error: (error: any) => {
                this.snackBar.open('Erreur lors de la soumission', 'Fermer', { duration: 3000 });
                console.error('Erreur:', error);
              }
            });
          },
          error: (error: any) => {
            this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
            console.error('Erreur:', error);
          }
        });
      }
    }
  }

  prepareFormData(): SaisieTemps {
    const formValue = this.tempsForm.value;
    
    const heuresJours: HeuresJour[] = formValue.heuresJours.map((jour: any) => ({
      jour: jour.jour,
      date: jour.date,
      heureDebut: jour.heureDebut,
      heureFin: jour.heureFin,
      pauseMinutes: jour.pauseMinutes,
      totalHeures: jour.totalHeures,
      heuresNormales: jour.heuresNormales,
      heuresSupplementaires: jour.heuresSupplementaires,
      projet: jour.projet,
      tache: jour.tache,
      commentaire: jour.commentaire
    }));

    return {
      mois: formValue.mois,
      annee: formValue.annee,
      heuresJours: heuresJours,
      commentaire: formValue.commentaire
    };
  }

  cancel(): void {
    this.router.navigate(['/employe/temps']);
  }

  canEdit(): boolean {
    return !this.feuille || this.feuille.statut === StatutFeuilleTemps.BROUILLON || this.feuille.statut === StatutFeuilleTemps.REFUSEE;
  }

  // Ajouter une méthode pour convertir le mois number en string pour l'affichage
  get selectedMonthLabel(): string {
    const monthNumber = this.tempsForm.get('mois')?.value;
    return this.availableMonths.find(m => parseInt(m.value) === monthNumber)?.label || '';
  }
}
