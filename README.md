# Gestion RH

Application web de gestion des ressources humaines : dossiers des employés, congés, pointage, bulletins de paie et rapports, avec un espace dédié à chaque profil (administrateur, RH, employé).

## Fonctionnalités

**Espace employé**
- Consultation et modification de son profil
- Demandes de congé, suivi et solde de congés
- Pointage et feuilles de temps
- Consultation et téléchargement de ses bulletins de paie (PDF)

**Espace RH**
- Gestion des dossiers employés et des pièces jointes
- Validation ou refus des demandes de congé, calendrier des absences
- Suivi des présences et rapports (présences, congés, paie)
- Génération des bulletins de paie et export Excel

**Espace administrateur**
- Gestion des utilisateurs, des rôles et des permissions
- Départements et postes
- Paramètres généraux et paramètres de paie
- Journaux d'activité et d'audit

**Sécurité**
- Authentification par jeton (Laravel Sanctum)
- Contrôle d'accès par rôle sur l'API : administrateur, RH, employé
- Un employé ne peut modifier ou annuler que ses propres demandes de congé

## Stack technique

| Partie | Technologies |
|---|---|
| Backend | PHP 8.1, Laravel 10, API REST, Laravel Sanctum, DomPDF, Laravel Excel |
| Frontend | Angular 20, TypeScript |
| Base de données | MySQL |

## Structure

```
backend/    API Laravel
frontend/   Application Angular
```

## Installation

### Prérequis

PHP 8.1+, Composer, Node.js 20+, Angular CLI, MySQL.

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Dans `.env`, configurer la base de données MySQL (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`), puis :

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

L'API est disponible sur `http://localhost:8000/api`.

### Frontend

```bash
cd frontend
npm install
npm start
```

L'application est disponible sur `http://localhost:4200`.

## Comptes de démonstration

La commande `php artisan migrate --seed` crée trois comptes, à n'utiliser qu'en local :

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Administrateur | admin@admin.com | password123 |
| RH | rh@rh.com | password123 |
| Employé | employe@employe.com | password123 |

## Auteur

Amine CHIBOUB · [LinkedIn](https://www.linkedin.com/in/mohamed-amine-chiboub/) · [GitHub](https://github.com/AmineCHIBOUB)
