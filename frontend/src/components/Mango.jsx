import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Pre-allocated shared geometries for high-performance zero-GC rendering
const mangoBodyGeo = new THREE.SphereGeometry(0.42, 16, 16);
const mangoBlushGeo = new THREE.SphereGeometry(0.32, 12, 12);
const mangoStemGeo = new THREE.CylinderGeometry(0.025, 0.035, 0.13, 8);
const mangoLeafGeo = new THREE.SphereGeometry(0.17, 10, 8);
const mangoRingGeo = new THREE.RingGeometry(0.48, 0.52, 16);

// Pre-allocated shared materials
const mangoBodyMat = new THREE.MeshStandardMaterial({
  color: '#ff9f1c',
  roughness: 0.42,
  metalness: 0.05,
  emissive: '#f59e0b',
  emissiveIntensity: 0.22
});
const mangoBlushMat = new THREE.MeshStandardMaterial({
  color: '#ef4444',
  roughness: 0.45,
  metalness: 0.0,
  emissive: '#dc2626',
  emissiveIntensity: 0.2,
  transparent: true,
  opacity: 0.8
});
const mangoStemMat = new THREE.MeshStandardMaterial({ color: '#557a32', roughness: 0.8 });
const mangoLeafMat = new THREE.MeshStandardMaterial({
  color: '#2f8f46',
  roughness: 0.7,
  emissive: '#15803d',
  emissiveIntensity: 0.15
});
const mangoRingMat = new THREE.MeshBasicMaterial({
  color: '#fde047',
  transparent: true,
  opacity: 0.3,
  side: THREE.DoubleSide
});

/**
 * Realistic 3D Mango Collectible (Optimized High-Performance Instancing)
 */
function MangoComponent({
  position = [0, 1, 0],
  scale = 1
}) {
  const group = useRef();
  const spinRef = useRef();

  useFrame((state, delta) => {
    if (!group.current) return;

    if (spinRef.current) {
      spinRef.current.rotation.y += delta * 1.8;
    }
    const bob = Math.sin(state.clock.elapsedTime * 2.5 + position[2] * 0.4) * 0.12;
    group.current.position.y = position[1] + bob;
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <group ref={spinRef}>
        {/* Mango body */}
        <mesh geometry={mangoBodyGeo} material={mangoBodyMat} scale={[0.72, 1.0, 0.62]} rotation={[0, 0, -0.15]} />

        {/* Sunset crimson blush on cheek */}
        <mesh geometry={mangoBlushGeo} material={mangoBlushMat} position={[-0.08, 0.05, 0.04]} scale={[0.55, 0.85, 0.55]} />

        {/* Small green stem on top */}
        <mesh geometry={mangoStemGeo} material={mangoStemMat} position={[0, 0.42, 0]} rotation={[0, 0, -0.2]} />

        {/* Fresh Green Leaf attached to stem */}
        <mesh geometry={mangoLeafGeo} material={mangoLeafMat} position={[0.13, 0.45, 0]} rotation={[0, 0, 0.45]} scale={[1, 0.35, 0.7]} />

        {/* Subtle Golden Glow Halo Ring */}
        <mesh geometry={mangoRingGeo} material={mangoRingMat} rotation={[Math.PI / 2, 0, 0]} />
      </group>
    </group>
  );
}

export const Mango = React.memo(MangoComponent);
export default Mango;
export { Mango as MangoItem, Mango as MangoMesh };
