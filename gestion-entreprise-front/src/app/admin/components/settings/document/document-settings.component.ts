import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../services/admin.service';
import { SettingsService } from '../../../services/settings.service';
import { DocumentSettings } from '../../../models/admin.models';

@Component({
  selector: 'app-document-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './document-settings.component.html',
  styleUrls: ['./document-settings.component.css']
})
export class DocumentSettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  loading = false;
  saving = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  allowedFormats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'docx', label: 'Word (DOCX)' },
    { value: 'xlsx', label: 'Excel (XLSX)' },
    { value: 'jpg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
    { value: 'txt', label: 'Texte (TXT)' }
  ];

  retentionPeriods = [
    { value: 1, label: '1 an' },
    { value: 3, label: '3 ans' },
    { value: 5, label: '5 ans' },
    { value: 7, label: '7 ans' },
    { value: 10, label: '10 ans' },
    { value: -1, label: 'Permanent' }
  ];

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
      maxFileSize: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
      allowedFormats: [['pdf', 'docx', 'xlsx'], Validators.required],
      storageLocation: ['/documents', Validators.required],
      retentionPeriod: [5, Validators.required],
      autoBackup: [true],
      encryptionEnabled: [false],
      versionControl: [true],
      accessControlPublic: [false],
      accessControlRoles: [[]],
      accessControlDepartments: [[]],
      notificationOnUpload: [true],
      notificationOnDelete: [false],
      notificationOnExpiry: [true]
    });
  }

  private loadSettings(): void {
    this.loading = true;
    this.settingsService.getDocumentSettings().subscribe({
      next: (settings: DocumentSettings) => {
        this.settingsForm.patchValue({
          ...settings,
          accessControlPublic: settings.accessControl?.public || false,
          accessControlRoles: settings.accessControl?.roles || [],
          accessControlDepartments: settings.accessControl?.departments || [],
          notificationOnUpload: settings.notifications?.onUpload || true,
          notificationOnDelete: settings.notifications?.onDelete || false,
          notificationOnExpiry: settings.notifications?.onExpiry || true
        });
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
      const formValue = this.settingsForm.value;
      const settings: DocumentSettings = {
        ...formValue,
        accessControl: {
          public: formValue.accessControlPublic,
          roles: formValue.accessControlRoles,
          departments: formValue.accessControlDepartments
        },
        notifications: {
          onUpload: formValue.notificationOnUpload,
          onDelete: formValue.notificationOnDelete,
          onExpiry: formValue.notificationOnExpiry
        }
      };
      
      this.saving = true;
      this.settingsService.updateDocumentSettings(settings).subscribe({
        next: (response: DocumentSettings) => {
          this.snackBar.open('Paramètres de documents mis à jour', 'Fermer', { duration: 3000 });
          this.saving = false;
          this.showMessage('Paramètres mis à jour avec succès', 'success');
        },
        error: (error: any) => {
          console.error('Error updating document settings:', error);
          this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
          this.saving = false;
          this.showMessage('Erreur lors de la mise à jour', 'error');
        }
      });
    }
  }

  onCompressionToggle(): void {
    const compressionEnabled = this.settingsForm.get('compressionEnabled')?.value;
    if (compressionEnabled) {
      this.showMessage('Compression activée - Les fichiers seront compressés automatiquement', 'success');
    } else {
      this.showMessage('Compression désactivée', 'success');
    }
  }

  onVersioningToggle(): void {
    const versioningEnabled = this.settingsForm.get('versionControl')?.value;
    if (versioningEnabled) {
      this.showMessage('Contrôle de version activé', 'success');
    } else {
      this.showMessage('Contrôle de version désactivé', 'success');
    }
  }

  onNotificationToggle(): void {
    const notifications = {
      upload: this.settingsForm.get('notificationOnUpload')?.value,
      delete: this.settingsForm.get('notificationOnDelete')?.value,
      expiry: this.settingsForm.get('notificationOnExpiry')?.value
    };
    this.showMessage('Paramètres de notification mis à jour', 'success');
  }

  testStoragePath(): void {
    const storagePath = this.settingsForm.get('storageLocation')?.value;
    if (storagePath) {
      this.adminService.testStoragePath(storagePath).subscribe({
        next: (result: any) => {
          if (result.success) {
            this.showMessage('Chemin de stockage valide', 'success');
          } else {
            this.showMessage('Chemin de stockage invalide: ' + result.message, 'error');
          }
        },
        error: (error: any) => {
          console.error('Erreur lors du test du chemin:', error);
          this.showMessage('Erreur lors du test du chemin de stockage', 'error');
        }
      });
    }
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}
