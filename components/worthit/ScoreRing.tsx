"use client";

import type { Verdict } from "@/lib/worthit/types";
import { verdictConfig } from "./verdict-styles";

type Props = { score: number; verdict: Verdict };

export function ScoreRing({ score, verdict }: Props) {
  const cfg = verdictConfig(verdict);
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const dash = (Math.min(Math.max(score, 0), 100) / 100) * circ;

  return (
    <div className="relative flex h-44 w-44 items-center justify-center pop">
      <div className="absolute inset-0 rounded-full opacity-15 blur-2xl" style={{ background: cfg.color }} />
      <svg className="-rotate-90" width="176" height="176" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={cfg.color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{
            transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)",
            filter: `drop-shadow(0 0 8px ${cfg.color}99)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black tabular-nums leading-none" style={{ color: cfg.color }}>
          {Math.round(score)}
        </span>
        <span className="mt-1 text-xs font-semibold tracking-widest text-white/30">/ 100</span>
      </div>
    </div>
  );
}
