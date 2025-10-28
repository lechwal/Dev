# Déploiement avec Docker

Ce guide explique comment déployer l'application avec Docker et Docker Compose.

## Prérequis

- Docker installé (https://docs.docker.com/get-docker/)
- Docker Compose installé (inclus avec Docker Desktop)

## Déploiement Local avec Docker

### 1. Configuration

Créez un fichier `.env` à la racine du projet :

```env
DB_PASSWORD=votre_mot_de_passe_securise
JWT_SECRET=votre_secret_jwt_super_long_et_securise
```

### 2. Build et démarrage

```bash
# Build et démarrer tous les services
docker-compose up --build -d

# Voir les logs
docker-compose logs -f

# Vérifier que tout fonctionne
docker-compose ps
```

### 3. Initialiser la base de données

```bash
# Exécuter les migrations
docker-compose exec app sh -c "cd backend && npx prisma migrate deploy"

# Peupler la base de données (optionnel)
docker-compose exec app sh -c "cd backend && node prisma/seed.js"
```

### 4. Accéder à l'application

Ouvrez votre navigateur sur : http://localhost:3001

**Comptes de test** (si vous avez exécuté le seed) :
- Direction : direction@example.com / password123
- Membre : alice@example.com / password123

## Commandes Utiles

```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v

# Redémarrer un service
docker-compose restart app

# Voir les logs d'un service spécifique
docker-compose logs -f app
docker-compose logs -f postgres

# Accéder au shell du conteneur
docker-compose exec app sh

# Sauvegarder la base de données
docker-compose exec postgres pg_dump -U team_user team_management > backup.sql

# Restaurer la base de données
docker-compose exec -T postgres psql -U team_user team_management < backup.sql
```

## Déploiement sur un Serveur avec Docker

### 1. Préparation du serveur

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Cloner le projet

```bash
git clone https://github.com/votre-repo/team-management.git
cd team-management
```

### 3. Configuration

```bash
# Créer le fichier .env
nano .env
```

Contenu :
```env
DB_PASSWORD=mot_de_passe_super_securise_123
JWT_SECRET=secret_jwt_tres_long_et_aleatoire_abc123xyz789
```

### 4. Démarrer l'application

```bash
docker-compose up -d
docker-compose exec app sh -c "cd backend && npx prisma migrate deploy"
docker-compose exec app sh -c "cd backend && node prisma/seed.js"
```

### 5. Configuration Nginx (optionnel - pour domaine personnalisé)

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6. SSL avec Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

## Mise à Jour de l'Application

```bash
# Récupérer les dernières modifications
git pull

# Reconstruire et redémarrer
docker-compose up --build -d

# Exécuter les nouvelles migrations si nécessaire
docker-compose exec app sh -c "cd backend && npx prisma migrate deploy"
```

## Surveillance et Maintenance

### Logs

```bash
# Voir tous les logs
docker-compose logs -f

# Logs uniquement de l'application
docker-compose logs -f app

# Dernières 100 lignes
docker-compose logs --tail=100 app
```

### Ressources

```bash
# Voir l'utilisation des ressources
docker stats

# Nettoyer les images inutilisées
docker system prune -a
```

### Sauvegardes Automatiques

Créez un script `/root/backup-db.sh` :

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

docker-compose exec -T postgres pg_dump -U team_user team_management > $BACKUP_DIR/backup_$DATE.sql

# Garder seulement les 7 dernières sauvegardes
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

Ajoutez au crontab :
```bash
chmod +x /root/backup-db.sh
crontab -e
# Ajouter : 0 2 * * * /root/backup-db.sh
```

## Dépannage

### Le conteneur ne démarre pas

```bash
# Voir les logs détaillés
docker-compose logs app

# Vérifier l'état
docker-compose ps
```

### Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL fonctionne
docker-compose exec postgres psql -U team_user -d team_management -c "SELECT 1;"

# Redémarrer la base de données
docker-compose restart postgres
```

### Problèmes de permissions

```bash
# Changer le propriétaire des volumes
sudo chown -R 1000:1000 .
```

## Sécurité

1. **Changez toujours les mots de passe par défaut**
2. **Utilisez des secrets forts et aléatoires**
3. **Gardez Docker et les images à jour**
4. **Configurez un pare-feu (ufw ou firewalld)**
5. **Utilisez HTTPS en production (Certbot)**
6. **Limitez l'accès SSH par clé uniquement**

## Avantages de Docker

- ✅ Déploiement simple et reproductible
- ✅ Isolation des services
- ✅ Facile à mettre à jour
- ✅ Portable entre différents environnements
- ✅ Rollback facile en cas de problème

## Exemple de Workflow de Production

```bash
# 1. Test en local
docker-compose up

# 2. Push vers le dépôt
git push

# 3. Sur le serveur de production
ssh user@production-server
cd /app/team-management
git pull
docker-compose up --build -d
docker-compose exec app sh -c "cd backend && npx prisma migrate deploy"

# 4. Vérifier
docker-compose logs -f app
```

---

**Questions ?** Consultez le guide principal DEPLOIEMENT.md pour d'autres options de déploiement.
