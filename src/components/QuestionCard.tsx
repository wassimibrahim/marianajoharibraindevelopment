"use client";

import type { ChallengeInstance, Evaluation } from "@/experiments/types";
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

export function KindLabel({ kind }: { kind: "executive" | "mariana" }) {
  return kind === "executive" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-cobalt">
      🧠 Executive-function task
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-petal px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-rose">
      🌸 Mariana research question
    </span>
  );
}

export function QuestionCard({ instance, onDone }: { instance: ChallengeInstance; onDone: (e: Evaluation) => void }) {
  const { def, spec } = instance;
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <KindLabel kind={def.kind} />
        {def.kind === "executive" && <span className="font-mono text-[10.5px] tracking-wide text-ink-faint">{CATEGORY_LABELS[def.category]}</span>}
      </div>
      <h3 className="display mb-1 text-[clamp(1.5rem,6vw,2rem)] leading-tight font-medium text-ink">{def.title}</h3>
      {def.instructions && <p className="mb-5 text-[15px] text-ink-soft">{def.instructions}</p>}
      {!def.instructions && <div className="mb-4" />}
      <Body spec={spec} onDone={onDone} />
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
