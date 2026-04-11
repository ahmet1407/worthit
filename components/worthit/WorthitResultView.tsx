"use client";

import type { ReactNode } from "react";
import type { Verdict, WorthitReport } from "@/lib/worthit/types";
import { ScoreRing } from "./ScoreRing";
import { verdictConfig } from "./verdict-styles";

type Props = { result: WorthitReport; amazonUrl: string | null; verdict: Verdict };

function Divider() {
  return <div className="h-px w-full bg-white/6" />;
}

function Label({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/30">{children}</p>;
}

export function WorthitResultView({ result, amazonUrl, verdict }: Props) {
  const score = result.overall_score ?? 0;
  const cfg = verdictConfig(verdict);

  return (
    <div className="fade-up space-y-3">
      <div
        className={`rounded-2xl border ${cfg.border} overflow-hidden ${cfg.glow}`}
        style={{ background: `linear-gradient(135deg, ${cfg.color}08 0%, #111 60%)` }}
      >
        <div className="px-6 pb-4 pt-6">
          {(result.brand || result.category) && (
            <p className={`mb-1.5 text-[10px] font-black uppercase tracking-[0.2em] opacity-80 ${cfg.text}`}>
              {[result.brand, result.category].filter(Boolean).join(" · ")}
            </p>
          )}
          <h2 className="text-xl font-bold leading-snug text-white">{result.product_name}</h2>
          {amazonUrl && (
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-white/30 transition-colors hover:text-white/70"
            >
              Amazon sayfası ↗
            </a>
          )}
        </div>
        <Divider />
        <div className="flex items-center gap-6 px-6 py-6">
          <ScoreRing score={score} verdict={verdict} />
          <div className="min-w-0 flex-1">
            <div
              className={`mb-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}
              style={{ border: `1px solid ${cfg.color}40` }}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
            </div>
            <p className="text-sm leading-relaxed text-white/60">{result.verdict_reason}</p>
          </div>
        </div>
        <Divider />
        <div className="grid grid-cols-4 divide-x divide-white/6">
          {(
            [
              ["Memnuniyet", result.scores.satisfaction],
              ["Kusur riski", result.scores.flaw_risk],
              ["Uzman onayı", result.scores.expert],
              ["Değer", result.scores.value],
            ] as const
          ).map(([label, val]) => (
            <div key={label} className="py-5 text-center">
              <div className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-white/25">{label}</div>
              <div className="text-2xl font-black tabular-nums text-white">{Math.round(val)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl border border-white/8 p-5"
          style={{ background: "linear-gradient(135deg,rgba(200,241,53,0.05) 0%,#0f0f0f 60%)" }}
        >
          <Label>✓ Artılar</Label>
          <ul className="space-y-3">
            {result.top_pros.map((p, i) => (
              <li key={i} className="text-sm leading-snug text-white/75">
                {p.point}
                {p.source && <span className="mt-0.5 block text-[10px] text-white/25">{p.source}</span>}
              </li>
            ))}
          </ul>
        </div>
        <div
          className="rounded-2xl border border-white/8 p-5"
          style={{ background: "linear-gradient(135deg,rgba(255,107,107,0.05) 0%,#0f0f0f 60%)" }}
        >
          <Label>✕ Eksiler</Label>
          <ul className="space-y-3">
            {result.top_cons.map((c, i) => (
              <li key={i} className="text-sm leading-snug text-white/75">
                {c.point}
                {c.source && <span className="mt-0.5 block text-[10px] text-white/25">{c.source}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <Label>Kim almalı</Label>
          <ul className="space-y-2">
            {result.use_case_fit.best_for.map((x, i) => (
              <li key={i} className="flex gap-2 text-sm leading-snug text-white/60">
                <span className="shrink-0 text-[#c8f135]/50">›</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <Label>Kim almamalı</Label>
          <ul className="space-y-2">
            {result.use_case_fit.not_ideal_for.map((x, i) => (
              <li key={i} className="flex gap-2 text-sm leading-snug text-white/60">
                <span className="shrink-0 text-white/20">›</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
        <Label>Neden tercih ediliyor</Label>
        <p className="text-sm leading-relaxed text-white/70">{result.why_people_buy.main_motivation}</p>
        {result.why_people_buy.owner_satisfaction_note && (
          <p className="mt-2 text-sm leading-relaxed text-white/45">{result.why_people_buy.owner_satisfaction_note}</p>
        )}
        {result.why_people_buy.love_rate && (
          <p className="mt-3 inline-block rounded-lg border border-white/8 bg-white/5 px-3 py-1 text-xs text-white/40">
            {result.why_people_buy.love_rate}
          </p>
        )}
      </div>

      {result.chronic_issues.length > 0 && (
        <div className="rounded-2xl border border-[#ffd93d]/20 bg-[#ffd93d]/5 p-5">
          <Label>⚠ Kronik sorunlar</Label>
          <ul className="space-y-4">
            {result.chronic_issues.map((c, i) => (
              <li key={i}>
                <p className="text-sm font-semibold text-[#ffd93d]/90">{c.issue}</p>
                <p className="mt-1 text-xs text-[#ffd93d]/50">
                  {c.source_count} farklı kaynakta raporlandı · Şiddet: {c.severity}
                </p>
                {c.sources?.length ? (
                  <p className="mt-0.5 text-xs text-[#ffd93d]/35">{c.sources.join(" · ")}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-[#c8f135]/15 bg-white/3">
        <div className="pointer-events-none select-none p-6 opacity-10 blur-sm" aria-hidden>
          <div className="mb-3 h-2.5 w-3/4 rounded bg-white/30" />
          <div className="mb-2 h-2 w-full rounded bg-white/20" />
          <div className="h-2 w-5/6 rounded bg-white/20" />
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-8 py-8 text-center"
          style={{
            background: "linear-gradient(180deg,rgba(10,10,10,0.75) 0%,rgba(10,10,10,0.9) 100%)",
          }}
        >
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#c8f135]/30 bg-[#c8f135]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#c8f135]">
            ✦ Premium
          </span>
          <p className="max-w-xs text-sm font-semibold leading-relaxed text-white/80">{result.paywall_hooks.main_risk_teaser}</p>
          <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-white/40">{result.paywall_hooks.hidden_insight_teaser}</p>
          <button
            type="button"
            className="mt-5 rounded-xl bg-[#c8f135] px-6 py-2.5 text-xs font-black tracking-wide text-black transition-all hover:bg-[#d4f75a] hover:shadow-[0_0_20px_rgba(200,241,53,0.3)]"
          >
            Premium&apos;a geç →
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
        <Label>Alternatifler</Label>
        <ul className="space-y-4">
          {result.alternatives.map((a, i) => (
            <li key={i} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-white/85">{a.name}</p>
                <p className="mt-0.5 text-sm leading-snug text-white/45">{a.why}</p>
              </div>
              {a.price_diff ? (
                <span className="shrink-0 whitespace-nowrap rounded-lg border border-white/8 bg-white/5 px-2.5 py-1 text-xs text-white/40">
                  {a.price_diff}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <Label>🇹🇷 Türkiye piyasası</Label>
          <p className="text-sm leading-relaxed text-white/55">{result.market_context.TR}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <Label>🇺🇸 Global piyasa</Label>
          <p className="text-sm leading-relaxed text-white/55">{result.market_context.US}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/6 bg-white/2 px-5 py-4">
        <p className="text-xs leading-relaxed text-white/30">{result.data_integrity.confidence_reason}</p>
        <div className="shrink-0 text-right">
          <p className="text-[10px] uppercase tracking-wider text-white/20">Güven</p>
          <p className="text-sm font-bold text-white/50">{result.data_integrity.confidence}</p>
          <p className="text-[10px] text-white/20">{result.data_integrity.total_sources_count} kaynak</p>
        </div>
      </div>
    </div>
  );
}
