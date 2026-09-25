"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { BIRTHDAY_TIMEZONE, BIRTHDAY_TIMEZONE_LABEL } from "@/config";
import { BIRTHDAY_25, countdownTo, yearElapsed } from "@/lib/dates";
import { launchFireworks } from "@/lib/celebrate";
import { useNow } from "@/lib/useNow";
import { useLab } from "./LabProvider";

function Unit({ value, label, pad }: { value: number; label: string; pad: number }) {
  const str = String(value).padStart(pad, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="display flex overflow-hidden rounded-2xl bg-white/90 px-2 py-3 text-[clamp(1.5rem,7vw,3.6rem)] shadow-soft sm:px-4 sm:py-4">
        {str.split("").map((d, i) => (
          <span key={i} className="relative inline-block w-[0.62em] text-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={d}
                className="inline-block leading-none font-semibold text-ink tabular-nums"
                initial={{ y: "-60%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "60%", opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
              >
                {d}
              </motion.span>
            </AnimatePresence>
          </span>
        ))}
      </div>
      <span className="mt-2 font-mono text-[10px] tracking-[0.2em] text-ink-soft uppercase">{label}</span>
    </div>
  );
}

function TimeBar({ fraction }: { fraction: number }) {
  return (
    <div className="rounded-3xl bg-ink px-5 py-5 text-white sm:px-7">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10.5px] tracking-[0.2em] text-white/70">TIME UNTIL ALLEGED FINAL FORM</p>
        <p className="font-mono text-[12px] whitespace-nowrap text-white/80 tabular-nums">{(fraction * 100).toFixed(2)}% there</p>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/12">
        <div className="h-full rounded-full bg-gradient-to-r from-sky via-lavender to-blush transition-[width] duration-1000" style={{ width: `${fraction * 100}%` }} />
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-white/60">
        Share of the year between the 24th and 25th birthdays that has passed. It measures the calendar, not a brain.
      </p>
    </div>
  );
}

export function BrainCountdown({ onFinalExam }: { onFinalExam: () => void }) {
  const t = useNow(1000);
  const { state, ready } = useLab();
  const prevArrived = useRef<boolean | null>(null);
  const c = t ? countdownTo(BIRTHDAY_25, t) : null;
  const arrived = !!c?.arrived;

  // Fireworks the moment the countdown reaches zero, or once on the first visit after.
  useEffect(() => {
    if (!c || !ready) return;
    if (prevArrived.current === false && arrived) launchFireworks(1.4);
    if (prevArrived.current === null && arrived) {
      try {
        if (!localStorage.getItem("mariana-pfc-lab:25-celebrated")) {
          localStorage.setItem("mariana-pfc-lab:25-celebrated", "1");
          window.setTimeout(() => launchFireworks(1.4), 1200);
        }
      } catch {}
    }
    prevArrived.current = arrived;
  }, [c, arrived, ready]);

  const zoneNote = (
    <p className="mt-3 text-center font-mono text-[10.5px] text-ink-faint">
      Target: 25 September 2027, 00:00 {BIRTHDAY_TIMEZONE_LABEL} ({BIRTHDAY_TIMEZONE}). Fixed, even if your phone travels.
    </p>
  );

  if (!c || !t) return <div className="h-[420px]" />;

  if (arrived) {
    return (
      <div className="text-center">
        <p className="eyebrow">25 September 2027 · 00:00</p>
        <motion.h3
          className="display mt-4 text-[clamp(2.4rem,10vw,4.2rem)] leading-[1.02] font-semibold text-ink"
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="gold-text">25 unlocked.</span>
        </motion.h3>
        <p className="display mt-3 text-[clamp(1.2rem,5vw,1.6rem)] text-ink-soft italic">Certification still under review.</p>
        <div className="mx-auto mt-8 max-w-lg text-left">
          <TimeBar fraction={1} />
        </div>
        {state.finalExam && (
          <p className="mt-6 text-[14px] text-ink-soft">
            Final examination game score: <span className="font-medium text-ink">{state.finalExam.score}/100</span>. Certification remains, naturally,
            under review.
          </p>
        )}
        <button type="button" className="btn-primary mt-8 w-full max-w-sm" onClick={onFinalExam}>
          {state.finalExam ? "Run the final examination again" : "Run the final examination"} 🎓
        </button>
        {zoneNote}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-center gap-1 sm:gap-3" role="timer" aria-label={`${c.days} days, ${c.hours} hours, ${c.minutes} minutes until 25`}>
        <Unit value={c.days} label="Days" pad={3} />
        <Colon />
        <Unit value={c.hours} label="Hours" pad={2} />
        <Colon />
        <Unit value={c.minutes} label="Min" pad={2} />
        <Colon />
        <Unit value={c.seconds} label="Sec" pad={2} />
      </div>
      {zoneNote}
      <p className="mx-auto mt-6 max-w-lg text-center text-[15px] leading-relaxed text-ink-soft">
        “According to extremely questionable internet neuroscience, this is when Mariana will achieve <strong className="text-ink">Maximum Frontal Lobe™</strong>.”
        <span className="mt-1 block text-[12px] text-ink-faint">(It isn’t. Brains don’t have a release date. This is a joke with a timer.)</span>
      </p>
      <div className="mx-auto mt-7 max-w-lg">
        <TimeBar fraction={yearElapsed(t)} />
      </div>
    </div>
  );
}

function Colon() {
  return <span className="display mt-3 text-[clamp(1.2rem,5vw,2.4rem)] text-ink-faint sm:mt-4">:</span>;
}
