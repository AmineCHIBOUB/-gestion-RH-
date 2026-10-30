import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SettingsService } from '../../../services/settings.service';
import { AdminService } from '../../../services/admin.service';
import { GeneralSettings } from '../../../models/admin.models';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GeneralSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  saving = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {
    this.settingsForm = this.fb.group({
      companyName: ['', Validators.required],
      companyAddress: ['', Validators.required],
      companyPhone: ['', Validators.required],
      companyEmail: ['', [Validators.required, Validators.email]],
      timezone: ['Europe/Paris', Validators.required],
      dateFormat: ['DD/MM/YYYY', Validators.required],
      currency: ['EUR', Validators.required],
      language: ['fr', Validators.required],
      maintenanceMode: [false],
      allowRegistration: [true],
      sessionTimeout: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
      maxLoginAttempts: [5, [Validators.required, Validators.min(3), Validators.max(10)]],
      passwordMinLength: [8, [Validators.required, Validators.min(6), Validators.max(20)]],
      requirePasswordComplexity: [true],
      enableTwoFactor: [false],
      backupFrequency: ['daily', Validators.required],
      logRetentionDays: [90, [Validators.required, Validators.min(30), Validators.max(365)]]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.loading = true;
    this.settingsService.getGeneralSettings().subscribe({
      next: (settings: GeneralSettings) => {
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
    if (this.settingsForm.valid && !this.saving) {
      this.saving = true;
      this.settingsService.updateGeneralSettings(this.settingsForm.value).subscribe({
        next: () => {
          this.showMessage('Paramètres mis à jour avec succès', 'success');
          this.saving = false;
        },
        error: (error: any) => {
          console.error('Error updating general settings:', error);
          this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', {
            duration: 3000
          });
          this.showMessage('Erreur lors de la mise à jour', 'error');
          this.saving = false;
        }
      });
    }
  }

  resetToDefaults(): void {
    this.settingsService.resetToDefaults().subscribe({
      next: () => {
        this.loadSettings();
        this.showMessage('Paramètres restaurés aux valeurs par défaut', 'success');
      },
      error: (error: any) => {
        console.error('Erreur lors de la restauration:', error);
        this.showMessage('Erreur lors de la restauration', 'error');
      }
    });
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}
