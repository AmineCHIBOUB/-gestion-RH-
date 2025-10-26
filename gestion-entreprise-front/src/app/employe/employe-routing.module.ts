import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards - Correction des imports
import { AuthGuard } from '../rh/guards/auth.guard';
import { EmployeGuard } from './guards/employe.guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/dashboard/employe-dashboard.component').then(m => m.EmployeDashboardComponent),
    canActivate: [AuthGuard, EmployeGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/employe-dashboard.component').then(m => m.EmployeDashboardComponent),
    canActivate: [AuthGuard, EmployeGuard]
  },
  {
    path: 'profil',
    loadComponent: () => import('./components/profil/profil.component').then(m => m.ProfilComponent),
    canActivate: [AuthGuard, EmployeGuard]
  },
  {
    path: 'conges',
    canActivate: [AuthGuard, EmployeGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/conges/conges-list/conges-list.component').then(m => m.CongesListComponent)
      },
      {
        path: 'nouvelle-demande',
        loadComponent: () => import('./components/conges/nouvelle-demande/nouvelle-demande.component').then(m => m.NouvelleDemandeComponent)
      }
    ]
  },
  {
    path: 'bulletins',
    loadComponent: () => import('./components/bulletins-paie/bulletins-list/bulletins-list.component').then(m => m.BulletinsListComponent)
  },
  // ADD THIS MISSING ROUTE:
  {
    path: 'bulletins/:id',
    loadComponent: () => import('./components/bulletins-paie/bulletin-detail/bulletin-detail.component').then(m => m.BulletinDetailComponent)
  },
  {
    path: 'temps',
    loadComponent: () => import('./components/feuilles-temps/temps-list/temps-list.component').then(m => m.TempsListComponent)
  },
  {
    path: 'temps/nouveau',
    loadComponent: () => import('./components/feuilles-temps/temps-form/temps-form.component').then(m => m.TempsFormComponent)
  },
  {
    path: 'temps/edit/:id',
    loadComponent: () => import('./components/feuilles-temps/temps-form/temps-form.component').then(m => m.TempsFormComponent)
  },
  // Ajouter ces routes manquantes :
  {
    path: 'annonces',
    loadComponent: () => import('./components/annonces/annonces-list/annonces-list.component').then(m => m.AnnoncesListComponent)
  },
  {
    path: 'documents',
    loadComponent: () => import('./components/documents/documents-list/documents-list.component').then(m => m.DocumentsListComponent)
  },
  {
    path: 'profil/modifier',
    loadComponent: () => import('./components/profil-edit/profil-edit.component').then(m => m.ProfilEditComponent),
    canActivate: [AuthGuard, EmployeGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeRoutingModule { }
