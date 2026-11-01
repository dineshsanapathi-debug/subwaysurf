import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Preload 4K transparent character sprite
useTexture.preload('/player-character.png');

export const CHARACTERS = {
  Dinesh: {
    name: 'Dinesh',
    title: 'Camo Rail Surfer',
    color: '#d4a373', // Camo Tan
    hoodieColor: '#e9d5a1', // Beige hood
    camoGreen: '#526046', // Olive camo patch
    camoBrown: '#6b4a2d', // Earth camo patch
    shirtColor: '#0f172a', // Black inner tee
    pantsColor: '#1e293b', // Dark charcoal jeans
    shoesColor: '#ef4444', // Retro red & white skate shoes
    skinColor: '#c68642', // Warm tan tone
    hairColor: '#171717', // Curly dark hair
    hasSkateboard: true,
    avatar: '/dinesh-avatar.jpg',
    icon: '🛹',
    description: 'Curly dark hair, trimmed beard, camo zip-up hoodie over black tee, dark jeans, retro red kicks, and a custom graffiti railboard.',
    stats: { speed: 99, jump: 95, magnet: 92 },
    ability: 'Speed Spark Rail Glide'
  },
  Jake: {
    name: 'Jake',
    title: 'The Mascot Runner',
    color: '#2563eb', // Denim Blue
    hoodieColor: '#94a3b8', // Grey hoodie
    skinColor: '#fcd5b4',
    capColor: '#ef4444', // Red cap
    capBrimColor: '#22c55e', // Green graffiti brim
    pantsColor: '#3b82f6', // Light blue jeans
    shoesColor: '#22c55e', // Green tongue kicks
    icon: '🧢',
    description: 'Iconic street runner with graffiti cap, grey hoodie, denim vest, and spray paint can.',
    stats: { speed: 95, jump: 88, magnet: 80 },
    ability: 'Super Sprinter Dash'
  },
  Tricky: {
    name: 'Tricky',
    title: 'Geek-Chic Skater',
    color: '#ffffff', // White crop top
    beanieColor: '#dc2626', // Red beanie
    hairColor: '#facc15', // Blonde hair
    glassesColor: '#0f172a', // Thick black frames
    skinColor: '#fde0cb',
    waistbandColor: '#ef4444', // Red waistband
    pantsColor: '#60a5fa', // Baggy boyfriend jeans
    shoesColor: '#22c55e', // Skate sneakers
    icon: '👓',
    description: 'Red beanie, blonde pigtails, signature black square glasses, crop top, and baggy skater denim.',
    stats: { speed: 88, jump: 98, magnet: 82 },
    ability: 'High-Flying Airtime'
  },
  Fresh: {
    name: 'Fresh',
    title: 'Retro Beatboxer',
    color: '#22c55e', // Green jersey
    hairColor: '#171717', // Flat-top fade
    glassesColor: '#0f172a', // Black glasses
    skinColor: '#8d5b4c', // Brown skin tone
    pantsColor: '#dc2626', // Red shorts
    shoesColor: '#ef4444', // Red kicks
    socksColor: '#ffffff', // White crew socks
    hasBoombox: true,
    icon: '📻',
    description: 'Flat-top fade haircut, black frames, green tank top, red shorts, and an 80s boombox on shoulder.',
    stats: { speed: 90, jump: 85, magnet: 88 },
    ability: 'Groovy Multiplier'
  },
  Yutani: {
    name: 'Yutani',
    title: 'Alien Bug Mascot',
    color: '#84cc16', // Lime green suit
    suitDark: '#65a30d',
    skinColor: '#fcd5b4',
    eyeColor: '#ffffff',
    stalkColor: '#7c3aed', // Purple antennae
    isAlienSuit: true,
    icon: '👽',
    description: 'Full lime-green alien bug mascot suit with stalk eyes, purple antennae, cute face, and 4 arms.',
    stats: { speed: 85, jump: 85, magnet: 100 },
    ability: 'Cosmic Magnet Pulse'
  }
};

// Aliases for compatibility
CHARACTERS.Dash = CHARACTERS.Jake;
CHARACTERS.Luna = CHARACTERS.Tricky;
CHARACTERS.Bolt = CHARACTERS.Yutani;

export default function Player({
  lane = 0,
  posY = 0,
  isJumping = false,
  isSliding = false,
  isOnTrain = false,
  isCrashing = false,
  characterName = 'Dinesh',
  powerups = {},
  isMenuPreview = false,
  position = [0, 0, 0],
  scale = 1
}) {
  const groupRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const bodyRef = useRef();
  const spriteMeshRef = useRef();
  const hoverboardRef = useRef();
  const footSparkRef = useRef();
  const shadowRef = useRef();

  // Load custom 4K character texture
  const characterTexture = useTexture('/player-character.png');
  if (characterTexture) {
    characterTexture.colorSpace = THREE.SRGBColorSpace;
  }

  const char = CHARACTERS[characterName] || CHARACTERS.Dinesh || CHARACTERS.Jake;
  const isDinesh = characterName === 'Dinesh';
  const isYutani = !isDinesh && (char.isAlienSuit || characterName === 'Yutani');
  const isTricky = !isDinesh && (characterName === 'Tricky' || characterName === 'Luna');
  const isFresh = !isDinesh && (characterName === 'Fresh');
  const isJake = !isDinesh && !isYutani && !isTricky && !isFresh;

  const targetX = lane * 3.2;

  // Initialize group position on mount
  React.useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.x = targetX;
      groupRef.current.position.y = posY || 0;
      groupRef.current.position.z = position[2] || 0;
    }
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    if (isMenuPreview) {
      groupRef.current.position.y = Math.sin(time * 2.5) * 0.08 + (posY || 0.2);
      groupRef.current.rotation.y = time * 0.8;
      if (spriteMeshRef.current) {
        spriteMeshRef.current.position.y = 1.15 + Math.sin(time * 3) * 0.05;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(time * 2) * 0.15;
        rightArmRef.current.rotation.x = -Math.sin(time * 2) * 0.15;
      }
      return;
    }

    // Smooth horizontal lane transition
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      Math.min(1, delta * 18)
    );

    const baseGroundY = isOnTrain ? 3.2 : 0;
    const isAirborne = isJumping || (posY > baseGroundY + 0.18);

    // Dynamic bank tilt: only tilt while steering on ground, stay stable upright in air
    const xDiff = targetX - groupRef.current.position.x;
    const targetTilt = isAirborne ? 0 : -xDiff * 0.16;
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      targetTilt,
      Math.min(1, delta * 12)
    );

    // Vertical Y position
    let targetY = posY;
    if (powerups.jetpack) {
      targetY = 6.4 + Math.sin(time * 4) * 0.3;
    }
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      Math.min(1, delta * 24)
    );

    // Running animation cycle
    const runFreq = powerups.hoverboard ? 0 : 20;
    const legAngle = Math.sin(time * runFreq) * 0.75;
    const armAngle = Math.sin(time * runFreq) * 0.75;

    // Foot spark pulsing effect
    if (footSparkRef.current) {
      footSparkRef.current.scale.setScalar(0.9 + Math.sin(time * 25) * 0.25);
      footSparkRef.current.rotation.z = time * 12;
    }

    if (isCrashing) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -0.8, delta * 8);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, -1.5, delta * 6);
      return;
    }

    if (powerups.hoverboard) {
      if (bodyRef.current) {
        bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 0.5 + Math.sin(time * 6) * 0.08, delta * 12);
        bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0.35, delta * 12);
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, delta * 12);
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0.3, delta * 12);
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.3, delta * 12);
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.4, delta * 12);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.4, delta * 12);
      }
    } else if (isSliding) {
      if (spriteMeshRef.current) {
        // Slide animation: low ducking crouch, squash scale
        spriteMeshRef.current.position.y = THREE.MathUtils.lerp(spriteMeshRef.current.position.y, 0.65, delta * 16);
        spriteMeshRef.current.scale.y = THREE.MathUtils.lerp(spriteMeshRef.current.scale.y, 0.55, delta * 16);
        spriteMeshRef.current.scale.x = THREE.MathUtils.lerp(spriteMeshRef.current.scale.x, 1.25, delta * 16);
        spriteMeshRef.current.rotation.x = THREE.MathUtils.lerp(spriteMeshRef.current.rotation.x, 0.45, delta * 16);
      }
      if (bodyRef.current) {
        bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, -0.4, delta * 14);
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0.75, delta * 14);
        bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0, delta * 14);
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 1.3, delta * 14);
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 1.3, delta * 14);
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.8, delta * 14);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.8, delta * 14);
      }
    } else if (isAirborne) {
      if (spriteMeshRef.current) {
        // Jump animation: dynamic vertical stretch and pitch
        spriteMeshRef.current.position.y = THREE.MathUtils.lerp(spriteMeshRef.current.position.y, 1.25, delta * 14);
        spriteMeshRef.current.scale.y = THREE.MathUtils.lerp(spriteMeshRef.current.scale.y, 1.1, delta * 14);
        spriteMeshRef.current.scale.x = THREE.MathUtils.lerp(spriteMeshRef.current.scale.x, 0.92, delta * 14);
        spriteMeshRef.current.rotation.x = THREE.MathUtils.lerp(spriteMeshRef.current.rotation.x, 0.18, delta * 14);
      }
      if (bodyRef.current) {
        bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 0.05, delta * 12);
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0.22, delta * 12);
        bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0, delta * 12);
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, -0.6, delta * 12);
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.4, delta * 12);
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 1.1, delta * 12);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 1.1, delta * 12);
      }
    } else if (isDinesh) {
      // Dinesh's Signature Dynamic Rail-Surfer Glide Stance for 4K Sprite
      if (spriteMeshRef.current) {
        const runFreq = powerups.hoverboard ? 0 : 16;
        const surfBob = Math.sin(time * runFreq) * 0.07;
        const surfSway = Math.sin(time * (runFreq * 0.5)) * 0.04;
        spriteMeshRef.current.position.y = THREE.MathUtils.lerp(spriteMeshRef.current.position.y, 1.15 + surfBob, delta * 16);
        spriteMeshRef.current.scale.y = THREE.MathUtils.lerp(spriteMeshRef.current.scale.y, 1.0, delta * 14);
        spriteMeshRef.current.scale.x = THREE.MathUtils.lerp(spriteMeshRef.current.scale.x, 1.0, delta * 14);
        spriteMeshRef.current.rotation.x = THREE.MathUtils.lerp(spriteMeshRef.current.rotation.x, 0.1, delta * 12);
        spriteMeshRef.current.rotation.z = THREE.MathUtils.lerp(spriteMeshRef.current.rotation.z, surfSway, delta * 12);
      }
    } else {
      if (bodyRef.current) {
        const bounce = Math.abs(Math.sin(time * runFreq)) * 0.14;
        bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, bounce, delta * 16);
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0.18, delta * 14);
        bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0, delta * 14);
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

    // Dynamic 3D Track Ground Shadow tracking
    if (shadowRef.current) {
      const relY = Math.max(0, posY - baseGroundY);
      shadowRef.current.position.y = (isOnTrain ? 3.22 : 0.03) - posY;
      shadowRef.current.scale.setScalar(Math.max(0.4, 1.0 - relY * 0.15));
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Dynamic 3D Track Ground Shadow */}
      <mesh ref={shadowRef} position={[0, isOnTrain ? 3.22 : 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
      {powerups.hoverboard && !isDinesh && (
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

      {/* Jetpack Equipment */}
      {powerups.jetpack && (
        <group position={[0, 1.3, -0.4]}>
          <mesh position={[-0.22, 0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 0.6, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0.22, 0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 0.6, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[-0.22, -0.4, 0]}>
            <coneGeometry args={[0.12, 0.4, 8]} />
            <meshBasicMaterial color="#f97316" />
          </mesh>
          <mesh position={[0.22, -0.4, 0]}>
            <coneGeometry args={[0.12, 0.4, 8]} />
            <meshBasicMaterial color="#f97316" />
          </mesh>
        </group>
      )}

      {/* Main Character Body Mesh Hierarchy */}
      <group ref={bodyRef}>
        {/* ================= 0. DINESH (CUSTOM 4K CAMERA-FACING SPRITE) ================= */}
        {isDinesh && (
          <group>
            {/* Camera-Facing 4K Character Sprite Billboard */}
            <Billboard follow={true} lockX={true} lockZ={true}>
              <mesh ref={spriteMeshRef} position={[0, 1.15, 0]} castShadow>
                <planeGeometry args={[1.5, 2.28]} />
                <meshBasicMaterial
                  map={characterTexture}
                  transparent={true}
                  alphaTest={0.05}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </Billboard>

            {/* Glowing Golden Speed Sparks under Skateboard */}
            {!powerups.jetpack && (
              <group position={[0, 0.08, 0.35]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.08, 0.35, 12]} />
                  <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, 0.04, 0.15]}>
                  <coneGeometry args={[0.2, 0.35, 6]} rotation={[Math.PI / 2, 0, 0]} />
                  <meshBasicMaterial color="#fbbf24" transparent opacity={0.65} />
                </mesh>
              </group>
            )}

            {/* Neon Cyan Aura when Hoverboard Powerup is Active */}
            {powerups.hoverboard && (
              <mesh position={[0, 0.06, 0]}>
                <boxGeometry args={[0.8, 0.08, 1.6]} />
                <meshBasicMaterial color="#06b6d4" transparent opacity={0.65} />
              </mesh>
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

        {/* ================= ARMS & LEGS (FOR 3D RIGGED CHARACTERS) ================= */}
        {!isDinesh && (
          <group>
            {/* Left Arm */}
            <group ref={leftArmRef} position={[-0.42, 1.48, 0]}>
              <mesh position={[0, -0.28, 0]} castShadow>
                <boxGeometry args={[0.18, 0.6, 0.2]} />
                <meshStandardMaterial color={isYutani ? '#84cc16' : isFresh ? char.skinColor : '#ffffff'} />
              </mesh>
              <mesh position={[0, -0.62, 0]}>
                <sphereGeometry args={[0.1, 10, 10]} />
                <meshStandardMaterial color={isYutani ? '#65a30d' : char.skinColor} />
              </mesh>
            </group>

            {/* Right Arm */}
            <group ref={rightArmRef} position={[0.42, 1.48, 0]}>
              <mesh position={[0, -0.28, 0]} castShadow>
                <boxGeometry args={[0.18, 0.6, 0.2]} />
                <meshStandardMaterial color={isYutani ? '#84cc16' : isFresh ? char.skinColor : '#ffffff'} />
              </mesh>
              <mesh position={[0, -0.62, 0]}>
                <sphereGeometry args={[0.1, 10, 10]} />
                <meshStandardMaterial color={isYutani ? '#65a30d' : char.skinColor} />
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
