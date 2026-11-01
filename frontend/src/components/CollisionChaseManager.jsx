import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * CollisionChaseManager
 * Detects side/obstacle collisions and manages the 5-second police chase state.
 * Refreshes the 5-second chase timer whenever a new collision occurs.
 */
export default function CollisionChaseManager({
  playerRef,
  obstacleRefs = [],
  engine,
  onChaseChange,
}) {
  const playerBox = useRef(new THREE.Box3());
  const obstacleBox = useRef(new THREE.Box3());
  const wasColliding = useRef(false);

  const [chaseActive, setChaseActive] = useState(false);
  const chaseEndTime = useRef(0);

  // Hook into engine's side collision listener
  useEffect(() => {
    if (!engine) return;

    const originalListener = engine.onSideCollision;
    engine.onSideCollision = (obstacle) => {
      // Refresh 5-second chase timer on collision
      chaseEndTime.current = performance.now() + 5000;
      if (!chaseActive) {
        setChaseActive(true);
        onChaseChange?.(true);
      }
      if (originalListener) originalListener(obstacle);
    };

    return () => {
      engine.onSideCollision = originalListener;
    };
  }, [engine, chaseActive, onChaseChange]);

  useFrame(() => {
    // 1. Check direct 3D bounding box collisions if obstacle refs are provided
    if (playerRef?.current && obstacleRefs.length > 0) {
      playerBox.current.setFromObject(playerRef.current);
      let collision = false;

      for (const obsRef of obstacleRefs) {
        if (!obsRef?.current) continue;
        obstacleBox.current.setFromObject(obsRef.current);

        if (playerBox.current.intersectsBox(obstacleBox.current)) {
          collision = true;
          break;
        }
      }

      // Edge-triggered: start or refresh chase on new contact
      if (collision && !wasColliding.current) {
        chaseEndTime.current = performance.now() + 5000;
        if (!chaseActive) {
          setChaseActive(true);
          onChaseChange?.(true);
        }
      }
      wasColliding.current = collision;
    }

    // 2. Manage 5-second timer expiration
    if (chaseActive && performance.now() >= chaseEndTime.current) {
      setChaseActive(false);
      onChaseChange?.(false);
    }
  });

  return null;
}

