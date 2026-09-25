"use client";

import { useId, type CSSProperties } from "react";

export type FlowerKind = "blossom" | "daisy" | "rose" | "hibiscus" | "tulip" | "lavender";

export interface FlowerPalette {
  petal: string;
  deep: string;
  center: string;
}

export const PALETTES: Record<FlowerKind, FlowerPalette[]> = {
  blossom: [
    { petal: "#fbd3df", deep: "#ef8fb0", center: "#c9406f" },
    { petal: "#fde4ec", deep: "#f4a9c2", center: "#d9467a" },
    { petal: "#d6e8fb", deep: "#7fb0e6", center: "#e9b43c" },
    { petal: "#ffe0d2", deep: "#f79b7e", center: "#d2553d" },
  ],
  daisy: [
    { petal: "#ffffff", deep: "#efe7f7", center: "#f0b93c" },
    { petal: "#fff8e6", deep: "#f5dfa8", center: "#e59b25" },
    { petal: "#ffe27a", deep: "#f6c945", center: "#9a5a1c" },
  ],
  rose: [
    { petal: "#ee6a8f", deep: "#b82652", center: "#8e1a3f" },
    { petal: "#f7a3b8", deep: "#d85c80", center: "#b33a60" },
    { petal: "#f6c89a", deep: "#e0925a", center: "#b8663a" },
    { petal: "#ffe7a3", deep: "#eab94a", center: "#b8862a" },
  ],
  hibiscus: [
    { petal: "#ff8a7a", deep: "#e0435c", center: "#8f1d3a" },
    { petal: "#ffb36b", deep: "#f07a3f", center: "#b53a2a" },
  ],
  tulip: [
    { petal: "#f59ab3", deep: "#d9467a", center: "#6fa26f" },
    { petal: "#ffd36e", deep: "#f0a53a", center: "#6fa26f" },
    { petal: "#c7b2f2", deep: "#8a67d1", center: "#6fa26f" },
    { petal: "#ffb39c", deep: "#ec6f55", center: "#6fa26f" },
  ],
  lavender: [
    { petal: "#b9a1ec", deep: "#7c5cc4", center: "#7fa77f" },
    { petal: "#a8c4f0", deep: "#5b86cc", center: "#7fa77f" },
  ],
};

interface FlowerProps {
  kind: FlowerKind;
  size?: number | string;
  palette?: FlowerPalette;
  className?: string;
  style?: CSSProperties;
}

/** Hand-drawn SVG flowers — the laboratory's primary visual motif. */
export function Flower({ kind, size = 64, palette, className, style }: FlowerProps) {
  const uid = useId().replace(/:/g, "");
  const p = palette ?? PALETTES[kind][0];
  const g = `g${uid}`;
  const gc = `c${uid}`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={g} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor={p.deep} />
          <stop offset="55%" stopColor={p.petal} />
          <stop offset="100%" stopColor={p.petal} />
        </radialGradient>
        <radialGradient id={gc} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff6d8" />
          <stop offset="100%" stopColor={p.center} />
        </radialGradient>
      </defs>
      {kind === "blossom" && <Blossom fill={`url(#${g})`} p={p} />}
      {kind === "daisy" && <Daisy p={p} center={`url(#${gc})`} />}
      {kind === "rose" && <Rose fill={`url(#${g})`} p={p} />}
      {kind === "hibiscus" && <Hibiscus fill={`url(#${g})`} p={p} />}
      {kind === "tulip" && <Tulip p={p} />}
      {kind === "lavender" && <Lavender p={p} />}
    </svg>
  );
}

const ROT5 = [0, 72, 144, 216, 288];

function Blossom({ fill, p }: { fill: string; p: FlowerPalette }) {
  return (
    <g>
      {ROT5.map((r) => (
        <path
          key={r}
          d="M50 50 C 36 40, 33 18, 45 11 L 50 16 L 55 11 C 67 18, 64 40, 50 50 Z"
          fill={fill}
          stroke={p.deep}
          strokeOpacity="0.25"
          strokeWidth="0.6"
          transform={`rotate(${r} 50 50)`}
        />
      ))}
      {ROT5.map((r) => (
        <line key={`s${r}`} x1="50" y1="50" x2="50" y2="36" stroke={p.center} strokeWidth="1" strokeLinecap="round" transform={`rotate(${r + 36} 50 50)`} />
      ))}
      {ROT5.map((r) => (
        <circle key={`d${r}`} cx="50" cy="35" r="1.8" fill="#f3c55b" transform={`rotate(${r + 36} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="4.5" fill={p.center} />
    </g>
  );
}

function Daisy({ p, center }: { p: FlowerPalette; center: string }) {
  const petals = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <g>
      {petals.map((r, i) => (
        <ellipse
          key={r}
          cx="50"
          cy="27"
          rx="5.4"
          ry="17"
          fill={i % 2 ? p.petal : p.deep}
          stroke="#d8cbe0"
          strokeOpacity="0.6"
          strokeWidth="0.5"
          transform={`rotate(${r} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="11" fill={center} />
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={50 + Math.cos(i * 2.4) * (i * 0.9)} cy={50 + Math.sin(i * 2.4) * (i * 0.9)} r="0.9" fill="#a8641a" opacity="0.6" />
      ))}
    </g>
  );
}

function Rose({ fill, p }: { fill: string; p: FlowerPalette }) {
  const outer = "M50 50 C 31 47, 22 28, 35 16 C 43 9, 57 9, 65 16 C 78 28, 69 47, 50 50 Z";
  return (
    <g>
      {ROT5.map((r) => (
        <path key={r} d={outer} fill={fill} stroke={p.deep} strokeOpacity="0.35" strokeWidth="0.7" transform={`rotate(${r} 50 50)`} />
      ))}
      {ROT5.map((r) => (
        <path
          key={`m${r}`}
          d={outer}
          fill={p.petal}
          stroke={p.deep}
          strokeOpacity="0.45"
          strokeWidth="0.9"
          transform={`rotate(${r + 36} 50 50) translate(50 50) scale(0.66) translate(-50 -50)`}
        />
      ))}
      <circle cx="50" cy="50" r="13" fill={p.deep} opacity="0.9" />
      <path d="M44 52 C 42 44, 52 40, 56 46 C 59 51, 54 57, 48 56" fill="none" stroke={p.petal} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M47 50 C 47 47, 52 46, 53 49" fill="none" stroke={p.petal} strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      <path d="M38 50 C 38 38, 58 34, 62 48" fill="none" stroke={p.center} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </g>
  );
}

function Hibiscus({ fill, p }: { fill: string; p: FlowerPalette }) {
  return (
    <g>
      {ROT5.map((r) => (
        <path
          key={r}
          d="M50 50 C 30 42, 26 14, 42 8 C 48 6, 52 6, 58 8 C 74 14, 70 42, 50 50 Z"
          fill={fill}
          stroke={p.deep}
          strokeOpacity="0.3"
          strokeWidth="0.7"
          transform={`rotate(${r} 50 50)`}
        />
      ))}
      {ROT5.map((r) => (
        <path key={`v${r}`} d="M50 48 L 50 22" stroke={p.deep} strokeOpacity="0.35" strokeWidth="0.8" transform={`rotate(${r} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="7" fill={p.center} />
      <path d="M50 50 Q 60 36 66 22" stroke="#f6d27a" strokeWidth="2" fill="none" strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={63 + (i % 2) * 3} cy={20 + i * 2.2} r="1.6" fill="#f3b53a" />
      ))}
    </g>
  );
}

function Tulip({ p }: { p: FlowerPalette }) {
  return (
    <g>
      <path d="M50 96 C 50 80, 50 66, 50 52" stroke={p.center} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M50 86 C 36 78, 30 66, 32 56 C 42 62, 48 72, 50 84 Z" fill={p.center} opacity="0.85" />
      <path d="M30 26 C 28 46, 36 56, 50 56 C 64 56, 72 46, 70 26 L 60 36 L 50 20 L 40 36 Z" fill={p.petal} />
      <path d="M40 36 L 50 20 L 60 36 C 60 48, 56 56, 50 56 C 44 56, 40 48, 40 36 Z" fill={p.deep} opacity="0.55" />
      <path d="M34 30 C 36 44, 40 50, 46 54" stroke="white" strokeOpacity="0.45" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Lavender({ p }: { p: FlowerPalette }) {
  const buds = Array.from({ length: 11 }, (_, i) => i);
  return (
    <g>
      <path d="M50 96 C 50 76, 51 50, 50 18" stroke={p.center} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {buds.map((i) => {
        const y = 20 + i * 5.2;
        const side = i % 2 ? 1 : -1;
        const r = 3.6 - i * 0.12;
        return (
          <g key={i}>
            <ellipse cx={50 + side * 3.2} cy={y} rx={r} ry={r * 1.45} fill={i % 3 ? p.petal : p.deep} transform={`rotate(${side * 25} ${50 + side * 3.2} ${y})`} />
            <ellipse cx={50 - side * 1.5} cy={y + 2.5} rx={r * 0.8} ry={r * 1.2} fill={p.deep} opacity="0.7" />
          </g>
        );
      })}
    </g>
  );
}

export const FLOWER_KINDS: FlowerKind[] = ["blossom", "daisy", "rose", "hibiscus", "tulip", "lavender"];
