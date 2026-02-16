# Pulse Academy - Plateforme de Gestion de Formations en Ligne

![Pulse Academy Dashboard]

**Pulse Academy** est une application web complète de gestion de centre de formation en ligne développée avec **Angular** (frontend) et **Node.js/Express/MongoDB** (backend).  
Elle permet aux administrateurs de gérer les formations, les utilisateurs (apprenants & formateurs), les inscriptions, les messages de contact, les avis clients, et offre une interface publique pour les visiteurs.

## Fonctionnalités principales

### Espace Administrateur
- Tableau de bord avec statistiques avancées (nombre d'étudiants, formateurs actifs, inscriptions mensuelles, top formations…)
- Gestion complète des **formations** : création, modification, suppression, planning, gestion des inscriptions
- Gestion des **utilisateurs** : ajout, modification, suppression (apprenants, formateurs, admins)
- Gestion des **messages de contact** entrants
- Modération et affichage des **avis clients**
- Visualisation et gestion des inscriptions avec statuts (en attente, confirmé, payé, refusé)

### Espace Public / Apprenant
- Page d'accueil avec liste des formations mises en avant
- Affichage des formateurs
- Section avis clients avec possibilité de laisser un avis (pour les apprenants connectés)
- Formulaire d'inscription avec réduction (ex: -20 %)

### Authentification & Sécurité
- Inscription / Connexion
- JWT (JSON Web Token) pour l'authentification
- Rôles : admin, formateur, apprenant
- Protection des routes admin via guards Angular

## Technologies utilisées

### Frontend
- Angular 17+ (standalone components)
- Tailwind CSS + Bootstrap (pour les modals et composants)
- Font Awesome (icônes)
- Chart.js (graphiques du dashboard)
- Reactive Forms & Template-driven Forms
- RxJS (gestion des appels HTTP)
- Angular Material (optionnel – peut être ajouté)

### Backend
- Node.js + Express
- MongoDB (via Mongoose)
- JWT pour l'authentification
- Multer pour l'upload d'images
- Bcrypt pour le hashage des mots de passe

### Autres outils
- Git
- npm / yarn
- Bootstrap 5 / Tailwind pour le style
- Animate.css (animations)

## Prérequis

- Node.js ≥ 18
- npm ≥ 9 ou yarn
- MongoDB (local ou Atlas)
- Compte pour tester l'upload d'images (dossier `Uploads/`)

## Installation

1. **Cloner le repository**

```bash
git clone https://github.com/hanyne/pulse-academy.git
cd pulse-academy