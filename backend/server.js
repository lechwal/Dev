const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const teamRoutes = require('./routes/teams');
const meetingRoutes = require('./routes/meetings');
const taskRoutes = require('./routes/tasks');
const decisionRoutes = require('./routes/decisions');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/decisions', decisionRoutes);

// En production, servir les fichiers statiques du frontend
if (process.env.NODE_ENV === 'production') {
  // Servir les fichiers statiques du build React
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Toutes les routes non-API renvoient index.html (pour React Router)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  // En développement, route de base pour l'API
  app.get('/', (req, res) => {
    res.json({
      message: 'API de gestion d\'équipes',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        teams: '/api/teams',
        meetings: '/api/meetings',
        tasks: '/api/tasks',
        decisions: '/api/decisions'
      }
    });
  });

  // Gestion des erreurs 404 en développement
  app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
  });
}

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
});

module.exports = app;
