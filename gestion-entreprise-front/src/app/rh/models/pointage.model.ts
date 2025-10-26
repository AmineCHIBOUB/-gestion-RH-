export interface Pointage {
  id: number;
  employe_id: number;
  date_pointage: string;
  heure_entree?: string;
  heure_sortie?: string;
  pause_debut?: string;
  pause_fin?: string;
  heures_travaillees?: number;
  statut: 'present' | 'absent' | 'retard' | 'conge';
  commentaire?: string;
  employe?: {
    id: number;
    nom: string;
    prenom: string;
    user?: {
      name: string;
      email: string;
    };
  };
  created_at?: string;
  updated_at?: string;
}

export interface PointageRequest {
  employe_id: number;
  date_pointage: string;
  heure_entree?: string;
  heure_sortie?: string;
  pause_debut?: string;
  pause_fin?: string;
  statut: string;
  commentaire?: string;
}

export interface PointageFilter {
  employe_id?: number;
  date_debut?: string;
  date_fin?: string;
  statut?: string;
  page?: number;
  per_page?: number;
}

export interface PointageStats {
  total_pointages: number;
  presents_aujourdhui: number;
  absents_aujourdhui: number;
  retards_mois: number;
  heures_moyennes: number;
  taux_presence: number;
}
