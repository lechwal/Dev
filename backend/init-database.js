const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new sqlite3.Database(dbPath);

console.log('🚀 Initialisation de la base de données SQLite...\n');
console.log('📁 Fichier:', dbPath, '\n');

// Schema complet
const schema = [
  // Table teams (doit être créée en premier)
  `CREATE TABLE IF NOT EXISTS "teams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#667eea',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,

  // Table users
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBRE',
    "teamId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  )`,

  // Table meetings
  `CREATE TABLE IF NOT EXISTS "meetings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    "notes" TEXT,
    "teamId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meetings_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,

  // Table meeting_participants
  `CREATE TABLE IF NOT EXISTS "meeting_participants" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "meetingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meeting_participants_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "meeting_participants_meetingId_userId_key" ON "meeting_participants"("meetingId", "userId")`,

  // Table agenda_items
  `CREATE TABLE IF NOT EXISTS "agenda_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "meetingId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "agenda_items_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,

  // Table tasks
  `CREATE TABLE IF NOT EXISTS "tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dueDate" DATETIME,
    "teamId" INTEGER NOT NULL,
    "assignedToId" INTEGER,
    "meetingId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tasks_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasks_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  )`,

  // Table decisions
  `CREATE TABLE IF NOT EXISTS "decisions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" INTEGER NOT NULL,
    "meetingId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "decisions_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "decisions_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  )`,

  // NOUVELLES TABLES - Multi-équipes

  // Table meeting_teams
  `CREATE TABLE IF NOT EXISTS "meeting_teams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "meetingId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meeting_teams_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_teams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "meeting_teams_meetingId_teamId_key" ON "meeting_teams"("meetingId", "teamId")`,

  // Table task_teams
  `CREATE TABLE IF NOT EXISTS "task_teams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_teams_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_teams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "task_teams_taskId_teamId_key" ON "task_teams"("taskId", "teamId")`,

  // Table decision_teams
  `CREATE TABLE IF NOT EXISTS "decision_teams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "decisionId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "decision_teams_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "decisions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "decision_teams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "decision_teams_decisionId_teamId_key" ON "decision_teams"("decisionId", "teamId")`,

  // Table _prisma_migrations
  `CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checksum" TEXT NOT NULL,
    "finished_at" DATETIME,
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" DATETIME,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
  )`
];

// Fonction pour exécuter les commandes SQL en série
function executeSchema() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let completed = 0;

      schema.forEach((sql, index) => {
        db.run(sql, function(err) {
          if (err) {
            console.error(`❌ Erreur lors de l'exécution de la commande ${index + 1}:`, err.message);
            return reject(err);
          }

          completed++;
          const tableName = sql.match(/TABLE (?:IF NOT EXISTS )?"(\w+)"/)?.[1] ||
                           sql.match(/INDEX (?:IF NOT EXISTS )?"(\w+)"/)?.[1];

          console.log(`✓ ${completed}/${schema.length} - ${tableName || 'index'} créé(e)`);

          if (completed === schema.length) {
            resolve();
          }
        });
      });
    });
  });
}

// Exécuter la création du schéma
executeSchema()
  .then(() => {
    console.log('\n✅ Toutes les tables ont été créées avec succès!\n');
    console.log('📊 Tables créées:');
    console.log('  ✓ teams');
    console.log('  ✓ users');
    console.log('  ✓ meetings');
    console.log('  ✓ meeting_participants');
    console.log('  ✓ agenda_items');
    console.log('  ✓ tasks');
    console.log('  ✓ decisions');
    console.log('  ✓ meeting_teams (multi-équipes)');
    console.log('  ✓ task_teams (multi-équipes)');
    console.log('  ✓ decision_teams (multi-équipes)');
    console.log('  ✓ _prisma_migrations\n');

    // Vérifier les tables
    db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, tables) => {
      if (err) {
        console.error('Erreur lors de la vérification:', err);
        db.close();
        process.exit(1);
      }

      console.log('🔍 Vérification - Tables dans la base de données:');
      tables.forEach(table => {
        console.log(`  - ${table.name}`);
      });

      console.log('\n🎉 Base de données prête! Prochaines étapes:\n');
      console.log('  1. Générer le client Prisma:');
      console.log('     cd backend');
      console.log('     npx prisma generate --skip-engine-download\n');
      console.log('  2. Peupler avec des données de test:');
      console.log('     node prisma/seed.js\n');
      console.log('  3. Démarrer le serveur:');
      console.log('     npm start\n');
      console.log('  4. Se connecter avec:');
      console.log('     Email: direction@example.com');
      console.log('     Password: password123\n');

      db.close((err) => {
        if (err) {
          console.error('Erreur lors de la fermeture:', err);
          process.exit(1);
        }
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    db.close();
    process.exit(1);
  });
