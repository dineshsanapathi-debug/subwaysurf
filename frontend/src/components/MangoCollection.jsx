import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
// Pre-allocated shared geometries and materials for zero-overhead instancing
const mangoBodyGeo = new THREE.SphereGeometry(0.42, 12, 12);
const mangoLeafGeo = new THREE.SphereGeometry(0.17, 8, 6);
const mangoBodyMat = new THREE.MeshStandardMaterial({
  color: '#ff9f1c',
  roughness: 0.38,
  metalness: 0.05,
  emissive: '#f59e0b',
  emissiveIntensity: 0.28
});
const mangoLeafMat = new THREE.MeshStandardMaterial({
  color: '#22c55e',
  roughness: 0.6,
  emissive: '#15803d',
  emissiveIntensity: 0.2
});

const MAX_MANGO_INSTANCES = 150;

/**
 * InstancedMangoes
 * Renders up to 150 3D Mango collectibles in exactly 2 GPU draw calls.
 */
function InstancedMangoes({ items, collectedIds }) {
  const bodyRef = useRef();
  const leafRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const spinAngle = useRef(0);

  useFrame((state, delta) => {
    if (!bodyRef.current) return;
    spinAngle.current += delta * 2.2;
    const spin = spinAngle.current;
    const count = Math.min(items.length, MAX_MANGO_INSTANCES);

    for (let i = 0; i < count; i++) {
      const item = items[i];
      if (collectedIds.has(item.id)) {
        dummy.position.set(0, -999, 0);
        dummy.scale.set(0, 0, 0);
      } else {
        dummy.position.set(item.x, item.y, item.z);
        dummy.rotation.set(0, spin + (i % 8) * 0.4, -0.15);
        dummy.scale.set(0.74, 1.05, 0.64);
      }
      dummy.updateMatrix();
      bodyRef.current.setMatrixAt(i, dummy.matrix);

      if (leafRef.current) {
        if (collectedIds.has(item.id)) {
          dummy.position.set(0, -999, 0);
          dummy.scale.set(0, 0, 0);
        } else {
          dummy.position.set(item.x + 0.1, item.y + 0.44, item.z);
          dummy.rotation.set(0, spin + (i % 8) * 0.4, 0.45);
          dummy.scale.set(0.18, 0.08, 0.14);
        }
        dummy.updateMatrix();
        leafRef.current.setMatrixAt(i, dummy.matrix);
      }
    }

    // Hide remaining unused slots
    for (let i = count; i < MAX_MANGO_INSTANCES; i++) {
      dummy.position.set(0, -999, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      bodyRef.current.setMatrixAt(i, dummy.matrix);
      if (leafRef.current) leafRef.current.setMatrixAt(i, dummy.matrix);
    }

    bodyRef.current.instanceMatrix.needsUpdate = true;
    if (leafRef.current) leafRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        args={[mangoBodyGeo, mangoBodyMat, MAX_MANGO_INSTANCES]}
      />
      <instancedMesh
        ref={leafRef}
        args={[mangoLeafGeo, mangoLeafMat, MAX_MANGO_INSTANCES]}
      />
    </group>
  );
}

// Game uses standard 3-lane X coordinates: -3.2 (Left), 0 (Center), +3.2 (Right)
const LANES = [-3.2, 0, 3.2];

/**
 * MangoCollection
 * Coordinates 3D Mango collectibles across the railway tracks and upper routes.
 * Supports both streaming engine pool and standalone procedural lane patterns.
 * Performs high-performance useFrame collision checks using refs.
 */
// 3D Animated Rocket Power-up Item ("Rocket Type Thing")
function RocketItem({ position = [0, 1.2, 0] }) {
  const group = useRef();

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 2.2;
    group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3.5 + position[2]) * 0.15;
  });

  return (
    <group ref={group} position={position} scale={0.95}>
      {/* Outer Glowing Energy Pulse Sphere */}
      <mesh>
        <sphereGeometry args={[0.72, 16, 16]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.25} wireframe />
      </mesh>

      {/* Main 3D Classic Red & White Rocket */}
      <group rotation={[0, 0, -0.2]}>
        {/* Fuselage - Crimson Red */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.26, 0.75, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.35} />
        </mesh>
        {/* White Center Stripe */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.245, 0.245, 0.28, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        {/* Pointed Nose Cone */}
        <mesh position={[0, 0.52, 0]} castShadow>
          <coneGeometry args={[0.24, 0.42, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} />
        </mesh>
        {/* Thruster Nozzle */}
        <mesh position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.18, 0.12, 0.2, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        {/* Animated Fiery Rocket Flame */}
        <mesh position={[0, -0.65, 0]}>
          <coneGeometry args={[0.16, 0.38, 8]} rotation={[Math.PI, 0, 0]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.88} />
        </mesh>
        {/* Stabilizer Fins */}
        {[-0.26, 0.26].map((fx, fi) => (
          <mesh key={fi} position={[fx, -0.22, 0]}>
            <boxGeometry args={[0.16, 0.32, 0.04]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

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
      {/* High-Performance Instanced Mangoes (Replaces 60+ individual meshes with 2 draw calls) */}
      <InstancedMangoes items={activeItems} collectedIds={collectedIds} />

      {/* Render powerup items (featuring full 3D Rocket for jetpack) */}
      {powerups.map((p) => {
        if (p.type === 'jetpack') {
          return <RocketItem key={p.id} position={[p.x, p.y, p.z]} />;
        }

        return (
          <group key={p.id} position={[p.x, p.y, p.z]}>
            <mesh>
              <sphereGeometry args={[0.65, 16, 16]} />
              <meshBasicMaterial
                color={
                  p.type === 'magnet'
                    ? '#ef4444'
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
        );
      })}
    </group>
  );
}

