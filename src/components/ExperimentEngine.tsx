"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, FlaskConical, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { scoreSession, selectFinalExam, selectSession, type SessionLength } from "@/experiments/bank";
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
  previousCore?: number;
  isBestCore: boolean;
  sessionNumber: number;
}

function reportFromRecord(record: SessionRecord, all: SessionRecord[]): Report {
  const idx = all.findIndex((s) => s.id === record.id);
  const earlierCores = all.slice(0, idx).map((s) => s.core).filter((v): v is number => typeof v === "number");
  return {
    record,
    results: (record.results ?? []).map((r) => ({ ...r, weight: 1 })),
    previousCore: earlierCores.at(-1),
    isBestCore: typeof record.core === "number" && earlierCores.length > 0 && record.core > Math.max(...earlierCores),
    sessionNumber: idx + 1,
  };
}

export function ExperimentEngine({ finalRequested, onFinalStarted }: { finalRequested: boolean; onFinalStarted: () => void }) {
  const { state, ready, update } = useLab();
  const [mode, setMode] = useState<Mode>("idle");
  const [isFinal, setIsFinal] = useState(false);
  const [length, setLength] = useState<SessionLength>("short");
  const [instances, setInstances] = useState<ChallengeInstance[]>([]);
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<ChallengeResult[]>([]);
  const [lastEval, setLastEval] = useState<Evaluation | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [overrideRest, setOverrideRest] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const saving = useRef(false);

  const today = ready ? dayKey(now()) : "";
  const doneToday = state.sessions.some((s) => s.day === today && !s.final);
  const todays = state.sessions.filter((s) => s.day === today && !s.final).at(-1);

  const history = useMemo(
    () => ({ lastCombo: state.lastCombo, previousCombo: state.previousCombo, everSeen: state.everSeen }),
    [state.lastCombo, state.previousCombo, state.everSeen],
  );
  const preview = useMemo(
    () => (ready ? selectSession(today, state.sessions.length, history, length) : []),
    [ready, today, state.sessions.length, history, length],
  );

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const start = useCallback(
    (final: boolean) => {
      const list = final ? selectFinalExam(dayKey(now())) : preview;
      saving.current = false;
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
      // Starting the final exam is an explicit request from the countdown section.
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
      weight: 1,
      scored: inst.def.scored,
      // Reflection questions are never scored, whatever their commentary says.
      score: inst.def.scored ? e.score : null,
      verdict: e.verdict,
      detail: e.detail,
      reactionMs: e.reactionMs,
    };
    setResults((list) => (list.some((x) => x.id === r.id) ? list : [...list, r]));
    setLastEval({ ...e, score: r.score });
    setMode("verdict");
  }, []);

  const finish = (all: ChallengeResult[]) => {
    if (saving.current) return;
    saving.current = true;
    const scores = scoreSession(all);
    const earlierCores = state.sessions.map((s) => s.core).filter((v): v is number => typeof v === "number");
    const record: SessionRecord = {
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      date: now().toISOString(),
      day: dayKey(now()),
      overall: scores.overall,
      core: scores.core,
      categories: scores.categories,
      reactions: all.filter((r) => r.reactionMs).map((r) => ({ id: r.id, ms: r.reactionMs as number })),
      completed: all.map((r) => r.id),
      final: isFinal || undefined,
      length: isFinal ? undefined : length,
      results: all.map(({ id, title, kind, category, scored, score, verdict, detail, reactionMs }) => ({
        id,
        title,
        kind,
        category,
        scored,
        score,
        verdict,
        detail,
        reactionMs,
      })),
    };
    const isFirst = state.sessions.length === 0;
    const isBestCore = typeof scores.core === "number" && earlierCores.length > 0 && scores.core > Math.max(...earlierCores);
    const survived = all.some((r) => r.id === "impulse-button" && r.score === 100);

    update((s) => {
      if (s.sessions.some((x) => x.id === record.id)) return;
      s.sessions.push(record);
      if (!isFinal) {
        s.previousCombo = s.lastCombo;
        s.lastCombo = record.completed;
      }
      s.everSeen = [...new Set([...s.everSeen, ...record.completed])];
      if (survived) s.counters.impulseSurvived += 1;
      if (isFinal) s.finalExam = { date: record.date, score: record.overall };
    });

    setReport({ record, results: all, previousCore: earlierCores.at(-1), isBestCore, sessionNumber: state.sessions.length + 1 });
    setMode("report");
    setOverrideRest(false);
    window.setTimeout(scrollTop, 50);

    confettiBurst("petals");
    if (isFirst || isBestCore || isFinal) window.setTimeout(() => launchFireworks(isFinal ? 1.3 : 0.8), 600);
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

  const showStored = (record: SessionRecord) => {
    setReport(reportFromRecord(record, state.sessions));
    setIsFinal(!!record.final);
    setMode("report");
    window.setTimeout(scrollTop, 50);
  };

  return (
    <div ref={topRef} className="scroll-mt-6">
      <AnimatePresence mode="wait">
        {mode === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            {!ready ? (
              <div className="h-[420px]" />
            ) : doneToday && !overrideRest ? (
              <RestCard onIgnore={() => setOverrideRest(true)} last={todays} onView={showStored} />
            ) : (
              <IntroCard preview={preview} length={length} onLength={setLength} sessionNumber={state.sessions.length + 1} onStart={() => start(false)} />
            )}
          </motion.div>
        )}

        {(mode === "running" || mode === "verdict") && current && (
          <motion.div key="run" data-lab-busy initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-5 sm:p-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="eyebrow">
                {isFinal ? "Final examination" : "Experiment"} · {idx + 1}/{instances.length}
              </span>
              <button type="button" onClick={abort} className="flex h-11 w-11 items-center justify-center rounded-full text-ink-faint hover:bg-ink/5" aria-label="Leave this session (nothing is saved)">
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
                  <Verdict key={`v${idx}`} evaluation={lastEval} scored={current.def.scored} last={idx + 1 >= instances.length} onNext={next} />
                )
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {mode === "report" && report && (
          <motion.div key="report" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <ResultsReport {...report} isFinal={isFinal} />
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

function IntroCard({
  preview,
  length,
  onLength,
  sessionNumber,
  onStart,
}: {
  preview: ChallengeInstance[];
  length: SessionLength;
  onLength: (l: SessionLength) => void;
  sessionNumber: number;
  onStart: () => void;
}) {
  const scored = preview.filter((p) => p.def.scored).length;
  return (
    <div className="card overflow-hidden p-6 sm:p-9">
      <div className="pointer-events-none absolute -top-16 -right-16 -z-10 h-48 w-48 rounded-full bg-gradient-to-br from-lilac to-petal blur-2xl" aria-hidden />
      <p className="eyebrow">Session {sessionNumber} · freshly generated today</p>
      <h3 className="display mt-3 text-[clamp(1.7rem,6.5vw,2.4rem)] leading-tight text-ink">
        {length === "short" ? "A short session. About three minutes." : "The full session. About seven minutes."}
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        It always starts with the same short <strong className="font-medium text-ink">core task</strong>, so you can compare yourself fairly over time.
        Then come a few rotating games and one reflection question. Timed games offer a practice round first. Refreshing won’t reroll the questions.
      </p>

      <div className="mt-5 inline-flex rounded-full bg-ink/5 p-1" role="radiogroup" aria-label="Session length">
        {(["short", "full"] as const).map((l) => (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={length === l}
            onClick={() => onLength(l)}
            className={`min-h-[44px] rounded-full px-5 text-[13px] whitespace-nowrap transition-colors ${length === l ? "bg-white text-ink shadow-sm" : "text-ink-soft"}`}
          >
            {l === "short" ? "Short · 5" : "Full · 8"}
          </button>
        ))}
      </div>

      <ul className="mt-5 space-y-2">
        {preview.map((p, i) => (
          <li key={p.def.id} className="flex items-center gap-2.5 text-[14px] text-ink/85">
            <span className="w-5 font-mono text-[11px] text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
            <span aria-hidden>{i === 0 ? "⭐" : p.def.scored ? "🧠" : p.def.kind === "mariana" ? "🌸" : "💭"}</span>
            {i === 0 ? (
              <span>
                {p.def.title} <span className="text-ink-faint">· every session</span>
              </span>
            ) : (
              <span className="text-ink-soft">
                {p.def.scored ? "Rotating game" : "Reflection question"} <span className="text-ink-faint">· surprise</span>
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap gap-2">
        <KindLabel kind="executive" />
        <KindLabel kind="executive" scored={false} />
        <KindLabel kind="mariana" />
      </div>

      <button type="button" className="btn-primary mt-7 w-full sm:w-auto" onClick={onStart}>
        <FlaskConical size={18} /> Begin today’s examination
      </button>
      <p className="mt-3 text-[12px] text-ink-faint">{scored} scored games · the rest is for fun.</p>

      <EvasionButton />

      <p className="mt-6 border-t border-dashed border-ink/10 pt-4 text-[12px] leading-relaxed text-ink-soft">
        Results reflect performance on these games and may vary with practice, tiredness and device conditions. They cannot establish
        neurological maturity. The dramatic verdicts are jokes.
      </p>
    </div>
  );
}

const ESCAPE_QUIPS = [
  "Specimen appears to be fleeing.",
  "Please remain still for the examination.",
  "The button is also mature and would prefer not to be pressed.",
  "Evasive manoeuvres noted in the lab book.",
  "One more try. For science.",
];

/** “I am clearly already mature”: it escapes five times, then files a report. */
function EvasionButton() {
  const { update } = useLab();
  const [escapes, setEscapes] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [caught, setCaught] = useState(false);
  const MAX = 5;

  const flee = () => {
    if (caught) return;
    if (escapes >= MAX) {
      setCaught(true);
      update((s) => {
        s.counters.evasions += 1;
      });
      return;
    }
    const x = (escapes % 2 ? -1 : 1) * (40 + Math.random() * 60);
    const y = (Math.random() * 2 - 1) * 14;
    setOffset({ x, y });
    setEscapes((n) => n + 1);
  };

  return (
    <div className="mt-5 flex min-h-[64px] flex-col items-center justify-center gap-1 overflow-hidden sm:items-start">
      {caught ? (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-petal/80 px-4 py-2 font-mono text-[12px] leading-snug text-rose" role="status">
          Attempting to avoid examination has been recorded as evidence.
        </motion.p>
      ) : (
        <>
          <motion.button
            type="button"
            className="min-h-[44px] rounded-full px-4 text-[13px] text-ink-soft underline decoration-dotted underline-offset-4"
            animate={{ x: offset.x, y: offset.y }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            onPointerEnter={(e) => e.pointerType === "mouse" && escapes < MAX && flee()}
            onPointerDown={(e) => {
              if (escapes < MAX) {
                e.preventDefault();
                flee();
              }
            }}
            onClick={() => escapes >= MAX && flee()}
          >
            I am clearly already mature
          </motion.button>
          {escapes > 0 && <p className="font-mono text-[10.5px] text-ink-faint">{ESCAPE_QUIPS[Math.min(escapes - 1, ESCAPE_QUIPS.length - 1)]}</p>}
        </>
      )}
    </div>
  );
}

function RestCard({ onIgnore, last, onView }: { onIgnore: () => void; last?: SessionRecord; onView: (r: SessionRecord) => void }) {
  return (
    <div className="card p-6 text-center sm:p-10">
      <div className="mx-auto mb-4 text-5xl" aria-hidden>
        🛌
      </div>
      <p className="eyebrow">Status</p>
      <h3 className="display mt-2 text-[clamp(1.6rem,6vw,2.3rem)] font-semibold tracking-tight text-ink">TODAY’S EXAMINATION COMPLETE</h3>
      <p className="mt-3 text-ink-soft italic">“Researchers recommend allowing the specimen to rest.”</p>
      {last && (
        <p className="mt-4 text-[14px] text-ink/75">
          {typeof last.core === "number" ? <>Core task {last.core}/100 · </> : null}Game score {last.overall}/100
        </p>
      )}
      <div className="mt-7 flex flex-col items-center gap-3">
        {last?.results?.length ? (
          <button type="button" className="btn-primary" onClick={() => onView(last)}>
            View today’s report
          </button>
        ) : null}
        <button type="button" className="btn-soft px-4 text-[14px]" onClick={onIgnore}>
          Ignore researchers and test me again <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function Verdict({ evaluation, scored, last, onNext }: { evaluation: Evaluation; scored: boolean; last: boolean; onNext: () => void }) {
  const score = evaluation.score;
  const tone = score === null ? "text-iris" : score >= 75 ? "text-sage" : score >= 50 ? "text-gold" : "text-rose";
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="py-4 text-center">
      <p className="eyebrow">{scored ? "Game result" : "Reflection noted"}</p>
      {scored && score !== null ? (
        <motion.p className={`display mt-3 text-7xl font-semibold ${tone}`} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }}>
          {score}
          <span className="text-3xl text-ink-faint">/100</span>
        </motion.p>
      ) : (
        <p className="display mt-3 text-2xl text-iris italic">No score — there’s no right answer here.</p>
      )}
      <p className="display mx-auto mt-4 max-w-md text-[clamp(1.1rem,4.4vw,1.35rem)] leading-snug text-ink">
        {!scored && <span className="mb-1 block font-mono text-[10.5px] tracking-widest text-ink-faint not-italic">LABORATORY COMMENTARY</span>}
        {evaluation.verdict}
      </p>
      {evaluation.detail && <p className="mx-auto mt-3 max-w-md font-mono text-[12px] text-ink-soft">{evaluation.detail}</p>}
      <button type="button" className="btn-primary mt-8 w-full max-w-xs" onClick={onNext}>
        {last ? "See the laboratory report" : "Next"} <ArrowRight size={18} />
      </button>
    </motion.div>
  );
}
