import React from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Preload Indian Railways locomotive texture
useTexture.preload('/indian-train.png');

export default function TrainObstacle({
  position = [0, 0, -20],
  obstacleRef,
  length = 18,
  hasRamp = true
}) {
  const texture = useTexture('/indian-train.png');
  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }

  const trainWidth = 2.5;
  const trainHeight = 3.4;

  return (
    <group position={position} ref={obstacleRef}>
      {/* Front Face with Indian Railways WAP-4 Texture (facing the runner at +Z) */}
      <mesh position={[0, trainHeight / 2 + 0.1, length / 2 + 0.02]} castShadow>
        <planeGeometry args={[trainWidth, trainHeight]} />
        <meshBasicMaterial
          map={texture}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3D Train Body - Crimson Red Indian Railways Locomotive */}
      <mesh position={[0, trainHeight / 2 + 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[trainWidth, trainHeight, length]} />
        <meshStandardMaterial color="#991b1b" roughness={0.35} metalness={0.2} />
      </mesh>

      {/* Cream/Yellow Indian Railways Livery Stripe */}
      <mesh position={[0, trainHeight * 0.45, 0]}>
        <boxGeometry args={[trainWidth + 0.05, 0.4, length + 0.05]} />
        <meshStandardMaterial color="#facc15" roughness={0.3} />
      </mesh>

      {/* Silver/Grey Roof Walkway */}
      <mesh position={[0, trainHeight + 0.15, 0]} receiveShadow>
        <boxGeometry args={[trainWidth * 0.9, 0.1, length]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* Roof Pantograph (Electric WAP-4) */}
      <group position={[0, trainHeight + 0.6, length * 0.2]}>
        <mesh rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
          <meshStandardMaterial color="#f97316" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.6, 0.05, 0.3]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Jump Ramp on the front bumper if enabled */}
      {hasRamp && (
        <group position={[0, 0, length / 2 + 1.2]}>
          <mesh position={[0, 0.8, 0]} rotation={[0.42, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[trainWidth * 0.85, 0.22, 2.8]} />
            <meshStandardMaterial color="#eab308" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.94, 0]} rotation={[0.42, 0, 0]}>
            <planeGeometry args={[trainWidth * 0.75, 0.4]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>
      )}

      {/* Invisible Collision Box */}
      <mesh position={[0, trainHeight / 2 + 0.1, 0]}>
        <boxGeometry args={[trainWidth, trainHeight, length]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
