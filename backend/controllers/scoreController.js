const store = require('../models/Store');

exports.saveScore = (req, res) => {
  try {
    const { username, score, distance, coins, characterUsed, runStats } = req.body;

    if (score === undefined || score === null) {
      return res.status(400).json({ error: 'Score is required' });
    }

    const saved = store.addScore({
      username: username || 'Guest Runner',
      score: Number(score) || 0,
      distance: Number(distance) || 0,
      coins: Number(coins) || 0,
      characterUsed: characterUsed || 'Dash',
      runStats: runStats || {}
    });

    const leaderboard = store.getLeaderboard(10);
    const userStats = store.getUserStats(saved.username);

    res.status(201).json({
      message: 'Score saved successfully',
      score: saved,
      userStats,
      leaderboard
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not save score: ' + err.message });
  }
};

exports.getLeaderboard = (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const leaderboard = store.getLeaderboard(limit);
    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch leaderboard: ' + err.message });
  }
};

exports.getPlayerStats = (req, res) => {
  try {
    const username = req.params.username || req.query.username;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const stats = store.getUserStats(username);
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch stats: ' + err.message });
  }
};

