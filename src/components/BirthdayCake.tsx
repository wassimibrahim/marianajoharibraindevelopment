"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { confettiBurst } from "@/lib/celebrate";
import { useLab } from "./LabProvider";

type Phase = "idle" | "wishing" | "blown";

/** A small cake with "2" and "4" candles. The wish is never typed, asked for, or saved. */
export function BirthdayCake() {
  const reduce = useReducedMotion();
  const { update } = useLab();
  const [phase, setPhase] = useState<Phase>("idle");
  const cakeRef = useRef<HTMLDivElement>(null);
  // Flames only flicker while the cake is on screen.
  const visible = useInView(cakeRef, { margin: "100px" });

  const blow = () => {
    if (phase !== "wishing") return;
    setPhase("blown");
    update((s) => {
      s.counters.wishes += 1;
    });
    const r = cakeRef.current?.getBoundingClientRect();
    const origin = r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.3) / window.innerHeight } : undefined;
    window.setTimeout(() => confettiBurst("petals", origin), 250);
    window.setTimeout(() => confettiBurst("stars", origin), 500);
  };

  const lit = phase !== "blown";

  return (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      <div
        ref={cakeRef}
        className={`relative w-[min(78vw,300px)] ${phase === "wishing" ? "cursor-pointer" : ""}`}
        onClick={blow}
        role={phase === "wishing" ? "button" : undefined}
        aria-label={phase === "wishing" ? "Blow out the candles" : undefined}
      >
        <CakeArt lit={lit} reduce={!!reduce || !visible} />
      </div>

      <div className="mt-6 min-h-[132px] w-full">
        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-[15px] text-ink-soft">Twenty-four years deserves at least one wish.</p>
              <button type="button" className="btn-primary mt-5 w-full max-w-xs" onClick={() => setPhase("wishing")}>
                Make a wish 🎂
              </button>
            </motion.div>
          )}
          {phase === "wishing" && (
            <motion.div key="wishing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="display text-[clamp(1.2rem,5vw,1.45rem)] leading-snug text-ink">Close your eyes and make a wish.</p>
              <p className="mt-2 text-[14px] text-ink-soft">Keep it to yourself. This laboratory has no clearance for wishes.</p>
              <button type="button" className="btn-primary mt-5 w-full max-w-xs" onClick={blow}>
                Blow out the candles 🌬️
              </button>
            </motion.div>
          )}
          {phase === "blown" && (
            <motion.div key="blown" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
              <p className="display text-[clamp(1.25rem,5.2vw,1.55rem)] leading-snug text-ink">Wish submitted.</p>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">Bureaucracy has been explicitly excluded from processing it.</p>
              <button type="button" className="mt-4 min-h-[44px] text-[13px] text-ink-soft underline decoration-dotted underline-offset-4" onClick={() => setPhase("idle")}>
                Relight the candles
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Flame({ x, lit, reduce, delay }: { x: number; lit: boolean; reduce: boolean; delay: number }) {
  return (
    <g>
      <AnimatePresence>
        {lit && (
          <motion.g
            key="flame"
            style={{ originX: `${x}px`, originY: "58px" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={reduce ? { scale: 1, opacity: 1 } : { scale: [1, 1.08, 0.95, 1.04, 1], opacity: 1, rotate: [0, -3, 2, -1, 0] }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.25 } }}
            transition={reduce ? { duration: 0.2 } : { duration: 1.4, repeat: Infinity, delay, ease: "easeInOut" }}
          >
            <ellipse cx={x} cy={46} rx={10} ry={14} fill="url(#glow)" />
            <path d={`M${x} 34 C ${x + 6} 42, ${x + 6} 52, ${x} 56 C ${x - 6} 52, ${x - 6} 42, ${x} 34 Z`} fill="url(#flame)" />
          </motion.g>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!lit &&
          !reduce &&
          [0, 1, 2].map((i) => (
            <motion.circle
              key={`smoke${i}`}
              cx={x}
              cy={52}
              r={3 + i}
              fill="#b9b0bd"
              initial={{ opacity: 0.5, y: 0, x: 0 }}
              animate={{ opacity: 0, y: -40 - i * 12, x: (i - 1) * 6 }}
              transition={{ duration: 1.6, delay: i * 0.15 }}
            />
          ))}
      </AnimatePresence>
    </g>
  );
}

function CakeArt({ lit, reduce }: { lit: boolean; reduce: boolean }) {
  return (
    <svg viewBox="0 0 300 260" className="h-auto w-full" aria-hidden>
      <defs>
        <radialGradient id="flame" cx="50%" cy="70%" r="60%">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="0.5" stopColor="#ffd35c" />
          <stop offset="1" stopColor="#ff8a3d" />
        </radialGradient>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#fff1b8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff1b8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sponge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6ec" />
          <stop offset="1" stopColor="#f5e3cf" />
        </linearGradient>
        <linearGradient id="candle" x1="0" x2="1">
          <stop offset="0" stopColor="#f7b3c8" />
          <stop offset="1" stopColor="#d9467a" />
        </linearGradient>
        <linearGradient id="candle2" x1="0" x2="1">
          <stop offset="0" stopColor="#c9b8f0" />
          <stop offset="1" stopColor="#7c5cc4" />
        </linearGradient>
      </defs>

      {/* Plate */}
      <ellipse cx="150" cy="238" rx="136" ry="16" fill="#ffffff" stroke="#eadfd3" />
      <ellipse cx="150" cy="232" rx="118" ry="11" fill="#f6efe6" />

      {/* Cake body */}
      <path d="M44 150 L44 222 Q150 244 256 222 L256 150 Z" fill="url(#sponge)" />
      <path d="M44 186 Q150 204 256 186" stroke="#f3c1cf" strokeWidth="5" fill="none" opacity="0.7" />
      <ellipse cx="150" cy="150" rx="106" ry="20" fill="#fde8ee" />
      {/* Frosting drips */}
      <path
        d="M44 150 Q44 172 52 172 Q60 172 60 158 Q64 180 74 180 Q84 180 84 162 Q90 176 100 176 Q110 176 112 164 Q120 186 132 184 Q144 182 144 166 Q152 178 164 178 Q176 178 178 164 Q186 184 198 182 Q210 180 210 164 Q216 176 226 176 Q236 176 238 160 Q244 172 250 170 Q256 168 256 150 Z"
        fill="#f7c6d4"
      />
      {/* Sprinkles */}
      {[
        [70, 205, "#7fb0e6"],
        [96, 214, "#f6c945"],
        [128, 208, "#b9a4ec"],
        [170, 214, "#7fb0e6"],
        [204, 206, "#ef8fb0"],
        [232, 200, "#f6c945"],
      ].map(([x, y, c], i) => (
        <rect key={i} x={x as number} y={y as number} width="8" height="3" rx="1.5" fill={c as string} transform={`rotate(${i * 37} ${x} ${y})`} />
      ))}
      {/* Flowers on top */}
      {[
        [70, 148, "#ef6f9a"],
        [230, 148, "#f6c945"],
        [110, 158, "#7fb0e6"],
        [192, 158, "#b9a4ec"],
      ].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx="0" cy="-5" rx="4" ry="5.5" fill={c as string} transform={`rotate(${r})`} />
          ))}
          <circle r="2.6" fill="#fff4c9" />
        </g>
      ))}

      {/* Number candles: 2 and 4 */}
      <g>
        <rect x="116" y="96" width="4" height="10" fill="#6e6073" />
        <text x="118" y="152" textAnchor="middle" fontFamily="var(--font-fraunces), Georgia, serif" fontWeight="700" fontSize="62" fill="url(#candle)" stroke="#fff" strokeWidth="2" paintOrder="stroke">
          2
        </text>
        <rect x="180" y="96" width="4" height="10" fill="#6e6073" />
        <text x="182" y="152" textAnchor="middle" fontFamily="var(--font-fraunces), Georgia, serif" fontWeight="700" fontSize="62" fill="url(#candle2)" stroke="#fff" strokeWidth="2" paintOrder="stroke">
          4
        </text>
      </g>

      <g transform="translate(0 44)">
        <Flame x={118} lit={lit} reduce={reduce} delay={0} />
        <Flame x={182} lit={lit} reduce={reduce} delay={0.3} />
      </g>
    </svg>
  );
}
