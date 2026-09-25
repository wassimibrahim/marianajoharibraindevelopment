"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { BIRTHDAY_25, countdownTo, frontalLobeProgress } from "@/lib/dates";
import { launchFireworks } from "@/lib/celebrate";
import { useNow } from "@/lib/useNow";
import { BrainProgress } from "./BrainProgress";
import { useLab } from "./LabProvider";

function Unit({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(label === "Days" ? 3 : 2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="display flex overflow-hidden rounded-2xl bg-white/85 px-2 py-3 text-[clamp(1.5rem,7vw,3.8rem)] shadow-soft sm:px-4 sm:py-4">
        {str.split("").map((d, i) => (
          <span key={i} className="relative inline-block w-[0.62em] text-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={d}
                className="inline-block leading-none font-semibold text-ink tabular-nums"
                initial={{ y: "-60%", opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: "60%", opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
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

export function BrainCountdown({ onFinalExam }: { onFinalExam: () => void }) {
  const t = useNow(1000);
  const { state, ready } = useLab();
  const prevArrived = useRef<boolean | null>(null);
  const c = t ? countdownTo(BIRTHDAY_25, t) : null;
  const arrived = !!c?.arrived;

  // Fireworks the moment the countdown hits zero (or on the first visit after it has).
  useEffect(() => {
    if (!c || !ready) return;
    if (prevArrived.current === false && arrived) launchFireworks(2);
    if (prevArrived.current === null && arrived) {
      try {
        if (!localStorage.getItem("mariana-pfc-lab:25-celebrated")) {
          localStorage.setItem("mariana-pfc-lab:25-celebrated", "1");
          window.setTimeout(() => launchFireworks(2), 1500);
        }
      } catch {}
    }
    prevArrived.current = arrived;
  }, [c, arrived, ready]);

  if (!c || !t) {
    return <div className="card h-[420px] animate-pulse-soft" />;
  }

  const percent = frontalLobeProgress(t);

  if (arrived) {
    return (
      <div className="card overflow-hidden p-6 text-center sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_0%,#f4e7c5,transparent_70%)]" aria-hidden />
        <div className="relative">
          <p className="eyebrow">25 September 2027 · 00:00</p>
          <motion.h3
            className="display mt-4 text-[clamp(2.4rem,10vw,4.5rem)] leading-none font-semibold text-ink"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 90 }}
          >
            THE MOMENT <span className="gold-text italic">HAS ARRIVED.</span>
          </motion.h3>
          <p className="display mx-auto mt-4 max-w-md text-lg text-ink-soft italic">
            &ldquo;Chronological eligibility for frontal-lobe certification achieved.&rdquo;
          </p>
          <div className="mx-auto mt-8 max-w-lg text-left">
            <BrainProgress percent={percent} arrived />
          </div>
          {state.finalExam ? (
            <p className="mt-6 font-mono text-sm text-ink-soft">
              Final examination completed: <span className="text-rose">{state.finalExam.score}%</span>. Certification remains, of course, pending.
            </p>
          ) : null}
          <button type="button" className="btn-primary mt-8 w-full max-w-sm" onClick={onFinalExam}>
            {state.finalExam ? "RE-RUN FINAL EXAMINATION" : "RUN FINAL EXAMINATION"} 🎓
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 sm:p-9">
      <p className="eyebrow text-center">Live countdown · 25 September 2027, 00:00</p>
      <h3 className="display mx-auto mt-3 max-w-xl text-center text-[clamp(1.5rem,6.2vw,2.4rem)] leading-tight font-semibold tracking-tight text-ink">
        TIME UNTIL MARIANA&apos;S <span className="iridescent italic">ALLEGED FINAL FORM</span>
      </h3>
      <div className="mt-7 flex items-start justify-center gap-1 sm:gap-3">
        <Unit value={c.days} label="Days" />
        <Colon />
        <Unit value={c.hours} label="Hours" />
        <Colon />
        <Unit value={c.minutes} label="Min" />
        <Colon />
        <Unit value={c.seconds} label="Sec" />
      </div>
      <p className="mx-auto mt-6 max-w-lg text-center text-[15px] leading-relaxed text-ink-soft">
        &ldquo;According to extremely questionable internet neuroscience, this is when Mariana will achieve{" "}
        <strong className="text-ink">Maximum Frontal Lobe™</strong>.&rdquo;
      </p>
      <div className="mx-auto mt-7 max-w-lg">
        <BrainProgress percent={percent} arrived={false} />
      </div>
    </div>
  );
}

function Colon() {
  return <span className="display mt-3 text-[clamp(1.2rem,5vw,2.6rem)] text-ink-faint sm:mt-4">:</span>;
}
