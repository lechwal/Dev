const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new sqlite3.Database(dbPath);

console.log('🌱 Début du seeding de la base de données...\n');

async function seed() {
  try {
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Wrap database operations in promises
    const run = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve(this);
        });
      });
    };

    const get = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    };

    // Créer des équipes
    console.log('📝 Création des équipes...');

    await run(`INSERT INTO teams (name, description, color, createdAt, updatedAt)
               VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
               ['Équipe Développement', 'Équipe en charge du développement logiciel', '#667eea']);

    const equipe1 = await get('SELECT last_insert_rowid() as id');
    const equipe1Id = equipe1.id;

    await run(`INSERT INTO teams (name, description, color, createdAt, updatedAt)
               VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
               ['Équipe Marketing', 'Équipe en charge du marketing et communication', '#ed64a6']);

    const equipe2 = await get('SELECT last_insert_rowid() as id');
    const equipe2Id = equipe2.id;

    console.log('✓ Équipes créées');

    // Créer des utilisateurs
    console.log('📝 Création des utilisateurs...');

    await run(`INSERT INTO users (email, password, firstName, lastName, role, teamId, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
               ['direction@example.com', hashedPassword, 'Marie', 'Directrice', 'DIRECTION', null]);

    await run(`INSERT INTO users (email, password, firstName, lastName, role, teamId, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
               ['alice@example.com', hashedPassword, 'Alice', 'Dupont', 'MEMBRE', equipe1Id]);

    const user1 = await get('SELECT last_insert_rowid() as id');
    const user1Id = user1.id;

    await run(`INSERT INTO users (email, password, firstName, lastName, role, teamId, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
               ['bob@example.com', hashedPassword, 'Bob', 'Martin', 'MEMBRE', equipe1Id]);

    const user2 = await get('SELECT last_insert_rowid() as id');
    const user2Id = user2.id;

    await run(`INSERT INTO users (email, password, firstName, lastName, role, teamId, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
               ['charlie@example.com', hashedPassword, 'Charlie', 'Durand', 'MEMBRE', equipe2Id]);

    const user3 = await get('SELECT last_insert_rowid() as id');
    const user3Id = user3.id;

    console.log('✓ Utilisateurs créés');

    // Créer des réunions
    console.log('📝 Création des réunions...');

    await run(`INSERT INTO meetings (title, description, date, teamId, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
               ['Réunion de sprint planning', 'Planification du prochain sprint', '2024-11-15 10:00:00', equipe1Id]);

    const meeting1 = await get('SELECT last_insert_rowid() as id');
    const meeting1Id = meeting1.id;

    await run(`INSERT INTO meetings (title, description, date, teamId, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
               ['Revue marketing mensuelle', 'Revue des campagnes du mois', '2024-11-20 14:00:00', equipe2Id]);

    const meeting2 = await get('SELECT last_insert_rowid() as id');
    const meeting2Id = meeting2.id;

    console.log('✓ Réunions créées');

    // Créer des tâches
    console.log('📝 Création des tâches...');

    await run(`INSERT INTO tasks (title, description, status, priority, dueDate, teamId, assignedToId, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
               ['Développer la page de connexion', 'Créer une interface de connexion responsive', 'IN_PROGRESS', 'HIGH', '2024-11-10', equipe1Id, user1Id]);

    await run(`INSERT INTO tasks (title, description, status, priority, dueDate, teamId, assignedToId, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
               ['Corriger les bugs du module utilisateurs', 'Résoudre les problèmes signalés', 'TODO', 'URGENT', '2024-11-08', equipe1Id, user2Id]);

    await run(`INSERT INTO tasks (title, description, status, priority, dueDate, teamId, assignedToId, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
               ['Préparer la campagne publicitaire', 'Créer les visuels et textes pour la prochaine campagne', 'TODO', 'MEDIUM', '2024-11-25', equipe2Id, user3Id]);

    console.log('✓ Tâches créées');

    // Créer des décisions
    console.log('📝 Création des décisions...');

    await run(`INSERT INTO decisions (title, description, date, teamId, meetingId, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
               ['Adoption de React pour le frontend', 'Décision d\'utiliser React comme framework frontend principal', '2024-10-15', equipe1Id, meeting1Id]);

    await run(`INSERT INTO decisions (title, description, date, teamId, meetingId, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
               ['Budget campagne Q4', 'Validation du budget de 50 000€ pour la campagne du Q4', '2024-10-20', equipe2Id, meeting2Id]);

    console.log('✓ Décisions créées');

    console.log('\n✅ Seeding terminé avec succès !\n');
    console.log('📊 Données créées:');
    console.log('  ✓ 2 équipes');
    console.log('  ✓ 4 utilisateurs');
    console.log('  ✓ 2 réunions');
    console.log('  ✓ 3 tâches');
    console.log('  ✓ 2 décisions\n');

    console.log('🔐 Comptes de test:');
    console.log('  Direction: direction@example.com / password123');
    console.log('  Équipe Dev - Alice: alice@example.com / password123');
    console.log('  Équipe Dev - Bob: bob@example.com / password123');
    console.log('  Équipe Marketing - Charlie: charlie@example.com / password123\n');

    console.log('🎉 Prochaine étape:');
    console.log('  Démarrez le serveur: npm start\n');

  } catch (error) {
    console.error('\n❌ Erreur lors du seeding:', error);
    throw error;
  }
}

// Exécuter le seeding
seed()
  .then(() => {
    db.close((err) => {
      if (err) {
        console.error('Erreur lors de la fermeture:', err);
        process.exit(1);
      }
      process.exit(0);
    });
  })
  .catch((error) => {
    console.error('Erreur fatale:', error);
    db.close();
    process.exit(1);
  });
