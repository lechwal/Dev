/**
 * Script simple pour appliquer la migration SQL
 * Sans dépendances externes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const migrationPath = path.join(__dirname, 'prisma/migrations/20251029133056_add_multi_team_support/migration.sql');
const dbPath = path.join(__dirname, 'dev.db');

console.log('🚀 Application de la migration...\n');
console.log('📄 Fichier de migration:', migrationPath);
console.log('📁 Base de données:', dbPath);

// Vérifier que les fichiers existent
if (!fs.existsSync(migrationPath)) {
  console.error('❌ Fichier de migration introuvable!');
  process.exit(1);
}

if (!fs.existsSync(dbPath)) {
  console.error('❌ Base de données introuvable!');
  console.log('\n💡 Lancez d\'abord le serveur backend pour créer la base de données');
  process.exit(1);
}

// Lire le SQL
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('\n📝 Contenu de la migration:');
console.log('-----------------------------------');
console.log(sql.substring(0, 200) + '...');
console.log('-----------------------------------\n');

console.log('⚠️  INSTRUCTIONS:');
console.log('');
console.log('Cette migration doit être appliquée manuellement.');
console.log('Voici les 3 options disponibles:');
console.log('');
console.log('OPTION 1 - Si vous avez sqlite3 installé:');
console.log('  cd backend');
console.log('  sqlite3 dev.db < prisma/migrations/20251029133056_add_multi_team_support/migration.sql');
console.log('');
console.log('OPTION 2 - Utiliser un client SQLite (DB Browser for SQLite, etc.):');
console.log('  1. Ouvrir le fichier backend/dev.db');
console.log('  2. Exécuter le SQL ci-dessus dans l\'éditeur SQL');
console.log('');
console.log('OPTION 3 - Copier-coller le SQL directement:');
console.log('\n' + sql + '\n');
console.log('');
console.log('Une fois la migration appliquée, les tables suivantes seront créées:');
console.log('  ✓ meeting_teams (relations Meeting ↔ Team)');
console.log('  ✓ task_teams (relations Task ↔ Team)');
console.log('  ✓ decision_teams (relations Decision ↔ Team)');
console.log('');
