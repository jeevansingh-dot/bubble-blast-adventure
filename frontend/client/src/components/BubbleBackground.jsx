import React, { useMemo } from 'react';

export default function BubbleBackground() {
  // Generate random bubble positions, sizes, and delays
  const bubbles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => {
      const size = Math.floor(Math.random() * 45) + 25; // 25px to 70px
      const left = Math.random() * 95; // 0% to 95% width
      const duration = Math.random() * 10 + 10; // 10s to 20s
      const delay = Math.random() * 8; // 0s to 8s delay
      const opacity = (Math.random() * 0.4 + 0.4).toFixed(2);

      return {
        id: i,
        size,
        left,
        duration,
        delay,
        opacity
      };
    });
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      zIndex: 0,
      pointerEvents: 'none'
    }}>
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="floating-bubble-3d"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: `${b.left}%`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            opacity: b.opacity
          }}
          onClick={(e) => {
            e.currentTarget.style.transform = 'scale(1.5)';
            e.currentTarget.style.opacity = '0';
          }}
        />
      ))}
    </div>
  );
}