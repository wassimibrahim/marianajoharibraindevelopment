"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { launchFireworks } from "@/lib/celebrate";
import { Flower, PALETTES, type FlowerKind } from "./Flower";

/**
 * The opening: an envelope surrounded by flowers. Tapping it runs a short,
 * sequenced reveal — envelope opens, flowers bloom from the edges, the
 * birthday line appears, one brief burst of fireworks, then it settles onto
 * the birthday page. Skippable at every step.
 */

type Stage = "closed" | "opening" | "bloom" | "headline" | "fireworks" | "settle";

const EDGE: { kind: FlowerKind; x: number; y: number; s: number; p: number; r: number }[] = [
  { kind: "rose", x: 3, y: 5, s: 1.15, p: 0, r: -12 },
  { kind: "blossom", x: 26, y: -3, s: 0.75, p: 2, r: 20 },
  { kind: "daisy", x: 72, y: -2, s: 0.8, p: 2, r: 0 },
  { kind: "rose", x: 97, y: 6, s: 1.05, p: 1, r: 25 },
  { kind: "tulip", x: 99, y: 34, s: 0.85, p: 3, r: -18 },
  { kind: "blossom", x: 100, y: 62, s: 0.8, p: 0, r: 10 },
  { kind: "daisy", x: 96, y: 95, s: 1.05, p: 0, r: 10 },
  { kind: "rose", x: 66, y: 102, s: 0.9, p: 3, r: -18 },
  { kind: "tulip", x: 34, y: 101, s: 0.95, p: 0, r: 8 },
  { kind: "blossom", x: 3, y: 95, s: 1.1, p: 3, r: 30 },
  { kind: "tulip", x: -1, y: 64, s: 0.9, p: 2, r: 16 },
  { kind: "daisy", x: 0, y: 34, s: 0.8, p: 1, r: -5 },
];

const ORDER: Stage[] = ["closed", "opening", "bloom", "headline", "fireworks", "settle"];
const at = (stage: Stage, min: Stage) => ORDER.indexOf(stage) >= ORDER.indexOf(min);

export function BirthdayIntro({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>("closed");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const schedule = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const open = () => {
    if (stage !== "closed") return;
    setStage("opening");
    if (reduce) {
      schedule(300, () => setStage("headline"));
      schedule(700, () => setStage("settle"));
      return;
    }
    schedule(900, () => setStage("bloom"));
    schedule(1800, () => setStage("headline"));
    schedule(2700, () => {
      setStage("fireworks");
      launchFireworks(0.8);
    });
    schedule(4600, () => setStage("settle"));
    schedule(6200, onDone);
  };

  const skip = () => {
    timers.current.forEach(window.clearTimeout);
    onDone();
  };

  const opened = at(stage, "opening");

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto overscroll-contain bg-ivory"
      style={{
        backgroundImage:
          "radial-gradient(38rem 28rem at 50% 45%, rgba(255,255,255,0.95), transparent 70%), radial-gradient(50rem 40rem at 100% 0%, #efe9fc, transparent 60%), radial-gradient(50rem 40rem at 0% 100%, #fdebf1, transparent 60%), radial-gradient(40rem 30rem at 100% 100%, #fff3d6, transparent 60%)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: reduce ? 0.2 : 0.9, ease: [0.4, 0, 0.2, 1] } }}
      role="dialog"
      aria-modal="true"
      aria-label="A birthday surprise for Mariana"
    >
      {/* Edge flowers: a quiet frame while closed, blooming fully on reveal. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {EDGE.map((f, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${f.x}%`, top: `${f.y}%`, x: "-50%", y: "-50%" }}
            initial={{ scale: reduce ? f.s : 0.35, rotate: f.r - (reduce ? 0 : 40), opacity: reduce ? 1 : 0.9 }}
            animate={
              at(stage, "bloom") || reduce
                ? { scale: f.s * (at(stage, "bloom") ? 1.25 : 1), rotate: f.r, opacity: 1 }
                : { scale: f.s * 0.62, rotate: f.r - 10, opacity: 0.95 }
            }
            transition={{ delay: at(stage, "bloom") ? i * 0.05 : 0.1 + i * 0.04, type: "spring", stiffness: 70, damping: 13 }}
          >
            <Flower kind={f.kind} palette={PALETTES[f.kind][f.p % PALETTES[f.kind].length]} size="clamp(78px, 17vw, 150px)" />
          </motion.div>
        ))}
      </div>

      <button
        type="button"
        onClick={skip}
        className="fixed top-[max(14px,env(safe-area-inset-top))] right-4 z-20 min-h-[44px] rounded-full bg-white/80 px-4 text-[13px] text-ink-soft shadow-sm backdrop-blur hover:text-ink"
      >
        Skip intro ›
      </button>

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
        <AnimatePresence mode="wait">
          {!at(stage, "headline") ? (
            <motion.div key="invite" exit={{ opacity: 0, y: -10, transition: { duration: 0.35 } }} className="flex flex-col items-center">
              <motion.p
                className="display text-[clamp(2.1rem,9vw,3.2rem)] leading-none text-ink italic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: opened ? 0 : 1, y: 0 }}
                transition={{ delay: opened ? 0 : 0.3 }}
              >
                For Mariana.
              </motion.p>
              <motion.div
                className="mt-3 space-y-0.5 text-[15px] leading-relaxed text-ink-soft"
                initial={{ opacity: 0 }}
                animate={{ opacity: opened ? 0 : 1 }}
                transition={{ delay: opened ? 0 : 0.6 }}
              >
                <p>A very serious investigation.</p>
                <p>And a very unserious amount of love.</p>
              </motion.div>

              <Envelope opened={opened} onOpen={open} />

              <motion.button
                type="button"
                onClick={open}
                disabled={opened}
                className="btn-primary mt-8 w-full max-w-xs px-4 text-[15px] whitespace-nowrap"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: opened ? 0 : 1, y: 0 }}
                transition={{ delay: opened ? 0 : 0.9 }}
              >
                Open your birthday surprise 💌
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="headline" className="flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                25 September 2026
              </motion.p>
              <h1 className="display mt-4 text-ink">
                <motion.span
                  className="block text-[clamp(2.3rem,10vw,4.6rem)] leading-[1] font-light italic"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(6px)" }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.8 }}
                >
                  Happy <span className="iridescent not-italic font-semibold">24th</span> birthday,
                </motion.span>
                <motion.span
                  className="mt-1 block text-[clamp(3rem,14vw,6.4rem)] leading-[1] font-semibold tracking-tight"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, type: "spring", stiffness: 90, damping: 13 }}
                >
                  Mariana
                </motion.span>
              </h1>
              <motion.p
                className="mt-4 font-arabic text-lg text-ink-soft"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <span lang="ar" dir="rtl">
                  كل عام وأنتِ بخير
                </span>
                <span className="mx-2 text-ink-faint">·</span>
                <span className="font-display text-base italic" lang="es">
                  ¡Feliz cumpleaños!
                </span>
              </motion.p>
              <AnimatePresence>
                {stage === "settle" && (
                  <motion.button
                    type="button"
                    onClick={skip}
                    className="btn-soft mt-10"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Continue to your birthday page ›
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Envelope({ opened, onOpen }: { opened: boolean; onOpen: () => void }) {
  const [flapBehind, setFlapBehind] = useState(false);
  useEffect(() => {
    if (!opened) return;
    const id = window.setTimeout(() => setFlapBehind(true), 350);
    return () => window.clearTimeout(id);
  }, [opened]);

  return (
    <motion.div
      className="relative mt-9 aspect-[3/2] w-[min(78vw,340px)] cursor-pointer"
      style={{ perspective: 900 }}
      onClick={onOpen}
      initial={{ opacity: 0, y: 24, rotate: -2 }}
      animate={{ opacity: 1, y: opened ? 18 : 0, rotate: opened ? 0 : -2 }}
      transition={{ delay: opened ? 0 : 0.5, type: "spring", stiffness: 80, damping: 14 }}
      whileHover={opened ? undefined : { rotate: 0, y: -4 }}
      aria-hidden
    >
      {/* Back of the envelope */}
      <div className="absolute inset-0 rounded-[14px] bg-gradient-to-b from-[#f2e2cf] to-[#ead3bb] shadow-lift" />

      {/* The card inside */}
      <motion.div
        className="absolute inset-x-[7%] top-[8%] bottom-[6%] flex flex-col items-center justify-center rounded-[10px] bg-[#fffdf9] px-4 text-center shadow-sm"
        style={{ zIndex: 2 }}
        animate={{ y: opened ? "-46%" : "0%" }}
        transition={{ delay: opened ? 0.45 : 0, duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <Flower kind="blossom" size={30} />
        <p className="display mt-1 text-[15px] leading-tight text-ink italic">Happy birthday, Mari</p>
      </motion.div>

      {/* Front pockets */}
      <svg viewBox="0 0 300 200" className="absolute inset-0 h-full w-full" style={{ zIndex: 3 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="envL" x1="0" x2="1">
            <stop offset="0" stopColor="#f6e7d6" />
            <stop offset="1" stopColor="#efdcc6" />
          </linearGradient>
          <linearGradient id="envB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f9ecdd" />
            <stop offset="1" stopColor="#f1dcc4" />
          </linearGradient>
        </defs>
        <path d="M0 14 L140 112 L0 200 Z" fill="url(#envL)" />
        <path d="M300 14 L160 112 L300 200 Z" fill="url(#envL)" />
        <path d="M0 200 L150 96 L300 200 Z" fill="url(#envB)" />
        <path d="M0 200 L150 96 L300 200" fill="none" stroke="#dcc2a4" strokeWidth="1" />
      </svg>

      {/* Top flap */}
      <motion.svg
        viewBox="0 0 300 120"
        className="absolute inset-x-0 top-0 h-[60%] w-full"
        style={{ zIndex: flapBehind ? 1 : 4, transformOrigin: "50% 0%" }}
        animate={{ rotateX: opened ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        preserveAspectRatio="none"
      >
        <path d="M0 0 L300 0 L150 118 Z" fill="#f4e4d2" stroke="#dcc2a4" strokeWidth="1" />
      </motion.svg>

      {/* Wax seal */}
      <motion.div
        className="absolute top-[52%] left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-display text-lg font-semibold text-white shadow-lift"
        style={{ zIndex: 5, background: "radial-gradient(circle at 35% 30%, #f28aa9, #c02d62 65%, #8b1c47)" }}
        animate={{ scale: opened ? 0 : 1, opacity: opened ? 0 : 1 }}
        transition={{ duration: 0.25 }}
      >
        ♥
      </motion.div>
    </motion.div>
  );
}
