"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import type { ChallengeSpec, Evaluation, SortCard } from "@/experiments/types";
import { Feedback, ProgressDots, ReadyScreen } from "./shared";

type Spec = Extract<ChallengeSpec, { type: "sorting" }>;

const FILL = { pink: "#ef6f9a", blue: "#4f8fcb" };

function Glyph({ card, size = 56 }: { card: SortCard; size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
      {card.shape === "circle" ? (
        <circle cx="20" cy="20" r="15" fill={FILL[card.color]} />
      ) : (
        <path d="M20 3 L24.9 14.2 L37 15.4 L27.9 23.5 L30.5 35.4 L20 29.2 L9.5 35.4 L12.1 23.5 L3 15.4 L15.1 14.2 Z" fill={FILL[card.color]} />
      )}
    </svg>
  );
}

// Left bin = pink circle, right bin = blue star.
const BINS: SortCard[] = [
  { shape: "circle", color: "pink" },
  { shape: "star", color: "blue" },
];

export function SortingTest({ spec, onDone }: { spec: Spec; onDone: (e: Evaluation) => void }) {
  const [phase, setPhase] = useState<"ready" | "run">("ready");
  const [i, setI] = useState(0);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const stats = useRef({ errorsBefore: 0, errorsAfter: 0, streakAfter: 0, adapted: false });
  const busy = useRef(false);
  const secondRule = spec.firstRule === "color" ? "shape" : "color";

  const choose = (bin: 0 | 1) => {
    if (busy.current) return;
    busy.current = true;
    const card = spec.cards[i];
    const rule = i < spec.switchAt ? spec.firstRule : secondRule;
    const correctBin = rule === "color" ? (card.color === "pink" ? 0 : 1) : card.shape === "circle" ? 0 : 1;
    const ok = bin === correctBin;
    const s = stats.current;
    if (i < spec.switchAt) {
      if (!ok) s.errorsBefore++;
    } else {
      if (ok) {
        s.streakAfter++;
        if (s.streakAfter >= 3) s.adapted = true;
      } else {
        s.streakAfter = 0;
        if (!s.adapted) s.errorsAfter++;
      }
    }
    setFeedback(ok);
    window.setTimeout(() => {
      setFeedback(null);
      busy.current = false;
      if (i + 1 >= spec.cards.length) {
        onDone(spec.evaluate({ errorsBefore: s.errorsBefore, errorsAfter: s.errorsAfter, adapted: s.adapted }));
      } else setI(i + 1);
    }, 520);
  };

  if (phase === "ready") {
    return (
      <ReadyScreen onStart={() => setPhase("run")}>
        <p className="text-ink-soft">
          Sort each card into a bin <strong className="text-ink">by {spec.firstRule === "color" ? "COLOUR" : "SHAPE"}</strong>. You&apos;ll get ✓ or ✕ after each card.
        </p>
        <p className="font-mono text-[11px] text-ink-faint">Laboratory rules are subject to change without notice.</p>
      </ReadyScreen>
    );
  }

  return (
    <div className="space-y-5">
      <ProgressDots total={spec.cards.length} index={i} />
      <div className="relative flex h-36 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ y: -20, opacity: 0, rotate: -6 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0 }}
            className="flex h-32 w-24 items-center justify-center rounded-2xl border border-ink/10 bg-white shadow-soft"
          >
            <Glyph card={spec.cards[i]} />
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>{feedback !== null && <Feedback ok={feedback} />}</AnimatePresence>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {BINS.map((b, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => choose(idx as 0 | 1)}
            className="flex min-h-[96px] flex-col items-center justify-center gap-1 rounded-3xl border-2 border-dashed border-ink/15 bg-white/70 active:scale-95"
          >
            <Glyph card={b} size={40} />
            <span className="font-mono text-[10px] tracking-widest text-ink-faint">BIN {idx ? "B" : "A"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
