"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Radar } from "lucide-react";
import { useState } from "react";
import { PASSPORT_ANSWERS } from "@/content/lab";
import { useLab } from "./LabProvider";

export function PassportMissionControl() {
  const { state, update } = useLab();
  const [answer, setAnswer] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [n, setN] = useState(0);

  const check = () => {
    if (scanning) return;
    setScanning(true);
    setAnswer(null);
    update((s) => {
      s.counters.passportChecks += 1;
    });
    window.setTimeout(() => {
      let next = answer;
      while (next === answer) next = PASSPORT_ANSWERS[Math.floor(Math.random() * PASSPORT_ANSWERS.length)];
      setAnswer(next);
      setN((x) => x + 1);
      setScanning(false);
    }, 1100);
  };

  const steps = ["Enter Venezuela", "Fix passport", "Successfully escape Venezuela"];

  return (
    <div className="card flex h-full flex-col overflow-hidden p-6">
      <div className="pointer-events-none absolute -top-10 -right-10 -z-10 h-40 w-40 rounded-full bg-[conic-gradient(from_90deg,#f8d56b,#4f8fcb,#e0364f,#f8d56b)] opacity-20 blur-2xl" aria-hidden />
      <p className="eyebrow">Widget · 02</p>
      <h3 className="display mt-2 text-2xl font-semibold text-ink">
        VENEZUELA MISSION CONTROL <span aria-hidden>🇻🇪</span>
      </h3>

      <dl className="mt-5 space-y-3 text-[14px]">
        <div className="flex items-center justify-between gap-3">
          <dt className="font-mono text-[11px] tracking-wider text-ink-faint uppercase">Passport status</dt>
          <dd className="rounded-full bg-champagne px-3 py-1 text-ink">🙏 Inshallah</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] tracking-wider text-ink-faint uppercase">Mission objective</dt>
          <dd className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] text-ink">
            {steps.map((s, i) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="rounded-lg bg-white/80 px-2 py-1">{s}</span>
                {i < steps.length - 1 && <span className="text-ink-faint">→</span>}
              </span>
            ))}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="font-mono text-[11px] tracking-wider text-ink-faint uppercase">Probability (calculated)</dt>
          <dd className="display text-ink italic">God knows.</dd>
        </div>
      </dl>

      <div className="mt-5 flex min-h-[92px] flex-1 items-center justify-center rounded-2xl bg-ink px-4 py-4 text-center">
        <AnimatePresence mode="wait">
          {scanning ? (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 font-mono text-[12px] text-[#f0d58c]">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Radar size={16} />
              </motion.span>
              Consulting bureaucratic oracle…
            </motion.div>
          ) : answer ? (
            <motion.p key={n} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="display text-[17px] leading-snug text-white">
              {answer}
            </motion.p>
          ) : (
            <motion.p key="idle" className="font-mono text-[11px] text-white/50">
              Awaiting query. Outcomes not legally binding.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <button type="button" className="btn-primary mt-4 w-full" onClick={check} disabled={scanning}>
        Check passport confidence
      </button>
      <p className="mt-2 text-center font-mono text-[10px] text-ink-faint">
        Checks performed: {state.counters.passportChecks} · Not immigration advice. Obviously.
      </p>
    </div>
  );
}
