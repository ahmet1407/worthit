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
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg className="-rotate-90" width="160" height="160" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={cfg.color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black tabular-nums" style={{ color: cfg.color }}>
          {Math.round(score)}
        </span>
        <span className="text-xs text-white/30 font-medium tracking-wide">/ 100</span>
      </div>
    </div>
  );
}
