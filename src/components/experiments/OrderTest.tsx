"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { ChallengeSpec, Evaluation } from "@/experiments/types";

type Spec = Extract<ChallengeSpec, { type: "order" }>;

export function OrderTest({ spec, onDone }: { spec: Spec; onDone: (e: Evaluation) => void }) {
  const [order, setOrder] = useState<string[]>([]);
  const toggle = (id: string) => setOrder((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  const complete = order.length === spec.items.length;

  return (
    <div className="space-y-4">
      <p className="display text-[clamp(1.15rem,4.5vw,1.45rem)] leading-snug text-ink">{spec.prompt}</p>
      {spec.context && (
        <ul className="space-y-1 rounded-2xl bg-cream/70 px-4 py-3 text-[13px] leading-relaxed text-ink/80">
          {spec.context.split(" · ").map((c) => (
            <li key={c} className="flex gap-2">
              <span className="text-gold">◆</span>
              {c}
            </li>
          ))}
        </ul>
      )}
      <p className="text-sm text-ink-soft">Tap in order. Tap again to remove.</p>
      <div className="flex flex-col gap-2.5">
        {spec.items.map((it) => {
          const pos = order.indexOf(it.id);
          return (
            <motion.button key={it.id} layout type="button" onClick={() => toggle(it.id)} className={`option ${pos >= 0 ? "!border-iris/40 !bg-lilac" : ""}`}>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-sm ${pos >= 0 ? "bg-iris text-white" : "border border-dashed border-ink/20 text-ink-faint"}`}>
                {pos >= 0 ? pos + 1 : ""}
              </span>
              <span className="text-xl" aria-hidden>{it.emoji}</span>
              <span className="flex-1">{it.label}</span>
            </motion.button>
          );
        })}
      </div>
      <button type="button" disabled={!complete} onClick={() => onDone(spec.evaluate(order))} className="btn-primary w-full disabled:opacity-40">
        Submit itinerary
      </button>
    </div>
  );
}
