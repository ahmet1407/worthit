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
      <svg className="-rotate-90" width="176" height="176" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#E8E8E4" strokeWidth="7" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={cfg.color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif italic leading-none" style={{ fontSize: "3.2rem", color: cfg.color }}>
          {Math.round(score)}
        </span>
        <span className="mt-1 text-xs font-medium tracking-widest text-[#9A9A9A]">/ 100</span>
      </div>
    </div>
  );
}
