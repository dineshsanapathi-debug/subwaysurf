import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function CoinItem({ position = [0, 1, 0] }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 4;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.1, 16]} />
        <meshStandardMaterial
          color="#facc15"
          emissive="#eab308"
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      {/* Coin inner ring accent */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.28, 16]} />
        <meshBasicMaterial color="#ca8a04" />
      </mesh>
    </group>
  );
}

export function PowerupItem({ type = 'magnet', position = [0, 1.2, 0] }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y += delta * 3;
    groupRef.current.position.y = position[1] + Math.sin(time * 4) * 0.15;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Glowing aura bubble */}
      <mesh>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshBasicMaterial
          color={
            type === 'magnet'
              ? '#ef4444'
              : type === 'jetpack'
              ? '#f97316'
              : type === 'hoverboard'
              ? '#06b6d4'
              : '#a855f7'
          }
          transparent
          opacity={0.3}
          wireframe
        />
      </mesh>

      {/* Power-up specific 3D model */}
      {type === 'magnet' && (
        <group scale={[0.8, 0.8, 0.8]}>
          <mesh castShadow>
            <torusGeometry args={[0.35, 0.1, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#dc2626" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[-0.35, -0.2, 0]}>
            <boxGeometry args={[0.2, 0.3, 0.2]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.8} />
          </mesh>
          <mesh position={[0.35, -0.2, 0]}>
            <boxGeometry args={[0.2, 0.3, 0.2]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.8} />
          </mesh>
        </group>
      )}

      {type === 'jetpack' && (
        <group scale={[0.7, 0.7, 0.7]}>
          <mesh position={[-0.2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.16, 0.6, 12]} />
            <meshStandardMaterial color="#f97316" metalness={0.6} />
          </mesh>
          <mesh position={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.16, 0.6, 12]} />
            <meshStandardMaterial color="#f97316" metalness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.3, 0.4, 0.15]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      )}

      {type === 'hoverboard' && (
        <group scale={[0.65, 0.65, 0.65]} rotation={[0.4, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.08, 1.4]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#06b6d4"
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>
      )}

      {type === 'multiplier' && (
        <group scale={[0.7, 0.7, 0.7]}>
          <mesh castShadow>
            <octahedronGeometry args={[0.4, 0]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#a855f7"
              emissiveIntensity={0.7}
              metalness={0.8}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function Coins({ coins = [], powerups = [] }) {
  return (
    <group>
      {coins.map((c) => (
        <CoinItem key={c.id} position={[c.x, c.y, c.z]} />
      ))}
      {powerups.map((p) => (
        <PowerupItem key={p.id} type={p.type} position={[p.x, p.y, p.z]} />
      ))}
    </group>
  );
}

