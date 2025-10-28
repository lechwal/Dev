const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticateToken, requireDirection, filterByTeam } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification
router.use(authenticateToken);

// Routes avec filtrage par équipe
router.get('/', filterByTeam, teamController.getAllTeams);
router.get('/:id', filterByTeam, teamController.getTeamById);

// Routes réservées à la direction
router.post('/', requireDirection, teamController.createTeam);
router.put('/:id', requireDirection, teamController.updateTeam);
router.delete('/:id', requireDirection, teamController.deleteTeam);

module.exports = router;
