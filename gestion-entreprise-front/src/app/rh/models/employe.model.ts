import { TypeContrat } from './types.model';

export interface EmployeResponse {
  data: Employe[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
  from: number;
  to: number;
  // Keeping all existing array compatibility properties
  length: number;
  pop: () => Employe | undefined;
  push: (...items: Employe[]) => number;
  concat: (...items: (Employe | ConcatArray<Employe>)[]) => Employe[];
  join: (separator?: string) => string;
  reverse: () => Employe[];
  shift: () => Employe | undefined;
  slice: (start?: number, end?: number) => Employe[];
  sort: (compareFn?: (a: Employe, b: Employe) => number) => Employe[];
  splice: (start: number, deleteCount?: number, ...items: Employe[]) => Employe[];
  unshift: (...items: Employe[]) => number;
  indexOf: (searchElement: Employe, fromIndex?: number) => number;
  lastIndexOf: (searchElement: Employe, fromIndex?: number) => number;
  every: (predicate: (value: Employe, index: number, array: Employe[]) => boolean, thisArg?: any) => boolean;
  some: (predicate: (value: Employe, index: number, array: Employe[]) => boolean, thisArg?: any) => boolean;
  forEach: (callbackfn: (value: Employe, index: number, array: Employe[]) => void, thisArg?: any) => void;
  map: <U>(callbackfn: (value: Employe, index: number, array: Employe[]) => U, thisArg?: any) => U[];
  filter: (predicate: (value: Employe, index: number, array: Employe[]) => boolean, thisArg?: any) => Employe[];
  reduce: <U>(callbackfn: (previousValue: U, currentValue: Employe, currentIndex: number, array: Employe[]) => U, initialValue: U) => U;
  reduceRight: <U>(callbackfn: (previousValue: U, currentValue: Employe, currentIndex: number, array: Employe[]) => U, initialValue: U) => U;
  find: (predicate: (value: Employe, index: number, obj: Employe[]) => boolean, thisArg?: any) => Employe | undefined;
  findIndex: (predicate: (value: Employe, index: number, obj: Employe[]) => boolean, thisArg?: any) => number;
  fill: (value: Employe, start?: number, end?: number) => Employe[];
  copyWithin: (target: number, start: number, end?: number) => Employe[];
  [Symbol.iterator]: () => IterableIterator<Employe>;
  entries: () => IterableIterator<[number, Employe]>;
  keys: () => IterableIterator<number>;
  values: () => IterableIterator<Employe>;
  [Symbol.unscopables]: () => { [K in keyof Employe[]]?: boolean };
  [n: number]: Employe;
}

export interface Employe {
  id: number;
  user_id?: number; // Added for backend compatibility
  user?: { // Add user relationship
    id: number;
    name: string;
    email: string;
  };
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  dateNaissance: Date | string;
  dateEmbauche: Date | string;
  date_embauche?: Date | string; // Added for backend compatibility
  dateFinContrat?: Date | string;
  poste: string | number; // Can be string or ID
  departementId: number;
  departement?: string;
  salaire: number;
  salaireBase?: number;
  numeroSecuriteSociale?: string;
  numero_securite_sociale?: string; // Added for backend compatibility
  managerId?: number;
  manager?: string;
  typeContrat: TypeContrat;
  statut: 'actif' | 'inactif' | 'conge' | 'arret';
  adresse?: {
    rue: string;
    ville: string;
    codePostal: string;
    pays: string;
  } | string; // Can be object or string for backend compatibility
  competences?: string[];
  formation?: string;
  experience?: string;
  photo?: string;
  documents?: DocumentEmploye[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface DocumentEmploye {
  id: number;
  employeId: number;
  nom: string;
  type: 'contrat' | 'cv' | 'diplome' | 'certificat' | 'piece_identite' | 'autre';
  fichier: string;
  url?: string;
  taille: number;
  mimeType: string;
  description?: string;
  dateUpload: Date | string;
  dateAjout: Date | string;
  ajoutePar: string;
}

// Updated to match backend API exactly
export interface EmployeRequest {
  user_name: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  post_id: number; // Database field name
  department_id: number; // Database field name
  salaire: number;
  date_embauche: string;
  numero_securite_sociale: string;
  statut: 'actif' | 'inactif';
  user_password: string;
  user_password_confirmation: string;
}

// Keep existing interfaces for backward compatibility
export interface EmployeUpdateRequest {
  matricule?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  dateNaissance?: string;
  dateEmbauche?: string;
  dateFinContrat?: string;
  poste?: string;
  departementId?: number;
  salaire?: number;
  salaireBase?: number;
  numeroSecuriteSociale?: string;
  managerId?: number;
  typeContrat?: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  statut?: 'actif' | 'inactif' | 'conge' | 'arret';
  adresse?: {
    rue: string;
    ville: string;
    codePostal: string;
    pays: string;
  };
  competences?: string[];
  formation?: string;
  experience?: string;
}

export interface EmployeFilter {
  search?: string;
  nom?: string;
  departementId?: number;
  departement?: string;
  poste?: string;
  statut?: string;
  typeContrat?: string;
  dateEmbaucheDebut?: string;
  dateEmbaucheFin?: string;
  page?: number;
  limit?: number;
}
