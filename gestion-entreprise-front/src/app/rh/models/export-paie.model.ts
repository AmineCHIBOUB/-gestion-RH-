import { Employe } from './employe.model';

export interface ExportPaieRequest {
  format: 'pdf' | 'excel' | 'csv';
  periode: {
    mois: number;
    annee: number;
  };
  employes?: number[];
  includeDetails: boolean;
  filtres?: ExportPaieFilters;
}

export interface ExportPaieFilters {
  departement?: string;
  statut?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface ExportPaieResponse {
  success: boolean;
  message: string;
  fileUrl?: string;
  fileName?: string;
}

export interface ExportPaieData {
  employe: Employe;
  periode: string;
  salaireBrut: number;
  cotisationsSalariales: number;
  cotisationsPatronales: number;
  salaireNet: number;
  heuresTravaillees: number;
  statut: string;
}

export type FormatExport = 'pdf' | 'excel' | 'csv';

export interface OptionsExport {
  includeHeader: boolean;
  includeFooter: boolean;
  includeStatistiques: boolean;
  groupeParDepartement: boolean;
}
