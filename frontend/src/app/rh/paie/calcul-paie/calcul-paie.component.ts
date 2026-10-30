import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { EmployeService } from '../../services/employe.service';
import { PaieService } from '../../services/paie.service';
import { Employe } from '../../models/employe.model';

@Component({
  selector: 'app-calcul-paie',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './calcul-paie.component.html',
  styleUrls: ['./calcul-paie.component.css']
})
export class CalculPaieComponent implements OnInit {
  calculForm: FormGroup;
  employes: Employe[] = [];
  resultatCalcul: any = null;

  constructor(
    private fb: FormBuilder,
    private employeService: EmployeService,
    private paieService: PaieService
  ) {
    this.calculForm = this.fb.group({
      employeId: ['', Validators.required],
      periode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.chargerEmployes();
  }

  chargerEmployes(): void {
    this.employeService.getEmployes().subscribe({
      next: (employes) => {
        this.employes = employes;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des employés:', error);
      }
    });
  }

  calculerPaie(): void {
    if (this.calculForm.valid) {
      const formData = this.calculForm.value;
      // Correction : passer un seul objet avec les données
      this.paieService.calculerPaie({
        employeId: formData.employeId,
        periode: formData.periode
      }).subscribe({
        next: (resultat) => {
          this.resultatCalcul = resultat;
        },
        error: (error) => {
          console.error('Erreur lors du calcul de paie:', error);
        }
      });
    }
  }
}
