"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function ReadyScreen({ children, onStart, label = "Start" }: { children?: ReactNode; onStart: () => void; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      {children}
      <button type="button" className="btn-primary w-full max-w-xs" onClick={onStart}>
        {label}
      </button>
    </div>
  );
}

export function Feedback({ ok }: { ok: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`pointer-events-none absolute inset-0 flex items-center justify-center text-5xl ${ok ? "text-sage" : "text-rose"}`}
    >
      {ok ? "✓" : "✕"}
    </motion.div>
  );
}

export function ProgressDots({ total, index }: { total: number; index: number }) {
  return (
    <div className="flex justify-center gap-1.5" aria-label={`${index} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${i < index ? "w-4 bg-ink/70" : i === index ? "w-6 bg-rose" : "w-1.5 bg-ink/15"}`}
        />
      ))}
    </div>
  );
}

export const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

/** Timestamp for reaction-time measurement (only ever called from event handlers). */
export const clock = () => performance.now();
