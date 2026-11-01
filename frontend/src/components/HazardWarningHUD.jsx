import React, { useEffect, useRef } from 'react';
import { soundEffects } from '../audio/SoundEffects';

export default function HazardWarningHUD({ warning = null }) {
  const lastSoundTime = useRef(0);

  useEffect(() => {
    if (warning?.active) {
      const now = performance.now();
      // Throttle warning sound to every 700ms so it doesn't spam every frame
      if (now - lastSoundTime.current > 700) {
        soundEffects.playWarning();
        lastSoundTime.current = now;
      }
    }
  }, [warning]);

  if (!warning?.active) return null;

  const isSlide = warning.action === 'SLIDE';

  return (
    <>
      {/* Screen Edge Danger Pulse Vignette */}
      <div className="fixed inset-0 pointer-events-none z-30 animate-pulse border-4 sm:border-8 border-rose-500/50 shadow-[inset_0_0_50px_rgba(244,63,94,0.35)]" />

      {/* Floating Warning Pill Banner */}
      <div className="fixed top-36 sm:top-32 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-300 animate-bounce">
        <div className="flex items-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-slate-950/95 border-2 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.8)] backdrop-blur-md text-white font-black text-xs sm:text-sm">
          {/* Warning Icon Badge */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center text-sm sm:text-base animate-pulse shadow-md">
            ⚠️
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[10px] sm:text-xs text-rose-400 font-extrabold uppercase tracking-widest leading-none">
              {warning.message || 'DANGER AHEAD'}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase text-slate-950 ${isSlide ? 'bg-amber-400' : 'bg-cyan-400'}`}>
                {isSlide ? '⬇️ DUCK / SLIDE' : '↔️ SWITCH LANE'}
              </span>
              <span className="text-[10px] text-slate-300 font-bold">
                {warning.distance}m ahead
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
