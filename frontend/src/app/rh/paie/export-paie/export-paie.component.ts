import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PaieService } from '../../services/paie.service';
import { ExportPaieRequest, FormatExport } from '../../models/export-paie.model';
import { EmployeService } from '../../services/employe.service';
import { Employe } from '../../models/employe.model';

@Component({
  selector: 'app-export-paie',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './export-paie.component.html',
  styleUrls: ['./export-paie.component.css']
})
export class ExportPaieComponent implements OnInit {
  exportForm: FormGroup;
  
  employes: Employe[] = [];
  departements: string[] = ['IT', 'RH', 'Finance', 'Marketing', 'Ventes'];
  
  formatsExport = [
    { value: 'excel', label: 'Excel (.xlsx)', icon: 'table_chart' },
    { value: 'csv', label: 'CSV (.csv)', icon: 'description' },
    { value: 'pdf', label: 'PDF (.pdf)', icon: 'picture_as_pdf' },
    { value: 'sage', label: 'Format Sage', icon: 'account_balance' },
    { value: 'cegid', label: 'Format Cegid', icon: 'business' }
  ];
  
  typesExport = [
    { value: 'bulletins', label: 'Bulletins de paie', description: 'Export des bulletins de paie individuels' },
    { value: 'journal', label: 'Journal de paie', description: 'Export du journal de paie mensuel' },
    { value: 'charges', label: 'Déclarations sociales', description: 'Export pour les déclarations URSSAF/MSA' },
    { value: 'comptable', label: 'Écritures comptables', description: 'Export des écritures pour la comptabilité' },
    { value: 'dads', label: 'DADS-U', description: 'Export pour la déclaration annuelle' }
  ];
  
  periodesDisponibles: string[] = [];
  
  isLoading = false;
  isExporting = false;
  
  exportHistory: any[] = [];

  constructor(
    private fb: FormBuilder,
    private paieService: PaieService,
    private employeService: EmployeService,
    private snackBar: MatSnackBar
  ) {
    this.exportForm = this.createExportForm();
  }

  ngOnInit(): void {
    this.loadEmployes();
    this.generatePeriodesDisponibles();
    this.loadExportHistory();
  }

  private createExportForm(): FormGroup {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    return this.fb.group({
      typeExport: ['bulletins', Validators.required],
      format: ['excel', Validators.required],
      periode: [`${currentYear}-${currentMonth.toString().padStart(2, '0')}`, Validators.required],
      employes: [[]],
      departement: [''],
      inclureArchives: [false],
      inclureVariables: [true],
      inclureCharges: [true],
      motDePasse: [''],
      commentaire: ['']
    });
  }

  private async loadEmployes(): Promise<void> {
    try {
      this.employes = await this.employeService.getEmployes().toPromise() || [];
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    }
  }

  private generatePeriodesDisponibles(): void {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    for (let year = currentYear - 2; year <= currentYear; year++) {
      for (let month = 1; month <= 12; month++) {
        this.periodesDisponibles.push(`${year}-${month.toString().padStart(2, '0')}`);
      }
    }
    
    this.periodesDisponibles.reverse();
  }

  private async loadExportHistory(): Promise<void> {
    try {
      this.exportHistory = await this.paieService.getExportHistory().toPromise() || [];
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  }

  onTypeExportChange(): void {
    const typeExport = this.exportForm.get('typeExport')?.value;
    
    // Ajuster les formats disponibles selon le type d'export
    if (typeExport === 'sage' || typeExport === 'cegid') {
      this.exportForm.patchValue({ format: typeExport });
    }
  }

  async lancerExport(): Promise<void> {
    if (!this.exportForm.valid) {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    this.isExporting = true;
    
    try {
      const exportData = this.exportForm.value;
      
      const blob = await this.paieService.exporterPaie(exportData).toPromise();
      
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const extension = this.getFileExtension(exportData.format);
        link.download = `export-paie-${exportData.periode}${extension}`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Export réalisé avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Recharger l'historique
        await this.loadExportHistory();
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      this.snackBar.open('Erreur lors de l\'export', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isExporting = false;
    }
  }

  private getFileExtension(format: string): string {
    switch (format) {
      case 'excel': return 'xlsx';
      case 'csv': return 'csv';
      case 'pdf': return 'pdf';
      case 'sage': return 'txt';
      case 'cegid': return 'txt';
      default: return 'txt';
    }
  }

  async previsualiser(): Promise<void> {
    if (!this.exportForm.valid) return;
    
    this.isLoading = true;
    
    try {
      const exportData = { ...this.exportForm.value, preview: true };
      const previewData = await this.paieService.previewExport(exportData).toPromise();
      
      // Afficher la prévisualisation dans un dialog
      console.log('Prévisualisation:', previewData);
      
    } catch (error) {
      console.error('Erreur lors de la prévisualisation:', error);
      this.snackBar.open('Erreur lors de la prévisualisation', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  resetForm(): void {
    this.exportForm.reset();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    this.exportForm.patchValue({
      typeExport: 'bulletins',
      format: 'excel',
      periode: `${currentYear}-${currentMonth.toString().padStart(2, '0')}`,
      employes: [],
      inclureVariables: true,
      inclureCharges: true
    });
  }

  async retelechargerExport(exportId: number): Promise<void> {
    try {
      const blob = await this.paieService.retelechargerExport(exportId).toPromise();
      
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `export-${exportId}.zip`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Téléchargement lancé', 'Fermer', { duration: 3000 });
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      this.snackBar.open('Erreur lors du téléchargement', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  getTypeExportLabel(type: string): string {
    const typeObj = this.typesExport.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  }

  getFormatLabel(format: string): string {
    const formatObj = this.formatsExport.find(f => f.value === format);
    return formatObj ? formatObj.label : format;
  }

  formatPeriode(periode: string): string {
    const [year, month] = periode.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  }

  getStatutExportClass(statut: string): string {
    switch (statut) {
      case 'termine': return 'success';
      case 'en_cours': return 'warning';
      case 'erreur': return 'error';
      default: return '';
    }
  }
}
