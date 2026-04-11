"use client";

import type { Verdict, WorthitReport } from "@/lib/worthit/types";
import { ScoreRing } from "./ScoreRing";
import { verdictConfig } from "./verdict-styles";

type Props = { result: WorthitReport; amazonUrl: string | null; verdict: Verdict };

function Divider() { return <div className="h-px w-full bg-white/6" />; }

export function WorthitResultView({ result, amazonUrl, verdict }: Props) {
  const score = result.overall_score ?? 0;
  const cfg = verdictConfig(verdict);

  return (
    <div className="space-y-3">
      <div className={`rounded-2xl border ${cfg.border} bg-white/3 overflow-hidden ${cfg.glow}`}>
        <div className="px-6 pt-6 pb-4">
          <p className={`text-xs font-semibold tracking-widest uppercase ${cfg.text} mb-1`}>
            {result.brand ?? ""}{result.brand && result.category ? " · " : ""}{result.category ?? ""}
          </p>
          <h2 className="text-xl font-bold text-white leading-snug">{result.product_name}</h2>
          {amazonUrl && (
            <a href={amazonUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
              <span>Amazon sayfası</span><span>↗</span>
            </a>
          )}
        </div>
        <Divider />
        <div className="flex items-center gap-6 px-6 py-6">
          <ScoreRing score={score} verdict={verdict} />
          <div className="flex-1">
            <div className={`inline-block rounded-lg px-4 py-1.5 text-sm font-black tracking-widest uppercase ${cfg.bg} ${cfg.text} mb-3`}>
              {cfg.label}
            </div>
            <p className="text-sm text-white/60 leading-relaxed">{result.verdict_reason}</p>
          </div>
        </div>
        <Divider />
        <div className="grid grid-cols-4 divide-x divide-white/6">
          {([["Memnuniyet", result.scores.satisfaction], ["Kusur", result.scores.flaw_risk], ["Uzman", result.scores.expert], ["Değer", result.scores.value]] as const).map(([label, val]) => (
            <div key={label} className="py-4 text-center">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">{label}</div>
              <div className="text-xl font-black text-white tabular-nums">{Math.round(val)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/6 bg-white/3 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#a3e635]/70">Artılar</p>
          <ul className="space-y-2.5">
            {result.top_pros.map((p, i) => (
              <li key={i} className="text-sm">
                <span className="text-[#a3e635]/60 mr-2">✓</span>
                <span className="text-white/70">{p.point}</span>
                {p.source && <span className="mt-0.5 block text-xs text-white/25 pl-4">{p.source}</span>}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/6 bg-white/3 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400/70">Eksiler</p>
          <ul className="space-y-2.5">
            {result.top_cons.map((c, i) => (
              <li key={i} className="text-sm">
                <span className="text-red-400/60 mr-2">✕</span>
                <span className="text-white/70">{c.point}</span>
                {c.source && <span className="mt-0.5 block text-xs text-white/25 pl-4">{c.source}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/6 bg-white/3 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Kim almalı</p>
          <ul className="space-y-1.5">
            {result.use_case_fit.best_for.map((x, i) => (
              <li key={i} className="flex gap-2 text-sm text-white/60"><span className="text-white/20 shrink-0">·</span><span>{x}</span></li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/6 bg-white/3 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Kim almamalı</p>
          <ul className="space-y-1.5">
            {result.use_case_fit.not_ideal_for.map((x, i) => (
              <li key={i} className="flex gap-2 text-sm text-white/60"><span className="text-white/20 shrink-0">·</span><span>{x}</span></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-white/6 bg-white/3 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Neden tercih ediliyor</p>
        <p className="text-sm text-white/70 leading-relaxed">{result.why_people_buy.main_motivation}</p>
        {result.why_people_buy.owner_satisfaction_note && <p className="mt-2 text-sm text-white/45 leading-relaxed">{result.why_people_buy.owner_satisfaction_note}</p>}
        {result.why_people_buy.love_rate && <p className="mt-2 text-xs text-white/25">{result.why_people_buy.love_rate}</p>}
      </div>

      {result.chronic_issues.length > 0 && (
        <div className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-400/70">Kronik sorunlar</p>
          <ul className="space-y-3">
            {result.chronic_issues.map((c, i) => (
              <li key={i}>
                <p className="text-sm font-medium text-amber-200/80">{c.issue}</p>
                <p className="mt-0.5 text-xs text-amber-400/50">{c.source_count} kaynak · Şiddet: {c.severity}</p>
                {c.sources?.length > 0 && <p className="mt-0.5 text-xs text-amber-400/35">{c.sources.join(" · ")}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-white/6 bg-white/3">
        <div className="pointer-events-none select-none p-6 opacity-20 blur-sm" aria-hidden>
          <div className="h-2 w-3/4 rounded bg-white/20 mb-3" />
          <div className="h-2 w-full rounded bg-white/15 mb-2" />
          <div className="h-2 w-5/6 rounded bg-white/15" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">Premium</span>
          <p className="text-sm font-medium text-white/70 max-w-xs">{result.paywall_hooks.main_risk_teaser}</p>
          <p className="mt-1.5 text-xs text-white/35 max-w-xs leading-relaxed">{result.paywall_hooks.hidden_insight_teaser}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/6 bg-white/3 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Alternatifler</p>
        <ul className="space-y-3">
          {result.alternatives.map((a, i) => (
            <li key={i} className="flex items-start justify-between gap-4 text-sm">
              <div>
                <p className="font-semibold text-white/80">{a.name}</p>
                <p className="mt-0.5 text-white/45">{a.why}</p>
              </div>
              {a.price_diff && <span className="shrink-0 text-xs text-white/30 mt-0.5">{a.price_diff}</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/6 bg-white/3 p-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/25">🇹🇷 TR bağlam</p>
          <p className="text-sm text-white/55 leading-relaxed">{result.market_context.TR}</p>
        </div>
        <div className="rounded-2xl border border-white/6 bg-white/3 p-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/25">🇺🇸 US bağlam</p>
          <p className="text-sm text-white/55 leading-relaxed">{result.market_context.US}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/6 bg-white/3 px-5 py-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/25">Güven: <span className="text-white/50 font-medium">{result.data_integrity.confidence}</span></span>
          <span className="text-white/20">{result.data_integrity.total_sources_count} kaynak</span>
        </div>
        <p className="mt-1 text-xs text-white/25 leading-relaxed">{result.data_integrity.confidence_reason}</p>
      </div>
    </div>
  );
}
