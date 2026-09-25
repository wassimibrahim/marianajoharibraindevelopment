"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { ChallengeSpec, Evaluation, Opt } from "@/experiments/types";

type Spec = Extract<ChallengeSpec, { type: "choice" }>;

function OptionList({ options, selected, onPick }: { options: Opt[]; selected?: string; onPick: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((o, i) => (
        <motion.button
          key={o.id}
          type="button"
          className={`option ${selected === o.id ? "!border-rose !bg-petal" : ""}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onPick(o.id)}
          disabled={!!selected}
        >
          {o.emoji && <span className="text-xl" aria-hidden>{o.emoji}</span>}
          <span className="flex-1">{o.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

export function ChoiceTest({ spec, onDone }: { spec: Spec; onDone: (e: Evaluation) => void }) {
  const [choice, setChoice] = useState<string>();
  const [why, setWhy] = useState<string>();

  const pick = (id: string) => {
    setChoice(id);
    if (!spec.followUp) window.setTimeout(() => onDone(spec.evaluate(id)), 350);
  };

  return (
    <div className="space-y-4">
      {spec.context && (
        <div className="rounded-2xl bg-cream/70 px-4 py-3 font-mono text-[13px] leading-relaxed whitespace-pre-line text-ink/80">{spec.context}</div>
      )}
      <p className="display text-[clamp(1.15rem,4.5vw,1.45rem)] leading-snug text-ink">{spec.prompt}</p>
      {spec.visual && (
        <p className="rounded-2xl bg-lilac/70 px-4 py-5 text-center font-mono text-[clamp(1.05rem,5vw,1.5rem)] tracking-wide text-iris">{spec.visual}</p>
      )}
      <OptionList options={spec.options} selected={choice} onPick={pick} />
      <AnimatePresence>
        {choice && spec.followUp && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 border-t border-dashed border-ink/15 pt-4">
            <p className="eyebrow !text-rose">{spec.followUp.prompt}</p>
            <OptionList
              options={spec.followUp.options}
              selected={why}
              onPick={(w) => {
                setWhy(w);
                window.setTimeout(() => onDone(spec.evaluate(choice, w)), 300);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
