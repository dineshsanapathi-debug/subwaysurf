import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Pre-allocated shared geometries for high-performance zero-GC rendering
const mangoBodyGeo = new THREE.SphereGeometry(0.42, 12, 12);
const mangoStemGeo = new THREE.CylinderGeometry(0.025, 0.035, 0.13, 6);
const mangoLeafGeo = new THREE.SphereGeometry(0.17, 8, 6);

// Pre-allocated shared materials
const mangoBodyMat = new THREE.MeshStandardMaterial({
  color: '#ff9f1c',
  roughness: 0.38,
  metalness: 0.05,
  emissive: '#f59e0b',
  emissiveIntensity: 0.28
});
const mangoStemMat = new THREE.MeshStandardMaterial({ color: '#557a32', roughness: 0.8 });
const mangoLeafMat = new THREE.MeshStandardMaterial({
  color: '#22c55e',
  roughness: 0.6,
  emissive: '#15803d',
  emissiveIntensity: 0.2
});

/**
 * Realistic 3D Mango Collectible (Optimized High-Performance Rendering)
 */
function MangoComponent({
  position = [0, 1, 0],
  scale = 1
}) {
  const spinRef = useRef();

  useFrame((state, delta) => {
    if (spinRef.current) {
      spinRef.current.rotation.y += delta * 2.0;
    }
  });

  return (
    <group position={position} scale={scale}>
      <group ref={spinRef}>
        {/* Golden Indian Mango body */}
        <mesh geometry={mangoBodyGeo} material={mangoBodyMat} scale={[0.74, 1.05, 0.64]} rotation={[0, 0, -0.15]} />

        {/* Small green stem on top */}
        <mesh geometry={mangoStemGeo} material={mangoStemMat} position={[0, 0.44, 0]} rotation={[0, 0, -0.2]} />

        {/* Fresh Green Leaf attached to stem */}
        <mesh geometry={mangoLeafGeo} material={mangoLeafMat} position={[0.13, 0.46, 0]} rotation={[0, 0, 0.45]} scale={[1, 0.35, 0.7]} />
      </group>
    </group>
  );
}

export const Mango = React.memo(MangoComponent);
export default Mango;
export { Mango as MangoItem, Mango as MangoMesh };
