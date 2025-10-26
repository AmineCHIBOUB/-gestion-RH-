export interface CongeEmploye {
  id: number;
  employeId: number;
  typeConge: TypeConge;
  dateDebut: Date;
  dateFin: Date;
  nbJours: number;
  motif?: string;
  statut: StatutConge;
  commentaireRh?: string;
  dateCreation: Date;
  dateValidation?: Date;
  validePar?: string;
}

export interface DemandeConge {
  typeConge: TypeConge;
  dateDebut: Date;
  dateFin: Date;
  motif?: string;
  commentaire?: string;
  employeId: number; // Changed from employe_id to employeId
}

// Updated enum to match backend validation rules
export enum TypeConge {
  CONGE_PAYE = 'conge_paye',
  CONGE_MALADIE = 'conge_maladie', 
  CONGE_MATERNITE = 'conge_maternite',
  CONGE_PATERNITE = 'conge_paternite',
  CONGE_SANS_SOLDE = 'conge_sans_solde',
  RTT = 'rtt',
  FORMATION = 'formation'
}

export enum StatutConge {
  EN_ATTENTE = 'en_attente',
  APPROUVE = 'approuve',
  REFUSE = 'refuse',
  ANNULE = 'annule'
}

export interface SoldeCongeDetail {
  total: number;
  utilise: number;
  restant: number;
}

export interface SoldeConges {
  congesPayes: SoldeCongeDetail;
  rtt: SoldeCongeDetail;
  maladie: SoldeCongeDetail;
  formation: SoldeCongeDetail;
}
