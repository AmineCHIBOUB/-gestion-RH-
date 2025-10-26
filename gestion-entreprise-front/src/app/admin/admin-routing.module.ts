import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./components/users/list/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'roles',
    loadComponent: () => import('./components/roles/role-list.component').then(m => m.RoleListComponent)
  },
  {
    path: 'departments',
    loadComponent: () => import('./components/departments/department-list.component').then(m => m.DepartmentListComponent)
  },
  {
    path: 'posts',
    loadComponent: () => import('./components/departments/post-management/post-management.component').then(m => m.PostManagementComponent)
  },
  {
    path: 'reports',
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      },
      {
        path: 'users',
        loadComponent: () => import('./components/reports/user-reports/user-reports.component').then(m => m.UserReportsComponent)
      },
      {
        path: 'activities',
        loadComponent: () => import('./components/reports/activity-reports/activity-reports.component').then(m => m.ActivityReportsComponent)
      },
      {
        path: 'financial',
        loadComponent: () => import('./components/reports/financial-reports/financial-reports.component').then(m => m.FinancialReportsComponent)
      }
    ]
  },
  {
    path: 'logs',
    children: [
      {
        path: '',
        redirectTo: 'audit',
        pathMatch: 'full'
      },
      {
        path: 'audit',
        loadComponent: () => import('./components/logs/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent)
      },
      {
        path: 'system',
        loadComponent: () => import('./components/logs/system-logs/system-logs.component').then(m => m.SystemLogsComponent)
      }
    ]
  },
  {
    path: 'settings',
    children: [
      {
        path: '',
        redirectTo: 'general',
        pathMatch: 'full'
      },
      {
        path: 'general',
        loadComponent: () => import('./components/settings/general/general-settings.component').then(m => m.GeneralSettingsComponent)
      },
      {
        path: 'payroll',
        loadComponent: () => import('./components/settings/payroll/payroll-settings.component').then(m => m.PayrollSettingsComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./components/settings/document/document-settings.component').then(m => m.DocumentSettingsComponent)
      }
    ]
  },
  {
    path: 'data',
    children: [
      {
        path: '',
        redirectTo: 'import',
        pathMatch: 'full'
      },
      {
        path: 'import',
        loadComponent: () => import('./components/data-management/data-import/data-import.component').then(m => m.DataImportComponent)
      },
      {
        path: 'export',
        loadComponent: () => import('./components/data-management/data-export/data-export.component').then(m => m.DataExportComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
