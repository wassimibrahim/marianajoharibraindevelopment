"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { LAB_NOTES, WASSIM_HYPOTHESES } from "@/content/lab";
import { useLab } from "./LabProvider";

/** Laboratory notes with one redacted line. Tapping it three times declassifies a rotating hypothesis. */
export function SecretResearchNotes() {
  const { state, update } = useLab();
  const [taps, setTaps] = useState(0);
  const [revealed, setRevealed] = useState<string | null>(null);

  const tapRedacted = () => {
    if (revealed) {
      setRevealed(null);
      setTaps(0);
      return;
    }
    const n = taps + 1;
    setTaps(n);
    if (n >= 3) {
      setRevealed(WASSIM_HYPOTHESES[state.counters.declassified % WASSIM_HYPOTHESES.length]);
      update((s) => {
        s.counters.declassified += 1;
      });
    }
  };

  return (
    <div className="card-solid relative overflow-hidden p-6 sm:p-8" style={{ backgroundImage: "repeating-linear-gradient(transparent 0 31px, #eaf4fc 31px 32px)" }}>
      <div className="absolute top-0 bottom-0 left-10 w-px bg-rose/25 sm:left-14" aria-hidden />
      <div className="pl-8 sm:pl-10">
        <p className="eyebrow">Laboratory notebook · Vol. I</p>
        <ul className="mt-4 space-y-4">
          {LAB_NOTES.map((n) => (
            <li key={n.text} className="text-[15px] leading-[1.6] text-ink/85">
              <span className="mr-2 font-mono text-[10.5px] text-ink-faint">{n.date}</span>
              {n.text}
            </li>
          ))}
          <li className="text-[15px] leading-[1.6] text-ink/85">
            <span className="mr-2 font-mono text-[10.5px] text-ink-faint">Classified</span>
            <button type="button" onClick={tapRedacted} className="text-left" aria-label="Redacted note — tap to declassify">
              <AnimatePresence mode="wait">
                {revealed ? (
                  <motion.span key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded bg-petal px-1 text-rose">
                    {revealed}
                  </motion.span>
                ) : (
                  <motion.span key="h" animate={taps ? { x: [0, -3, 3, 0] } : {}} className="rounded bg-ink px-1 text-transparent select-none">
                    ████████ ██ █████ ████████ ███ ██████ ███
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            {!revealed && taps > 0 && <span className="ml-2 font-mono text-[10px] text-ink-faint">clearance {taps}/3</span>}
          </li>
        </ul>
      </div>
    </div>
  );
}
