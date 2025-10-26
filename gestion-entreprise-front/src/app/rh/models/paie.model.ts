import { Employe } from './employe.model';

export interface ElementVariable {
  id: number;
  employeId: number;
  employe?: Employe;
  typeElement: TypeElementVariable;
  libelle: string;
  montant: number;
  periode: string;
  statut: StatutElementVariable;
  createdAt: Date;
  updatedAt: Date;
}

export interface PreparationPaie {
  id: number;
  periode: string;
  statut: StatutPreparationPaie;
  employes: Employe[];
  elementsVariables: ElementVariable[];
  datePreparation: Date;
  preparePar: number;
  validePar?: number;
  dateValidation?: Date;
}

export type TypeElementVariable = 'Prime' | 'Indemnité' | 'Déduction' | 'Heures supplémentaires';
export type StatutElementVariable = 'En attente' | 'Validé' | 'Rejeté';
export type StatutPreparationPaie = 'En cours' | 'Validée' | 'Finalisée';

export interface ElementVariableRequest {
  employeId: number;
  typeElement: TypeElementVariable;
  libelle: string;
  montant: number;
  periode: string;
}

export interface PreparationPaieRequest {
  periode: string;
  employeIds: number[];
}

// Ajouter ces interfaces manquantes
export interface ElementPaie {
  id: number;
  employeId: number;
  typeElement: TypeElementVariable;
  libelle: string;
  montant: number;
  periode: string;
  statut: StatutElementVariable;
}

export interface ElementPaieRequest {
  employeId: number;
  typeElement: TypeElementVariable;
  libelle: string;
  montant: number;
  periode: string;
}

export interface PaieFilter {
  periode?: string;
  employeId?: number;
  departementId?: number;
  statut?: StatutPreparationPaie;
}
