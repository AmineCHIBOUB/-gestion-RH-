# Documentation des Routes API - Système de Gestion d'Entreprise

## Configuration

Le système utilise **Laravel Sanctum** pour l'authentification API. Toutes les routes protégées nécessitent un token d'authentification.

### Base URL
```
http://localhost:8000/api
```

## Routes d'Authentification

### Routes Publiques
- `POST /auth/login` - Connexion utilisateur
- `POST /auth/register` - Inscription utilisateur

### Routes Protégées (auth:sanctum)
- `POST /auth/logout` - Déconnexion
- `GET /auth/user` - Informations utilisateur connecté
- `PUT /auth/change-password` - Changer le mot de passe

## Routes des Employés

**Toutes protégées par auth:sanctum**

- `GET /employes/search` - Rechercher des employés
- `GET /employes` - Liste des employés
- `POST /employes` - Créer un employé
- `GET /employes/{id}` - Détails d'un employé
- `PUT /employes/{id}` - Modifier un employé
- `DELETE /employes/{id}` - Supprimer un employé

## Routes des Factures

**Toutes protégées par auth:sanctum**

- `GET /factures/search` - Rechercher des factures
- `PUT /factures/{id}/mark-as-paid` - Marquer comme payée
- `GET /factures` - Liste des factures
- `POST /factures` - Créer une facture
- `GET /factures/{id}` - Détails d'une facture
- `PUT /factures/{id}` - Modifier une facture
- `DELETE /factures/{id}` - Supprimer une facture

## Routes des Congés

**Toutes protégées par auth:sanctum**

- `PUT /conges/{id}/approve` - Approuver un congé
- `PUT /conges/{id}/reject` - Rejeter un congé
- `GET /conges/employee/{employeId}` - Congés d'un employé
- `GET /conges/pending` - Congés en attente
- `GET /conges` - Liste des congés
- `POST /conges` - Créer une demande de congé
- `GET /conges/{id}` - Détails d'un congé
- `PUT /conges/{id}` - Modifier un congé
- `DELETE /conges/{id}` - Supprimer un congé

## Routes des Fichiers

**Toutes protégées par auth:sanctum**

- `GET /fichiers/{id}/download` - Télécharger un fichier
- `GET /fichiers/employee/{employeId}` - Fichiers d'un employé
- `GET /fichiers/facture/{factureId}` - Fichiers d'une facture
- `GET /fichiers` - Liste des fichiers
- `POST /fichiers` - Uploader un fichier
- `GET /fichiers/{id}` - Détails d'un fichier
- `PUT /fichiers/{id}` - Modifier un fichier
- `DELETE /fichiers/{id}` - Supprimer un fichier

## Routes des Pointages

**Toutes protégées par auth:sanctum**

- `GET /pointages/employee/{employeId}` - Pointages d'un employé
- `POST /pointages/clock-in` - Pointer l'entrée
- `POST /pointages/clock-out` - Pointer la sortie
- `GET /pointages/rapport` - Rapport de pointage
- `GET /pointages` - Liste des pointages
- `POST /pointages` - Créer un pointage
- `GET /pointages/{id}` - Détails d'un pointage
- `PUT /pointages/{id}` - Modifier un pointage
- `DELETE /pointages/{id}` - Supprimer un pointage

## Routes Utilitaires

- `GET /user` - Utilisateur authentifié (protégée)
- `GET /health` - Vérification de l'état de l'API (publique)

## Authentification avec Sanctum

### 1. Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password"
}
```

### 2. Utilisation du token
Après connexion, utilisez le token retourné dans l'en-tête Authorization :

```http
Authorization: Bearer {your-token-here}
```

### 3. Exemple de requête protégée
```http
GET /api/employes
Authorization: Bearer {your-token-here}
Content-Type: application/json
```

## Codes de Réponse

- `200` - Succès
- `201` - Créé avec succès
- `401` - Non authentifié
- `403` - Non autorisé
- `404` - Ressource non trouvée
- `422` - Erreur de validation
- `500` - Erreur serveur

## Middleware de Protection

Les routes sont protégées par le middleware `auth:sanctum` qui :
- Vérifie la présence du token d'authentification
- Valide le token
- Charge l'utilisateur associé
- Refuse l'accès si le token est invalide ou expiré