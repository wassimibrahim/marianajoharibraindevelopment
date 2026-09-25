"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { Flower, PALETTES, type FlowerKind } from "./Flower";

const PARAGRAPHS: string[] = [
  "I hope 24 brings you everything you deserve: happiness, adventures, money, an employer that discovers what a contract is, and — most importantly — a Venezuelan passport that actually lets you enter Venezuela AND leave Venezuela.",
];
const WISHES = [
  "May you never get stuck at immigration.",
  "May your boss eventually discover labour law.",
  "May you remain basita.",
  "May you never stop being fucking hilarious.",
];

const GROWERS: { kind: FlowerKind; side: "left" | "right"; top: string; size: number; p: number; from: number }[] = [
  { kind: "rose", side: "left", top: "4%", size: 88, p: 0, from: 0.05 },
  { kind: "lavender", side: "right", top: "10%", size: 96, p: 0, from: 0.1 },
  { kind: "blossom", side: "left", top: "30%", size: 64, p: 1, from: 0.18 },
  { kind: "hibiscus", side: "right", top: "38%", size: 78, p: 1, from: 0.24 },
  { kind: "tulip", side: "left", top: "56%", size: 80, p: 2, from: 0.3 },
  { kind: "daisy", side: "right", top: "64%", size: 70, p: 0, from: 0.36 },
  { kind: "rose", side: "left", top: "82%", size: 72, p: 1, from: 0.42 },
  { kind: "blossom", side: "right", top: "88%", size: 84, p: 0, from: 0.48 },
];

function Grower({ g, progress }: { g: (typeof GROWERS)[number]; progress: MotionValue<number> }) {
  const scale = useTransform(progress, [g.from, g.from + 0.18], [0, 1]);
  const rotate = useTransform(progress, [g.from, g.from + 0.25], [g.side === "left" ? -70 : 70, g.side === "left" ? -12 : 12]);
  return (
    <motion.div
      className="pointer-events-none absolute z-10"
      style={{ top: g.top, [g.side]: -g.size * 0.95, scale, rotate, originX: g.side === "left" ? 0 : 1, originY: 0.5 }}
      aria-hidden
    >
      <Flower kind={g.kind} size={g.size} palette={PALETTES[g.kind][g.p]} />
    </motion.div>
  );
}

function Stamp({ title, sub, emoji, tint, rotate }: { title: string; sub: string; emoji: string; tint: string; rotate: number }) {
  return (
    <div className="rounded-[3px] border-[3px] border-dotted border-white bg-white p-1 shadow-[0_2px_8px_rgba(45,34,51,0.12)]" style={{ transform: `rotate(${rotate}deg)` }}>
      <div className={`flex h-[74px] w-[58px] flex-col items-center justify-center rounded-[2px] ${tint}`}>
        <span className="text-2xl">{emoji}</span>
        <span className="mt-1 font-mono text-[7px] leading-tight tracking-wider text-ink/70">{title}</span>
        <span className="font-arabic text-[9px] leading-tight text-ink/60">{sub}</span>
      </div>
    </div>
  );
}

export function BirthdayLetter() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const fade = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
  };

  return (
    <div ref={ref} className="relative mx-auto max-w-2xl">
      {/* Growing flowers sit in the margins, so they only appear where there is room for them. */}
      <div className="hidden md:block">
        {GROWERS.map((g, i) => (
          <Grower key={i} g={g} progress={scrollYProgress} />
        ))}
      </div>

      <motion.article
        className="relative overflow-hidden rounded-[32px] border border-white bg-[#fffdf9] px-6 py-10 shadow-lift sm:px-12 sm:py-14"
        initial={{ opacity: 0, y: 40, rotate: -1.5 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
        style={{
          backgroundImage:
            "radial-gradient(30rem 20rem at 100% 0%, rgba(253,235,241,0.9), transparent 60%), radial-gradient(30rem 20rem at 0% 100%, rgba(239,233,252,0.8), transparent 60%)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="eyebrow pt-1">
            Correspondence
            <br />
            Delivered by hand
          </p>
          <div className="flex shrink-0 gap-1.5">
            <Stamp title="DAMASCUS" sub="ياسمين" emoji="🤍" tint="bg-[#eef6ee]" rotate={-6} />
            <Stamp title="CARACAS" sub="orquídea" emoji="🌺" tint="bg-[#fdf1e4]" rotate={5} />
          </div>
        </div>
        <motion.h3 {...fade} className="display mt-6 text-[clamp(2rem,8vw,3rem)] leading-[1.02] text-ink">
          Happy birthday <span className="italic text-rose">Mariana</span> <span className="text-[0.8em]">❤️</span>
        </motion.h3>

        <div className="mt-8 space-y-6 font-display text-[clamp(1.08rem,4vw,1.28rem)] leading-[1.65] text-ink/85">
          {PARAGRAPHS.map((p) => (
            <motion.p key={p} {...fade}>
              {p}
            </motion.p>
          ))}
          <ul className="space-y-2.5">
            {WISHES.map((w, i) => (
              <motion.li key={w} {...fade} transition={{ delay: i * 0.12 }} className="flex gap-3">
                <span className="mt-[0.35em] text-[0.75em] text-gold" aria-hidden>
                  ✦
                </span>
                <span className={i === 3 ? "italic" : ""}>{w}</span>
              </motion.li>
            ))}
          </ul>
          <motion.p {...fade}>And may this be the year we finally determine whether the frontal lobe is actually online.</motion.p>
          <motion.div {...fade} className="flex items-center justify-center gap-3 py-2" aria-hidden>
            <Flower kind="blossom" size={26} palette={PALETTES.blossom[0]} />
            <Flower kind="daisy" size={26} palette={PALETTES.daisy[2]} />
            <Flower kind="blossom" size={26} palette={PALETTES.blossom[2]} />
          </motion.div>
          <motion.p {...fade}>
            Whatever the laboratory concludes, I hope this year is kind to you. More freedom, more adventures, more reasons to laugh, and
            people who appreciate you properly.
          </motion.p>
          <motion.p {...fade}>Stay funny. Stay basita. Have the happiest birthday.</motion.p>
        </div>

        <motion.div {...fade} className="mt-10 flex items-end justify-between gap-4">
          <p className="display text-[clamp(1.6rem,6.5vw,2.1rem)] text-ink italic">— Wassim ❤️</p>
          <motion.div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-2xl font-semibold text-white shadow-lift"
            style={{ background: "radial-gradient(circle at 35% 30%, #f28aa9, #c02d62 65%, #8b1c47)" }}
            initial={{ scale: 0, rotate: -40 }}
            whileInView={{ scale: 1, rotate: -8 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 160, damping: 10, delay: 0.3 }}
            aria-hidden
          >
            M
          </motion.div>
        </motion.div>
      </motion.article>
    </div>
  );
}
