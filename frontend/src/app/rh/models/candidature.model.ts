import { Poste } from './poste.model';

export interface Candidature {
  id: number;
  posteId: number;
  poste: Poste;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  cv?: string;
  lettreMotivation?: string;
  cvPath?: string; // Propriété ajoutée
  lettreMotivationPath?: string; // Propriété ajoutée
  statut: StatutCandidature;
  source: 'site_web' | 'linkedin' | 'indeed' | 'pole_emploi' | 'cooptation' | 'autre';
  datePostulation: Date;
  dateReponse?: Date;
  notes?: string;
  evaluations?: EvaluationCandidature[];
  entretiens?: EntretienCandidature[];
  createdAt: Date;
  updatedAt: Date;
}

export enum StatutCandidature {
  NOUVELLE = 'nouvelle',
  EN_COURS = 'en_cours',
  ENTRETIEN = 'entretien',
  ACCEPTEE = 'acceptee',
  REFUSEE = 'refusee',
  ARCHIVEE = 'archivee'
}

export interface EvaluationCandidature {
  id: number;
  candidatureId: number;
  evaluateurId: number;
  evaluateur: string;
  criteres: CritereEvaluation[];
  noteGlobale: number;
  commentaires?: string;
  recommandation: 'favorable' | 'defavorable' | 'reserve';
  dateEvaluation: Date;
}

export interface CritereEvaluation {
  nom: string;
  note: number;
  poids: number;
  commentaire?: string;
}

export interface EntretienCandidature {
  id: number;
  candidatureId: number;
  type: 'telephonique' | 'visio' | 'presentiel';
  dateEntretien: Date;
  duree: number;
  intervieweurs: string[];
  notes?: string;
  resultat: 'positif' | 'negatif' | 'en_attente';
  prochainEtape?: string;
  createdAt: Date;
}

export interface CandidatureRequest {
  posteId: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  source: string;
  notes?: string;
}

export interface EtapeSuivi {
  id: number;
  candidatureId: number;
  titre: string;
  description?: string;
  statut: 'en_attente' | 'en_cours' | 'terminee' | 'annulee';
  dateEcheance?: Date;
  dateRealisation?: Date;
  responsable?: string;
  commentaires?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidatureFilter {
  search?: string;
  posteId?: number;
  statut?: StatutCandidature;
  source?: string;
  dateDebutPostulation?: string;
  dateFinPostulation?: string;
  dateDebut?: Date;
  dateFin?: Date;
  departementId?: number;
}


export interface Candidat {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  statut: 'nouveau' | 'en_cours' | 'entretien' | 'accepte' | 'rejete';
  source: string;
  datePostulation: Date;
  dateEntretien?: Date;
  notes?: string;
  cv?: string;
  lettreMotivation?: string;
  score: number;
  experience: number;
  salaireSouhaite: number;
  disponibilite: Date;
  competences: string[];
  formations: string[];
  langues: Array<{
    langue: string;
    niveau: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidatStats {
  total: number;
  nouveaux: number;
  enCours: number;
  entretiens: number;
  acceptes: number;
  rejetes: number;
  tauxConversion: number;
  tempsTraitementMoyen: number;
}

// Supprimer complètement ces lignes (143-148) :
// export interface CandidatStats {
//   totalCandidats: number;
//   nouveauxCandidats: number;
//   candidatsActifs: number;
//   tauxConversion: number;
// }


export interface CandidatureResponse {
  data: Candidature[];
  total: number;
  currentPage?: number;
  lastPage?: number;
  perPage?: number;
}
