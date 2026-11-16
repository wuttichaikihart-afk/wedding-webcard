import React, { useRef, useEffect, useState, useCallback } from 'react';

const REVEAL_THRESHOLD_PERCENT = 50;

/**
 * Interactive Retina HTML5 scratch-off gold foil canvas with smooth stroke
 * interpolation and floating glitter stardust particles.
 */
const ScratchFoilCanvas = ({ isRevealed, onProgress, onReveal, onReady }) => {
  const containerRef = useRef(null);
  const foilCanvasRef = useRef(null);
  const sparkleCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const lastCheckTimeRef = useRef(0);
  const revealedTriggeredRef = useRef(false);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const onReadyRef = useRef(onReady);
  const [size, setSize] = useState({ width: 320, height: 340 });

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  // Measure container cleanly so the canvas matches any mobile or desktop screen width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Paint the luxury rose-gold / champagne metallic foil layer
  useEffect(() => {
    const canvas = foilCanvasRef.current;
    const sparkleCanvas = sparkleCanvasRef.current;
    if (!canvas || !sparkleCanvas || size.width <= 0 || size.height <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    sparkleCanvas.width = size.width * dpr;
    sparkleCanvas.height = size.height * dpr;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sCtx = sparkleCanvas.getContext('2d');
    sCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    revealedTriggeredRef.current = Boolean(isRevealed);
    if (isRevealed) {
      ctx.clearRect(0, 0, size.width, size.height);
      onReadyRef.current?.();
      return;
    }

    // Multi-stop champagne & rose-gold foil gradient
    const grad = ctx.createLinearGradient(0, 0, size.width, size.height);
    grad.addColorStop(0, '#f3dcb3');
    grad.addColorStop(0.28, '#dfc088');
    grad.addColorStop(0.52, '#f7e5c8');
    grad.addColorStop(0.75, '#d5a874');
    grad.addColorStop(1, '#e8c49b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size.width, size.height);

    // Subtle metallic diagonal sheen stripes
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 10;
    for (let x = -size.height; x < size.width + size.height; x += 34) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + size.height * 0.65, size.height);
      ctx.stroke();
    }
    ctx.restore();

    // Fine glitter speckle noise
    for (let i = 0; i < 160; i++) {
      const px = Math.random() * size.width;
      const py = Math.random() * size.height;
      const r = Math.random() * 1.6 + 0.4;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.45)' : 'rgba(196,109,130,0.16)';
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Inner dashed luxury border
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(14, 14, size.width - 28, size.height - 28);
    ctx.restore();

    // Faint crest watermark
    ctx.save();
    ctx.fillStyle = 'rgba(138, 92, 46, 0.12)';
    ctx.font = '600 56px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('T & T', size.width / 2, size.height / 2 - 42);
    ctx.restore();

    // Prompt badge on top of foil
    ctx.save();
    ctx.fillStyle = 'rgba(74, 48, 56, 0.85)';
    ctx.font = '600 20px "Prompt", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ ใช้นิ้วขูดตรงนี้ ✨', size.width / 2, size.height / 2 + 12);

    ctx.fillStyle = 'rgba(105, 65, 50, 0.9)';
    ctx.font = '400 14px "Prompt", sans-serif';
    ctx.fillText('ลุ้นเจอหน้าคู่ "เต้ย & ต่าย" เป็นผู้ชนะ!', size.width / 2, size.height / 2 + 44);
    ctx.restore();

    onReadyRef.current?.();
  }, [size.width, size.height, isRevealed]);

  // Clean up sparkle animation frame on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const spawnSparkles = useCallback((x, y) => {
    const colors = ['#fff5d6', '#ffd700', '#f4b6c2', '#ffffff'];
    for (let i = 0; i < 4; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 18,
        y: y + (Math.random() - 0.5) * 18,
        vx: (Math.random() - 0.5) * 3.2,
        vy: (Math.random() - 0.8) * 3.0,
        r: Math.random() * 2.5 + 1.2,
        alpha: 1,
        color: colors[i % colors.length]
      });
    }
    if (particlesRef.current.length > 80) {
      particlesRef.current = particlesRef.current.slice(-80);
    }

    if (!rafRef.current) {
      const step = () => {
        const sCanvas = sparkleCanvasRef.current;
        if (!sCanvas) {
          rafRef.current = null;
          return;
        }
        const sCtx = sCanvas.getContext('2d');
        sCtx.clearRect(0, 0, size.width, size.height);
        particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0.04);
        for (const p of particlesRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08;
          p.alpha *= 0.92;
          sCtx.save();
          sCtx.globalAlpha = p.alpha;
          sCtx.fillStyle = p.color;
          sCtx.beginPath();
          sCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          sCtx.fill();
          sCtx.restore();
        }
        if (particlesRef.current.length > 0) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(step);
    }
  }, [size.width, size.height]);

  const computeClearedPercent = useCallback(() => {
    const canvas = foilCanvasRef.current;
    if (!canvas || revealedTriggeredRef.current) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    // Sample every 16th pixel for fast calculation on mobile
    const step = 16;
    let totalSamples = 0;
    let clearedSamples = 0;
    for (let i = 3; i < imgData.length; i += 4 * step) {
      totalSamples += 1;
      if (imgData[i] < 128) clearedSamples += 1;
    }

    const pct = totalSamples > 0 ? Math.round((clearedSamples / totalSamples) * 100) : 0;
    onProgress?.(pct);

    if (pct >= REVEAL_THRESHOLD_PERCENT && !revealedTriggeredRef.current) {
      revealedTriggeredRef.current = true;
      onReveal?.();
    }
  }, [onProgress, onReveal]);

  const getLocalCoords = (e) => {
    const canvas = foilCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const eraseStroke = (from, to) => {
    const canvas = foilCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 46;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  };

  const handlePointerDown = (e) => {
    if (isRevealed || revealedTriggeredRef.current) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pt = getLocalCoords(e);
    lastPointRef.current = pt;
    eraseStroke(pt, { x: pt.x + 0.1, y: pt.y + 0.1 });
    spawnSparkles(pt.x, pt.y);
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current || isRevealed || revealedTriggeredRef.current) return;
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;

    const pt = getLocalCoords(e);
    const prev = lastPointRef.current || pt;
    eraseStroke(prev, pt);
    lastPointRef.current = pt;
    spawnSparkles(pt.x, pt.y);

    const now = performance.now();
    if (now - lastCheckTimeRef.current > 120) {
      lastCheckTimeRef.current = now;
      computeClearedPercent();
    }
  };

  const finishStroke = (e) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    try {
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore release errors
    }
    computeClearedPercent();
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        opacity: isRevealed ? 0 : 1,
        transition: 'opacity 0.55s ease-out',
        pointerEvents: isRevealed ? 'none' : 'auto'
      }}
    >
      <canvas
        ref={foilCanvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
        aria-label="พื้นที่แผ่นทองสำหรับขูดลุ้นรางวัล"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'crosshair',
          touchAction: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          borderRadius: '18px'
        }}
      />
      <canvas
        ref={sparkleCanvasRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 6,
          borderRadius: '18px'
        }}
      />
    </div>
  );
};

export default ScratchFoilCanvas;
