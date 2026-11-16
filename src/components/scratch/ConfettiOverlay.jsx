import React, { useEffect, useRef } from 'react';

const CONFETTI_COLORS = ['#e8a8b8', '#c46d82', '#d4af37', '#f7e5c8', '#ffffff', '#ff8fab'];

/** Full-screen celebratory confetti shower when a guest reveals a winning card. */
const ConfettiOverlay = ({ active }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);

    const pieces = Array.from({ length: 110 }, () => ({
      x: Math.random() * w,
      y: Math.random() * -h * 0.6 - 20,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2.5,
      size: Math.random() * 7 + 5,
      rot: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
    }));

    let rafId;
    const render = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;

      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vRot;
        p.vy += 0.04;

        if (p.y < h + 30) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.55);
          ctx.restore();
        }
      }

      if (alive) rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
};

export default ConfettiOverlay;
