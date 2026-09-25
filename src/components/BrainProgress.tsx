"use client";

import { motion } from "framer-motion";

/** The terminal-style progress bar, with a smooth bar underneath for the non-monospace among us. */
export function BrainProgress({ percent, arrived }: { percent: number; arrived: boolean }) {
  const blocks = 20;
  const filled = Math.floor((percent / 100) * blocks);
  return (
    <div className="rounded-3xl bg-ink px-5 py-5 text-white sm:px-7">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10.5px] tracking-[0.2em] text-white/60">PREFRONTAL CORTEX DEVELOPMENT</p>
        <p className="font-mono text-sm text-white tabular-nums">{percent.toFixed(4)}%</p>
      </div>
      <p className="mt-3 font-mono text-[clamp(0.9rem,4.6vw,1.35rem)] tracking-tight whitespace-nowrap" aria-hidden>
        <span className="text-[#f7b3c8]">{"█".repeat(filled)}</span>
        <span className="text-white/20">{"░".repeat(blocks - filled)}</span>{" "}
        <span className="text-white/80">{Math.floor(percent)}%</span>
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sky via-lavender to-blush"
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.2, 0.7, 0.2, 1] }}
        />
      </div>
      {arrived ? (
        <p className="mt-4 font-mono text-[11px] leading-relaxed tracking-wider text-[#f0d58c]">
          CERTIFICATION PENDING — BEHAVIOURAL EVIDENCE STILL REQUIRED
        </p>
      ) : (
        <p className="mt-4 text-[11px] leading-relaxed text-white/50">
          Calculated live. Asymptotically approaches 100%. Never reaches it without behavioural evidence.
        </p>
      )}
    </div>
  );
}
