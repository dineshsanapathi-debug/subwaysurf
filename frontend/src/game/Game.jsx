import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Player from '../components/Player';
import Track from '../components/Track';
import Obstacles from '../components/Obstacles';
import MangoCollection from '../components/MangoCollection';
import ChaseIntro from '../components/ChaseIntro';
import ElevatedFloor from '../components/ElevatedFloor';
import CollisionChaseManager from '../components/CollisionChaseManager';
import PoliceCharacter from '../components/PoliceCharacter';
import RemoveDebugLines from '../components/RemoveDebugLines';
import WorldThemes, { THEMES } from '../components/WorldThemes';
import MangoShieldBar from '../components/MangoShieldBar';
import HazardWarningHUD from '../components/HazardWarningHUD';
import useMangoShield from '../hooks/useMangoShield';
import { GameEngine } from './GameLogic';
import { soundEffects } from '../audio/SoundEffects';

function CameraFollow({ playerX, posY, isSliding, isOnTrain, isElevated, isLanding, isCrashing }) {
  const { camera } = useThree();
  const currentLookY = useRef(2.0);

  useFrame((state, delta) => {
    // Dynamic camera horizontal follow - centers neatly on active lane to avoid perspective skew
    let targetCamX = playerX * 0.75;
    let targetLookX = playerX * 0.75;

    // Smooth continuous vertical camera target that perfectly follows player across ground, trains, and skyway
    let targetCamY = posY + 4.8;
    if (isSliding) targetCamY -= 0.4;

    let targetCamZ = isElevated && !isLanding ? 7.5 : 7.0;

    // Dramatic crash impact camera shudder
    if (isCrashing) {
      targetCamX += (Math.random() - 0.5) * 0.45;
      targetCamY += (Math.random() - 0.5) * 0.45;
      targetCamZ += 0.4;
    }

    // Smooth lerp tracking
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, Math.min(1, delta * 9));
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, Math.min(1, delta * 6));
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, Math.min(1, delta * 6));

    // Continuous smooth lookAt that always keeps the hero framed in clear view
    const targetLookY = posY + 1.8;
    currentLookY.current = THREE.MathUtils.lerp(currentLookY.current, targetLookY, Math.min(1, delta * 7));
    camera.lookAt(targetLookX, currentLookY.current, -14);
  });

  return null;
}

// Particle effects system
function ParticleSystem({ particles = [] }) {
  return (
    <group>
      {particles.map((p) => (
        <mesh key={p.id} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size || 0.12, 8, 8]} />
          <meshBasicMaterial color={p.color || '#facc15'} transparent opacity={p.opacity || 0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({
  engine,
  onEngineTick,
  onWarningChange,
  selectedCharacter,
  theme,
  showIntro = false,
  onIntroComplete,
  policeChasing = false,
  setPoliceChasing,
  onWorldChange,
  shieldActive = false
}) {
  const [currentWorldTheme, setCurrentWorldTheme] = useState(THEMES[0]);
  const [particles, setParticles] = useState([]);
  const playerGroupRef = useRef();
  const lastWarningKey = useRef('none');
  const lastStatsTick = useRef(0);

  const handleWorldChange = (newTheme, themeIdx, distance) => {
    setCurrentWorldTheme(newTheme);
    if (onWorldChange) {
      onWorldChange(newTheme, themeIdx, distance);
    }
  };

  useFrame((state, delta) => {
    if (!engine) return;

    // During intro, game physics update is paused
    if (!showIntro) {
      engine.update(Math.min(delta, 0.1));
    }

    // Performance Optimization: Throttle React HUD updates to 10Hz (every 100ms) or on game-over/pause
    // Eliminates 60fps root React re-render bottleneck and micro-stutters
    const now = state.clock.getElapsedTime();
    if (now - lastStatsTick.current >= 0.1 || engine.isGameOver || engine.isPaused) {
      lastStatsTick.current = now;
      if (onEngineTick) {
        onEngineTick({
          score: engine.score,
          distance: Math.floor(engine.distance),
          coins: engine.coins,
          speed: Math.floor(engine.speed),
          multiplier: engine.multiplier,
          powerups: { ...engine.powerups },
          elevatedRoute: engine?.elevatedRoute ? { ...engine.elevatedRoute } : null,
          lane: engine.lane,
          posY: engine.posY,
          isJumping: engine.isJumping,
          isSliding: engine.isSliding,
          isOnTrain: engine.isOnTrain,
          isGameOver: engine.isGameOver,
          isPaused: engine.isPaused,
          isIntro: showIntro,
          warningState: engine.warningState
        });
      }
    }

    // Notify warning state updates to React HUD (throttled to 10Hz to prevent 60fps re-render lag)
    const currentWarn = engine.warningState || null;
    const warnKey = currentWarn?.active
      ? `${currentWarn.message}_${Math.floor(currentWarn.distance / 2) * 2}_${currentWarn.action}`
      : 'none';
    if (warnKey !== lastWarningKey.current) {
      lastWarningKey.current = warnKey;
      if (onWarningChange) onWarningChange(currentWarn ? { ...currentWarn } : null);
    }

    if (!showIntro && particles.length > 0) {
      // Particle update only when active particles exist
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + (p.vx || 0) * delta,
            y: p.y + (p.vy || 0) * delta,
            z: p.z + (p.vz || 0) * delta + engine.speed * delta * 0.5,
            opacity: p.opacity - delta * 2
          }))
          .filter((p) => p.opacity > 0)
      );
    }
  });

  const playerX = engine ? engine.lane * 3.2 : 0;
  const isSkyway = (engine?.powerups.jetpack > 0 || engine?.elevatedRoute?.active);
  const isLanding = engine?.elevatedRoute?.isLanding;

  return (
    <>
      {/* Dynamic 500-Metre Multi-World Themes Engine */}
      <WorldThemes
        playerRef={playerGroupRef}
        engine={engine}
        themeOverride={theme}
        onWorldChange={handleWorldChange}
      />

      {/* Atmospheric Fog aligned with current world */}
      <fog attach="fog" args={[currentWorldTheme.fog, currentWorldTheme.fogNear, currentWorldTheme.fogFar]} />

      {/* Ambient Light with themed tint */}
      <ambientLight intensity={currentWorldTheme.ambientIntensity} color={currentWorldTheme.ambientLight} />

      {/* Themed Directional Sunlight */}
      <directionalLight
        position={[14, 24, 16]}
        intensity={currentWorldTheme.sunIntensity}
        color={currentWorldTheme.sunLight}
      />

      {/* Themed Skylight Fill */}
      <directionalLight position={[-12, 18, -10]} intensity={0.4} color={currentWorldTheme.ambientLight} />

      {/* Camera Follow (active after intro) */}
      {!showIntro && (
        <CameraFollow
          playerX={playerX}
          posY={engine?.posY || 0}
          isElevated={isSkyway}
          isLanding={isLanding}
          isSliding={engine?.isSliding}
          isOnTrain={engine?.isOnTrain}
          isCrashing={engine?.isGameOver}
        />
      )}

      {/* Part A: Police Chase Cinematic Opening (5 seconds) */}
      {showIntro && (
        <React.Suspense fallback={null}>
          <ChaseIntro
            onComplete={onIntroComplete}
            characterName={selectedCharacter}
            playerRef={playerGroupRef}
            engine={engine}
          />
        </React.Suspense>
      )}

      {/* Track Chunks with dynamic world theme colors, rails & scenery */}
      {engine?.chunks.map((chunk) => (
        <Track
          key={chunk.id}
          position={[0, 0, chunk.z]}
          theme={theme}
          isSkyway={isSkyway}
          currentTheme={currentWorldTheme}
        />
      ))}

      {/* Obstacles & Trains */}
      <Obstacles obstacles={engine?.obstacles || []} />

      {/* 3D Mango Collectibles across all three lanes */}
      <MangoCollection
        mangoes={engine?.coinsList || []}
        powerups={engine?.powerupsList || []}
        playerPosition={[playerX, engine?.posY || 0, 0]}
      />

      {/* Upper Skyway Route (Activated EXCLUSIVELY by touching the Rocket) */}
      <ElevatedFloor
        active={isSkyway}
        playerRef={playerGroupRef}
        speed={engine?.speed || 20}
        distanceTraveled={engine?.elevatedRoute?.distance || 0}
        onComplete={() => {
          if (engine) engine.completeElevatedRoute();
        }}
      />

      {/* Player Character */}
      <React.Suspense fallback={null}>
        <Player
          playerRef={playerGroupRef}
          engine={engine}
          lane={engine?.lane || 0}
          posY={engine?.posY || 0}
          isJumping={engine?.isJumping}
          isSliding={engine?.isSliding}
          isOnTrain={engine?.isOnTrain}
          isElevated={isSkyway}
          isLanding={isLanding}
          isCrashing={engine?.isGameOver}
          shieldActive={shieldActive}
          characterName={selectedCharacter}
          powerups={engine?.powerups || {}}
          isIntro={showIntro}
          policeChasing={policeChasing}
        />
      </React.Suspense>

      {/* Police Officer in hot pursuit when a side collision occurs */}
      {!showIntro && (
        <PoliceCharacter
          active={policeChasing}
          playerRef={playerGroupRef}
          initialPosition={[0, 0, 7]}
          followSpeed={4}
        />
      )}

      {/* Collision Chase Manager (5s chase timer with retriggering on collisions) */}
      <CollisionChaseManager
        playerRef={playerGroupRef}
        engine={engine}
        onChaseChange={setPoliceChasing}
      />

      {/* Particle System */}
      <ParticleSystem particles={particles} />
    </>
  );
}

// Total Render Isolation: 3D WebGL Canvas is memoized so 10Hz HUD updates (shieldTime, mangoProgress, warningState)
// never trigger Canvas reconciliation or Three.js scene re-evaluation
const Game3DCanvas = React.memo(function Game3DCanvas({
  engine,
  onEngineTick,
  onWarningChange,
  selectedCharacter,
  theme,
  showIntro,
  onIntroComplete,
  policeChasing,
  setPoliceChasing,
  onWorldChange,
  shieldActive
}) {
  return (
    <Canvas
      shadows={false}
      dpr={1}
      camera={{ position: [0, 4.8, 7.0], fov: 62 }}
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true
      }}
    >
      <RemoveDebugLines />
      {engine && (
        <Scene
          engine={engine}
          onEngineTick={onEngineTick}
          onWarningChange={onWarningChange}
          selectedCharacter={selectedCharacter}
          theme={theme}
          showIntro={showIntro}
          onIntroComplete={onIntroComplete}
          policeChasing={policeChasing}
          setPoliceChasing={setPoliceChasing}
          onWorldChange={onWorldChange}
          shieldActive={shieldActive}
        />
      )}
    </Canvas>
  );
});

function GameComponent({
  selectedCharacter = 'Dash',
  adaptiveSettings = {},
  onGameOver,
  onUpdateStats,
  theme = 'auto',
  isPaused = false
}) {
  const [engine, setEngine] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [policeChasing, setPoliceChasing] = useState(false);
  const [worldAnnouncement, setWorldAnnouncement] = useState(null);
  const [warningState, setWarningState] = useState(null);
  const announcementTimerRef = useRef(null);
  const engineRef = useRef(null);

  // Mango Challenge & Protective Shield System
  const {
    mangoProgress,
    shieldActive,
    shieldTime,
    collectMango,
    absorbHit
  } = useMangoShield();

  const collectMangoRef = useRef(collectMango);
  collectMangoRef.current = collectMango;
  const absorbHitRef = useRef(absorbHit);
  absorbHitRef.current = absorbHit;

  // Audio trigger on shield activation
  const prevShieldRef = useRef(false);
  useEffect(() => {
    if (shieldActive && !prevShieldRef.current) {
      soundEffects.playShieldActivate();
    }
    prevShieldRef.current = shieldActive;
    if (engineRef.current) {
      engineRef.current.shieldActive = shieldActive;
    }
  }, [shieldActive]);

  const handleWorldChange = (newTheme, themeIdx, distance) => {
    soundEffects.playWorldChange();
    if (announcementTimerRef.current) clearTimeout(announcementTimerRef.current);
    setWorldAnnouncement({ theme: newTheme, distance: Math.floor(distance) });
    announcementTimerRef.current = setTimeout(() => {
      setWorldAnnouncement(null);
    }, 4500);
  };

  useEffect(() => {
    return () => {
      if (announcementTimerRef.current) clearTimeout(announcementTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (policeChasing && !showIntro) {
      soundEffects.playWhistle();
    }
  }, [policeChasing, showIntro]);

  useEffect(() => {
    window.isIntroRunning = showIntro;
  }, [showIntro]);

  useEffect(() => {
    const newEngine = new GameEngine({
      character: selectedCharacter,
      speedBase: adaptiveSettings.speedBase || 20,
      speedMax: adaptiveSettings.speedMax || 38,
      trainSpawnRate: adaptiveSettings.trainSpawnRate || 0.35,
      powerupFrequency: adaptiveSettings.powerupFrequency || 0.12,
      obstacleGap: adaptiveSettings.obstacleGap || 30
    });

    newEngine.onCoinCollect = () => soundEffects.playCoin();
    newEngine.onMangoCollect = () => {
      collectMangoRef.current?.();
    };
    newEngine.onShieldHit = (obstacleType) => {
      const absorbed = absorbHitRef.current ? absorbHitRef.current() : false;
      if (absorbed) {
        soundEffects.playShieldAbsorb();
      }
      return absorbed;
    };
    newEngine.onPowerupCollect = () => soundEffects.playPowerup();
    newEngine.onHoverboardBreak = () => soundEffects.playCrash();
    newEngine.onElevatedLeap = () => soundEffects.playJump();
    newEngine.onElevatedLanding = () => soundEffects.playLand();
    newEngine.onGameOver = (finalData) => {
      soundEffects.playCrash();
      if (onGameOver) onGameOver(finalData);
    };

    engineRef.current = newEngine;
    setEngine(newEngine);

    return () => {
      newEngine.isGameOver = true;
    };
  }, [selectedCharacter, adaptiveSettings]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.isPaused = isPaused;
    }
  }, [isPaused]);

  useEffect(() => {
    window.gameActions = {
      moveLeft: () => !showIntro && engineRef.current?.moveLeft(),
      moveRight: () => !showIntro && engineRef.current?.moveRight(),
      jump: () => {
        if (showIntro) {
          setShowIntro(false);
          return;
        }
        if (engineRef.current?.jump()) soundEffects.playJump();
      },
      slide: () => {
        if (!showIntro && engineRef.current?.slide()) soundEffects.playSlide();
      },
      hoverboard: () => {
        engineRef.current?.activateHoverboard();
        soundEffects.playHoverboard();
      },
      jetpack: () => {
        engineRef.current?.activateJetpack();
        soundEffects.playPowerup();
      },
      elevatedRoute: () => {
        engineRef.current?.activateElevatedRoute();
        soundEffects.playPowerup();
      },
      skipIntro: () => setShowIntro(false)
    };

    return () => {
      delete window.gameActions;
    };
  }, [showIntro]);

  return (
    <div className="w-full h-full relative">
      {/* Dynamic Advance Hazard Warning HUD (Screen Edge Danger Vignette + Directional Pill + Sound) */}
      {!showIntro && (
        <HazardWarningHUD warning={warningState} />
      )}

      {/* Mango Shield Challenge Progress Bar */}
      {!showIntro && (
        <MangoShieldBar
          mangoProgress={mangoProgress}
          shieldActive={shieldActive}
          shieldTime={shieldTime}
        />
      )}

      <Game3DCanvas
        engine={engine}
        onEngineTick={onUpdateStats}
        onWarningChange={setWarningState}
        selectedCharacter={selectedCharacter}
        theme={theme}
        showIntro={showIntro}
        onIntroComplete={() => setShowIntro(false)}
        policeChasing={policeChasing}
        setPoliceChasing={setPoliceChasing}
        onWorldChange={handleWorldChange}
        shieldActive={shieldActive}
      />

      {/* World Tour Location Announcement Floating Card */}
      {worldAnnouncement && !showIntro && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-500 animate-in fade-in slide-in-from-top-4">
          <div
            className="backdrop-blur-md rounded-2xl px-5 py-2.5 shadow-2xl flex items-center gap-3.5 border-2 text-center"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              borderColor: worldAnnouncement.theme.accent || '#f59e0b',
              boxShadow: `0 8px 30px ${worldAnnouncement.theme.accent}66`
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow border"
              style={{
                backgroundColor: `${worldAnnouncement.theme.accent}33`,
                borderColor: worldAnnouncement.theme.accent
              }}
            >
              {worldAnnouncement.theme.icon}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-white/80">
                  {worldAnnouncement.theme.country}
                </span>
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-slate-950 shadow"
                  style={{ backgroundColor: worldAnnouncement.theme.accent }}
                >
                  {worldAnnouncement.distance > 0 ? `${worldAnnouncement.distance}M MILESTONE` : 'LOCATION'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide leading-tight">
                {worldAnnouncement.theme.name}
              </h3>
              <p className="text-[10px] text-cyan-300 font-bold leading-tight">
                {worldAnnouncement.theme.subtitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HUD Mango Counter */}
      {!showIntro && (
        <div className="mango-counter">
          🥭 Mangoes: {engine?.coins || 0}
        </div>
      )}

      {/* 500-Metre Upper Route Distance HUD */}
      {engine?.elevatedRoute?.active && (
        <div className="elevated-route-hud">
          <div className="flex items-center justify-between gap-3">
            <span className="text-cyan-400 font-black text-xs uppercase tracking-wider animate-pulse flex items-center gap-1">
              <span>⚡</span> 500M UPPER SKYWAY
            </span>
            <span className="text-white font-black text-sm tabular-nums">
              {Math.min(500, Math.floor(engine.elevatedRoute.distance))} / 500 M
            </span>
          </div>
          <div className="w-full bg-slate-900/85 rounded-full h-2 mt-1.5 border border-cyan-500/40 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 h-full rounded-full transition-all duration-75 shadow-[0_0_12px_#06b6d4]"
              style={{ width: `${(Math.min(500, engine.elevatedRoute.distance) / 500) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Dynamic Police Chase Warning after Side/Obstacle Collision */}
      {policeChasing && !showIntro && (
        <div className="police-warning">
          POLICE ARE CHASING YOU!
        </div>
      )}

      {/* Part A: Police Chase Opening Overlay */}
      {showIntro && (
        <div className="chase-overlay">
          <h1>RUN!</h1>
          <p>THE POLICE ARE CHASING YOU!</p>
          <button
            onClick={() => setShowIntro(false)}
            className="mt-6 pointer-events-auto px-6 py-2.5 rounded-full bg-slate-950/85 hover:bg-slate-900 border-2 border-yellow-400 text-yellow-300 font-black text-sm shadow-[0_0_20px_rgba(250,204,21,0.5)] uppercase tracking-wider active:scale-95 transition-all backdrop-blur-md"
          >
            SKIP INTRO (SPACE) ⏩
          </button>
        </div>
      )}
    </div>
  );
}

export const Game = React.memo(GameComponent);
export default Game;
