"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { ChallengeSpec, Evaluation } from "@/experiments/types";
import { ReadyScreen } from "./shared";

type Spec = Extract<ChallengeSpec, { type: "digits" }>;

export function DigitSpanTest({ spec, onDone }: { spec: Spec; onDone: (e: Evaluation) => void }) {
  const [phase, setPhase] = useState<"ready" | "show" | "recall">("ready");
  const [step, setStep] = useState(-1);
  const [answer, setAnswer] = useState<number[]>([]);

  useEffect(() => {
    if (phase !== "show") return;
    let i = 0;
    const id = window.setInterval(() => {
      setStep(i);
      i++;
      if (i > spec.digits.length) {
        window.clearInterval(id);
        setPhase("recall");
      }
    }, spec.stepMs);
    return () => window.clearInterval(id);
  }, [phase, spec]);

  if (phase === "ready") {
    return (
      <ReadyScreen onStart={() => setPhase("show")} label="Flash the digits">
        <p className="text-ink-soft">
          {spec.digits.length} digits will flash one by one. Then enter them <strong className="text-ink">backwards</strong>.
        </p>
        <p className="font-mono text-sm text-ink-faint">e.g. 3 · 8 · 1 → 1 8 3</p>
      </ReadyScreen>
    );
  }

  if (phase === "show") {
    const d = step >= 0 && step < spec.digits.length ? spec.digits[step] : null;
    return (
      <div className="flex h-44 items-center justify-center rounded-3xl bg-white/80">
        <AnimatePresence mode="wait">
          {d !== null && (
            <motion.span
              key={step}
              className="display text-7xl font-semibold text-iris"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.18 }}
            >
              {d}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const full = answer.length === spec.digits.length;
  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        {spec.digits.map((_, i) => (
          <span key={i} className={`flex h-12 w-10 items-center justify-center rounded-xl font-mono text-2xl ${answer[i] !== undefined ? "bg-lilac text-iris" : "border-2 border-dashed border-ink/15"}`}>
            {answer[i] ?? ""}
          </span>
        ))}
      </div>
      <p className="text-center text-sm text-ink-soft">Enter them in reverse order.</p>
      <div className="grid grid-cols-3 gap-2.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <Key key={n} label={String(n)} disabled={full} onPress={() => setAnswer((a) => [...a, n])} />
        ))}
        <Key label="⌫" onPress={() => setAnswer((a) => a.slice(0, -1))} disabled={!answer.length} />
        <Key label="0" disabled={full} onPress={() => setAnswer((a) => [...a, 0])} />
        <button type="button" disabled={!full} onClick={() => onDone(spec.evaluate({ answer }))} className="min-h-[56px] rounded-2xl bg-ink font-medium text-white disabled:opacity-30">
          Submit
        </button>
      </div>
    </div>
  );
}

function Key({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={onPress} className="min-h-[56px] rounded-2xl border border-ink/10 bg-white font-mono text-xl shadow-sm active:scale-95 disabled:opacity-40">
      {label}
    </button>
  );
}
