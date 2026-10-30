# Structure de l'Application Angular - Gestion d'Entreprise

## Vue d'ensemble

Cette documentation présente l'architecture modulaire de l'application Angular pour le système de gestion d'entreprise. L'application suit une structure organisée par fonctionnalités avec une séparation claire des responsabilités.

## Structure des Dossiers

```
src/app/
├── core/                    ← Services globaux, interceptors, guards
│   ├── services/           ← Services singleton (API, configuration)
│   ├── interceptors/       ← Intercepteurs HTTP (auth, erreurs)
│   └── guards/             ← Guards de navigation (auth, rôles)
│
├── shared/                  ← Composants réutilisables
│   ├── components/         ← Composants partagés (modals, boutons, etc.)
│   ├── pipes/              ← Pipes personnalisés
│   └── directives/         ← Directives personnalisées
│
├── auth/                    ← Module d'authentification
│   ├── components/         ← Login, inscription, profil
│   ├── services/           ← AuthService, TokenService
│   └── guards/             ← AuthGuard, RoleGuard
│
├── employees/               ← Gestion des employés
│   ├── components/         ← Liste, création, édition employés
│   ├── services/           ← EmployeeService
│   └── models/             ← Interfaces Employee
│
├── factures/                ← Gestion des factures
│   ├── components/         ← Liste, création, édition factures
│   ├── services/           ← FactureService
│   └── models/             ← Interfaces Facture
│
├── conges/                  ← Gestion des congés
│   ├── components/         ← Demandes, validation congés
│   ├── services/           ← CongeService
│   └── models/             ← Interfaces Conge
│
├── fichiers/                ← Gestion des fichiers
│   ├── components/         ← Upload, liste fichiers
│   ├── services/           ← FichierService
│   └── models/             ← Interfaces Fichier
│
├── pointage/                ← Gestion du pointage
│   ├── components/         ← Pointage, historique
│   ├── services/           ← PointageService
│   └── models/             ← Interfaces Pointage
│
└── dashboard/               ← Tableau de bord
    ├── components/         ← Widgets, statistiques
    └── services/           ← DashboardService
```

## Description des Modules

### 🔧 Core Module
**Responsabilité** : Services globaux et fonctionnalités transversales

**Services à implémenter :**
- `ApiService` : Service de base pour les appels HTTP
- `ConfigService` : Configuration de l'application
- `NotificationService` : Gestion des notifications
- `LoadingService` : Gestion des états de chargement

**Interceptors :**
- `AuthInterceptor` : Ajout automatique du token d'authentification
- `ErrorInterceptor` : Gestion centralisée des erreurs HTTP
- `LoadingInterceptor` : Gestion automatique des indicateurs de chargement

**Guards :**
- `AuthGuard` : Protection des routes authentifiées
- `RoleGuard` : Contrôle d'accès basé sur les rôles
- `UnsavedChangesGuard` : Protection contre la perte de données

### 🔄 Shared Module
**Responsabilité** : Composants, pipes et directives réutilisables

**Composants à créer :**
- `ConfirmDialogComponent` : Modal de confirmation
- `LoadingSpinnerComponent` : Indicateur de chargement
- `DataTableComponent` : Tableau de données générique
- `FormFieldComponent` : Champ de formulaire standardisé
- `PaginationComponent` : Composant de pagination

**Pipes :**
- `CurrencyPipe` : Formatage des montants
- `DateFormatPipe` : Formatage des dates
- `StatusPipe` : Formatage des statuts

**Directives :**
- `HighlightDirective` : Mise en surbrillance
- `PermissionDirective` : Affichage conditionnel basé sur les permissions

### 🔐 Auth Module
**Responsabilité** : Authentification et gestion des utilisateurs

**Composants :**
- `LoginComponent` : Formulaire de connexion
- `RegisterComponent` : Formulaire d'inscription
- `ProfileComponent` : Gestion du profil utilisateur
- `ChangePasswordComponent` : Changement de mot de passe

**Services :**
- `AuthService` : Gestion de l'authentification
- `TokenService` : Gestion des tokens JWT
- `UserService` : Gestion des données utilisateur

### 👥 Employees Module
**Responsabilité** : Gestion complète des employés

**Composants :**
- `EmployeeListComponent` : Liste des employés avec filtres
- `EmployeeFormComponent` : Formulaire de création/édition
- `EmployeeDetailComponent` : Détails d'un employé
- `EmployeeCardComponent` : Carte employé réutilisable

**Services :**
- `EmployeeService` : CRUD employés
- `EmployeeValidationService` : Validation des données

**Models :**
- `Employee` : Interface employé
- `EmployeeFilter` : Interface pour les filtres

### 🧾 Factures Module
**Responsabilité** : Gestion des factures et facturation

**Composants :**
- `FactureListComponent` : Liste des factures
- `FactureFormComponent` : Création/édition de factures
- `FactureDetailComponent` : Détails et aperçu facture
- `FacturePrintComponent` : Impression de factures

**Services :**
- `FactureService` : CRUD factures
- `FacturePdfService` : Génération PDF

### 🏖️ Conges Module
**Responsabilité** : Gestion des demandes de congés

**Composants :**
- `CongeListComponent` : Liste des demandes
- `CongeFormComponent` : Formulaire de demande
- `CongeCalendarComponent` : Calendrier des congés
- `CongeApprovalComponent` : Validation des demandes

**Services :**
- `CongeService` : CRUD congés
- `CongeCalculationService` : Calculs de soldes

### 📁 Fichiers Module
**Responsabilité** : Gestion des documents et fichiers

**Composants :**
- `FichierListComponent` : Liste des fichiers
- `FichierUploadComponent` : Upload de fichiers
- `FichierViewerComponent` : Visualisation de fichiers
- `FichierManagerComponent` : Gestionnaire de fichiers

**Services :**
- `FichierService` : CRUD fichiers
- `FileUploadService` : Gestion des uploads

### ⏰ Pointage Module
**Responsabilité** : Gestion du temps de travail

**Composants :**
- `PointageFormComponent` : Saisie de pointage
- `PointageListComponent` : Historique des pointages
- `PointageCalendarComponent` : Vue calendrier
- `PointageStatsComponent` : Statistiques de temps

**Services :**
- `PointageService` : CRUD pointages
- `TimeCalculationService` : Calculs de temps

### 📊 Dashboard Module
**Responsabilité** : Tableau de bord et statistiques

**Composants :**
- `DashboardComponent` : Page principale du tableau de bord
- `StatsWidgetComponent` : Widget de statistiques
- `ChartComponent` : Composant de graphiques
- `RecentActivityComponent` : Activités récentes

**Services :**
- `DashboardService` : Données du tableau de bord
- `StatsService` : Calculs statistiques

## Conventions de Nommage

### Fichiers
- **Composants** : `feature-name.component.ts`
- **Services** : `feature-name.service.ts`
- **Models** : `feature-name.model.ts`
- **Guards** : `feature-name.guard.ts`
- **Interceptors** : `feature-name.interceptor.ts`

### Classes
- **Composants** : `FeatureNameComponent`
- **Services** : `FeatureNameService`
- **Interfaces** : `IFeatureName` ou `FeatureName`
- **Guards** : `FeatureNameGuard`

## Routing Structure

```typescript
const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'employees', 
    loadChildren: () => import('./employees/employees.module').then(m => m.EmployeesModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'hr'] }
  },
  // ... autres routes
];
```

## Prochaines Étapes

1. **Création des modules Angular** avec `ng generate module`
2. **Implémentation des services** de base (API, Auth)
3. **Développement des composants** shared
4. **Création des interfaces** TypeScript
5. **Implémentation du routing** et des guards
6. **Développement des fonctionnalités** par module
7. **Tests unitaires** et d'intégration
8. **Optimisation** et lazy loading

## Avantages de cette Architecture

- ✅ **Modularité** : Chaque fonctionnalité est isolée
- ✅ **Réutilisabilité** : Composants shared réutilisables
- ✅ **Maintenabilité** : Code organisé et facile à maintenir
- ✅ **Scalabilité** : Facilité d'ajout de nouvelles fonctionnalités
- ✅ **Performance** : Lazy loading des modules
- ✅ **Testabilité** : Structure facilitant les tests

Cette structure offre une base solide pour le développement d'une application Angular robuste et évolutive pour la gestion d'entreprise.