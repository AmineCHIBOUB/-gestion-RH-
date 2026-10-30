export interface Annonce {
  id: number;
  titre: string;
  contenu: string;
  typeAnnonce: TypeAnnonce;
  priorite: PrioriteAnnonce;
  datePublication: Date;
  dateExpiration?: Date;
  publiePar: string;
  estPublique: boolean;
  departements?: string[];
  postes?: string[];
  fichierJoint?: string;
  lue: boolean;
  dateLecture?: Date;
  statut: 'active' | 'expiree' | 'archivee';
}

export enum TypeAnnonce {
  GENERALE = 'generale',
  URGENTE = 'urgente',
  EVENEMENT = 'evenement',
  FORMATION = 'formation',
  PROCEDURE = 'procedure',
  SOCIALE = 'sociale'
}

export enum PrioriteAnnonce {
  BASSE = 'basse',
  NORMALE = 'normale',
  HAUTE = 'haute',
  CRITIQUE = 'critique'
}

export interface AnnonceStats {
  total: number;
  nonLues: number;
  parType: { [key: string]: number };
  parPriorite: { [key: string]: number };
}
