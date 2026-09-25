"use client";

import { motion } from "framer-motion";
import { Award, Clock, FlaskConical, Heart, LineChart } from "lucide-react";
import { useEffect, useState } from "react";

const ITEMS = [
  { id: "letter", label: "Card", Icon: Heart },
  { id: "countdown", label: "Countdown", Icon: Clock },
  { id: "experiment", label: "Test", Icon: FlaskConical },
  { id: "curve", label: "Curve", Icon: LineChart },
  { id: "achievements", label: "Awards", Icon: Award },
];

export function BottomNav() {
  const [active, setActive] = useState("letter");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ITEMS.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 24 }}
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(10px,env(safe-area-inset-bottom))]"
      aria-label="Sections"
    >
      <div className="flex w-full max-w-md items-center justify-between rounded-full border border-white/70 bg-white/80 p-1.5 shadow-lift backdrop-blur-xl">
        {ITEMS.map(({ id, label, Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`relative flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] transition-colors ${active === id ? "text-white" : "text-ink-soft"}`}
          >
            {active === id && <motion.span layoutId="navpill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <Icon size={17} className="relative" />
            <span className="relative">{label}</span>
          </a>
        ))}
      </div>
    </motion.nav>
  );
}
