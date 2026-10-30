import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { PaieService } from '../../services/paie.service';
import { CalculPaie, StatutCalcul } from '../../models/calcul-paie.model';
import { Employe } from '../../models/employe.model';

@Component({
  selector: 'app-gestion-paie',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
    MatMenuModule
  ],
  templateUrl: './gestion-paie.component.html',
  styleUrls: ['./gestion-paie.component.css']
})
export class GestionPaieComponent implements OnInit {
  elementsPaie: CalculPaie[] = [];
  filteredElements: CalculPaie[] = [];
  loading = false;
  
  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  
  // Filtres - correction du nom de la propriété
  filtres = {
    employe: '',
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear(),
    type: '',
    statut: '' as StatutCalcul | ''
  };
  
  // Propriétés pour le template
  colonnesAffichees: string[] = [
    'employe',
    'periode',
    'type',
    'montant',
    'statut',
    'actions'
  ];
  
  displayedColumns: string[] = [
    'employe',
    'periode',
    'salaireBrut',
    'cotisationsSalariales',
    'cotisationsPatronales',
    'salaireNet',
    'statut',
    'actions'
  ];
  
  statutOptions = Object.values(StatutCalcul);
  
  // Propriétés manquantes ajoutées
  statistiques = {
    totalPaies: 0,
    paiesValidees: 0,
    paiesEnAttente: 0,
    montantTotal: 0,
    nombreEmployes: 0
  };
  
  dataSource: any = { data: [] };
  chargement = false;
  termesRecherche = '';
  employes: Employe[] = [];
  
  mois = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];
  
  // Propriétés pour les options de filtres
  moisOptions = this.mois;
  anneesOptions: number[] = [];

  annees: number[] = [];

  constructor(
    private paieService: PaieService,
    private dialog: MatDialog
  ) {
    // Générer les années (5 dernières années + année courante + 2 prochaines)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      this.annees.push(i);
      this.anneesOptions.push(i);
    }
  }

  ngOnInit(): void {
    this.loadElementsPaie();
  }

  // Méthodes manquantes ajoutées
  calculerToutesLesPaies(): void {
    console.log('Calculer toutes les paies');
    // Implémentation à ajouter
  }

  exporterDonnees(): void {
    console.log('Exporter données');
    // Implémentation à ajouter
  }

  rechercherElements(): void {
    console.log('Rechercher éléments:', this.termesRecherche);
    // Implémentation à ajouter
  }
  
  // Méthode pour appliquer les filtres
  appliquerFiltres(): void {
    this.applyFilters();
  }
  
  // Méthode pour réinitialiser les filtres
  reinitialiserFiltres(): void {
    this.clearFilters();
  }
  
  // Méthodes pour les labels
  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'salaire_base': 'Salaire de base',
      'heures_sup': 'Heures supplémentaires',
      'prime': 'Prime',
      'deduction': 'Déduction'
    };
    return labels[type] || type;
  }
  
  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'brouillon': 'Brouillon',
      'calcule': 'Calculé',
      'valide': 'Validé',
      'paye': 'Payé'
    };
    return labels[statut] || statut;
  }
  
  // Méthodes d'actions
  modifierElement(element: any): void {
    console.log('Modifier élément:', element);
    // Implémentation à ajouter
  }
  
  dupliquerElement(element: any): void {
    console.log('Dupliquer élément:', element);
    // Implémentation à ajouter
  }
  
  supprimerElement(element: any): void {
    console.log('Supprimer élément:', element);
    // Implémentation à ajouter
  }

  loadElementsPaie(): void {
    this.loading = true;
    this.chargement = true;
    this.paieService.getCalculsPaie().subscribe({
      next: (response) => {
        // Correction : traiter la réponse comme un objet avec data et total
        this.elementsPaie = response.data;
        this.filteredElements = response.data;
        this.dataSource = response; // Garder la structure complète pour le template
        this.totalItems = response.total;
        this.loading = false;
        this.chargement = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des éléments de paie:', error);
        this.loading = false;
        this.chargement = false;
      }
    });
  }

  applyFilters(): void {
    // Implémentation des filtres
    this.loadElementsPaie();
  }

  clearFilters(): void {
    this.filtres = {
      employe: '',
      mois: new Date().getMonth() + 1,
      annee: new Date().getFullYear(),
      type: '',
      statut: '' as StatutCalcul | ''
    };
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadElementsPaie();
  }

  sortData(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      return;
    }
    // Implémentation du tri
  }

  private compare(a: any, b: any, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  calculerPaie(elementPaie: CalculPaie): void {
    this.loading = true;
    // Correction : utiliser recalculerPaie au lieu de calculerPaie
    this.paieService.recalculerPaie(elementPaie.id!).subscribe({
      next: (result) => {
        console.log('Paie calculée:', result);
        this.loadElementsPaie();
      },
      error: (error) => {
        console.error('Erreur lors du calcul de la paie:', error);
        this.loading = false;
      }
    });
  }

  validerPaie(elementPaie: CalculPaie): void {
    this.loading = true;
    this.paieService.validerCalculPaie(elementPaie.id!).subscribe({
      next: (result) => {
        console.log('Paie validée:', result);
        this.loadElementsPaie();
      },
      error: (error) => {
        console.error('Erreur lors de la validation de la paie:', error);
        this.loading = false;
      }
    });
  }

  genererBulletin(elementPaie: CalculPaie): void {
    // Implémentation de la génération de bulletin
  }

  exportPaies(): void {
    // Implémentation de l'export
  }
  
  getStatutColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'brouillon': 'warn',
      'calcule': 'accent',
      'valide': 'primary',
      'paye': 'primary'
    };
    return colors[statut] || 'basic';
  }

  getTotalPrimes(elementPaie: CalculPaie): number {
    return elementPaie.elements?.filter(e => e.type === 'prime').reduce((sum, e) => sum + e.montant, 0) || 0;
  }

  getTotalDeductions(elementPaie: CalculPaie): number {
    return elementPaie.elements?.filter(e => e.type === 'deduction').reduce((sum, e) => sum + e.montant, 0) || 0;
  }
}
