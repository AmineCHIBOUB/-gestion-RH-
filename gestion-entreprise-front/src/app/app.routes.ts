import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'rh',
    loadChildren: () => import('./rh/rh.module').then(m => m.RhModule)
  },
  {
    path: 'employe',
    loadChildren: () => import('./employe/employe.module').then(m => m.EmployeModule)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
