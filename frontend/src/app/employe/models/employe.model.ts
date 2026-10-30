// Garder seulement les imports au début du fichier
import { CongeEmploye, TypeConge, StatutConge } from './conge-employe.model';
import { Pointage } from './pointage.model';
import { Fichier } from './fichier.model';
import { Annonce, TypeAnnonce, PrioriteAnnonce } from './annonce.model';

export interface Employe {
  id: number;
  user_id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  poste: string;
  departement?: string;
  salaire?: number;
  // Ajouter la propriété camelCase pour compatibilité avec le template
  dateEmbauche: string;
  date_embauche: string; // Garder pour compatibilité API
  numero_securite_sociale?: string;
  statut: 'actif' | 'inactif';
  created_at: string;
  updated_at: string;
  
  // Relations Laravel
  user?: User;
  conges?: CongeEmploye[];
  pointages?: Pointage[];
  fichiers?: Fichier[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'rh' | 'employe';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeProfile {
  id: number;
  user_id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  date_naissance?: string; // Ajouter cette propriété
  adresse?: string;
  poste: string;
  departement?: string;
  salaire?: number;
  date_embauche: string;
  numero_securite_sociale?: string;
  statut: 'actif' | 'inactif';
  created_at: string;
  updated_at: string;
  
  // Ajouter les propriétés camelCase pour la compatibilité avec le template
  dateNaissance?: string;
  dateEmbauche?: string;
  
  // Relations Laravel
  user?: User;
  conges?: CongeEmploye[];
  pointages?: Pointage[];
  fichiers?: Fichier[];
  
  // Contact d'urgence
  contactUrgence?: ContactUrgence;
}

export interface EmployeStats {
  congesRestants: number;
  congesPris: number;
  heuresTravaillees: number;
  heuresSupplementaires: number;
  documentsNonLus: number;
  annoncesNonLues: number;
}

export interface ContactUrgence {
  nom: string;
  prenom: string;
  telephone: string;
  relation: string;
  email?: string;
}

export enum StatutEmploye {
  ACTIF = 'actif',
  INACTIF = 'inactif',
  CONGE = 'conge',
  ARRET_MALADIE = 'arret_maladie'
}

// ✅ SOLUTION - Retirer les enums dupliqués et importer depuis conge-employe.model.ts
// import { TypeConge, StatutConge } from './conge-employe.model';

export interface DemandeCongeEmploye {
  id?: number;
  employeId: number;
  typeConge: TypeConge; // ✅ Utiliser l'enum importé
  dateDebut: Date;
  dateFin: Date;
  nbJours: number;
  motif?: string;
  statut: StatutConge; // ✅ Utiliser l'enum importé
  dateCreation: Date;
  dateValidation?: Date;
  commentaireRh?: string;
  fichierJustificatif?: string;
}

// ✅ Retirer ces enums (les garder uniquement dans conge-employe.model.ts)
// export enum TypeConge { ... }
// export enum StatutConge { ... }

export interface SoldeConges {
  congesPayes: number;
  rtt: number;
  maladie: number;
  formation: number;
  exceptionnel: number;
}

export interface BulletinPaieEmploye {
  id: number;
  employeId: number;
  mois: number;
  annee: number;
  salaireBrut: number;
  salaireNet: number;
  cotisationsSalariales: number;
  cotisationsPatronales: number;
  heuresNormales: number;
  heuresSupplementaires?: number;
  primes?: ElementPaie[];
  avantages?: ElementPaie[];
  retenues?: ElementPaie[];
  dateEdition: Date;
  fichierPdf?: string;
  statut: StatutBulletin;
}

export interface ElementPaie {
  libelle: string;
  montant: number;
  type: 'prime' | 'avantage' | 'retenue';
}

export enum StatutBulletin {
  PROVISOIRE = 'provisoire',
  DEFINITIF = 'definitif',
  ARCHIVE = 'archive'
}

export interface FeuilleTempsEmploye {
  id?: number;
  employeId: number;
  semaine: Date;
  jours: { [key: string]: JourneeTemps };
  totalHeures: number;
  statut: StatutFeuille;
  dateCreation: Date;
  dateValidation?: Date;
  commentaire?: string;
}

export interface JourneeTemps {
  date: Date;
  heureArrivee?: string;
  heureDepart?: string;
  pauseDebutMatin?: string;
  pauseFinMatin?: string;
  pauseDebutApresMidi?: string;
  pauseFinApresMidi?: string;
  totalHeures: number;
  commentaire?: string;
  typeJournee: TypeJournee;
}

export enum TypeJournee {
  TRAVAIL = 'travail',
  CONGE = 'conge',
  MALADIE = 'maladie',
  FORMATION = 'formation',
  FERIE = 'ferie'
}

export enum StatutFeuille {
  BROUILLON = 'brouillon',
  SOUMISE = 'soumise',
  VALIDEE = 'validee',
  REFUSEE = 'refusee'
}

export interface DocumentEmploye {
  id: number;
  titre: string;
  description?: string;
  fichier: string;
  taille: number;
  type: string;
  dateCreation: Date;
  dateModification?: Date;
  public: boolean;
  departements?: string[];
  categorie: CategorieDocument;
}

export enum CategorieDocument {
  PROCEDURE = 'procedure',
  FORMULAIRE = 'formulaire',
  REGLEMENT = 'reglement',
  INFORMATION = 'information',
  FORMATION = 'formation'
}

// ✅ SOLUTION - Retirer AnnonceEmploye et utiliser Annonce
// import { Annonce, TypeAnnonce, PrioriteAnnonce } from './annonce.model';

// ✅ Retirer l'enum PrioriteAnnonce dupliqué (déjà importé)

export interface StatistiquesEmploye {
  congesRestants: SoldeConges;
  heuresTravailleesMois: number;
  heuresSupplementairesMois: number;
  dernierBulletin?: BulletinPaieEmploye;
  prochainConge?: DemandeCongeEmploye;
  documentsNonLus: number;
  annoncesNonLues: number;
}
