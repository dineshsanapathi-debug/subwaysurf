import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { CHARACTERS } from '../game/characters';

// Preload 4K transparent character sprite
useTexture.preload('/player-character.png');

export default function Player({
  lane = 0,
  posY = 0,
  isJumping = false,
  isSliding = false,
  isOnTrain = false,
  isElevated = false,
  isLanding = false,
  isCrashing = false,
  characterName = 'Bhargav',
  powerups = {},
  shieldActive = false,
  isMenuPreview = false,
  position = [0, 0, 0],
  scale = 1,
  engine = null,
  playerRef = null,
  isIntro = false,
  policeChasing = false
}) {
  const internalRef = useRef();
  const groupRef = playerRef || internalRef;
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const bodyRef = useRef();
  const spriteMeshRef = useRef();
  const hoverboardRef = useRef();
  const footSparkRef = useRef();
  const dustRef = useRef();
  const shadowRef = useRef();

  // Load custom 4K character texture
  const characterTexture = useTexture('/player-character.png');
  if (characterTexture) {
    characterTexture.colorSpace = THREE.SRGBColorSpace;
  }

  const char = CHARACTERS[characterName] || CHARACTERS.Bhargav || CHARACTERS.Jake;
  const isBhargav = characterName === 'Bhargav' || characterName === 'Dinesh';
  const isDinesh = isBhargav;
  const isAirborneActive = isJumping || (posY > 0.5);
  const isYutani = !isBhargav && (char.isAlienSuit || characterName === 'Yutani');
  const isTricky = !isBhargav && (characterName === 'Tricky' || characterName === 'Luna');
  const isFresh = !isBhargav && (characterName === 'Fresh');
  const isJake = !isBhargav && !isYutani && !isTricky && !isFresh;

  // Initialize group position on mount
  React.useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.x = (lane || 0) * 3.2;
      groupRef.current.position.y = posY || 0;
      groupRef.current.position.z = position[2] || 0;
    }
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Query active state directly from engine if passed for 100% frame-perfect sync
    const activeLane = engine ? engine.lane : lane;
    const activePosY = engine ? engine.posY : (posY || 0);
    const activeIsJumping = engine ? engine.isJumping : isJumping;
    const activeIsSliding = engine ? engine.isSliding : isSliding;
    const activeIsOnTrain = engine ? engine.isOnTrain : isOnTrain;
    const activePowerups = engine ? engine.powerups : powerups;

    if (isMenuPreview) {
      groupRef.current.position.y = Math.sin(time * 2.5) * 0.08 + (posY || 0.2);
      groupRef.current.rotation.y = time * 0.8;
      if (spriteMeshRef.current) {
        spriteMeshRef.current.position.y = 1.15 + Math.sin(time * 3) * 0.05;
        spriteMeshRef.current.scale.set(1, 1, 1);
        spriteMeshRef.current.rotation.set(0, 0, 0);
      }
      if (bodyRef.current) {
        bodyRef.current.position.set(0, 0, 0);
        bodyRef.current.rotation.set(0, 0, 0);
        bodyRef.current.scale.set(1, 1, 1);
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(time * 2) * 0.15;
        rightArmRef.current.rotation.x = -Math.sin(time * 2) * 0.15;
      }
      return;
    }

    const currentTargetX = activeLane * 3.2;

    // Smooth horizontal lane transition (continuous during slide, jump, and run)
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      currentTargetX,
      Math.min(1, delta * 20)
    );

    const baseGroundY = activeIsOnTrain ? 3.2 : (isElevated && !isLanding ? 8.65 : 0);
    const isAirborne = activeIsJumping || (activePosY > baseGroundY + 0.18);

    // Dynamic bank tilt: only tilt while steering on ground, stay stable upright in air
    const xDiff = currentTargetX - groupRef.current.position.x;
    const targetTilt = isAirborne ? 0 : -xDiff * 0.16;
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      targetTilt,
      Math.min(1, delta * 14)
    );

    // Vertical Y position: track physics height smoothly and immediately
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      activePosY,
      Math.min(1, delta * 28)
    );

    // Running animation cycle (higher frequency and deeper sprint when chased)
    const isChased = policeChasing || isIntro;
    const runFreq = isChased ? 26 : (activePowerups.hoverboard ? 0 : 20);
    const legAngle = Math.sin(time * runFreq) * (isChased ? 0.95 : 0.75);
    const armAngle = Math.sin(time * runFreq) * (isChased ? 0.95 : 0.75);

    // Foot spark pulsing effect
    if (footSparkRef.current) {
      footSparkRef.current.scale.setScalar(0.9 + Math.sin(time * 25) * 0.25);
      footSparkRef.current.rotation.z = time * 12;
    }

    // Dynamic footstep dust puff animation
    if (dustRef.current) {
      const isChased = policeChasing || isIntro;
      const sprintSpeed = isChased ? 26 : 20;
      dustRef.current.position.x = Math.sin(time * sprintSpeed) * 0.22;
      dustRef.current.scale.setScalar(0.8 + Math.abs(Math.sin(time * sprintSpeed)) * 0.35);
    }

    if (isCrashing) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -0.8, delta * 8);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, -1.5, delta * 6);
      return;
    } else {
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0, Math.min(1, delta * 18));
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, Math.min(1, delta * 18));
    }

    if (activePowerups.hoverboard) {
      if (bodyRef.current) {
        bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 0.5 + Math.sin(time * 6) * 0.08, delta * 12);
        bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0.35, delta * 12);
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, delta * 12);
        bodyRef.current.scale.set(1, 1, 1);
      }
      if (spriteMeshRef.current) {
        spriteMeshRef.current.position.y = THREE.MathUtils.lerp(spriteMeshRef.current.position.y, 1.25, delta * 14);
        spriteMeshRef.current.scale.set(1, 1, 1);
        spriteMeshRef.current.rotation.set(0.08, 0, 0);
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0.3, delta * 12);
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.3, delta * 12);
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.4, delta * 12);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.4, delta * 12);
      }
    } else if (activeIsSliding) {
      // ===== ACTIVE SLIDE POSE =====
      // Smoothly lower body scale to 0.55 while keeping contact with track/ground
      if (spriteMeshRef.current) {
        // Lower center position to 0.63 so feet remain planted on the track
        spriteMeshRef.current.position.y = THREE.MathUtils.lerp(spriteMeshRef.current.position.y, 0.63, delta * 18);
        spriteMeshRef.current.scale.y = THREE.MathUtils.lerp(spriteMeshRef.current.scale.y, 0.55, delta * 18);
        spriteMeshRef.current.scale.x = THREE.MathUtils.lerp(spriteMeshRef.current.scale.x, 1.2, delta * 18);
        spriteMeshRef.current.scale.z = 1;
        // Keep plane visible to camera (slight pitch only, do NOT rotate edge-on!)
        spriteMeshRef.current.rotation.x = THREE.MathUtils.lerp(spriteMeshRef.current.rotation.x, 0.05, delta * 14);
        spriteMeshRef.current.rotation.z = THREE.MathUtils.lerp(spriteMeshRef.current.rotation.z, 0, delta * 14);
      }
      if (bodyRef.current) {
        bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, -0.25, delta * 16);
        bodyRef.current.position.z = THREE.MathUtils.lerp(bodyRef.current.position.z, 0, delta * 16);
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0.35, delta * 16);
        bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0, delta * 16);
        bodyRef.current.scale.y = THREE.MathUtils.lerp(bodyRef.current.scale.y, 0.55, delta * 18);
        bodyRef.current.scale.x = THREE.MathUtils.lerp(bodyRef.current.scale.x, 1.15, delta * 18);
        bodyRef.current.scale.z = 1;
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 1.3, delta * 16);
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 1.3, delta * 16);
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.8, delta * 16);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.8, delta * 16);
      }
    } else if (isAirborne) {
      // ===== AIRBORNE / JUMP POSE (also cancels slide cleanly) =====
      if (spriteMeshRef.current) {
        spriteMeshRef.current.position.y = THREE.MathUtils.lerp(spriteMeshRef.current.position.y, 1.25, delta * 16);
        spriteMeshRef.current.scale.y = THREE.MathUtils.lerp(spriteMeshRef.current.scale.y, 1.1, delta * 16);
        spriteMeshRef.current.scale.x = THREE.MathUtils.lerp(spriteMeshRef.current.scale.x, 0.92, delta * 16);
        spriteMeshRef.current.scale.z = 1;
        spriteMeshRef.current.rotation.x = THREE.MathUtils.lerp(spriteMeshRef.current.rotation.x, 0.12, delta * 14);
        spriteMeshRef.current.rotation.z = THREE.MathUtils.lerp(spriteMeshRef.current.rotation.z, 0, delta * 14);
      }
      if (bodyRef.current) {
        bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 0.05, delta * 16);
        bodyRef.current.position.z = THREE.MathUtils.lerp(bodyRef.current.position.z, 0, delta * 16);
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0.22, delta * 14);
        bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0, delta * 14);
        bodyRef.current.scale.set(1, 1, 1);
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, -0.6, delta * 14);
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.4, delta * 14);
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 1.1, delta * 14);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 1.1, delta * 14);
      }
    } else if (isBhargav) {
      // ===== BHARGAV ENERGETIC RUNNING SPRINT (DYNAMIC RUNNING GAIT WITH AUTHENTIC FACE) =====
      const isChased = policeChasing || isIntro;
      const sprintSpeed = isChased ? 26 : (activePowerups.hoverboard ? 0 : 20);
      const runBob = Math.abs(Math.sin(time * sprintSpeed)) * (isChased ? 0.17 : 0.12);
      const runSway = Math.sin(time * (sprintSpeed * 0.5)) * (isChased ? 0.08 : 0.04);
      const sprintLean = isChased ? 0.24 : 0.13;
      const strideSquash = Math.sin(time * sprintSpeed * 2) * 0.035;

      if (spriteMeshRef.current) {
        // High-energy running stride bobbing, forward sprint lean, and stride sway
        spriteMeshRef.current.position.y = THREE.MathUtils.lerp(
          spriteMeshRef.current.position.y,
          1.15 + runBob,
          delta * 18
        );
        spriteMeshRef.current.scale.y = THREE.MathUtils.lerp(spriteMeshRef.current.scale.y, 1.0 + strideSquash, delta * 16);
        spriteMeshRef.current.scale.x = THREE.MathUtils.lerp(spriteMeshRef.current.scale.x, 1.0 - strideSquash, delta * 16);
        spriteMeshRef.current.scale.z = 1;
        spriteMeshRef.current.rotation.x = THREE.MathUtils.lerp(spriteMeshRef.current.rotation.x, sprintLean, delta * 16);
        spriteMeshRef.current.rotation.z = THREE.MathUtils.lerp(spriteMeshRef.current.rotation.z, runSway, delta * 16);
      }
      if (bodyRef.current) {
        bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, runBob * 0.5, delta * 18);
        bodyRef.current.position.z = THREE.MathUtils.lerp(bodyRef.current.position.z, 0, delta * 16);
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, sprintLean * 0.5, delta * 16);
        bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0, delta * 14);
        bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, runSway * 0.5, delta * 14);
        bodyRef.current.scale.set(1, 1, 1);
      }
    } else {
      // ===== 3D CHARACTERS UPRIGHT RUNNING & FULL SPRINT (JAKE, TRICKY, FRESH, YUTANI) =====
      const isChased = policeChasing || isIntro;
      const sprintSpeed = isChased ? 26 : (activePowerups.hoverboard ? 0 : 20);
      const bounce = Math.abs(Math.sin(time * sprintSpeed)) * (isChased ? 0.18 : 0.13);
      const sprintLean = isChased ? 0.26 : 0.16;

      if (bodyRef.current) {
        bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, bounce, delta * 18);
        bodyRef.current.position.z = THREE.MathUtils.lerp(bodyRef.current.position.z, 0, delta * 16);
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, sprintLean, delta * 14);
        bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0, delta * 14);
        bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, 0, delta * 14);
        bodyRef.current.scale.set(1, 1, 1);
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, legAngle, delta * 18);
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -legAngle, delta * 18);
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -armAngle * 0.95, delta * 18);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, armAngle * 0.95, delta * 18);
      }
    }

    // Dynamic 3D Track Ground Shadow tracking (handles ground, train roof, and upper skyway)
    if (shadowRef.current) {
      const surfaceY = activeIsOnTrain ? 3.22 : (isElevated && !isLanding ? 8.67 : 0.03);
      const relY = Math.max(0, activePosY - baseGroundY);
      shadowRef.current.position.y = surfaceY - activePosY;
      shadowRef.current.scale.setScalar(Math.max(0.4, (activeIsSliding ? 1.25 : 1.0) - relY * 0.15));
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Dynamic 3D Track Ground Shadow */}
      <mesh ref={shadowRef} position={[0, isOnTrain ? 3.22 : (isElevated && !isLanding ? 8.67 : 0.04), 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.3, 0.7]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.45} />
      </mesh>

      {/* Foot Spark Flare */}
      {!powerups.jetpack && !isSliding && (
        <group ref={footSparkRef} position={[0, 0.1, -0.1]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.1, 0.45, 12]} />
            <meshBasicMaterial color="#fef08a" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <coneGeometry args={[0.3, 0.4, 6]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* Hoverboard Equipment */}
      {powerups.hoverboard && (
        <group ref={hoverboardRef} position={[0, 0.15, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.7, 0.08, 1.8]} />
            <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.6} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.05, 0.6]}>
            <cylinderGeometry args={[0.2, 0.25, 0.06, 16]} />
            <meshBasicMaterial color="#f43f5e" />
          </mesh>
          <mesh position={[0, -0.05, -0.6]}>
            <cylinderGeometry args={[0.2, 0.25, 0.06, 16]} />
            <meshBasicMaterial color="#f43f5e" />
          </mesh>
        </group>
      )}

      {/* Jetpack Equipment with Pulsing Rocket Thrusters */}
      {(powerups.jetpack || (isElevated && !isLanding)) && (
        <group position={[0, 1.3, -0.35]}>
          <mesh position={[-0.24, 0, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.13, 0.65, 12]} />
            <meshStandardMaterial color="#dc2626" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0.24, 0, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.13, 0.65, 12]} />
            <meshStandardMaterial color="#dc2626" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Twin Fiery Rocket Flames */}
          <mesh position={[-0.24, -0.45, 0]}>
            <coneGeometry args={[0.14, 0.55, 8]} />
            <meshBasicMaterial color="#f97316" transparent opacity={0.9} />
          </mesh>
          <mesh position={[0.24, -0.45, 0]}>
            <coneGeometry args={[0.14, 0.55, 8]} />
            <meshBasicMaterial color="#f97316" transparent opacity={0.9} />
          </mesh>
          <mesh position={[-0.24, -0.36, 0]}>
            <coneGeometry args={[0.09, 0.35, 8]} />
            <meshBasicMaterial color="#fde047" />
          </mesh>
          <mesh position={[0.24, -0.36, 0]}>
            <coneGeometry args={[0.09, 0.35, 8]} />
            <meshBasicMaterial color="#fde047" />
          </mesh>
        </group>
      )}

      {/* Glowing Blue Protective Mango Shield */}
      {(shieldActive || engine?.shieldActive) && (
        <group position={[0, 1.15, 0]}>
          <mesh>
            <sphereGeometry args={[1.4, 32, 32]} />
            <meshBasicMaterial
              color="#00dfff"
              transparent
              opacity={0.18}
              wireframe
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.34, 24, 24]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.12}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[1.42, 0.035, 12, 48]} />
            <meshBasicMaterial color="#67e8f9" transparent opacity={0.7} />
          </mesh>
        </group>
      )}

      {/* Main Character Body Mesh Hierarchy */}
      <group ref={bodyRef}>
        {/* ================= 0. BHARGAV (AUTHENTIC FACE & 4K CHARACTER SPRITE RUNNER) ================= */}
        {isBhargav && (
          <group>
            {/* Camera-Facing 4K Character Sprite with Original Authentic Face & Features */}
            <mesh ref={spriteMeshRef} position={[0, 1.15, 0]} castShadow>
              <planeGeometry args={[1.55, 2.35]} />
              <meshBasicMaterial
                map={characterTexture}
                transparent={true}
                alphaTest={0.02}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>

            {/* Dynamic Footstep Dust Puffs on Track while Running (Running on Foot, No Skateboard) */}
            {!powerups.hoverboard && !powerups.jetpack && !isAirborneActive && !isSliding && (
              <group ref={dustRef} position={[0, 0.06, -0.15]}>
                <mesh>
                  <sphereGeometry args={[0.12, 8, 8]} />
                  <meshBasicMaterial color="#e2e8f0" transparent opacity={0.35} />
                </mesh>
              </group>
            )}
          </group>
        )}

        {/* ================= 1. JAKE ================= */}
        {isJake && (
          <group>
            {/* Torso: Grey Hoodie under Blue Denim Vest with Yellow Star */}
            <group position={[0, 1.25, 0]}>
              {/* Inner Grey Hoodie */}
              <mesh castShadow>
                <boxGeometry args={[0.62, 0.72, 0.42]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
              </mesh>
              {/* Red Inner Collar Bandana */}
              <mesh position={[0, 0.32, 0.2]}>
                <boxGeometry args={[0.28, 0.12, 0.06]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
              {/* Blue Denim Outer Vest */}
              <mesh castShadow>
                <boxGeometry args={[0.65, 0.68, 0.44]} />
                <meshStandardMaterial color="#2563eb" roughness={0.6} />
              </mesh>
              {/* Front Pockets */}
              <mesh position={[-0.18, 0.05, 0.23]}>
                <planeGeometry args={[0.16, 0.14]} />
                <meshStandardMaterial color="#1d4ed8" />
              </mesh>
              <mesh position={[0.18, 0.05, 0.23]}>
                <planeGeometry args={[0.16, 0.14]} />
                <meshStandardMaterial color="#1d4ed8" />
              </mesh>
              {/* Bright Yellow Star on Back */}
              <mesh position={[0, 0.08, -0.23]} rotation={[0, Math.PI, 0]}>
                <circleGeometry args={[0.18, 5]} />
                <meshBasicMaterial color="#facc15" side={THREE.DoubleSide} />
              </mesh>
            </group>

            {/* Head with Grey Hood & Red Cap */}
            <group position={[0, 1.85, 0]}>
              {/* Grey Hood Framing Head */}
              <mesh castShadow>
                <sphereGeometry args={[0.34, 16, 16]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.7} />
              </mesh>
              {/* Cute Face */}
              <mesh position={[0, -0.02, 0.08]} castShadow>
                <sphereGeometry args={[0.28, 16, 16]} />
                <meshStandardMaterial color={char.skinColor} roughness={0.6} />
              </mesh>
              {/* Eyes */}
              <mesh position={[0.1, 0.02, 0.33]}>
                <sphereGeometry args={[0.045, 10, 10]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>
              <mesh position={[-0.1, 0.02, 0.33]}>
                <sphereGeometry args={[0.045, 10, 10]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>

              {/* Red Baseball Cap with Graffiti Visor */}
              <group position={[0, 0.16, 0.02]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.32, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
                  <meshStandardMaterial color="#ef4444" roughness={0.4} />
                </mesh>
                {/* Cap Visor pointing backward */}
                <mesh position={[0, -0.04, -0.28]} rotation={[-0.22, 0, 0]} castShadow>
                  <boxGeometry args={[0.34, 0.04, 0.24]} />
                  <meshStandardMaterial color="#ef4444" />
                </mesh>
                {/* Green Graffiti Patch on Brim */}
                <mesh position={[0, -0.02, -0.28]} rotation={[-0.22, 0, 0]}>
                  <boxGeometry args={[0.24, 0.05, 0.12]} />
                  <meshStandardMaterial color="#22c55e" />
                </mesh>
              </group>
            </group>

            {/* Jake's Spray Paint Can in Hand */}
            <group position={[0.48, 1.0, 0.2]} rotation={[0.4, 0, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.065, 0.065, 0.26, 12]} />
                <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
              </mesh>
              {/* White Cap */}
              <mesh position={[0, 0.14, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 0.06, 12]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              {/* Cyan Nozzle Tip */}
              <mesh position={[0, 0.18, 0.03]}>
                <boxGeometry args={[0.025, 0.03, 0.03]} />
                <meshBasicMaterial color="#06b6d4" />
              </mesh>
            </group>
          </group>
        )}

        {/* ================= 2. TRICKY ================= */}
        {isTricky && (
          <group>
            {/* Torso: White Ribbed Crop Top + Midriff + Red Belt */}
            <group position={[0, 1.25, 0]}>
              <mesh position={[0, 0.12, 0]} castShadow>
                <boxGeometry args={[0.56, 0.46, 0.38]} />
                <meshStandardMaterial color="#ffffff" roughness={0.4} />
              </mesh>
              {/* Exposed Midriff Skin */}
              <mesh position={[0, -0.15, 0]} castShadow>
                <boxGeometry args={[0.52, 0.16, 0.36]} />
                <meshStandardMaterial color={char.skinColor} roughness={0.6} />
              </mesh>
              {/* Red Belt / Waistband with Black Buckle */}
              <mesh position={[0, -0.26, 0]} castShadow>
                <boxGeometry args={[0.58, 0.12, 0.4]} />
                <meshStandardMaterial color="#dc2626" />
              </mesh>
              <mesh position={[0, -0.26, 0.21]}>
                <boxGeometry args={[0.1, 0.08, 0.02]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>
            </group>

            {/* Head with Blonde Pigtails, Thick Black Glasses & Red Beanie */}
            <group position={[0, 1.85, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.28, 16, 16]} />
                <meshStandardMaterial color={char.skinColor} roughness={0.6} />
              </mesh>
              {/* Eyes */}
              <mesh position={[0.09, 0.02, 0.26]}>
                <sphereGeometry args={[0.045, 10, 10]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>
              <mesh position={[-0.09, 0.02, 0.26]}>
                <sphereGeometry args={[0.045, 10, 10]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>

              {/* Big Iconic Black Square Glasses (Signature Tricky!) */}
              <group position={[0, 0.02, 0.27]}>
                <mesh position={[-0.11, 0, 0]}>
                  <boxGeometry args={[0.18, 0.16, 0.04]} />
                  <meshBasicMaterial color="#0f172a" />
                </mesh>
                <mesh position={[0.11, 0, 0]}>
                  <boxGeometry args={[0.18, 0.16, 0.04]} />
                  <meshBasicMaterial color="#0f172a" />
                </mesh>
                <mesh position={[0, 0.03, 0]}>
                  <boxGeometry args={[0.08, 0.03, 0.04]} />
                  <meshBasicMaterial color="#0f172a" />
                </mesh>
              </group>

              {/* Blonde Pigtails sticking out below beanie */}
              <mesh position={[-0.28, -0.1, 0]} rotation={[0, 0, 0.3]} castShadow>
                <coneGeometry args={[0.12, 0.38, 8]} />
                <meshStandardMaterial color="#facc15" roughness={0.5} />
              </mesh>
              <mesh position={[0.28, -0.1, 0]} rotation={[0, 0, -0.3]} castShadow>
                <coneGeometry args={[0.12, 0.38, 8]} />
                <meshStandardMaterial color="#facc15" roughness={0.5} />
              </mesh>

              {/* Red Knit Beanie */}
              <group position={[0, 0.16, -0.04]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.32, 16, 16]} />
                  <meshStandardMaterial color="#dc2626" roughness={0.8} />
                </mesh>
                <mesh position={[0, -0.08, 0]}>
                  <torusGeometry args={[0.3, 0.06, 8, 16]} />
                  <meshStandardMaterial color="#b91c1c" />
                </mesh>
              </group>
            </group>
          </group>
        )}

        {/* ================= 3. FRESH ================= */}
        {isFresh && (
          <group>
            {/* Torso: Bright Green Athletic Tank Top */}
            <group position={[0, 1.25, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.58, 0.72, 0.38]} />
                <meshStandardMaterial color="#22c55e" roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.32, 0.15]}>
                <boxGeometry args={[0.28, 0.12, 0.12]} />
                <meshStandardMaterial color={char.skinColor} />
              </mesh>
            </group>

            {/* Fresh's 80s Boombox Radio on Shoulder */}
            <group position={[0.46, 1.55, 0.05]} rotation={[0.1, 0.2, 0.1]}>
              <mesh castShadow>
                <boxGeometry args={[0.26, 0.46, 0.74]} />
                <meshStandardMaterial color="#0284c7" metalness={0.4} roughness={0.3} />
              </mesh>
              {/* Red Speaker Grilles */}
              <mesh position={[0.14, -0.02, -0.2]} rotation={[0, Math.PI / 2, 0]}>
                <circleGeometry args={[0.13, 16]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
              <mesh position={[0.14, -0.02, 0.2]} rotation={[0, Math.PI / 2, 0]}>
                <circleGeometry args={[0.13, 16]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
              {/* Cassette Deck in Center */}
              <mesh position={[0.14, 0.08, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[0.15, 0.12]} />
                <meshBasicMaterial color="#facc15" />
              </mesh>
              {/* Handle */}
              <mesh position={[0, 0.28, 0]}>
                <boxGeometry args={[0.1, 0.08, 0.48]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            </group>

            {/* Head with High-Top Flat Fade Haircut & Black Frames */}
            <group position={[0, 1.85, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.27, 16, 16]} />
                <meshStandardMaterial color={char.skinColor} roughness={0.6} />
              </mesh>
              {/* Eyes */}
              <mesh position={[0.09, 0.02, 0.25]}>
                <sphereGeometry args={[0.045, 10, 10]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>
              <mesh position={[-0.09, 0.02, 0.25]}>
                <sphereGeometry args={[0.045, 10, 10]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>

              {/* Black Square Frames */}
              <group position={[0, 0.02, 0.26]}>
                <mesh position={[-0.1, 0, 0]}>
                  <boxGeometry args={[0.16, 0.15, 0.03]} />
                  <meshBasicMaterial color="#0f172a" />
                </mesh>
                <mesh position={[0.1, 0, 0]}>
                  <boxGeometry args={[0.16, 0.15, 0.03]} />
                  <meshBasicMaterial color="#0f172a" />
                </mesh>
                <mesh position={[0, 0.02, 0]}>
                  <boxGeometry args={[0.08, 0.03, 0.03]} />
                  <meshBasicMaterial color="#0f172a" />
                </mesh>
              </group>

              {/* High-Top Flat-Top Fade Haircut */}
              <mesh position={[0, 0.38, 0]} castShadow>
                <cylinderGeometry args={[0.26, 0.28, 0.48, 16]} />
                <meshStandardMaterial color="#171717" roughness={0.9} />
              </mesh>
            </group>
          </group>
        )}

        {/* ================= 4. YUTANI ================= */}
        {isYutani && (
          <group>
            {/* Plump Lime Green Alien Mascot Body with Seam & Extra Bug Legs */}
            <group position={[0, 1.25, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.48, 16, 16]} />
                <meshStandardMaterial color="#84cc16" roughness={0.5} />
              </mesh>
              {/* Belly Seam */}
              <mesh position={[0, 0, 0.46]}>
                <planeGeometry args={[0.06, 0.7]} />
                <meshStandardMaterial color="#65a30d" />
              </mesh>

              {/* Extra Little Alien Arms on Sides */}
              <mesh position={[-0.45, 0.05, 0]} rotation={[0, 0, 0.6]}>
                <cylinderGeometry args={[0.06, 0.06, 0.35, 8]} />
                <meshStandardMaterial color="#84cc16" />
              </mesh>
              <mesh position={[0.45, 0.05, 0]} rotation={[0, 0, -0.6]}>
                <cylinderGeometry args={[0.06, 0.06, 0.35, 8]} />
                <meshStandardMaterial color="#84cc16" />
              </mesh>
            </group>

            {/* Alien Costume Hood with Stalk Eyes, Purple Horns & Face Opening */}
            <group position={[0, 1.85, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial color="#84cc16" roughness={0.5} />
              </mesh>

              {/* Face Opening */}
              <mesh position={[0, -0.05, 0.24]} castShadow>
                <sphereGeometry args={[0.26, 16, 16]} />
                <meshStandardMaterial color={char.skinColor} roughness={0.6} />
              </mesh>
              {/* Costume White Teeth */}
              <mesh position={[0, 0.15, 0.32]}>
                <boxGeometry args={[0.28, 0.06, 0.06]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>

              {/* Eyes */}
              <mesh position={[0.08, -0.04, 0.46]}>
                <sphereGeometry args={[0.038, 10, 10]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>
              <mesh position={[-0.08, -0.04, 0.46]}>
                <sphereGeometry args={[0.038, 10, 10]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>

              {/* Big Bulbous Alien Stalk Eyes with Purple Horns (Signature Yutani!) */}
              {/* Left Stalk Eye */}
              <group position={[-0.24, 0.36, 0.1]} rotation={[0.2, 0, -0.3]}>
                <mesh>
                  <cylinderGeometry args={[0.06, 0.08, 0.22, 8]} />
                  <meshStandardMaterial color="#84cc16" />
                </mesh>
                <mesh position={[0, 0.16, 0]} castShadow>
                  <sphereGeometry args={[0.14, 14, 14]} />
                  <meshStandardMaterial color="#ffffff" />
                </mesh>
                <mesh position={[0, 0.18, 0.12]}>
                  <sphereGeometry args={[0.06, 10, 10]} />
                  <meshBasicMaterial color="#7c3aed" />
                </mesh>
              </group>

              {/* Right Stalk Eye */}
              <group position={[0.24, 0.36, 0.1]} rotation={[0.2, 0, 0.3]}>
                <mesh>
                  <cylinderGeometry args={[0.06, 0.08, 0.22, 8]} />
                  <meshStandardMaterial color="#84cc16" />
                </mesh>
                <mesh position={[0, 0.16, 0]} castShadow>
                  <sphereGeometry args={[0.14, 14, 14]} />
                  <meshStandardMaterial color="#ffffff" />
                </mesh>
                <mesh position={[0, 0.18, 0.12]}>
                  <sphereGeometry args={[0.06, 10, 10]} />
                  <meshBasicMaterial color="#7c3aed" />
                </mesh>
              </group>
            </group>
          </group>
        )}

        {/* ================= ARMS & LEGS (FOR PROCEDURAL CHARACTERS ONLY: JAKE, TRICKY, FRESH, YUTANI) ================= */}
        {!isBhargav && (
          <group>
            {/* Left Arm */}
            <group ref={leftArmRef} position={[-0.42, 1.48, 0]}>
              <mesh position={[0, -0.28, 0]} castShadow>
                <boxGeometry args={[0.18, 0.6, 0.2]} />
                <meshStandardMaterial color={isYutani ? '#84cc16' : isFresh ? char.skinColor : '#cbd5e1'} />
              </mesh>
              <mesh position={[0, -0.62, 0]}>
                <sphereGeometry args={[0.1, 10, 10]} />
                <meshStandardMaterial color={isYutani ? '#65a30d' : char.skinColor || '#c68642'} />
              </mesh>
            </group>

            {/* Right Arm */}
            <group ref={rightArmRef} position={[0.42, 1.48, 0]}>
              <mesh position={[0, -0.28, 0]} castShadow>
                <boxGeometry args={[0.18, 0.6, 0.2]} />
                <meshStandardMaterial color={isYutani ? '#84cc16' : isFresh ? char.skinColor : '#cbd5e1'} />
              </mesh>
              <mesh position={[0, -0.62, 0]}>
                <sphereGeometry args={[0.1, 10, 10]} />
                <meshStandardMaterial color={isYutani ? '#65a30d' : char.skinColor || '#c68642'} />
              </mesh>
            </group>

            {/* ================= LEGS ================= */}
            {/* Left Leg */}
            <group ref={leftLegRef} position={[-0.18, 0.85, 0]}>
              {isFresh ? (
                <group>
                  <mesh position={[0, -0.15, 0]} castShadow>
                    <boxGeometry args={[0.22, 0.32, 0.24]} />
                    <meshStandardMaterial color="#dc2626" />
                  </mesh>
                  <mesh position={[0, -0.38, 0]} castShadow>
                    <boxGeometry args={[0.16, 0.25, 0.18]} />
                    <meshStandardMaterial color={char.skinColor} />
                  </mesh>
                  <mesh position={[0, -0.55, 0]} castShadow>
                    <boxGeometry args={[0.18, 0.2, 0.2]} />
                    <meshStandardMaterial color="#ffffff" />
                  </mesh>
                </group>
              ) : isYutani ? (
                <mesh position={[0, -0.32, 0]} castShadow>
                  <boxGeometry args={[0.22, 0.68, 0.24]} />
                  <meshStandardMaterial color="#84cc16" />
                </mesh>
              ) : isTricky ? (
                // Tricky's Baggy Flared Boyfriend Jeans
                <mesh position={[0, -0.32, 0]} castShadow>
                  <boxGeometry args={[0.26, 0.68, 0.28]} />
                  <meshStandardMaterial color={char.pantsColor} roughness={0.6} />
                </mesh>
              ) : (
                // Jake's Denim Jeans with Cuffs
                <group>
                  <mesh position={[0, -0.32, 0]} castShadow>
                    <boxGeometry args={[0.22, 0.68, 0.24]} />
                    <meshStandardMaterial color={char.pantsColor} roughness={0.6} />
                  </mesh>
                  <mesh position={[0, -0.64, 0]}>
                    <boxGeometry args={[0.24, 0.06, 0.26]} />
                    <meshStandardMaterial color="#cbd5e1" />
                  </mesh>
                </group>
              )}

              {/* Sneakers / Creature Feet */}
              <group position={[0, -0.72, 0.1]}>
                <mesh castShadow>
                  <boxGeometry args={[0.24, 0.18, 0.44]} />
                  <meshStandardMaterial color={isYutani ? '#65a30d' : char.shoesColor || '#dc2626'} roughness={0.4} />
                </mesh>
                {!isYutani && (
                  <mesh position={[0, -0.09, 0]}>
                    <boxGeometry args={[0.25, 0.06, 0.46]} />
                    <meshStandardMaterial color="#ffffff" />
                  </mesh>
                )}
              </group>
            </group>

            {/* Right Leg */}
            <group ref={rightLegRef} position={[0.18, 0.85, 0]}>
              {isFresh ? (
                <group>
                  <mesh position={[0, -0.15, 0]} castShadow>
                    <boxGeometry args={[0.22, 0.32, 0.24]} />
                    <meshStandardMaterial color="#dc2626" />
                  </mesh>
                  <mesh position={[0, -0.38, 0]} castShadow>
                    <boxGeometry args={[0.16, 0.25, 0.18]} />
                    <meshStandardMaterial color={char.skinColor} />
                  </mesh>
                  <mesh position={[0, -0.55, 0]} castShadow>
                    <boxGeometry args={[0.18, 0.2, 0.2]} />
                    <meshStandardMaterial color="#ffffff" />
                  </mesh>
                </group>
              ) : isYutani ? (
                <mesh position={[0, -0.32, 0]} castShadow>
                  <boxGeometry args={[0.22, 0.68, 0.24]} />
                  <meshStandardMaterial color="#84cc16" />
                </mesh>
              ) : isTricky ? (
                <mesh position={[0, -0.32, 0]} castShadow>
                  <boxGeometry args={[0.26, 0.68, 0.28]} />
                  <meshStandardMaterial color={char.pantsColor} roughness={0.6} />
                </mesh>
              ) : (
                <group>
                  <mesh position={[0, -0.32, 0]} castShadow>
                    <boxGeometry args={[0.22, 0.68, 0.24]} />
                    <meshStandardMaterial color={char.pantsColor} roughness={0.6} />
                  </mesh>
                  <mesh position={[0, -0.64, 0]}>
                    <boxGeometry args={[0.24, 0.06, 0.26]} />
                    <meshStandardMaterial color="#cbd5e1" />
                  </mesh>
                </group>
              )}

              {/* Sneakers / Creature Feet */}
              <group position={[0, -0.72, 0.1]}>
                <mesh castShadow>
                  <boxGeometry args={[0.24, 0.18, 0.44]} />
                  <meshStandardMaterial color={isYutani ? '#65a30d' : char.shoesColor || '#dc2626'} roughness={0.4} />
                </mesh>
                {!isYutani && (
                  <mesh position={[0, -0.09, 0]}>
                    <boxGeometry args={[0.25, 0.06, 0.46]} />
                    <meshStandardMaterial color="#ffffff" />
                  </mesh>
                )}
              </group>
            </group>
          </group>
        )}
      </group>
    </group>
  );
}
