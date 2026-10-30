export interface Document {
  id: number;
  titre: string;
  description?: string;
  type: TypeDocument; // Corriger de 'typeDocument' à 'type'
  fichier: string;
  taille: number; // Corriger de 'tailleFichier' à 'taille'
  dateCreation: Date;
  creePar: string;
  estPublic: boolean;
  departements?: string[];
  postes?: string[];
  dateExpiration?: Date;
  lu: boolean;
  dateLecture?: Date;
}

export enum TypeDocument {
  PROCEDURE = 'procedure',
  POLITIQUE = 'politique',
  FORMATION = 'formation',
  SECURITE = 'securite',
  QUALITE = 'qualite',
  ADMINISTRATIF = 'administratif',
  AUTRE = 'autre'
}

export interface DocumentStats {
  total: number;
  nonLus: number;
  parType: { [key: string]: number };
  // Ajouter les propriétés manquantes utilisées dans le template
  totalDocuments: number;
  documentsLus: number;
  documentsNonLus: number;
  nouveauxCeMois: number;
}
