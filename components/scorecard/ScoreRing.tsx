"use client";

import { useId } from "react";
import type { Verdict } from "@/lib/scorecard/types";
import { ringAccentForVerdict } from "./verdict-styles";

export function ScoreRing({ score, verdict }: { score: number; verdict: Verdict }) {
  const uid = useId().replace(/:/g, "");
  const r = 52;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, score));
  const dash = (c * clamped) / 100;
  const { from, to } = ringAccentForVerdict(verdict);
  const gradId = `g-${uid}`;

  return (
    <div className="relative mx-auto flex h-[11.5rem] w-[11.5rem] items-center justify-center">
      <svg
        width="200"
        height="200"
        viewBox="0 0 120 120"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 60 60)"
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
      </svg>
      <div className="relative z-10 flex flex-col items-center">
        <span className="text-5xl font-bold tabular-nums tracking-tight text-slate-900">
          {Math.round(score)}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          / 100
        </span>
      </div>
    </div>
  );
}
