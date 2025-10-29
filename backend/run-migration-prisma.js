const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const migrationPath = path.join(__dirname, 'prisma/migrations/20251029133056_add_multi_team_support/migration.sql');

console.log('📄 Lecture du fichier de migration...');

async function runMigration() {
  try {
    // Lire le fichier de migration
    const migration = fs.readFileSync(migrationPath, 'utf8');

    // Séparer les commandes SQL
    const statements = migration
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`\n🔄 Exécution de ${statements.length} commandes SQL...\n`);

    // Exécuter chaque commande
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`${i + 1}. ${statement.split('\n')[0].substring(0, 60)}...`);

      try {
        await prisma.$executeRawUnsafe(statement);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('   ⚠️  Table existe déjà, ignoré');
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Migration appliquée avec succès!');
    console.log('\n📊 Tables créées:');
    console.log('  - meeting_teams');
    console.log('  - task_teams');
    console.log('  - decision_teams');

    // Vérifier les tables
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name IN ('meeting_teams', 'task_teams', 'decision_teams')
    `;

    console.log('\n✓ Vérification:', tables.length, 'tables trouvées');

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
