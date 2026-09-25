import type { CategoryKey } from "@/experiments/types";

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
}

export interface LabCounters {
  passportChecks: number;
  evasions: number;
  basitaMaxed: number;
  impulseSurvived: number;
  declassified: number;
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
    counters: { passportChecks: 0, evasions: 0, basitaMaxed: 0, impulseSurvived: 0, declassified: 0 },
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
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
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
