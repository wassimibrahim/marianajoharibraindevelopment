"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/celebrate";

const PETAL_COLORS = ["#f7b3c8", "#fbd3df", "#c9b8f0", "#bfddf5", "#f4e1a1", "#ffb3a8"];
const MAX_ALIVE = 22;

/** Pointer and touch movement releases a few drifting petals. Cheap: pure CSS. */
export function PetalTrail() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let alive = 0;
    let last = 0;

    const spawn = (x: number, y: number) => {
      if (alive >= MAX_ALIVE) return;
      const el = document.createElement("span");
      el.className = "petal-trail";
      const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.background = `linear-gradient(135deg, ${color}, #ffffff)`;
      el.style.setProperty("--r0", `${Math.random() * 360}deg`);
      el.style.setProperty("--r1", `${Math.random() * 720 - 360}deg`);
      el.style.setProperty("--dx", `${Math.random() * 60 - 30}px`);
      el.style.setProperty("--dy", `${40 + Math.random() * 60}px`);
      document.body.appendChild(el);
      alive++;
      el.addEventListener(
        "animationend",
        () => {
          el.remove();
          alive--;
        },
        { once: true },
      );
    };

    const onMove = (e: PointerEvent) => {
      const t = performance.now();
      if (t - last < (e.pointerType === "touch" ? 90 : 55)) return;
      last = t;
      spawn(e.clientX, e.clientY);
    };
    const onDown = (e: PointerEvent) => {
      for (let i = 0; i < 3; i++) spawn(e.clientX + (Math.random() - 0.5) * 16, e.clientY + (Math.random() - 0.5) * 16);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);
  return null;
}
