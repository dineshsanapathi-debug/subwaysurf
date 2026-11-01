const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../models/Store');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_subway_runner_token_key_2025';

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be 3-20 characters' });
    }

    const existing = store.findUserByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = store.createUser({ username, passwordHash });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        username: user.username,
        bestScore: user.bestScore,
        totalCoins: user.totalCoins,
        runsCount: user.runsCount
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = store.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash || '');
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        username: user.username,
        bestScore: user.bestScore,
        totalCoins: user.totalCoins,
        runsCount: user.runsCount
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
};

exports.getProfile = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = store.findUserById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = store.getUserStats(user.username);
    res.json({ user, stats });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

