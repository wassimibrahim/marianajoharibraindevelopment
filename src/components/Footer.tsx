export function Footer({ onReplay }: { onReplay: () => void }) {
  const rows: [string, string][] = [
    ["Founded", "2026"],
    ["Principal Investigator", "Wassim"],
    ["Sample size", "1"],
    ["Funding", "€0"],
    ["Conflicts of interest", "Significant"],
    ["Scientific credibility", "Debatable"],
    ["Love for subject", "Very high ❤️"],
  ];
  return (
    <footer className="relative z-10 px-5 pt-10 pb-32 sm:pb-16">
      <div className="mx-auto max-w-sm text-center">
        <button type="button" onClick={onReplay} className="mb-8 min-h-[44px] text-[13px] text-ink-soft underline decoration-dotted underline-offset-4 hover:text-ink">
          ✨ Replay birthday magic
        </button>
        <p className="display text-sm text-ink/70 italic">Johari Cognitive Research Institute</p>
        <dl className="mt-3 space-y-0.5">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 font-mono text-[10px] text-ink-faint">
              <dt>{k}</dt>
              <dd className="text-ink-soft">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </footer>
  );
}
