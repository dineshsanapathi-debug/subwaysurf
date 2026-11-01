import { useState, useRef, useCallback, useEffect } from 'react';

const MANGO_TARGET = 200;
const SHIELD_DURATION = 10;

export default function useMangoShield() {
  const [mangoProgress, setMangoProgress] = useState(0);
  const [shieldActive, setShieldActive] = useState(false);
  const [shieldTime, setShieldTime] = useState(0);

  const shieldUntil = useRef(0);

  // Call whenever the player collects a mango
  const collectMango = useCallback(() => {
    setMangoProgress((previous) => {
      const next = previous + 1;

      if (next >= MANGO_TARGET) {
        shieldUntil.current =
          Date.now() + SHIELD_DURATION * 1000;

        setShieldActive(true);
        setShieldTime(SHIELD_DURATION);

        return next - MANGO_TARGET;
      }

      return next;
    });
  }, []);

  // Call whenever the player collides with an obstacle
  const absorbHit = useCallback(() => {
    if (Date.now() >= shieldUntil.current || shieldUntil.current === 0) {
      shieldUntil.current = 0;
      setShieldActive(false);
      setShieldTime(0);
      return false;
    }

    // Shield absorbs one collision and immediately disappears
    shieldUntil.current = 0;
    setShieldActive(false);
    setShieldTime(0);

    return true;
  }, []);

  // Automatically update the shield countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((shieldUntil.current - Date.now()) / 1000)
      );

      setShieldTime(remaining);

      if (remaining === 0) {
        setShieldActive(false);
        shieldUntil.current = 0;
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return {
    mangoProgress,
    shieldActive,
    shieldTime,
    collectMango,
    absorbHit
  };
}

