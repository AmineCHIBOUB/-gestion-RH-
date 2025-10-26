export interface ElementPaie {
  id: number;
  code: string;
  libelle: string;
  type: TypeElement;
  categorie: CategorieElement;
  formuleCalcul?: string;
  montantFixe?: number;
  taux?: number;
  base?: string;
  obligatoire: boolean;
  imposable: boolean;
  cotisable: boolean;
  statut: 'actif' | 'inactif';
  dateDebut: Date;
  dateFin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum TypeElement {
  GAIN = 'gain',
  RETENUE = 'retenue',
  COTISATION = 'cotisation',
  CHARGE = 'charge'
}

export enum CategorieElement {
  SALAIRE_BASE = 'salaire_base',
  PRIME = 'prime',
  INDEMNITE = 'indemnite',
  AVANTAGE = 'avantage',
  COTISATION_SOCIALE = 'cotisation_sociale',
  IMPOT = 'impot',
  AUTRE = 'autre'
}

export interface ElementPaieEmploye {
  id: number;
  employeId: number;
  elementPaieId: number;
  elementPaie: ElementPaie;
  montant: number;
  taux?: number;
  base?: number;
  periode: string;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ElementVariable {
  id: number;
  employeId: number;
  elementPaieId: number;
  elementPaie: ElementPaie;
  montant: number;
  periode: string;
  motif?: string;
  valide: boolean;
  validePar?: number;
  dateValidation?: Date;
  createdAt: Date;
  updatedAt: Date;
}
