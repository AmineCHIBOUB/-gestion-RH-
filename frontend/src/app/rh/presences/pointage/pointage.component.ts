import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PointageService, PointageData } from '../../services/pointage.service';
import { Employe } from '../../models/employe.model';

@Component({
  selector: 'app-pointage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatNativeDateModule
  ],
  templateUrl: './pointage.component.html',
  styleUrls: ['./pointage.component.css']
})
export class PointageComponent implements OnInit {
  selectedDate: Date = new Date();
  employees: Employe[] = [];
  pointageForm: FormGroup;
  loading = false;
  submitting = false;
  
  displayedColumns: string[] = ['employe', 'heure_entree', 'heure_sortie', 'pause_debut', 'pause_fin', 'statut'];

  constructor(
    private pointageService: PointageService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.pointageForm = this.fb.group({
      pointages: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Component initialization
  }

  get pointagesFormArray(): FormArray {
    return this.pointageForm.get('pointages') as FormArray;
  }

  onDateChange(): void {
    if (this.selectedDate) {
      this.chargerEmployes();
    }
  }

  chargerEmployes(): void {
    this.loading = true;
    
    this.pointageService.getAllEmployees().subscribe({
      next: (response) => {
        this.employees = response.data;
        this.initializeFormWithEmployees();
        this.loadExistingPointages();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des employés:', error);
        this.showErrorMessage('Erreur lors du chargement des employés');
        this.loading = false;
      }
    });
  }

  initializeFormWithEmployees(): void {
    const pointagesArray = this.fb.array<FormGroup>([]);
    
    this.employees.forEach(employee => {
      const pointageGroup = this.fb.group({
        employe_id: [employee.id],
        employe_nom: [employee.nom + ' ' + employee.prenom],
        date_pointage: [this.formatDate(this.selectedDate)],
        heure_entree: [''],
        heure_sortie: [''],
        pause_debut: [''],
        pause_fin: [''],
        statut: ['present']
      });
      pointagesArray.push(pointageGroup);
    });
    
    this.pointageForm.setControl('pointages', pointagesArray);
  }

  loadExistingPointages(): void {
    const dateStr = this.formatDate(this.selectedDate);
    
    this.pointageService.getPointagesByDate(dateStr).subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          this.populateExistingData(response.data);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des pointages existants:', error);
        this.loading = false;
      }
    });
  }

  populateExistingData(existingPointages: any[]): void {
    const pointagesArray = this.pointagesFormArray;
    
    existingPointages.forEach(pointage => {
      const index = pointagesArray.controls.findIndex(
        control => control.get('employe_id')?.value === pointage.employe_id
      );
      
      if (index !== -1) {
        const control = pointagesArray.at(index);
        control.patchValue({
          heure_entree: pointage.heure_entree || '',
          heure_sortie: pointage.heure_sortie || '',
          pause_debut: pointage.pause_debut || '',
          pause_fin: pointage.pause_fin || '',
          statut: pointage.statut || 'present'
        });
      }
    });
  }

  submitAllPointages(): void {
    if (this.pointageForm.invalid) {
      this.showErrorMessage('Veuillez vérifier les données saisies');
      return;
    }

    this.submitting = true;
    const pointagesData: PointageData[] = this.pointagesFormArray.value.map((pointage: any) => ({
      employe_id: pointage.employe_id,
      date_pointage: pointage.date_pointage,
      heure_entree: pointage.heure_entree || null,
      heure_sortie: pointage.heure_sortie || null,
      pause_debut: pointage.pause_debut || null,
      pause_fin: pointage.pause_fin || null,
      statut: pointage.statut
    }));

    const validPointages = pointagesData.filter(p => 
      p.heure_entree || p.heure_sortie || p.pause_debut || p.pause_fin || p.statut !== 'present'
    );

    if (validPointages.length === 0) {
      this.showErrorMessage('Aucune donnée à enregistrer');
      this.submitting = false;
      return;
    }

    // Use individual POST calls instead of bulk
    let completedRequests = 0;
    let successCount = 0;
    let errorCount = 0;

    validPointages.forEach((pointage, index) => {
      this.pointageService.submitPointage(pointage).subscribe({
        next: (response) => {
          successCount++;
          completedRequests++;
          
          // Check if all requests are completed
          if (completedRequests === validPointages.length) {
            this.handleAllRequestsCompleted(successCount, errorCount);
          }
        },
        error: (error) => {
          console.error(`Erreur lors de l'enregistrement du pointage ${index + 1}:`, error);
          errorCount++;
          completedRequests++;
          
          // Check if all requests are completed
          if (completedRequests === validPointages.length) {
            this.handleAllRequestsCompleted(successCount, errorCount);
          }
        }
      });
    });
  }

  private handleAllRequestsCompleted(successCount: number, errorCount: number): void {
    this.submitting = false;
    
    if (errorCount === 0) {
      this.showSuccessMessage(`${successCount} pointages enregistrés avec succès`);
    } else if (successCount > 0) {
      this.showSuccessMessage(`${successCount} pointages enregistrés avec succès, ${errorCount} erreurs`);
    } else {
      this.showErrorMessage('Erreur lors de l\'enregistrement des pointages');
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
