export interface Fichier {
  id: number;
  nom: string;
  nom_original: string;
  chemin: string;
  taille: number;
  type_mime: string;
  extension: string;
  description?: string;
  employe_id: number;
  facture_id?: number;
  created_at: string;
  updated_at: string;
  
  // Relations Laravel
  employe?: {
    id: number;
    nom: string;
    prenom: string;
  };
}

export interface FichierUpload {
  fichier: File;
  description?: string;
}

export interface FichierStats {
  total: number;
  taille_totale: number;
  par_type: { [key: string]: number };
}
