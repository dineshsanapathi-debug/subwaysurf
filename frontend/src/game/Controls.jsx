import React, { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Shield, Pause } from 'lucide-react';

export default function Controls({
  onMoveLeft,
  onMoveRight,
  onJump,
  onSlide,
  onHoverboard,
  onTogglePause,
  isMobileOnly = false,
  isPlaying = true
}) {
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const lastTapRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          onMoveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          onMoveRight();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          onJump();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          onSlide();
          break;
        case ' ':
          e.preventDefault();
          if (window.isIntroRunning && window.gameActions?.skipIntro) {
            window.gameActions.skipIntro();
          } else if (onTogglePause) {
            onTogglePause();
          }
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          if (onHoverboard) onHoverboard();
          break;
        case 'j':
        case 'J':
          e.preventDefault();
          if (window.gameActions?.jetpack) window.gameActions.jetpack();
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          if (window.gameActions?.elevatedRoute) window.gameActions.elevatedRoute();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, onMoveLeft, onMoveRight, onJump, onSlide, onTogglePause, onHoverboard]);

  // Touch Swipe Handlers on window / document
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (!isPlaying) return;
      const touch = e.touches[0];
      const now = Date.now();

      // Double-tap to activate hoverboard
      if (now - lastTapRef.current < 300) {
        if (onHoverboard) onHoverboard();
      }
      lastTapRef.current = now;

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: now
      };
    };

    const handleTouchEnd = (e) => {
      if (!isPlaying) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const dt = Date.now() - touchStartRef.current.time;

      const minSwipeDistance = 25;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (dt < 400 && (absDx > minSwipeDistance || absDy > minSwipeDistance)) {
        if (absDx > absDy) {
          // Horizontal swipe
          if (dx > 0) onMoveRight();
          else onMoveLeft();
        } else {
          // Vertical swipe
          if (dy < 0) onJump();
          else onSlide();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPlaying, onMoveLeft, onMoveRight, onJump, onSlide, onHoverboard]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-4">
      {/* On-screen control buttons for touch devices */}
      <div className="mt-auto flex items-end justify-between w-full pointer-events-auto opacity-75 hover:opacity-100 transition-opacity md:hidden">
        {/* Left & Right D-pad */}
        <div className="flex gap-2">
          <button
            onClick={onMoveLeft}
            className="w-14 h-14 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 text-cyan-400 flex items-center justify-center active:scale-95 shadow-lg active:bg-cyan-500/20"
            aria-label="Move Left"
          >
            <ArrowLeft size={28} />
          </button>
          <button
            onClick={onMoveRight}
            className="w-14 h-14 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 text-cyan-400 flex items-center justify-center active:scale-95 shadow-lg active:bg-cyan-500/20"
            aria-label="Move Right"
          >
            <ArrowRight size={28} />
          </button>
        </div>

        {/* Action Buttons: Slide, Hoverboard, Jump */}
        <div className="flex gap-2 items-center">
          <button
            onClick={onHoverboard}
            className="w-12 h-12 rounded-xl bg-cyan-600/80 text-white flex items-center justify-center active:scale-95 shadow-lg"
            aria-label="Hoverboard"
          >
            <Shield size={22} />
          </button>
          <button
            onClick={onSlide}
            className="w-14 h-14 rounded-2xl bg-amber-500/80 text-white flex items-center justify-center active:scale-95 shadow-lg"
            aria-label="Slide"
          >
            <ArrowDown size={28} />
          </button>
          <button
            onClick={onJump}
            className="w-14 h-14 rounded-2xl bg-pink-500/80 text-white flex items-center justify-center active:scale-95 shadow-lg"
            aria-label="Jump"
          >
            <ArrowUp size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}

