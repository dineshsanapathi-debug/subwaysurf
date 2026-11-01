import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function UpperFloor({ active = true, speed = 20 }) {
  const floor1Ref = useRef();
  const floor2Ref = useRef();

  useFrame((state, delta) => {
    if (!active) return;
    const moveDist = speed * delta;

    if (floor1Ref.current) {
      floor1Ref.current.position.z += moveDist;
      if (floor1Ref.current.position.z > 50) {
        floor1Ref.current.position.z -= 200;
      }
    }

    if (floor2Ref.current) {
      floor2Ref.current.position.z += moveDist;
      if (floor2Ref.current.position.z > 50) {
        floor2Ref.current.position.z -= 200;
      }
    }
  });

  if (!active) return null;

  return (
    <group position={[0, 4.8, 0]}>
      {/* Upper Floor Segment 1 */}
      <group ref={floor1Ref} position={[0, 0, -25]}>
        {/* Main Elevated Skyway Deck */}
        <mesh position={[0, -0.15, 0]} receiveShadow>
          <boxGeometry args={[12, 0.25, 100]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Center Neon Guide Strip */}
        <mesh position={[0, 0.02, 0]}>
          <planeGeometry args={[0.4, 100]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* Left Glowing Cyan Railing */}
        <mesh position={[-5.8, 0.15, 0]}>
          <boxGeometry args={[0.2, 0.45, 100]} />
          <meshStandardMaterial color="#00d9ff" emissive="#00d9ff" emissiveIntensity={2.5} />
        </mesh>

        {/* Right Glowing Cyan Railing */}
        <mesh position={[5.8, 0.15, 0]}>
          <boxGeometry args={[0.2, 0.45, 100]} />
          <meshStandardMaterial color="#00d9ff" emissive="#00d9ff" emissiveIntensity={2.5} />
        </mesh>
      </group>

      {/* Upper Floor Segment 2 (Continuous Streaming Ahead) */}
      <group ref={floor2Ref} position={[0, 0, -125]}>
        <mesh position={[0, -0.15, 0]} receiveShadow>
          <boxGeometry args={[12, 0.25, 100]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>

        <mesh position={[0, 0.02, 0]}>
          <planeGeometry args={[0.4, 100]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        <mesh position={[-5.8, 0.15, 0]}>
          <boxGeometry args={[0.2, 0.45, 100]} />
          <meshStandardMaterial color="#00d9ff" emissive="#00d9ff" emissiveIntensity={2.5} />
        </mesh>

        <mesh position={[5.8, 0.15, 0]}>
          <boxGeometry args={[0.2, 0.45, 100]} />
          <meshStandardMaterial color="#00d9ff" emissive="#00d9ff" emissiveIntensity={2.5} />
        </mesh>
      </group>
    </group>
  );
}
