import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Jetpack({ active = false, playerRef, height = 6.2 }) {
  const time = useRef(0);
  const flameLeftRef = useRef();
  const flameRightRef = useRef();

  useFrame((state, delta) => {
    if (!active) return;
    time.current += delta;
    const t = time.current;

    // Smooth elevation tracking with floating hover bob
    if (playerRef?.current) {
      const targetHeight = height + Math.sin(t * 4) * 0.15;
      playerRef.current.position.y = THREE.MathUtils.lerp(
        playerRef.current.position.y,
        targetHeight,
        Math.min(delta * 5, 1)
      );
    }

    // Flame flicker
    if (flameLeftRef.current && flameRightRef.current) {
      const flicker = 0.8 + Math.sin(t * 30) * 0.3;
      flameLeftRef.current.scale.set(flicker, flicker * 1.2, flicker);
      flameRightRef.current.scale.set(flicker, flicker * 1.2, flicker);
    }
  });

  if (!active) return null;

  return null;
}
