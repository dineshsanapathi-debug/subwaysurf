import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Mango from './Mango';

// Game uses standard 3-lane X coordinates: -3.2 (Left), 0 (Center), +3.2 (Right)
const LANES = [-3.2, 0, 3.2];

/**
 * MangoCollection
 * Coordinates 3D Mango collectibles across the railway tracks and upper routes.
 * Supports both streaming engine pool and standalone procedural lane patterns.
 * Performs high-performance useFrame collision checks using refs.
 */
export default function MangoCollection({
  mangoes = [],
  playerPosition = [0, 0, 0],
  onMangoCollected,
  powerups = [],
  count = 60,
  startZ = -8,
  spacing = 4.5
}) {
  const [collectedIds, setCollectedIds] = useState(new Set());
  const playerPosRef = useRef(new THREE.Vector3(0, 0, 0));

  // If external mangoes array is provided from GameLogic, use that; otherwise generate lane pattern
  const proceduralMangoes = useMemo(() => {
    if (mangoes.length > 0) return null;
    return Array.from({ length: count }, (_, i) => ({
      id: 'm_gen_' + i,
      x: LANES[i % LANES.length],
      y: 1.15,
      z: startZ - i * spacing
    }));
  }, [mangoes.length, count, startZ, spacing]);

  const activeItems = mangoes.length > 0 ? mangoes : (proceduralMangoes || []);

  useFrame(() => {
    // Continuous distance check inside useFrame using refs (no frame-by-frame setState)
    playerPosRef.current.set(playerPosition[0], playerPosition[1], playerPosition[2]);
    const px = playerPosRef.current.x;
    const py = playerPosRef.current.y;
    const pz = playerPosRef.current.z;

    if (!proceduralMangoes) return;

    for (const item of activeItems) {
      if (collectedIds.has(item.id)) continue;
      const dx = px - item.x;
      const dy = py - item.y;
      const dz = pz - item.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < 1.15) {
        setCollectedIds((prev) => new Set(prev).add(item.id));
        onMangoCollected?.(item);
        break;
      }
    }
  });

  return (
    <group>
      {activeItems.map((item) => {
        if (collectedIds.has(item.id)) return null;
        return (
          <Mango
            key={item.id}
            position={[item.x, item.y, item.z]}
            scale={0.95}
          />
        );
      })}

      {/* Render powerup bubbles if present */}
      {powerups.map((p) => (
        <group key={p.id} position={[p.x, p.y, p.z]}>
          <mesh>
            <sphereGeometry args={[0.65, 16, 16]} />
            <meshBasicMaterial
              color={
                p.type === 'magnet'
                  ? '#ef4444'
                  : p.type === 'jetpack'
                  ? '#f97316'
                  : p.type === 'hoverboard'
                  ? '#06b6d4'
                  : '#a855f7'
              }
              transparent
              opacity={0.3}
              wireframe
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

