"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { deviceAllowanceMs, median } from "@/lib/scoring";
import type { ChallengeSpec, Evaluation } from "@/experiments/types";
import { ProgressDots, ReadyScreen } from "./shared";

type Spec = Extract<ChallengeSpec, { type: "gonogo" }>;

export function GoNoGoTest({ spec, onDone }: { spec: Spec; onDone: (e: Evaluation) => void }) {
  const [phase, setPhase] = useState<"ready" | "run">("ready");
  const [idx, setIdx] = useState(-1);
  const [showing, setShowing] = useState(false);
  const [flash, setFlash] = useState<"hit" | "bad" | null>(null);
  const tally = useRef({ hits: 0, misses: 0, falseAlarms: 0, correctRejections: 0 });
  const rts = useRef<number[]>([]);
  const tapped = useRef(false);
  const shownAt = useRef(0);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (phase !== "run") return;
    let cancelled = false;
    const window_ = spec.windowMs + deviceAllowanceMs();
    const run = async () => {
      for (let i = 0; i < spec.stimuli.length; i++) {
        await new Promise((r) => setTimeout(r, i === 0 ? 700 : 380 + Math.random() * 250));
        if (cancelled) return;
        tapped.current = false;
        setIdx(i);
        setShowing(true);
        shownAt.current = performance.now();
        await new Promise((r) => setTimeout(r, window_));
        if (cancelled) return;
        setShowing(false);
        const go = spec.stimuli[i] === "go";
        if (!tapped.current) {
          if (go) tally.current.misses++;
          else tally.current.correctRejections++;
        }
      }
      await new Promise((r) => setTimeout(r, 300));
      if (!cancelled) doneRef.current(spec.evaluate({ ...tally.current, medianRt: median(rts.current) || 900 }));
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [phase, spec]);

  const tap = () => {
    if (!showing || tapped.current) return;
    tapped.current = true;
    if (spec.stimuli[idx] === "go") {
      tally.current.hits++;
      rts.current.push(performance.now() - shownAt.current);
      setFlash("hit");
    } else {
      tally.current.falseAlarms++;
      setFlash("bad");
    }
    window.setTimeout(() => setFlash(null), 220);
  };

  if (phase === "ready") {
    return (
      <ReadyScreen onStart={() => setPhase("run")}>
        <div className="flex items-center gap-6 text-4xl">
          <span className="flex flex-col items-center gap-1">
            🌸<span className="font-mono text-[11px] tracking-widest text-sage">TAP</span>
          </span>
          <span className="flex flex-col items-center gap-1">
            🌵<span className="font-mono text-[11px] tracking-widest text-rose">DON&apos;T</span>
          </span>
        </div>
        <p className="text-ink-soft">Tap the garden for every blossom. Resist every cactus. Be quick.</p>
      </ReadyScreen>
    );
  }

  const stim = idx >= 0 ? spec.stimuli[idx] : null;
  return (
    <div className="space-y-4">
      <ProgressDots total={spec.stimuli.length} index={Math.max(0, idx)} />
      <button
        type="button"
        onPointerDown={() => tap()} onClick={(e) => { if (e.detail === 0) tap(); }}
        className={`relative flex h-64 w-full touch-manipulation items-center justify-center rounded-3xl transition-colors duration-150 ${flash === "hit" ? "bg-sage/20" : flash === "bad" ? "bg-rose/15" : "bg-white/80"}`}
        aria-label="Tap area"
      >
        <AnimatePresence>
          {showing && stim && (
            <motion.span
              key={idx}
              className="text-[88px] select-none"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              {stim === "go" ? "🌸" : "🌵"}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
