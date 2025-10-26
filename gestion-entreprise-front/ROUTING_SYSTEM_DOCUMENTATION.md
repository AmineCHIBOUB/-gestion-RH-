# Système de Routing Angular - Gestion d'Entreprise

## Vue d'ensemble

Ce document décrit le système de routing complet de l'application Angular avec les guards d'authentification pour protéger les routes sensibles.

## Structure des Routes Principales

### Configuration dans `app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/guards/auth-guard';

export const routes: Routes = [
  // Route par défaut
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // Raccourci pour la page de connexion
  {
    path: 'login',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  
  // Module d'authentification (accessible uniquement aux non-connectés)
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule),
    canActivate: [guestGuard]
  },
  
  // Tableau de bord (protégé par authentification)
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard-module').then(m => m.DashboardModule),
    canActivate: [authGuard]
  },
  
  // Gestion des employés (protégé par authentification)
  {
    path: 'employes',
    loadChildren: () => import('./employees/employees-module').then(m => m.EmployeesModule),
    canActivate: [authGuard]
  },
  
  // Redirection pour compatibilité
  {
    path: 'employees',
    redirectTo: '/employes',
    pathMatch: 'full'
  },
  
  // Gestion des factures (protégé par authentification)
  {
    path: 'factures',
    loadChildren: () => import('./factures/factures-module').then(m => m.FacturesModule),
    canActivate: [authGuard]
  },
  
  // Gestion des congés (protégé par authentification)
  {
    path: 'conges',
    loadChildren: () => import('./conges/conges-module').then(m => m.CongesModule),
    canActivate: [authGuard]
  },
  
  // Gestion des fichiers (protégé par authentification)
  {
    path: 'fichiers',
    loadChildren: () => import('./fichiers/fichiers-module').then(m => m.FichiersModule),
    canActivate: [authGuard]
  },
  
  // Gestion du pointage (protégé par authentification)
  {
    path: 'pointage',
    loadChildren: () => import('./pointage/pointage-module').then(m => m.PointageModule),
    canActivate: [authGuard]
  },
  
  // Route wildcard - redirection vers dashboard
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
```

## Guards d'Authentification

### Types de Guards Implémentés

#### 1. `authGuard`
- **Objectif** : Protéger les routes qui nécessitent une authentification
- **Comportement** :
  - Si l'utilisateur est connecté → Accès autorisé
  - Si l'utilisateur n'est pas connecté → Redirection vers `/auth/login`
- **Routes protégées** : dashboard, employes, factures, conges, fichiers, pointage

#### 2. `guestGuard`
- **Objectif** : Empêcher les utilisateurs connectés d'accéder aux pages d'authentification
- **Comportement** :
  - Si l'utilisateur n'est pas connecté → Accès autorisé
  - Si l'utilisateur est connecté → Redirection vers `/dashboard`
- **Routes protégées** : auth (login)

#### 3. `adminGuard`
- **Objectif** : Restreindre l'accès aux fonctionnalités administrateur
- **Comportement** :
  - Si l'utilisateur est connecté ET a le rôle admin → Accès autorisé
  - Sinon → Redirection vers `/dashboard`
- **Usage** : Peut être ajouté aux routes sensibles nécessitant des privilèges admin

### Implémentation des Guards

```typescript
// auth/guards/auth-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  } else {
    router.navigate(['/dashboard']);
    return false;
  }
};

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/dashboard']);
    return false;
  }
};
```

## Routes Internes des Modules

### Module Auth (`auth-routing-module.ts`)
```typescript
const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  }
];
```
**URLs accessibles** :
- `/auth` → Redirection vers `/auth/login`
- `/auth/login` → Formulaire de connexion
- `/login` → Redirection vers `/auth/login`

### Module Dashboard (`dashboard-routing-module.ts`)
```typescript
const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  }
];
```
**URLs accessibles** :
- `/dashboard` → Tableau de bord principal

### Module Employees (`employees-routing-module.ts`)
```typescript
const routes: Routes = [
  {
    path: '',
    component: EmployeeListComponent
  }
];
```
**URLs accessibles** :
- `/employes` → Liste des employés
- `/employees` → Redirection vers `/employes`

### Module Factures (`factures-routing-module.ts`)
```typescript
const routes: Routes = [
  {
    path: '',
    component: FactureListComponent
  },
  {
    path: 'liste',
    component: FactureListComponent
  }
];
```
**URLs accessibles** :
- `/factures` → Liste des factures
- `/factures/liste` → Liste des factures (alias)

### Module Congés (`conges-routing-module.ts`)
```typescript
const routes: Routes = [
  {
    path: '',
    component: CongeListComponent
  },
  {
    path: 'liste',
    component: CongeListComponent
  }
];
```
**URLs accessibles** :
- `/conges` → Liste des congés
- `/conges/liste` → Liste des congés (alias)

### Module Fichiers (`fichiers-routing-module.ts`)
```typescript
const routes: Routes = [
  {
    path: '',
    component: FichierListComponent
  },
  {
    path: 'liste',
    component: FichierListComponent
  }
];
```
**URLs accessibles** :
- `/fichiers` → Liste des fichiers
- `/fichiers/liste` → Liste des fichiers (alias)

### Module Pointage (`pointage-routing-module.ts`)
```typescript
const routes: Routes = [
  {
    path: '',
    component: PointageListComponent
  },
  {
    path: 'liste',
    component: PointageListComponent
  }
];
```
**URLs accessibles** :
- `/pointage` → Liste des pointages
- `/pointage/liste` → Liste des pointages (alias)

## Flux de Navigation

### Utilisateur Non Connecté
1. Accès à n'importe quelle URL protégée → Redirection vers `/auth/login`
2. Connexion réussie → Redirection vers l'URL demandée ou `/dashboard`
3. Accès direct à `/auth/login` → Affichage du formulaire de connexion

### Utilisateur Connecté
1. Accès à `/auth/login` → Redirection vers `/dashboard`
2. Accès aux URLs protégées → Accès autorisé
3. Déconnexion → Redirection vers `/auth/login`

### Gestion des Erreurs de Route
- URL inexistante → Redirection vers `/dashboard`
- Accès refusé → Redirection appropriée selon le guard

## Fonctionnalités Avancées

### Return URL
- Quand un utilisateur non connecté tente d'accéder à une page protégée
- L'URL est sauvegardée dans les query parameters
- Après connexion, redirection automatique vers l'URL demandée

### Lazy Loading
- Tous les modules sont chargés à la demande
- Amélioration des performances de l'application
- Réduction du bundle initial

### Compatibilité
- Redirection `/employees` → `/employes` pour la compatibilité
- Raccourci `/login` → `/auth/login` pour faciliter l'accès

## Sécurité

### Protection des Routes
- ✅ Toutes les routes sensibles sont protégées par `authGuard`
- ✅ Les pages d'authentification sont protégées par `guestGuard`
- ✅ Vérification du statut d'authentification en temps réel
- ✅ Redirection automatique en cas d'accès non autorisé

### Bonnes Pratiques Implémentées
- Guards fonctionnels (Angular 14+)
- Injection de dépendances avec `inject()`
- Gestion des query parameters pour le return URL
- Séparation claire des responsabilités

## Extension Future

### Routes Additionnelles Possibles
```typescript
// Exemples d'extensions futures
{
  path: 'employes/:id',
  component: EmployeeDetailComponent,
  canActivate: [authGuard]
},
{
  path: 'factures/nouvelle',
  component: FactureCreateComponent,
  canActivate: [authGuard]
},
{
  path: 'admin',
  loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule),
  canActivate: [authGuard, adminGuard]
}
```

### Guards Additionnels
- `roleGuard` : Protection basée sur des rôles spécifiques
- `permissionGuard` : Protection basée sur des permissions granulaires
- `dataGuard` : Protection basée sur la propriété des données

Ce système de routing offre une base solide et sécurisée pour l'application de gestion d'entreprise, avec une architecture évolutive et maintenable.