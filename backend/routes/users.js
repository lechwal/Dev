const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireDirection } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification et le rôle DIRECTION
router.use(authenticateToken);
router.use(requireDirection);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
