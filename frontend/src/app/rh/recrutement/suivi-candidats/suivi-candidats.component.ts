import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
// Ajouter les imports manquants
import { Candidature, StatutCandidature, Candidat, CandidatStats } from '../../models/candidature.model';

@Component({
  selector: 'app-suivi-candidats',
  standalone: true,
  imports: [
    CommonModule, // ✅ Ceci est correct et nécessaire pour *ngIf, *ngFor, etc.
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatTabsModule
  ],
  templateUrl: './suivi-candidats.component.html',
  styleUrls: ['./suivi-candidats.component.css']
})
export class SuiviCandidatsComponent implements OnInit {
  candidats: Candidat[] = [];
  filteredCandidats: Candidat[] = [];
  stats: CandidatStats = {
    total: 0,
    nouveaux: 0,
    enCours: 0,
    entretiens: 0,
    acceptes: 0,
    rejetes: 0,
    tauxConversion: 0,
    tempsTraitementMoyen: 0
  };

  // Formulaires - initialiser avec des valeurs par défaut
  filterForm!: FormGroup;
  candidatForm!: FormGroup;
  
  // Pagination et tri
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  sortField = 'datePostulation';
  sortDirection: 'asc' | 'desc' = 'desc';

  // États
  // Assurez-vous que ces propriétés sont bien définies :
  loading = false;
  showForm = false;
  editMode = false;
  selectedCandidat: Candidat | null = null;

  // Options
  statutOptions = [
    { value: 'nouveau', label: 'Nouveau' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'entretien', label: 'Entretien' },
    { value: 'accepte', label: 'Accepté' },
    { value: 'rejete', label: 'Rejeté' }
  ];

  sourceOptions = [
    'Site web',
    'LinkedIn',
    'Indeed',
    'Pôle Emploi',
    'Recommandation',
    'Candidature spontanée',
    'Autre'
  ];

  niveauLangueOptions = [
    'Débutant',
    'Intermédiaire',
    'Avancé',
    'Courant',
    'Natif'
  ];

  displayedColumns: string[] = [
    'nom', 
    'email', 
    'poste', 
    'statut', 
    'source', 
    'datePostulation', 
    'score', 
    'actions'
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadCandidats();
    this.calculateStats();
  }

  initForms(): void {
    this.filterForm = this.fb.group({
      search: [''],
      statut: [''],
      poste: [''],
      source: [''],
      dateDebut: [''],
      dateFin: [''],
      scoreMin: [''],
      scoreMax: ['']
    });

    this.candidatForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]+$/)]],
      poste: ['', Validators.required],
      statut: ['nouveau', Validators.required],
      source: ['', Validators.required],
      datePostulation: [new Date(), Validators.required],
      dateEntretien: [''],
      notes: [''],
      cv: [''],
      lettreMotivation: [''],
      score: ['', [Validators.min(0), Validators.max(100)]],
      experience: [0, [Validators.required, Validators.min(0)]],
      salaireSouhaite: ['', Validators.min(0)],
      disponibilite: ['', Validators.required],
      competences: [[]],
      formations: [[]],
      langues: [[]]
    });

    // Écouter les changements du formulaire de filtre
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadCandidats(): void {
    this.loading = true;
    // Simulation de données
    setTimeout(() => {
      this.candidats = this.generateMockCandidats();
      this.applyFilters();
      this.calculateStats();
      this.loading = false;
    }, 1000);
  }

  generateMockCandidats(): Candidat[] {
    const postes = ['Développeur Frontend', 'Développeur Backend', 'Chef de projet', 'Designer UX/UI', 'Data Analyst'];
    const sources = ['Site web', 'LinkedIn', 'Indeed', 'Pôle Emploi', 'Recommandation'];
    const statuts: ('nouveau' | 'en_cours' | 'entretien' | 'accepte' | 'rejete')[] = ['nouveau', 'en_cours', 'entretien', 'accepte', 'rejete'];
    const competences = ['JavaScript', 'Angular', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'MongoDB'];
    const formations = ['Master Informatique', 'Licence Informatique', 'BTS SIO', 'École d\'ingénieur', 'Formation autodidacte'];
    const langues = ['Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien'];

    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      nom: `Nom${i + 1}`,
      prenom: `Prénom${i + 1}`,
      email: `candidat${i + 1}@email.com`,
      telephone: `06${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      poste: postes[Math.floor(Math.random() * postes.length)],
      statut: statuts[Math.floor(Math.random() * statuts.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      datePostulation: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      dateEntretien: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
      notes: `Notes pour le candidat ${i + 1}`,
      cv: `cv_candidat_${i + 1}.pdf`,
      lettreMotivation: `lettre_candidat_${i + 1}.pdf`,
      score: Math.floor(Math.random() * 101),
      experience: Math.floor(Math.random() * 15),
      salaireSouhaite: Math.floor(Math.random() * 50000) + 25000,
      disponibilite: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
      competences: competences.slice(0, Math.floor(Math.random() * 4) + 2),
      formations: formations.slice(0, Math.floor(Math.random() * 2) + 1),
      langues: langues.slice(0, Math.floor(Math.random() * 3) + 1).map(langue => ({
        langue,
        niveau: this.niveauLangueOptions[Math.floor(Math.random() * this.niveauLangueOptions.length)]
      })),
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }));
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    this.filteredCandidats = this.candidats.filter(candidat => {
      const matchSearch = !filters.search || 
        candidat.nom.toLowerCase().includes(filters.search.toLowerCase()) ||
        candidat.prenom.toLowerCase().includes(filters.search.toLowerCase()) ||
        candidat.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        candidat.poste.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchStatut = !filters.statut || candidat.statut === filters.statut;
      const matchPoste = !filters.poste || candidat.poste.toLowerCase().includes(filters.poste.toLowerCase());
      const matchSource = !filters.source || candidat.source === filters.source;
      
      const matchDateDebut = !filters.dateDebut || candidat.datePostulation >= new Date(filters.dateDebut);
      const matchDateFin = !filters.dateFin || candidat.datePostulation <= new Date(filters.dateFin);
      
      const matchScoreMin = !filters.scoreMin || (candidat.score && candidat.score >= filters.scoreMin);
      const matchScoreMax = !filters.scoreMax || (candidat.score && candidat.score <= filters.scoreMax);

      return matchSearch && matchStatut && matchPoste && matchSource && 
             matchDateDebut && matchDateFin && matchScoreMin && matchScoreMax;
    });

    this.totalItems = this.filteredCandidats.length;
    this.sortData({ active: this.sortField, direction: this.sortDirection });
  }

  sortData(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc';

    this.filteredCandidats.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'nom': return this.compare(a.nom, b.nom, isAsc);
        case 'email': return this.compare(a.email, b.email, isAsc);
        case 'poste': return this.compare(a.poste, b.poste, isAsc);
        case 'statut': return this.compare(a.statut, b.statut, isAsc);
        case 'source': return this.compare(a.source, b.source, isAsc);
        case 'datePostulation': return this.compare(a.datePostulation, b.datePostulation, isAsc);
        case 'score': return this.compare(a.score || 0, b.score || 0, isAsc);
        default: return 0;
      }
    });
  }

  compare(a: any, b: any, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getPaginatedData(): Candidat[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredCandidats.slice(startIndex, startIndex + this.pageSize);
  }

  calculateStats(): void {
    this.stats.total = this.candidats.length;
    this.stats.nouveaux = this.candidats.filter(c => c.statut === 'nouveau').length;
    this.stats.enCours = this.candidats.filter(c => c.statut === 'en_cours').length;
    this.stats.entretiens = this.candidats.filter(c => c.statut === 'entretien').length;
    this.stats.acceptes = this.candidats.filter(c => c.statut === 'accepte').length;
    this.stats.rejetes = this.candidats.filter(c => c.statut === 'rejete').length;
    
    this.stats.tauxConversion = this.stats.total > 0 ? 
      Math.round((this.stats.acceptes / this.stats.total) * 100) : 0;
    
    // Calcul du temps de traitement moyen (simulation)
    this.stats.tempsTraitementMoyen = Math.round(Math.random() * 15 + 5);
  }

  openForm(candidat?: Candidat): void {
    this.editMode = !!candidat;
    this.selectedCandidat = candidat || null;
    
    if (candidat) {
      this.candidatForm.patchValue(candidat);
    } else {
      this.candidatForm.reset();
      this.candidatForm.patchValue({
        statut: 'nouveau',
        datePostulation: new Date(),
        experience: 0,
        competences: [],
        formations: [],
        langues: []
      });
    }
    
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editMode = false;
    this.selectedCandidat = null;
    this.candidatForm.reset();
  }

  onSubmit(): void {
    if (this.candidatForm.valid) {
      const formData = this.candidatForm.value;
      
      if (this.editMode && this.selectedCandidat) {
        // Mise à jour
        const index = this.candidats.findIndex(c => c.id === this.selectedCandidat!.id);
        if (index !== -1) {
          this.candidats[index] = {
            ...this.candidats[index],
            ...formData,
            updatedAt: new Date()
          };
        }
        this.showSnackBar('Candidat modifié avec succès');
      } else {
        // Création
        const newCandidat: Candidat = {
          id: Math.max(...this.candidats.map(c => c.id)) + 1,
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.candidats.unshift(newCandidat);
        this.showSnackBar('Candidat ajouté avec succès');
      }
      
      this.applyFilters();
      this.calculateStats();
      this.closeForm();
    }
  }

  deleteCandidat(candidat: Candidat): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le candidat ${candidat.prenom} ${candidat.nom} ?`)) {
      this.candidats = this.candidats.filter(c => c.id !== candidat.id);
      this.applyFilters();
      this.calculateStats();
      this.showSnackBar('Candidat supprimé avec succès');
    }
  }

  viewCandidat(candidat: Candidat): void {
    // Ouvrir une modal de détail ou naviguer vers une page de détail
    console.log('Voir candidat:', candidat);
  }

  updateStatut(candidat: Candidat, newStatut: string): void {
    const index = this.candidats.findIndex(c => c.id === candidat.id);
    if (index !== -1) {
      this.candidats[index].statut = newStatut as any;
      this.candidats[index].updatedAt = new Date();
      this.applyFilters();
      this.calculateStats();
      this.showSnackBar('Statut mis à jour avec succès');
    }
  }

  planifierEntretien(candidat: Candidat): void {
    // Ouvrir une modal pour planifier un entretien
    console.log('Planifier entretien pour:', candidat);
  }

  exportData(): void {
    // Logique d'export
    console.log('Export des données candidats');
    this.showSnackBar('Export en cours...');
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  getStatutLabel(statut: string | undefined): string {
    if (!statut) return 'Inconnu';
    const option = this.statutOptions.find(s => s.value === statut);
    return option ? option.label : 'Inconnu';
  }
  
  getStatutColor(statut: string | undefined): string {
    if (!statut) return '#9e9e9e';
    const colors: { [key: string]: string } = {
      'nouveau': '#2196f3',
      'en_cours': '#ff9800',
      'entretien': '#9c27b0',
      'accepte': '#4caf50',
      'rejete': '#f44336'
    };
    return colors[statut] || '#9e9e9e';
  }
  
  getStatutIcon(statut: string | undefined): string {
    if (!statut) return 'help';
    const icons: { [key: string]: string } = {
      'nouveau': 'fiber_new',
      'en_cours': 'hourglass_empty',
      'entretien': 'event',
      'accepte': 'check_circle',
      'rejete': 'cancel'
    };
    return icons[statut] || 'help';
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  // Getters pour contourner les erreurs *ngIf
  get isLoading(): boolean {
    return this.loading;
  }

  get isShowForm(): boolean {
    return this.showForm;
  }

  get isEditMode(): boolean {
    return this.editMode;
  }

  get hasFilteredCandidats(): boolean {
    return this.filteredCandidats && this.filteredCandidats.length > 0;
  }

  get hasNoData(): boolean {
    return this.filteredCandidats.length === 0 && !this.loading;
  }
}
