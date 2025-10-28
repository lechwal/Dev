const express = require('express');
const router = express.Router();
const decisionController = require('../controllers/decisionController');
const { authenticateToken, filterByTeam } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification et le filtrage par équipe
router.use(authenticateToken);
router.use(filterByTeam);

router.get('/', decisionController.getAllDecisions);
router.get('/:id', decisionController.getDecisionById);
router.post('/', decisionController.createDecision);
router.put('/:id', decisionController.updateDecision);
router.delete('/:id', decisionController.deleteDecision);

module.exports = router;
