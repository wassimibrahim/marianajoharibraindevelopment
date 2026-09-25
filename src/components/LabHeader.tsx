"use client";

import { motion } from "framer-motion";
import { ageOn } from "@/lib/dates";
import { useNow } from "@/lib/useNow";
import { FLOWER_KINDS, Flower, PALETTES } from "./Flower";

export function LabHeader() {
  const t = useNow(60_000);
  const age = t ? ageOn(t) : 24;

  const rows: [string, React.ReactNode][] = [
    ["Subject", "Mariana Johari"],
    ["Age", age],
    [
      "Status",
      <span key="s" className="inline-flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose" />
        </span>
        Under Investigation
      </span>,
    ],
    ["Expected Certification Date", "25 September 2027"],
    ["Confidence Level", <em key="c" className="text-iris">Questionable</em>],
  ];

  return (
    <header className="relative px-5 pt-14 pb-8 sm:pt-20">
      <div className="mx-auto max-w-5xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <motion.p className="eyebrow" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              Johari Cognitive Research Institute · Est. 2026
            </motion.p>
            <motion.h2
              className="display mt-4 text-[clamp(2.2rem,8.5vw,4.4rem)] leading-[0.98] font-medium text-ink"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              The Mariana Johari <span className="italic font-light text-rose">Prefrontal Cortex</span> Laboratory
              <sup className="ml-1 align-super text-[0.35em] font-normal text-gold">™</sup>
            </motion.h2>
            <motion.p
              className="mt-5 max-w-xl text-[clamp(1.02rem,3.8vw,1.2rem)] leading-relaxed text-ink-soft"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              A longitudinal scientific investigation into whether Mariana is finally capable of making good decisions.
            </motion.p>
          </div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 24, rotate: 1.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: -1.2 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <SpecimenWreath />
            <div className="card-solid mt-[-54px] px-5 pt-16 pb-5">
              <p className="eyebrow mb-3 text-center">Specimen record · № 001</p>
              <dl className="divide-y divide-dashed divide-ink/12">
                {rows.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="font-mono text-[11px] tracking-wider text-ink-faint uppercase">{k}</dt>
                    <dd className="text-right text-[15px] font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </motion.div>
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-[11px] leading-relaxed text-ink-faint">
          <span className="font-mono">Disclaimer:</span> The popular idea that your frontal lobe magically finishes developing on your 25th
          birthday is a simplification. This website has elected to ignore that nuance for comedic purposes.
        </p>
      </div>
    </header>
  );
}

function SpecimenWreath() {
  const n = 12;
  return (
    <div className="relative z-10 mx-auto h-[120px] w-[120px]">
      <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }}>
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2;
          const kind = FLOWER_KINDS[i % 4 === 0 ? 2 : i % 3 === 0 ? 1 : i % 2 ? 0 : 3];
          return (
            <div key={i} className="absolute" style={{ left: 60 + Math.cos(a) * 48 - 15, top: 60 + Math.sin(a) * 48 - 15 }}>
              <Flower kind={kind} size={30} palette={PALETTES[kind][i % PALETTES[kind].length]} />
            </div>
          );
        })}
      </motion.div>
      <div className="absolute inset-[26px] flex items-center justify-center rounded-full bg-white text-[34px] shadow-soft">🧠</div>
    </div>
  );
}
