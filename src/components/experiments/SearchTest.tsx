"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import type { ChallengeSpec, Evaluation } from "@/experiments/types";
import { clock, ProgressDots, ReadyScreen } from "./shared";

type Spec = Extract<ChallengeSpec, { type: "search" }>;

export function SearchTest({ spec, onDone }: { spec: Spec; onDone: (e: Evaluation) => void }) {
  const [phase, setPhase] = useState<"ready" | "run">("ready");
  const [round, setRound] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [found, setFound] = useState(false);
  const start = useRef(0);
  const times = useRef<number[]>([]);
  const errors = useRef(0);

  const begin = (r: number) => {
    setRound(r);
    setFound(false);
    start.current = clock();
  };

  const tapCell = (idx: number) => {
    if (found) return;
    const r = spec.rounds[round];
    if (idx !== r.index) {
      errors.current++;
      setWrong(idx);
      window.setTimeout(() => setWrong(null), 300);
      return;
    }
    times.current.push(clock() - start.current);
    setFound(true);
    window.setTimeout(() => {
      if (round + 1 >= spec.rounds.length) onDone(spec.evaluate({ times: times.current, errors: errors.current }));
      else begin(round + 1);
    }, 550);
  };

  if (phase === "ready") {
    return (
      <ReadyScreen
        onStart={() => {
          setPhase("run");
          begin(0);
        }}
      >
        <p className="text-ink-soft">
          Each garden hides one impostor. Find it and tap it — {spec.rounds.length} gardens, timed.
        </p>
      </ReadyScreen>
    );
  }

  const r = spec.rounds[round];
  return (
    <div className="space-y-4">
      <ProgressDots total={spec.rounds.length} index={round} />
      <motion.div
        key={round}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto grid max-w-sm gap-1.5 rounded-3xl bg-white/80 p-3"
        style={{ gridTemplateColumns: `repeat(${r.cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: r.cells }, (_, idx) => (
          <motion.button
            key={idx}
            type="button"
            onPointerDown={() => tapCell(idx)}
            animate={wrong === idx ? { x: [0, -5, 5, -3, 0] } : found && idx === r.index ? { scale: [1, 1.4, 1.2] } : {}}
            className={`flex aspect-square min-h-[44px] items-center justify-center rounded-xl text-[clamp(1.4rem,6vw,1.9rem)] ${found && idx === r.index ? "bg-champagne" : ""}`}
          >
            {idx === r.index ? r.target : r.distractor}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
