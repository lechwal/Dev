# Guide de Déploiement en Production

Ce guide explique comment mettre votre application en ligne sur Internet.

## 📋 Table des Matières

1. [Option 1 : Render (Recommandé - Gratuit)](#option-1--render-recommandé---gratuit)
2. [Option 2 : Railway (Gratuit avec limitations)](#option-2--railway)
3. [Option 3 : Vercel + Railway (Frontend/Backend séparés)](#option-3--vercel--railway)
4. [Option 4 : VPS Personnel (Avancé)](#option-4--vps-personnel)

---

## Option 1 : Render (Recommandé - Gratuit)

**Avantages :**
- Gratuit pour commencer
- Déploiement automatique depuis GitHub
- Base de données PostgreSQL incluse
- SSL/HTTPS automatique
- Simple à configurer

**Inconvénients :**
- Le serveur gratuit s'endort après 15 min d'inactivité (redémarre au premier accès)

### Étape 1 : Préparation du Code

#### 1.1 Migrer vers PostgreSQL (recommandé pour la production)

Modifiez `backend/prisma/schema.prisma` :

```prisma
datasource db {
  provider = "postgresql"  // Changé de sqlite à postgresql
  url      = env("DATABASE_URL")
}
```

#### 1.2 Créer un fichier `package.json` à la racine pour le build

Créez `/package.json` :

```json
{
  "name": "team-management-fullstack",
  "version": "1.0.0",
  "scripts": {
    "build": "cd backend && npm install && npx prisma generate && cd ../frontend && npm install && npm run build",
    "start": "cd backend && node server.js"
  }
}
```

#### 1.3 Modifier le backend pour servir le frontend en production

Ajoutez dans `backend/server.js` (après les routes API) :

```javascript
// En production, servir les fichiers statiques du frontend
if (process.env.NODE_ENV === 'production') {
  const path = require('path');

  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}
```

### Étape 2 : Pousser sur GitHub

```bash
git add .
git commit -m "Préparation pour le déploiement"
git push
```

### Étape 3 : Déploiement sur Render

1. **Créer un compte** sur https://render.com

2. **Créer une base de données PostgreSQL :**
   - Cliquez sur "New +" → "PostgreSQL"
   - Nom : `team-management-db`
   - Plan : Free
   - Cliquez "Create Database"
   - **Copiez** l'URL "Internal Database URL" (elle ressemble à : `postgresql://user:pass@host/db`)

3. **Créer le service Web :**
   - Cliquez sur "New +" → "Web Service"
   - Connectez votre compte GitHub
   - Sélectionnez votre dépôt
   - Configuration :
     - **Name:** `team-management-app`
     - **Region:** Choisissez le plus proche
     - **Branch:** votre branche principale
     - **Root Directory:** (laisser vide)
     - **Runtime:** Node
     - **Build Command:** `npm run build && cd backend && npx prisma migrate deploy`
     - **Start Command:** `npm start`
     - **Plan:** Free

4. **Configurer les variables d'environnement :**
   - Cliquez sur "Environment" dans le menu de gauche
   - Ajoutez :
     ```
     DATABASE_URL=<votre URL PostgreSQL copiée à l'étape 2>
     JWT_SECRET=<générez une chaîne aléatoire longue et complexe>
     NODE_ENV=production
     PORT=3001
     ```

5. **Déployer :**
   - Cliquez "Create Web Service"
   - Attendez 5-10 minutes que le déploiement se termine
   - Votre application sera accessible sur : `https://team-management-app.onrender.com`

### Étape 4 : Initialiser la Base de Données

1. Dans le tableau de bord Render, allez dans votre service
2. Cliquez sur "Shell" (dans le menu de gauche)
3. Exécutez :
   ```bash
   cd backend
   npx prisma db push
   node prisma/seed.js
   ```

**C'est terminé !** Votre application est en ligne ! 🎉

---

## Option 2 : Railway

**Avantages :**
- $5 de crédit gratuit par mois
- Très simple à utiliser
- Base de données incluse
- Déploiement automatique

**Inconvénients :**
- Nécessite une carte de crédit (même pour le plan gratuit)

### Étapes :

1. **Créer un compte** sur https://railway.app

2. **Nouveau projet :**
   - "New Project" → "Deploy from GitHub repo"
   - Sélectionnez votre dépôt

3. **Ajouter PostgreSQL :**
   - Dans votre projet, cliquez "+ New"
   - "Database" → "Add PostgreSQL"

4. **Configurer les variables :**
   - Cliquez sur votre service web
   - Onglet "Variables"
   - Ajoutez :
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=<votre secret>
     NODE_ENV=production
     ```

5. **Configuration de déploiement :**
   - "Settings" → "Build Command":
     ```
     npm run build && cd backend && npx prisma migrate deploy
     ```
   - "Start Command": `npm start`

6. **Générer un domaine :**
   - "Settings" → "Generate Domain"

---

## Option 3 : Vercel + Railway

**Pour séparer frontend et backend**

### Frontend sur Vercel :

1. Allez sur https://vercel.com
2. "New Project" → Importez votre dépôt
3. Configuration :
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

4. Variables d'environnement :
   ```
   REACT_APP_API_URL=https://votre-backend.up.railway.app
   ```

5. Déployez !

### Backend sur Railway (voir Option 2)

---

## Option 4 : VPS Personnel (Avancé)

**Pour les utilisateurs avancés avec VPS (DigitalOcean, Linode, etc.)**

### Prérequis :

- Un serveur Ubuntu 22.04
- Accès SSH
- Un nom de domaine (optionnel)

### Installation :

1. **Connexion au serveur :**
   ```bash
   ssh root@votre-ip
   ```

2. **Installation de Node.js :**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

3. **Installation de PostgreSQL :**
   ```bash
   sudo apt install postgresql postgresql-contrib
   sudo -u postgres psql
   ```

   Dans PostgreSQL :
   ```sql
   CREATE DATABASE team_management;
   CREATE USER team_user WITH ENCRYPTED PASSWORD 'votre_mot_de_passe';
   GRANT ALL PRIVILEGES ON DATABASE team_management TO team_user;
   \q
   ```

4. **Cloner le projet :**
   ```bash
   git clone https://github.com/votre-repo/team-management.git
   cd team-management
   ```

5. **Configuration :**

   Créez `backend/.env` :
   ```env
   DATABASE_URL="postgresql://team_user:votre_mot_de_passe@localhost:5432/team_management"
   JWT_SECRET="votre_secret_super_securise"
   PORT=3001
   NODE_ENV=production
   ```

6. **Build et migration :**
   ```bash
   # Backend
   cd backend
   npm install
   npx prisma migrate deploy
   npx prisma generate
   node prisma/seed.js

   # Frontend
   cd ../frontend
   npm install
   npm run build
   ```

7. **Configuration Nginx :**

   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/team-management
   ```

   Contenu :
   ```nginx
   server {
       listen 80;
       server_name votre-domaine.com;

       location / {
           root /root/team-management/frontend/build;
           try_files $uri /index.html;
       }

       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Activez :
   ```bash
   sudo ln -s /etc/nginx/sites-available/team-management /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Démarrer l'application avec PM2 :**
   ```bash
   cd /root/team-management/backend
   pm2 start server.js --name team-management
   pm2 save
   pm2 startup
   ```

9. **SSL avec Certbot (HTTPS) :**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d votre-domaine.com
   ```

**Votre application est maintenant en ligne avec HTTPS !**

---

## 🔒 Conseils de Sécurité

Avant de mettre en production, assurez-vous de :

1. **Changer le JWT_SECRET :**
   - Générez une longue chaîne aléatoire
   - Ne jamais utiliser la valeur par défaut

2. **Activer HTTPS :**
   - Utilisé automatiquement par Render/Vercel/Railway
   - Configurez Certbot pour VPS

3. **Limiter les requêtes :**
   - Installez `express-rate-limit` pour éviter les abus

4. **Variables d'environnement :**
   - Ne jamais committer les fichiers `.env`
   - Utilisez les interfaces des plateformes pour les configurer

5. **Base de données :**
   - Utilisez des mots de passe forts
   - Activez les sauvegardes automatiques

---

## 🆘 Dépannage

### L'application ne démarre pas :

1. Vérifiez les logs dans le dashboard de votre plateforme
2. Vérifiez que toutes les variables d'environnement sont définies
3. Vérifiez que les migrations de base de données ont réussi

### Erreur de base de données :

1. Vérifiez que `DATABASE_URL` est correcte
2. Exécutez les migrations : `npx prisma migrate deploy`
3. Vérifiez que la base de données est accessible

### Le frontend ne se connecte pas au backend :

1. Vérifiez que l'URL de l'API est correcte
2. Vérifiez que les CORS sont configurés
3. Vérifiez les logs du backend

---

## 📊 Coûts Estimés

| Plateforme | Plan Gratuit | Plan Payant |
|------------|--------------|-------------|
| Render | Illimité (avec limitations) | À partir de $7/mois |
| Railway | $5/mois de crédit | $5-20/mois selon usage |
| Vercel | Gratuit pour projets perso | $20/mois pro |
| VPS | - | $5-10/mois |

---

## 🎯 Recommandation

**Pour débuter :** Utilisez **Render** (Option 1) - C'est gratuit, simple et tout-en-un.

**Pour la production :** VPS avec PostgreSQL pour plus de contrôle et de performances.

**Questions ?** N'hésitez pas à demander de l'aide pour une étape spécifique !
