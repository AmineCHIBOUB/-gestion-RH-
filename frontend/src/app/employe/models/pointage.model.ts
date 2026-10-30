export interface Pointage {
  id: number;
  employe_id: number;
  date: string;
  heure_arrivee?: string;
  heure_depart?: string;
  pause_debut?: string;
  pause_fin?: string;
  heures_travaillees: number;
  heures_supplementaires?: number;
  statut: StatutPointage;
  commentaire?: string;
  created_at: string;
  updated_at: string;
  
  // Relations Laravel
  employe?: {
    id: number;
    nom: string;
    prenom: string;
  };
}

export enum StatutPointage {
  PRESENT = 'present',
  ABSENT = 'absent',
  RETARD = 'retard',
  CONGE = 'conge',
  MALADIE = 'maladie'
}

export interface PointageStats {
  heures_semaine: number;
  heures_mois: number;
  retards: number;
  absences: number;
}
