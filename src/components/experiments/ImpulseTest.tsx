"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ChallengeSpec, Evaluation } from "@/experiments/types";
import { ReadyScreen } from "./shared";

type Spec = Extract<ChallengeSpec, { type: "impulse" }>;

export function ImpulseTest({ spec, onDone }: { spec: Spec; onDone: (e: Evaluation, raw?: unknown) => void }) {
  const [phase, setPhase] = useState<"ready" | "running" | "survived">("ready");
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    if (phase !== "running") return;
    start.current = performance.now();
    let raf = 0;
    const tick = () => {
      const t = performance.now() - start.current;
      setElapsed(t);
      if (t >= spec.seconds * 1000) {
        setPhase("survived");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, spec.seconds]);

  useEffect(() => {
    if (phase !== "survived" || done.current) return;
    done.current = true;
    const id = window.setTimeout(() => onDone(spec.evaluate({ pressedAtMs: null }), { survived: true }), 1400);
    return () => window.clearTimeout(id);
  }, [phase, spec, onDone]);

  const press = () => {
    if (phase !== "running" || done.current) return;
    done.current = true;
    const t = performance.now() - start.current;
    onDone(spec.evaluate({ pressedAtMs: t }), { survived: false });
  };

  if (phase === "ready") {
    return (
      <ReadyScreen onStart={() => setPhase("running")} label="Reveal the button">
        <p className="text-ink-soft">
          When you tap below, a button will appear. <strong className="text-ink">Do not press it</strong> for {spec.seconds} seconds.
        </p>
      </ReadyScreen>
    );
  }

  const frac = Math.min(1, elapsed / (spec.seconds * 1000));
  const R = 118;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="relative flex h-[260px] w-[260px] items-center justify-center">
        <svg viewBox="0 0 260 260" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="130" cy="130" r={R} fill="none" stroke="#2d223314" strokeWidth="6" />
          <circle cx="130" cy="130" r={R} fill="none" stroke="url(#impulseGrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} />
          <defs>
            <linearGradient id="impulseGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f7b3c8" />
              <stop offset="50%" stopColor="#b9a4ec" />
              <stop offset="100%" stopColor="#6aa6dc" />
            </linearGradient>
          </defs>
        </svg>
        <motion.button
          type="button"
          onPointerDown={press}
          disabled={phase === "survived"}
          className="relative h-[200px] w-[200px] rounded-full text-center text-[13px] font-semibold tracking-[0.12em] text-white shadow-lift"
          style={{
            background: "radial-gradient(circle at 35% 30%, #ffd6e2 0%, #ef6f9a 38%, #b8336a 75%, #7a1f4a 100%)",
            boxShadow: "0 20px 50px -10px rgba(217,70,122,0.6), inset 0 -8px 20px rgba(0,0,0,0.2), inset 0 8px 20px rgba(255,255,255,0.35)",
          }}
          animate={phase === "running" ? { scale: [1, 1.04, 1] } : { scale: 1 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          {phase === "survived" ? (
            <span className="text-2xl">🏆</span>
          ) : (
            <span className="px-6 leading-relaxed">
              DO NOT PRESS
              <br />
              FOR {spec.seconds} SECONDS
            </span>
          )}
        </motion.button>
      </div>
      <p className="font-mono text-2xl tabular-nums text-ink">{(elapsed / 1000).toFixed(2)}s</p>
      <p className="h-5 text-center text-sm text-ink-soft">
        {phase === "survived"
          ? "Disturbing levels of self-control detected."
          : frac < 0.3
            ? "It's so shiny though."
            : frac < 0.6
              ? "Imagine how satisfying the click would be…"
              : frac < 0.85
                ? "Nobody would know. (We would know.)"
                : "Almost there. Stay strong, Mari."}
      </p>
    </div>
  );
}
