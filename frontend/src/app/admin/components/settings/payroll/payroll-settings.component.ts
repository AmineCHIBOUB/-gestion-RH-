import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../services/admin.service';
import { SettingsService } from '../../../services/settings.service';
import { PayrollSettings } from '../../../models/admin.models';

@Component({
  selector: 'app-payroll-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './payroll-settings.component.html',
  styleUrls: ['./payroll-settings.component.css']
})
export class PayrollSettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  loading = false;
  saving = false;
  showCalculator = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  calculatorData = {
    grossSalary: 0,
    overtimeHours: 0,
    transportBonus: 0,
    netSalary: 0,
    socialCharges: 0,
    incomeTax: 0
  };

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private initializeForm(): void {
    this.settingsForm = this.fb.group({
      // Calendrier
      payrollFrequency: ['monthly', Validators.required],
      payrollDay: [30, [Validators.required, Validators.min(1), Validators.max(31)]],
      vacationDaysPerYear: [25, [Validators.required, Validators.min(20), Validators.max(40)]],
      sickLeaveDaysPerYear: [90, [Validators.required, Validators.min(30), Validators.max(365)]],
      
      // Taux
      overtimeRate: [1.5, [Validators.required, Validators.min(1), Validators.max(3)]],
      weekendRate: [2, [Validators.required, Validators.min(1), Validators.max(3)]],
      holidayRate: [2.5, [Validators.required, Validators.min(1), Validators.max(4)]],
      maximumOvertimeHours: [48, [Validators.required, Validators.min(35), Validators.max(60)]],
      
      // Charges
      socialSecurityRate: [0.23, [Validators.required, Validators.min(0), Validators.max(1)]],
      incomeTaxRate: [0.14, [Validators.required, Validators.min(0), Validators.max(1)]],
      healthInsuranceRate: [0.08, [Validators.required, Validators.min(0), Validators.max(1)]],
      unemploymentInsuranceRate: [0.04, [Validators.required, Validators.min(0), Validators.max(1)]],
      
      // Avantages
      transportAllowance: [50, [Validators.required, Validators.min(0)]],
      mealAllowance: [9, [Validators.required, Validators.min(0)]],
      seniorityBonusRate: [0.02, [Validators.required, Validators.min(0), Validators.max(0.1)]],
      performanceBonusMaxRate: [0.15, [Validators.required, Validators.min(0), Validators.max(0.5)]]
    });
  }

  private loadSettings(): void {
    this.loading = true;
    this.settingsService.getPayrollSettings().subscribe({
      next: (settings: PayrollSettings) => {
        this.settingsForm.patchValue(settings);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des paramètres:', error);
        this.showMessage('Erreur lors du chargement des paramètres', 'error');
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      const settings = this.settingsForm.value;
      this.saving = true;
      this.settingsService.updatePayrollSettings(settings).subscribe({
        next: (response: PayrollSettings) => {
          this.snackBar.open('Paramètres de paie mis à jour', 'Fermer', { duration: 3000 });
          this.saving = false;
          this.showMessage('Paramètres mis à jour avec succès', 'success');
        },
        error: (error: any) => {
          console.error('Error updating payroll settings:', error);
          this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
          this.saving = false;
          this.showMessage('Erreur lors de la mise à jour', 'error');
        }
      });
    }
  }

  calculateNetSalary(): void {
    this.showCalculator = true;
    const formValues = this.settingsForm.value;
    const grossSalary = this.calculatorData.grossSalary;
    const overtimeHours = this.calculatorData.overtimeHours;
    
    // Calcul des heures supplémentaires
    const overtimePay = overtimeHours * (grossSalary / 160) * formValues.overtimeRate;
    
    // Calcul des charges sociales
    const socialCharges = (grossSalary + overtimePay) * formValues.socialSecurityRate;
    const healthInsurance = (grossSalary + overtimePay) * formValues.healthInsuranceRate;
    const unemploymentInsurance = (grossSalary + overtimePay) * formValues.unemploymentInsuranceRate;
    
    // Calcul de l'impôt sur le revenu
    const incomeTax = (grossSalary + overtimePay) * formValues.incomeTaxRate;
    
    // Calcul du salaire net
    const totalDeductions = socialCharges + healthInsurance + unemploymentInsurance + incomeTax;
    const netSalary = grossSalary + overtimePay + formValues.transportAllowance + formValues.mealAllowance - totalDeductions;
    
    // Mise à jour des données du calculateur
    this.calculatorData.socialCharges = socialCharges;
    this.calculatorData.incomeTax = incomeTax;
    this.calculatorData.netSalary = netSalary;
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}
