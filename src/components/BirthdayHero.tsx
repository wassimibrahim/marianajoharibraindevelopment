"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { confettiBurst, launchFireworks } from "@/lib/celebrate";
import { Flower, PALETTES, type FlowerKind } from "./Flower";
import { useLab } from "./LabProvider";

/** The full-screen opening: flowers bloom, fireworks, confetti, then the invitation. */

const RING: { kind: FlowerKind; x: number; y: number; s: number; p: number; r: number }[] = [
  { kind: "rose", x: 4, y: 6, s: 1.2, p: 0, r: -12 },
  { kind: "blossom", x: 22, y: -2, s: 0.8, p: 0, r: 20 },
  { kind: "daisy", x: 42, y: 2, s: 0.7, p: 0, r: 0 },
  { kind: "hibiscus", x: 66, y: -3, s: 1, p: 0, r: 15 },
  { kind: "blossom", x: 88, y: 5, s: 1.1, p: 1, r: -25 },
  { kind: "tulip", x: 98, y: 26, s: 0.9, p: 2, r: -20 },
  { kind: "rose", x: 96, y: 50, s: 0.85, p: 1, r: 30 },
  { kind: "lavender", x: 99, y: 72, s: 1.1, p: 0, r: -10 },
  { kind: "daisy", x: 90, y: 94, s: 1.05, p: 1, r: 10 },
  { kind: "hibiscus", x: 68, y: 101, s: 0.9, p: 1, r: -18 },
  { kind: "rose", x: 45, y: 99, s: 0.75, p: 2, r: 8 },
  { kind: "tulip", x: 24, y: 98, s: 1, p: 0, r: 12 },
  { kind: "blossom", x: 4, y: 92, s: 1.15, p: 0, r: 30 },
  { kind: "lavender", x: -2, y: 68, s: 1.05, p: 1, r: 12 },
  { kind: "daisy", x: 1, y: 46, s: 0.8, p: 0, r: -5 },
  { kind: "tulip", x: 2, y: 25, s: 0.85, p: 1, r: 18 },
];

const LINES = [
  "24 years alive.",
  "Still no employment contract.",
  "Still waiting for Venezuelan bureaucracy.",
  "Still claiming the frontal lobe is operational.",
];

const ESCAPE_QUIPS = [
  "Specimen appears to be fleeing.",
  "Please remain still for the examination.",
  "The button is also mature and would prefer not to be pressed.",
  "Evasive manoeuvres noted in the lab book.",
  "One more try. For science.",
];

export function BirthdayHero({ onEnter }: { onEnter: () => void }) {
  const reduce = useReducedMotion();
  const { update } = useLab();
  const [escapes, setEscapes] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [caught, setCaught] = useState(false);
  const fired = useRef(false);
  const MAX_ESCAPES = 5;

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const t1 = window.setTimeout(() => launchFireworks(1.3), 900);
    const t2 = window.setTimeout(() => confettiBurst("petals"), 1500);
    const t3 = window.setTimeout(() => confettiBurst("hearts"), 2600);
    return () => [t1, t2, t3].forEach(window.clearTimeout);
  }, []);

  const flee = () => {
    if (caught) return;
    if (escapes >= MAX_ESCAPES) {
      setCaught(true);
      update((s) => {
        s.counters.evasions += 1;
      });
      return;
    }
    const maxX = Math.max(60, window.innerWidth / 2 - 140);
    const maxY = Math.max(60, window.innerHeight * 0.28);
    let x = 0;
    let y = 0;
    // Always jump a meaningful distance away from where it was.
    do {
      x = (Math.random() * 2 - 1) * maxX;
      y = (Math.random() * 2 - 1) * maxY;
    } while (Math.hypot(x - offset.x, y - offset.y) < 90);
    setOffset({ x, y });
    setEscapes((n) => n + 1);
  };

  const base = reduce ? 0 : 1;

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto overscroll-contain bg-ivory"
      style={{
        backgroundImage:
          "radial-gradient(40rem 30rem at 50% 40%, rgba(255,255,255,0.95), transparent 70%), radial-gradient(50rem 40rem at 100% 0%, #efe9fc, transparent 60%), radial-gradient(50rem 40rem at 0% 100%, #fdebf1, transparent 60%), radial-gradient(40rem 30rem at 100% 100%, #eaf4fc, transparent 60%)",
      }}
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }}
      role="dialog"
      aria-label="Happy birthday Mariana"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Flower ring */}
      {RING.map((f, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute"
          style={{ left: `${f.x}%`, top: `${f.y}%`, x: "-50%", y: "-50%" }}
          initial={{ scale: 0, rotate: f.r - 90, opacity: 0 }}
          animate={{ scale: f.s, rotate: f.r, opacity: 1 }}
          transition={{ delay: base * (0.1 + i * 0.07), type: "spring", stiffness: 70, damping: 12 }}
        >
          <motion.div
            animate={reduce ? undefined : { rotate: [0, 4, -3, 0], y: [0, -4, 2, 0] }}
            transition={{ duration: 7 + (i % 4), repeat: Infinity, ease: "easeInOut" }}
          >
            <Flower kind={f.kind} palette={PALETTES[f.kind][f.p]} size="clamp(72px, 16vw, 150px)" />
          </motion.div>
        </motion.div>
      ))}

      {/* Twinkling stars */}
      {!reduce &&
        Array.from({ length: 14 }, (_, i) => (
          <motion.svg
            key={`star${i}`}
            viewBox="0 0 24 24"
            className="pointer-events-none absolute"
            style={{ left: `${(i * 37 + 11) % 90 + 5}%`, top: `${(i * 53 + 17) % 80 + 8}%`, width: 10 + (i % 3) * 5 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0.3, 1, 0], scale: [0, 1, 0.8, 1, 0], rotate: [0, 90] }}
            transition={{ delay: 1 + i * 0.25, duration: 3.5, repeat: Infinity, repeatDelay: 2 + (i % 5) }}
            aria-hidden="true"
          >
            <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z" fill={i % 2 ? "#e2c37e" : "#c9b8f0"} />
          </motion.svg>
        ))}

      {/* Floating hearts */}
      {!reduce &&
        Array.from({ length: 7 }, (_, i) => (
          <motion.span
            key={`heart${i}`}
            className="pointer-events-none absolute bottom-0 text-lg"
            style={{ left: `${12 + i * 12}%` }}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: "-105vh", opacity: [0, 1, 1, 0], x: [0, i % 2 ? 20 : -20, 0] }}
            transition={{ delay: 2 + i * 0.6, duration: 9, repeat: Infinity, repeatDelay: 3, ease: "easeOut" }}
            aria-hidden="true"
          >
            {["💗", "🤍", "💜", "🩷"][i % 4]}
          </motion.span>
        ))}

      </div>

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <motion.p
          className="eyebrow mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: base * 0.4 }}
        >
          25 · IX · 2026 — Specimen birthday detected
        </motion.p>

        <h1 className="display text-ink">
          <motion.span
            className="block text-[clamp(2.4rem,9vw,5.6rem)] leading-[0.95] font-light italic"
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: base * 0.55, duration: 0.9 }}
          >
            Happy
          </motion.span>
          <motion.span
            className="block text-[clamp(2.9rem,12vw,7.4rem)] leading-[0.95] font-semibold"
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: base * 0.8, duration: 0.9 }}
          >
            <span className="iridescent">24th</span> Birthday
          </motion.span>
          <motion.span
            className="mt-1 block text-[clamp(2.6rem,11vw,6.8rem)] leading-[1] font-normal tracking-tight"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: base * 1.15, type: "spring", stiffness: 90, damping: 12 }}
          >
            Mariana <span className="inline-block align-middle text-[0.7em]">🌸</span>
          </motion.span>
        </h1>

        <motion.p
          className="mt-3 font-arabic text-lg text-ink-soft"
          dir="rtl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: base * 1.6 }}
          lang="ar"
        >
          كل عام وأنتِ بخير
          <span className="mx-2 text-ink-faint" dir="ltr">·</span>
          <span className="font-display text-base italic" dir="ltr" lang="es">¡Feliz cumpleaños!</span>
        </motion.p>

        <div className="mt-7 space-y-1.5">
          {LINES.map((line, i) => (
            <motion.p
              key={line}
              className="font-display text-[clamp(1.02rem,3.8vw,1.35rem)] text-ink/85"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: base * (2 + i * 0.55), duration: 0.6 }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.div
          className="mt-10 flex w-full flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: base * 4.3, duration: 0.6 }}
        >
          <button type="button" className="btn-primary w-full max-w-sm px-5 text-[13.5px] !tracking-normal whitespace-nowrap" onClick={onEnter}>
            BEGIN NEUROLOGICAL EXAMINATION <span aria-hidden>🧠</span>
          </button>

          <div className="relative flex h-14 w-full items-center justify-center">
            <AnimatePresence mode="wait">
              {caught ? (
                <motion.p
                  key="caught"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-xs rounded-2xl border border-rose/20 bg-petal/80 px-4 py-2 font-mono text-[12px] leading-snug text-rose"
                >
                  Attempting to avoid examination has been recorded as evidence.
                </motion.p>
              ) : (
                <motion.button
                  key="mature"
                  type="button"
                  className="btn-soft min-h-[44px] text-sm text-ink-soft"
                  animate={{ x: offset.x, y: offset.y }}
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  onPointerEnter={(e) => e.pointerType === "mouse" && escapes < MAX_ESCAPES && flee()}
                  onPointerDown={(e) => {
                    if (escapes < MAX_ESCAPES) {
                      e.preventDefault();
                      flee();
                    }
                  }}
                  onClick={() => escapes >= MAX_ESCAPES && flee()}
                >
                  I am clearly already mature
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            {escapes > 0 && !caught && (
              <motion.p
                key={escapes}
                className="-mt-2 font-mono text-[11px] text-ink-faint"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {ESCAPE_QUIPS[Math.min(escapes - 1, ESCAPE_QUIPS.length - 1)]}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
