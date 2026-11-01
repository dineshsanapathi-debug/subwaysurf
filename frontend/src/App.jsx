import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import Game from './game/Game';
import Controls from './game/Controls';
import GameUI from './components/GameUI';
import { CHARACTERS } from './game/characters';
import { soundEffects } from './audio/SoundEffects';
import { Canvas } from '@react-three/fiber';
import Player from './components/Player';

export default function App() {
  const [screen, setScreen] = useState('menu'); // 'menu' | 'characters' | 'playing' | 'pause' | 'gameover'
  const [selectedCharacter, setSelectedCharacter] = useState('Bhargav');
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('rail_rush_highscore') || '0', 10);
  });
  const [totalCoins, setTotalCoins] = useState(() => {
    return parseInt(localStorage.getItem('rail_rush_coins') || '0', 10);
  });

  const [theme, setTheme] = useState('auto'); // 'auto' (World Tour auto 500m) or 'indian_railway', 'tokyo_city', etc.
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rail_rush_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Game stats
  const [currentStats, setCurrentStats] = useState({
    score: 0,
    distance: 0,
    coins: 0,
    speed: 20,
    multiplier: 1,
    powerups: { magnet: 0, jetpack: 0, hoverboard: 0, multiplier: 0 }
  });

  // Backend / AI states
  const [leaderboard, setLeaderboard] = useState([]);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [adaptiveSettings, setAdaptiveSettings] = useState({
    levelName: 'AI Balanced Mode',
    speedBase: 20,
    speedMax: 38,
    trainSpawnRate: 0.3,
    powerupFrequency: 0.12,
    obstacleGap: 32
  });

  // Fetch leaderboard & adaptive settings on start
  useEffect(() => {
    fetchLeaderboard();
    fetchAdaptiveSettings();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/scores/leaderboard?limit=10');
      if (res.ok) {
        const data = await res.json();
        if (data.leaderboard) setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.warn('Backend leaderboard unreachable, using offline mode:', err.message);
    }
  };

  const fetchAdaptiveSettings = async (mode = 'auto') => {
    try {
      const res = await fetch(`/api/ai/adaptive-difficulty?playerPreference=${mode}&averageScore=${highScore}`);
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setAdaptiveSettings(data.settings);
      }
    } catch (err) {
      console.warn('AI adaptive settings error:', err.message);
    }
  };

  // Start Game
  const handleStartGame = () => {
    setScreen('playing');
    soundEffects.startMusic();
  };

  // Pause / Resume
  const handleTogglePause = () => {
    if (screen === 'playing') {
      setScreen('pause');
      soundEffects.stopMusic();
    } else if (screen === 'pause') {
      setScreen('playing');
      soundEffects.startMusic();
    }
  };

  const handleResumeGame = () => {
    setScreen('playing');
    soundEffects.startMusic();
  };

  const handleRestartGame = () => {
    setScreen('playing');
    soundEffects.startMusic();
  };

  const handleOpenMenu = () => {
    setScreen('menu');
    soundEffects.stopMusic();
  };

  // Character switching
  const handleSelectCharacter = (name) => {
    if (name === 'next') {
      setScreen('characters');
      return;
    }
    setSelectedCharacter(name);
  };

  // Game Over Handler
  const handleGameOver = async (finalData) => {
    soundEffects.stopMusic();
    setScreen('gameover');

    const finalScore = finalData.score || 0;
    const finalCoins = finalData.coins || 0;
    const finalDist = finalData.distance || 0;

    // Check high score
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('rail_rush_highscore', finalScore.toString());
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) { }
    }

    const updatedCoins = totalCoins + finalCoins;
    setTotalCoins(updatedCoins);
    localStorage.setItem('rail_rush_coins', updatedCoins.toString());

    // Save score to backend
    try {
      fetch('/api/scores/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user ? user.username : 'Guest Runner',
          score: finalScore,
          distance: finalDist,
          coins: finalCoins,
          characterUsed: selectedCharacter,
          runStats: finalData.runStats
        })
      }).then(() => fetchLeaderboard());
    } catch (e) { }

    // Trigger AI Run Analysis
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/analyze-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user ? user.username : 'Guest',
          score: finalScore,
          distance: finalDist,
          coins: finalCoins,
          characterUsed: selectedCharacter,
          jumps: finalData.runStats?.jumps || 0,
          slides: finalData.runStats?.slides || 0,
          hitObstacleType: finalData.runStats?.causeOfDeath || 'train'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiFeedback(data.feedback);
      }
    } catch (err) {
      console.warn('AI analysis request failed:', err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Coach interactive chat
  const handleAskAiCoach = async (question) => {
    const res = await fetch('/api/ai/ask-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        playerStats: {
          highScore,
          characterUsed: selectedCharacter
        }
      })
    });
    if (res.ok) {
      const data = await res.json();
      return data.answer;
    }
    return null;
  };

  // Auth Handlers
  const handleLogin = async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    setUser(data.user);
    localStorage.setItem('rail_rush_user', JSON.stringify(data.user));
    localStorage.setItem('rail_rush_token', data.token);
  };

  const handleRegister = async (username, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    setUser(data.user);
    localStorage.setItem('rail_rush_user', JSON.stringify(data.user));
    localStorage.setItem('rail_rush_token', data.token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('rail_rush_user');
    localStorage.removeItem('rail_rush_token');
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D Main Game Scene (Renders in all active modes) */}
      {(screen === 'playing' || screen === 'pause') && (
        <Game
          selectedCharacter={selectedCharacter}
          adaptiveSettings={adaptiveSettings}
          onGameOver={handleGameOver}
          onUpdateStats={setCurrentStats}
          theme={theme}
          isPaused={screen === 'pause'}
        />
      )}

      {/* Tokyo Subway Background for Menu / Start Screen */}
      {screen === 'menu' && (
        <div
          className="start-screen absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
          style={{ backgroundImage: `url('/tokyo-subway-background.png')` }}
        >
          {/* Subtle gradient vignette overlay for UI legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/35" />
        </div>
      )}

      {/* 3D Character Preview Stage for Character Select & Game Over Screens */}
      {(screen === 'characters' || screen === 'gameover') && (
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 1.8, 4.5], fov: 45 }}>
            <ambientLight intensity={0.9} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} />
            <pointLight position={[-3, 2, 2]} intensity={0.8} color="#38bdf8" />
            <React.Suspense fallback={null}>
              <Player
                characterName={selectedCharacter}
                isMenuPreview={true}
                posY={0.2}
              />
            </React.Suspense>
            {/* Spinning pedestal */}
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[1.6, 1.8, 0.4, 32]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
            </mesh>
            <mesh position={[0, 0.01, 0]}>
              <ringGeometry args={[1.3, 1.55, 32]} />
              <meshBasicMaterial color="#06b6d4" />
            </mesh>
          </Canvas>
        </div>
      )}

      {/* Controls Overlay (Keyboard & Touch Swipes) */}
      {screen === 'playing' && (
        <Controls
          onMoveLeft={() => window.gameActions?.moveLeft()}
          onMoveRight={() => window.gameActions?.moveRight()}
          onJump={() => window.gameActions?.jump()}
          onSlide={() => window.gameActions?.slide()}
          onHoverboard={() => window.gameActions?.hoverboard()}
          onTogglePause={handleTogglePause}
          isPlaying={screen === 'playing'}
        />
      )}

      {/* UI Screens Overlay */}
      <GameUI
        screen={screen}
        stats={currentStats}
        highScore={highScore}
        selectedCharacter={selectedCharacter}
        onSelectCharacter={handleSelectCharacter}
        onStartGame={handleStartGame}
        onResumeGame={handleResumeGame}
        onRestartGame={handleRestartGame}
        onOpenMenu={handleOpenMenu}
        onTogglePause={handleTogglePause}
        onActivateHoverboard={() => window.gameActions?.hoverboard()}
        leaderboard={leaderboard}
        aiFeedback={aiFeedback}
        isAiLoading={isAiLoading}
        adaptiveSettings={adaptiveSettings}
        onAskAiCoach={handleAskAiCoach}
        onUpdateDifficultyMode={fetchAdaptiveSettings}
        theme={theme}
        onChangeTheme={setTheme}
        user={user}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
      />
    </div>
  );
}

