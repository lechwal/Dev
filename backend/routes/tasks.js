const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken, filterByTeam } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification et le filtrage par équipe
router.use(authenticateToken);
router.use(filterByTeam);

router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
