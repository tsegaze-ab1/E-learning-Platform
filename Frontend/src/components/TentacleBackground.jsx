import { useEffect, useRef } from 'react';

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export default function TentacleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let raf = 0;

    const center = [0, 0];
    const pointer = { x: 0, y: 0, active: false };
    const leader = { x: 0, y: 0, vx: 0, vy: 0 };

    const tentacleCount = 34;
    const segmentCount = 18;
    const colonyRadius = 62;

    const tentacles = Array.from({ length: tentacleCount }).map((_, index) => {
      const angle = (Math.PI * 2 * index) / tentacleCount;
      const base = [
        center[0] + colonyRadius * Math.cos(angle),
        center[1] + colonyRadius * Math.sin(angle),
      ];

      const points = Array.from({ length: segmentCount }).map(() => ({
        x: base[0],
        y: base[1],
      }));

      return {
        angle,
        base,
        points,
        spacing: rand(7, 11),
        spring: rand(0.13, 0.2),
        drag: rand(0.84, 0.9),
        wave: rand(1.3, 2.4),
        hueShift: rand(-18, 20),
      };
    });

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      center[0] = width * 0.5;
      center[1] = height * 0.5;
      leader.x = center[0];
      leader.y = center[1];

      tentacles.forEach((tentacle) => {
        tentacle.base = [
          center[0] + colonyRadius * Math.cos(tentacle.angle),
          center[1] + colonyRadius * Math.sin(tentacle.angle),
        ];

        tentacle.points.forEach((point) => {
          point.x = tentacle.base[0];
          point.y = tentacle.base[1];
        });
      });
    }

    function onPointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    }

    function onPointerLeave() {
      pointer.active = false;
    }

    function draw(time) {
      const t = time * 0.001;
      const flow = reducedMotion ? 0.14 : 1;
      const orbitX = center[0] + Math.cos(t * 1.25) * (width * 0.11);
      const orbitY = center[1] + Math.sin(t * 1.7) * (height * 0.09);
      const targetX = pointer.active ? pointer.x : orbitX;
      const targetY = pointer.active ? pointer.y : orbitY;

      leader.vx += (targetX - leader.x) * 0.07 * flow;
      leader.vy += (targetY - leader.y) * 0.07 * flow;
      leader.vx *= 0.82;
      leader.vy *= 0.82;
      leader.x += leader.vx;
      leader.y += leader.vy;

      ctx.fillStyle = 'rgba(2, 6, 23, 0.22)';
      ctx.fillRect(0, 0, width, height);

      tentacles.forEach((tentacle, index) => {
        const wavePhase = t * tentacle.wave + index * 0.08;

        tentacle.base = [
          center[0] + colonyRadius * Math.cos(tentacle.angle + Math.sin(wavePhase) * 0.1),
          center[1] + colonyRadius * Math.sin(tentacle.angle + Math.cos(wavePhase) * 0.1),
        ];

        const head = tentacle.points[0];
        const bendX = Math.cos(wavePhase * 1.4) * 20;
        const bendY = Math.sin(wavePhase * 1.3) * 20;

        head.x += (leader.x + bendX - head.x) * tentacle.spring * flow;
        head.y += (leader.y + bendY - head.y) * tentacle.spring * flow;

        for (let i = 1; i < tentacle.points.length; i += 1) {
          const prev = tentacle.points[i - 1];
          const point = tentacle.points[i];
          point.x += (prev.x - point.x) * tentacle.drag;
          point.y += (prev.y - point.y) * tentacle.drag;

          const dx = point.x - prev.x;
          const dy = point.y - prev.y;
          const dist = Math.hypot(dx, dy) || 1;
          const pull = (dist - tentacle.spacing) / dist;

          point.x -= dx * pull;
          point.y -= dy * pull;
        }

        tentacle.points[tentacle.points.length - 1].x =
          tentacle.points[tentacle.points.length - 1].x * 0.8 + tentacle.base[0] * 0.2;
        tentacle.points[tentacle.points.length - 1].y =
          tentacle.points[tentacle.points.length - 1].y * 0.8 + tentacle.base[1] * 0.2;

        for (let i = 0; i < tentacle.points.length - 1; i += 1) {
          const p1 = tentacle.points[i];
          const p2 = tentacle.points[i + 1];
          const mix = i / (tentacle.points.length - 1);

          const hue = 290 - mix * 230 + tentacle.hueShift + Math.sin(t * 1.8 + index * 0.3) * 20;
          const saturation = 100;
          const lightness = 66 - mix * 8;
          const alpha = 0.88 - mix * 0.55;

          ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
          ctx.lineWidth = 1.5 - mix * 0.8;
          ctx.lineCap = 'round';
          ctx.shadowBlur = 12;
          ctx.shadowColor = `hsla(${hue}, ${saturation}%, 55%, 0.75)`;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${Math.min(75, lightness + 7)}%, ${Math.max(0.2, alpha)})`;
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, 1.1 + (1 - mix) * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.shadowBlur = 22;
      ctx.shadowColor = 'rgba(255, 255, 150, 0.55)';
      ctx.fillStyle = 'rgba(255, 255, 215, 0.95)';
      ctx.beginPath();
      ctx.arc(leader.x, leader.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (!reducedMotion) {
        raf = window.requestAnimationFrame(draw);
      }
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);

    if (reducedMotion) {
      draw(performance.now());
    } else {
      raf = window.requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}
