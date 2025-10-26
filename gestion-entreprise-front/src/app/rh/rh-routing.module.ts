import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from '../core/guards/auth.guard';
import { RoleGuard } from '../core/guards/role.guard';

// Components
import { RhDashboardComponent } from './components/rh-dashboard/rh-dashboard.component';

// Employees
import { ListeEmployesComponent } from './employes/liste-employes/liste-employes.component';
import { DetailEmployeComponent } from './employes/detail-employe/detail-employe.component';
import { FormulaireEmployeComponent } from './employes/formulaire-employe/formulaire-employe.component';

// Conges
import { DemandesCongesComponent } from './gestion-conges/demandes-conges/demandes-conges.component';
import { ValidationCongesComponent } from './gestion-conges/validation-conges/validation-conges.component';
import { HistoriqueCongesComponent } from './gestion-conges/historique-conges/historique-conges.component';
import { CalendrierCongesComponent } from './gestion-conges/calendrier-conges/calendrier-conges.component';

// Presences
import { SuiviPresencesComponent } from './presences/suivi-presences/suivi-presences.component';
import { FeuillesTempsComponent } from './presences/feuilles-temps/feuilles-temps.component';
import { ImportPresencesComponent } from './presences/import-presences/import-presences.component';
import { AjustementsPresencesComponent } from './presences/ajustements-presences/ajustements-presences.component';
import { RapportsPresencesComponent } from './presences/rapports-presences/rapports-presences.component';

// Pointage
import { PointageComponent } from './presences/pointage/pointage.component';

// Paie
import { PreparationPaieComponent } from './paie/preparation-paie/preparation-paie.component';
import { BulletinsPaieComponent } from './paie/bulletins-paie/bulletins-paie.component';
import { ElementsVariablesComponent } from './paie/elements-variables/elements-variables.component';
import { ExportPaieComponent } from './paie/export-paie/export-paie.component';

// ADD THIS IMPORT
import { CalculPaieComponent } from './gestion-paie/calcul-paie/calcul-paie.component';

// Recrutement
import { OffresEmploiComponent } from './recrutement/offres-emploi/offres-emploi.component';
import { CandidaturesComponent } from './recrutement/candidatures/candidatures.component';
import { SuiviCandidatsComponent } from './recrutement/suivi-candidats/suivi-candidats.component';

// Rapports
import { RapportsEffectifsComponent } from './rapports/rapports-effectifs/rapports-effectifs.component';
import { RapportsCongesComponent } from './rapports/rapports-conges/rapports-conges.component';
import { RapportsAbsencesComponent } from './rapports/rapports-absences/rapports-absences.component';
import { RapportsPaieComponent } from './rapports/rapports-paie/rapports-paie.component';
import { RapportsRhComponent } from './rapports/rapports-rh/rapports-rh.component';

const routes: Routes = [
  {
    path: '',
    component: RhDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'rh'] }
  },
  {
    path: 'dashboard',
    component: RhDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'rh'] }
  },
  // ADD THIS ROUTE
  {
    path: 'pointage',
    component: PointageComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'rh'] }
  },
  {
    path: 'employes',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'rh'] },
    children: [
      { path: '', component: ListeEmployesComponent },
      { path: 'nouveau', component: FormulaireEmployeComponent },
      { path: ':id', component: DetailEmployeComponent },
      { path: ':id/modifier', component: FormulaireEmployeComponent }
    ]
  },
  {
    path: 'conges',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'rh'] },
    children: [
      { path: '', redirectTo: 'demandes', pathMatch: 'full' },
      { path: 'demandes', component: DemandesCongesComponent },
      { path: 'validation', component: ValidationCongesComponent },
      { path: 'historique', component: HistoriqueCongesComponent },
      { path: 'calendrier', component: CalendrierCongesComponent }
    ]
  },
  {
    path: 'presences',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'rh'] },
    children: [
      { path: '', redirectTo: 'suivi', pathMatch: 'full' },
      { path: 'suivi', component: SuiviPresencesComponent },
      { path: 'feuilles-temps', component: FeuillesTempsComponent },
      { path: 'import', component: ImportPresencesComponent },
      { path: 'ajustements', component: AjustementsPresencesComponent },
      { path: 'rapports', component: RapportsPresencesComponent },
      { path: 'pointage', component: PointageComponent }
    ]
  },
  {
    path: 'paie',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'rh'] },
    children: [
      { path: '', redirectTo: 'preparation', pathMatch: 'full' },
      { path: 'preparation', component: PreparationPaieComponent },
      { path: 'bulletins', component: BulletinsPaieComponent },
      { path: 'elements-variables', component: ElementsVariablesComponent },
      { path: 'export', component: ExportPaieComponent }
    ]
  },
  // ADD THIS NEW ROUTE SECTION
  {
    path: 'gestion-paie',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'rh'] },
    children: [
      { path: '', redirectTo: 'calcul-paie', pathMatch: 'full' },
      { path: 'calcul-paie', component: CalculPaieComponent }
    ]
  },
  {
    path: 'recrutement',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'rh'] },
    children: [
      { path: '', redirectTo: 'offres', pathMatch: 'full' },
      { path: 'offres', component: OffresEmploiComponent },
      { path: 'candidatures', component: CandidaturesComponent },
      { path: 'suivi-candidats', component: SuiviCandidatsComponent }
    ]
  },
  {
    path: 'rapports',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'rh'] },
    children: [
      { path: '', redirectTo: 'effectifs', pathMatch: 'full' },
      { path: 'effectifs', component: RapportsEffectifsComponent },
      { path: 'conges', component: RapportsCongesComponent },
      { path: 'absences', component: RapportsAbsencesComponent },
      { path: 'paie', component: RapportsPaieComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RhRoutingModule { }
