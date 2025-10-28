# Application de Gestion d'Équipes

Application web complète pour gérer des utilisateurs, équipes, réunions, tâches et décisions avec un système de droits d'accès par équipe.

## Fonctionnalités

- **Authentification JWT** : Connexion sécurisée avec tokens JWT
- **Gestion des utilisateurs** : Création et gestion des comptes utilisateurs
- **Gestion des équipes** : Organisation des utilisateurs en équipes
- **Gestion des réunions** : Planification et suivi des réunions d'équipe
- **Gestion des tâches** : Création, assignation et suivi des tâches (statut, priorité, échéance)
- **Gestion des décisions** : Enregistrement des décisions prises en réunion
- **Droits d'accès** :
  - **Membres** : Accès uniquement aux éléments de leur équipe
  - **Direction** : Accès complet à toutes les équipes et tous les éléments

## Stack Technique

### Backend
- **Node.js** avec **Express**
- **Prisma ORM** pour la gestion de la base de données
- **SQLite** (peut être migré vers PostgreSQL/MySQL)
- **JWT** pour l'authentification
- **bcryptjs** pour le hachage des mots de passe

### Frontend
- **React** 18
- **React Router** pour la navigation
- **Axios** pour les appels API
- **CSS** moderne et responsive

## Structure du Projet

```
/
├── backend/
│   ├── controllers/       # Logique métier
│   ├── middleware/        # Middleware d'authentification
│   ├── routes/           # Routes API
│   ├── prisma/           # Schéma et migrations de la base de données
│   ├── server.js         # Point d'entrée du serveur
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/   # Composants React
    │   ├── contexts/     # Context API (Auth)
    │   ├── services/     # Services API
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation du Backend

```bash
cd backend
npm install

# Générer le client Prisma
npx prisma generate

# Créer la base de données et exécuter les migrations
npx prisma migrate dev --name init

# Peupler la base de données avec des données de test
node prisma/seed.js
```

### Installation du Frontend

```bash
cd frontend
npm install
```

## Démarrage de l'Application

### Démarrer le Backend (Port 3001)

```bash
cd backend
npm start
```

Le serveur backend sera accessible sur `http://localhost:3001`

### Démarrer le Frontend (Port 3000)

```bash
cd frontend
npm start
```

L'application frontend sera accessible sur `http://localhost:3000`

## Comptes de Test

Après avoir exécuté le script de seed, vous pouvez vous connecter avec :

### Direction (accès complet)
- **Email** : direction@example.com
- **Mot de passe** : password123

### Équipe Développement
- **Email** : alice@example.com
- **Mot de passe** : password123
- **Email** : bob@example.com
- **Mot de passe** : password123

### Équipe Marketing
- **Email** : charlie@example.com
- **Mot de passe** : password123

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription d'un utilisateur
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur (protégé)

### Équipes
- `GET /api/teams` - Liste des équipes (filtrée selon les droits)
- `GET /api/teams/:id` - Détails d'une équipe
- `POST /api/teams` - Créer une équipe (direction uniquement)
- `PUT /api/teams/:id` - Modifier une équipe (direction uniquement)
- `DELETE /api/teams/:id` - Supprimer une équipe (direction uniquement)

### Réunions
- `GET /api/meetings` - Liste des réunions (filtrée par équipe)
- `GET /api/meetings/:id` - Détails d'une réunion
- `POST /api/meetings` - Créer une réunion
- `PUT /api/meetings/:id` - Modifier une réunion
- `DELETE /api/meetings/:id` - Supprimer une réunion

### Tâches
- `GET /api/tasks` - Liste des tâches (filtrée par équipe)
- `GET /api/tasks/:id` - Détails d'une tâche
- `POST /api/tasks` - Créer une tâche
- `PUT /api/tasks/:id` - Modifier une tâche
- `DELETE /api/tasks/:id` - Supprimer une tâche

### Décisions
- `GET /api/decisions` - Liste des décisions (filtrée par équipe)
- `GET /api/decisions/:id` - Détails d'une décision
- `POST /api/decisions` - Créer une décision
- `PUT /api/decisions/:id` - Modifier une décision
- `DELETE /api/decisions/:id` - Supprimer une décision

## Système de Droits d'Accès

### Membres d'Équipe
- Peuvent voir uniquement les éléments de leur équipe
- Peuvent créer des réunions, tâches et décisions pour leur équipe
- Peuvent modifier et supprimer leurs éléments

### Direction
- Accès complet à toutes les équipes
- Peuvent créer, modifier et supprimer des équipes
- Peuvent voir tous les éléments de toutes les équipes
- Peuvent créer des éléments pour n'importe quelle équipe

## Modèle de Données

### User
- id, email, password, firstName, lastName, role (MEMBRE/DIRECTION), teamId

### Team
- id, name, description

### Meeting
- id, title, description, date, teamId

### Task
- id, title, description, status (TODO/IN_PROGRESS/DONE/CANCELLED), priority (LOW/MEDIUM/HIGH/URGENT), dueDate, teamId, assignedToId

### Decision
- id, title, description, date, teamId, meetingId (optionnel)

## Configuration

### Variables d'Environnement (backend/.env)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="votre_secret_jwt_super_securise_a_changer_en_production"
PORT=3001
```

⚠️ **Important** : Changez le `JWT_SECRET` en production !

## Commandes Utiles

### Backend

```bash
# Développement avec rechargement automatique
npm run dev

# Générer le client Prisma après modification du schéma
npm run prisma:generate

# Créer une nouvelle migration
npm run prisma:migrate

# Ouvrir Prisma Studio (interface graphique pour la BDD)
npm run prisma:studio
```

### Frontend

```bash
# Mode développement
npm start

# Build de production
npm run build
```

## Sécurité

- Mots de passe hachés avec bcryptjs
- Authentification JWT avec expiration de 24h
- Validation des droits d'accès sur toutes les routes
- Filtrage automatique des données selon l'équipe
- Protection CORS configurée

## Migration vers PostgreSQL/MySQL

Pour utiliser PostgreSQL ou MySQL au lieu de SQLite, modifiez le fichier `backend/prisma/schema.prisma` :

```prisma
datasource db {
  provider = "postgresql"  // ou "mysql"
  url      = env("DATABASE_URL")
}
```

Et mettez à jour la variable `DATABASE_URL` dans le fichier `.env` :

```env
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
```

Puis exécutez les migrations :

```bash
npx prisma migrate dev
```

## Améliorations Possibles

- Notifications en temps réel (WebSocket)
- Upload de fichiers pour les réunions et décisions
- Système de commentaires
- Historique des modifications
- Export de rapports (PDF, Excel)
- Calendrier interactif pour les réunions
- Tableau Kanban pour les tâches
- Recherche avancée et filtres
- Mode sombre
- Internationalisation (i18n)

## Licence

MIT
