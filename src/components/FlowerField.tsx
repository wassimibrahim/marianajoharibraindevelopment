"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { FLOWER_KINDS, Flower, PALETTES, type FlowerKind } from "./Flower";

/**
 * Ambient background: petals drifting down and, every few seconds, a flower
 * quietly growing in from a screen edge before fading away again.
 */

interface EdgeBloom {
  id: number;
  kind: FlowerKind;
  paletteIdx: number;
  edge: "left" | "right" | "bottom";
  pos: number;
  size: number;
  tilt: number;
}

const DRIFTERS = Array.from({ length: 9 }, (_, i) => ({
  left: (i * 11.3 + 4) % 100,
  delay: i * 2.1,
  duration: 16 + ((i * 7) % 9),
  kind: FLOWER_KINDS[i % 4 === 3 ? 0 : i % 3 === 0 ? 1 : 0],
  size: 14 + ((i * 5) % 12),
  dx: ((i % 2 ? 1 : -1) * (30 + i * 6)).toFixed(0),
}));

export function FlowerField() {
  const reduce = useReducedMotion();
  const [blooms, setBlooms] = useState<EdgeBloom[]>([]);

  useEffect(() => {
    if (reduce) return;
    let id = 0;
    const mobile = window.matchMedia("(max-width: 640px)").matches;
    const max = mobile ? 3 : 5;
    let spawned = 0;
    // A gentle welcome, not a screensaver: a handful of blooms, then stillness.
    const spawn = () => {
      if (document.hidden) return;
      if (++spawned > (mobile ? 8 : 12)) {
        window.clearInterval(interval);
        return;
      }
      const kind = FLOWER_KINDS[Math.floor(Math.random() * FLOWER_KINDS.length)];
      const edges = ["left", "right", "bottom"] as const;
      const bloom: EdgeBloom = {
        id: ++id,
        kind,
        paletteIdx: Math.floor(Math.random() * PALETTES[kind].length),
        edge: edges[Math.floor(Math.random() * 3)],
        pos: 10 + Math.random() * 80,
        size: (mobile ? 54 : 76) + Math.random() * 40,
        tilt: (Math.random() - 0.5) * 30,
      };
      setBlooms((b) => [...b.slice(-(max - 1)), bloom]);
      window.setTimeout(() => setBlooms((b) => b.filter((x) => x.id !== bloom.id)), 9000);
    };
    const first = window.setTimeout(spawn, 1500);
    const interval = window.setInterval(spawn, mobile ? 5200 : 3800);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [reduce]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {!reduce &&
        DRIFTERS.map((d, i) => (
          <div
            key={i}
            className="absolute top-0 animate-drift opacity-0"
            style={
              {
                left: `${d.left}%`,
                animationDelay: `${d.delay}s`,
                "--drift-duration": `${d.duration}s`,
                "--drift-x": `${d.dx}px`,
                animationIterationCount: 2,
              } as React.CSSProperties
            }
          >
            <Flower kind={d.kind} size={d.size} palette={PALETTES[d.kind][i % PALETTES[d.kind].length]} className="opacity-70" />
          </div>
        ))}

      <AnimatePresence>
        {blooms.map((b) => {
          const pos: React.CSSProperties =
            b.edge === "bottom"
              ? { bottom: -b.size * 0.35, left: `${b.pos}%` }
              : b.edge === "left"
                ? { left: -b.size * 0.35, top: `${b.pos}%` }
                : { right: -b.size * 0.35, top: `${b.pos}%` };
          const baseRot = b.edge === "left" ? 90 : b.edge === "right" ? -90 : 0;
          return (
            <motion.div
              key={b.id}
              className="absolute"
              style={pos}
              initial={{ scale: 0, rotate: baseRot + b.tilt - 40, opacity: 0 }}
              animate={{ scale: 1, rotate: baseRot + b.tilt, opacity: 0.85 }}
              exit={{ scale: 0.6, opacity: 0, transition: { duration: 1.4 } }}
              transition={{ type: "spring", stiffness: 60, damping: 14 }}
            >
              <Flower kind={b.kind} size={b.size} palette={PALETTES[b.kind][b.paletteIdx]} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
