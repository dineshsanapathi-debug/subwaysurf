const path = require('path');
const aiAssistant = require(path.join(__dirname, '..', '..', 'ai', 'aiAssistant'));
const store = require('../models/Store');

exports.analyzeRun = async (req, res) => {
  try {
    const runData = req.body || {};
    const feedback = await aiAssistant.analyzeRun(runData);

    // Save analytics in background
    store.addRunAnalytics({
      username: runData.username || 'Guest',
      runData,
      feedback
    });

    res.json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ error: 'AI analysis failed: ' + err.message });
  }
};

exports.getAdaptiveDifficulty = (req, res) => {
  try {
    const { averageScore, recentCrashes, totalRuns, playerPreference } = req.query;
    const settings = aiAssistant.calculateAdaptiveDifficulty({
      averageScore: Number(averageScore) || 0,
      recentCrashes: Number(recentCrashes) || 0,
      totalRuns: Number(totalRuns) || 1,
      playerPreference: playerPreference || 'auto'
    });

    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate adaptive difficulty: ' + err.message });
  }
};

exports.askCoach = async (req, res) => {
  try {
    const { question, playerStats } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    const response = await aiAssistant.askCoach(question, playerStats);
    res.json({ success: true, ...response });
  } catch (err) {
    res.status(500).json({ error: 'AI Coach question failed: ' + err.message });
  }
};

