import { createRng, hashString, type Rng } from "@/lib/rng";
import { choiceChallenges } from "./choices";
import { interactiveChallenges } from "./interactive";
import { marianaChallenges } from "./mariana";
import {
  CATEGORY_ORDER,
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

/**
 * Deterministic, date-aware session selection: the same day + session number
 * always yields the same experiment (refreshing does not reroll the questions),
 * while consecutive sessions are steered away from repeating themselves.
 */
export function selectSession(day: string, sessionNumber: number, history: SelectionHistory): ChallengeInstance[] {
  const seed = `${day}#${sessionNumber}`;
  const rng = createRng(seed);
  const size = rng.pick([5, 6, 6, 7, 7, 8]);
  const marianaCount = size >= 7 && rng.chance(0.5) ? 2 : 1;
  const executiveCount = size - marianaCount;
  const interactiveCount = Math.min(executiveCount - 1, Math.ceil(executiveCount / 2) + (rng.chance(0.4) ? 1 : 0));

  const interactive = BANK.filter((d) => d.kind === "executive" && d.interactive);
  const choice = BANK.filter((d) => d.kind === "executive" && !d.interactive);
  const mariana = BANK.filter((d) => d.kind === "mariana");

  let defs: ChallengeDef[] = [];
  for (let attempt = 0; attempt < 6; attempt++) {
    const a = draw(interactive, interactiveCount, rng, history, []);
    const b = draw(choice, executiveCount - interactiveCount, rng, history, a);
    const c = draw(mariana, marianaCount, rng, history, []);
    defs = [...a, ...b, ...c];
    const key = defs.map((d) => d.id).sort().join("|");
    if (key !== [...history.lastCombo].sort().join("|")) break;
  }

  // Interleave so the session alternates between tapping and thinking,
  // and never opens with a joke question.
  const ordered = rng.shuffle(defs);
  const firstSerious = ordered.findIndex((d) => d.kind === "executive");
  if (firstSerious > 0) ordered.unshift(...ordered.splice(firstSerious, 1));

  return ordered.map((def) => ({ def, spec: def.generate(createRng(hashString(`${seed}:${def.id}`))) }));
}

/** The longer final examination: one task from every executive category. */
export function selectFinalExam(day: string): ChallengeInstance[] {
  const seed = `final#${day}`;
  const rng = createRng(seed);
  const defs: ChallengeDef[] = [];
  for (const cat of CATEGORY_ORDER) {
    const options = BANK.filter((d) => d.kind === "executive" && d.category === cat);
    if (options.length) defs.push(rng.pick(options));
  }
  const bonus = BANK.filter((d) => d.kind === "executive" && d.interactive && !defs.includes(d));
  defs.push(rng.pick(bonus));
  defs.push(BANK.find((d) => d.id === "passport-immigration")!);
  return rng.shuffle(defs).map((def) => ({ def, spec: def.generate(createRng(hashString(`${seed}:${def.id}`))) }));
}

export interface SessionScores {
  overall: number;
  categories: Partial<Record<CategoryKey, number>>;
}

export function scoreSession(results: ChallengeResult[]): SessionScores {
  const scored = results.filter((r) => r.score !== null);
  const totalWeight = scored.reduce((s, r) => s + r.weight, 0);
  const overall = totalWeight
    ? Math.round(scored.reduce((s, r) => s + (r.score as number) * r.weight, 0) / totalWeight)
    : 0;

  const categories: Partial<Record<CategoryKey, number>> = {};
  for (const cat of CATEGORY_ORDER) {
    const inCat = scored.filter((r) => r.category === cat && r.kind === "executive");
    if (inCat.length) categories[cat] = Math.round(inCat.reduce((s, r) => s + (r.score as number), 0) / inCat.length);
  }
  return { overall, categories };
}
