import type { CategoryKey } from "@/experiments/types";

/** Per-task result, stored so a report can be rebuilt after a refresh. */
export interface StoredResult {
  id: string;
  title: string;
  kind: "executive" | "mariana";
  category: CategoryKey;
  scored: boolean;
  score: number | null;
  verdict: string;
  detail?: string;
  reactionMs?: number;
}

export interface SessionRecord {
  id: string;
  /** ISO timestamp of completion. */
  date: string;
  /** Local YYYY-MM-DD. */
  day: string;
  overall: number;
  categories: Partial<Record<CategoryKey, number>>;
  reactions: { id: string; ms: number }[];
  completed: string[];
  final?: boolean;
  /** Core task score: the like-for-like number across sessions. */
  core?: number;
  length?: "short" | "full";
  results?: StoredResult[];
}

export interface LabCounters {
  passportChecks: number;
  evasions: number;
  basitaMaxed: number;
  impulseSurvived: number;
  declassified: number;
  wishes: number;
  bouquet: number;
}

export interface LabState {
  v: 1;
  visits: number;
  firstVisit: string;
  lastVisitDay: string;
  sessions: SessionRecord[];
  lastCombo: string[];
  previousCombo: string[];
  everSeen: string[];
  counters: LabCounters;
  achievements: Record<string, string>;
  basita: number;
  finalExam?: { date: string; score: number };
  /** Has the envelope opening been seen on this device? */
  introSeen?: boolean;
}

const KEY = "mariana-pfc-lab:v1";

export function emptyState(): LabState {
  return {
    v: 1,
    visits: 0,
    firstVisit: new Date().toISOString(),
    lastVisitDay: "",
    sessions: [],
    lastCombo: [],
    previousCombo: [],
    everSeen: [],
    counters: { passportChecks: 0, evasions: 0, basitaMaxed: 0, impulseSurvived: 0, declassified: 0, wishes: 0, bouquet: 0 },
    achievements: {},
    basita: 88,
  };
}

export function loadState(): LabState {
  const base = emptyState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<LabState>;
    return {
      ...base,
      ...parsed,
      counters: { ...base.counters, ...(parsed.counters ?? {}) },
      achievements: { ...(parsed.achievements ?? {}) },
      sessions: dedupeSessions(Array.isArray(parsed.sessions) ? parsed.sessions : []),
    };
  } catch {
    return base;
  }
}

export function saveState(state: LabState): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private mode or storage full: the experiment continues, unrecorded.
  }
}

function dedupeSessions(list: SessionRecord[]): SessionRecord[] {
  const seen = new Set<string>();
  return list
    .filter((s) => s && typeof s.id === "string" && typeof s.overall === "number" && typeof s.date === "string")
    .filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const EXPORT_APP = "mariana-pfc-lab";

export function exportState(state: LabState): string {
  return JSON.stringify({ app: EXPORT_APP, version: 1, exportedAt: new Date().toISOString(), state }, null, 2);
}

/**
 * Merges an exported file into the current state. Never deletes anything:
 * sessions are combined by id, counters and achievements keep the larger value.
 */
export function importState(current: LabState, fileText: string): { state: LabState; added: number } {
  const parsed = JSON.parse(fileText);
  if (!parsed || parsed.app !== EXPORT_APP || !parsed.state || !Array.isArray(parsed.state.sessions)) {
    throw new Error("This doesn't look like a laboratory export file.");
  }
  const incoming = parsed.state as Partial<LabState>;
  const before = current.sessions.length;
  const sessions = dedupeSessions([...current.sessions, ...(incoming.sessions ?? [])]);
  const counters = { ...current.counters };
  for (const k of Object.keys(counters) as (keyof LabCounters)[]) {
    const v = incoming.counters?.[k];
    if (typeof v === "number") counters[k] = Math.max(counters[k], v);
  }
  const achievements = { ...(incoming.achievements ?? {}), ...current.achievements };
  const lastSessions = sessions.filter((s) => !s.final);
  return {
    state: {
      ...current,
      sessions,
      counters,
      achievements,
      visits: Math.max(current.visits, incoming.visits ?? 0),
      firstVisit: [current.firstVisit, incoming.firstVisit].filter(Boolean).sort()[0] as string,
      everSeen: [...new Set([...current.everSeen, ...(incoming.everSeen ?? [])])],
      lastCombo: lastSessions.at(-1)?.completed ?? current.lastCombo,
      previousCombo: lastSessions.at(-2)?.completed ?? current.previousCombo,
      finalExam: current.finalExam ?? incoming.finalExam,
    },
    added: sessions.length - before,
  };
}
