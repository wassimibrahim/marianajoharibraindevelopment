"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CATEGORY_LABELS, CATEGORY_ORDER, type CategoryKey } from "@/experiments/types";
import { daysUntilMaturity, formatShortDate } from "@/lib/dates";
import { scientificConfidence } from "@/lib/scoring";
import { useNow } from "@/lib/useNow";
import { useLab } from "./LabProvider";
import { trendMessage } from "./ResultsReport";

type Metric = "overall" | CategoryKey;

interface Point {
  n: number;
  label: string;
  value: number | null;
  final?: boolean;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: Point }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  if (p.value === null) return null;
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/95 px-3.5 py-2.5 shadow-soft backdrop-blur">
      <p className="font-mono text-[10px] tracking-widest text-ink-faint">
        EXPERIMENT #{p.n} · {p.label}
        {p.final ? " · FINAL" : ""}
      </p>
      <p className="display text-2xl font-semibold text-ink">{p.value}%</p>
    </div>
  );
}

export function DevelopmentChart() {
  const { state, ready } = useLab();
  const t = useNow(60_000);
  const [metric, setMetric] = useState<Metric>("overall");
  const [showTable, setShowTable] = useState(false);
  const sessions = state.sessions;

  const available = useMemo(
    () => CATEGORY_ORDER.filter((c) => sessions.some((s) => s.categories[c] !== undefined)),
    [sessions],
  );

  const data: Point[] = sessions.map((s, i) => ({
    n: i + 1,
    label: formatShortDate(s.date),
    value: metric === "overall" ? s.overall : (s.categories[metric] ?? null),
    final: s.final,
  }));

  const latest = sessions.at(-1);
  const prev = sessions.at(-2);
  const trend = latest ? trendMessage(latest.overall, prev?.overall) : null;
  const best = sessions.length ? Math.max(...sessions.map((s) => s.overall)) : null;

  return (
    <div className="card p-5 sm:p-8">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Stat label="Experiments completed" value={ready ? String(sessions.length) : "—"} />
        <Stat label="Days until alleged maturity" value={t ? String(daysUntilMaturity(t)) : "—"} />
        <Stat label="Scientific confidence" value={ready ? `${scientificConfidence(sessions.length)}%` : "—"} />
      </div>

      {sessions.length === 0 ? (
        <div className="mt-8 flex h-56 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-ink/10 text-center">
          <p className="text-4xl">📈</p>
          <p className="display mt-3 text-xl text-ink">No data yet.</p>
          <p className="mt-1 max-w-xs text-sm text-ink-soft">The curve begins after the first examination. Science is patient. Mariana, less so.</p>
        </div>
      ) : (
        <>
          <div className="-mx-1 mt-7 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]" role="tablist" aria-label="Metric">
            {(["overall", ...available] as Metric[]).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={metric === m}
                onClick={() => setMetric(m)}
                className={`min-h-[38px] shrink-0 rounded-full px-3.5 text-[13px] whitespace-nowrap transition-colors ${metric === m ? "bg-ink text-white" : "bg-white/80 text-ink-soft hover:bg-white"}`}
              >
                {m === "overall" ? "Overall" : CATEGORY_LABELS[m]}
              </button>
            ))}
          </div>

          <motion.div key={metric} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 h-64 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d9467a" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#b9a4ec" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#2d2233" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6e6073" }} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis domain={[0, 100]} ticks={[0, 40, 60, 75, 90, 100]} tick={{ fontSize: 11, fill: "#6e6073" }} tickLine={false} axisLine={false} />
                <ReferenceLine y={75} stroke="#bf9a52" strokeDasharray="4 4" strokeOpacity={0.6} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#2d2233", strokeOpacity: 0.2, strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#d9467a"
                  strokeWidth={2}
                  fill="url(#curveFill)"
                  connectNulls
                  dot={{ r: 4, fill: "#fff", stroke: "#d9467a", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#d9467a", stroke: "#fff", strokeWidth: 2 }}
                  isAnimationActive
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
          <p className="mt-1 text-right font-mono text-[10px] text-gold">– – 75% · “disturbingly responsible” threshold</p>

          {trend && <p className={`display mt-4 text-center text-lg italic ${trend.tone}`}>{trend.text}</p>}
          {best !== null && <p className="mt-1 text-center font-mono text-[11px] text-ink-faint">Personal best: {best}%</p>}

          <button type="button" onClick={() => setShowTable((v) => !v)} className="mx-auto mt-4 block font-mono text-[11px] tracking-wider text-ink-soft underline decoration-dotted underline-offset-4">
            {showTable ? "Hide" : "Show"} raw laboratory data
          </button>
          {showTable && (
            <div className="mt-3 max-h-64 overflow-y-auto rounded-2xl bg-white/70">
              <table className="w-full text-left text-[13px]">
                <thead className="sticky top-0 bg-white font-mono text-[10px] tracking-widest text-ink-faint">
                  <tr>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">DATE</th>
                    <th className="px-4 py-2 text-right">SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data].reverse().map((d) => (
                    <tr key={d.n} className="border-t border-ink/5">
                      <td className="px-4 py-2 font-mono text-ink-faint">{d.n}</td>
                      <td className="px-4 py-2 text-ink">
                        {d.label}
                        {d.final ? " · final" : ""}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-ink">{d.value ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/70 px-3 py-3 text-center sm:px-4 sm:py-4">
      <p className="display text-[clamp(1.5rem,6vw,2.2rem)] leading-none font-semibold text-ink tabular-nums">{value}</p>
      <p className="mt-1.5 text-[10.5px] leading-tight text-ink-soft sm:text-xs">{label}</p>
    </div>
  );
}
