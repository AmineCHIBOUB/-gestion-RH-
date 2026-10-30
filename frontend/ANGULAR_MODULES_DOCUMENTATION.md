# Documentation des Modules Angular - Gestion d'Entreprise

## Vue d'ensemble

Cette documentation décrit l'architecture modulaire complète de l'application Angular de gestion d'entreprise, incluant tous les modules, services, composants, modèles et routes créés.

## Structure des Modules

### 1. Module Core (`src/app/core/`)
**Responsabilité :** Services globaux et fonctionnalités partagées

#### Services
- **ApiService** (`core/services/api.ts`)
  - Service HTTP centralisé pour toutes les communications avec l'API
  - Gestion automatique des headers d'authentification
  - Méthodes : `get()`, `post()`, `put()`, `delete()`, `upload()`
  - Support des paramètres de requête et upload de fichiers
  - URL de base configurable via environment

#### Interfaces
- `ApiResponse<T>` : Structure de réponse API standard
- `PaginatedResponse<T>` : Réponses paginées

### 2. Module Auth (`src/app/auth/`)
**Responsabilité :** Authentification et autorisation

#### Composants
- **LoginComponent** (`auth/components/login/`)
  - Formulaire de connexion
  - Gestion des erreurs de connexion

#### Services
- **AuthService** (`auth/services/auth.ts`)
  - Gestion de l'état d'authentification avec BehaviorSubject
  - Méthodes : `login()`, `logout()`, `changePassword()`
  - Vérification des rôles : `isAdmin()`, `isEmployee()`
  - Persistance du token et utilisateur dans localStorage

#### Guards
- **authGuard** : Protection des routes authentifiées
- **adminGuard** : Protection des routes administrateur
- **guestGuard** : Redirection des utilisateurs connectés

#### Modèles
- `User` : Informations utilisateur
- `LoginRequest/Response` : Données de connexion
- `ChangePasswordRequest` : Changement de mot de passe
- `AuthState` : État d'authentification
- `TokenPayload` : Contenu du JWT

#### Routes
- `/auth/login` → LoginComponent

### 3. Module Dashboard (`src/app/dashboard/`)
**Responsabilité :** Tableau de bord et statistiques

#### Composants
- **DashboardComponent** (`dashboard/components/dashboard/`)
  - Page d'accueil avec statistiques
  - Vue d'ensemble des données

#### Services
- **DashboardService** (`dashboard/services/dashboard.ts`)
  - Récupération des statistiques globales
  - Données pour les graphiques et métriques

#### Routes
- `/dashboard` → DashboardComponent (route par défaut)

### 4. Module Employees (`src/app/employees/`)
**Responsabilité :** Gestion des employés

#### Composants
- **EmployeeListComponent** (`employees/components/employee-list/`)
  - Liste des employés avec filtres
  - Actions CRUD sur les employés

#### Services
- **EmployeeService** (`employees/services/employee.ts`)
  - CRUD employés via API
  - Filtrage et recherche

#### Modèles
- `Employee` : Données employé complètes
- `EmployeeFilter` : Critères de filtrage
- `EmployeeCreateRequest` : Création d'employé
- `EmployeeUpdateRequest` : Modification d'employé

#### Routes
- `/employees` → EmployeeListComponent

### 5. Module Factures (`src/app/factures/`)
**Responsabilité :** Gestion des factures

#### Services
- **FactureService** (`factures/services/facture.ts`)
  - CRUD factures
  - Calculs automatiques (HT/TTC)

#### Modèles
- `Facture` : Données facture complètes
- `FactureFilter` : Filtres de recherche
- `FactureCreateRequest/UpdateRequest` : Opérations CRUD
- `FactureStats` : Statistiques des factures

#### Routes
- `/factures` → Module factures

### 6. Module Congés (`src/app/conges/`)
**Responsabilité :** Gestion des congés

#### Services
- **CongeService** (`conges/services/conge.ts`)
  - Demandes de congés
  - Approbation/refus par RH

#### Modèles
- `Conge` : Données congé avec employé
- `CongeFilter` : Filtres par type, statut, dates
- `CongeCreateRequest/UpdateRequest` : Gestion des demandes
- `CongeStats` : Statistiques des congés

#### Routes
- `/conges` → Module congés

### 7. Module Fichiers (`src/app/fichiers/`)
**Responsabilité :** Gestion des documents

#### Services
- **FichierService** (`fichiers/services/fichier.ts`)
  - Upload et téléchargement de fichiers
  - Gestion des catégories et permissions

#### Modèles
- `Fichier` : Métadonnées des fichiers
- `FichierFilter` : Filtres par catégorie, employé
- `FichierUploadRequest` : Upload avec métadonnées
- `FichierUpdateRequest` : Modification des métadonnées
- `FichierStats` : Statistiques de stockage

#### Routes
- `/fichiers` → Module fichiers

### 8. Module Pointage (`src/app/pointage/`)
**Responsabilité :** Gestion des présences

#### Services
- **PointageService** (`pointage/services/pointage.ts`)
  - Enregistrement des présences
  - Calcul des heures travaillées
  - Rapports de présence

#### Modèles
- `Pointage` : Données de présence
- `PointageFilter` : Filtres par période, employé
- `PointageCreateRequest/UpdateRequest` : Gestion des pointages
- `PointageStats` : Statistiques de présence
- `PointageRapport` : Rapport détaillé par employé

#### Routes
- `/pointage` → Module pointage

### 9. Module Shared (`src/app/shared/`)
**Responsabilité :** Composants, pipes et directives réutilisables

#### Structure
- `components/` : Composants UI réutilisables
- `pipes/` : Pipes personnalisés
- `directives/` : Directives personnalisées

## Configuration des Routes

### Routes Principales (`app.routes.ts`)
```typescript
- '/' → redirect vers '/dashboard'
- '/auth' → AuthModule (lazy loading)
- '/dashboard' → DashboardModule (lazy loading)
- '/employees' → EmployeesModule (lazy loading)
- '/factures' → FacturesModule (lazy loading)
- '/conges' → CongesModule (lazy loading)
- '/fichiers' → FichiersModule (lazy loading)
- '/pointage' → PointageModule (lazy loading)
- '/**' → redirect vers '/dashboard'
```

### Protection des Routes
- **authGuard** : Appliqué sur toutes les routes sauf `/auth`
- **adminGuard** : Pour les fonctionnalités administrateur
- **guestGuard** : Sur `/auth` pour rediriger les utilisateurs connectés

## Configuration de l'Environnement

### Development (`environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

### Production (`environments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'
};
```

## Fonctionnalités Implémentées

### 🔐 Authentification
- [x] Service d'authentification complet
- [x] Guards de protection des routes
- [x] Gestion des rôles (admin/employee)
- [x] Persistance de session
- [x] Changement de mot de passe

### 🌐 Communication API
- [x] Service HTTP centralisé
- [x] Gestion automatique des tokens
- [x] Support des uploads de fichiers
- [x] Gestion des erreurs
- [x] Paramètres de requête automatiques

### 📊 Modèles de Données
- [x] Interfaces TypeScript complètes
- [x] Modèles pour tous les modules
- [x] Types de requêtes CRUD
- [x] Interfaces de filtrage
- [x] Modèles de statistiques

### 🎯 Architecture Modulaire
- [x] Séparation claire des responsabilités
- [x] Lazy loading des modules
- [x] Structure évolutive
- [x] Réutilisabilité des composants

## Prochaines Étapes

1. **Implémentation des Composants**
   - Formulaires de création/édition
   - Tableaux avec pagination
   - Composants de statistiques

2. **Intégration UI/UX**
   - Design system cohérent
   - Composants Material ou Bootstrap
   - Responsive design

3. **Fonctionnalités Avancées**
   - Notifications en temps réel
   - Export de données
   - Graphiques et tableaux de bord

4. **Tests et Qualité**
   - Tests unitaires
   - Tests d'intégration
   - Linting et formatage

## Avantages de cette Architecture

- **Maintenabilité** : Code organisé et modulaire
- **Évolutivité** : Ajout facile de nouvelles fonctionnalités
- **Performance** : Lazy loading des modules
- **Sécurité** : Guards et gestion des permissions
- **Réutilisabilité** : Services et composants partagés
- **Type Safety** : Interfaces TypeScript complètes