export interface DemandeConge {
  id: number;
  employeId: number;
  employe?: {
    id: number;
    nom: string;
    prenom: string;
    matricule: string;
    poste?: string; // Propriété ajoutée
  };
  typeConge: 'conge_paye' | 'conge_sans_solde' | 'conge_maladie' | 'conge_maternite' | 'conge_paternite' | 'rtt';
  dateDebut: Date;
  dateFin: Date;
  nombreJours: number;
  motif?: string;
  statut: StatutConge;
  commentaireValidation?: string;
  validateurId?: number;
  validateur?: {
    id: number;
    nom: string;
    prenom: string;
  };
  dateValidation?: Date;
  pieceJointe?: string;
  createdAt: Date;
  updatedAt: Date;
  // Propriétés ajoutées pour compatibilité template
  type?: string;
  dateDemande?: Date;
}

export type StatutConge = 'en_attente' | 'approuve' | 'refuse' | 'annule';

export interface DemandeCongeRequest {
  typeConge: 'conge_paye' | 'conge_sans_solde' | 'conge_maladie' | 'conge_maternite' | 'conge_paternite' | 'rtt';
  dateDebut: string;
  dateFin: string;
  motif?: string;
  pieceJointe?: File;
}

export interface DemandeCongeFilter {
  search?: string;
  employeId?: number;
  typeConge?: string;
  statut?: StatutConge;
  dateDebut?: string;
  dateFin?: string;
  validateurId?: number;
}

export interface ValidationCongeRequest {
  statut: StatutConge;
  commentaire?: string;
  dateValidation?: string;
}

export interface CongeFilter {
  search?: string;
  employeId?: number;
  typeConge?: string;
  statut?: StatutConge;
  dateDebut?: string;
  dateFin?: string;
  validateurId?: number;
}

export interface SoldeConge {
  employeId: number;
  annee: number;
  congesPayes: {
    acquis: number;
    pris: number;
    restant: number;
  };
  rtt: {
    acquis: number;
    pris: number;
    restant: number;
  };
  congesSanssolde: number;
  congeMaladie: number;
}


export enum TypeConge {
  CONGE_PAYE = 'conge_paye',
  RTT = 'rtt',
  CONGE_MALADIE = 'conge_maladie',
  CONGE_MATERNITE = 'conge_maternite',
  CONGE_PATERNITE = 'conge_paternite',
  CONGE_SANS_SOLDE = 'conge_sans_solde'
}

export const TYPE_CONGE_LABELS = {
  [TypeConge.CONGE_PAYE]: 'Congés payés',
  [TypeConge.RTT]: 'RTT',
  [TypeConge.CONGE_MALADIE]: 'Congé maladie',
  [TypeConge.CONGE_MATERNITE]: 'Congé maternité',
  [TypeConge.CONGE_PATERNITE]: 'Congé paternité',
  [TypeConge.CONGE_SANS_SOLDE]: 'Congé sans solde'
};
