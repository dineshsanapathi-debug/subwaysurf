import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 3D Stylized Juicy Mango Model
 * Stands in a 100% vertical upright position and spins along the Y-axis.
 * Features:
 *  - Organic curved Alphonso mango shape (vertical orientation)
 *  - Warm golden-yellow skin with sunset-orange/crimson blush
 *  - Stem and fresh green leaf on top (+Y)
 *  - Glossy cartoon material with juicy emissive glow
 *  - Golden sparkle aura
 */
export function MangoMesh({ scale = 1, showSparkles = true }) {
  const spinGroupRef = useRef();
  const auraRef = useRef();

  useFrame((state, delta) => {
    if (spinGroupRef.current) {
      // Smooth continuous spin around vertical Y axis
      spinGroupRef.current.rotation.y += delta * 3.2;
    }
    if (auraRef.current) {
      auraRef.current.rotation.z -= delta * 1.5;
    }
  });

  return (
    <group ref={spinGroupRef} scale={scale}>
      {/* --- Mango Main Body (Vertical orientation) --- */}
      {/* Primary mango body - elongated vertically */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.34, 24, 24]} />
        <meshStandardMaterial
          color="#ffb703" // Ripe Alphonso golden yellow
          roughness={0.25}
          metalness={0.1}
          emissive="#f59e0b"
          emissiveIntensity={0.28}
        />
      </mesh>

      {/* Iconic asymmetric mango curve / belly cheek */}
      <mesh position={[0.07, -0.06, 0.02]} scale={[0.88, 1.15, 0.85]} castShadow>
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshStandardMaterial
          color="#fb8500" // Vibrant mango orange
          roughness={0.28}
          metalness={0.08}
          emissive="#ea580c"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Sunset crimson blush on cheek */}
      <mesh position={[-0.08, 0.02, 0.04]} scale={[0.65, 0.95, 0.65]}>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial
          color="#e11d48" // Rose red / crimson blush
          roughness={0.35}
          metalness={0.05}
          emissive="#dc2626"
          emissiveIntensity={0.22}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Mango base tip (tapered bottom) */}
      <mesh position={[0.02, -0.28, 0]} scale={[0.55, 0.6, 0.55]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color="#f59e0b"
          roughness={0.3}
          metalness={0.05}
        />
      </mesh>

      {/* --- Top Stem & Leaf (Strictly on +Y top) --- */}
      {/* Stem base cap (calyx) */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.04, 10]} />
        <meshStandardMaterial color="#3f2e18" roughness={0.7} />
      </mesh>

      {/* Woody stem standing upright with gentle natural tilt */}
      <mesh position={[-0.01, 0.46, 0]} rotation={[0, 0, 0.14]} castShadow>
        <cylinderGeometry args={[0.022, 0.032, 0.16, 8]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>

      {/* Fresh Green Mango Leaf attached to stem */}
      <group position={[0.03, 0.44, 0]} rotation={[0.2, 0, -0.65]}>
        {/* Leaf blade */}
        <mesh position={[0.16, 0.06, 0]} scale={[1.8, 0.55, 0.15]}>
          <coneGeometry args={[0.1, 0.28, 8]} />
          <meshStandardMaterial
            color="#16a34a" // Emerald leaf green
            roughness={0.35}
            metalness={0.1}
            emissive="#15803d"
            emissiveIntensity={0.15}
          />
        </mesh>
        {/* Leaf center spine / vein */}
        <mesh position={[0.16, 0.06, 0.015]} scale={[1.8, 0.12, 0.08]}>
          <boxGeometry args={[0.04, 0.26, 0.02]} />
          <meshBasicMaterial color="#86efac" />
        </mesh>
      </group>

      {/* Glossy dew highlight on mango shoulder */}
      <mesh position={[0.14, 0.18, 0.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
      </mesh>

      {/* Golden Aura / Floating Sparkle Ring */}
      {showSparkles && (
        <group ref={auraRef} position={[0, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.48, 0.52, 24]} />
            <meshBasicMaterial
              color="#fde047"
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

/**
 * Single Mango Item placed in the 3D scene
 * Stands vertically upright at `position` with a gentle hover bob.
 */
export default function MangoItem({ position = [0, 1, 0], scale = 1 }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    // Subtle organic hover bobbing without moving away from its track height
    const bob = Math.sin(time * 3.5 + position[2] * 0.4) * 0.06;
    groupRef.current.position.y = position[1] + bob;
  });

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      <MangoMesh scale={scale} />
    </group>
  );
}
