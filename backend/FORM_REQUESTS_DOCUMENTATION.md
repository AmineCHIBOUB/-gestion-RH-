# Documentation des Form Requests - Système de Validation Centralisé

## Vue d'ensemble

Ce document présente l'implémentation complète des Form Requests dans l'application de gestion d'entreprise. Les Form Requests centralisent la validation des données, l'autorisation d'accès et la gestion des erreurs pour toutes les opérations CRUD.

## Structure des Form Requests

### Répertoire
```
app/Http/Requests/
├── StoreEmployeRequest.php
├── UpdateEmployeRequest.php
├── StoreFactureRequest.php
├── UpdateFactureRequest.php
├── StoreCongeRequest.php
├── UpdateCongeRequest.php
├── StorePointageRequest.php
├── UpdatePointageRequest.php
├── StoreFichierRequest.php
├── UpdateFichierRequest.php
└── ChangePasswordRequest.php
```

## Fonctionnalités Implémentées

### 1. Validation des Données

#### Règles de Validation Communes
- **Champs obligatoires** : Validation de la présence des données essentielles
- **Types de données** : Vérification des formats (email, date, numérique, etc.)
- **Longueurs** : Contrôle des tailles minimales et maximales
- **Unicité** : Vérification des doublons (email, numéro de sécurité sociale, etc.)
- **Relations** : Validation de l'existence des entités liées

#### Validations Métier Spécifiques

**Employés :**
- Validation du format email
- Unicité de l'email et du numéro de sécurité sociale
- Validation des salaires (montants positifs)
- Contrôle des dates d'embauche

**Factures :**
- Calcul automatique du montant TTC
- Validation des taux de TVA
- Contrôle des dates (émission, échéance)
- Validation des statuts de facture

**Congés :**
- Validation des périodes (date fin > date début)
- Calcul automatique du nombre de jours
- Contrôle des chevauchements avec d'autres congés
- Limites de durée par type de congé (25 jours pour congés payés, 5 jours pour RTT)

**Pointages :**
- Validation des heures de travail (max 12h/jour)
- Contrôle des heures d'ouverture (6h-22h entrée, 6h-23h sortie)
- Validation des pauses (max 2h)
- Prévention des doublons par date
- Calcul automatique des heures travaillées

**Fichiers :**
- Validation des types MIME autorisés
- Contrôle des tailles de fichier par type
- Validation des associations (employé/facture)
- Gestion des métadonnées de fichier

### 2. Système d'Autorisation

#### Niveaux d'Accès
- **Admin** : Accès complet à toutes les opérations
- **RH** : Accès aux données employés, congés, pointages
- **Employé** : Accès limité à ses propres données

#### Règles d'Autorisation
- Les employés ne peuvent modifier que leurs propres données
- Seuls admin/RH peuvent créer/modifier d'autres employés
- Les congés peuvent être modifiés par l'employé seulement s'ils sont "en_attente"
- Les pointages ne peuvent être modifiés que le jour même par l'employé

### 3. Gestion des Erreurs

#### Réponses JSON Standardisées
```json
{
    "message": "Description de l'erreur",
    "errors": {
        "field_name": ["Message d'erreur spécifique"]
    },
    "status": "error"
}
```

#### Types d'Erreurs Gérées
- **422 Unprocessable Entity** : Erreurs de validation
- **403 Forbidden** : Erreurs d'autorisation
- **404 Not Found** : Ressource non trouvée
- **500 Internal Server Error** : Erreurs serveur

### 4. Messages d'Erreur Personnalisés

Tous les Form Requests incluent des messages d'erreur en français, adaptés au contexte métier :

```php
public function messages(): array
{
    return [
        'email.required' => 'L\'adresse email est obligatoire.',
        'email.email' => 'L\'adresse email doit être valide.',
        'email.unique' => 'Cette adresse email est déjà utilisée.',
        // ...
    ];
}
```

### 5. Méthodes Utilitaires

#### Préparation des Données
```php
protected function prepareForValidation(): void
{
    $this->merge([
        'email' => strtolower(trim($this->email)),
        'nom' => ucfirst(trim($this->nom))
    ]);
}
```

#### Données Validées avec Calculs
```php
public function validatedWithCalculations(): array
{
    $validated = $this->validated();
    $validated['montant_ttc'] = $validated['montant_ht'] * (1 + $validated['taux_tva'] / 100);
    return $validated;
}
```

## Contrôleurs Mis à Jour

### Avant/Après Comparaison

**Avant (validation inline) :**
```php
public function store(Request $request)
{
    $request->validate([
        'nom' => 'required|string|max:255',
        'email' => 'required|email|unique:users',
        // ... autres règles
    ]);
    
    // Logique de création
}
```

**Après (Form Request) :**
```php
public function store(StoreEmployeRequest $request)
{
    try {
        $validatedData = $request->validatedWithCalculations();
        $employe = Employe::create($validatedData);
        // ...
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Erreur lors de la création.',
            'error' => 'Une erreur interne s\'est produite.',
            'status' => 'error'
        ], 500);
    }
}
```

### Contrôleurs Modifiés
- **EmployeController** : `store()` et `update()`
- **FactureController** : `store()` et `update()`
- **CongeController** : `store()` et `update()`
- **PointageController** : `store()` et `update()`
- **FichierController** : `store()` et `update()`
- **AuthController** : `changePassword()`

## Avantages de l'Implémentation

### 1. Centralisation
- Toute la logique de validation est centralisée dans des classes dédiées
- Réutilisabilité des règles de validation
- Maintenance simplifiée

### 2. Sécurité Renforcée
- Validation stricte des données d'entrée
- Contrôle d'autorisation intégré
- Protection contre les injections et manipulations

### 3. Expérience Utilisateur
- Messages d'erreur clairs et en français
- Validation côté serveur robuste
- Réponses JSON cohérentes

### 4. Maintenabilité
- Code plus propre et organisé
- Séparation des responsabilités
- Tests unitaires facilités

### 5. Performance
- Validation optimisée
- Calculs automatiques intégrés
- Gestion d'erreurs efficace

## Utilisation

### Création d'un Nouvel Employé
```bash
POST /api/employes
Content-Type: application/json

{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "telephone": "0123456789",
    "adresse": "123 Rue de la Paix",
    "poste": "Développeur",
    "salaire": 45000,
    "date_embauche": "2024-01-15",
    "numero_securite_sociale": "1234567890123",
    "user_name": "jdupont",
    "user_password": "MotDePasse123!"
}
```

### Changement de Mot de Passe
```bash
POST /api/auth/change-password
Content-Type: application/json
Authorization: Bearer {token}

{
    "current_password": "AncienMotDePasse123!",
    "new_password": "NouveauMotDePasse456!",
    "new_password_confirmation": "NouveauMotDePasse456!"
}
```

## Conclusion

L'implémentation des Form Requests apporte une amélioration significative à la robustesse, la sécurité et la maintenabilité de l'application. Le système de validation centralisé garantit la cohérence des données et offre une expérience utilisateur optimale avec des messages d'erreur clairs et contextuels.

Tous les contrôleurs bénéficient désormais d'une validation standardisée, d'un contrôle d'autorisation intégré et d'une gestion d'erreurs cohérente, respectant les meilleures pratiques de développement Laravel.