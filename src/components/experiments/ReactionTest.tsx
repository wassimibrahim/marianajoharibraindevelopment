"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ChallengeSpec, Evaluation } from "@/experiments/types";
import { Flower } from "../Flower";
import { ProgressDots, ReadyScreen } from "./shared";

type Spec = Extract<ChallengeSpec, { type: "reaction" }>;

export function ReactionTest({ spec, onDone }: { spec: Spec; onDone: (e: Evaluation) => void }) {
  const [phase, setPhase] = useState<"ready" | "wait" | "bloom" | "result" | "early">("ready");
  const [round, setRound] = useState(0);
  const [last, setLast] = useState<number | null>(null);
  const times = useRef<number[]>([]);
  const falseStarts = useRef(0);
  const bloomAt = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const arm = (r: number) => {
    setPhase("wait");
    const delay = spec.delays[r % spec.delays.length] + (falseStarts.current ? 400 : 0);
    timer.current = window.setTimeout(() => {
      bloomAt.current = performance.now();
      setPhase("bloom");
    }, delay);
  };

  const tap = () => {
    if (phase === "wait") {
      window.clearTimeout(timer.current);
      falseStarts.current++;
      setPhase("early");
      return;
    }
    if (phase === "bloom") {
      const rt = performance.now() - bloomAt.current;
      times.current.push(rt);
      setLast(rt);
      setPhase("result");
      const next = round + 1;
      if (next >= spec.delays.length) {
        timer.current = window.setTimeout(() => onDone(spec.evaluate({ times: times.current, falseStarts: falseStarts.current })), 900);
      } else {
        timer.current = window.setTimeout(() => {
          setRound(next);
          arm(next);
        }, 1000);
      }
    }
  };

  if (phase === "ready") {
    return (
      <ReadyScreen
        onStart={() => {
          arm(0);
        }}
      >
        <p className="text-ink-soft">
          Tap the garden as soon as the bud <strong className="text-ink">blooms</strong>. {spec.delays.length} rounds. Tapping early is a false start.
        </p>
      </ReadyScreen>
    );
  }

  return (
    <div className="space-y-4">
      <ProgressDots total={spec.delays.length} index={round} />
      <button
        type="button"
        onPointerDown={() => tap()} onClick={(e) => { if (e.detail === 0) tap(); }}
        className={`relative flex h-64 w-full touch-manipulation items-center justify-center overflow-hidden rounded-3xl transition-colors duration-150 ${phase === "bloom" ? "bg-petal" : phase === "early" ? "bg-rose/10" : "bg-white/80"}`}
      >
        {phase === "wait" && (
          <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="flex flex-col items-center gap-3">
            <svg viewBox="0 0 60 90" width="60" height="90" aria-hidden>
              <path d="M30 88 C 30 70, 30 55, 30 42" stroke="#7fa77f" strokeWidth="3" fill="none" />
              <path d="M30 70 C 20 64, 16 56, 18 50 C 26 54, 29 60, 30 68 Z" fill="#93b596" />
              <ellipse cx="30" cy="30" rx="11" ry="16" fill="#f7c6d4" />
              <path d="M19 32 C 22 44, 38 44, 41 32 C 36 38, 24 38, 19 32 Z" fill="#93b596" />
            </svg>
            <span className="font-mono text-xs tracking-widest text-ink-faint">WAIT FOR IT…</span>
          </motion.div>
        )}
        {phase === "bloom" && (
          <motion.div initial={{ scale: 0.2, rotate: -60 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
            <Flower kind="blossom" size={150} />
          </motion.div>
        )}
        {phase === "result" && last !== null && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <p className="font-mono text-4xl text-ink tabular-nums">{Math.round(last)} ms</p>
            <p className="mt-1 text-sm text-ink-soft">{last < 300 ? "Lightning." : last < 450 ? "Crisp." : "Relaxed, yet present."}</p>
          </motion.div>
        )}
        {phase === "early" && (
          <div className="px-6 text-center">
            <p className="display text-2xl text-rose">Too early!</p>
            <p className="mt-1 text-sm text-ink-soft">The flower was not ready. Neither, apparently, was the frontal lobe.</p>
          </div>
        )}
      </button>
      {phase === "early" && (
        <button type="button" className="btn-soft w-full" onClick={() => arm(round)}>
          Try this round again
        </button>
      )}
    </div>
  );
}
