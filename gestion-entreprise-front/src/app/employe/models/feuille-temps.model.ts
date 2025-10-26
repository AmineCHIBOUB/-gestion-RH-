export interface FeuilleTemps {
  id: number;
  employeId: number;
  semaine: number;
  annee: number;
  dateDebut: Date;
  dateFin: Date;
  heuresParJour: HeuresJour[];
  totalHeures: number;
  heuresSupplementaires: number;
  statut: StatutFeuilleTemps;
  commentaire?: string;
  validePar?: string;
  dateValidation?: Date;
  dateCreation: Date;
  dateModification: Date;
}

export interface HeuresJour {
  jour: string;
  date: Date;
  heureDebut?: string;
  heureFin?: string;
  pauseMinutes?: number;
  totalHeures: number;
  heuresNormales?: number; // ✅ Propriété ajoutée
  heuresSupplementaires?: number; // ✅ Propriété ajoutée
  projet?: string;
  tache?: string;
  commentaire?: string;
}

export interface SaisieTemps {
  mois: number; // ✅ Changé de 'semaine' à 'mois'
  annee: number;
  heuresJours: HeuresJour[]; // ✅ Changé de 'heuresParJour' à 'heuresJours'
  commentaire?: string;
  statut?: StatutFeuilleTemps; // ✅ Propriété ajoutée
}

export enum StatutFeuilleTemps {
  BROUILLON = 'brouillon',
  SOUMISE = 'soumise',
  VALIDEE = 'validee',
  REFUSEE = 'refusee'
}

export interface TempsStats {
  heuresSemaine: number;
  heuresMois: number;
  heuresSupplementaires: number;
  moyenneHebdomadaire: number;
  // Ajouter les propriétés manquantes utilisées dans le template
  totalHeuresTravaillees: number;
  totalHeuresSupplementaires: number;
  feuillesValidees: number;
}
