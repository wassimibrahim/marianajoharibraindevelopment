"use client";

import { motion } from "framer-motion";
import { hashString } from "@/lib/rng";
import { bandFor } from "@/lib/scoring";
import { formatLongDate } from "@/lib/dates";
import type { SessionRecord } from "@/lib/storage";
import { CATEGORY_LABELS, CATEGORY_ORDER, type ChallengeResult } from "@/experiments/types";
import { WASSIM_HYPOTHESES } from "@/content/lab";
import { CountUp, useCountUp } from "./CountUp";

interface Props {
  record: SessionRecord;
  results: ChallengeResult[];
  previous?: SessionRecord;
  isBest: boolean;
  sessionNumber: number;
  isFinal: boolean;
}

export function trendMessage(current: number, previous?: number): { text: string; tone: string } | null {
  if (previous === undefined) return null;
  const d = current - previous;
  if (d > 3) return { text: "Evidence of neurological development detected.", tone: "text-sage" };
  if (d < -3) return { text: "Researchers are currently unable to explain this regression.", tone: "text-rose" };
  return { text: "Brain appears to be running the same firmware.", tone: "text-iris" };
}

export function ResultsReport({ record, results, previous, isBest, sessionNumber, isFinal }: Props) {
  const band = bandFor(record.overall);
  const overall = useCountUp(record.overall, 1800, 500);
  const trend = trendMessage(record.overall, previous?.overall);
  const seed = hashString(record.id);
  const showEgg = seed % 100 < 35 || isFinal;
  const egg = WASSIM_HYPOTHESES[seed % WASSIM_HYPOTHESES.length];
  const cats = CATEGORY_ORDER.filter((c) => record.categories[c] !== undefined || c === "emotion");

  const R = 70;
  const C = 2 * Math.PI * R;

  return (
    <div className="card-solid overflow-hidden">
      <div className={`bg-gradient-to-br ${band.tone} px-6 pt-7 pb-8 sm:px-9`}>
        <div className="relative">
          <div className="pr-24 sm:pr-32">
            <p className="eyebrow !text-ink/60">Johari Cognitive Research Institute</p>
            <h3 className="display mt-2 text-[clamp(1.25rem,5vw,1.7rem)] leading-tight font-semibold tracking-tight text-ink">
              MARIANA EXECUTIVE FUNCTION REPORT
            </h3>
            <p className="mt-1 font-mono text-[11px] text-ink/60">
              {isFinal ? "FINAL EXAMINATION" : `Session #${sessionNumber}`} · {formatLongDate(new Date(record.date))}
            </p>
          </div>
          <span className="absolute top-0 right-0 rotate-6 rounded-lg border-2 border-rose/60 px-2 py-1 font-mono text-[10px] font-medium tracking-widest text-rose/80">
            {isFinal ? "FINAL" : "CONFIDENTIAL"}
          </span>
        </div>

        <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
          <div className="relative h-[170px] w-[170px] shrink-0">
            <svg viewBox="0 0 170 170" className="-rotate-90">
              <circle cx="85" cy="85" r={R} fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="12" />
              <motion.circle
                cx="85"
                cy="85"
                r={R}
                fill="none"
                stroke="#2d2233"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={C}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: C * (1 - record.overall / 100) }}
                transition={{ duration: 1.8, delay: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="display text-5xl font-semibold text-ink tabular-nums">{overall}%</span>
              <span className="mt-1 text-center font-mono text-[9px] leading-tight tracking-[0.18em] text-ink/60">SUSPECTED<br />OPERATIONAL</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <p className="font-mono text-[11px] tracking-widest text-ink/60">FRONTAL LOBE STATUS</p>
            <motion.p
              className="display mt-1 text-[clamp(1.5rem,6vw,2.1rem)] leading-[1.05] font-semibold text-ink"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
            >
              {band.label}
            </motion.p>
            {isBest && (
              <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.3, type: "spring" }} className="mt-3 inline-block rounded-full bg-ink px-3 py-1 font-mono text-[11px] text-white">
                🏅 NEW PERSONAL BEST
              </motion.p>
            )}
            {trend && (
              <motion.p className={`mt-3 text-[15px] italic ${trend.tone}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }}>
                {trend.text} <span className="font-mono text-[11px] not-italic text-ink/50">({previous?.overall}% → {record.overall}%)</span>
              </motion.p>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-7 sm:px-9">
        <p className="eyebrow mb-4">Category measurements</p>
        <div className="space-y-3.5">
          {cats.map((c, i) => {
            const v = record.categories[c];
            return (
              <div key={c}>
                <div className="mb-1.5 flex items-baseline justify-between text-[14px]">
                  <span className="text-ink">{CATEGORY_LABELS[c]}</span>
                  <span className="font-mono text-ink tabular-nums">
                    {v === undefined ? <span className="text-iris italic">“Under Review”</span> : <CountUp value={v} delay={300 + i * 120} />}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink/6">
                  {v !== undefined ? (
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-sky via-lavender to-rose"
                      initial={{ width: 0 }}
                      animate={{ width: `${v}%` }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
                    />
                  ) : (
                    <div className="h-full w-full animate-pulse-soft bg-[repeating-linear-gradient(45deg,#efe9fc_0_6px,#fff_6px_12px)]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="eyebrow mt-8 mb-3">Experimental log</p>
        <ul className="divide-y divide-ink/6">
          {results.map((r) => (
            <li key={r.id} className="flex items-start gap-3 py-3">
              <span className="mt-0.5 text-base" aria-hidden>
                {r.kind === "executive" ? "🧠" : "🌸"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-ink">{r.title}</p>
                <p className="text-[13px] leading-snug text-ink-soft">{r.verdict}</p>
              </div>
              <span className="shrink-0 font-mono text-sm text-ink tabular-nums">{r.score ?? "—"}</span>
            </li>
          ))}
        </ul>

        {record.reactions.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {record.reactions.map((r) => (
              <span key={r.id} className="rounded-full bg-mist px-3 py-1 font-mono text-[11px] text-cobalt">
                ⏱ {results.find((x) => x.id === r.id)?.title}: {r.ms} ms
              </span>
            ))}
          </div>
        )}

        <p className="mt-6 text-[11px] leading-relaxed text-ink-faint">
          Methodology: executive-function tasks are weighted fully; 🌸 research questions at 15%. Reaction-time scoring includes a
          touchscreen allowance. Preference questions are scored on reasoning and calibration, not on picking the &ldquo;safe&rdquo; answer.
        </p>

        {showEgg && (
          <motion.p
            className="mt-5 rounded-2xl border border-dashed border-rose/30 bg-petal/50 px-4 py-3 text-[12.5px] leading-relaxed text-rose/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
          >
            <span className="font-mono text-[10px] tracking-widest">FOOTNOTE ³ · </span>
            {egg}
          </motion.p>
        )}
      </div>
    </div>
  );
}
