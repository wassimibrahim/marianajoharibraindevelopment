"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { hashString } from "@/lib/rng";
import { formatLongDate } from "@/lib/dates";
import type { SessionRecord } from "@/lib/storage";
import { Flower, PALETTES, type FlowerKind } from "./Flower";
import { useLab } from "./LabProvider";

const KINDS: FlowerKind[] = ["rose", "tulip", "daisy", "blossom"];

interface Plant {
  key: string;
  kind: FlowerKind;
  palette: number;
  height: number;
  title: string;
  lines: string[];
}

function plantFor(s: SessionRecord, i: number): Plant {
  const h = hashString(s.id);
  const kind = KINDS[h % KINDS.length];
  const lines: string[] = [];
  if (typeof s.core === "number") lines.push(`Core task: ${s.core}/100`);
  lines.push(`Game score: ${s.overall}/100`);
  return {
    key: s.id,
    kind,
    palette: (h >> 3) % PALETTES[kind].length,
    height: 46 + ((h >> 5) % 30),
    title: `${s.final ? "Final examination" : `Experiment ${i + 1}`} · ${formatLongDate(new Date(s.date))}`,
    lines,
  };
}

const BIRTHDAY_PLANT: Plant = {
  key: "birthday",
  kind: "rose",
  palette: 0,
  height: 84,
  title: "The birthday flower · 25 September 2026",
  lines: ["Planted for your 24th birthday. Needs nothing from you."],
};

export function YearInBloom() {
  const { state, ready } = useLab();
  const [selected, setSelected] = useState<string>("birthday");
  const plants = [BIRTHDAY_PLANT, ...state.sessions.map(plantFor)];
  const current = plants.find((p) => p.key === selected) ?? BIRTHDAY_PLANT;

  return (
    <div>
      <div className="relative mx-auto max-w-xl overflow-hidden rounded-t-[120px] rounded-b-[28px] bg-gradient-to-b from-[#fdf6ea] to-[#f3e6d2] px-4 pt-10 pb-0 sm:px-8">
        <div className="flex min-h-[120px] flex-wrap items-end justify-center gap-x-1 gap-y-4">
          {ready &&
            plants.map((p, i) => (
              <motion.button
                key={p.key}
                type="button"
                onClick={() => setSelected(p.key)}
                aria-pressed={selected === p.key}
                aria-label={p.title}
                className={`relative flex min-w-[48px] flex-col items-center rounded-2xl px-1 pt-1 ${selected === p.key ? "bg-white/60" : ""}`}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: Math.min(i, 12) * 0.05, type: "spring", stiffness: 140, damping: 14 }}
              >
                <Flower kind={p.kind} size={p.key === "birthday" ? 58 : 42} palette={PALETTES[p.kind][p.palette]} />
                <span className="block w-[2px] rounded-full bg-[#7fa77f]" style={{ height: p.height - 30 }} />
              </motion.button>
            ))}
        </div>
        <div className="-mx-8 mt-0 h-5 bg-[#d9c3a3]" aria-hidden />
      </div>

      <div className="mt-4 min-h-[76px] text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div key={current.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="font-mono text-[11px] tracking-wider text-ink-soft">{current.title}</p>
            {current.lines.map((l) => (
              <p key={l} className="mt-1 text-[15px] text-ink">
                {l}
              </p>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="mx-auto mt-2 max-w-md text-center text-[13px] leading-relaxed text-ink-soft">
        {state.sessions.length === 0
          ? "Every completed experiment plants a flower here. No streaks, no pressure — the garden waits patiently."
          : `${state.sessions.length} flower${state.sessions.length === 1 ? "" : "s"} planted since your birthday. No streaks, no pressure.`}
      </p>
    </div>
  );
}
