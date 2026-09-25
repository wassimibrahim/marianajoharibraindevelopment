"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { BOUQUET_WISHES } from "@/content/lab";
import { Flower, PALETTES, type FlowerKind } from "./Flower";
import { useLab } from "./LabProvider";

const STEMS: { kind: FlowerKind; p: number; x: number; y: number; size: number }[] = [
  { kind: "tulip", p: 3, x: 16, y: 30, size: 25 },
  { kind: "rose", p: 0, x: 37, y: 9, size: 28 },
  { kind: "daisy", p: 2, x: 64, y: 9, size: 27 },
  { kind: "blossom", p: 2, x: 85, y: 30, size: 25 },
  { kind: "rose", p: 3, x: 50, y: 36, size: 26 },
];

/** Five tappable flowers, each holding one wish. */
export function WishBouquet() {
  const { update } = useLab();
  const [opened, setOpened] = useState<number[]>([]);
  const [current, setCurrent] = useState<number | null>(null);

  const tap = (i: number) => {
    setCurrent(i);
    if (!opened.includes(i)) {
      const next = [...opened, i];
      setOpened(next);
      update((s) => {
        s.counters.bouquet = Math.max(s.counters.bouquet, next.length);
      });
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center">
      <div className="relative aspect-[1/1.05] w-[min(84vw,340px)]">
        <svg viewBox="0 0 100 105" className="absolute inset-0 h-full w-full" aria-hidden>
          {STEMS.map((s, i) => (
            <path key={i} d={`M${s.x} ${s.y + 12} Q ${(s.x + 50) / 2} 66 50 88`} stroke="#7fa77f" strokeWidth="1.3" fill="none" />
          ))}
          <path d="M28 62 Q22 52 30 50 L42 62 Z" fill="#93b596" />
          <path d="M72 60 Q80 50 72 48 L60 62 Z" fill="#93b596" />
          {/* Paper wrap */}
          <path d="M30 66 L50 102 L70 66 Q50 74 30 66 Z" fill="#fdebf1" stroke="#f3c1cf" strokeWidth="0.6" />
          <path d="M36 70 L50 98 M64 70 L50 98" stroke="#f3c1cf" strokeWidth="0.4" />
          {/* Ribbon */}
          <path d="M42 78 Q50 74 58 78 L57 82 Q50 79 43 82 Z" fill="#d9467a" />
          <path d="M50 80 Q42 88 40 96 M50 80 Q58 88 60 96" stroke="#d9467a" strokeWidth="1" fill="none" />
        </svg>

        {STEMS.map((s, i) => {
          const isOpen = opened.includes(i);
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => tap(i)}
              aria-label={`Flower ${i + 1} of 5${isOpen ? `: ${BOUQUET_WISHES[i]}` : ": tap to reveal a wish"}`}
              aria-pressed={current === i}
              className="absolute flex items-center justify-center rounded-full"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}%`, aspectRatio: "1", x: "-50%", y: "-30%" }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              whileTap={{ scale: 0.9 }}
              animate={current === i ? { rotate: [0, -8, 6, 0] } : {}}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 160, damping: 12 }}
            >
              <Flower kind={s.kind} size="100%" palette={PALETTES[s.kind][s.p % PALETTES[s.kind].length]} className={isOpen ? "" : "drop-shadow-sm"} />
              {!isOpen && (
                <span className="pointer-events-none absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] shadow-sm" aria-hidden>
                  ✨
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-4 flex min-h-[96px] w-full items-center justify-center px-2 text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {current === null ? (
            <motion.p key="hint" className="text-[15px] text-ink-soft" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Five flowers, five wishes. Tap each one.
            </motion.p>
          ) : (
            <motion.div key={current} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <p className="font-mono text-[10.5px] tracking-[0.2em] text-rose">WISH {current + 1} OF 5</p>
              <p className="display mt-2 text-[clamp(1.2rem,5vw,1.5rem)] leading-snug text-ink">{BOUQUET_WISHES[current]}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-1 font-mono text-[11px] text-ink-faint">
        {opened.length === 5 ? "Full bouquet delivered 💐" : `${opened.length} of 5 opened`}
      </p>
    </div>
  );
}
