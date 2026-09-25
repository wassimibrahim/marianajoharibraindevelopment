/**
 * All the calendar logic for the laboratory.
 *
 * Every date is interpreted in the viewer's local time zone: the 25th birthday
 * begins at local midnight on 25 September 2027, wherever Mariana happens to be
 * stuck at immigration.
 *
 * For testing, append `?now=2027-09-24T23:59:50` to the URL. The clock then
 * starts at that instant and keeps ticking in real time.
 */

export const BIRTH_DATE = new Date(2002, 8, 25, 0, 0, 0);
export const BIRTHDAY_24 = new Date(2026, 8, 25, 0, 0, 0);
export const BIRTHDAY_25 = new Date(2027, 8, 25, 0, 0, 0);

let offsetMs: number | null = null;

function resolveOffset(): number {
  if (offsetMs !== null) return offsetMs;
  offsetMs = 0;
  if (typeof window !== "undefined") {
    const raw = new URLSearchParams(window.location.search).get("now");
    if (raw) {
      const parsed = new Date(raw);
      if (!Number.isNaN(parsed.getTime())) offsetMs = parsed.getTime() - Date.now();
    }
  }
  return offsetMs;
}

export function now(): Date {
  return new Date(Date.now() + resolveOffset());
}

export function dayKey(d: Date = now()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface CountdownParts {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  arrived: boolean;
}

export function countdownTo(target: Date, from: Date = now()): CountdownParts {
  const total = Math.max(0, target.getTime() - from.getTime());
  const s = Math.floor(total / 1000);
  return {
    total,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    arrived: total === 0,
  };
}

/**
 * The (entirely made-up) prefrontal cortex development percentage.
 * Starts at 96% on the 24th birthday and approaches — but never reaches —
 * 100% on the 25th. Certification requires behavioural evidence, not a date.
 */
export function frontalLobeProgress(d: Date = now()): number {
  const span = BIRTHDAY_25.getTime() - BIRTHDAY_24.getTime();
  const frac = Math.min(1, Math.max(0, (d.getTime() - BIRTHDAY_24.getTime()) / span));
  const eased = 1 - Math.pow(1 - frac, 1.4);
  return Math.min(99.99, 96 + eased * 3.99);
}

export function ageOn(d: Date = now()): number {
  let age = d.getFullYear() - BIRTH_DATE.getFullYear();
  const hadBirthday =
    d.getMonth() > BIRTH_DATE.getMonth() ||
    (d.getMonth() === BIRTH_DATE.getMonth() && d.getDate() >= BIRTH_DATE.getDate());
  if (!hadBirthday) age -= 1;
  return age;
}

export function daysAlive(d: Date = now()): number {
  const start = Date.UTC(BIRTH_DATE.getFullYear(), BIRTH_DATE.getMonth(), BIRTH_DATE.getDate());
  const end = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((end - start) / 86400000) + 1;
}

export function daysUntilMaturity(d: Date = now()): number {
  return Math.max(0, Math.floor((BIRTHDAY_25.getTime() - d.getTime()) / 86400000));
}

export function isBirthday(d: Date = now()): boolean {
  return d.getMonth() === 8 && d.getDate() === 25;
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatLongDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
