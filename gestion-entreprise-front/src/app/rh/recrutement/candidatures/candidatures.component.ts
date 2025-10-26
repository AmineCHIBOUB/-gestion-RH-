import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Candidature, StatutCandidature } from '../../models/recrutement.model';

@Component({
  selector: 'app-candidatures',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './candidatures.component.html',
  styleUrls: ['./candidatures.component.css']
})
export class CandidaturesComponent implements OnInit {
  // Exposer Math pour l'utiliser dans le template
  Math = Math;

  // Filters
  filters = {
    status: '',
    position: '',
    source: '',
    dateFrom: '',
    dateTo: '',
    experience: ''
  };

  // Statistics
  statistics = {
    totalCandidatures: 0,
    newCandidatures: 0,
    inReview: 0,
    interviewed: 0,
    accepted: 0,
    rejected: 0,
    conversionRate: 0
  };

  // Data
  candidatures: Candidature[] = [];
  filteredData: any[] = [];
  paginatedData: any[] = [];
  positions: any[] = [];
  sources: any[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // Search and Sort
  searchTerm = '';
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Modal
  showModal = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';
  selectedCandidature: any = {};

  constructor() { }

  ngOnInit(): void {
    this.loadData();
    this.loadPositions();
    this.loadSources();
    this.calculateStatistics();
  }

  loadData(): void {
    // Simulation de données de candidatures
    this.candidatures = [
      {
        id: 1,
        offreId: 1,
        offre: {} as any, // Ajout requis par l'interface
        nom: 'Dupont',
        prenom: 'Jean',
        candidateName: 'Jean Dupont',
        email: 'jean.dupont@email.com',
        telephone: '0123456789',
        phone: '0123456789',
        position: 'Développeur Full Stack',
        source: 'Site Web',
        applicationDate: '2024-01-15',
        status: 'new',
        statut: 'Reçue' as any,
        experience: '3 ans',
        cvUrl: 'cv_jean_dupont.pdf',
        cv: 'cv_jean_dupont.pdf',
        lettreMotivationUrl: 'lettre_motivation.pdf',
        coverLetter: 'lettre_motivation.pdf',
        notes: 'Profil intéressant, expérience en Angular et Laravel',
        evaluations: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        offreId: 2,
        offre: {} as any,
        nom: 'Martin',
        prenom: 'Marie',
        candidateName: 'Marie Martin',
        email: 'marie.martin@email.com',
        telephone: '0987654321',
        phone: '0987654321',
        position: 'Chef de Projet Marketing',
        source: 'LinkedIn',
        applicationDate: '2024-01-10',
        status: 'in_review',
        statut: 'Présélectionnée' as any,
        experience: '5 ans',
        cvUrl: 'cv_marie_martin.pdf',
        cv: 'cv_marie_martin.pdf',
        lettreMotivationUrl: 'lettre_motivation.pdf',
        coverLetter: 'lettre_motivation.pdf',
        notes: 'Excellente expérience en gestion de projets digitaux',
        evaluations: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        offreId: 3,
        offre: {} as any,
        nom: 'Durand',
        prenom: 'Pierre',
        candidateName: 'Pierre Durand',
        email: 'pierre.durand@email.com',
        telephone: '0147258369',
        phone: '0147258369',
        position: 'Commercial Senior',
        source: 'Recommandation',
        applicationDate: '2024-01-08',
        status: 'interviewed',
        statut: 'Entretien' as any,
        experience: '7 ans',
        cvUrl: 'cv_pierre_durand.pdf',
        cv: 'cv_pierre_durand.pdf',
        lettreMotivationUrl: 'lettre_motivation.pdf',
        coverLetter: 'lettre_motivation.pdf',
        notes: 'Entretien très positif, bonnes références',
        evaluations: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredData = this.candidatures.filter(item => {
      const matchesStatus = !this.filters.status || item.status === this.filters.status;
      const matchesPosition = !this.filters.position || item.position === this.filters.position;
      const matchesSource = !this.filters.source || item.source === this.filters.source;
      const matchesDateFrom = !this.filters.dateFrom || (item.applicationDate && item.applicationDate >= this.filters.dateFrom);
      const matchesDateTo = !this.filters.dateTo || (item.applicationDate && item.applicationDate <= this.filters.dateTo);
      const matchesExperience = !this.filters.experience || (item.experience && item.experience.includes(this.filters.experience));

      return matchesStatus && matchesPosition && matchesSource && matchesDateFrom && matchesDateTo && matchesExperience;
    });

    this.calculateStatistics();
    this.updatePagination();
  }

  openModal(mode: 'add' | 'edit' | 'view', candidature?: any): void {
    this.modalMode = mode;
    this.selectedCandidature = candidature ? { ...candidature } : {
      id: 0,
      offreId: 1,
      offre: {} as any,
      nom: '',
      prenom: '',
      candidateName: '',
      email: '',
      telephone: '',
      phone: '',
      position: '',
      source: '',
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'new',
      statut: 'Reçue' as any,
      experience: '',
      cvUrl: '',
      cv: '',
      lettreMotivationUrl: '',
      coverLetter: '',
      notes: '',
      evaluations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.showModal = true;
  }

  loadPositions(): void {
    this.positions = [
      { id: 1, name: 'Développeur Full Stack' },
      { id: 2, name: 'Chef de Projet Marketing' },
      { id: 3, name: 'Commercial Senior' },
      { id: 4, name: 'Designer UX/UI' },
      { id: 5, name: 'Responsable RH' }
    ];
  }

  loadSources(): void {
    this.sources = [
      { id: 1, name: 'Site Web' },
      { id: 2, name: 'LinkedIn' },
      { id: 3, name: 'Indeed' },
      { id: 4, name: 'Recommandation' },
      { id: 5, name: 'Candidature Spontanée' }
    ];
  }

  resetFilters(): void {
    this.filters = {
      status: '',
      position: '',
      source: '',
      dateFrom: '',
      dateTo: '',
      experience: ''
    };
    this.applyFilters();
  }

  calculateStatistics(): void {
    const data = this.filteredData;
    this.statistics = {
      totalCandidatures: data.length,
      newCandidatures: data.filter(item => item.status === 'new').length,
      inReview: data.filter(item => item.status === 'in_review').length,
      interviewed: data.filter(item => item.status === 'interviewed').length,
      accepted: data.filter(item => item.status === 'accepted').length,
      rejected: data.filter(item => item.status === 'rejected').length,
      conversionRate: data.length > 0 ? (data.filter(item => item.status === 'accepted').length / data.length) * 100 : 0
    };
  }

  filterData(): void {
    if (this.searchTerm) {
      this.filteredData = this.candidatures.filter(item => {
        const candidateName = item.candidateName || `${item.prenom || ''} ${item.nom || ''}`.trim();
        const position = item.position || 'Non spécifié';
        const email = item.email || '';
        
        return candidateName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
               email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
               position.toLowerCase().includes(this.searchTerm.toLowerCase());
      });
    } else {
      this.applyFilters();
    }
    this.updatePagination();
  }

  sortData(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredData.sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPages = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCandidature = {};
  }

  saveCandidature(): void {
    if (this.modalMode === 'add') {
      this.selectedCandidature.id = this.candidatures.length + 1;
      this.candidatures.push({ ...this.selectedCandidature });
    } else if (this.modalMode === 'edit') {
      const index = this.candidatures.findIndex(item => item.id === this.selectedCandidature.id);
      if (index !== -1) {
        this.candidatures[index] = { ...this.selectedCandidature };
      }
    }
    this.applyFilters();
    this.closeModal();
  }

  deleteCandidature(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      this.candidatures = this.candidatures.filter(item => item.id !== id);
      this.applyFilters();
    }
  }

  updateStatus(candidature: any, newStatus: string): void {
    candidature.status = newStatus;
    this.saveCandidature();
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'new': 'Nouvelle',
      'in_review': 'En cours d\'examen',
      'interviewed': 'Entretien réalisé',
      'accepted': 'Acceptée',
      'rejected': 'Rejetée'
    };
    return labels[status] || status;
  }

  downloadCV(candidature: any): void {
    console.log('Téléchargement du CV:', candidature.cv || candidature.cvUrl);
    // Implémentation du téléchargement
    if (candidature.cv || candidature.cvUrl) {
      const url = candidature.cv || candidature.cvUrl;
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV_${candidature.nom || 'candidat'}.pdf`;
      link.click();
    }
  }

  downloadCoverLetter(candidature: any): void {
    console.log('Téléchargement de la lettre de motivation:', candidature.coverLetter || candidature.lettreMotivationUrl);
    // Implémentation du téléchargement
    if (candidature.coverLetter || candidature.lettreMotivationUrl) {
      const url = candidature.coverLetter || candidature.lettreMotivationUrl;
      const link = document.createElement('a');
      link.href = url;
      link.download = `Lettre_${candidature.nom || 'candidat'}.pdf`;
      link.click();
    }
  }

  exportData(): void {
    const csvContent = this.filteredData.map(item => {
      const candidateName = item.candidateName || `${item.prenom || ''} ${item.nom || ''}`.trim();
      const position = item.position || 'Non spécifié';
      return `${candidateName},${item.email || ''},${position},${item.status || item.statut || ''}`;
    }).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'candidatures.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
