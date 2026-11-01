import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Player from '../components/Player';
import Track from '../components/Track';
import Obstacles from '../components/Obstacles';
import Coins from '../components/Coins';
import ChaseIntro from '../components/ChaseIntro';
import UpperFloor from '../components/UpperFloor';
import Jetpack from '../components/Jetpack';
import JetpackCoins from '../components/JetpackCoins';
import CollisionChaseManager from '../components/CollisionChaseManager';
import PoliceChase from '../components/PoliceChase';
import { GameEngine } from './GameLogic';
import { soundEffects } from '../audio/SoundEffects';

function CameraFollow({ playerX, posY, isJetpack, isSliding, isOnTrain }) {
  const { camera } = useThree();
  const currentLookY = useRef(2.0);

  useFrame((state, delta) => {
    // Dynamic camera horizontal follow
    const targetCamX = playerX * 0.42;

    // Smooth continuous vertical camera target (no discrete threshold jerks!)
    const baseGroundY = isOnTrain ? 3.2 : 0;
    let targetCamY = 4.8;
    if (isJetpack) {
      targetCamY = 9.8;
    } else {
      // Gentle, continuous elevation following without threshold snaps
      targetCamY = baseGroundY + 4.8 + Math.max(0, posY - baseGroundY) * 0.25;
      if (isSliding) targetCamY -= 0.4;
    }

    const targetCamZ = isJetpack ? 9.8 : 7.0;

    // Smooth lerp tracking
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, Math.min(1, delta * 9));
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, Math.min(1, delta * 6));
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, Math.min(1, delta * 6));

    // Continuous smooth lookAt without snapping
    const targetLookY = baseGroundY + 1.8 + Math.max(0, posY - baseGroundY) * 0.15;
    currentLookY.current = THREE.MathUtils.lerp(currentLookY.current, targetLookY, Math.min(1, delta * 6));
    camera.lookAt(targetCamX * 0.6, currentLookY.current, -14);
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
  const isJetpack = engine?.powerups.jetpack > 0;

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
          isJetpack={isJetpack}
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

      {/* Track Chunks */}
      {engine?.chunks.map((chunk) => (
        <Track key={chunk.id} position={[0, 0, chunk.z]} theme={theme} />
      ))}

      {/* Obstacles & Trains */}
      <Obstacles obstacles={engine?.obstacles || []} />

      {/* Coins & Powerups */}
      <Coins coins={engine?.coinsList || []} powerups={engine?.powerupsList || []} />

      {/* Part B: Jetpack System - Elevated Upper Floor Flying Path */}
      <UpperFloor active={isJetpack} speed={engine?.speed || 20} />

      {/* Part B: Jetpack Height Controller */}
      <Jetpack active={isJetpack} playerRef={playerGroupRef} height={6.2} />

      {/* Part B: Vertical Standing Sky Coins Formation */}
      <JetpackCoins
        active={isJetpack}
        speed={engine?.speed || 20}
        playerX={playerX}
        playerY={engine?.posY || 6.2}
        onCollect={(coin) => {
          if (engine) {
            engine.score += 10 * (engine.multiplier || 1);
            engine.coins += 1;
            if (engine.onCoinCollect) engine.onCoinCollect();
          }
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
            isCrashing={engine?.isGameOver}
            characterName={selectedCharacter}
            powerups={engine?.powerups || {}}
          />
        </React.Suspense>
      </group>

      {/* Police Officer & Dog in hot pursuit when a side collision occurs */}
      {!showIntro && (
        <PoliceChase
          active={policeChasing}
          playerRef={playerGroupRef}
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
