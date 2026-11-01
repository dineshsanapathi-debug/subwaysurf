import React from 'react';

export default function MangoShieldBar({
  mangoProgress = 0,
  shieldActive = false,
  shieldTime = 0
}) {
  const percentage = Math.min(100, Math.max(0, (mangoProgress / 200) * 100));

  return (
    <div style={styles.container}>
      <div style={styles.heading}>
        <span style={styles.title}>🥭 Mango Challenge</span>
        <strong style={styles.counter}>{mangoProgress}/200</strong>
      </div>

      <div style={styles.track}>
        <div
          style={{
            ...styles.fill,
            width: `${percentage}%`
          }}
        />
      </div>

      {shieldActive && (
        <div style={styles.shield}>
          🛡️ SHIELD ACTIVE — {shieldTime}s
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: '76px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(320px, 82vw)',
    padding: '10px 14px',
    borderRadius: '16px',
    background: 'rgba(10, 20, 40, 0.92)',
    border: '1.5px solid rgba(251, 191, 36, 0.45)',
    color: 'white',
    zIndex: 40,
    fontFamily: '"Fredoka", "Arial Black", Arial, sans-serif',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(245, 158, 11, 0.2)',
    backdropFilter: 'blur(8px)',
    pointerEvents: 'none',
    transition: 'all 0.3s ease'
  },
  heading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
    fontWeight: '800',
    fontSize: '13px',
    letterSpacing: '0.02em'
  },
  title: {
    color: '#fef08a',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  counter: {
    color: '#fbbf24',
    fontSize: '13px'
  },
  track: {
    height: '14px',
    background: '#1e293b',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '2px solid rgba(255, 255, 255, 0.85)',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.4)'
  },
  fill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ff9f00, #ffe600)',
    borderRadius: '20px',
    transition: 'width 0.25s ease-out',
    boxShadow: '0 0 10px rgba(251, 191, 36, 0.7)'
  },
  shield: {
    marginTop: '8px',
    textAlign: 'center',
    color: '#48eaff',
    fontWeight: '900',
    fontSize: '12px',
    letterSpacing: '0.05em',
    textShadow: '0 0 10px #00cfff, 0 0 20px rgba(0, 207, 255, 0.6)',
    animation: 'pulse 1.2s ease-in-out infinite'
  }
};
