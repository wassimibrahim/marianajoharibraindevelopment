import type { Rng } from "@/lib/rng";

export type Kind = "executive" | "mariana";

export type CategoryKey =
  | "impulse"
  | "delay"
  | "inhibition"
  | "memory"
  | "attention"
  | "flexibility"
  | "planning"
  | "risk"
  | "decision"
  | "emotion"
  | "reasoning";

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  impulse: "Impulse Control",
  delay: "Delayed Gratification",
  inhibition: "Inhibition",
  memory: "Working Memory",
  attention: "Attention",
  flexibility: "Cognitive Flexibility",
  planning: "Planning",
  risk: "Risk Calibration",
  decision: "Decision-Making",
  emotion: "Emotional Regulation",
  reasoning: "Reasoning",
};

export const CATEGORY_ORDER: CategoryKey[] = [
  "impulse",
  "delay",
  "inhibition",
  "memory",
  "attention",
  "flexibility",
  "planning",
  "risk",
  "decision",
  "reasoning",
  "emotion",
];

/** Categories that come from tasks with a defensible correct answer. */
export const SCORED_CATEGORIES: CategoryKey[] = [
  "impulse",
  "delay",
  "inhibition",
  "memory",
  "attention",
  "flexibility",
  "planning",
  "reasoning",
];

export interface Evaluation {
  /** 0–100, or null when the answer is a matter of taste rather than skill. */
  score: number | null;
  verdict: string;
  detail?: string;
  reactionMs?: number;
}

export interface Opt {
  id: string;
  label: string;
  emoji?: string;
}

export type StroopColor = "red" | "blue" | "green" | "purple" | "orange";
export type Shape = "circle" | "star";
export type SortColor = "pink" | "blue";

export interface StroopTrial {
  word: StroopColor;
  ink: StroopColor;
}

export interface SortCard {
  shape: Shape;
  color: SortColor;
}

export interface SwitchTrial {
  n: number;
  rule: "parity" | "magnitude";
}

export interface SearchRound {
  cols: number;
  cells: number;
  target: string;
  distractor: string;
  index: number;
}

export type ChallengeSpec =
  | {
      type: "choice";
      prompt: string;
      context?: string;
      visual?: string;
      options: Opt[];
      followUp?: { prompt: string; options: Opt[] };
      evaluate: (choice: string, follow?: string) => Evaluation;
    }
  | {
      type: "impulse";
      seconds: number;
      evaluate: (m: { pressedAtMs: number | null }) => Evaluation;
    }
  | {
      type: "stroop";
      trials: StroopTrial[];
      evaluate: (m: { correct: number; total: number; medianRt: number }) => Evaluation;
    }
  | {
      type: "memory";
      sequence: string[];
      pool: string[];
      showMs: number;
      evaluate: (m: { answer: string[] }) => Evaluation;
    }
  | {
      type: "digits";
      digits: number[];
      stepMs: number;
      backwards: boolean;
      evaluate: (m: { answer: number[] }) => Evaluation;
    }
  | {
      type: "reaction";
      delays: number[];
      evaluate: (m: { times: number[]; falseStarts: number }) => Evaluation;
    }
  | {
      type: "gonogo";
      stimuli: ("go" | "nogo")[];
      windowMs: number;
      evaluate: (m: {
        hits: number;
        misses: number;
        falseAlarms: number;
        correctRejections: number;
        medianRt: number;
      }) => Evaluation;
    }
  | {
      type: "sorting";
      cards: SortCard[];
      firstRule: "color" | "shape";
      switchAt: number;
      evaluate: (m: { errorsBefore: number; errorsAfter: number; adapted: boolean }) => Evaluation;
    }
  | {
      type: "taskswitch";
      trials: SwitchTrial[];
      evaluate: (m: { correct: number; total: number; medianRt: number; switchCost: number }) => Evaluation;
    }
  | {
      type: "search";
      rounds: SearchRound[];
      evaluate: (m: { times: number[]; errors: number }) => Evaluation;
    }
  | {
      type: "marshmallow";
      waitSec: number;
      now: number;
      later: number;
      evaluate: (m: { waited: boolean; tookAtMs: number }) => Evaluation;
    }
  | {
      type: "order";
      prompt: string;
      context?: string;
      items: Opt[];
      evaluate: (order: string[]) => Evaluation;
    }
  | {
      type: "estimate";
      anchorPrompt: string;
      estimatePrompt: string;
      min: number;
      max: number;
      step: number;
      unit: string;
      evaluate: (m: { anchorAnswer: "higher" | "lower"; estimate: number }) => Evaluation;
    };

export type SpecType = ChallengeSpec["type"];

export interface ChallengeDef {
  id: string;
  title: string;
  kind: Kind;
  category: CategoryKey;
  /** Kept for backwards compatibility with saved results; scoring is unweighted. */
  weight: number;
  interactive: boolean;
  /**
   * true: objective task with a defensible correct answer, counts towards the game score.
   * false: reflection question (preferences, emotions, personal choices) — never scored.
   */
  scored: boolean;
  /** The short comparable task that runs every session. */
  core?: boolean;
  /** One plain sentence explaining how this task is scored (or why it isn't). */
  scoring: string;
  instructions?: string;
  generate: (rng: Rng) => ChallengeSpec;
}

export interface ChallengeInstance {
  def: ChallengeDef;
  spec: ChallengeSpec;
}

export interface ChallengeResult {
  id: string;
  title: string;
  kind: Kind;
  category: CategoryKey;
  weight: number;
  scored: boolean;
  score: number | null;
  verdict: string;
  detail?: string;
  reactionMs?: number;
}
