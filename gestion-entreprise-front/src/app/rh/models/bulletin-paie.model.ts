import { Employe } from './employe.model';
import { ElementCalculPaie } from './calcul-paie.model';

export interface BulletinPaie {
  id: number;
  numero: string;
  employeId: number;
  employe: Employe;
  periode: string;
  annee: number;
  mois: number;
  dateEdition: Date;
  salaireBrut: number;
  cotisationsSalariales: number;
  cotisationsPatronales: number;
  contributionsSociales: number;
  impotSource: number;
  salaireNet: number;
  coutTotal: number;
  elements: ElementCalculPaie[];
  heuresTravaillees: number;
  heuresSupplementaires: number;
  tauxHoraire: number;
  joursConges: number;
  joursAbsence: number;
  congesRestants: number;
  anciennete: string;
  statut: StatutBulletin;
  fichierPdf?: string;
  envoye: boolean;
  dateEnvoi?: Date;
  accuse: boolean;
  dateAccuse?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum StatutBulletin {
  BROUILLON = 'brouillon',
  GENERE = 'genere',
  ENVOYE = 'envoye',
  ACCUSE = 'accuse'
}

export interface BulletinPaieRequest {
  employeId: number;
  periode: string;
  annee: number;
  mois: number;
  genererPdf?: boolean;
  envoyerEmail?: boolean;
}

export interface BulletinPaieFilter {
  employeId?: number;
  annee?: number;
  mois?: number;
  statut?: StatutBulletin;
  dateDebutEdition?: string;
  dateFinEdition?: string;
}

export interface StatistiquesBulletins {
  totalBulletins: number;
  bulletinsGeneres: number;
  bulletinsEnvoyes: number;
  bulletinsAccuses: number;
  tauxEnvoi: number;
  tauxAccuse: number;
}
