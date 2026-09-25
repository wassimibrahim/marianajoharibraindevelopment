import type { LabState } from "./storage";

export interface AchievementDef {
  id: string;
  emoji: string;
  title: string;
  description: string;
  /** Hidden achievements show "???" until unlocked. */
  secret?: boolean;
  /** Permanently locked, by decree of the principal investigator. */
  forever?: boolean;
  check: (s: LabState) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "neuron",
    emoji: "🧠",
    title: "Neuron Activated",
    description: "Finish the first experiment.",
    check: (s) => s.sessions.length >= 1,
  },
  {
    id: "basita",
    emoji: "🌹",
    title: "Still Basita",
    description: "Complete 5 experiments.",
    check: (s) => s.sessions.length >= 5,
  },
  {
    id: "mystery",
    emoji: "🛂",
    title: "International Woman of Mystery",
    description: "Open Venezuela Mission Control 10 times.",
    check: (s) => s.counters.passportChecks >= 10,
  },
  {
    id: "impulse",
    emoji: "⏱️",
    title: "Impulse Control??",
    description: "Resist the forbidden button for 10 seconds.",
    check: (s) => s.counters.impulseSurvived >= 1,
  },
  {
    id: "contract",
    emoji: "📄",
    title: "Contract Pending",
    description: "Visit 10 times while her employer continues to research what a contract is.",
    check: (s) => s.visits >= 10,
  },
  {
    id: "evasion",
    emoji: "🏃‍♀️",
    title: "Evidence Tampering",
    description: "Attempt to avoid the neurological examination.",
    secret: true,
    check: (s) => s.counters.evasions >= 1,
  },
  {
    id: "max-basita",
    emoji: "💅",
    title: "Critical Basita Event",
    description: "Push the Basita Index™ to its absolute limit.",
    secret: true,
    check: (s) => s.counters.basitaMaxed >= 1,
  },
  {
    id: "ignored",
    emoji: "🩺",
    title: "Ignored Medical Advice",
    description: "Run a second examination on the same day.",
    secret: true,
    check: (s) => {
      const days = s.sessions.filter((x) => !x.final).map((x) => x.day);
      return days.length !== new Set(days).size;
    },
  },
  {
    id: "personal-best",
    emoji: "🏅",
    title: "Suspiciously Improving",
    description: "Beat your best score on the core task.",
    secret: true,
    check: (s) => {
      const scores = s.sessions.map((x) => x.core).filter((v): v is number => typeof v === "number");
      return scores.some((v, i) => i > 0 && v > Math.max(...scores.slice(0, i)));
    },
  },
  {
    id: "wish",
    emoji: "🎂",
    title: "Wish Submitted",
    description: "Blow out the birthday candles.",
    check: (s) => s.counters.wishes >= 1,
  },
  {
    id: "bouquet",
    emoji: "💐",
    title: "Full Bouquet",
    description: "Open all five flowers in the birthday bouquet.",
    check: (s) => s.counters.bouquet >= 5,
  },
  {
    id: "final",
    emoji: "💍",
    title: "Frontal Lobe Fully Developed",
    description: "Unlock condition: still under review by the laboratory. Possibly forever.",
    forever: true,
    check: () => false,
  },
];
