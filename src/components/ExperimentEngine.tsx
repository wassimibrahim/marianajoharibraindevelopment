"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, FlaskConical, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { scoreSession, selectFinalExam, selectSession } from "@/experiments/bank";
import type { ChallengeInstance, ChallengeResult, Evaluation } from "@/experiments/types";
import { confettiBurst, launchFireworks } from "@/lib/celebrate";
import { dayKey, now } from "@/lib/dates";
import type { SessionRecord } from "@/lib/storage";
import { Certificate } from "./Certificate";
import { useLab } from "./LabProvider";
import { KindLabel, QuestionCard } from "./QuestionCard";
import { ResultsReport } from "./ResultsReport";
import { ProgressDots } from "./experiments/shared";

type Mode = "idle" | "running" | "verdict" | "report";

interface Report {
  record: SessionRecord;
  results: ChallengeResult[];
  previous?: SessionRecord;
  isBest: boolean;
}

export function ExperimentEngine({ finalRequested, onFinalStarted }: { finalRequested: boolean; onFinalStarted: () => void }) {
  const { state, ready, update } = useLab();
  const [mode, setMode] = useState<Mode>("idle");
  const [isFinal, setIsFinal] = useState(false);
  const [instances, setInstances] = useState<ChallengeInstance[]>([]);
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<ChallengeResult[]>([]);
  const [lastEval, setLastEval] = useState<Evaluation | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [overrideRest, setOverrideRest] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const today = ready ? dayKey(now()) : "";
  const doneToday = state.sessions.some((s) => s.day === today && !s.final);
  const lastSession = state.sessions.filter((s) => !s.final).at(-1);

  const preview = useMemo(() => {
    if (!ready) return [];
    return selectSession(today, state.sessions.length, {
      lastCombo: state.lastCombo,
      previousCombo: state.previousCombo,
      everSeen: state.everSeen,
    });
  }, [ready, today, state.sessions.length, state.lastCombo, state.previousCombo, state.everSeen]);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const start = useCallback(
    (final: boolean) => {
      const list = final ? selectFinalExam(dayKey(now())) : preview;
      setInstances(list);
      setIsFinal(final);
      setIdx(0);
      setResults([]);
      setLastEval(null);
      setReport(null);
      setMode("running");
      window.setTimeout(scrollTop, 50);
    },
    [preview],
  );

  useEffect(() => {
    if (finalRequested && ready) {
      onFinalStarted();
      // Starting the final exam is an explicit request from another section.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      start(true);
    }
  }, [finalRequested, ready, start, onFinalStarted]);

  const current = instances[idx];
  const currentRef = useRef(current);
  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const onChallengeDone = useCallback((e: Evaluation) => {
    const inst = currentRef.current;
    if (!inst) return;
    const r: ChallengeResult = {
      id: inst.def.id,
      title: inst.def.title,
      kind: inst.def.kind,
      category: inst.def.category,
      weight: inst.def.weight,
      score: e.score,
      verdict: e.verdict,
      detail: e.detail,
      reactionMs: e.reactionMs,
    };
    setResults((list) => [...list, r]);
    setLastEval(e);
    setMode("verdict");
  }, []);

  const finish = (all: ChallengeResult[]) => {
    const scores = scoreSession(all);
    const nonFinal = state.sessions.filter((s) => !s.final);
    const previous = isFinal ? undefined : nonFinal.at(-1);
    const best = state.sessions.length ? Math.max(...state.sessions.map((s) => s.overall)) : -1;
    const record: SessionRecord = {
      id: `${Date.now().toString(36)}`,
      date: now().toISOString(),
      day: dayKey(now()),
      overall: scores.overall,
      categories: scores.categories,
      reactions: all.filter((r) => r.reactionMs).map((r) => ({ id: r.id, ms: r.reactionMs as number })),
      completed: all.map((r) => r.id),
      final: isFinal || undefined,
    };
    const isFirst = state.sessions.length === 0;
    const isBest = !isFirst && scores.overall > best;
    const survived = all.some((r) => r.id === "impulse-button" && r.score === 100);

    update((s) => {
      s.sessions.push(record);
      if (!isFinal) {
        s.previousCombo = s.lastCombo;
        s.lastCombo = record.completed;
      }
      s.everSeen = [...new Set([...s.everSeen, ...record.completed])];
      if (survived) s.counters.impulseSurvived += 1;
      if (isFinal) s.finalExam = { date: record.date, score: record.overall };
    });

    setReport({ record, results: all, previous, isBest });
    setMode("report");
    setOverrideRest(false);
    window.setTimeout(scrollTop, 50);

    confettiBurst("classic");
    if (isFirst || isBest || isFinal) window.setTimeout(() => launchFireworks(isFinal ? 1.6 : 1), 600);
  };

  const next = () => {
    if (idx + 1 >= instances.length) {
      finish(results);
      return;
    }
    setIdx(idx + 1);
    setLastEval(null);
    setMode("running");
    window.setTimeout(scrollTop, 30);
  };

  const abort = () => {
    setMode("idle");
    setInstances([]);
  };

  return (
    <div ref={topRef} className="scroll-mt-6">
      <AnimatePresence mode="wait">
        {mode === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            {doneToday && !overrideRest ? (
              <RestCard onIgnore={() => setOverrideRest(true)} last={lastSession} />
            ) : (
              <IntroCard preview={preview} sessionNumber={state.sessions.length + 1} onStart={() => start(false)} />
            )}
          </motion.div>
        )}

        {(mode === "running" || mode === "verdict") && current && (
          <motion.div key="run" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-5 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <span className="eyebrow">
                {isFinal ? "Final examination" : "Experiment"} · {idx + 1}/{instances.length}
              </span>
              <button type="button" onClick={abort} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-faint hover:bg-ink/5" aria-label="Abandon experiment">
                <X size={18} />
              </button>
            </div>
            <div className="mb-6">
              <ProgressDots total={instances.length} index={idx} />
            </div>
            <AnimatePresence mode="wait">
              {mode === "running" ? (
                <motion.div key={`q${idx}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                  <QuestionCard instance={current} onDone={onChallengeDone} />
                </motion.div>
              ) : (
                lastEval && (
                  <Verdict key={`v${idx}`} evaluation={lastEval} kind={current.def.kind} last={idx + 1 >= instances.length} onNext={next} />
                )
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {mode === "report" && report && (
          <motion.div key="report" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <ResultsReport {...report} sessionNumber={state.sessions.length} isFinal={isFinal} />
            {isFinal && <Certificate score={report.record.overall} date={new Date(report.record.date)} />}
            <button type="button" className="btn-soft mx-auto flex" onClick={() => setMode("idle")}>
              <RotateCcw size={16} /> Back to the laboratory
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IntroCard({ preview, sessionNumber, onStart }: { preview: ChallengeInstance[]; sessionNumber: number; onStart: () => void }) {
  const exec = preview.filter((p) => p.def.kind === "executive").length;
  const mari = preview.length - exec;
  return (
    <div className="card overflow-hidden p-6 sm:p-9">
      <div className="pointer-events-none absolute -top-16 -right-16 -z-10 h-48 w-48 rounded-full bg-gradient-to-br from-lilac to-petal blur-2xl" aria-hidden />
      <p className="eyebrow">Session #{sessionNumber} · {preview.length} experiments</p>
      <h3 className="display mt-3 text-[clamp(1.7rem,6.5vw,2.5rem)] leading-tight text-ink">
        Today&apos;s examination has been <em className="text-rose">freshly generated.</em>
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        Drawn from a bank of 34 challenges using today&apos;s date and your experiment history. Some are adapted from real executive-function
        paradigms. Others are not. Refreshing the page will not reroll the questions — researchers anticipated that.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <KindLabel kind="executive" />
        <span className="self-center font-mono text-[11px] text-ink-faint">×{exec}</span>
        <KindLabel kind="mariana" />
        <span className="self-center font-mono text-[11px] text-ink-faint">×{mari}</span>
      </div>
      <ul className="mt-5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {preview.map((p, i) => (
          <li key={p.def.id} className="flex items-center gap-2 text-sm text-ink/80">
            <span className="font-mono text-[11px] text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
            <span aria-hidden>{p.def.kind === "executive" ? "🧠" : "🌸"}</span>
            {i < 2 ? (
              <span>{p.def.title}</span>
            ) : (
              <span className="inline-block h-3.5 rounded-sm bg-ink/75" style={{ width: `${Math.min(11, p.def.title.length * 0.55)}em` }} aria-label="Redacted" />
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 font-mono text-[10.5px] text-ink-faint">Remaining experiments redacted to prevent preparation.</p>
      <button type="button" className="btn-primary mt-7 w-full sm:w-auto" onClick={onStart}>
        <FlaskConical size={18} /> Begin today&apos;s examination
      </button>
      <p className="mt-4 text-[11px] leading-relaxed text-ink-faint">
        The Mariana Executive Function Index™ is not a medical or diagnostic instrument. It is a birthday present with a scoring system.
      </p>
    </div>
  );
}

function RestCard({ onIgnore, last }: { onIgnore: () => void; last?: SessionRecord }) {
  return (
    <div className="card p-6 text-center sm:p-10">
      <motion.div className="mx-auto mb-4 text-5xl" animate={{ rotate: [0, -6, 6, 0] }} transition={{ duration: 4, repeat: Infinity }}>
        🛌
      </motion.div>
      <p className="eyebrow">Status</p>
      <h3 className="display mt-2 text-[clamp(1.6rem,6vw,2.3rem)] font-semibold tracking-tight text-ink">TODAY&apos;S EXAMINATION COMPLETE</h3>
      <p className="mt-3 text-ink-soft italic">&ldquo;Researchers recommend allowing the specimen to rest.&rdquo;</p>
      {last && (
        <p className="mt-4 font-mono text-sm text-ink/70">
          Latest reading: <span className="text-rose">{last.overall}%</span> suspected operational
        </p>
      )}
      <button type="button" className="btn-soft mt-7" onClick={onIgnore}>
        Ignore researchers and test me again <ArrowRight size={16} />
      </button>
    </div>
  );
}

function Verdict({ evaluation, kind, last, onNext }: { evaluation: Evaluation; kind: "executive" | "mariana"; last: boolean; onNext: () => void }) {
  const score = evaluation.score;
  const tone = score === null ? "text-iris" : score >= 75 ? "text-sage" : score >= 50 ? "text-gold" : "text-rose";
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="py-4 text-center">
      <p className="eyebrow">{kind === "executive" ? "Measurement recorded" : "Research note filed"}</p>
      {score !== null ? (
        <motion.p className={`display mt-3 text-7xl font-semibold ${tone}`} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }}>
          {score}
          <span className="text-3xl text-ink-faint">/100</span>
        </motion.p>
      ) : (
        <p className="display mt-3 text-3xl text-iris italic">Not scored — preference, not cognition</p>
      )}
      <p className="display mx-auto mt-4 max-w-md text-[clamp(1.1rem,4.4vw,1.35rem)] leading-snug text-ink">{evaluation.verdict}</p>
      {evaluation.detail && <p className="mx-auto mt-3 max-w-md font-mono text-[12px] text-ink-soft">{evaluation.detail}</p>}
      <button type="button" className="btn-primary mt-8 w-full max-w-xs" onClick={onNext}>
        {last ? "Generate laboratory report" : "Next experiment"} <ArrowRight size={18} />
      </button>
    </motion.div>
  );
}
