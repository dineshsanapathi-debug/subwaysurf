const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DATA = {
  users: [
    {
      id: 'user_dash',
      username: 'DashPro',
      passwordHash: '$2a$10$9ZqX9UeMskgG0p0W4E5ykeJ0Wk9hJ8i2e6uH1yZ0r4yHq', // demo
      bestScore: 24500,
      totalCoins: 1250,
      runsCount: 32,
      createdAt: new Date().toISOString()
    },
    {
      id: 'user_luna',
      username: 'LunaSkater',
      passwordHash: '',
      bestScore: 18200,
      totalCoins: 890,
      runsCount: 21,
      createdAt: new Date().toISOString()
    },
    {
      id: 'user_bolt',
      username: 'RoboBolt',
      passwordHash: '',
      bestScore: 14100,
      totalCoins: 620,
      runsCount: 15,
      createdAt: new Date().toISOString()
    }
  ],
  scores: [
    {
      id: 'sc_1',
      username: 'DashPro',
      score: 24500,
      distance: 3120,
      coins: 430,
      characterUsed: 'Dash',
      date: new Date(Date.now() - 3600 * 1000 * 4).toISOString()
    },
    {
      id: 'sc_2',
      username: 'LunaSkater',
      score: 18200,
      distance: 2400,
      coins: 310,
      characterUsed: 'Luna',
      date: new Date(Date.now() - 3600 * 1000 * 12).toISOString()
    },
    {
      id: 'sc_3',
      username: 'RoboBolt',
      score: 14100,
      distance: 1950,
      coins: 215,
      characterUsed: 'Bolt',
      date: new Date(Date.now() - 3600 * 1000 * 24).toISOString()
    },
    {
      id: 'sc_4',
      username: 'SubwaySurferX',
      score: 11800,
      distance: 1600,
      coins: 180,
      characterUsed: 'Dash',
      date: new Date(Date.now() - 3600 * 1000 * 36).toISOString()
    },
    {
      id: 'sc_5',
      username: 'NeonRider',
      score: 9500,
      distance: 1300,
      coins: 145,
      characterUsed: 'Luna',
      date: new Date(Date.now() - 3600 * 1000 * 48).toISOString()
    }
  ],
  analytics: []
};

class Store {
  constructor() {
    this.data = INITIAL_DATA;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = { ...INITIAL_DATA, ...JSON.parse(raw) };
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('[Store] Could not read db.json, using in-memory store:', err.message);
      this.data = INITIAL_DATA;
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[Store] Could not persist db.json:', err.message);
    }
  }

  // Users
  findUserByUsername(username) {
    return this.data.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
  }

  findUserById(id) {
    return this.data.users.find((u) => u.id === id);
  }

  createUser(user) {
    const newUser = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      username: user.username,
      passwordHash: user.passwordHash || '',
      bestScore: 0,
      totalCoins: 0,
      runsCount: 0,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  // Scores
  addScore({ username, score, distance, coins, characterUsed, runStats }) {
    const newScore = {
      id: 'sc_' + Date.now(),
      username: username || 'Guest Runner',
      score: Number(score) || 0,
      distance: Number(distance) || 0,
      coins: Number(coins) || 0,
      characterUsed: characterUsed || 'Dash',
      date: new Date().toISOString(),
      runStats: runStats || {}
    };
    this.data.scores.push(newScore);

    // Update user stats if registered
    const user = this.findUserByUsername(newScore.username);
    if (user) {
      const bestScore = Math.max(user.bestScore || 0, newScore.score);
      const totalCoins = (user.totalCoins || 0) + newScore.coins;
      const runsCount = (user.runsCount || 0) + 1;
      this.updateUser(user.id, { bestScore, totalCoins, runsCount });
    }

    this.save();
    return newScore;
  }

  getLeaderboard(limit = 10) {
    // Sort descending by score
    return [...this.data.scores]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  getUserStats(username) {
    const user = this.findUserByUsername(username);
    const userScores = this.data.scores.filter(
      (s) => s.username.toLowerCase() === username.toLowerCase()
    );

    const totalRuns = userScores.length;
    const totalDistance = userScores.reduce((acc, s) => acc + (s.distance || 0), 0);
    const totalCoins = user ? user.totalCoins : userScores.reduce((acc, s) => acc + (s.coins || 0), 0);
    const bestScore = user ? user.bestScore : (userScores.length ? Math.max(...userScores.map(s => s.score)) : 0);

    return {
      username,
      bestScore,
      totalCoins,
      totalRuns,
      totalDistance,
      recentScores: userScores.slice(-5).reverse()
    };
  }

  // Analytics & AI history
  addRunAnalytics(analyticsData) {
    const entry = {
      id: 'an_' + Date.now(),
      ...analyticsData,
      timestamp: new Date().toISOString()
    };
    this.data.analytics.push(entry);
    if (this.data.analytics.length > 100) {
      this.data.analytics.shift();
    }
    this.save();
    return entry;
  }
}

module.exports = new Store();

