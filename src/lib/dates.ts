import { BIRTHDAY_TIMEZONE } from "@/config";

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

export const BIRTH_YEAR = 2002;

/** Offset (ms) of `tz` from UTC at the given instant. */
function tzOffsetMs(at: Date, tz: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/** The instant at which the wall clock in `tz` reads the given date and hour. */
export function zonedInstant(year: number, monthIndex: number, day: number, hour: number, tz: string): Date {
  const guess = Date.UTC(year, monthIndex, day, hour);
  let t = guess - tzOffsetMs(new Date(guess), tz);
  const corrected = guess - tzOffsetMs(new Date(t), tz);
  if (corrected !== t) t = corrected;
  return new Date(t);
}

export const BIRTHDAY_24 = zonedInstant(2026, 8, 25, 0, BIRTHDAY_TIMEZONE);
export const BIRTHDAY_25 = zonedInstant(2027, 8, 25, 0, BIRTHDAY_TIMEZONE);

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

/** Fraction (0–1) of the year between the 24th and 25th birthdays that has elapsed. Real time, not brains. */
export function yearElapsed(d: Date = now()): number {
  const span = BIRTHDAY_25.getTime() - BIRTHDAY_24.getTime();
  return Math.min(1, Math.max(0, (d.getTime() - BIRTHDAY_24.getTime()) / span));
}

/** Age in the birthday time zone. */
export function ageOn(d: Date = now()): number {
  const year = +new Intl.DateTimeFormat("en-US", { timeZone: BIRTHDAY_TIMEZONE, year: "numeric" }).format(d);
  const thisYearsBirthday = zonedInstant(year, 8, 25, 0, BIRTHDAY_TIMEZONE);
  return year - BIRTH_YEAR - (d < thisYearsBirthday ? 1 : 0);
}

export function daysAlive(d: Date = now()): number {
  return Math.floor((d.getTime() - zonedInstant(BIRTH_YEAR, 8, 25, 0, BIRTHDAY_TIMEZONE).getTime()) / 86400000) + 1;
}

export function daysUntilMaturity(d: Date = now()): number {
  return Math.max(0, Math.floor((BIRTHDAY_25.getTime() - d.getTime()) / 86400000));
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatLongDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
