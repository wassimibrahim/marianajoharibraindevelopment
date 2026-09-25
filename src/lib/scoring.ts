export const clamp = (v: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));

export function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Touch screens add latency (and thumbs are slower than mice). */
export function deviceAllowanceMs(): number {
  if (typeof window === "undefined") return 0;
  return window.matchMedia?.("(pointer: coarse)").matches ? 140 : 0;
}

/**
 * Converts a reaction time into a 0–100 score with generous, device-aware bands.
 * Anything at or under `fast` earns full marks; `slow` earns 55; beyond that it
 * tapers towards 25. Speed is never allowed to dominate accuracy.
 */
export function speedScore(ms: number, fast: number, slow: number): number {
  const allowance = deviceAllowanceMs();
  const f = fast + allowance;
  const s = slow + allowance;
  if (ms <= f) return 100;
  if (ms <= s) return 100 - ((ms - f) / (s - f)) * 45;
  return clamp(55 - ((ms - s) / s) * 30, 25, 55);
}

export interface Band {
  min: number;
  label: string;
  tone: string;
}

export const RESULT_BANDS: Band[] = [
  { min: 90, label: "MARIANA MAY ACTUALLY BE AN ADULT", tone: "from-amber-200 via-rose-200 to-violet-200" },
  { min: 75, label: "DISTURBINGLY RESPONSIBLE", tone: "from-sky-200 via-violet-200 to-rose-200" },
  { min: 60, label: "PROMISING BUT UNSUPERVISED", tone: "from-rose-200 via-pink-100 to-amber-100" },
  { min: 40, label: "NEURAL ACTIVITY DETECTED", tone: "from-violet-200 via-sky-100 to-rose-100" },
  { min: 0, label: "FRONTAL LOBE HAS LEFT THE CHAT", tone: "from-stone-200 via-rose-100 to-violet-100" },
];

export function bandFor(score: number): Band {
  return RESULT_BANDS.find((b) => score >= b.min) ?? RESULT_BANDS[RESULT_BANDS.length - 1];
}
