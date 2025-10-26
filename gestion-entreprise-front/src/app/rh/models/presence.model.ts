import { Employe } from './employe.model';

export interface Presence {
  id: number;
  employeId: number;
  employe: Employe;
  date: Date;
  heureArrivee?: Date;
  heureDepart?: Date;
  pauseDebut?: Date;
  pauseFin?: Date;
  pauses?: PausePresence[];
  heuresTravaillees: number;
  heuresSupplementaires: number;
  statut: StatutPresence;
  commentaire?: string;
  validePar?: number;
  dateValidation?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PausePresence {
  id: number;
  debut?: Date;  // Rendre nullable
  fin?: Date;
  duree?: number;
  type: 'pause' | 'repas';
}

export interface FeuilleTemps {
  id: number;
  employeId: number;
  employe: Employe;
  dateDebut: Date;  // Ajouter cette propriété
  dateFin: Date;    // Ajouter cette propriété
  semaine: number;
  annee: number;
  presences: Presence[];
  totalHeures: number;
  heuresNormales?: number;        // Ajouter cette propriété
  heuresSupplementaires: number;
  statut: StatutFeuilleTemps;
  validePar?: number;
  dateValidation?: Date;
  dateCreation?: Date;  // Ajouter cette propriété
  commentaire?: string;
}

export interface AjustementPresence {
  id: number;
  presenceId: number;
  presence: Presence;
  employeId: number;
  employe: Employe;
  typeAjustement: 'correction_horaire' | 'ajout_presence' | 'suppression_presence' | 'modification_statut';
  ancienneValeur?: string;
  nouvelleValeur: string;
  motif: string;
  statut: 'en_attente' | 'approuve' | 'rejete';
  demandePar: number;
  dateDemande: Date;
  traitePar?: number;
  dateTraitement?: Date;
  commentaireTraitement?: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  total: number;
  errors?: ImportError[];
}

export interface ImportError {
  row: number;
  column: string;
  value: string;
  message: string;
}

export enum TypePointage {
  ENTREE = 'entree',
  SORTIE = 'sortie',
  PAUSE_DEBUT = 'pause_debut',
  PAUSE_FIN = 'pause_fin'
}

export type StatutPresence = 'Présent' | 'Absent' | 'Retard' | 'Congé' | 'Maladie' | 'Formation';
export type StatutFeuilleTemps = 'Brouillon' | 'Soumise' | 'Validée' | 'Refusée';

export interface PresenceRequest {
  employeId: number;
  date: string;
  heureArrivee?: string;
  heureDepart?: string;
  pauseDebut?: string;
  pauseFin?: string;
  statut: StatutPresence;
  commentaire?: string;
}

export interface PresenceFilter {
  employeId?: number;
  dateDebut?: Date | null | undefined;  // Accepter les trois types
  dateFin?: Date | null | undefined;    // Accepter les trois types
  statut?: StatutPresence | string;
  departement?: string;
}

export interface AjustementPresenceRequest {
  presenceId: number;
  typeAjustement: 'correction_horaire' | 'ajout_presence' | 'suppression_presence' | 'modification_statut';
  nouvelleValeur: string;
  motif: string;
}

export interface AjustementPresenceFilter {
  employeId?: number;
  dateDebut?: Date;
  dateFin?: Date;
  statut?: 'en_attente' | 'approuve' | 'rejete';
  typeAjustement?: string;
}

export interface StatistiquesPresence {
  totalPresences: number;
  totalAbsences: number;
  totalRetards: number;
  totalHeuresTravaillees: number;
  totalHeuresSupplementaires: number;
  tauxPresence: number;
  moyenneHeuresParJour: number;
  // Propriétés ajoutées pour corriger les erreurs de template
  totalEmployes: number;
  presentsAujourdhui: number;
  absentsAujourdhui: number;
  retardsAujourdhui: number;
}

export interface RapportPresence {
  employe: Employe;
  periode: {
    debut: Date;
    fin: Date;
  };
  presences: Presence[];
  statistiques: StatistiquesPresence;
  totalJoursOuvrables: number;
  joursPresents: number;
  joursAbsents: number;
  retards: number;
}
