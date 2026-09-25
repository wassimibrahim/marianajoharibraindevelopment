"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { useLab } from "./LabProvider";

export function AchievementSystem() {
  const { state } = useLab();
  const unlocked = ACHIEVEMENTS.filter((a) => state.achievements[a.id]).length;
  return (
    <div>
      <p className="mb-4 text-center font-mono text-[12px] text-ink-soft">
        {unlocked} / {ACHIEVEMENTS.length} unlocked
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a, i) => {
          const got = !!state.achievements[a.id];
          const hidden = a.secret && !got;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.06 }}
              className={`relative flex items-center gap-4 rounded-3xl border p-4 ${got ? "border-gold/40 bg-gradient-to-br from-white to-champagne/60 shadow-soft" : "border-ink/6 bg-white/50"}`}
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${got ? "bg-white shadow-sm" : "bg-ink/5 grayscale"} ${a.forever ? "opacity-80" : ""}`}
              >
                {hidden ? "❔" : a.emoji}
              </div>
              <div className="min-w-0">
                <p className={`text-[15px] font-medium ${got ? "text-ink" : "text-ink/60"}`}>{hidden ? "Classified achievement" : a.title}</p>
                <p className="text-[12.5px] leading-snug text-ink-soft">
                  {hidden ? "Unlock conditions redacted. Keep experimenting." : a.description}
                </p>
                {a.forever && <p className="mt-1 font-mono text-[10px] tracking-widest text-rose">[LOCKED]</p>}
                {got && state.achievements[a.id] && (
                  <p className="mt-1 font-mono text-[10px] text-gold">Unlocked {new Date(state.achievements[a.id]).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                )}
              </div>
              {!got && <Lock size={14} className="absolute top-4 right-4 text-ink-faint" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
