"use client";

import { useEffect, useRef } from "react";

/**
 * A single full-screen canvas that renders firework bursts on demand.
 * Trigger with `launchFireworks()` from `@/lib/celebrate`. The animation loop
 * only runs while particles are alive, so it costs nothing when idle.
 */

const COLORS = ["#f7b3c8", "#ef6f9a", "#c9b8f0", "#9b7fe0", "#bfddf5", "#6aa6dc", "#f0d58c", "#ffffff", "#ffb38a"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  trail: boolean;
}

interface Rocket {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
}

export function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];
    const rockets: Rocket[] = [];
    let raf = 0;
    let running = false;
    let w = 0;
    let h = 0;
    const mobile = window.matchMedia("(max-width: 640px)").matches;
    const budget = mobile ? 55 : 90;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const burst = (x: number, y: number, color: string) => {
      const n = budget + Math.floor(Math.random() * 20);
      const secondary = COLORS[Math.floor(Math.random() * COLORS.length)];
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2 + Math.random() * 0.2;
        const speed = 1.6 + Math.random() * 3.6;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          max: 55 + Math.random() * 40,
          color: Math.random() < 0.7 ? color : secondary,
          size: 1.2 + Math.random() * 1.8,
          trail: Math.random() < 0.35,
        });
      }
    };

    const loop = () => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        r.vy *= 0.985;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.targetY || r.vy > -1.5) {
          burst(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.vx *= 0.975;
        p.vy = p.vy * 0.975 + 0.045;
        p.x += p.vx;
        p.y += p.vy;
        const t = 1 - p.life / p.max;
        if (t <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.min(1, t * 1.4);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.5 + t * 0.5), 0, Math.PI * 2);
        ctx.fill();
        if (p.trail && Math.random() < 0.3) {
          ctx.globalAlpha = t * 0.5;
          ctx.fillRect(p.x - p.vx * 2, p.y - p.vy * 2, 1, 1);
        }
      }
      ctx.globalAlpha = 1;

      if (particles.length || rockets.length) {
        raf = requestAnimationFrame(loop);
      } else {
        running = false;
        ctx.clearRect(0, 0, w, h);
      }
    };

    const onLaunch = (e: Event) => {
      const intensity = (e as CustomEvent<{ intensity?: number }>).detail?.intensity ?? 1;
      const count = Math.round((mobile ? 4 : 6) * intensity);
      for (let i = 0; i < count; i++) {
        window.setTimeout(() => {
          rockets.push({
            x: w * (0.15 + Math.random() * 0.7),
            y: h + 10,
            vy: -(h / 55) - Math.random() * 4,
            targetY: h * (0.12 + Math.random() * 0.3),
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          });
          if (!running) {
            running = true;
            raf = requestAnimationFrame(loop);
          }
        }, i * 280 + Math.random() * 200);
      }
    };

    window.addEventListener("lab:fireworks", onLaunch);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("lab:fireworks", onLaunch);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[70]" aria-hidden="true" />;
}
