export interface Departement {
  id: number;
  name: string;  // Changé de 'nom' à 'name'
  description?: string;
  responsableId?: number;
  responsable?: {
    id: number;
    nom: string;
    prenom: string;
  };
  budget?: number;
  nombreEmployes: number;
  statut: 'actif' | 'inactif';
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartementRequest {
  name: string;  // Changé de 'nom' à 'name'
  description?: string;
  responsableId?: number;
  budget?: number;
  statut: 'actif' | 'inactif';
}

export interface DepartementStats {
  totalEmployes: number;
  employesActifs: number;
  employesInactifs: number;
  budgetUtilise: number;
  budgetTotal: number;
  tauxUtilisation: number;
}
