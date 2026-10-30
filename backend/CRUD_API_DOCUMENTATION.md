# Documentation API CRUD - Système de Gestion d'Entreprise

## Vue d'ensemble

Ce document présente l'ensemble complet des routes CRUD (Create, Read, Update, Delete) disponibles pour chaque entité du système. Toutes les routes retournent des réponses formatées en JSON.

## Base URL
```
http://localhost:8000/api
```

## Authentification
Toutes les routes (sauf authentification) nécessitent un token d'authentification Laravel Sanctum dans l'en-tête :
```
Authorization: Bearer {token}
```

---

## 1. EMPLOYÉS (Employes)

### Routes CRUD complètes

| Méthode | Route | Description | Permissions |
|---------|-------|-------------|-------------|
| **GET** | `/employes` | Liste tous les employés | Admin, RH |
| **POST** | `/employes` | Créer un nouvel employé | Admin |
| **GET** | `/employes/{id}` | Afficher un employé spécifique | Admin, RH |
| **PUT** | `/employes/{id}` | Mettre à jour un employé | Admin |
| **DELETE** | `/employes/{id}` | Supprimer un employé | Admin |
| **GET** | `/employes/search` | Rechercher des employés | Admin, RH |

### Exemples de réponses JSON

**GET /employes** - Liste des employés
```json
[
  {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@entreprise.com",
    "telephone": "0123456789",
    "adresse": "123 Rue de la Paix, Paris",
    "poste": "Développeur",
    "salaire": 45000,
    "date_embauche": "2023-01-15",
    "numero_securite_sociale": "1234567890123",
    "statut": "actif",
    "user": {
      "id": 1,
      "name": "Jean Dupont",
      "email": "jean.dupont@entreprise.com",
      "role": "employe"
    }
  }
]
```

**POST /employes** - Créer un employé
```json
{
  "message": "Employé créé avec succès",
  "employe": {
    "id": 2,
    "nom": "Martin",
    "prenom": "Marie",
    "email": "marie.martin@entreprise.com",
    "poste": "Designer",
    "statut": "actif"
  }
}
```

**PUT /employes/{id}** - Mettre à jour un employé
```json
{
  "message": "Employé mis à jour avec succès",
  "employe": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "poste": "Senior Développeur",
    "salaire": 50000
  }
}
```

**DELETE /employes/{id}** - Supprimer un employé
```json
{
  "message": "Employé supprimé avec succès"
}
```

---

## 2. FACTURES (Factures)

### Routes CRUD complètes

| Méthode | Route | Description | Permissions |
|---------|-------|-------------|-------------|
| **GET** | `/factures` | Liste toutes les factures | Admin |
| **POST** | `/factures` | Créer une nouvelle facture | Admin |
| **GET** | `/factures/{id}` | Afficher une facture spécifique | Admin |
| **PUT** | `/factures/{id}` | Mettre à jour une facture | Admin |
| **DELETE** | `/factures/{id}` | Supprimer une facture | Admin |
| **GET** | `/factures/search` | Rechercher des factures | Admin |
| **PUT** | `/factures/{id}/mark-as-paid` | Marquer comme payée | Admin |

### Exemples de réponses JSON

**GET /factures** - Liste des factures
```json
[
  {
    "id": 1,
    "numero_facture": "FAC-2024-0001",
    "client_nom": "Entreprise ABC",
    "client_email": "contact@abc.com",
    "client_adresse": "456 Avenue des Champs, Lyon",
    "date_emission": "2024-01-15",
    "date_echeance": "2024-02-15",
    "montant_ht": 1000.00,
    "taux_tva": 20.00,
    "montant_ttc": 1200.00,
    "statut": "envoyee",
    "description": "Développement site web",
    "fichiers": []
  }
]
```

**POST /factures** - Créer une facture
```json
{
  "message": "Facture créée avec succès",
  "facture": {
    "id": 2,
    "numero_facture": "FAC-2024-0002",
    "client_nom": "Société XYZ",
    "montant_ttc": 2400.00,
    "statut": "brouillon"
  }
}
```

---

## 3. CONGÉS (Conges)

### Routes CRUD complètes

| Méthode | Route | Description | Permissions |
|---------|-------|-------------|-------------|
| **GET** | `/conges` | Liste tous les congés | Admin, RH |
| **POST** | `/conges` | Créer une demande de congé | Tous (avec restrictions) |
| **GET** | `/conges/{id}` | Afficher un congé spécifique | Admin, RH, Propriétaire |
| **PUT** | `/conges/{id}` | Mettre à jour un congé | Admin, RH, Propriétaire |
| **DELETE** | `/conges/{id}` | Supprimer un congé | Admin, RH, Propriétaire |
| **PUT** | `/conges/{id}/approve` | Approuver un congé | Admin, RH |
| **PUT** | `/conges/{id}/reject` | Rejeter un congé | Admin, RH |
| **GET** | `/conges/pending` | Congés en attente | Admin, RH |
| **GET** | `/conges/employee/{employeId}` | Congés d'un employé | Admin, RH, Propriétaire |

### Exemples de réponses JSON

**GET /conges** - Liste des congés
```json
[
  {
    "id": 1,
    "employe_id": 1,
    "type_conge": "conges_payes",
    "date_debut": "2024-07-01",
    "date_fin": "2024-07-15",
    "nombre_jours": 15,
    "motif": "Vacances d'été",
    "statut": "en_attente",
    "employe": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean"
    },
    "approbateur": null
  }
]
```

**POST /conges** - Créer une demande de congé
```json
{
  "message": "Demande de congé créée avec succès",
  "conge": {
    "id": 2,
    "type_conge": "maladie",
    "date_debut": "2024-08-01",
    "date_fin": "2024-08-03",
    "nombre_jours": 3,
    "statut": "en_attente"
  }
}
```

---

## 4. POINTAGES (Pointages)

### Routes CRUD complètes

| Méthode | Route | Description | Permissions |
|---------|-------|-------------|-------------|
| **GET** | `/pointages` | Liste tous les pointages | Admin, RH |
| **POST** | `/pointages` | Créer un pointage | Tous (avec restrictions) |
| **GET** | `/pointages/{id}` | Afficher un pointage spécifique | Admin, RH, Propriétaire |
| **PUT** | `/pointages/{id}` | Mettre à jour un pointage | Admin, RH, Propriétaire |
| **DELETE** | `/pointages/{id}` | Supprimer un pointage | Admin, RH, Propriétaire |
| **POST** | `/pointages/clock-in` | Pointer l'arrivée | Tous |
| **POST** | `/pointages/clock-out` | Pointer la sortie | Tous |
| **GET** | `/pointages/employee/{employeId}` | Pointages d'un employé | Admin, RH, Propriétaire |
| **GET** | `/pointages/rapport` | Rapport de pointages | Admin, RH |

### Exemples de réponses JSON

**GET /pointages** - Liste des pointages
```json
{
  "data": [
    {
      "id": 1,
      "employe_id": 1,
      "date_pointage": "2024-07-30",
      "heure_entree": "08:00",
      "heure_sortie": "17:00",
      "pause_debut": "12:00",
      "pause_fin": "13:00",
      "heures_travaillees": 8.0,
      "statut": "present",
      "commentaire": null,
      "employe": {
        "id": 1,
        "nom": "Dupont",
        "prenom": "Jean"
      }
    }
  ],
  "current_page": 1,
  "total": 1
}
```

**POST /pointages/clock-in** - Pointer l'arrivée
```json
{
  "message": "Pointage d'arrivée enregistré avec succès",
  "pointage": {
    "id": 2,
    "date_pointage": "2024-07-31",
    "heure_entree": "08:15",
    "statut": "present"
  }
}
```

---

## 5. FICHIERS (Fichiers)

### Routes CRUD complètes

| Méthode | Route | Description | Permissions |
|---------|-------|-------------|-------------|
| **GET** | `/fichiers` | Liste tous les fichiers | Tous authentifiés |
| **POST** | `/fichiers` | Uploader un fichier | Tous authentifiés |
| **GET** | `/fichiers/{id}` | Afficher un fichier spécifique | Tous authentifiés |
| **PUT** | `/fichiers/{id}` | Mettre à jour un fichier | Tous authentifiés |
| **DELETE** | `/fichiers/{id}` | Supprimer un fichier | Tous authentifiés |
| **GET** | `/fichiers/{id}/download` | Télécharger un fichier | Tous authentifiés |
| **GET** | `/fichiers/employee/{employeId}` | Fichiers d'un employé | Admin, RH, Propriétaire |
| **GET** | `/fichiers/facture/{factureId}` | Fichiers d'une facture | Admin, RH |

### Exemples de réponses JSON

**GET /fichiers** - Liste des fichiers
```json
[
  {
    "id": 1,
    "nom_original": "contrat_jean_dupont.pdf",
    "nom_stockage": "1690789234_contrat_jean_dupont.pdf",
    "chemin": "fichiers/1690789234_contrat_jean_dupont.pdf",
    "taille": 245760,
    "type_mime": "application/pdf",
    "description": "Contrat de travail",
    "employe_id": 1,
    "facture_id": null,
    "uploaded_by": 1,
    "employe": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean"
    },
    "uploadedBy": {
      "id": 1,
      "name": "Admin"
    }
  }
]
```

**POST /fichiers** - Uploader un fichier
```json
{
  "message": "Fichier uploadé avec succès",
  "fichier": {
    "id": 2,
    "nom_original": "facture_abc.pdf",
    "taille": 156789,
    "type_mime": "application/pdf",
    "description": "Facture client ABC"
  }
}
```

---

## Codes de statut HTTP

| Code | Description |
|------|-------------|
| **200** | Succès - Opération réussie |
| **201** | Créé - Ressource créée avec succès |
| **400** | Requête incorrecte - Données invalides |
| **401** | Non autorisé - Token manquant ou invalide |
| **403** | Interdit - Permissions insuffisantes |
| **404** | Non trouvé - Ressource inexistante |
| **422** | Entité non traitable - Erreurs de validation |
| **500** | Erreur serveur interne |

## Format des erreurs

Toutes les erreurs sont retournées au format JSON :

```json
{
  "message": "Description de l'erreur",
  "errors": {
    "champ": ["Message d'erreur spécifique"]
  }
}
```

## Validation des données

Tous les endpoints POST et PUT incluent une validation complète des données avec des messages d'erreur détaillés en français.

## Pagination

Les listes importantes (comme les pointages) utilisent la pagination Laravel avec les métadonnées suivantes :

```json
{
  "data": [...],
  "current_page": 1,
  "last_page": 5,
  "per_page": 20,
  "total": 100
}
```

---

**Note** : Toutes les routes respectent les principes REST et retournent des réponses JSON formatées de manière cohérente avec des messages en français.