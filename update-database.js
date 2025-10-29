// Script pour mettre à jour la base de données avec les nouvelles fonctionnalités

const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Mise à jour de la base de données...\n');

const backendPath = path.join(__dirname, 'backend');

// Fonction pour exécuter une commande
function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erreur: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr && !stderr.includes('warn')) {
        console.error(`⚠️  ${stderr}`);
      }
      if (stdout) {
        console.log(stdout);
      }
      resolve();
    });
  });
}

async function main() {
  try {
    console.log('1️⃣  Génération du client Prisma...');
    await runCommand('npx prisma generate', backendPath);
    console.log('✅ Client Prisma généré\n');

    console.log('2️⃣  Création et application de la migration...');
    await runCommand('npx prisma migrate dev --name add_features', backendPath);
    console.log('✅ Migration appliquée\n');

    console.log('🎉 Base de données mise à jour avec succès !');
    console.log('\nNouvelles fonctionnalités disponibles :');
    console.log('  ✓ Couleurs pour les équipes');
    console.log('  ✓ Notes et ordre du jour pour les réunions');
    console.log('  ✓ Participants aux réunions');
    console.log('  ✓ Tâches liées aux réunions');
    console.log('\n⚠️  Pensez à redémarrer le backend et le frontend !');
  } catch (error) {
    console.error('\n❌ Erreur lors de la mise à jour:', error.message);
    process.exit(1);
  }
}

main();
