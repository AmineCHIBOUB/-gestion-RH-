import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { CongeService } from '../../services/conge.service';

interface CongeData {
  id: number;
  employe: {
    id: number;
    nom: string;
    prenom: string;
    matricule: string;
    poste: string;
  };
  type_conge: string;
  date_debut: string;
  date_fin: string;
  nombre_jours: number;
  statut: string;
  motif?: string;
  created_at: string;
}

@Component({
  selector: 'app-validation-conges',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule
  ],
  templateUrl: './validation-conges.component.html',
  styleUrls: ['./validation-conges.component.css'],
  encapsulation: ViewEncapsulation.None // Add this temporarily
})
export class ValidationCongesComponent implements OnInit {
  allConges: CongeData[] = [];
  filteredConges: CongeData[] = [];
  loading = false;
  selectedDemandes: Set<number> = new Set();
  currentFilter = 0; // 0=all, 1=pending, 2=approved, 3=rejected
  
  // Statistics
  stats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  };

  constructor(
    private congeService: CongeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.chargerTousLesConges();
  }

  chargerTousLesConges(): void {
    this.loading = true;
    this.congeService.getDemandes().subscribe({
      next: (response: any) => {
        // Handle the response structure from backend
        this.allConges = response.conges || response.data || response || [];
        this.calculateStats();
        this.applyFilter(this.currentFilter);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement:', error);
        this.snackBar.open('Erreur lors du chargement des congés', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.allConges.length;
    this.stats.pending = this.allConges.filter(c => c.statut === 'en_attente').length;
    this.stats.approved = this.allConges.filter(c => c.statut === 'approuve').length;
    this.stats.rejected = this.allConges.filter(c => c.statut === 'refuse').length;
  }

  onFilterChange(event: any): void {
    this.currentFilter = event.index;
    this.applyFilter(this.currentFilter);
  }

  applyFilter(filterIndex: number): void {
    this.selectedDemandes.clear();
    
    switch (filterIndex) {
      case 1: // pending
        this.filteredConges = this.allConges.filter(c => c.statut === 'en_attente');
        break;
      case 2: // approved
        this.filteredConges = this.allConges.filter(c => c.statut === 'approuve');
        break;
      case 3: // rejected
        this.filteredConges = this.allConges.filter(c => c.statut === 'refuse');
        break;
      default: // all
        this.filteredConges = [...this.allConges];
    }
  }

  toggleSelection(demandeId: number): void {
    if (this.selectedDemandes.has(demandeId)) {
      this.selectedDemandes.delete(demandeId);
    } else {
      this.selectedDemandes.add(demandeId);
    }
  }

  selectAll(): void {
    if (this.selectedDemandes.size === this.filteredConges.length) {
      this.selectedDemandes.clear();
    } else {
      this.filteredConges.forEach(demande => {
        this.selectedDemandes.add(demande.id);
      });
    }
  }

  approuverDemande(id: number): void {
    this.congeService.approuverDemande(id, 'Demande approuvée').subscribe({
      next: () => {
        this.snackBar.open('Demande approuvée avec succès', 'Fermer', { duration: 3000 });
        this.chargerTousLesConges();
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'approbation:', error);
        this.snackBar.open('Erreur lors de l\'approbation', 'Fermer', { duration: 3000 });
      }
    });
  }

  refuserDemande(id: number): void {
    this.congeService.rejeterDemande(id, 'Demande refusée').subscribe({
      next: () => {
        this.snackBar.open('Demande refusée avec succès', 'Fermer', { duration: 3000 });
        this.chargerTousLesConges();
      },
      error: (error: any) => {
        console.error('Erreur lors du refus:', error);
        this.snackBar.open('Erreur lors du refus', 'Fermer', { duration: 3000 });
      }
    });
  }

  approuverSelections(): void {
    if (this.selectedDemandes.size === 0) {
      this.snackBar.open('Veuillez sélectionner au moins une demande', 'Fermer', { duration: 3000 });
      return;
    }

    const promises = Array.from(this.selectedDemandes).map(id => {
      return this.congeService.approuverDemande(id, 'Demande approuvée').toPromise();
    });

    Promise.all(promises).then(() => {
      this.snackBar.open('Demandes approuvées avec succès', 'Fermer', { duration: 3000 });
      this.selectedDemandes.clear();
      this.chargerTousLesConges();
    }).catch(error => {
      console.error('Erreur lors de l\'approbation:', error);
      this.snackBar.open('Erreur lors de l\'approbation', 'Fermer', { duration: 3000 });
    });
  }

  refuserSelections(): void {
    if (this.selectedDemandes.size === 0) {
      this.snackBar.open('Veuillez sélectionner au moins une demande', 'Fermer', { duration: 3000 });
      return;
    }

    const promises = Array.from(this.selectedDemandes).map(id => {
      return this.congeService.rejeterDemande(id, 'Demande refusée').toPromise();
    });

    Promise.all(promises).then(() => {
      this.snackBar.open('Demandes refusées avec succès', 'Fermer', { duration: 3000 });
      this.selectedDemandes.clear();
      this.chargerTousLesConges();
    }).catch(error => {
      console.error('Erreur lors du refus:', error);
      this.snackBar.open('Erreur lors du refus', 'Fermer', { duration: 3000 });
    });
  }

  calculerDuree(dateDebut: string, dateFin: string): number {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const diffTime = Math.abs(fin.getTime() - debut.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'conge_paye': '#4CAF50',
      'rtt': '#2196F3',
      'conge_maladie': '#FF9800',
      'conge_maternite': '#E91E63',
      'conge_paternite': '#9C27B0',
      'conge_sans_solde': '#607D8B'
    };
    return colors[type] || '#757575';
  }

  getTypeLabel(typeConge: string): string {
    const labels: { [key: string]: string } = {
      'conge_paye': 'Congés payés',
      'rtt': 'RTT',
      'conge_maladie': 'Congé maladie',
      'conge_maternite': 'Congé maternité',
      'conge_paternite': 'Congé paternité',
      'conge_sans_solde': 'Congé sans solde'
    };
    return labels[typeConge] || typeConge;
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'en_attente': 'En attente',
      'approuve': 'Approuvé',
      'refuse': 'Refusé'
    };
    return labels[statut] || statut;
  }

  getStatutColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'en_attente': '#FF9800',
      'approuve': '#4CAF50',
      'refuse': '#F44336'
    };
    return colors[statut] || '#757575';
  }
}
