import { TypeConge } from './demande-conge.model';

export interface RapportRH {
  id: number;
  titre: string;
  type: TypeRapport;
  periode: PeriodeRapport;
  donnees: any;
  genereParId: number;
  dateGeneration: Date;
  statut: StatutRapport;
}

export interface RapportEffectifs {
  totalEmployes: number;
  employesActifs: number;
  employesInactifs: number;
  nouveauxEmployes: number;
  departsEmployes: number;
  repartitionParDepartement: RepartitionDepartement[];
  repartitionParTypeContrat: RepartitionTypeContrat[];
  pyramideAges: PyramideAge[];
}

export interface RapportAbsences {
  totalJoursAbsence: number;
  tauxAbsenteisme: number;
  repartitionParType: RepartitionAbsence[];
  repartitionParDepartement: RepartitionDepartement[];
  evolutionMensuelle: EvolutionMensuelle[];
}

export interface RapportConges {
  totalJoursConges: number;
  congesPris: number;
  congesRestants: number;
  repartitionParType: RepartitionConge[];
  repartitionParDepartement: RepartitionDepartement[];
  planningConges: PlanningConge[];
}

export interface RapportPaie {
  masseSalariale: number;
  salaireMoyen: number;
  evolutionMasseSalariale: EvolutionMensuelle[];
  repartitionParDepartement: RepartitionSalaire[];
  cotisationsTotales: number;
}

export type TypeRapport = 'Effectifs' | 'Absences' | 'Congés' | 'Paie' | 'Performance';
export type StatutRapport = 'Généré' | 'Archivé';

export interface PeriodeRapport {
  debut: Date;
  fin: Date;
  type: 'Mensuel' | 'Trimestriel' | 'Annuel' | 'Personnalisé';
}

export interface RepartitionDepartement {
  departement: string;
  nombre: number;
  pourcentage: number;
}

export interface RepartitionTypeContrat {
  typeContrat: TypeContrat;
  nombre: number;
  pourcentage: number;
}

export interface PyramideAge {
  trancheAge: string;
  hommes: number;
  femmes: number;
}

export interface RepartitionAbsence {
  typeAbsence: string;
  nombreJours: number;
  pourcentage: number;
}

export interface EvolutionMensuelle {
  mois: string;
  annee: number;
  valeur: number;
  evolution?: number; // pourcentage d'évolution par rapport au mois précédent
}

export enum TypeContrat {
  CDI = 'cdi',
  CDD = 'cdd',
  STAGE = 'stage',
  INTERIM = 'interim',
  FREELANCE = 'freelance',
  APPRENTISSAGE = 'apprentissage'
}

export interface RepartitionConge {
  typeConge: TypeConge;
  nombreJours: number;
  pourcentage: number;
}

export interface PlanningConge {
  employe: string;
  dateDebut: Date;
  dateFin: Date;
  typeConge: TypeConge;
}

export interface RepartitionSalaire {
  departement: string;
  masseSalariale: number;
  salaireMoyen: number;
}

// Interfaces pour les rapports de présence
export interface RapportPresence {
  id: number;
  periode: PeriodeRapport;
  statistiques: StatistiquesPresence;
  details: DetailPresence[];
  genereParId: number;
  dateGeneration: Date;
}

export interface StatistiquesPresence {
  totalHeuresTravaillees: number;
  totalHeuresSupplementaires: number;
  tauxPresence: number;
  tauxRetard: number; // Propriété manquante ajoutée
  tempsMoyenJour: number; // Propriété manquante ajoutée
  joursOuvres: number; // Propriété manquante ajoutée
  totalEmployes: number; // Propriété manquante ajoutée
  presentsAujourdhui: number; // Propriété manquante ajoutée
  enRetard: number; // Propriété manquante ajoutée
  absents: number; // Propriété manquante ajoutée
  nombreRetards: number;
  nombreAbsences: number;
}

export interface DetailPresence {
  employeId: number;
  employe: string;
  heuresTravaillees: number;
  heuresSupplementaires: number;
  nombreRetards: number;
  nombreAbsences: number;
}


// Ajouter ces interfaces à la fin du fichier
export interface CongeReport {
  id: number;
  employee: {
    id: number;
    nom: string;
    prenom: string;
    matricule: string;
    department?: {
      id: number;
      nom: string;
    };
  };
  type: 'conge_paye' | 'conge_maladie' | 'conge_maternite' | 'conge_formation' | 'rtt';
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  duration: number; // Propriété manquante utilisée dans le composant
  status: 'approuve' | 'en_attente' | 'rejete';
  requestDate: Date;
  approvalDate?: Date;
  approvedBy?: string; // Propriété manquante utilisée dans le composant
  reason?: string;
  comment?: string; // Propriété manquante utilisée dans le composant
}

export interface CongeStatistics {
  totalConges: number;
  congesApprouves: number;
  congesEnAttente: number;
  congesRejetes: number;
  totalJoursConges: number;
  moyenneCongesParEmploye: number;
  tauxUtilisationConges: number;
}

export interface CongeFilters {
  startDate: string;
  endDate: string;
  department: string;
  employee: string;
  type: string;
  status: string;
}


export interface EffectifData {
  id: number;
  employee: {
    id: number;
    nom: string;
    prenom: string;
    matricule: string;
    department: {
      id: number;
      nom: string;
    };
    poste: string;
    dateEmbauche: Date;
    statut: 'actif' | 'inactif' | 'conge' | 'formation';
    typeContrat: 'cdi' | 'cdd' | 'stage' | 'freelance';
  };
  periode: string;
  present: boolean;
  heuresTravaillees: number;
}

export interface EffectifStatistics {
  totalEmployes: number;
  employesActifs: number;
  employesInactifs: number;
  nouveauxEmployes: number;
  departsEmployes: number;
  tauxRotation: number;
  ancienneteMoyenne: number;
  repartitionContrats: { [key: string]: number };
}

export interface EffectifFilters {
  startDate: string;
  endDate: string;
  department: string;
  status: string;
  contractType: string;
}
