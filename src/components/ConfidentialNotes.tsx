"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useState } from "react";
import { CONFIDENTIAL_FOOTNOTE, CONFIDENTIAL_NOTES, LAB_NOTES } from "@/content/lab";

/**
 * The lab notebook, with an optional confidential page of jokes about the
 * principal investigator's bias. Opening it changes nothing anywhere else:
 * no scores, no achievements, no access.
 */
export function ConfidentialNotes() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-white px-6 py-7 shadow-soft sm:px-10" style={{ backgroundImage: "repeating-linear-gradient(transparent 0 31px, #eaf4fc 31px 32px)" }}>
      <div className="absolute top-0 bottom-0 left-6 w-px bg-rose/25 sm:left-8" aria-hidden />
      <div className="pl-4">
        <p className="eyebrow">Laboratory notebook · Vol. I</p>
        <ul className="mt-4 space-y-4">
          {LAB_NOTES.map((n) => (
            <li key={n.text} className="text-[15px] leading-[1.6] text-ink/85">
              <span className="mr-2 font-mono text-[10.5px] text-ink-faint">{n.date}</span>
              {n.text}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-ink/15 bg-white px-4 text-[13px] text-ink-soft hover:text-ink"
        >
          <Lock size={14} /> {open ? "Close confidential research notes" : "Open confidential research notes"}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-4 rounded-2xl border border-dashed border-rose/30 bg-petal/50 px-4 py-4">
                <p className="font-mono text-[10px] tracking-[0.2em] text-rose">CONFIDENTIAL · PRINCIPAL INVESTIGATOR BIAS FILE</p>
                <ul className="mt-3 space-y-2.5">
                  {CONFIDENTIAL_NOTES.map((n) => (
                    <li key={n} className="text-[14.5px] leading-snug text-ink/85">
                      {n}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-rose/20 pt-3 text-[14px] font-medium text-ink">{CONFIDENTIAL_FOOTNOTE}</p>
                <p className="mt-2 text-[11.5px] text-ink-faint">These notes affect no scores, achievements or anything else. They are jokes about the investigator.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
