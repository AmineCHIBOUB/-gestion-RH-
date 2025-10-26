import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { PaieService } from '../../services/paie.service';
import { EmployeService } from '../../services/employe.service';
// Corriger l'import pour utiliser paie.model.ts
import { ElementVariable, TypeElementVariable, StatutElementVariable } from '../../models/paie.model';
import { Employe } from '../../models/employe.model';

@Component({
  selector: 'app-elements-variables',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './elements-variables.component.html',
  styleUrls: ['./elements-variables.component.css']
})
export class ElementsVariablesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('elementDialog') elementDialog!: TemplateRef<any>;

  displayedColumns: string[] = ['employe', 'type', 'libelle', 'montant', 'periode', 'statut', 'actions'];
  dataSource = new MatTableDataSource<ElementVariable>();
  
  filtresForm: FormGroup;
  elementForm: FormGroup;
  
  employes: Employe[] = [];
  typesElements = [
    { value: 'prime', label: 'Prime' },
    { value: 'indemnite', label: 'Indemnité' },
    { value: 'avantage', label: 'Avantage en nature' },
    { value: 'retenue', label: 'Retenue' },
    { value: 'bonus', label: 'Bonus' }
  ];
  
  periodesDisponibles: string[] = [];
  
  isLoading = false;
  dialogMode: 'add' | 'edit' = 'add';
  selectedElement: ElementVariable | null = null;

  constructor(
    private fb: FormBuilder,
    private paieService: PaieService,
    private employeService: EmployeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.filtresForm = this.createFiltresForm();
    this.elementForm = this.createElementForm();
  }

  ngOnInit(): void {
    this.loadEmployes();
    this.generatePeriodesDisponibles();
    this.loadElements();
    this.setupFilters();
  }

  private createFiltresForm(): FormGroup {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    return this.fb.group({
      employe: [''],
      type: [''],
      periode: [`${currentYear}-${currentMonth.toString().padStart(2, '0')}`],
      statut: ['']
    });
  }

  private createElementForm(): FormGroup {
    return this.fb.group({
      employeId: ['', Validators.required],
      type: ['', Validators.required],
      libelle: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0)]],
      periode: ['', Validators.required],
      description: [''],
      recurrent: [false],
      imposable: [true]
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
    
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      for (let month = 1; month <= 12; month++) {
        this.periodesDisponibles.push(`${year}-${month.toString().padStart(2, '0')}`);
      }
    }
  }

  loadElements(): void {
    this.isLoading = true;
    // Corriger l'appel de méthode
    this.paieService.getElementsVariables(this.filtresForm.value).subscribe({
      next: (elements) => {
        this.dataSource.data = elements;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des éléments:', error);
        this.snackBar.open('Erreur lors du chargement des éléments', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private setupFilters(): void {
    this.filtresForm.valueChanges.subscribe(() => {
      this.loadElements();
    });
  }

  ajouterElement(): void {
    this.dialogMode = 'add';
    this.selectedElement = null;
    this.elementForm.reset();
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    this.elementForm.patchValue({
      periode: `${currentYear}-${currentMonth.toString().padStart(2, '0')}`,
      imposable: true
    });
    
    this.ouvrirDialog();
  }

  modifierElement(element: ElementVariable): void {
    this.dialogMode = 'edit';
    this.selectedElement = element;
    
    this.elementForm.patchValue({
      employeId: element.employeId,
      typeElement: element.typeElement,
      libelle: element.libelle,
      montant: element.montant,
      periode: element.periode,
      statut: element.statut
    });
    
    this.ouvrirDialog();
  }

  private ouvrirDialog(): void {
    const dialogRef = this.dialog.open(this.elementDialog, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sauvegarderElement();
      }
    });
  }

  async sauvegarderElement(): Promise<void> {
    if (!this.elementForm.valid) return;
    
    this.isLoading = true;
    
    try {
      const elementData = this.elementForm.value;
      
      if (this.dialogMode === 'add') {
        await this.paieService.creerElementVariable(elementData).toPromise();
        this.snackBar.open('Élément variable ajouté avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      } else if (this.selectedElement) {
        await this.paieService.modifierElementVariable(this.selectedElement.id, elementData).toPromise();
        this.snackBar.open('Élément variable modifié avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
      
      this.loadElements();
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  supprimerElement(element: ElementVariable): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      this.paieService.supprimerElementVariable(element.id).subscribe({
        next: () => {
          this.snackBar.open('Élément supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadElements();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  dupliquerElement(element: ElementVariable): void {
    const elementDuplique = {
      employeId: element.employeId,
      typeElement: element.typeElement,
      libelle: `${element.libelle} (copie)`,
      montant: element.montant,
      periode: element.periode
    };
    
    this.paieService.creerElementVariable(elementDuplique).subscribe({
      next: () => {
        this.snackBar.open('Élément dupliqué avec succès', 'Fermer', { duration: 3000 });
        this.loadElements();
      },
      error: (error) => {
        console.error('Erreur lors de la duplication:', error);
        this.snackBar.open('Erreur lors de la duplication', 'Fermer', { duration: 3000 });
      }
    });
  }

  resetFiltres(): void {
    this.filtresForm.reset();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    this.filtresForm.patchValue({
      periode: `${currentYear}-${currentMonth.toString().padStart(2, '0')}`
    });
  }

  exporterElements(): void {
    this.paieService.exporterElementsVariables(this.filtresForm.value).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `elements-variables-${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Export réalisé avec succès', 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        console.error('Erreur lors de l\'export:', error);
        this.snackBar.open('Erreur lors de l\'export', 'Fermer', { duration: 3000 });
      }
    });
  }

  getEmployeNom(employeId: number): string {
    const employe = this.employes.find(e => e.id === employeId);
    return employe ? `${employe.prenom} ${employe.nom}` : 'N/A';
  }

  getTypeLabel(type: string): string {
    const typeObj = this.typesElements.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'actif': return 'actif';
      case 'inactif': return 'inactif';
      case 'traite': return 'traite';
      default: return '';
    }
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  }

  formatPeriode(periode: string): string {
    const [year, month] = periode.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  }
}
