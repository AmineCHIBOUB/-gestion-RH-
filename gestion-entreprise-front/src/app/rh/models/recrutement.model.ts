import { TypeContrat } from './types.model';

export interface OffreEmploi {
  id: number;
  titre: string;
  description: string;
  departement: string;
  typeContrat: TypeContrat;
  salaire?: {
    min: number;
    max: number;
  };
  experience: string;
  competences: string[];
  statut: StatutOffre;
  datePublication: Date;
  dateLimite?: Date;
  nombrePostes: number;
  nombreCandidatures?: number; // Propriété ajoutée
  responsableRH: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidature {
  id: number;
  offreId: number;
  offre: OffreEmploi;
  nom: string;
  prenom: string;
  candidateName?: string; // Ajout pour compatibilité
  email: string;
  telephone: string;
  phone?: string; // Ajout pour compatibilité
  cvUrl: string;
  cv?: string; // Ajout pour compatibilité
  lettreMotivationUrl?: string;
  coverLetter?: string; // Ajout pour compatibilité
  statut: StatutCandidature;
  status?: string; // Ajout pour compatibilité
  noteRH?: string;
  notes?: string; // Ajout pour compatibilité
  dateEntretien?: Date;
  position?: string; // Ajout pour compatibilité
  source?: string; // Ajout pour compatibilité
  applicationDate?: string; // Ajout pour compatibilité
  experience?: string; // Ajout pour compatibilité
  evaluations: EvaluationCandidat[];
  createdAt: Date;
  updatedAt: Date;
}

export type StatutOffre = 'Brouillon' | 'Publiée' | 'Suspendue' | 'Fermée';
export type StatutCandidature = 'Reçue' | 'Présélectionnée' | 'Entretien' | 'Acceptée' | 'Refusée' | 'new' | 'in_review' | 'interviewed' | 'accepted' | 'rejected';
export type TypeEvaluation = 'CV' | 'Entretien RH' | 'Entretien Technique' | 'Test';

// Ajout de l'interface EvaluationCandidat manquante
export interface EvaluationCandidat {
  id: number;
  candidatureId: number;
  evaluateurId: number;
  evaluateur: string;
  type: TypeEvaluation;
  note: number;
  commentaires?: string;
  recommandation: 'favorable' | 'defavorable' | 'reserve';
  dateEvaluation: Date;
}

export interface OffreEmploiRequest {
  titre: string;
  description: string;
  departement: string;
  typeContrat: TypeContrat;
  salaire?: number;
  experience: string;
  competences: string[];
  dateLimite?: string;
  nombrePostes: number;
}

export interface CandidatureRequest {
  offreId: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  cv: File;
  lettreMotivation?: File;
}
