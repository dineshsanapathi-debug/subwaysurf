import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export default function RemoveDebugLines() {
  const { scene } = useThree();

  useEffect(() => {
    scene.traverse((object) => {
      // Hide common debugging helpers
      if (
        object.isGridHelper ||
        object.isAxesHelper ||
        object.isBoxHelper ||
        object.isCameraHelper ||
        object.isSkeletonHelper
      ) {
        object.visible = false;
      }

      // Hide only explicitly named debug line objects.
      // Do not hide every Line or LineSegments object.
      if (
        (object.isLine || object.isLineSegments || object.isLineLoop) &&
        /debug|helper|guideline|testline/i.test(object.name)
      ) {
        object.visible = false;
      }
    });
  }, [scene]);

  return null;
}

