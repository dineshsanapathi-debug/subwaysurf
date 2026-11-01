import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Trophy,
  Bot,
  Settings,
  Shield,
  Magnet,
  Flame,
  User,
  Sparkles,
  X,
  Send,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { CHARACTERS } from '../game/characters';
import { THEMES } from './WorldThemes';

export default function GameUI({
  screen = 'menu', // 'menu', 'characters', 'playing', 'pause', 'gameover'
  stats = {},
  highScore = 0,
  selectedCharacter = 'Dash',
  onSelectCharacter,
  onStartGame,
  onResumeGame,
  onRestartGame,
  onOpenMenu,
  onTogglePause,
  onActivateHoverboard,
  leaderboard = [],
  aiFeedback = null,
  isAiLoading = false,
  adaptiveSettings = {},
  onAskAiCoach,
  onUpdateDifficultyMode,
  theme = 'auto',
  onChangeTheme,
  user = null,
  onLogin,
  onRegister,
  onLogout
}) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWorldSelect, setShowWorldSelect] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [liveFps, setLiveFps] = useState(60);

  // Smooth real-time FPS monitoring updated every 500ms
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId;

    const countFrame = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 500) {
        setLiveFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(countFrame);
    };
    rafId = requestAnimationFrame(countFrame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // AI chat state
  const [coachQuestion, setCoachQuestion] = useState('');
  const [coachHistory, setCoachHistory] = useState([
    {
      sender: 'coach',
      text: "Yo! I'm Coach Spark, your AI Rail Rush coach! Ask me anything about dodging trains, characters, or maximizing your score!"
    }
  ]);
  const [askingAi, setAskingAi] = useState(false);

  const handleAskCoach = async (e) => {
    e.preventDefault();
    if (!coachQuestion.trim() || askingAi) return;

    const q = coachQuestion;
    setCoachQuestion('');
    setCoachHistory((prev) => [...prev, { sender: 'user', text: q }]);
    setAskingAi(true);

    try {
      const res = await onAskAiCoach(q);
      setCoachHistory((prev) => [
        ...prev,
        { sender: 'coach', text: res || "Keep sliding under high barriers and stack that 2x multiplier!" }
      ]);
    } catch (err) {
      setCoachHistory((prev) => [
        ...prev,
        { sender: 'coach', text: "Always stay in the center lane so you have two escape routes!" }
      ]);
    } finally {
      setAskingAi(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setAuthError('Please fill in both fields');
      return;
    }
    try {
      if (authMode === 'login') {
        await onLogin(usernameInput, passwordInput);
      } else {
        await onRegister(usernameInput, passwordInput);
      }
      setShowAuthModal(false);
      setUsernameInput('');
      setPasswordInput('');
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 font-sans text-white">
      {/* ================= IN-GAME HUD (EXACT SCREENSHOT LAYOUT) ================= */}
      {screen === 'playing' && (
        <div className="w-full h-full p-3 sm:p-5 flex flex-col justify-between">
          {/* Top Header Row */}
          <div className="flex items-center justify-between w-full pointer-events-auto">
            {/* Top Left: Yellow Pause Button & Coin Capsule */}
            <div className="flex items-center gap-3">
              {/* Glossy Yellow Pause Button */}
              <button
                onClick={onTogglePause}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border-2 border-amber-200/80 shadow-[0_4px_12px_rgba(245,158,11,0.5)] flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Pause"
              >
                <div className="flex gap-1.5 items-center justify-center">
                  <div className="w-1.5 sm:w-2 h-5 sm:h-6 bg-slate-900 rounded-sm" />
                  <div className="w-1.5 sm:w-2 h-5 sm:h-6 bg-slate-900 rounded-sm" />
                </div>
              </button>

              {/* Mango Counter Pill */}
              <div className="bg-[#102447]/90 border border-amber-500/40 rounded-full pl-1.5 pr-4 py-1.5 flex items-center gap-2 shadow-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-300 border border-yellow-200 flex items-center justify-center shadow-inner text-base">
                  🥭
                </div>
                <span className="text-xl sm:text-2xl font-black text-white tracking-wide tabular-nums">
                  {stats.coins || 0}
                </span>
              </div>
            </div>

            {/* Top Center: Star Multiplier & Main Score */}
            <div className="flex items-center gap-2 sm:gap-3 bg-[#102447]/80 border border-blue-400/30 rounded-2xl px-4 py-1.5 sm:py-2 shadow-xl">
              {/* 3D Blue Star Multiplier Badge */}
              <div className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl shadow-md">
                <span>★</span>
                <span>x{stats.multiplier || 1}</span>
              </div>
              {/* Score Numbers */}
              <span className="text-2xl sm:text-4xl font-black text-white tracking-wider tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                {stats.score?.toLocaleString() || 0}
              </span>
            </div>

            {/* Top Right: Best High Score & Live Performance FPS Badges */}
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-md tracking-wider backdrop-blur-sm ${
                liveFps >= 50
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                  : liveFps >= 30
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
              }`}>
                ⚡ {liveFps} FPS
              </span>

              <div className="flex items-center gap-2 bg-[#102447]/90 border border-amber-500/40 rounded-full pl-2 pr-4 py-1.5 shadow-lg">
                <span className="text-lg">🏆</span>
                <div className="flex items-baseline gap-1 text-xs sm:text-sm font-black">
                  <span className="text-amber-400">Best:</span>
                  <span className="text-white tabular-nums">{highScore.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Floating Badges: Character & Jetpack Power-up (Matching Screenshot!) */}
          <div className="absolute right-4 top-24 flex flex-col gap-3 pointer-events-auto">
            {/* Character Badge */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0f2854]/90 border-2 border-cyan-400/60 p-1 shadow-xl flex items-center justify-center relative overflow-hidden group">
              {CHARACTERS[selectedCharacter]?.avatar ? (
                <img
                  src={CHARACTERS[selectedCharacter].avatar}
                  alt={selectedCharacter}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div
                  className="w-full h-full rounded-xl flex items-center justify-center text-3xl font-black shadow-inner"
                  style={{ backgroundColor: CHARACTERS[selectedCharacter]?.color || '#2563eb' }}
                >
                  {CHARACTERS[selectedCharacter]?.icon || '🧢'}
                </div>
              )}
              <span className="absolute bottom-0 text-[9px] font-black uppercase tracking-tight text-white bg-blue-700/80 px-1 rounded">
                {selectedCharacter}
              </span>
            </div>

            {/* Hoverboard Power-up Button */}
            <button
              onClick={onActivateHoverboard}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-cyan-600 to-blue-800 border-2 border-cyan-300/80 p-1 shadow-[0_4px_16px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center active:scale-95 transition-all relative"
              title="Activate Hoverboard (H key)"
            >
              <span className="text-2xl">🛹</span>
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center border border-white shadow">
                {stats.powerups?.hoverboard > 0 ? Math.ceil(stats.powerups.hoverboard) : '3'}
              </span>
            </button>

            {/* Jetpack Power-up Button */}
            <button
              onClick={() => {
                if (window.gameActions?.jetpack) window.gameActions.jetpack();
              }}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 p-1 shadow-[0_4px_16px_rgba(249,115,22,0.4)] flex flex-col items-center justify-center active:scale-95 transition-all relative ${
                stats.powerups?.jetpack > 0
                  ? 'bg-gradient-to-b from-amber-400 via-orange-500 to-rose-600 border-amber-300 animate-pulse'
                  : 'bg-gradient-to-b from-orange-600 via-amber-600 to-orange-800 border-orange-300/80'
              }`}
              title="Activate Jetpack (J Key)"
            >
              <span className="text-2xl">🚀</span>
              <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-950 font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center border border-white shadow">
                {stats.powerups?.jetpack > 0 ? Math.ceil(stats.powerups.jetpack) : 'FLY'}
              </span>
            </button>

            {/* 500-Metre Upper Skyway Route Button */}
            <button
              onClick={() => {
                if (window.gameActions?.elevatedRoute) window.gameActions.elevatedRoute();
              }}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 p-1 shadow-[0_4px_16px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center active:scale-95 transition-all relative ${
                stats.elevatedRoute?.active
                  ? 'bg-gradient-to-b from-cyan-400 via-sky-500 to-blue-600 border-cyan-200 animate-pulse'
                  : 'bg-gradient-to-b from-sky-700 via-cyan-800 to-slate-900 border-cyan-400/80'
              }`}
              title="Activate 500-Metre Upper Skyway (E Key)"
            >
              <span className="text-2xl">⚡</span>
              <span className="absolute -bottom-1 -right-1 bg-cyan-400 text-slate-950 font-black text-[10px] px-1 py-0.5 rounded-full flex items-center justify-center border border-white shadow">
                {stats.elevatedRoute?.active ? `${Math.floor(stats.elevatedRoute.distance)}m` : '500M'}
              </span>
            </button>
          </div>

          {/* Bottom On-Screen Arcade Arrow Controls (Exact Match to Screenshot!) */}
          <div className="flex items-end justify-between w-full pointer-events-auto pb-2">
            {/* Bottom Left: Left and Right Circular Blue Pads */}
            <div className="flex items-center gap-3">
              {/* Left Arrow Button */}
              <button
                onPointerDown={(e) => { e.preventDefault(); window.gameActions?.moveLeft(); }}
                onClick={() => window.gameActions?.moveLeft()}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-cyan-400 via-blue-600 to-blue-800 border-2 sm:border-4 border-cyan-200/90 shadow-[0_6px_20px_rgba(37,99,235,0.6)] flex items-center justify-center active:scale-90 transition-transform active:brightness-125"
                aria-label="Move Left"
              >
                <ArrowLeft size={36} className="text-white stroke-[3.5]" />
              </button>

              {/* Right Arrow Button */}
              <button
                onPointerDown={(e) => { e.preventDefault(); window.gameActions?.moveRight(); }}
                onClick={() => window.gameActions?.moveRight()}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-cyan-400 via-blue-600 to-blue-800 border-2 sm:border-4 border-cyan-200/90 shadow-[0_6px_20px_rgba(37,99,235,0.6)] flex items-center justify-center active:scale-90 transition-transform active:brightness-125"
                aria-label="Move Right"
              >
                <ArrowRight size={36} className="text-white stroke-[3.5]" />
              </button>
            </div>

            {/* Bottom Right: Up (Jump) and Down (Slide) Circular Blue Pads */}
            <div className="flex flex-col items-center gap-3">
              {/* Jump Up Arrow Button */}
              <button
                onPointerDown={(e) => { e.preventDefault(); window.gameActions?.jump(); }}
                onClick={() => window.gameActions?.jump()}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-cyan-400 via-blue-600 to-blue-800 border-2 sm:border-4 border-cyan-200/90 shadow-[0_6px_20px_rgba(37,99,235,0.6)] flex items-center justify-center active:scale-90 transition-transform active:brightness-125"
                aria-label="Jump"
              >
                <ArrowUp size={36} className="text-white stroke-[3.5]" />
              </button>

              {/* Slide Down Arrow Button */}
              <button
                onPointerDown={(e) => { e.preventDefault(); window.gameActions?.slide(); }}
                onClick={() => window.gameActions?.slide()}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-cyan-400 via-blue-600 to-blue-800 border-2 sm:border-4 border-cyan-200/90 shadow-[0_6px_20px_rgba(37,99,235,0.6)] flex items-center justify-center active:scale-90 transition-transform active:brightness-125"
                aria-label="Slide"
              >
                <ArrowDown size={36} className="text-white stroke-[3.5]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN MENU ================= */}
      {screen === 'menu' && (
                <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 pointer-events-auto">
                  {/* Top Bar Header */}
                  <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md border border-amber-400/40 px-3 py-1.5 rounded-2xl shadow-xl">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-cyan-400 flex items-center justify-center font-black text-sm text-slate-950 shadow">
                        ⚡
                      </div>
                      <div>
                        <h2 className="text-sm font-black tracking-wide text-white leading-none">SUBWAY SURFERS</h2>
                        <span className="text-[10px] font-bold text-amber-300">TOKYO METRO EDITION</span>
                      </div>
                    </div>

                      {/* Profile / Auth & Settings */}
                      <div className="flex items-center gap-2">
                        {user ? (
                            <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-lg">
                              <User size={15} className="text-cyan-400" />
                              <span className="text-xs font-bold text-white">{user.username}</span>
                              <button
                                onClick={onLogout}
                                className="text-[10px] text-rose-400 hover:text-rose-300 font-bold ml-1.5"
                              >
                                Logout
                              </button>
                            </div>
                            ) : (
                            <button
                              onClick={() => setShowAuthModal(true)}
                              className="flex items-center gap-1.5 bg-slate-950/70 hover:bg-slate-900 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-bold text-white transition-all shadow-lg active:scale-95"
                            >
                              <User size={15} className="text-cyan-400" />
                              <span>Login</span>
                            </button>
              )}

                            <button
                              onClick={() => setShowSettings(true)}
                              className="w-9 h-9 rounded-xl bg-slate-950/70 hover:bg-slate-900 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-slate-200 transition-all shadow-lg active:scale-95"
                            >
                              <Settings size={17} />
                            </button>
                          </div>
          </div>

                          {/* Center Space: Left Open & Unobstructed to Show Full Character Crew Wallpaper! */}
                          <div className="flex-1 flex flex-col items-center justify-center pointer-events-none">
                            {/* Floating Arcade Logo Banner */}
                            <div className="bg-slate-950/60 backdrop-blur-sm border border-yellow-400/50 rounded-2xl px-5 py-2 shadow-2xl text-center transform -rotate-1 hover:rotate-0 transition-transform pointer-events-auto">
                              <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-pink-500 drop-shadow-[0_4px_10px_rgba(245,158,11,0.6)]">
                                SUBWAY SURFERS
                              </h1>
                              <span className="text-[11px] sm:text-xs font-extrabold tracking-widest text-cyan-300 uppercase">
                                ★ 3D RAIL RUSH ★
                              </span>
                            </div>
                          </div>

                            {/* Bottom Control Bar */}
                            <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-3">
                              {/* Runner & World Badges */}
                              <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
                                {/* Selected Runner Badge */}
                                <div
                                  onClick={() => onSelectCharacter('next')}
                                  className="cursor-pointer bg-slate-950/80 hover:bg-slate-900/90 backdrop-blur-md border border-cyan-400/50 rounded-full px-4 py-1.5 flex items-center justify-between gap-2.5 shadow-2xl active:scale-95 transition-all flex-1 w-full"
                                >
                                  <div className="flex items-center gap-2">
                                    {CHARACTERS[selectedCharacter]?.avatar ? (
                                      <img
                                        src={CHARACTERS[selectedCharacter].avatar}
                                        alt={selectedCharacter}
                                        className="w-7 h-7 rounded-full object-cover border border-amber-400 shadow"
                                      />
                                    ) : (
                                      <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-base shadow"
                                        style={{ backgroundColor: CHARACTERS[selectedCharacter]?.color || '#2563eb' }}
                                      >
                                        {CHARACTERS[selectedCharacter]?.icon || '🧢'}
                                      </div>
                                    )}
                                    <div className="text-left text-xs">
                                      <span className="text-slate-400 text-[10px] block leading-tight font-semibold">Runner:</span>
                                      <strong className="text-white font-black truncate max-w-[110px] block">{selectedCharacter}</strong>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-400/20 px-2 py-0.5 rounded-full ml-1">
                                    Switch
                                  </span>
                                </div>

                                {/* World Tour Location Badge */}
                                <div
                                  onClick={() => setShowWorldSelect(true)}
                                  className="cursor-pointer bg-slate-950/80 hover:bg-slate-900/90 backdrop-blur-md border border-amber-400/50 rounded-full px-4 py-1.5 flex items-center justify-between gap-2.5 shadow-2xl active:scale-95 transition-all flex-1 w-full"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">
                                      {theme === 'auto' ? '🌐' : (THEMES.find((t) => t.id === theme)?.icon || '🚂')}
                                    </span>
                                    <div className="text-left text-xs">
                                      <span className="text-slate-400 text-[10px] block leading-tight font-semibold">World Tour:</span>
                                      <strong className="text-white font-black truncate max-w-[110px] block">
                                        {theme === 'auto' ? 'All 5 Worlds' : (THEMES.find((t) => t.id === theme)?.name || 'Indian Rail')}
                                      </strong>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-bold text-cyan-400 uppercase bg-cyan-400/20 px-2 py-0.5 rounded-full ml-1">
                                    {theme === 'auto' ? '500m Loop' : 'Change'}
                                  </span>
                                </div>
                              </div>

                                {/* Giant Arcade Play Button */}
                                <button
                                  onClick={onStartGame}
                                  className="w-full py-4 px-8 rounded-3xl bg-gradient-to-r from-amber-400 via-pink-500 to-rose-600 hover:from-amber-300 hover:to-rose-500 text-white font-black text-2xl tracking-wider shadow-[0_8px_30px_rgba(244,63,94,0.6)] active:scale-95 transition-all flex items-center justify-center gap-3 group border-2 border-yellow-200/60"
                                >
                                  <Play size={30} className="fill-white group-hover:scale-110 transition-transform drop-shadow" />
                                  <span>PLAY NOW</span>
                                </button>

                                {/* Squad, Leaderboard, AI Coach pills */}
                                <div className="grid grid-cols-3 gap-2 w-full">
                                  <button
                                    onClick={() => onSelectCharacter('next')}
                                    className="py-2.5 px-2 rounded-2xl bg-slate-950/80 hover:bg-slate-900/90 backdrop-blur-md border border-slate-700/80 flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-lg text-xs font-bold text-pink-300"
                                  >
                                    <User size={16} className="text-pink-400" />
                                    <span>SQUAD</span>
                                  </button>

                                  <button
                                    onClick={() => setShowLeaderboard(true)}
                                    className="py-2.5 px-2 rounded-2xl bg-slate-950/80 hover:bg-slate-900/90 backdrop-blur-md border border-slate-700/80 flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-lg text-xs font-bold text-yellow-300"
                                  >
                                    <Trophy size={16} className="text-yellow-400" />
                                    <span>RANKS</span>
                                  </button>

                                  <button
                                    onClick={() => setShowAiModal(true)}
                                    className="py-2.5 px-2 rounded-2xl bg-slate-950/80 hover:bg-slate-900/90 backdrop-blur-md border border-slate-700/80 flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-lg text-xs font-bold text-cyan-300"
                                  >
                                    <Bot size={16} className="text-cyan-400" />
                                    <span>AI COACH</span>
                                  </button>
                                </div>
                              </div>
                            </div>
      )}

                            {/* ================= CHARACTER SELECTION SCREEN ================= */}
                            {screen === 'characters' && (
                              <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 pointer-events-auto bg-slate-950/85 backdrop-blur-md overflow-y-auto">
                                {/* Header */}
                                <div className="w-full max-w-5xl flex items-center justify-between">
                                  <div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white">SUBWAY SURF SQUAD</h2>
                                    <span className="text-xs font-bold text-cyan-400">CHOOSE YOUR RUNNER</span>
                                  </div>
                                  <button
                                    onClick={onOpenMenu}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-bold text-white transition-all shadow"
                                  >
                                    Back to Menu
                                  </button>
                                </div>

                                {/* 5 Subway Surfers Characters including Bhargav */}
                                <div className="w-full max-w-6xl grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 my-auto py-2">
                                  {['Bhargav', 'Jake', 'Tricky', 'Fresh', 'Yutani'].map((charKey) => {
                                    const c = CHARACTERS[charKey];
                                    if (!c) return null;
                                    const isSelected = selectedCharacter === c.name || (selectedCharacter === 'Dash' && c.name === 'Jake');

                                    return (
                                      <div
                                        key={c.name}
                                        onClick={() => onSelectCharacter(c.name)}
                                        className={`cursor-pointer rounded-3xl p-3.5 sm:p-4 border-2 transition-all flex flex-col justify-between ${isSelected
                                            ? 'border-pink-500 bg-slate-900/95 shadow-[0_0_25px_rgba(244,63,94,0.4)] scale-105'
                                            : 'border-slate-800/90 bg-slate-900/60 hover:border-slate-700 hover:scale-[1.02]'
                                          }`}
                                      >
                                        <div>
                                          {/* Character Avatar Icon / Photo */}
                                          {c.avatar ? (
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-lg mb-3 border-2 border-amber-400 relative">
                                              <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                                              <span className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded-bl shadow">
                                                CUSTOM
                                              </span>
                                            </div>
                                          ) : (
                                            <div
                                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg mb-3"
                                              style={{ backgroundColor: c.color }}
                                            >
                                              {c.name === 'Yutani' ? '👽' : c.name === 'Fresh' ? '📻' : c.name === 'Tricky' ? '👓' : '🧢'}
                                            </div>
                                          )}
                                          <div className="flex items-center gap-1.5">
                                            <h3 className="text-lg sm:text-xl font-black text-white">{c.name}</h3>
                                            {c.avatar && <span className="text-xs">⭐</span>}
                                          </div>
                                          <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide">{c.title}</p>
                                          <p className="text-xs text-slate-300 mt-2 line-clamp-2">{c.description}</p>

                                          {/* Stats */}
                                          <div className="mt-3 space-y-1.5 text-[11px]">
                                            <div>
                                              <div className="flex justify-between text-slate-400 font-bold mb-0.5">
                                                <span>Speed</span>
                                                <span>{c.stats.speed}%</span>
                                              </div>
                                              <div className="w-full bg-slate-800 rounded-full h-1.5">
                                                <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${c.stats.speed}%` }} />
                                              </div>
                                            </div>
                                            <div>
                                              <div className="flex justify-between text-slate-400 font-bold mb-0.5">
                                                <span>Jump Arc</span>
                                                <span>{c.stats.jump}%</span>
                                              </div>
                                              <div className="w-full bg-slate-800 rounded-full h-1.5">
                                                <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${c.stats.jump}%` }} />
                                              </div>
                                            </div>
                                            <div>
                                              <div className="flex justify-between text-slate-400 font-bold mb-0.5">
                                                <span>Magnet</span>
                                                <span>{c.stats.magnet}%</span>
                                              </div>
                                              <div className="w-full bg-slate-800 rounded-full h-1.5">
                                                <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${c.stats.magnet}%` }} />
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="mt-4">
                                          <div className="bg-slate-800/80 rounded-xl p-1.5 text-center text-[11px] font-bold text-amber-300 mb-2">
                                            ⚡ {c.ability}
                                          </div>
                                          <button
                                            className={`w-full py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${isSelected
                                                ? 'bg-gradient-to-r from-pink-500 to-amber-500 text-white shadow-lg'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                              }`}
                                          >
                                            {isSelected ? 'SELECTED' : 'SELECT'}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                <button
                                  onClick={onStartGame}
                                  className="w-full max-w-sm py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-black text-lg sm:text-xl shadow-xl active:scale-95 transition-all mt-2"
                                >
                                  START WITH {(selectedCharacter === 'Dash' ? 'Jake' : selectedCharacter).toUpperCase()}
                                </button>
                              </div>
                            )}

                            {/* ================= PAUSE MODAL ================= */}
                            {screen === 'pause' && (
                              <div className="w-full h-full flex items-center justify-center p-4 pointer-events-auto bg-slate-950/80 backdrop-blur-md">
                                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl flex flex-col gap-4">
                                  <h2 className="text-3xl font-black text-white tracking-wide">GAME PAUSED</h2>

                                  <div className="flex flex-col gap-3 mt-2">
                                    <button
                                      onClick={onResumeGame}
                                      className="py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-black text-lg active:scale-95 shadow-lg transition-all"
                                    >
                                      RESUME
                                    </button>
                                    <button
                                      onClick={onRestartGame}
                                      className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base active:scale-95 transition-all"
                                    >
                                      RESTART RUN
                                    </button>
                                    <button
                                      onClick={onOpenMenu}
                                      className="py-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-bold text-base active:scale-95 transition-all"
                                    >
                                      MAIN MENU
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ================= GAME OVER SCREEN ================= */}
                            {screen === 'gameover' && (
                              <div className="w-full h-full flex items-center justify-center p-4 pointer-events-auto bg-slate-950/85 backdrop-blur-md overflow-y-auto">
                                <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-lg w-full text-center shadow-2xl my-auto">
                                  <span className="text-rose-500 font-black text-sm uppercase tracking-widest">CRASH IMPACT!</span>
                                  <h2 className="text-4xl font-black text-white mt-1">RUN OVER</h2>

                                  {/* Run Score Card */}
                                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mt-4 grid grid-cols-3 gap-2">
                                    <div>
                                      <span className="text-xs text-slate-400 uppercase font-bold">SCORE</span>
                                      <p className="text-2xl font-black text-amber-300">{stats.score?.toLocaleString() || 0}</p>
                                    </div>
                                    <div>
                                      <span className="text-xs text-slate-400 uppercase font-bold">DISTANCE</span>
                                      <p className="text-2xl font-black text-white">{stats.distance || 0}m</p>
                                    </div>
                                    <div>
                                      <span className="text-xs text-slate-400 uppercase font-bold">MANGOES</span>
                                      <p className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
                                        <span>🥭</span> {stats.coins || 0}
                                      </p>
                                    </div>
                                  </div>

                                  {/* AI Coach Insights Card */}
                                  <div className="bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-cyan-500/40 rounded-2xl p-4 mt-4 text-left relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Bot size={20} className="text-cyan-400" />
                                        <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                                          AI COACH ANALYSIS {aiFeedback?.source ? `(${aiFeedback.source})` : ''}
                                        </span>
                                      </div>
                                      {aiFeedback?.rating && (
                                        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                                          RANK {aiFeedback.rating}
                                        </span>
                                      )}
                                    </div>

                                    {isAiLoading ? (
                                      <div className="py-4 text-center text-xs font-bold text-cyan-400 animate-pulse">
                                        🤖 Gemini Coach is analyzing your run metrics...
                                      </div>
                                    ) : aiFeedback ? (
                                      <div className="space-y-2 text-xs">
                                        <p className="font-extrabold text-white text-sm">{aiFeedback.headline}</p>
                                        <p className="text-slate-300 leading-relaxed">{aiFeedback.feedback}</p>
                                        <div className="bg-cyan-950/40 border border-cyan-800/40 rounded-xl p-2.5 mt-2">
                                          <p className="text-amber-300 font-bold mb-0.5">💡 Pro Tip:</p>
                                          <p className="text-slate-300">{aiFeedback.proTip}</p>
                                        </div>
                                        {aiFeedback.challenge && (
                                          <div className="bg-pink-950/40 border border-pink-800/40 rounded-xl p-2.5">
                                            <p className="text-pink-300 font-bold mb-0.5">🎯 Next Run Challenge:</p>
                                            <p className="text-slate-300">{aiFeedback.challenge}</p>
                                            <span className="text-[10px] text-amber-400 font-bold">
                                              Reward: +{aiFeedback.rewardCoins || 50} bonus mangoes 🥭
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400">Great run! Ready for another sprint?</p>
                                    )}
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="grid grid-cols-2 gap-3 mt-5">
                                    <button
                                      onClick={onRestartGame}
                                      className="py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-black text-lg active:scale-95 shadow-xl transition-all flex items-center justify-center gap-2"
                                    >
                                      <RotateCcw size={20} />
                                      <span>PLAY AGAIN</span>
                                    </button>
                                    <button
                                      onClick={onOpenMenu}
                                      className="py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base active:scale-95 transition-all"
                                    >
                                      MAIN MENU
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ================= GLOBAL LEADERBOARD MODAL ================= */}
                            {showLeaderboard && (
                              <div className="w-full h-full flex items-center justify-center p-4 pointer-events-auto bg-slate-950/80 backdrop-blur-md">
                                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col max-h-[85vh]">
                                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                    <div className="flex items-center gap-2">
                                      <Trophy size={22} className="text-yellow-400" />
                                      <h3 className="text-xl font-black text-white">GLOBAL LEADERBOARD</h3>
                                    </div>
                                    <button
                                      onClick={() => setShowLeaderboard(false)}
                                      className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>

                                  <div className="overflow-y-auto my-3 space-y-2 pr-1">
                                    {leaderboard.length === 0 ? (
                                      <p className="text-center text-slate-400 text-sm py-8">Loading high scores...</p>
                                    ) : (
                                      leaderboard.map((item, idx) => (
                                        <div
                                          key={item.id || idx}
                                          className={`flex items-center justify-between p-3 rounded-2xl ${idx === 0
                                              ? 'bg-amber-500/20 border border-amber-500/40'
                                              : idx === 1
                                                ? 'bg-slate-300/10 border border-slate-400/30'
                                                : idx === 2
                                                  ? 'bg-amber-800/20 border border-amber-700/30'
                                                  : 'bg-slate-800/40 border border-slate-800'
                                            }`}
                                        >
                                          <div className="flex items-center gap-3">
                                            <span className="w-6 font-black text-sm text-center text-slate-400">
                                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                            </span>
                                            <div>
                                              <p className="text-sm font-bold text-white">{item.username}</p>
                                              <span className="text-[10px] text-cyan-400 uppercase font-semibold">
                                                {item.characterUsed || 'Dash'} • {item.distance || 0}m
                                              </span>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-base font-black text-amber-300 tabular-nums">
                                              {item.score?.toLocaleString()}
                                            </p>
                                            <span className="text-[10px] text-amber-400 font-semibold">{item.coins || 0} mangoes 🥭</span>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>

                                  <button
                                    onClick={() => setShowLeaderboard(false)}
                                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm text-white transition-all mt-auto"
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* ================= AI COACH & ASSISTANT MODAL ================= */}
                            {showAiModal && (
                              <div className="w-full h-full flex items-center justify-center p-4 pointer-events-auto bg-slate-950/80 backdrop-blur-md">
                                <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col max-h-[88vh]">
                                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                    <div className="flex items-center gap-2">
                                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                                        <Bot size={20} />
                                      </div>
                                      <div>
                                        <h3 className="text-lg font-black text-white">AI GAME ASSISTANT</h3>
                                        <span className="text-[10px] text-cyan-400 font-bold">GEMINI COGNITIVE ENGINE</span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => setShowAiModal(false)}
                                      className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>

                                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 my-3">
                                    <span className="text-[10px] font-black uppercase text-cyan-400">Current AI Difficulty Tuning</span>
                                    <div className="flex items-center justify-between mt-1">
                                      <div>
                                        <h4 className="text-sm font-black text-white">
                                          {adaptiveSettings.levelName || 'AI Balanced Mode'}
                                        </h4>
                                        <p className="text-xs text-slate-300 mt-0.5">
                                          {adaptiveSettings.description || 'Optimized speed curve and train reaction windows.'}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                      {['easy', 'auto', 'hard'].map((mode) => (
                                        <button
                                          key={mode}
                                          onClick={() => onUpdateDifficultyMode(mode)}
                                          className="py-1.5 px-2 rounded-xl text-xs font-bold uppercase transition-all bg-slate-700/60 hover:bg-slate-700 text-slate-300 active:scale-95"
                                        >
                                          {mode === 'auto' ? '⚡ AI Auto' : mode}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2 max-h-56">
                                    {coachHistory.map((msg, i) => (
                                      <div
                                        key={i}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                      >
                                        <div
                                          className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${msg.sender === 'user'
                                              ? 'bg-pink-600 text-white rounded-br-none'
                                              : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                                            }`}
                                        >
                                          {msg.text}
                                        </div>
                                      </div>
                                    ))}
                                    {askingAi && (
                                      <div className="text-xs text-cyan-400 animate-pulse flex items-center gap-1.5 p-2">
                                        <Bot size={14} />
                                        <span>Coach Spark is typing advice...</span>
                                      </div>
                                    )}
                                  </div>

                                  <form onSubmit={handleAskCoach} className="flex gap-2 mt-auto pt-2 border-t border-slate-800">
                                    <input
                                      type="text"
                                      value={coachQuestion}
                                      onChange={(e) => setCoachQuestion(e.target.value)}
                                      placeholder="Ask coach: 'How to dodge trains?' or 'Best perks?'"
                                      className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                                    />
                                    <button
                                      type="submit"
                                      disabled={askingAi}
                                      className="px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-black text-xs flex items-center justify-center transition-all disabled:opacity-50"
                                    >
                                      <Send size={16} />
                                    </button>
                                  </form>
                                </div>
                              </div>
                            )}

                            {/* ================= SETTINGS MODAL ================= */}
                            {showSettings && (
                              <div className="w-full h-full flex items-center justify-center p-4 pointer-events-auto bg-slate-950/80 backdrop-blur-md">
                                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4">
                                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                    <h3 className="text-xl font-black text-white">SETTINGS</h3>
                                    <button
                                      onClick={() => setShowSettings(false)}
                                      className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>

                                  <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-800">
                                    <span className="text-xs font-bold text-cyan-400 uppercase">Controls Guide</span>
                                    <ul className="text-xs text-slate-300 space-y-1.5 mt-2">
                                      <li><strong className="text-white">← / → :</strong> Switch Railway Lanes</li>
                                      <li><strong className="text-white">↑ (Up) :</strong> Jump over low hurdles & climb train ramps</li>
                                      <li><strong className="text-white">↓ (Down) :</strong> Slide under high barriers</li>
                                      <li><strong className="text-white">H key / 🛹 icon :</strong> Activate Hoverboard shield</li>
                                      <li><strong className="text-white">J key / 🚀 icon :</strong> Jetpack Skyway flight</li>
                                      <li><strong className="text-white">E key / ⚡ icon :</strong> 500-Metre Elevated Skyway Route</li>
                                      <li><strong className="text-white">Space / Yellow Button :</strong> Pause game / Skip intro</li>
                                    </ul>
                                  </div>

                                  <button
                                    onClick={() => setShowSettings(false)}
                                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm text-white transition-all"
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* ================= WORLD TOUR / LOCATIONS MODAL ================= */}
                            {showWorldSelect && (
                              <div className="w-full h-full flex items-center justify-center p-3 sm:p-4 pointer-events-auto bg-slate-950/85 backdrop-blur-md z-50">
                                <div className="bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-4 sm:p-6 max-w-lg w-full shadow-[0_10px_40px_rgba(245,158,11,0.3)] flex flex-col gap-4 max-h-[92vh] overflow-hidden">
                                  {/* Modal Header */}
                                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-2xl">🌐</span>
                                      <div>
                                        <h3 className="text-lg sm:text-xl font-black text-white leading-none">WORLD TOUR</h3>
                                        <span className="text-[11px] font-bold text-amber-300">5 Themed Game Locations</span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => setShowWorldSelect(false)}
                                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>

                                  {/* World Tour Auto-Progression Option */}
                                  <div
                                    onClick={() => {
                                      onChangeTheme('auto');
                                      setShowWorldSelect(false);
                                    }}
                                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between shadow-lg ${
                                      theme === 'auto'
                                        ? 'bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-cyan-500/20 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-cyan-400 flex items-center justify-center text-xl shadow">
                                        🌐
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <strong className="text-sm font-black text-white">World Tour Mode</strong>
                                          <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase">
                                            Recommended
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-slate-300 mt-0.5">
                                          Seamlessly travels through all 5 worlds every 500 metres!
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${theme === 'auto' ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
                                        {theme === 'auto' ? 'ACTIVE' : 'SELECT'}
                                      </span>
                                    </div>
                                  </div>

                                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                                    Or Choose Starting Environment:
                                  </span>

                                  {/* List of 5 Worlds */}
                                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                    {THEMES.map((t, idx) => {
                                      const isSelected = theme === t.id;
                                      return (
                                        <div
                                          key={t.id}
                                          onClick={() => {
                                            onChangeTheme(t.id);
                                            setShowWorldSelect(false);
                                          }}
                                          className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                            isSelected
                                              ? 'bg-slate-800 border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                              : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/60'
                                          }`}
                                        >
                                          <div className="flex items-center gap-3">
                                            <div
                                              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border shadow"
                                              style={{ backgroundColor: `${t.accent}25`, borderColor: t.accent }}
                                            >
                                              {t.icon}
                                            </div>
                                            <div className="text-left">
                                              <div className="flex items-center gap-2">
                                                <strong className="text-xs sm:text-sm font-black text-white">{t.name}</strong>
                                                <span className="text-[10px] text-slate-400">{t.country}</span>
                                              </div>
                                              <p className="text-[10px] text-slate-400 truncate max-w-[180px] sm:max-w-xs">
                                                {t.subtitle}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                                              {idx * 500}M
                                            </span>
                                            <span
                                              className={`text-[10px] font-black px-2 py-1 rounded-xl ${
                                                isSelected ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-700 text-slate-300'
                                              }`}
                                            >
                                              {isSelected ? 'ACTIVE' : 'CHOOSE'}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <button
                                    onClick={() => setShowWorldSelect(false)}
                                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white transition-all border border-slate-700"
                                  >
                                    Done
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* ================= AUTH MODAL ================= */}
                            {showAuthModal && (
                              <div className="w-full h-full flex items-center justify-center p-4 pointer-events-auto bg-slate-950/80 backdrop-blur-md">
                                <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
                                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                    <h3 className="text-xl font-black text-white uppercase">
                                      {authMode === 'login' ? 'Player Login' : 'Create Account'}
                                    </h3>
                                    <button
                                      onClick={() => setShowAuthModal(false)}
                                      className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>

                                  {authError && (
                                    <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs p-2.5 rounded-xl my-3">
                                      {authError}
                                    </div>
                                  )}

                                  <form onSubmit={handleAuthSubmit} className="space-y-3 mt-3">
                                    <div>
                                      <label className="text-xs font-bold text-slate-400">Username</label>
                                      <input
                                        type="text"
                                        value={usernameInput}
                                        onChange={(e) => setUsernameInput(e.target.value)}
                                        placeholder="Enter username"
                                        className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                                      />
                                    </div>

                                    <div>
                                      <label className="text-xs font-bold text-slate-400">Password</label>
                                      <input
                                        type="password"
                                        value={passwordInput}
                                        onChange={(e) => setPasswordInput(e.target.value)}
                                        placeholder="Enter password"
                                        className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                                      />
                                    </div>

                                    <button
                                      type="submit"
                                      className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-black text-sm active:scale-95 shadow-lg transition-all"
                                    >
                                      {authMode === 'login' ? 'SIGN IN' : 'REGISTER'}
                                    </button>
                                  </form>

                                  <div className="text-center mt-3">
                                    <button
                                      onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                                      className="text-xs text-cyan-400 hover:underline"
                                    >
                                      {authMode === 'login'
                                        ? "Don't have an account? Sign up"
                                        : 'Already registered? Sign in'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          );
}
