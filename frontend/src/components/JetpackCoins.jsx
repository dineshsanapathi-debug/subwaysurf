import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Single Vertical Upright Rotating Coin
function VerticalSkyCoin({ position = [0, 6.2, 0] }) {
  const spinRef = useRef();

  useFrame((state, delta) => {
    if (spinRef.current) {
      spinRef.current.rotation.y += delta * 3.5;
    }
  });

  return (
    <group position={position}>
      {/* Outer spinning group rotating around vertical Y axis */}
      <group ref={spinRef}>
        {/* Cylinder rotated so its circular faces are standing upright/vertical */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.08, 32]} />
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.9}
            roughness={0.15}
            emissive="#ffb700"
            emissiveIntensity={0.35}
          />
        </mesh>
        {/* Star emblem embossed on both faces */}
        <mesh position={[0, 0, 0.045]}>
          <circleGeometry args={[0.18, 5]} />
          <meshBasicMaterial color="#d97706" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, -0.045]}>
          <circleGeometry args={[0.18, 5]} />
          <meshBasicMaterial color="#d97706" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

export default function JetpackCoins({
  active = false,
  speed = 20,
  playerX = 0,
  playerY = 6.2,
  onCollect
}) {
  const [coins, setCoins] = useState([]);
  const nextSpawnZ = useRef(-30);

  // Initialize sky coin formations when jetpack starts
  useEffect(() => {
    if (active) {
      const initial = [];
      let z = -20;
      // Generate multiple waves and formations
      for (let i = 0; i < 40; i++) {
        const formationType = Math.floor(i / 10);
        let x = 0;

        if (formationType === 0) {
          // Center lane sprint
          x = 0;
        } else if (formationType === 1) {
          // Smooth sine curve weaving across lanes
          x = Math.sin(i * 0.45) * 3.2;
        } else if (formationType === 2) {
          // Double lane jumps (left to right)
          x = (i % 2 === 0 ? -1 : 1) * 3.2;
        } else {
          // High vertical arc
          x = 0;
        }

        const y = 6.2 + Math.sin(i * 0.3) * 0.35;

        initial.push({
          id: 'jk_' + i + '_' + Math.random(),
          x,
          y,
          z,
          collected: false
        });
        z -= 3.2;
      }
      setCoins(initial);
      nextSpawnZ.current = z;
    } else {
      setCoins([]);
    }
  }, [active]);

  useFrame((state, delta) => {
    if (!active || coins.length === 0) return;
    const moveDist = speed * delta;

    setCoins((prevCoins) => {
      const updated = [];
      for (const coin of prevCoins) {
        const newZ = coin.z + moveDist;

        // Distance-based collision detection with player in the air
        if (!coin.collected) {
          const dx = coin.x - playerX;
          const dy = coin.y - playerY;
          const dz = newZ - 0; // player is at z = 0
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 1.45) {
            // Collected!
            coin.collected = true;
            if (onCollect) onCollect(coin);
            continue; // Remove immediately on collection
          }
        }

        // Keep coin if still ahead of camera
        if (newZ < 15 && !coin.collected) {
          coin.z = newZ;
          updated.push(coin);
        }
      }

      // Stream new sky coins ahead if needed
      if (updated.length < 25) {
        const lastZ = updated.length > 0 ? Math.min(...updated.map((c) => c.z)) : nextSpawnZ.current;
        for (let i = 1; i <= 10; i++) {
          const z = lastZ - i * 3.2;
          const x = Math.sin(z * 0.1) * 3.2;
          updated.push({
            id: 'jk_' + Math.random(),
            x,
            y: 6.2 + Math.sin(z * 0.15) * 0.3,
            z,
            collected: false
          });
        }
      }

      return updated;
    });
  });

  if (!active) return null;

  return (
    <group>
      {coins.map((c) => (
        <VerticalSkyCoin key={c.id} position={[c.x, c.y, c.z]} />
      ))}
    </group>
  );
}
