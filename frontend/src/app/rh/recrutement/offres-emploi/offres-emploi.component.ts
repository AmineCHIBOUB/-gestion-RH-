import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { OffreEmploi, StatutOffre } from '../../models/recrutement.model';
import { TypeContrat } from '../../models/types.model';

export interface StatistiquesOffres {
  totalOffres: number;
  offresActives: number;
  offresInactives: number;
  offresPourvues: number;
  offresSuspendues: number;
  offresFermees: number; // Propriété ajoutée
  totalCandidatures: number;
  moyenneCandidaturesParOffre: number;
  tauxPourvoi: number;
  tempsRemplissageMoyen: number;
}

@Component({
  selector: 'app-offres-emploi',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './offres-emploi.component.html',
  styleUrls: ['./offres-emploi.component.css']
})
export class OffresEmploiComponent implements OnInit {
  offres: OffreEmploi[] = [];
  offresFiltered: OffreEmploi[] = [];
  
  stats: StatistiquesOffres = {
    totalOffres: 0,
    offresActives: 0,
    offresInactives: 0,
    offresPourvues: 0,
    offresSuspendues: 0,
    offresFermees: 0, // Propriété ajoutée
    totalCandidatures: 0,
    moyenneCandidaturesParOffre: 0,
    tauxPourvoi: 0,
    tempsRemplissageMoyen: 0
  };

  // Propriétés manquantes ajoutées
  offresFermees: OffreEmploi[] = [];
  searchForm: FormGroup;
  departements: string[] = [];
  typesContrat: string[] = [];
  statutsOffre: string[] = [];
  niveauxExperience: string[] = [];
  typesEmploi: string[] = [];
  pageIndex: number = 0;
  showForm: boolean = false;
  closeForm: () => void = () => { this.showForm = false; };
  changeStatut: (offre: OffreEmploi, nouveauStatut: string) => void = (offre, statut) => {
    offre.statut = statut as StatutOffre;
    this.calculerStatistiques();
  };
  niveauxEtude: string[] = ['Bac', 'Bac+2', 'Bac+3', 'Bac+5', 'Doctorat'];
  
  // Nouvelles propriétés pour corriger les erreurs restantes
  onPageChange: (event: any) => void = (event) => {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
  };
  
  initGraphiques: () => void = () => {
    this.createGraphiqueOffresParStatut();
    this.createGraphiqueOffresParDepartement();
    this.createGraphiqueEvolutionOffres();
    this.createGraphiqueCandidaturesParOffre();
  };
  
  updateGraphiques: () => void = () => {
    this.createGraphiqueOffresParStatut();
    this.createGraphiqueOffresParDepartement();
    this.createGraphiqueEvolutionOffres();
    this.createGraphiqueCandidaturesParOffre();
  };

  // Formulaire
  offreForm: FormGroup;
  isEditing = false;
  selectedOffre: OffreEmploi | null = null;

  // Filtres
  filtres = {
    recherche: '',
    departement: '',
    typeContrat: '',
    statut: '',
    dateDebut: null as Date | null,
    dateFin: null as Date | null
  };

  // Options
  departementsOptions = ['IT', 'RH', 'Finance', 'Marketing', 'Ventes', 'Production'];
  typeContratOptions = ['CDI', 'CDD', 'Stage', 'Freelance', 'Alternance'];
  statutOptions = ['Brouillon', 'Publiée', 'Suspendue', 'Fermée'];
  experienceOptions = ['Débutant', '1-3 ans', '3-5 ans', '5-10 ans', '10+ ans'];
  competencesOptions = ['JavaScript', 'Angular', 'React', 'Node.js', 'Python', 'Java', 'PHP', 'SQL', 'MongoDB', 'AWS'];

  // Tableau
  displayedColumns: string[] = ['titre', 'departement', 'typeContrat', 'statut', 'datePublication', 'dateLimite', 'actions'];
  pageSize = 10;
  currentPage = 0;
  totalItems = 0;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Graphiques
  chartOffresParStatut: Chart | undefined;
  chartOffresParDepartement: Chart | undefined;
  chartEvolutionOffres: Chart | undefined;
  chartCandidaturesParOffre: Chart | undefined;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.offreForm = this.createForm();
    this.searchForm = this.fb.group({
      recherche: [''],
      departement: [''],
      typeContrat: [''],
      statut: [''],
      dateDebut: [null],
      dateFin: [null]
    });
    
    // Initialiser les options
    this.departements = this.departementsOptions;
    this.typesContrat = this.typeContratOptions;
    this.statutsOffre = this.statutOptions;
    this.niveauxExperience = this.experienceOptions;
    this.typesEmploi = ['Temps plein', 'Temps partiel', 'Freelance', 'Stage'];
  }

  ngOnInit(): void {
    this.loadOffres();
    this.calculerStatistiques();
    this.initGraphiques();
  }

  createForm(): FormGroup {
    return this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      departement: ['', Validators.required],
      typeContrat: ['', Validators.required],
      salaire: [null, [Validators.min(0)]],
      experience: ['', Validators.required],
      competences: [[], Validators.required],
      statut: ['active', Validators.required],
      dateExpiration: [null, Validators.required],
      lieu: ['', Validators.required],
      tempsPlein: [true],
      responsableRH: ['', Validators.required]
    });
  }

  loadOffres(): void {
    // Simulation de données - à remplacer par un service
    this.offres = [
      {
        id: 1,
        titre: 'Développeur Full Stack',
        description: 'Développement d\'applications web avec Angular et Node.js',
        departement: 'IT',
        typeContrat: 'CDI' as TypeContrat,
        salaire: {
          min: 40000,
          max: 50000
        },
        experience: '3-5 ans',
        competences: ['Angular', 'Node.js', 'TypeScript'],
        statut: 'Publiée' as StatutOffre,
        datePublication: new Date('2024-01-15'),
        dateLimite: new Date('2024-03-15'),
        nombrePostes: 1,
        nombreCandidatures: 12, // Propriété ajoutée
        responsableRH: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        titre: 'Responsable Marketing',
        description: 'Gestion des campagnes marketing et communication',
        departement: 'Marketing',
        typeContrat: 'CDI' as TypeContrat,
        salaire: {
          min: 45000,
          max: 55000
        },
        experience: '5-10 ans',
        competences: ['Marketing Digital', 'SEO', 'Analytics'],
        statut: 'Fermée' as StatutOffre,
        datePublication: new Date('2024-01-10'),
        dateLimite: new Date('2024-02-10'),
        nombrePostes: 1,
        nombreCandidatures: 8, // Propriété ajoutée
        responsableRH: 2,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      }
    ];
    this.applyFilters();
  }

  calculerStatistiques(): void {
    this.stats.totalOffres = this.offres.length;
    this.stats.offresActives = this.offres.filter(o => o.statut === 'Publiée').length;
    this.stats.offresInactives = this.offres.filter(o => o.statut === 'Suspendue').length;
    this.stats.offresPourvues = this.offres.filter(o => o.statut === 'Fermée').length;
    this.stats.offresSuspendues = this.offres.filter(o => o.statut === 'Suspendue').length;
    this.stats.offresFermees = this.offres.filter(o => o.statut === 'Fermée').length; // Ligne ajoutée
    this.stats.totalCandidatures = this.offres.reduce((total, offre) => total + (offre.nombreCandidatures || 0), 0);
    this.stats.moyenneCandidaturesParOffre = this.stats.totalOffres > 0 ? 
      Math.round(this.stats.totalCandidatures / this.stats.totalOffres) : 0;
    this.stats.tauxPourvoi = this.stats.totalOffres > 0 ? 
      Math.round((this.stats.offresPourvues / this.stats.totalOffres) * 100) : 0;
    this.stats.tempsRemplissageMoyen = 30;
  }

  applyFilters(): void {
    this.offresFiltered = this.offres.filter(offre => {
      const matchRecherche = !this.filtres.recherche || 
        offre.titre.toLowerCase().includes(this.filtres.recherche.toLowerCase()) ||
        offre.description.toLowerCase().includes(this.filtres.recherche.toLowerCase());
      
      const matchDepartement = !this.filtres.departement || offre.departement === this.filtres.departement;
      const matchTypeContrat = !this.filtres.typeContrat || offre.typeContrat === this.filtres.typeContrat;
      const matchStatut = !this.filtres.statut || offre.statut === this.filtres.statut;
      
      const matchDateDebut = !this.filtres.dateDebut || offre.datePublication >= this.filtres.dateDebut;
      const matchDateFin = !this.filtres.dateFin || offre.datePublication <= this.filtres.dateFin;

      return matchRecherche && matchDepartement && matchTypeContrat && matchStatut && matchDateDebut && matchDateFin;
    });

    this.totalItems = this.offresFiltered.length;
    this.currentPage = 0;
  }

  clearFilters(): void {
    this.filtres = {
      recherche: '',
      departement: '',
      typeContrat: '',
      statut: '',
      dateDebut: null,
      dateFin: null
    };
    this.applyFilters();
  }

  onSubmit(): void {
    if (this.offreForm.valid) {
      const formData = this.offreForm.value;
      
      if (this.isEditing && this.selectedOffre) {
        // Mise à jour
        const index = this.offres.findIndex(o => o.id === this.selectedOffre!.id);
        if (index !== -1) {
          this.offres[index] = { ...this.offres[index], ...formData };
          this.snackBar.open('Offre mise à jour avec succès', 'Fermer', { duration: 3000 });
        }
      } else {
        // Création
        const newOffre: OffreEmploi = {
          id: Math.max(...this.offres.map(o => o.id), 0) + 1,
          ...formData,
          dateCreation: new Date(),
          nombreCandidatures: 0
        };
        this.offres.push(newOffre);
        this.snackBar.open('Offre créée avec succès', 'Fermer', { duration: 3000 });
      }
      
      this.resetForm();
      this.applyFilters();
      this.calculerStatistiques();
      this.updateGraphiques();
    }
  }

  editOffre(offre: OffreEmploi): void {
    this.selectedOffre = offre;
    this.isEditing = true;
    this.offreForm.patchValue(offre);
  }

  deleteOffre(offre: OffreEmploi): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      const index = this.offres.findIndex(o => o.id === offre.id);
      if (index !== -1) {
        this.offres.splice(index, 1);
        this.applyFilters();
        this.calculerStatistiques();
        this.updateGraphiques();
        this.snackBar.open('Offre supprimée avec succès', 'Fermer', { duration: 3000 });
      }
    }
  }

  duplicateOffre(offre: OffreEmploi): void {
    const newOffre: OffreEmploi = {
      ...offre,
      id: Math.max(...this.offres.map(o => o.id), 0) + 1,
      titre: `${offre.titre} (Copie)`,
      datePublication: new Date(),
      nombrePostes: 1,
      statut: 'Brouillon' as StatutOffre,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.offres.push(newOffre);
    this.applyFilters();
    this.calculerStatistiques();
    this.snackBar.open('Offre dupliquée avec succès', 'Fermer', { duration: 3000 });
  }

  toggleStatutOffre(offre: OffreEmploi): void {
    const index = this.offres.findIndex(o => o.id === offre.id);
    if (index !== -1) {
      this.offres[index].statut = this.offres[index].statut === 'Publiée' ? 'Suspendue' : 'Publiée';
      this.applyFilters();
      this.calculerStatistiques();
      this.updateGraphiques();
      this.snackBar.open('Statut mis à jour', 'Fermer', { duration: 2000 });
    }
  }

  resetForm(): void {
    this.offreForm.reset();
    this.offreForm.patchValue({
      statut: 'active',
      tempsPlein: true,
      competences: []
    });
    this.isEditing = false;
    this.selectedOffre = null;
  }

  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.offresFiltered.sort((a, b) => {
      const aValue = (a as any)[column];
      const bValue = (b as any)[column];
      
      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Méthodes manquantes ajoutées
  getPaginatedOffres(): OffreEmploi[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.offresFiltered.slice(startIndex, startIndex + this.pageSize);
  }

  onSort(event: any): void {
    this.sortColumn = event.active;
    this.sortDirection = event.direction;
    this.sortData(this.sortColumn);
  }

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'Publiée': return 'primary';
      case 'Brouillon': return 'warn';
      case 'Suspendue': return 'accent';
      case 'Fermée': return 'basic';
      default: return 'basic';
    }
  }

  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'Publiée': return 'visibility';
      case 'Brouillon': return 'edit';
      case 'Suspendue': return 'pause';
      case 'Fermée': return 'lock';
      default: return 'help';
    }
  }

  isOffreExpired(offre: OffreEmploi): boolean {
    if (!offre.dateLimite) return false;
    const today = new Date();
    const dateLimite = new Date(offre.dateLimite);
    return dateLimite < today;
  }

  openForm(offre?: OffreEmploi): void {
    if (offre) {
      this.isEditing = true;
      this.selectedOffre = offre;
      this.offreForm.patchValue({
        titre: offre.titre,
        description: offre.description,
        departement: offre.departement,
        typeContrat: offre.typeContrat,
        salaire: offre.salaire?.min || 0,
        experience: offre.experience, // Correction: 'experience' au lieu de 'experienceRequise'
        competences: offre.competences, // Correction: 'competences' au lieu de 'competencesRequises'
        dateLimite: offre.dateLimite,
        nombrePostes: offre.nombrePostes
        // Suppression de 'lieu' car cette propriété n'existe pas dans OffreEmploi
      });
    } else {
      this.isEditing = false;
      this.selectedOffre = null;
      this.resetForm();
    }
    this.showForm = true;
  }

  exportOffres(): void {
    // Logique d'export des offres
    this.snackBar.open('Export en cours...', 'Fermer', {
      duration: 2000
    });
  }

  // Méthodes de création de graphiques ajoutées
  createGraphiqueOffresParStatut(): void {
    const ctx = document.getElementById('chartOffresParStatut') as HTMLCanvasElement;
    if (ctx) {
      if (this.chartOffresParStatut) {
        this.chartOffresParStatut.destroy();
      }
      
      const data = {
        labels: ['Publiées', 'Brouillons', 'Suspendues', 'Fermées'],
        datasets: [{
          data: [
            this.stats.offresActives,
            this.offres.filter(o => o.statut === 'Brouillon').length,
            this.stats.offresSuspendues,
            this.stats.offresPourvues
          ],
          backgroundColor: ['#4CAF50', '#FF9800', '#F44336', '#9E9E9E']
        }]
      };
      
      this.chartOffresParStatut = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }

  createGraphiqueOffresParDepartement(): void {
    const ctx = document.getElementById('chartOffresParDepartement') as HTMLCanvasElement;
    if (ctx) {
      if (this.chartOffresParDepartement) {
        this.chartOffresParDepartement.destroy();
      }
      
      const departements = [...new Set(this.offres.map(o => o.departement))];
      const data = {
        labels: departements,
        datasets: [{
          label: 'Nombre d\'offres',
          data: departements.map(dept => 
            this.offres.filter(o => o.departement === dept).length
          ),
          backgroundColor: '#2196F3'
        }]
      };
      
      this.chartOffresParDepartement = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  createGraphiqueEvolutionOffres(): void {
    const ctx = document.getElementById('chartEvolutionOffres') as HTMLCanvasElement;
    if (ctx) {
      if (this.chartEvolutionOffres) {
        this.chartEvolutionOffres.destroy();
      }
      
      // Simulation de données d'évolution sur les 6 derniers mois
      const labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
      const data = {
        labels: labels,
        datasets: [{
          label: 'Offres publiées',
          data: [12, 19, 15, 25, 22, 18],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4
        }]
      };
      
      this.chartEvolutionOffres = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  createGraphiqueCandidaturesParOffre(): void {
    const ctx = document.getElementById('chartCandidaturesParOffre') as HTMLCanvasElement;
    if (ctx) {
      if (this.chartCandidaturesParOffre) {
        this.chartCandidaturesParOffre.destroy();
      }
      
      const offresAvecCandidatures = this.offres.filter(o => o.nombreCandidatures && o.nombreCandidatures > 0);
      const data = {
        labels: offresAvecCandidatures.map(o => o.titre.substring(0, 20) + '...'),
        datasets: [{
          label: 'Candidatures',
          data: offresAvecCandidatures.map(o => o.nombreCandidatures || 0),
          backgroundColor: '#FF9800'
        }]
      };
      
      this.chartCandidaturesParOffre = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
          responsive: true,
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.chartOffresParStatut) this.chartOffresParStatut.destroy();
    if (this.chartOffresParDepartement) this.chartOffresParDepartement.destroy();
    if (this.chartEvolutionOffres) this.chartEvolutionOffres.destroy();
    if (this.chartCandidaturesParOffre) this.chartCandidaturesParOffre.destroy();
  }
}
