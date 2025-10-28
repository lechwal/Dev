const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { authenticateToken, filterByTeam } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification et le filtrage par équipe
router.use(authenticateToken);
router.use(filterByTeam);

router.get('/', meetingController.getAllMeetings);
router.get('/:id', meetingController.getMeetingById);
router.post('/', meetingController.createMeeting);
router.put('/:id', meetingController.updateMeeting);
router.delete('/:id', meetingController.deleteMeeting);

module.exports = router;
