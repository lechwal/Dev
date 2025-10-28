# Guide d'Installation pour Débutants

## Prérequis : Installer Node.js

### Étape 1 : Télécharger Node.js

1. Ouvrez votre navigateur web
2. Allez sur : https://nodejs.org/
3. Téléchargez la version **LTS** (version recommandée, bouton vert)
4. Exécutez le fichier téléchargé
5. Suivez l'installation en cliquant sur "Suivant" à chaque étape
6. ✅ Node.js est maintenant installé !

### Étape 2 : Vérifier que Node.js est bien installé

#### Sur Windows :
1. Appuyez sur les touches `Windows + R`
2. Tapez `cmd` et appuyez sur Entrée
3. Dans la fenêtre noire qui s'ouvre, tapez :
   ```
   node --version
   ```
4. Vous devriez voir un numéro de version (exemple : v18.17.0)

#### Sur Mac :
1. Ouvrez le "Terminal" (cherchez "Terminal" dans Spotlight)
2. Tapez :
   ```
   node --version
   ```
3. Vous devriez voir un numéro de version

---

## Installation de l'Application

### Étape 3 : Récupérer le code

Le code est déjà dans le dossier `/home/user/Dev` où vous vous trouvez.

### Étape 4 : Ouvrir le Terminal/Invite de commandes

#### Sur Windows :
1. Ouvrez l'explorateur de fichiers
2. Naviguez jusqu'au dossier où se trouve le code
3. Dans la barre d'adresse en haut, tapez `cmd` et appuyez sur Entrée
4. Une fenêtre noire s'ouvre : c'est l'invite de commandes

#### Sur Mac :
1. Ouvrez le Terminal
2. Tapez `cd ` (avec un espace après cd)
3. Faites glisser le dossier du projet dans le Terminal
4. Appuyez sur Entrée

### Étape 5 : Installer toutes les dépendances

Dans le terminal, tapez exactement cette commande et appuyez sur Entrée :

```bash
npm run setup
```

⏳ **Cette étape peut prendre 2-5 minutes**. C'est normal !

Vous allez voir beaucoup de texte défiler. C'est normal, l'ordinateur télécharge et installe tout ce dont l'application a besoin.

À la fin, vous devriez voir :
```
Seeding terminé avec succès !

Comptes de test:
Direction: direction@example.com / password123
Équipe Dev - Alice: alice@example.com / password123
Équipe Dev - Bob: bob@example.com / password123
Équipe Marketing - Charlie: charlie@example.com / password123
```

✅ Si vous voyez ce message, l'installation est réussie !

---

## Démarrer l'Application

Pour utiliser l'application, vous devez démarrer **2 programmes** en même temps :
- Le **backend** (le serveur qui gère les données)
- Le **frontend** (l'interface que vous verrez dans votre navigateur)

### Étape 6 : Démarrer le Backend (Serveur)

#### Option A : Ouvrir un nouveau terminal

**Sur Windows :**
1. Ouvrez une NOUVELLE fenêtre d'invite de commandes (comme à l'étape 4)
2. Allez dans le dossier du projet

**Sur Mac :**
1. Dans le Terminal, faites `Commande + T` pour ouvrir un nouvel onglet
2. Ou ouvrez une nouvelle fenêtre de Terminal

#### Option B : Utiliser le même terminal

Dans votre terminal actuel, tapez :

```bash
npm run dev-backend
```

Vous devriez voir :
```
Serveur démarré sur le port 3001
URL: http://localhost:3001
```

✅ Le backend est démarré ! **Laissez cette fenêtre ouverte** et ne la fermez pas.

### Étape 7 : Démarrer le Frontend (Interface)

1. Ouvrez un **NOUVEAU** terminal/invite de commandes (ne fermez pas l'ancien !)
2. Allez dans le même dossier du projet
3. Tapez cette commande :

```bash
npm run dev-frontend
```

⏳ Cette étape prend environ 30 secondes.

Vous devriez voir :
```
Compiled successfully!

You can now view team-management-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

✅ Le frontend est démarré !

### Étape 8 : Ouvrir l'Application

1. Ouvrez votre navigateur web (Chrome, Firefox, Safari, Edge...)
2. Dans la barre d'adresse, tapez :
   ```
   http://localhost:3000
   ```
3. Appuyez sur Entrée

🎉 **Vous devriez voir la page de connexion de l'application !**

---

## Se Connecter pour Tester

Utilisez un de ces comptes pour vous connecter :

### Pour tester en tant que Direction (accès complet) :
- **Email** : `direction@example.com`
- **Mot de passe** : `password123`

### Pour tester en tant que Membre d'équipe :
- **Email** : `alice@example.com`
- **Mot de passe** : `password123`

---

## Arrêter l'Application

Quand vous avez fini d'utiliser l'application :

1. Dans chaque fenêtre de terminal, appuyez sur `Ctrl + C` (Windows/Mac)
2. Confirmez si on vous demande (tapez `O` ou `Y` puis Entrée)
3. Fermez les fenêtres de terminal

---

## Résumé Visuel

```
┌─────────────────────────────────────────────┐
│  TERMINAL 1 : Backend (Port 3001)          │
│  Commande: npm run dev-backend             │
│  ⚠️ Laisser ouvert pendant l'utilisation   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  TERMINAL 2 : Frontend (Port 3000)         │
│  Commande: npm run dev-frontend            │
│  ⚠️ Laisser ouvert pendant l'utilisation   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  NAVIGATEUR : Application Web              │
│  URL: http://localhost:3000                │
│  🎯 C'est ici que vous utilisez l'app      │
└─────────────────────────────────────────────┘
```

---

## Problèmes Courants

### Erreur : "npm n'est pas reconnu"
❌ Node.js n'est pas installé ou pas dans le PATH
✅ Réinstallez Node.js et redémarrez votre ordinateur

### Erreur : "Port 3000 déjà utilisé"
❌ Une autre application utilise ce port
✅ Fermez les autres applications ou redémarrez votre ordinateur

### Erreur : "Cannot find module"
❌ Les dépendances ne sont pas installées
✅ Retournez à l'étape 5 et relancez `npm run setup`

### Erreur : "Error validating: You defined the enum... current connector does not support enums"
❌ Problème de compatibilité avec SQLite (déjà corrigé dans la dernière version)
✅ Solution :
1. Assurez-vous d'avoir la dernière version du code (git pull)
2. Supprimez le dossier `backend/node_modules` et le fichier `backend/package-lock.json`
3. Relancez `npm run setup`

Si le problème persiste, supprimez aussi le fichier `backend/prisma/dev.db` avant de relancer.

### L'application ne s'ouvre pas dans le navigateur
❌ Le frontend n'est pas démarré
✅ Vérifiez que les 2 terminaux sont ouverts et qu'aucun message d'erreur n'apparaît

---

## Prochaines Étapes

Une fois connecté, vous pouvez :

1. **Tableau de bord** : Vue d'ensemble de vos tâches et réunions
2. **Tâches** : Créer et gérer des tâches (système Kanban)
3. **Réunions** : Planifier des réunions d'équipe
4. **Décisions** : Enregistrer les décisions importantes

---

## Besoin d'Aide ?

Si vous rencontrez un problème :
1. Lisez attentivement les messages d'erreur
2. Vérifiez que les 2 terminaux sont bien ouverts
3. Essayez de redémarrer l'application
4. Redémarrez votre ordinateur si nécessaire

---

## Commandes Rapides (Mémo)

```bash
# Installation complète (à faire UNE SEULE FOIS)
npm run setup

# Démarrer le backend (Terminal 1)
npm run dev-backend

# Démarrer le frontend (Terminal 2)
npm run dev-frontend

# Arrêter : Ctrl + C dans chaque terminal
```
