"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ACHIEVEMENTS, type AchievementDef } from "@/lib/achievements";
import { dayKey, now } from "@/lib/dates";
import { emptyState, loadState, saveState, type LabState } from "@/lib/storage";

export interface Toast {
  id: number;
  icon: string;
  title: string;
  body?: string;
  tone?: "achievement" | "news" | "lab";
}

interface LabContextValue {
  state: LabState;
  ready: boolean;
  update: (mutate: (draft: LabState) => void) => void;
  toasts: Toast[];
  notify: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

const LabContext = createContext<LabContextValue | null>(null);

let visitRecorded = false;

function unlockNew(state: LabState): AchievementDef[] {
  const fresh = ACHIEVEMENTS.filter((a) => !state.achievements[a.id] && a.check(state));
  for (const a of fresh) state.achievements[a.id] = new Date().toISOString();
  return fresh;
}

export function LabProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LabState>(emptyState);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const stateRef = useRef(state);

  const notify = useCallback((t: Omit<Toast, "id">) => {
    const id = ++toastId.current;
    setToasts((list) => [...list.slice(-1), { ...t, id }]);
    window.setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 6500);
  }, []);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((x) => x.id !== id)), []);

  const commit = useCallback(
    (next: LabState) => {
      const unlocked = unlockNew(next);
      stateRef.current = next;
      setState(next);
      saveState(next);
      unlocked.forEach((a, i) =>
        window.setTimeout(
          () => notify({ icon: a.emoji, title: `Achievement unlocked: ${a.title}`, body: a.description, tone: "achievement" }),
          400 + i * 900,
        ),
      );
    },
    [notify],
  );

  const update = useCallback(
    (mutate: (draft: LabState) => void) => {
      const draft = structuredClone(stateRef.current);
      mutate(draft);
      commit(draft);
    },
    [commit],
  );

  useEffect(() => {
    const loaded = loadState();
    if (!visitRecorded) {
      visitRecorded = true;
      loaded.visits += 1;
      loaded.lastVisitDay = dayKey(now());
    }
    // Loading from localStorage has to happen after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
    commit(loaded);
  }, [commit]);

  const value = useMemo(() => ({ state, ready, update, toasts, notify, dismiss }), [state, ready, update, toasts, notify, dismiss]);
  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab(): LabContextValue {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error("useLab must be used inside <LabProvider>");
  return ctx;
}
