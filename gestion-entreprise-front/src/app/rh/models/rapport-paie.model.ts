import { Employe } from './employe.model';

export interface RapportPaie {
  id: number;
  employeId: number;
  employe: Employe;
  periode: string;
  annee: number;
  mois: number;
  salaireBrut: number;
  cotisationsSalariales: number;
  cotisationsPatronales: number;
  salaireNet: number;
  charges: number;
  coutTotal: number;
  heuresTravaillees: number;
  tauxHoraire: number;
  departement: string;
  poste: string;
  createdAt: Date;
}

export interface StatistiquesPaie {
  totalPaie: number;
  totalEmployes: number;
  salaireMoyen: number;
  totalCharges: number;
  totalNet: number;
  totalBrut: number;
  tauxCharges: number;
  coutPaie: number;
}

export interface EvolutionPaie {
  labels: string[];
  salaireBrut: number[];
  salaireNet: number[];
  charges: number[];
}

export interface RepartitionPaie {
  labels: string[];
  values: number[];
}
