"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { median } from "@/lib/scoring";
import type { ChallengeSpec, Evaluation, StroopColor } from "@/experiments/types";
import { clock, Feedback, ProgressDots, ReadyScreen, sleep } from "./shared";

type Spec = Extract<ChallengeSpec, { type: "stroop" }>;

const INK: Record<StroopColor, string> = {
  red: "#e0364f",
  blue: "#2f6fd0",
  green: "#2f9e5b",
  purple: "#8a4fd8",
  orange: "#f08a1c",
};
const ORDER: StroopColor[] = ["red", "blue", "green", "purple", "orange"];

export function StroopTest({ spec, onDone }: { spec: Spec; onDone: (e: Evaluation) => void }) {
  const [phase, setPhase] = useState<"ready" | "run">("ready");
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(false);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const shownAt = useRef(0);
  const rts = useRef<number[]>([]);
  const correct = useRef(0);
  const busy = useRef(false);

  const show = async (idx: number) => {
    setVisible(false);
    await sleep(idx === 0 ? 500 : 280);
    setI(idx);
    setVisible(true);
    shownAt.current = clock();
    busy.current = false;
  };

  const answer = async (c: StroopColor) => {
    if (!visible || busy.current) return;
    busy.current = true;
    const rt = clock() - shownAt.current;
    const ok = spec.trials[i].ink === c;
    if (ok) {
      correct.current++;
      rts.current.push(rt);
    }
    setFeedback(ok);
    await sleep(260);
    setFeedback(null);
    if (i + 1 >= spec.trials.length) {
      onDone(spec.evaluate({ correct: correct.current, total: spec.trials.length, medianRt: median(rts.current) || 2500 }));
    } else {
      show(i + 1);
    }
  };

  if (phase === "ready") {
    return (
      <ReadyScreen
        onStart={() => {
          setPhase("run");
          show(0);
        }}
      >
        <p className="text-ink-soft">
          Words will appear in coloured ink. Tap the <strong className="text-ink">ink colour</strong>, not what the word says.
        </p>
        <p className="display text-4xl font-semibold" style={{ color: INK.blue }}>
          RED
        </p>
        <p className="text-sm text-ink-soft">
          ↑ Correct answer: <strong style={{ color: INK.blue }}>blue</strong>
        </p>
      </ReadyScreen>
    );
  }

  const t = spec.trials[i];
  return (
    <div className="space-y-5">
      <ProgressDots total={spec.trials.length} index={i} />
      <div className="relative flex h-36 items-center justify-center rounded-3xl bg-white/80">
        <AnimatePresence mode="wait">
          {visible && (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="display text-[clamp(2.6rem,12vw,3.6rem)] font-semibold tracking-wide select-none"
              style={{ color: INK[t.ink] }}
            >
              {t.word.toUpperCase()}
            </motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence>{feedback !== null && <Feedback ok={feedback} />}</AnimatePresence>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {ORDER.map((c, idx) => (
          <button
            key={c}
            type="button"
            onPointerDown={() => answer(c)}
            className={`flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-white text-[15px] font-medium text-ink shadow-sm active:scale-95 ${idx === 4 ? "col-span-2 sm:col-span-1" : ""}`}
          >
            <span className="h-4 w-4 rounded-full" style={{ background: INK[c] }} />
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
