// Force WASM engine usage to avoid binary download issues
process.env.PRISMA_QUERY_ENGINE_LIBRARY = undefined;
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'wasm';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTables() {
  console.log('🚀 Création des tables de la base de données...\n');

  try {
    // Schema complet de l'application
    const sqlStatements = [
      // Table teams (doit être créée en premier car users la référence)
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

      // Table _prisma_migrations (pour le suivi des migrations)
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

    // Exécuter chaque commande SQL
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      const tableName = statement.match(/TABLE (?:IF NOT EXISTS )?"(\w+)"/)?.[1] ||
                       statement.match(/INDEX (?:IF NOT EXISTS )?"(\w+)"/)?.[1];

      console.log(`${i + 1}/${sqlStatements.length} - Création de ${tableName || 'index'}...`);

      try {
        await prisma.$executeRawUnsafe(statement);
        console.log(`   ✓ ${tableName || 'index'} créé(e)`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️  ${tableName || 'index'} existe déjà`);
        } else {
          console.error(`   ❌ Erreur:`, error.message);
          throw error;
        }
      }
    }

    console.log('\n✅ Toutes les tables ont été créées avec succès!');
    console.log('\n📊 Tables créées:');
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
    console.log('  ✓ _prisma_migrations');

    // Vérifier les tables
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
    `;

    console.log('\n🔍 Vérification - Tables dans la base de données:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });

    console.log('\n🎉 Base de données prête! Vous pouvez maintenant:');
    console.log('  1. Exécuter le seed: node prisma/seed.js');
    console.log('  2. Démarrer le serveur: npm start');
    console.log('  3. Vous connecter avec: direction@example.com / password123');

  } catch (error) {
    console.error('\n❌ Erreur lors de la création des tables:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();
