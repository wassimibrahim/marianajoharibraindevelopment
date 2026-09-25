"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ChallengeSpec, Evaluation } from "@/experiments/types";
import { ReadyScreen } from "./shared";

type Spec = Extract<ChallengeSpec, { type: "marshmallow" }>;

export function MarshmallowTest({ spec, onDone }: { spec: Spec; onDone: (e: Evaluation) => void }) {
  const [phase, setPhase] = useState<"ready" | "run" | "won">("ready");
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(0);
  const done = useRef(false);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (phase !== "run") return;
    start.current = performance.now();
    const id = window.setInterval(() => {
      const t = performance.now() - start.current;
      setElapsed(t);
      if (t >= spec.waitSec * 1000 && !done.current) {
        done.current = true;
        window.clearInterval(id);
        setPhase("won");
        window.setTimeout(() => doneRef.current(spec.evaluate({ waited: true, tookAtMs: t })), 1600);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, spec]);

  const take = () => {
    if (done.current) return;
    done.current = true;
    onDone(spec.evaluate({ waited: false, tookAtMs: performance.now() - start.current }));
  };

  if (phase === "ready") {
    return (
      <ReadyScreen onStart={() => setPhase("run")} label="Begin">
        <p className="text-ink-soft">
          You may take <strong className="text-ink">1 flower now</strong>. Or, if you wait {spec.waitSec} seconds without touching anything, you get{" "}
          <strong className="text-ink">{spec.later} flowers</strong>.
        </p>
      </ReadyScreen>
    );
  }

  const frac = Math.min(1, elapsed / (spec.waitSec * 1000));
  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="flex h-24 items-end justify-center gap-1 text-5xl">
        {phase === "won"
          ? Array.from({ length: spec.later }, (_, i) => (
              <motion.span key={i} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.12, type: "spring" }}>
                🌸
              </motion.span>
            ))
          : Array.from({ length: spec.later }, (_, i) => (
              <span key={i} className="grayscale transition-all duration-500" style={{ opacity: 0.18 + frac * 0.5 }}>
                🌸
              </span>
            ))}
      </div>
      <div className="h-3 w-full max-w-xs overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-gradient-to-r from-blush via-lavender to-sky transition-[width] duration-100" style={{ width: `${frac * 100}%` }} />
      </div>
      <p className="font-mono text-sm text-ink-soft tabular-nums">
        {phase === "won" ? "Patience rewarded." : `${Math.max(0, spec.waitSec - elapsed / 1000).toFixed(1)}s remaining`}
      </p>
      {phase === "run" && (
        <button type="button" onClick={take} className="btn-soft">
          Just give me 1 🌸 now
        </button>
      )}
    </div>
  );
}
