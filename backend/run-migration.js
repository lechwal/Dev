const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'dev.db');
const migrationPath = path.join(__dirname, 'prisma/migrations/20251029133056_add_multi_team_support/migration.sql');

console.log('📁 Base de données:', dbPath);
console.log('📄 Fichier de migration:', migrationPath);

try {
  // Ouvrir la base de données
  const db = new Database(dbPath);

  // Lire le fichier de migration
  const migration = fs.readFileSync(migrationPath, 'utf8');

  // Séparer les commandes SQL
  const statements = migration
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`\n🔄 Exécution de ${statements.length} commandes SQL...\n`);

  // Exécuter chaque commande
  db.transaction(() => {
    statements.forEach((statement, index) => {
      console.log(`${index + 1}. ${statement.split('\n')[0].substring(0, 60)}...`);
      db.exec(statement);
    });
  })();

  console.log('\n✅ Migration appliquée avec succès!');
  console.log('\n📊 Tables créées:');
  console.log('  - meeting_teams');
  console.log('  - task_teams');
  console.log('  - decision_teams');

  db.close();

  // Mettre à jour _prisma_migrations
  const db2 = new Database(dbPath);
  const migrationName = '20251029133056_add_multi_team_support';

  // Vérifier si la table _prisma_migrations existe
  const tables = db2.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='_prisma_migrations'").all();

  if (tables.length > 0) {
    // Vérifier si la migration est déjà enregistrée
    const existing = db2.prepare('SELECT * FROM _prisma_migrations WHERE migration_name = ?').get(migrationName);

    if (!existing) {
      db2.prepare(`
        INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        require('crypto').randomBytes(16).toString('hex'),
        require('crypto').createHash('sha256').update(migration).digest('hex').substring(0, 64),
        new Date().toISOString(),
        migrationName,
        null,
        null,
        new Date().toISOString(),
        statements.length
      );
      console.log('\n📝 Migration enregistrée dans _prisma_migrations');
    }
  }

  db2.close();

} catch (error) {
  console.error('\n❌ Erreur lors de la migration:', error.message);
  process.exit(1);
}
