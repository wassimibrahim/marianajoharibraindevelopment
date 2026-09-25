"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { confettiBurst } from "@/lib/celebrate";
import { useLab } from "./LabProvider";

const READINGS: [number, string][] = [
  [0, "Corporate Mariana. LinkedIn voice activated. Deeply unsettling."],
  [20, "Business casual. Still replies 'noted with thanks'."],
  [40, "Moderate basita. Emails signed with a single 🌸."],
  [60, "Healthy basita levels. Laughing at her own voice notes."],
  [80, "High basita. Researchers advise sunglasses."],
  [95, "Approaching critical basita."],
];

export function BasitaMeter() {
  const { state, ready, update } = useLab();
  const [value, setValue] = useState(88);
  const lastMax = useRef(false);

  useEffect(() => {
    // Adopt the saved reading once localStorage has loaded.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ready) setValue(state.basita);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const maxed = value >= 100;
  const reading = [...READINGS].reverse().find(([min]) => value >= min)?.[1] ?? READINGS[0][1];

  const onChange = (v: number) => {
    setValue(v);
    if (v >= 100 && !lastMax.current) {
      lastMax.current = true;
      confettiBurst("petals");
      if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    }
    if (v < 100) lastMax.current = false;
  };

  const commit = () =>
    update((s) => {
      s.basita = value;
      if (value >= 100) s.counters.basitaMaxed += 1;
    });

  return (
    <div className={`card flex h-full flex-col p-6 transition-colors duration-500 ${maxed ? "!bg-petal/90" : ""}`}>
      <p className="eyebrow">Widget · 03</p>
      <h3 className="display mt-2 text-2xl font-semibold text-ink">BASITA INDEX™</h3>
      <div className="mt-6 flex items-end justify-center gap-1">
        <motion.span key={value} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="display text-6xl font-semibold text-ink tabular-nums">
          {value}
        </motion.span>
        <span className="mb-2 font-mono text-sm text-ink-faint">/100</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={commit}
        onKeyUp={commit}
        onTouchEnd={commit}
        className="lab-range mt-4"
        aria-label="Basita level"
      />
      <div className="mt-1 flex justify-between font-mono text-[10px] tracking-wider text-ink-faint uppercase">
        <span>Corporate Mariana</span>
        <span>Maximum Basita</span>
      </div>
      <div className="mt-4 flex min-h-[64px] flex-1 items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {maxed ? (
            <motion.p
              key="max"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.04, 1], opacity: 1 }}
              transition={{ scale: { repeat: 3, duration: 0.9 } }}
              className="rounded-2xl bg-rose px-4 py-2.5 font-mono text-[12px] font-medium tracking-wide text-white"
            >
              ⚠️ WARNING: Critical levels of basita detected.
            </motion.p>
          ) : (
            <motion.p key={reading} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[14px] text-ink-soft italic">
              {reading}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
