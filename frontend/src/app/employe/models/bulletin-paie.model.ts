// ✅ SOLUTION - Interface unifiée
export interface BulletinPaie {
  id: number;
  employeId: number;
  mois: number;
  annee: number;
  salaireBrut: number;
  salaireNet: number;
  cotisationsSalariales: number;
  cotisationsPatronales: number;
  heuresNormales: number;
  heuresSupplementaires: number;
  primes?: Prime[];
  deductions?: Deduction[];
  congesPayes: number;
  fichierPdf?: string;
  dateGeneration: Date;
  statut: StatutBulletin;
  
  // ✅ Propriétés ajoutées pour le template
  periode: string;
  dateEmission: Date;
  heuresTravaillees: number;
  tauxHoraire: number;
  salaireBase: number;
  totalDeductions: number;
}

// Ajouter l'enum manquant
export enum StatutBulletin {
  GENERE = 'genere',
  ENVOYE = 'envoye',
  CONSULTE = 'consulte'
}

export interface Prime {
  libelle: string;
  type: string;
  montant: number;
  description?: string;
}

export interface Deduction {
  libelle: string;
  type: string;
  montant: number;
  description?: string;
}

// Ajout de l'interface manquante BulletinSummary
export interface BulletinSummary {
  id: number;
  mois: number;
  annee: number;
  periode: string; // ✅ Ajouter cette propriété manquante
  salaireBrut: number;
  salaireNet: number;
  statut: StatutBulletin;
  dateGeneration: Date;
  fichierPdf?: string;
}
