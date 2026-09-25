"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/celebrate";

export function useCountUp(target: number, durationMs = 1400, delayMs = 0): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    let startAt = 0;
    const tick = (t: number) => {
      if (!startAt) startAt = t + delayMs;
      const p = Math.min(1, Math.max(0, (t - startAt) / durationMs));
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, delayMs]);
  return value;
}

export function CountUp({ value, duration, delay }: { value: number; duration?: number; delay?: number }) {
  return <>{useCountUp(value, duration, delay)}</>;
}
