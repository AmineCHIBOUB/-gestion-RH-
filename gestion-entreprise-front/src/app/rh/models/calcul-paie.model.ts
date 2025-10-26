import { ElementPaieEmploye } from './element-paie.model';
import { Employe } from './employe.model';

export interface CalculPaie {
  id: number;
  employeId: number;
  employe: Employe;
  periode: string;
  annee: number;
  mois: number;
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
  joursConges: number;
  joursAbsence: number;
  statut: StatutCalcul;
  dateCalcul: Date;
  calculePar: number;
  valide: boolean;
  validePar?: number;
  dateValidation?: Date;
  bulletinGenere: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ElementCalculPaie {
  elementPaieId: number;
  code: string;
  libelle: string;
  type: string;
  base: number;
  taux: number;
  montant: number;
  imposable: boolean;
  cotisable: boolean;
}

export enum StatutCalcul {
  BROUILLON = 'brouillon',
  CALCULE = 'calcule',
  VALIDE = 'valide',
  PAYE = 'paye'
}

export interface ParametresCalcul {
  employeId: number;
  periode: string;
  annee: number;
  mois: number;
  heuresTravaillees?: number;
  heuresSupplementaires?: number;
  joursConges?: number;
  joursAbsence?: number;
  elementsVariables?: ElementVariableCalcul[];
}

export interface ElementVariableCalcul {
  elementPaieId: number;
  montant: number;
  motif?: string;
}

export interface ResultatCalcul {
  salaireBrut: number;
  cotisationsSalariales: number;
  cotisationsPatronales: number;
  contributionsSociales: number;
  impotSource: number;
  salaireNet: number;
  coutTotal: number;
  elements: ElementCalculPaie[];
}
