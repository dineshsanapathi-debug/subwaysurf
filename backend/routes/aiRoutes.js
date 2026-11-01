const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/analyze-run', aiController.analyzeRun);
router.get('/adaptive-difficulty', aiController.getAdaptiveDifficulty);
router.post('/ask-coach', aiController.askCoach);

module.exports = router;

