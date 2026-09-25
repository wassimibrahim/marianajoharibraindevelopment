import { createRng, hashString, type Rng } from "@/lib/rng";
import { choiceChallenges } from "./choices";
import { interactiveChallenges } from "./interactive";
import { marianaChallenges } from "./mariana";
import {
  SCORED_CATEGORIES,
  type CategoryKey,
  type ChallengeDef,
  type ChallengeInstance,
  type ChallengeResult,
} from "./types";

/**
 * The full experiment bank. To add an experiment, add a ChallengeDef to one of
 * the source files — the selector and report pick it up automatically.
 */
export const BANK: ChallengeDef[] = [...interactiveChallenges, ...choiceChallenges, ...marianaChallenges];

export interface SelectionHistory {
  lastCombo: string[];
  previousCombo: string[];
  everSeen: string[];
}

function baseWeight(def: ChallengeDef, h: SelectionHistory): number {
  if (h.lastCombo.includes(def.id)) return 0.2;
  if (h.previousCombo.includes(def.id)) return 0.55;
  if (!h.everSeen.includes(def.id)) return 1.5;
  return 1;
}

function draw(pool: ChallengeDef[], count: number, rng: Rng, h: SelectionHistory, taken: ChallengeDef[]) {
  const picked: ChallengeDef[] = [];
  const available = [...pool];
  while (picked.length < count && available.length) {
    const usedCats = new Set([...taken, ...picked].map((d) => d.category));
    const choice = rng.weighted(available, (d) => baseWeight(d, h) * (usedCats.has(d.category) ? 0.25 : 1));
    picked.push(choice);
    available.splice(available.indexOf(choice), 1);
  }
  return picked;
}

export type SessionLength = "short" | "full";

const instantiate = (seed: string, defs: ChallengeDef[]): ChallengeInstance[] =>
  defs.map((def) => ({ def, spec: def.generate(createRng(hashString(`${seed}:${def.id}`))) }));

export const CORE_ID = "stroop";

/**
 * Deterministic, date-aware session selection: the same day + session number
 * always yields the same experiment (refreshing does not reroll the questions),
 * while consecutive sessions are steered away from repeating themselves.
 *
 * Every session opens with the same short core task (comparable over time),
 * followed by rotating scored challenges and one unscored reflection question.
 * Short ≈ 3 minutes; full is the extended version.
 */
export function selectSession(
  day: string,
  sessionNumber: number,
  history: SelectionHistory,
  length: SessionLength = "short",
): ChallengeInstance[] {
  const seed = `${day}#${sessionNumber}`;
  const rng = createRng(seed);
  const core = BANK.find((d) => d.id === CORE_ID)!;
  const interactive = BANK.filter((d) => d.scored && d.interactive && !d.core);
  const choice = BANK.filter((d) => d.scored && !d.interactive);
  const reflections = BANK.filter((d) => !d.scored);
  const counts = length === "short" ? { interactive: 2, choice: 1, reflection: 1 } : { interactive: 3, choice: 2, reflection: 2 };

  let rotating: ChallengeDef[] = [];
  for (let attempt = 0; attempt < 6; attempt++) {
    const a = draw(interactive, counts.interactive, rng, history, [core]);
    const b = draw(choice, counts.choice, rng, history, [core, ...a]);
    const c = draw(reflections, counts.reflection, rng, history, []);
    rotating = [...a, ...b, ...c];
    const key = [CORE_ID, ...rotating.map((d) => d.id)].sort().join("|");
    if (key !== [...history.lastCombo].sort().join("|")) break;
  }

  // Core first; keep the reflection away from the very end so the session finishes on a game.
  const ordered = rng.shuffle(rotating);
  const lastScored = [...ordered].reverse().find((d) => d.scored);
  if (lastScored && !ordered[ordered.length - 1].scored) {
    ordered.splice(ordered.indexOf(lastScored), 1);
    ordered.push(lastScored);
  }
  return instantiate(seed, [core, ...ordered]);
}

/** The longer final examination: the core task, one scored game per category, and one reflection. */
export function selectFinalExam(day: string): ChallengeInstance[] {
  const seed = `final#${day}`;
  const rng = createRng(seed);
  const core = BANK.find((d) => d.id === CORE_ID)!;
  const defs: ChallengeDef[] = [];
  for (const cat of SCORED_CATEGORIES) {
    const options = BANK.filter((d) => d.scored && !d.core && d.category === cat);
    if (options.length) defs.push(rng.pick(options));
  }
  defs.push(BANK.find((d) => d.id === "passport-immigration")!);
  return instantiate(seed, [core, ...rng.shuffle(defs)]);
}

export interface SessionScores {
  /** Average of the scored games this session. Not a measure of anything neurological. */
  overall: number;
  /** Core task score, the only number that is comparable between sessions. */
  core?: number;
  categories: Partial<Record<CategoryKey, number>>;
}

export function scoreSession(results: ChallengeResult[]): SessionScores {
  const scored = results.filter((r) => r.scored && r.score !== null);
  const overall = scored.length ? Math.round(scored.reduce((s, r) => s + (r.score as number), 0) / scored.length) : 0;
  const core = results.find((r) => r.id === CORE_ID)?.score ?? undefined;

  const categories: Partial<Record<CategoryKey, number>> = {};
  for (const cat of SCORED_CATEGORIES) {
    const inCat = scored.filter((r) => r.category === cat);
    if (inCat.length) categories[cat] = Math.round(inCat.reduce((s, r) => s + (r.score as number), 0) / inCat.length);
  }
  return { overall, core: core === null ? undefined : core, categories };
}
