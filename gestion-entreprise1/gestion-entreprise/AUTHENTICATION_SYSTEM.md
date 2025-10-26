# Système d'Authentification et Gestion des Rôles

## Vue d'ensemble

Ce système implémente une authentification basée sur des API tokens avec Laravel Sanctum, incluant une gestion granulaire des rôles et permissions.

## Rôles Disponibles

### 1. **Admin** (`admin`)
- **Permissions complètes** sur tout le système
- Peut créer, modifier et supprimer des employés
- Gestion complète des factures
- Accès à tous les rapports et données

### 2. **RH** (`rh`)
- **Consultation** des employés (lecture seule)
- **Gestion des congés** (approbation/rejet)
- **Consultation** des pointages et génération de rapports
- **Consultation** des fichiers
- Accès aux données de tous les employés

### 3. **Employé** (`employe`)
- **Accès limité** à ses propres données uniquement
- Peut gérer ses propres congés
- Peut pointer ses heures de travail
- Peut uploader et gérer ses fichiers

## Architecture des Middlewares

### Middlewares Créés

1. **`AdminMiddleware`** (`admin`)
   - Vérifie que l'utilisateur a le rôle `admin`
   - Utilisé pour les opérations critiques

2. **`RhMiddleware`** (`rh`)
   - Autorise les rôles `admin` et `rh`
   - Utilisé pour les fonctions de gestion RH

3. **`OwnerOrManagerMiddleware`** (`owner.or.manager`)
   - Autorise les `admin` et `rh` pour tout
   - Autorise les `employe` pour leurs propres données uniquement
   - Vérifie la propriété des ressources

## Structure des Routes API

### Routes d'Authentification
```
POST /api/auth/login          # Connexion (public)
POST /api/auth/register       # Inscription (public)
POST /api/auth/logout         # Déconnexion (auth:sanctum)
GET  /api/auth/user           # Infos utilisateur (auth:sanctum)
PUT  /api/auth/change-password # Changer mot de passe (auth:sanctum)
GET  /api/auth/permissions    # Permissions utilisateur (auth:sanctum)
GET  /api/auth/is-manager     # Vérifier si manager (auth:sanctum)
GET  /api/auth/has-role/{role} # Vérifier rôle spécifique (auth:sanctum)
```

### Routes Protégées par Rôle

#### **Admin uniquement**
- `POST /api/employes` - Créer employé
- `PUT /api/employes/{id}` - Modifier employé
- `DELETE /api/employes/{id}` - Supprimer employé
- Toutes les routes `/api/factures/*` - Gestion factures

#### **Admin + RH**
- `GET /api/employes` - Liste employés
- `GET /api/employes/search` - Recherche employés
- `GET /api/employes/{id}` - Détails employé
- `PUT /api/conges/{id}/approve` - Approuver congé
- `PUT /api/conges/{id}/reject` - Rejeter congé
- `GET /api/conges/pending` - Congés en attente
- `GET /api/pointages` - Liste pointages
- `GET /api/pointages/rapport` - Rapports pointages

#### **Tous (avec vérification propriétaire)**
- Routes de gestion des congés personnels
- Routes de pointage personnel
- Routes de gestion des fichiers personnels

## Utilisation

### 1. Authentification

```javascript
// Connexion
POST /api/auth/login
{
  "email": "admin@entreprise.com",
  "password": "password123"
}

// Réponse
{
  "message": "Connexion réussie",
  "user": {
    "id": 1,
    "name": "Administrateur",
    "email": "admin@entreprise.com",
    "role": "admin"
  },
  "token": "1|abc123..."
}
```

### 2. Utilisation du Token

```javascript
// Headers pour toutes les requêtes authentifiées
Headers: {
  "Authorization": "Bearer 1|abc123...",
  "Accept": "application/json",
  "Content-Type": "application/json"
}
```

### 3. Vérification des Permissions

```javascript
// Obtenir les permissions de l'utilisateur
GET /api/auth/permissions

// Réponse pour un admin
{
  "role": "admin",
  "permissions": [
    "manage_employees",
    "manage_invoices",
    "manage_leaves",
    "manage_files",
    "manage_attendance",
    "view_reports",
    "approve_leaves"
  ]
}
```

## Comptes de Test

Le seeder crée automatiquement :

- **Admin** : `admin@entreprise.com` / `password123`
- **RH** : `rh@entreprise.com` / `password123`
- **Employé** : `employe@entreprise.com` / `password123`

## Sécurité

### Mesures Implémentées

1. **Authentification par Token** avec Laravel Sanctum
2. **Validation des rôles** à chaque requête
3. **Vérification de propriété** pour les données personnelles
4. **Middleware en cascade** pour une sécurité granulaire
5. **Validation des entrées** sur toutes les routes

### Codes d'Erreur

- `401` - Non authentifié
- `403` - Accès refusé (rôle insuffisant)
- `422` - Erreur de validation

## Migration et Déploiement

```bash
# Exécuter les migrations
php artisan migrate

# Exécuter les seeders
php artisan db:seed

# Ou tout en une fois
php artisan migrate:fresh --seed
```

## Extensibilité

Le système est conçu pour être facilement extensible :

1. **Nouveaux rôles** : Modifier la migration et les middlewares
2. **Nouvelles permissions** : Ajouter dans `AuthController::permissions()`
3. **Nouveaux middlewares** : Créer et enregistrer dans `Kernel.php`
4. **Routes personnalisées** : Utiliser les middlewares existants