"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { median } from "@/lib/scoring";
import type { ChallengeSpec, Evaluation } from "@/experiments/types";
import { clock, Feedback, ProgressDots, ReadyScreen, sleep } from "./shared";

type Spec = Extract<ChallengeSpec, { type: "taskswitch" }>;

export function TaskSwitchTest({ spec, onDone }: { spec: Spec; onDone: (e: Evaluation) => void }) {
  const [phase, setPhase] = useState<"ready" | "run">("ready");
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(false);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const shownAt = useRef(0);
  const busy = useRef(true);
  const log = useRef<{ ok: boolean; rt: number; switched: boolean }[]>([]);

  const show = async (idx: number) => {
    setVisible(false);
    await sleep(idx === 0 ? 400 : 250);
    setI(idx);
    setVisible(true);
    shownAt.current = clock();
    busy.current = false;
  };

  const answer = async (side: 0 | 1) => {
    if (busy.current) return;
    busy.current = true;
    const t = spec.trials[i];
    const rt = clock() - shownAt.current;
    const correctSide = t.rule === "parity" ? (t.n % 2 ? 0 : 1) : t.n < 5 ? 0 : 1;
    const ok = side === correctSide;
    log.current.push({ ok, rt, switched: i > 0 && spec.trials[i - 1].rule !== t.rule });
    setFeedback(ok);
    await sleep(240);
    setFeedback(null);
    if (i + 1 >= spec.trials.length) {
      const L = log.current;
      const okRts = L.filter((x) => x.ok).map((x) => x.rt);
      const sw = median(L.filter((x) => x.ok && x.switched).map((x) => x.rt));
      const rep = median(L.filter((x) => x.ok && !x.switched).map((x) => x.rt));
      onDone(
        spec.evaluate({
          correct: L.filter((x) => x.ok).length,
          total: L.length,
          medianRt: median(okRts) || 2500,
          switchCost: sw && rep ? sw - rep : 0,
        }),
      );
    } else show(i + 1);
  };

  const legend = (
    <div className="grid grid-cols-2 gap-2 text-left text-[13px]">
      <div className="rounded-2xl bg-[#fde0ea] p-3">
        <p className="font-mono text-[10px] tracking-widest text-rose">PINK CARD</p>
        <p className="text-ink">Odd or even?</p>
      </div>
      <div className="rounded-2xl bg-[#dcebf9] p-3">
        <p className="font-mono text-[10px] tracking-widest text-cobalt">BLUE CARD</p>
        <p className="text-ink">Lower or higher than 5?</p>
      </div>
    </div>
  );

  if (phase === "ready") {
    return (
      <ReadyScreen
        onStart={() => {
          setPhase("run");
          show(0);
        }}
      >
        {legend}
        <p className="text-sm text-ink-soft">The rule depends on the card colour, and the colour changes without warning.</p>
      </ReadyScreen>
    );
  }

  const t = spec.trials[i];
  return (
    <div className="space-y-4">
      <ProgressDots total={spec.trials.length} index={i} />
      {legend}
      <div className="relative flex h-40 items-center justify-center">
        <AnimatePresence mode="wait">
          {visible && (
            <motion.div
              key={i}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className={`flex h-36 w-28 items-center justify-center rounded-3xl shadow-soft ${t.rule === "parity" ? "bg-gradient-to-br from-[#fde0ea] to-[#f7b3c8]" : "bg-gradient-to-br from-[#e5f1fc] to-[#a9cdf0]"}`}
            >
              <span className="display text-6xl font-semibold text-ink">{t.n}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>{feedback !== null && <Feedback ok={feedback} />}</AnimatePresence>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {["ODD · LOWER", "EVEN · HIGHER"].map((label, idx) => (
          <button
            key={label}
            type="button"
            onPointerDown={() => answer(idx as 0 | 1)} onClick={(e) => { if (e.detail === 0) answer(idx as 0 | 1); }}
            className="min-h-[64px] rounded-2xl border border-ink/10 bg-white font-mono text-[13px] tracking-wider text-ink shadow-sm active:scale-95"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
