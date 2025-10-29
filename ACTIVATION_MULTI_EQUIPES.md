# Activation de la Fonctionnalité Multi-Équipes

## État actuel

✅ **Ce qui est déjà fait:**
- Schéma Prisma modifié avec les tables de jonction (MeetingTeam, TaskTeam, DecisionTeam)
- Composant MultiSelect créé pour l'interface utilisateur
- Formulaires de création mis à jour (Meetings, Tasks, Decisions) avec sélection multiple d'équipes
- Couleur d'équipe maintenant sauvegardée correctement dans le backend

⚠️ **Ce qui reste à faire:**
Les équipes supplémentaires sont sélectionnées dans l'interface mais **pas encore envoyées au backend** ni sauvegardées en base de données.

## Étapes pour activer complètement la fonctionnalité

### 1. Exécuter la migration de base de données

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name add_multi_team_support
```

Ou utilisez le script:
```bash
node update-database.js
```

Cela créera les tables:
- `meeting_teams` (relations Meeting ↔ Team)
- `task_teams` (relations Task ↔ Team)
- `decision_teams` (relations Decision ↔ Team)

### 2. Mettre à jour les controllers backend

#### A. Meeting Controller (`backend/controllers/meetingController.js`)

Dans `createMeeting`, après avoir créé la réunion:
```javascript
const createMeeting = async (req, res) => {
  try {
    const { title, description, date, teamId, notes, additionalTeamIds } = req.body;

    // Créer la réunion
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        date: new Date(date),
        notes: notes || null,
        teamId: parseInt(teamId)
      }
    });

    // Ajouter les équipes supplémentaires si présentes
    if (additionalTeamIds && additionalTeamIds.length > 0) {
      await prisma.meetingTeam.createMany({
        data: additionalTeamIds.map(teamId => ({
          meetingId: meeting.id,
          teamId: parseInt(teamId)
        }))
      });
    }

    // Recharger la réunion avec les équipes
    const fullMeeting = await prisma.meeting.findUnique({
      where: { id: meeting.id },
      include: {
        team: true,
        teams: {
          include: {
            team: {
              select: { id: true, name: true, color: true }
            }
          }
        }
      }
    });

    res.status(201).json(fullMeeting);
  } catch (error) {
    console.error('Erreur lors de la création de la réunion:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la réunion' });
  }
};
```

Dans `getAllMeetings`, charger les équipes supplémentaires:
```javascript
const meetings = await prisma.meeting.findMany({
  where,
  include: {
    team: {
      select: { id: true, name: true, color: true }
    },
    teams: {
      include: {
        team: {
          select: { id: true, name: true, color: true }
        }
      }
    },
    _count: {
      select: {
        decisions: true,
        tasks: true
      }
    }
  },
  orderBy: {
    date: 'desc'
  }
});
```

#### B. Task Controller (`backend/controllers/taskController.js`)

Même logique que pour les réunions:
- Extraire `additionalTeamIds` du `req.body`
- Créer les relations dans `task_teams`
- Inclure `teams` dans les queries

#### C. Decision Controller (`backend/controllers/decisionController.js`)

Même logique que pour les réunions et tâches.

### 3. Mettre à jour le frontend pour afficher les équipes multiples

#### Dans les cartes (cards)

Exemple pour `Meetings.js`:
```javascript
<div className="meeting-meta">
  {/* Équipe principale */}
  {meeting.team && (
    <span className="team-badge" style={{ backgroundColor: meeting.team.color }}>
      {meeting.team.name}
    </span>
  )}

  {/* Équipes supplémentaires */}
  {meeting.teams && meeting.teams.length > 0 && meeting.teams.map(({ team }) => (
    <span key={team.id} className="team-badge" style={{ backgroundColor: team.color }}>
      {team.name}
    </span>
  ))}
</div>
```

#### Dans les pages de détail

Afficher toutes les équipes dans la section informations:
```javascript
<div className="info-item">
  <strong>Équipes :</strong>
  <div className="teams-list">
    {meeting.team && (
      <span className="badge" style={{ backgroundColor: meeting.team.color, color: '#fff' }}>
        {meeting.team.name} (principale)
      </span>
    )}
    {meeting.teams && meeting.teams.map(({ team }) => (
      <span key={team.id} className="badge" style={{ backgroundColor: team.color, color: '#fff' }}>
        {team.name}
      </span>
    ))}
  </div>
</div>
```

### 4. Mettre à jour le filtrage des données

Si vous utilisez `req.teamFilter` dans le middleware, vous devez également filtrer sur les équipes supplémentaires:

```javascript
const where = req.teamFilter
  ? {
      OR: [
        { teamId: req.teamFilter },
        { teams: { some: { teamId: req.teamFilter } } }
      ]
    }
  : {};
```

## Tests recommandés

1. Créer une réunion avec une équipe principale et 2 équipes supplémentaires
2. Vérifier que toutes les équipes voient la réunion
3. Créer une tâche multi-équipes et vérifier l'affichage
4. Tester la modification d'un item pour ajouter/retirer des équipes

## Notes importantes

- L'équipe principale (`teamId`) reste **obligatoire** et assure la compatibilité avec le code existant
- Les équipes supplémentaires sont **optionnelles**
- Le composant MultiSelect filtre automatiquement l'équipe principale pour éviter les doublons
- Seuls les utilisateurs de la Direction peuvent sélectionner plusieurs équipes
