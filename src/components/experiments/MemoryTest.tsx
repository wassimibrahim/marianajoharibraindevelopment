"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { ChallengeSpec, Evaluation } from "@/experiments/types";
import { ReadyScreen } from "./shared";

type Spec = Extract<ChallengeSpec, { type: "memory" }>;

export function MemoryTest({ spec, onDone }: { spec: Spec; onDone: (e: Evaluation) => void }) {
  const [phase, setPhase] = useState<"ready" | "show" | "recall">("ready");
  const [answer, setAnswer] = useState<string[]>([]);

  useEffect(() => {
    if (phase !== "show") return;
    const id = window.setTimeout(() => setPhase("recall"), spec.showMs);
    return () => window.clearTimeout(id);
  }, [phase, spec.showMs]);

  useEffect(() => {
    if (phase === "recall" && answer.length === spec.sequence.length) {
      const id = window.setTimeout(() => onDone(spec.evaluate({ answer })), 450);
      return () => window.clearTimeout(id);
    }
  }, [answer, phase, spec, onDone]);

  if (phase === "ready") {
    return (
      <ReadyScreen onStart={() => setPhase("show")} label="Show me the sequence">
        <p className="text-ink-soft">
          A sequence of {spec.sequence.length} emojis will appear for {Math.round(spec.showMs / 1000)} seconds. Memorise the order.
        </p>
      </ReadyScreen>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex min-h-[84px] flex-wrap items-center justify-center gap-2 rounded-3xl bg-white/80 p-4">
        {phase === "show"
          ? spec.sequence.map((e, i) => (
              <motion.span
                key={i}
                className="text-[clamp(1.9rem,9vw,2.6rem)]"
                initial={{ opacity: 0, y: 10, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.12, type: "spring", stiffness: 300 }}
              >
                {e}
              </motion.span>
            ))
          : spec.sequence.map((_, i) => (
              <span
                key={i}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed text-2xl ${answer[i] ? "border-transparent bg-petal" : "border-ink/15"}`}
              >
                {answer[i] ?? ""}
              </span>
            ))}
      </div>
      {phase === "show" ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
          <motion.div className="h-full bg-gradient-to-r from-blush via-lavender to-sky" initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: spec.showMs / 1000, ease: "linear" }} />
        </div>
      ) : (
        <>
          <p className="text-center text-sm text-ink-soft">Rebuild the sequence in order.</p>
          <div className="grid grid-cols-4 gap-2.5">
            {spec.pool.map((e) => (
              <button
                key={e}
                type="button"
                disabled={answer.length >= spec.sequence.length}
                onClick={() => setAnswer((a) => [...a, e])}
                className="flex aspect-square min-h-[56px] items-center justify-center rounded-2xl border border-ink/10 bg-white text-3xl shadow-sm transition active:scale-90"
              >
                {e}
              </button>
            ))}
          </div>
          <button type="button" className="btn-soft w-full" onClick={() => setAnswer((a) => a.slice(0, -1))} disabled={!answer.length}>
            ⌫ Undo last
          </button>
        </>
      )}
    </div>
  );
}
