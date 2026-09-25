"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { ChallengeSpec, Evaluation } from "@/experiments/types";

type Spec = Extract<ChallengeSpec, { type: "estimate" }>;

export function EstimateTest({ spec, onDone }: { spec: Spec; onDone: (e: Evaluation) => void }) {
  const [anchor, setAnchor] = useState<"higher" | "lower">();
  const [value, setValue] = useState(Math.round((spec.min + spec.max) / 2 / spec.step) * spec.step);

  return (
    <div className="space-y-5">
      <p className="display text-[clamp(1.15rem,4.5vw,1.45rem)] leading-snug text-ink">{spec.anchorPrompt}</p>
      <div className="grid grid-cols-2 gap-3">
        {(["higher", "lower"] as const).map((a) => (
          <button key={a} type="button" disabled={!!anchor} onClick={() => setAnchor(a)} className={`option justify-center ${anchor === a ? "!border-rose !bg-petal" : ""}`}>
            {a === "higher" ? "More / higher" : "Fewer / lower"}
          </button>
        ))}
      </div>
      {anchor && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 border-t border-dashed border-ink/15 pt-4">
          <p className="text-ink">{spec.estimatePrompt}</p>
          <p className="text-center font-mono text-4xl text-iris tabular-nums">
            {value.toLocaleString("en-GB")} <span className="text-base text-ink-soft">{spec.unit}</span>
          </p>
          <input
            type="range"
            className="lab-range"
            min={spec.min}
            max={spec.max}
            step={spec.step}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            aria-label="Estimate"
          />
          <div className="flex items-center justify-center gap-3">
            <button type="button" className="btn-soft !min-h-[44px] w-14" onClick={() => setValue((v) => Math.max(spec.min, v - spec.step))} aria-label="Decrease">
              −
            </button>
            <button type="button" className="btn-soft !min-h-[44px] w-14" onClick={() => setValue((v) => Math.min(spec.max, v + spec.step))} aria-label="Increase">
              +
            </button>
          </div>
          <button type="button" className="btn-primary w-full" onClick={() => onDone(spec.evaluate({ anchorAnswer: anchor, estimate: value }))}>
            Lock in estimate
          </button>
        </motion.div>
      )}
    </div>
  );
}
