# Documentation Complète des Routes API

## Vue d'ensemble
Cette API REST fournit tous les endpoints nécessaires pour la gestion d'entreprise, incluant l'authentification, la gestion des employés, factures, congés, pointages et fichiers.

**Base URL:** `http://localhost:8000/api`

---

## 🔐 Authentification

### Routes Publiques
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/login` | Connexion utilisateur |
| POST | `/auth/register` | Inscription utilisateur |
| POST | `/check-email` | Vérifier disponibilité email |

### Routes Authentifiées
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/logout` | Déconnexion |
| GET | `/auth/user` | Utilisateur connecté |
| PUT | `/auth/change-password` | Changer mot de passe |
| GET | `/auth/permissions` | Permissions utilisateur |
| GET | `/auth/is-manager` | Vérifier si manager |
| GET | `/auth/has-role/{role}` | Vérifier rôle spécifique |

---

## 👥 Gestion des Employés

### Routes Admin Uniquement
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/employes` | Créer un employé |
| PUT | `/employes/{id}` | Modifier un employé |
| DELETE | `/employes/{id}` | Supprimer un employé |
| GET | `/employes/create` | Données pour formulaire |
| GET | `/employes/statistics` | Statistiques employés |
| POST | `/employes/bulk-action` | Actions en lot |

### Routes Admin + RH
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/employes` | Liste des employés |
| GET | `/employes/search` | Rechercher employés |
| GET | `/employes/{id}` | Détails employé |
| GET | `/employes/{id}/profile` | Profil détaillé |
| GET | `/employes/{id}/history` | Historique employé |

### Routes Personnelles
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/profile` | Mon profil |
| PUT | `/profile` | Modifier mon profil |

---

## 🧾 Gestion des Factures

### Routes Admin Uniquement
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/factures` | Liste des factures |
| POST | `/factures` | Créer une facture |
| GET | `/factures/{id}` | Détails facture |
| PUT | `/factures/{id}` | Modifier facture |
| DELETE | `/factures/{id}` | Supprimer facture |
| GET | `/factures/create` | Données pour formulaire |
| GET | `/factures/search` | Rechercher factures |
| PUT | `/factures/{id}/mark-as-paid` | Marquer comme payée |
| PUT | `/factures/{id}/mark-as-overdue` | Marquer en retard |
| GET | `/factures/statistics` | Statistiques factures |
| POST | `/factures/bulk-action` | Actions en lot |
| GET | `/factures/export` | Export PDF/Excel |

---

## 🏖️ Gestion des Congés

### Routes Admin + RH
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/conges` | Liste des congés |
| GET | `/conges/pending` | Congés en attente |
| GET | `/conges/approved` | Congés approuvés |
| GET | `/conges/rejected` | Congés rejetés |
| GET | `/conges/statistics` | Statistiques congés |
| PUT | `/conges/{id}/approve` | Approuver congé |
| PUT | `/conges/{id}/reject` | Rejeter congé |
| GET | `/conges/{id}` | Détails congé |
| GET | `/conges/calendar` | Vue calendrier |

### Routes Personnelles
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/conges` | Demander un congé |
| PUT | `/conges/{id}` | Modifier ma demande |
| DELETE | `/conges/{id}` | Supprimer ma demande |
| GET | `/conges/employee/{id}` | Congés d'un employé |
| GET | `/conges/my-conges` | Mes congés |
| GET | `/conges/my-balance` | Mon solde de congés |

---

## ⏰ Gestion des Pointages

### Routes Admin + RH
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/pointages` | Liste des pointages |
| GET | `/pointages/rapport` | Rapport pointages |
| GET | `/pointages/statistics` | Statistiques |
| GET | `/pointages/{id}` | Détails pointage |
| GET | `/pointages/export` | Export rapports |
| GET | `/pointages/daily-report` | Rapport journalier |
| GET | `/pointages/monthly-report` | Rapport mensuel |

### Routes Personnelles
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/pointages/clock-in` | Pointer l'arrivée |
| POST | `/pointages/clock-out` | Pointer la sortie |
| GET | `/pointages/current-status` | Statut actuel |
| GET | `/pointages/employee/{id}` | Pointages d'un employé |
| GET | `/pointages/my-pointages` | Mes pointages |
| POST | `/pointages` | Créer pointage |
| PUT | `/pointages/{id}` | Modifier pointage |
| DELETE | `/pointages/{id}` | Supprimer pointage |

---

## 📁 Gestion des Fichiers

### Routes Admin + RH
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/fichiers` | Liste des fichiers |
| GET | `/fichiers/{id}` | Détails fichier |
| GET | `/fichiers/employee/{id}` | Fichiers d'un employé |
| GET | `/fichiers/facture/{id}` | Fichiers d'une facture |
| GET | `/fichiers/search` | Rechercher fichiers |

### Routes Authentifiées
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/fichiers` | Uploader un fichier |
| PUT | `/fichiers/{id}` | Modifier fichier |
| DELETE | `/fichiers/{id}` | Supprimer fichier |
| GET | `/fichiers/{id}/download` | Télécharger fichier |
| POST | `/fichiers/upload` | Upload multiple |
| GET | `/fichiers/my-files` | Mes fichiers |

---

## 📊 Dashboard et Statistiques

### Routes Admin
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/dashboard/admin-stats` | Stats admin |
| GET | `/users` | Gestion utilisateurs |
| PUT | `/users/{id}/role` | Changer rôle |

### Routes RH
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/dashboard/rh-stats` | Stats RH |

### Routes Générales
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/dashboard/stats` | Stats générales |
| GET | `/notifications` | Notifications |
| PUT | `/notifications/{id}/read` | Marquer comme lu |

---

## 🌐 Routes Publiques

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/test` | Test CORS |
| GET | `/health` | Santé de l'API |
| GET | `/company-info` | Infos entreprise |
| POST | `/check-email` | Vérifier email |

---

## 🔒 Middleware et Permissions

### Middleware Utilisés
- `auth:sanctum` : Authentification requise
- `admin` : Accès administrateur uniquement
- `rh` : Accès admin + RH
- `owner.or.manager` : Propriétaire ou manager

### Rôles Disponibles
- **admin** : Accès complet
- **rh** : Gestion RH + consultation
- **manager** : Gestion équipe
- **employe** : Accès personnel

---

## 📝 Format des Réponses

### Réponse Standard
```json
{
  "data": {},
  "message": "Opération réussie",
  "status": "success"
}
```

### Réponse Paginée
```json
{
  "data": [],
  "current_page": 1,
  "last_page": 5,
  "per_page": 15,
  "total": 75
}
```

### Réponse d'Erreur
```json
{
  "message": "Erreur de validation",
  "errors": {
    "field": ["Message d'erreur"]
  },
  "status": "error"
}
```

---

## 🚀 Exemples d'Utilisation

### Authentification
```javascript
// Connexion
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password"
}

// Utilisation du token
Headers: {
  "Authorization": "Bearer YOUR_TOKEN",
  "Accept": "application/json",
  "Content-Type": "application/json"
}
```

### Création d'un Employé
```javascript
POST /api/employes
{
  "user_name": "Jean Dupont",
  "email": "jean@example.com",
  "user_password": "password123",
  "prenom": "Jean",
  "nom": "Dupont",
  "poste": "Développeur",
  "salaire": 45000,
  "date_embauche": "2024-01-15",
  "statut": "actif"
}
```

### Pointage
```javascript
// Pointer l'arrivée
POST /api/pointages/clock-in
{
  "employe_id": 1
}

// Pointer la sortie
POST /api/pointages/clock-out
{
  "employe_id": 1
}
```

Cette API complète permet de gérer tous les aspects d'une entreprise avec des permissions appropriées et une sécurité renforcée.