const fs = require('fs');
const path = require('path');

// Copier .env.example vers .env dans le backend si .env n'existe pas
const envExamplePath = path.join(__dirname, 'backend', '.env.example');
const envPath = path.join(__dirname, 'backend', '.env');

if (!fs.existsSync(envPath)) {
  console.log('📝 Création du fichier .env...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ Fichier .env créé avec succès !');
} else {
  console.log('✅ Le fichier .env existe déjà.');
}
