require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    game: 'Cartoon Rail Rush 3D',
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString()
  });
});

// Serve frontend build if present
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) res.status(200).send('Cartoon Rail Rush API Server is active. Start Vite frontend on port 5173!');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` 🏃 Cartoon Rail Rush - Backend Running!`);
  console.log(` 📡 Local API: http://localhost:${PORT}`);
  console.log(` 🤖 AI Engine: ${process.env.GEMINI_API_KEY ? 'Google Gemini Connected' : 'Local Heuristic AI Coach (Fallback)'}`);
  console.log(`===============================================`);
});

