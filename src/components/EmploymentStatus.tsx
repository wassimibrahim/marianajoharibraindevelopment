"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const RIGHTS = ["Searching", "Searching.", "Searching..", "Searching…"];

export function EmploymentStatus() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((x) => (x + 1) % RIGHTS.length), 600);
    return () => window.clearInterval(id);
  }, []);

  const rows: [string, React.ReactNode][] = [
    ["Employee", "Mariana"],
    ["Works", <span key="w" className="text-sage">Yes ✓</span>],
    ["Contract", <em key="c">Allegedly</em>],
    ["Rights", <span key="r" className="inline-block w-[92px] text-left font-mono text-[13px] text-iris">{RIGHTS[i]}</span>],
    ["Salary", <span key="s" className="rounded bg-ink px-2 py-0.5 font-mono text-[11px] tracking-widest text-white">CLASSIFIED</span>],
  ];

  return (
    <div className="card flex h-full flex-col p-6">
      <p className="eyebrow">Widget · 01</p>
      <h3 className="display mt-2 text-2xl font-semibold text-ink">EMPLOYMENT STATUS</h3>
      <div className="relative mt-5 flex-1 rounded-2xl border border-ink/8 bg-white/80 px-4 py-2">
        <motion.span
          className="absolute -top-3 right-4 rotate-6 rounded-md border-2 border-rose/60 bg-white px-2 py-0.5 font-mono text-[10px] tracking-widest text-rose"
          initial={{ scale: 1.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.3 }}
        >
          UNSIGNED
        </motion.span>
        <dl className="divide-y divide-dashed divide-ink/10">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3 py-2.5 text-[15px]">
              <dt className="font-mono text-[11px] tracking-wider text-ink-faint uppercase">{k}</dt>
              <dd className="text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="text-ink-soft">Frontal lobe required to tolerate this</span>
          <span className="font-mono text-ink">100%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink/8">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blush to-rose"
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
