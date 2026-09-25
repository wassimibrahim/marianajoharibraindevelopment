"use client";

import { motion } from "framer-motion";
import { bandFor } from "@/lib/scoring";
import { formatLongDate } from "@/lib/dates";
import type { SessionRecord } from "@/lib/storage";
import { CATEGORY_LABELS, SCORED_CATEGORIES, type ChallengeResult } from "@/experiments/types";
import { CountUp, useCountUp } from "./CountUp";

interface Props {
  record: SessionRecord;
  results: ChallengeResult[];
  previousCore?: number;
  isBestCore: boolean;
  sessionNumber: number;
  isFinal: boolean;
}

/**
 * Like-for-like comparison of the core task only. Different random question
 * sets are never compared with each other.
 */
export function coreTrend(current?: number, previous?: number): { text: string; aside: string; tone: string } | null {
  if (current === undefined || previous === undefined) return null;
  const d = current - previous;
  if (d >= 10)
    return {
      text: "Evidence of neurological development detected.",
      aside: "(Joke. Practice, sleep and coffee are the usual suspects.)",
      tone: "text-sage",
    };
  if (d <= -10)
    return {
      text: "Researchers are currently unable to explain this regression.",
      aside: "(They didn’t try very hard. Tiredness and phones happen.)",
      tone: "text-rose",
    };
  return { text: "Brain appears to be running the same firmware.", aside: "(A change this small is normal day-to-day variation.)", tone: "text-iris" };
}

export function ResultsReport({ record, results, previousCore, isBestCore, sessionNumber, isFinal }: Props) {
  const scoredResults = results.filter((r) => r.scored && r.score !== null);
  const reflections = results.filter((r) => !r.scored);
  const band = bandFor(record.overall);
  const overall = useCountUp(record.overall, 1500, 300);
  const trend = coreTrend(record.core, previousCore);
  const measured = SCORED_CATEGORIES.filter((c) => record.categories[c] !== undefined);
  const unmeasured = SCORED_CATEGORIES.filter((c) => record.categories[c] === undefined);

  const R = 70;
  const C = 2 * Math.PI * R;

  return (
    <div className="card-solid overflow-hidden">
      <div className={`bg-gradient-to-br ${band.tone} px-6 pt-7 pb-8 sm:px-9`}>
        <div className="relative pr-24 sm:pr-32">
          <p className="eyebrow !text-ink/60">Johari Cognitive Research Institute</p>
          <h3 className="display mt-2 text-[clamp(1.25rem,5vw,1.7rem)] leading-tight font-semibold tracking-tight text-ink">
            MARIANA EXECUTIVE FUNCTION REPORT
          </h3>
          <p className="mt-1 font-mono text-[11px] text-ink/60">
            {isFinal ? "Final examination" : `Session ${sessionNumber}`} · {formatLongDate(new Date(record.date))}
          </p>
          <span className="absolute top-0 right-0 rotate-6 rounded-lg border-2 border-rose/60 px-2 py-1 font-mono text-[10px] font-medium tracking-widest text-rose/80">
            {isFinal ? "FINAL" : "CONFIDENTIAL"}
          </span>
        </div>

        <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
          <div className="relative h-[170px] w-[170px] shrink-0">
            <svg viewBox="0 0 170 170" className="-rotate-90" aria-hidden>
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
                transition={{ duration: 1.5, delay: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="display text-5xl font-semibold text-ink tabular-nums">{overall}</span>
              <span className="mt-1 font-mono text-[10px] tracking-[0.2em] text-ink/60">GAME SCORE</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[13px] text-ink/70">
              Average of {scoredResults.length} scored game{scoredResults.length === 1 ? "" : "s"} this session, out of 100.
            </p>
            <p className="mt-3 font-mono text-[10.5px] tracking-widest text-ink/60">LABORATORY VERDICT (A JOKE)</p>
            <p className="display mt-1 text-[clamp(1.4rem,5.6vw,1.9rem)] leading-[1.08] font-semibold text-ink">{band.label}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-7 sm:px-9">
        {typeof record.core === "number" && (
          <div className="mb-8 rounded-3xl bg-cream/70 px-5 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[14px] font-medium text-ink">⭐ Core task · Flower Stroop</p>
              <p className="font-mono text-lg text-ink tabular-nums">{record.core}/100</p>
            </div>
            <p className="mt-1 text-[12.5px] text-ink-soft">
              The same task every session, so this is the one number that’s fair to compare over time.
              {previousCore !== undefined && ` Last time: ${previousCore}.`}
            </p>
            {trend && (
              <p className={`mt-2 text-[14px] italic ${trend.tone}`}>
                {trend.text} <span className="text-ink-faint not-italic">{trend.aside}</span>
              </p>
            )}
            {isBestCore && <p className="mt-2 inline-block rounded-full bg-ink px-3 py-1 font-mono text-[11px] text-white">🏅 New core-task best</p>}
          </div>
        )}

        <p className="eyebrow mb-4">Game scores by skill</p>
        <div className="space-y-3.5">
          {measured.map((c, i) => {
            const v = record.categories[c] as number;
            return (
              <div key={c}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[14px]">
                  <span className="text-ink">{CATEGORY_LABELS[c]}</span>
                  <span className="font-mono text-ink tabular-nums">
                    <CountUp value={v} delay={200 + i * 100} />
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink/6">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-sky via-lavender to-rose"
                    initial={{ width: 0 }}
                    animate={{ width: `${v}%` }}
                    transition={{ duration: 1.1, delay: 0.2 + i * 0.1, ease: [0.2, 0.7, 0.2, 1] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {unmeasured.length > 0 && (
          <p className="mt-4 text-[12.5px] leading-relaxed text-ink-faint">
            <span className="font-mono">Not measured this session:</span> {unmeasured.map((c) => CATEGORY_LABELS[c]).join(", ")}.
          </p>
        )}

        <p className="eyebrow mt-8 mb-2">Scored games</p>
        <ul className="divide-y divide-ink/6">
          {scoredResults.map((r) => (
            <li key={r.id} className="flex items-start gap-3 py-3">
              <span className="mt-0.5 text-base" aria-hidden>
                🧠
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-ink">{r.title}</p>
                <p className="text-[13px] leading-snug text-ink-soft">{r.verdict}</p>
                {r.detail && <p className="mt-0.5 font-mono text-[11px] text-ink-faint">{r.detail}</p>}
              </div>
              <span className="shrink-0 font-mono text-sm text-ink tabular-nums">{r.score}</span>
            </li>
          ))}
        </ul>

        {reflections.length > 0 && (
          <>
            <p className="eyebrow mt-8 mb-2">Reflections · not scored</p>
            <ul className="divide-y divide-ink/6">
              {reflections.map((r) => (
                <li key={r.id} className="flex items-start gap-3 py-3">
                  <span className="mt-0.5 text-base" aria-hidden>
                    {r.kind === "mariana" ? "🌸" : "💭"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-ink">{r.title}</p>
                    <p className="text-[13px] leading-snug text-ink-soft">{r.verdict}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="mt-7 rounded-2xl bg-mist/60 px-4 py-3 text-[12.5px] leading-relaxed text-ink/75">
          Results reflect performance on these games and may vary with practice, tiredness and device conditions. They cannot establish
          neurological maturity. Reaction times include a touchscreen allowance.
        </p>
      </div>
    </div>
  );
}
