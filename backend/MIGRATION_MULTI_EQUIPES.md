# Migration: Support de Plusieurs Équipes

## Modifications apportées

Le schéma Prisma a été modifié pour permettre la sélection de plusieurs équipes pour les réunions, tâches et décisions.

### Changements au schéma

- Ajout de `MeetingTeam` - Table de jonction pour les équipes supplémentaires d'une réunion
- Ajout de `TaskTeam` - Table de jonction pour les équipes supplémentaires d'une tâche
- Ajout de `DecisionTeam` - Table de jonction pour les équipes supplémentaires d'une décision

### Structure

Chaque entité (Meeting, Task, Decision) conserve son champ `teamId` comme **équipe principale** pour la compatibilité avec le code existant, et peut maintenant avoir des **équipes supplémentaires** via les tables de jonction.

## Comment exécuter la migration

1. Générer le client Prisma:
```bash
cd backend
npx prisma generate
```

2. Créer et exécuter la migration:
```bash
cd backend
npx prisma migrate dev --name add_multi_team_support
```

Ou utilisez le script simplifié:
```bash
node update-database.js
```

## Fonctionnalités après migration

- Lors de la création d'une réunion/tâche/décision, vous pouvez sélectionner plusieurs équipes
- L'équipe principale reste obligatoire (pour la compatibilité)
- Les équipes supplémentaires sont optionnelles
- Toutes les équipes sélectionnées verront l'item dans leur vue

## Impact sur le code

### Backend
Les controllers devront être mis à jour pour:
- Charger les équipes supplémentaires avec `include: { teams: { include: { team: true } } }`
- Créer/mettre à jour les relations many-to-many lors de la création/modification

### Frontend
Les formulaires devront utiliser un composant de sélection multiple (ex: multi-select dropdown)
pour permettre la sélection de plusieurs équipes.
