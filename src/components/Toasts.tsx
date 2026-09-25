"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { EMPLOYMENT_NEWS } from "@/content/lab";
import { daysAlive, now } from "@/lib/dates";
import { useLab } from "./LabProvider";

/** Renders toasts and occasionally slips in employment "breaking news". */
export function Toasts({ enabled }: { enabled: boolean }) {
  const { toasts, dismiss, notify } = useLab();
  const shown = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const order = [...EMPLOYMENT_NEWS].sort(() => Math.random() - 0.5);
    let timer: number;
    const schedule = (delay: number) => {
      timer = window.setTimeout(() => {
        if (shown.current >= 4) return;
        if (!document.hidden) {
          const n = order[shown.current % order.length];
          notify({ icon: n.icon, title: n.title, body: n.body.replace("{days}", daysAlive(now()).toLocaleString("en-GB")), tone: "news" });
          shown.current++;
        }
        schedule(50_000 + Math.random() * 50_000);
      }, delay);
    };
    schedule(22_000);
    return () => window.clearTimeout(timer);
  }, [enabled, notify]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex flex-col items-center gap-2 px-3 pt-[max(12px,env(safe-area-inset-top))]" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-[22px] border px-4 py-3 shadow-lift backdrop-blur-xl ${
              t.tone === "achievement" ? "border-gold/40 bg-gradient-to-br from-white/95 to-champagne/90" : "border-white/70 bg-white/90"
            }`}
          >
            <span className="mt-0.5 text-2xl">{t.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold text-ink">{t.title}</p>
              {t.body && <p className="text-[13px] leading-snug text-ink-soft">{t.body}</p>}
            </div>
            <button type="button" onClick={() => dismiss(t.id)} className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint hover:bg-ink/5" aria-label="Dismiss">
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
