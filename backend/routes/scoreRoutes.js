const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');

router.post('/save', scoreController.saveScore);
router.get('/leaderboard', scoreController.getLeaderboard);
router.get('/stats/:username', scoreController.getPlayerStats);

module.exports = router;

