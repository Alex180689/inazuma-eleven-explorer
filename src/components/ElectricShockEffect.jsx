import React, { useEffect, useRef } from 'react';

/**
 * High-voltage Inazuma Electric Lightning Shock effect on canvas
 * Fires crackling lightning bolts, branching plasma arcs, and glowing spark particles
 */
export default function ElectricShockEffect({ trigger = 0 }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to viewport
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Center origin of the shock (around upper middle of screen / match area)
    const originX = width / 2;
    const originY = Math.min(height * 0.32, 280);

    // Color palette: Inazuma electric cyan, blazing gold, intense white
    const colors = [
      { core: '#ffffff', glow: '#38bdf8', outer: 'rgba(56, 189, 248, 0.4)' },
      { core: '#ffffff', glow: '#facc15', outer: 'rgba(250, 204, 21, 0.4)' },
      { core: '#e0f2fe', glow: '#06b6d4', outer: 'rgba(6, 182, 212, 0.3)' },
      { core: '#fef08a', glow: '#f59e0b', outer: 'rgba(245, 158, 11, 0.3)' },
    ];

    // Helper to generate a jagged fractal lightning path
    function createBolt(x1, y1, x2, y2, displace, iterations = 5) {
      let points = [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
      ];

      for (let i = 0; i < iterations; i++) {
        const newPoints = [];
        for (let j = 0; j < points.length - 1; j++) {
          const p1 = points[j];
          const p2 = points[j + 1];
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;

          // Perpendicular displacement
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.hypot(dx, dy);
          const nx = -dy / (len || 1);
          const ny = dx / (len || 1);
          const offset = (Math.random() - 0.5) * displace;

          newPoints.push(p1);
          newPoints.push({ x: midX + nx * offset, y: midY + ny * offset });
        }
        newPoints.push(points[points.length - 1]);
        points = newPoints;
        displace *= 0.55;
      }
      return points;
    }

    // Generate lightning bursts
    const numBolts = 14;
    const bolts = [];
    for (let b = 0; b < numBolts; b++) {
      const angle = (Math.PI * 2 * b) / numBolts + (Math.random() - 0.5) * 0.6;
      const distance = 160 + Math.random() * 320;
      const targetX = originX + Math.cos(angle) * distance;
      const targetY = originY + Math.sin(angle) * (distance * 0.75);

      const mainBolt = {
        points: createBolt(originX, originY, targetX, targetY, 65, 5),
        color: colors[b % colors.length],
        life: 1.0,
        decay: 0.035 + Math.random() * 0.03,
        branches: [],
      };

      // Branching lightning off the main bolt
      if (Math.random() > 0.3) {
        const branchIndex = Math.floor(mainBolt.points.length * (0.3 + Math.random() * 0.4));
        const startP = mainBolt.points[branchIndex];
        const branchAngle = angle + (Math.random() > 0.5 ? 0.6 : -0.6);
        const branchDist = 70 + Math.random() * 120;
        const bTargetX = startP.x + Math.cos(branchAngle) * branchDist;
        const bTargetY = startP.y + Math.sin(branchAngle) * branchDist;
        mainBolt.branches.push({
          points: createBolt(startP.x, startP.y, bTargetX, bTargetY, 35, 4),
          color: mainBolt.color,
        });
      }

      bolts.push(mainBolt);
    }

    // High energy electric sparks
    const numSparks = 60;
    const sparks = [];
    for (let s = 0; s < numSparks; s++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 14;
      sparks.push({
        x: originX + (Math.random() - 0.5) * 20,
        y: originY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2.5,
        color: colors[s % colors.length].glow,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.035,
      });
    }

    let frame = 0;
    const startTime = performance.now();
    const duration = 650; // ms

    const render = (now) => {
      const elapsed = now - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, width, height);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      frame++;

      // Subtle initial electric flash (first 80ms)
      if (elapsed < 80) {
        const flashAlpha = (1 - elapsed / 80) * 0.22;
        ctx.fillStyle = `rgba(56, 189, 248, ${flashAlpha})`;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw lightning bolts with high-voltage glow
      bolts.forEach((bolt) => {
        if (bolt.life <= 0) return;
        // Jitter lightning slightly on each frame for crackle effect
        const alpha = Math.max(0, bolt.life);

        const drawPath = (pts, strokeWidth, color) => {
          if (pts.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            const jitterX = (Math.random() - 0.5) * 2;
            const jitterY = (Math.random() - 0.5) * 2;
            ctx.lineTo(pts[i].x + jitterX, pts[i].y + jitterY);
          }
          ctx.strokeStyle = color;
          ctx.lineWidth = strokeWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        };

        // 1. Outer Glow
        drawPath(bolt.points, 8, bolt.color.outer.replace(/[\d.]+\)$/, `${alpha * 0.4})`));
        // 2. Primary Arc
        drawPath(bolt.points, 3.5, bolt.color.glow);
        // 3. Hot White Core
        drawPath(bolt.points, 1.5, `rgba(255, 255, 255, ${alpha})`);

        // Draw branches
        bolt.branches.forEach((br) => {
          drawPath(br.points, 2.5, br.color.glow);
          drawPath(br.points, 1, `rgba(255, 255, 255, ${alpha * 0.8})`);
        });

        bolt.life -= bolt.decay;
      });

      // Draw electric sparks
      sparks.forEach((sp) => {
        if (sp.life <= 0) return;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.94;
        sp.vy *= 0.94;
        sp.life -= sp.decay;
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (ctx) ctx.clearRect(0, 0, width, height);
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
