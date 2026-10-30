import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';

export interface FichePaie {
  id: number;
  employeId: number;
  employeNom: string;
  employePrenom: string;
  employeMatricule: string;
  departement: string;
  poste: string;
  periode: string;
  dateGeneration: Date;
  salaireBrut: number;
  cotisationsSalariales: number;
  cotisationsPatronales: number;
  salaireNet: number;
  heuresNormales: number;
  heuresSupplementaires: number;
  primes: number;
  avantages: number;
  retenues: number;
  congesPayes: number;
  statut: 'brouillon' | 'validee' | 'envoyee' | 'archivee';
  commentaires?: string;
}

export interface Employe {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  departement: string;
  poste: string;
  salaireBrut: number;
  dateEmbauche: Date;
  statut: string;
}

export interface StatistiquesPaie {
  totalFiches: number;
  fichesValidees: number;
  fichesBrouillon: number;
  fichesEnvoyees: number;
  masseSalarialeTotale: number;
  moyenneSalaire: number;
  totalCotisations: number;
  evolutionMensuelle: number;
}

@Component({
  selector: 'app-fiche-paie',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, // Ajout de FormsModule pour ngModel
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
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatCheckboxModule,
    MatTabsModule
  ],
  templateUrl: './fiche-paie.component.html',
  styleUrls: ['./fiche-paie.component.css']
})
export class FichePaieComponent implements OnInit {
  fichesPaie: FichePaie[] = [];
  employes: Employe[] = [];
  statistiques: StatistiquesPaie = {
    totalFiches: 0,
    fichesValidees: 0,
    fichesBrouillon: 0,
    fichesEnvoyees: 0,
    masseSalarialeTotale: 0,
    moyenneSalaire: 0,
    totalCotisations: 0,
    evolutionMensuelle: 0
  };

  ficheForm!: FormGroup;
  isLoading = false;
  isEditing = false;
  selectedFiche: FichePaie | null = null;
  showForm = false;

  // Filtres
  filtres = {
    recherche: '',
    departement: '',
    statut: '',
    periode: '',
    dateDebut: '',
    dateFin: ''
  };

  // Pagination
  pageSize = 10;
  currentPage = 1;
  totalItems = 0;

  // Colonnes du tableau
  displayedColumns: string[] = [
    'employe',
    'periode',
    'salaireBrut',
    'salaireNet',
    'statut',
    'dateGeneration',
    'actions'
  ];

  // Options de tri
  sortColumn = 'dateGeneration';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Listes pour les filtres
  departements = ['IT', 'RH', 'Finance', 'Marketing', 'Ventes', 'Production'];
  statuts = ['brouillon', 'validee', 'envoyee', 'archivee'];
  periodes = [
    'Janvier 2024', 'Février 2024', 'Mars 2024', 'Avril 2024',
    'Mai 2024', 'Juin 2024', 'Juillet 2024', 'Août 2024',
    'Septembre 2024', 'Octobre 2024', 'Novembre 2024', 'Décembre 2024'
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.ficheForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadData();
    this.loadEmployes();
    this.calculateStatistiques();
  }

  createForm(): FormGroup {
    return this.fb.group({
      employeId: ['', Validators.required],
      periode: ['', Validators.required],
      salaireBrut: ['', [Validators.required, Validators.min(0)]],
      heuresNormales: ['', [Validators.required, Validators.min(0)]],
      heuresSupplementaires: [0, Validators.min(0)],
      primes: [0, Validators.min(0)],
      avantages: [0, Validators.min(0)],
      retenues: [0, Validators.min(0)],
      congesPayes: [0, Validators.min(0)],
      commentaires: ['']
    });
  }

  loadData(): void {
    this.isLoading = true;
    // Simulation de données
    setTimeout(() => {
      this.fichesPaie = this.generateMockData();
      this.totalItems = this.fichesPaie.length;
      this.isLoading = false;
    }, 1000);
  }

  loadEmployes(): void {
    // Simulation de données employés
    this.employes = [
      { id: 1, nom: 'Dupont', prenom: 'Jean', matricule: 'EMP001', departement: 'IT', poste: 'Développeur', salaireBrut: 3500, dateEmbauche: new Date('2020-01-15'), statut: 'Actif' },
      { id: 2, nom: 'Martin', prenom: 'Marie', matricule: 'EMP002', departement: 'RH', poste: 'Responsable RH', salaireBrut: 4200, dateEmbauche: new Date('2019-03-10'), statut: 'Actif' },
      { id: 3, nom: 'Bernard', prenom: 'Pierre', matricule: 'EMP003', departement: 'Finance', poste: 'Comptable', salaireBrut: 3200, dateEmbauche: new Date('2021-06-20'), statut: 'Actif' },
      { id: 4, nom: 'Dubois', prenom: 'Sophie', matricule: 'EMP004', departement: 'Marketing', poste: 'Chef de projet', salaireBrut: 3800, dateEmbauche: new Date('2020-09-05'), statut: 'Actif' },
      { id: 5, nom: 'Moreau', prenom: 'Luc', matricule: 'EMP005', departement: 'Ventes', poste: 'Commercial', salaireBrut: 3000, dateEmbauche: new Date('2022-02-14'), statut: 'Actif' }
    ];
  }

  generateMockData(): FichePaie[] {
    const fiches: FichePaie[] = [];
    const statuts: ('brouillon' | 'validee' | 'envoyee' | 'archivee')[] = ['brouillon', 'validee', 'envoyee', 'archivee'];
    
    for (let i = 1; i <= 50; i++) {
      const employe = this.employes[Math.floor(Math.random() * this.employes.length)];
      const salaireBrut = employe.salaireBrut + Math.random() * 500;
      const cotisationsSalariales = salaireBrut * 0.22;
      const cotisationsPatronales = salaireBrut * 0.42;
      const salaireNet = salaireBrut - cotisationsSalariales;
      
      fiches.push({
        id: i,
        employeId: employe.id,
        employeNom: employe.nom,
        employePrenom: employe.prenom,
        employeMatricule: employe.matricule,
        departement: employe.departement,
        poste: employe.poste,
        periode: this.periodes[Math.floor(Math.random() * this.periodes.length)],
        dateGeneration: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        salaireBrut: Math.round(salaireBrut),
        cotisationsSalariales: Math.round(cotisationsSalariales),
        cotisationsPatronales: Math.round(cotisationsPatronales),
        salaireNet: Math.round(salaireNet),
        heuresNormales: 151.67,
        heuresSupplementaires: Math.floor(Math.random() * 20),
        primes: Math.floor(Math.random() * 500),
        avantages: Math.floor(Math.random() * 200),
        retenues: Math.floor(Math.random() * 100),
        congesPayes: Math.floor(Math.random() * 300),
        statut: statuts[Math.floor(Math.random() * statuts.length)],
        commentaires: Math.random() > 0.7 ? 'Commentaire exemple' : undefined
      });
    }
    
    return fiches;
  }

  calculateStatistiques(): void {
    this.statistiques = {
      totalFiches: this.fichesPaie.length,
      fichesValidees: this.fichesPaie.filter(f => f.statut === 'validee').length,
      fichesBrouillon: this.fichesPaie.filter(f => f.statut === 'brouillon').length,
      fichesEnvoyees: this.fichesPaie.filter(f => f.statut === 'envoyee').length,
      masseSalarialeTotale: this.fichesPaie.reduce((sum, f) => sum + f.salaireBrut, 0),
      moyenneSalaire: this.fichesPaie.length > 0 ? this.fichesPaie.reduce((sum, f) => sum + f.salaireNet, 0) / this.fichesPaie.length : 0,
      totalCotisations: this.fichesPaie.reduce((sum, f) => sum + f.cotisationsSalariales + f.cotisationsPatronales, 0),
      evolutionMensuelle: Math.random() * 10 - 5 // Simulation
    };
  }

  // Gestion du formulaire
  openForm(fiche?: FichePaie): void {
    this.isEditing = !!fiche;
    this.selectedFiche = fiche || null;
    this.showForm = true;
    
    if (fiche) {
      this.ficheForm.patchValue({
        employeId: fiche.employeId,
        periode: fiche.periode,
        salaireBrut: fiche.salaireBrut,
        heuresNormales: fiche.heuresNormales,
        heuresSupplementaires: fiche.heuresSupplementaires,
        primes: fiche.primes,
        avantages: fiche.avantages,
        retenues: fiche.retenues,
        congesPayes: fiche.congesPayes,
        commentaires: fiche.commentaires
      });
    } else {
      this.ficheForm.reset();
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedFiche = null;
    this.ficheForm.reset();
  }

  onSubmit(): void {
    if (this.ficheForm.valid) {
      const formData = this.ficheForm.value;
      const employe = this.employes.find(e => e.id === formData.employeId);
      
      if (!employe) return;
      
      const cotisationsSalariales = formData.salaireBrut * 0.22;
      const cotisationsPatronales = formData.salaireBrut * 0.42;
      const salaireNet = formData.salaireBrut - cotisationsSalariales;
      
      const ficheData: FichePaie = {
        id: this.isEditing ? this.selectedFiche!.id : this.fichesPaie.length + 1,
        employeId: formData.employeId,
        employeNom: employe.nom,
        employePrenom: employe.prenom,
        employeMatricule: employe.matricule,
        departement: employe.departement,
        poste: employe.poste,
        periode: formData.periode,
        dateGeneration: new Date(),
        salaireBrut: formData.salaireBrut,
        cotisationsSalariales: Math.round(cotisationsSalariales),
        cotisationsPatronales: Math.round(cotisationsPatronales),
        salaireNet: Math.round(salaireNet),
        heuresNormales: formData.heuresNormales,
        heuresSupplementaires: formData.heuresSupplementaires,
        primes: formData.primes,
        avantages: formData.avantages,
        retenues: formData.retenues,
        congesPayes: formData.congesPayes,
        statut: 'brouillon',
        commentaires: formData.commentaires
      };
      
      if (this.isEditing) {
        const index = this.fichesPaie.findIndex(f => f.id === this.selectedFiche!.id);
        this.fichesPaie[index] = { ...ficheData, statut: this.selectedFiche!.statut };
        this.showSnackBar('Fiche de paie modifiée avec succès');
      } else {
        this.fichesPaie.unshift(ficheData);
        this.showSnackBar('Fiche de paie créée avec succès');
      }
      
      this.calculateStatistiques();
      this.closeForm();
    }
  }

  // Actions sur les fiches
  changerStatut(fiche: FichePaie, nouveauStatut: 'brouillon' | 'validee' | 'envoyee' | 'archivee'): void {
    fiche.statut = nouveauStatut;
    this.calculateStatistiques();
    this.showSnackBar(`Statut changé vers "${nouveauStatut}"`);
  }

  dupliquerFiche(fiche: FichePaie): void {
    const nouvelleFiche: FichePaie = {
      ...fiche,
      id: this.fichesPaie.length + 1,
      dateGeneration: new Date(),
      statut: 'brouillon'
    };
    this.fichesPaie.unshift(nouvelleFiche);
    this.calculateStatistiques();
    this.showSnackBar('Fiche dupliquée avec succès');
  }

  supprimerFiche(fiche: FichePaie): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette fiche de paie ?')) {
      this.fichesPaie = this.fichesPaie.filter(f => f.id !== fiche.id);
      this.calculateStatistiques();
      this.showSnackBar('Fiche supprimée avec succès');
    }
  }

  genererBulletin(fiche: FichePaie): void {
    // Simulation de génération de bulletin
    this.showSnackBar('Bulletin de paie généré avec succès');
  }

  envoyerFiche(fiche: FichePaie): void {
    fiche.statut = 'envoyee';
    this.calculateStatistiques();
    this.showSnackBar('Fiche envoyée à l\'employé');
  }

  // Filtres et tri
  appliquerFiltres(): void {
    // Logique de filtrage
    this.currentPage = 1;
  }

  effacerFiltres(): void {
    this.filtres = {
      recherche: '',
      departement: '',
      statut: '',
      periode: '',
      dateDebut: '',
      dateFin: ''
    };
    this.appliquerFiltres();
  }

  trier(colonne: string): void {
    if (this.sortColumn === colonne) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = colonne;
      this.sortDirection = 'asc';
    }
  }

  // Export
  exporterDonnees(): void {
    this.showSnackBar('Export en cours...');
    // Logique d'export
  }

  // Pagination
  changerPage(page: number): void {
    this.currentPage = page;
  }

  // Utilitaires
  getStatutColor(statut: string): string {
    const colors = {
      'brouillon': '#ff9800',
      'validee': '#4caf50',
      'envoyee': '#2196f3',
      'archivee': '#9e9e9e'
    };
    return colors[statut as keyof typeof colors] || '#9e9e9e';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}