"use client";

import { useEffect, useState } from "react";
import { now } from "./dates";

/** A live clock. Returns null until mounted so server and client markup match. */
export function useNow(intervalMs = 1000): Date | null {
  const [t, setT] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setT(now());
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return t;
}
