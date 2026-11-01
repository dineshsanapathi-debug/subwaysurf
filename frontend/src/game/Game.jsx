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
import { GameEngine } from './GameLogic';
import { soundEffects } from '../audio/SoundEffects';

function CameraFollow({ playerX, posY, isSliding, isOnTrain, isElevated, isLanding }) {
  const { camera } = useThree();
  const currentLookY = useRef(2.0);

  useFrame((state, delta) => {
    // Dynamic camera horizontal follow - centers neatly on active lane to avoid perspective skew
    const targetCamX = playerX * 0.75;
    const targetLookX = playerX * 0.75;

    // Smooth continuous vertical camera target that perfectly follows player across ground, trains, and skyway
    let targetCamY = posY + 4.8;
    if (isSliding) targetCamY -= 0.4;

    const targetCamZ = isElevated && !isLanding ? 7.5 : 7.0;

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
  selectedCharacter,
  theme,
  showIntro = false,
  onIntroComplete,
  policeChasing = false,
  setPoliceChasing
}) {
  const [particles, setParticles] = useState([]);
  const playerGroupRef = useRef();

  useFrame((state, delta) => {
    if (!engine) return;

    // During intro, game physics update is paused
    if (!showIntro) {
      engine.update(Math.min(delta, 0.1));
    }

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
      isIntro: showIntro
    });

    if (!showIntro) {
      // Particle update
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
      {/* Cartoon Sunny Skybox / Background Color */}
      <color attach="background" args={['#38bdf8']} />

      {/* Atmospheric Fog */}
      <fog attach="fog" args={['#60a5fa', 40, 110]} />

      {/* Ambient Light for bright cartoon illumination */}
      <ambientLight intensity={0.95} color="#e0f2fe" />

      {/* Warm Sunny Directional Sunlight casting crisp shadows */}
      <directionalLight
        position={[14, 24, 16]}
        intensity={1.6}
        color="#fffbeb"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={75}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />

      {/* Skylight Fill */}
      <directionalLight position={[-12, 18, -10]} intensity={0.5} color="#7dd3fc" />

      {/* Camera Follow (active after intro) */}
      {!showIntro && (
        <CameraFollow
          playerX={playerX}
          posY={engine?.posY || 0}
          isElevated={isSkyway}
          isLanding={isLanding}
          isSliding={engine?.isSliding}
          isOnTrain={engine?.isOnTrain}
        />
      )}

      {/* Part A: Police Chase Cinematic Opening (5 seconds) */}
      {showIntro && (
        <React.Suspense fallback={null}>
          <ChaseIntro
            onComplete={onIntroComplete}
            characterName={selectedCharacter}
          />
        </React.Suspense>
      )}

      {/* Track Chunks (Gantries & wires cleared while on skyway) */}
      {engine?.chunks.map((chunk) => (
        <Track key={chunk.id} position={[0, 0, chunk.z]} theme={theme} isSkyway={isSkyway} />
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
      <group ref={playerGroupRef}>
        <React.Suspense fallback={null}>
          <Player
            lane={engine?.lane || 0}
            posY={engine?.posY || 0}
            isJumping={engine?.isJumping}
            isSliding={engine?.isSliding}
            isOnTrain={engine?.isOnTrain}
            isElevated={isSkyway}
            isLanding={isLanding}
            isCrashing={engine?.isGameOver}
            characterName={selectedCharacter}
            powerups={engine?.powerups || {}}
          />
        </React.Suspense>
      </group>

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

export default function Game({
  selectedCharacter = 'Dash',
  adaptiveSettings = {},
  onGameOver,
  onUpdateStats,
  theme = 'sunset',
  isPaused = false
}) {
  const [engine, setEngine] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [policeChasing, setPoliceChasing] = useState(false);
  const engineRef = useRef(null);

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
      <Canvas
        shadows
        camera={{ position: [0, 4.8, 7.0], fov: 62 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <RemoveDebugLines />
        {engine && (
          <Scene
            engine={engine}
            onEngineTick={onUpdateStats}
            selectedCharacter={selectedCharacter}
            theme={theme}
            showIntro={showIntro}
            onIntroComplete={() => setShowIntro(false)}
            policeChasing={policeChasing}
            setPoliceChasing={setPoliceChasing}
          />
        )}
      </Canvas>

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
