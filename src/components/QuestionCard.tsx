"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChallengeInstance, ChallengeSpec, Evaluation } from "@/experiments/types";
import { CATEGORY_LABELS } from "@/experiments/types";
import { ChoiceTest } from "./experiments/ChoiceTest";
import { DigitSpanTest } from "./experiments/DigitSpanTest";
import { EstimateTest } from "./experiments/EstimateTest";
import { GoNoGoTest } from "./experiments/GoNoGoTest";
import { ImpulseTest } from "./experiments/ImpulseTest";
import { MarshmallowTest } from "./experiments/MarshmallowTest";
import { MemoryTest } from "./experiments/MemoryTest";
import { OrderTest } from "./experiments/OrderTest";
import { ReactionTest } from "./experiments/ReactionTest";
import { SearchTest } from "./experiments/SearchTest";
import { SortingTest } from "./experiments/SortingTest";
import { StroopTest } from "./experiments/StroopTest";
import { TaskSwitchTest } from "./experiments/TaskSwitchTest";

const TIMED = new Set<ChallengeSpec["type"]>(["impulse", "stroop", "memory", "digits", "reaction", "gonogo", "sorting", "taskswitch", "search", "marshmallow"]);

/** Unscored warm-up versions of the unfamiliar timed tasks. */
function practiceSpec(spec: ChallengeSpec): ChallengeSpec | null {
  switch (spec.type) {
    case "stroop":
      return { ...spec, trials: spec.trials.slice(0, 3) };
    case "gonogo":
      return { ...spec, stimuli: ["go", "go", "nogo", "go"] };
    case "taskswitch":
      return { ...spec, trials: spec.trials.slice(0, 4) };
    case "reaction":
      return { ...spec, delays: [1600] };
    case "sorting":
      return { ...spec, cards: spec.cards.slice(0, 3), switchAt: 99 };
    default:
      return null;
  }
}

export function KindLabel({ kind, scored }: { kind: "executive" | "mariana"; scored?: boolean }) {
  if (kind === "mariana") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-petal px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-rose">
        🌸 Mariana research question
      </span>
    );
  }
  return scored === false ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-lilac px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-iris">
      💭 Reflection · not scored
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-cobalt">
      🧠 Executive-function task
    </span>
  );
}

type Stage = "offer" | "practice" | "practiced" | "real";

export function QuestionCard({ instance, onDone }: { instance: ChallengeInstance; onDone: (e: Evaluation) => void }) {
  const { def, spec } = instance;
  const practice = useMemo(() => practiceSpec(spec), [spec]);
  const [stage, setStage] = useState<Stage>(practice ? "offer" : "real");
  const [attempt, setAttempt] = useState(0);
  const [interrupted, setInterrupted] = useState(false);
  const timed = TIMED.has(spec.type);

  // Leaving the app mid-task would distort the timing, so timed tasks restart cleanly instead.
  useEffect(() => {
    if (!timed) return;
    const onVis = () => {
      if (document.hidden) {
        setAttempt((a) => a + 1);
        setInterrupted(true);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [timed]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <KindLabel kind={def.kind} scored={def.scored} />
        {def.scored && <span className="font-mono text-[10.5px] tracking-wide text-ink-faint">{CATEGORY_LABELS[def.category]}</span>}
      </div>
      <h3 className="display mb-1 text-[clamp(1.5rem,6vw,2rem)] leading-tight font-medium text-ink">{def.title}</h3>
      {def.instructions && <p className="text-[15px] text-ink-soft">{def.instructions}</p>}
      <p className="mt-2 mb-5 text-[12.5px] leading-snug text-ink-faint">
        <span className="font-mono tracking-wide">{def.scored ? "How it’s scored: " : "Not scored: "}</span>
        {def.scoring}
      </p>

      {interrupted && (
        <p className="mb-4 rounded-2xl bg-champagne/60 px-4 py-2.5 text-[13px] text-ink/80" role="status">
          You left the app, so this timed task restarted. Nothing counts against you.
        </p>
      )}

      {stage === "offer" && practice && (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/70 px-5 py-6 text-center">
          <p className="text-[15px] text-ink-soft">New to this one? Try a quick practice round first. It isn’t scored.</p>
          <button type="button" className="btn-primary w-full max-w-xs" onClick={() => setStage("practice")}>
            Practice round
          </button>
          <button type="button" className="btn-soft w-full max-w-xs" onClick={() => setStage("real")}>
            Skip to the real one
          </button>
        </div>
      )}

      {stage === "practice" && practice && (
        <div>
          <p className="mb-3 text-center font-mono text-[11px] tracking-[0.2em] text-iris">PRACTICE ROUND · NOT SCORED</p>
          <Body key={`p${attempt}`} spec={practice} onDone={() => setStage("practiced")} />
        </div>
      )}

      {stage === "practiced" && (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/70 px-5 py-6 text-center">
          <p className="display text-xl text-ink">Practice done. That one didn’t count.</p>
          <p className="text-[14px] text-ink-soft">Same rules, a few more rounds.</p>
          <button type="button" className="btn-primary w-full max-w-xs" onClick={() => setStage("real")}>
            Start the real one
          </button>
          <button type="button" className="min-h-[44px] text-[13px] text-ink-soft underline decoration-dotted underline-offset-4" onClick={() => setStage("practice")}>
            Practice again
          </button>
        </div>
      )}

      {stage === "real" && <Body key={`r${attempt}`} spec={spec} onDone={onDone} />}
    </div>
  );
}
function Body({ spec, onDone }: { spec: ChallengeInstance["spec"]; onDone: (e: Evaluation) => void }) {
  switch (spec.type) {
    case "choice":
      return <ChoiceTest spec={spec} onDone={onDone} />;
    case "impulse":
      return <ImpulseTest spec={spec} onDone={onDone} />;
    case "stroop":
      return <StroopTest spec={spec} onDone={onDone} />;
    case "memory":
      return <MemoryTest spec={spec} onDone={onDone} />;
    case "digits":
      return <DigitSpanTest spec={spec} onDone={onDone} />;
    case "reaction":
      return <ReactionTest spec={spec} onDone={onDone} />;
    case "gonogo":
      return <GoNoGoTest spec={spec} onDone={onDone} />;
    case "sorting":
      return <SortingTest spec={spec} onDone={onDone} />;
    case "taskswitch":
      return <TaskSwitchTest spec={spec} onDone={onDone} />;
    case "search":
      return <SearchTest spec={spec} onDone={onDone} />;
    case "marshmallow":
      return <MarshmallowTest spec={spec} onDone={onDone} />;
    case "order":
      return <OrderTest spec={spec} onDone={onDone} />;
    case "estimate":
      return <EstimateTest spec={spec} onDone={onDone} />;
  }
}
