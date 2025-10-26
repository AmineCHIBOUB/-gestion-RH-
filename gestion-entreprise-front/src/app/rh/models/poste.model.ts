export interface Poste {
  id: number;
  titre: string;
  description: string;
  departementId: number;
  typeContrat: 'CDI' | 'CDD' | 'Stage' | 'Freelance'; // Correction du type
  salaire: number;
  salaireMin?: number;
  salaireMax?: number;
  statut: 'ouvert' | 'ferme' | 'pourvue'; // Correction du type aussi
  competencesRequises?: string;
  competences?: string[];
  experience?: string;
  formation?: string;
  localisation?: string;
  dateLimite?: string;
  dateCreation: string;
  candidatures?: any[];
}
export interface PosteRequest {
  titre: string;
  description: string;
  departementId: number;
  typeContrat: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  salaireMin?: number; // Rendu optionnel
  salaireMax?: number; // Rendu optionnel
  salaire?: number;    // Ajouté comme optionnel
  experience?: string; // Changé de string à string? (optionnel)
  competences: string[];
  formation?: string;  // Changé de string à string? (optionnel)
  statut: 'ouvert' | 'ferme' | 'pourvue';
  responsableId?: number;
}

export interface PosteUpdateRequest {
  titre?: string;
  description?: string;
  departementId?: number;
  typeContrat?: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  salaireMin?: number;
  salaireMax?: number;
  salaire?: number;    // Ajouté
  experience?: string;
  competences?: string[];
  formation?: string;
  statut?: 'ouvert' | 'ferme' | 'pourvue';
  responsableId?: number;
}

export interface PosteFilter {
  search?: string;
  departementId?: number;
  typeContrat?: string;
  statut?: string;
  salaireMin?: number;
  salaireMax?: number;
}
