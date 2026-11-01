import React from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Preload Indian Railways locomotive texture
useTexture.preload('/indian-train.png');

export default function Train({
  position = [0, 0, 0],
  length = 18,
  hasRamp = true,
  isMoving = false,
  obstacleRef
}) {
  const trainHeight = 3.3;
  const trainWidth = 2.45;

  // Load the 4K Indian Railways WAP-4 locomotive texture
  const trainTexture = useTexture('/indian-train.png');
  if (trainTexture) {
    trainTexture.colorSpace = THREE.SRGBColorSpace;
  }

  return (
    <group position={position} ref={obstacleRef}>
      {/* 1. Front Locomotive Face Facing Player (+Z) with 4K WAP-4 Texture */}
      <group position={[0, 0, length / 2]}>
        {/* 4K Texture Plane */}
        <mesh position={[0, trainHeight / 2 + 0.1, 0.02]} castShadow>
          <planeGeometry args={[trainWidth, trainHeight]} />
          <meshBasicMaterial
            map={trainTexture}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Dual Glowing Top Headlight Beams */}
        <mesh position={[0, trainHeight * 0.92, 0.08]}>
          <cylinderGeometry args={[0.2, 0.22, 0.12, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial
            color="#fffbeb"
            emissive="#fef08a"
            emissiveIntensity={1.8}
          />
        </mesh>

        {/* Headlight Lens Glow Flare */}
        <pointLight
          position={[0, trainHeight * 0.92, 0.8]}
          color="#fef08a"
          intensity={1.2}
          distance={8}
        />

        {/* Heavy-Duty Indian Railways Black & Yellow Cowcatcher */}
        <mesh position={[0, 0.35, 0.1]}>
          <boxGeometry args={[trainWidth + 0.05, 0.42, 0.18]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        {[-0.8, -0.4, 0, 0.4, 0.8].map((cx, i) => (
          <mesh key={i} position={[cx, 0.35, 0.2]}>
            <planeGeometry args={[0.18, 0.38]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
        ))}

        {/* Front Twin Steel Buffers */}
        <mesh position={[-0.85, 0.45, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.2, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[0.85, 0.45, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.2, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
      </group>

      {/* 2. 3D Locomotive Main Body - Deep Crimson Indian Railways Livery */}
      <mesh position={[0, trainHeight / 2 + 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[trainWidth, trainHeight, length]} />
        <meshStandardMaterial
          color="#991b1b" // Deep Crimson Red
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      {/* 3. Iconic Horizontal Yellow/Cream Safety Stripe */}
      <mesh position={[0, trainHeight * 0.44, 0]}>
        <boxGeometry args={[trainWidth + 0.04, 0.38, length + 0.02]} />
        <meshStandardMaterial color="#facc15" roughness={0.3} />
      </mesh>

      {/* 4. Silver/Grey Curved Locomotive Roof */}
      <mesh position={[0, trainHeight + 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[trainWidth * 0.51, trainWidth * 0.51, length - 0.1, 24, 1, false, 0, Math.PI]}
          rotation={[0, 0, -Math.PI / 2]}
        />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.25} />
      </mesh>

      {/* 5. Roof High-Voltage Electric Pantograph (WAP-4) */}
      {[-length * 0.28, length * 0.28].map((pz, idx) => (
        <group key={idx} position={[0, trainHeight + 0.35, pz]}>
          {/* Pantograph base insulator */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.4, 0.1, 1.2]} />
            <meshStandardMaterial color="#7c2d12" roughness={0.7} />
          </mesh>
          {/* Scissor / Diamond Arm */}
          <mesh position={[0, 0.3, 0]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.7, 8]} />
            <meshStandardMaterial color="#f97316" metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.3, 0]} rotation={[-0.4, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.7, 8]} />
            <meshStandardMaterial color="#f97316" metalness={0.7} />
          </mesh>
          {/* Overhead contact collector bar */}
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[1.8, 0.06, 0.2]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* 6. Side Ventilation Louvers / Grilles along Flanks */}
      {[-6, -3, 0, 3, 6].map((zVent, vi) => (
        <React.Fragment key={vi}>
          {/* Left flank grille */}
          <mesh position={[-trainWidth / 2 - 0.03, trainHeight * 0.65, zVent]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[1.6, 0.75]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          {/* Right flank grille */}
          <mesh position={[trainWidth / 2 + 0.03, trainHeight * 0.65, zVent]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[1.6, 0.75]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
        </React.Fragment>
      ))}

      {/* 7. Front Jump Ramp (if enabled) */}
      {hasRamp && (
        <group position={[0, 0, length / 2 + 1.2]}>
          <mesh position={[0, 0.8, 0]} rotation={[0.42, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[trainWidth * 0.85, 0.22, 2.8]} />
            <meshStandardMaterial color="#eab308" roughness={0.4} />
          </mesh>
          {/* Caution hazard chevrons */}
          <mesh position={[0, 0.94, 0]} rotation={[0.42, 0, 0]}>
            <planeGeometry args={[trainWidth * 0.75, 0.4]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>
      )}

      {/* 8. Heavy-Duty Steel Wheel Bogies */}
      {[-length * 0.35, 0, length * 0.35].map((zBogey, bi) => (
        <group key={bi} position={[0, 0.35, zBogey]}>
          <mesh position={[-trainWidth / 2 + 0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 0.25, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          <mesh position={[trainWidth / 2 - 0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 0.25, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
