"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { dayKey, now } from "@/lib/dates";
import { Flower, PALETTES } from "./Flower";
import { useLab } from "./LabProvider";

/** The first screen: affection first, laboratory second. */
export function WelcomeHero({ onReplay }: { onReplay: () => void }) {
  const { state, ready } = useLab();
  const returning = ready && state.visits > 1;
  const doneToday = ready && state.sessions.some((s) => !s.final && s.day === dayKey(now()));

  return (
    <header className="relative z-10 overflow-x-clip px-5 pt-16 pb-14 sm:pt-24 sm:pb-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[1.35fr_1fr]">
        <div className="order-2 min-w-0 text-center md:order-1 md:text-left">
          {returning && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mb-6 max-w-md rounded-2xl bg-white/70 px-4 py-3 text-[14px] leading-snug text-ink-soft md:mx-0"
            >
              <span className="font-medium text-ink">Welcome back, Mari.</span> The flowers missed you. The researchers remain suspicious.
            </motion.p>
          )}
          <p className="eyebrow">25 September 2026 · A birthday page</p>
          <h1 className="display mt-4 text-[clamp(2rem,8.6vw,4.3rem)] leading-[1.04] text-balance text-ink">
            Mariana, the world got <em className="text-rose">funnier</em> on 25&nbsp;September 2002.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-[clamp(1.02rem,3.9vw,1.2rem)] leading-relaxed text-ink-soft md:mx-0">
            24 years of being hilarious, basita, and absolutely convinced your frontal lobe has finished loading.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center md:justify-start">
            <a href="#letter" className="btn-primary">
              Read your birthday letter 💌
            </a>
            <a href="#experiment" className="btn-soft">
              {returning ? (doneToday ? "Today’s results 🧠" : "Today’s experiment 🧠") : "Investigate my frontal lobe 🧠"}
            </a>
          </div>
          <button
            type="button"
            onClick={onReplay}
            className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 text-[13px] text-ink-soft underline decoration-dotted underline-offset-4 hover:text-ink"
          >
            <Sparkles size={14} /> Replay birthday magic
          </button>
        </div>

        <div className="relative order-1 mx-auto h-[190px] w-[260px] md:order-2 md:h-[340px] md:w-[360px]" aria-hidden>
          <HeroPosy />
        </div>
      </div>
    </header>
  );
}

/** A small arranged posy: stems gathered by a ribbon. */
function HeroPosy() {
  const stems = [
    { kind: "rose" as const, p: 0, x: 50, y: 18, s: 1, r: 0 },
    { kind: "tulip" as const, p: 3, x: 22, y: 30, s: 0.8, r: -18 },
    { kind: "daisy" as const, p: 2, x: 78, y: 30, s: 0.82, r: 14 },
    { kind: "blossom" as const, p: 2, x: 34, y: 8, s: 0.62, r: -8 },
    { kind: "blossom" as const, p: 0, x: 68, y: 6, s: 0.6, r: 10 },
    { kind: "rose" as const, p: 3, x: 62, y: 38, s: 0.7, r: 6 },
    { kind: "lavender" as const, p: 0, x: 88, y: 10, s: 0.75, r: 22 },
  ];
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {stems.map((f, i) => (
          <path key={i} d={`M${f.x} ${f.y + 12} Q ${(f.x + 50) / 2} 70 50 96`} stroke="#86ad86" strokeWidth="1.1" fill="none" />
        ))}
        <path d="M42 76 Q50 72 58 76 L56 84 Q50 82 44 84 Z" fill="#f7c6d4" />
        <path d="M50 80 Q40 90 36 98 M50 80 Q60 90 64 98" stroke="#ef8fb0" strokeWidth="1.2" fill="none" />
      </svg>
      {stems.map((f, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${f.x}%`, top: `${f.y}%`, x: "-50%", y: "-30%" }}
          initial={{ scale: 0, rotate: f.r - 30 }}
          animate={{ scale: f.s, rotate: f.r }}
          transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 90, damping: 12 }}
        >
          <Flower kind={f.kind} palette={PALETTES[f.kind][f.p % PALETTES[f.kind].length]} size="clamp(70px, 26vw, 118px)" />
        </motion.div>
      ))}
    </div>
  );
}
