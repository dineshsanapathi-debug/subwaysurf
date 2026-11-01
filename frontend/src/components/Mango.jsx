import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Realistic 3D Mango Collectible
 * Features:
 * - Tapered, rounded fruit shape in vertical orientation
 * - Yellow-orange skin with subtle sunset blush
 * - Small green stem and fresh green leaf on top (+Y)
 * - Gentle floating and slow continuous rotation
 */
export default function Mango({
  position = [0, 1, 0],
  scale = 1,
  onCollect
}) {
  const group = useRef();
  const spinRef = useRef();

  useFrame((state, delta) => {
    if (!group.current) return;

    // Gentle floating and rotation animation
    if (spinRef.current) {
      spinRef.current.rotation.y += delta * 1.8;
    }
    const bob = Math.sin(state.clock.elapsedTime * 2.5 + position[2] * 0.4) * 0.12;
    group.current.position.y = position[1] + bob;
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <group ref={spinRef}>
        {/* Mango body: tapered, rounded fruit shape */}
        <mesh castShadow scale={[0.72, 1.0, 0.62]} rotation={[0, 0, -0.15]}>
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshStandardMaterial
            color="#ff9f1c" // Vibrant yellow-orange skin
            roughness={0.42}
            metalness={0.05}
            emissive="#f59e0b"
            emissiveIntensity={0.22}
          />
        </mesh>

        {/* Sunset crimson blush on cheek */}
        <mesh position={[-0.08, 0.05, 0.04]} scale={[0.55, 0.85, 0.55]}>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial
            color="#ef4444" // Rosy red / crimson blush
            roughness={0.45}
            metalness={0.0}
            emissive="#dc2626"
            emissiveIntensity={0.2}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Small green stem on top (+Y) */}
        <mesh position={[0, 0.42, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.025, 0.035, 0.13, 8]} />
          <meshStandardMaterial color="#557a32" roughness={0.8} />
        </mesh>

        {/* Fresh Green Leaf attached to stem */}
        <mesh position={[0.13, 0.45, 0]} rotation={[0, 0, 0.45]} scale={[1, 0.35, 0.7]}>
          <sphereGeometry args={[0.17, 12, 10]} />
          <meshStandardMaterial
            color="#2f8f46" // Leaf green
            roughness={0.7}
            emissive="#15803d"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Subtle Golden Glow Halo Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.48, 0.52, 24]} />
          <meshBasicMaterial
            color="#fde047"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

// Re-export Mango as MangoItem and MangoMesh for full backward compatibility
export { Mango as MangoItem, Mango as MangoMesh };
