"use client";

import type { ReactNode } from "react";
import type { Verdict, WorthitReport } from "@/lib/worthit/types";
import { ScoreRing } from "./ScoreRing";
import { verdictConfig } from "./verdict-styles";

type Props = { result: WorthitReport; amazonUrl: string | null; verdict: Verdict };

function Divider() {
  return <div className="h-px w-full bg-[#E8E8E4]" />;
}

function Label({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9A9A9A]">{children}</p>;
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F3F0]">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${Math.min(value, 100)}%`, background: color }}
      />
    </div>
  );
}

export function WorthitResultView({ result, amazonUrl, verdict }: Props) {
  const score = result.overall_score ?? 0;
  const cfg = verdictConfig(verdict);

  return (
    <div className="fade-up space-y-4">
      <div className={`overflow-hidden rounded-2xl border border-[#E8E8E4] bg-white ${cfg.glow}`}>
        <div className="h-[3px] w-full" style={{ background: cfg.accentBar }} />
        <div className="px-6 pb-4 pt-5">
          {(result.brand || result.category) && (
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A9A9A]">
              {[result.brand, result.category].filter(Boolean).join(" · ")}
            </p>
          )}
          <h2 className="font-serif text-2xl italic leading-snug text-[#0D0D0D]">{result.product_name}</h2>
          {amazonUrl && (
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-[#9A9A9A] transition-colors hover:text-[#0D0D0D]"
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
              className={`mb-3 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold uppercase tracking-widest ${cfg.bg} ${cfg.text} ${cfg.border}`}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.labelLong}</span>
            </div>
            <p className="text-sm leading-relaxed text-[#4A4A4A]">{result.verdict_reason}</p>
          </div>
        </div>
        <Divider />
        <div className="grid grid-cols-4 divide-x divide-[#E8E8E4]">
          {(
            [
              ["Memnuniyet", result.scores.satisfaction, "#16a34a"],
              ["Kusur riski", result.scores.flaw_risk, "#C0281A"],
              ["Uzman onayı", result.scores.expert, "#2563eb"],
              ["Değer", result.scores.value, "#C05A1A"],
            ] as const
          ).map(([label, val, color]) => (
            <div key={label} className="px-4 py-5">
              <div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-[#9A9A9A]">{label}</div>
              <div className="mb-2 font-serif text-3xl italic leading-none text-[#0D0D0D]">{Math.round(val)}</div>
              <MiniBar value={val} color={color} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[#E8E8E4] bg-white p-5">
          <Label>✓ Artılar</Label>
          <ul className="space-y-3">
            {result.top_pros.map((p, i) => (
              <li key={i}>
                <p className="text-sm leading-snug text-[#0D0D0D]">{p.point}</p>
                {p.source && <p className="mt-0.5 text-[10px] text-[#9A9A9A]">{p.source}</p>}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-[#E8E8E4] bg-white p-5">
          <Label>✕ Eksiler</Label>
          <ul className="space-y-3">
            {result.top_cons.map((c, i) => (
              <li key={i}>
                <p className="text-sm leading-snug text-[#0D0D0D]">{c.point}</p>
                {c.source && <p className="mt-0.5 text-[10px] text-[#9A9A9A]">{c.source}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[#E8E8E4] bg-white p-5">
          <Label>Kim almalı</Label>
          <ul className="space-y-2">
            {result.use_case_fit.best_for.map((x, i) => (
              <li key={i} className="flex gap-2 text-sm leading-snug text-[#4A4A4A]">
                <span className="shrink-0 text-green-500">›</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-[#E8E8E4] bg-white p-5">
          <Label>Kim almamalı</Label>
          <ul className="space-y-2">
            {result.use_case_fit.not_ideal_for.map((x, i) => (
              <li key={i} className="flex gap-2 text-sm leading-snug text-[#4A4A4A]">
                <span className="shrink-0 text-[#9A9A9A]">›</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8E8E4] bg-white p-5">
        <Label>Neden tercih ediliyor</Label>
        <p className="font-serif text-base italic leading-relaxed text-[#0D0D0D]">
          {result.why_people_buy.main_motivation}
        </p>
        {result.why_people_buy.owner_satisfaction_note && (
          <p className="mt-2 text-sm font-light leading-relaxed text-[#4A4A4A]">
            {result.why_people_buy.owner_satisfaction_note}
          </p>
        )}
        {result.why_people_buy.love_rate && (
          <p className="mt-3 inline-block rounded-lg border border-[#E8E8E4] bg-[#F3F3F0] px-3 py-1 text-xs text-[#9A9A9A]">
            {result.why_people_buy.love_rate}
          </p>
        )}
      </div>

      {result.chronic_issues.length > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <Label>⚠ Kronik sorunlar</Label>
          <ul className="space-y-4">
            {result.chronic_issues.map((c, i) => (
              <li key={i}>
                <p className="text-sm font-semibold text-orange-800">{c.issue}</p>
                <p className="mt-1 text-xs font-light text-orange-600">
                  {c.source_count} farklı kaynakta raporlandı · Şiddet: {c.severity}
                </p>
                {c.sources?.length ? (
                  <p className="mt-0.5 text-xs text-orange-500">{c.sources.join(" · ")}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-[#E8E8E4] bg-white">
        <div className="pointer-events-none select-none p-6 opacity-10 blur-sm" aria-hidden>
          <div className="mb-3 h-3 w-3/4 rounded bg-[#E8E8E4]" />
          <div className="mb-2 h-2 w-full rounded bg-[#F3F3F0]" />
          <div className="h-2 w-5/6 rounded bg-[#F3F3F0]" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 px-8 py-8 text-center backdrop-blur-sm">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E8E4] bg-[#F3F3F0] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#4A4A4A]">
            ✦ Premium
          </span>
          <p className="max-w-xs font-serif text-base italic leading-relaxed text-[#0D0D0D]">
            {result.paywall_hooks.main_risk_teaser}
          </p>
          <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[#9A9A9A]">{result.paywall_hooks.hidden_insight_teaser}</p>
          <button
            type="button"
            className="mt-5 rounded-xl bg-[#0D0D0D] px-6 py-2.5 text-xs font-bold tracking-wide text-white transition-all hover:opacity-80"
          >
            Premium&apos;a geç — $1/analiz →
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8E8E4] bg-white p-5">
        <Label>Alternatifler</Label>
        <ul className="space-y-4">
          {result.alternatives.map((a, i) => (
            <li key={i} className="flex items-start justify-between gap-4 border-t border-[#F3F3F0] pt-4 first:border-t-0 first:pt-0">
              <div>
                <p className="text-sm font-semibold text-[#0D0D0D]">{a.name}</p>
                <p className="mt-0.5 text-sm font-light leading-snug text-[#4A4A4A]">{a.why}</p>
              </div>
              {a.price_diff ? (
                <span className="shrink-0 whitespace-nowrap rounded-lg border border-[#E8E8E4] bg-[#F3F3F0] px-2.5 py-1 text-xs text-[#9A9A9A]">
                  {a.price_diff}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[#E8E8E4] bg-white p-5">
          <Label>🇹🇷 Türkiye piyasası</Label>
          <p className="text-sm font-light leading-relaxed text-[#4A4A4A]">{result.market_context.TR}</p>
        </div>
        <div className="rounded-2xl border border-[#E8E8E4] bg-white p-5">
          <Label>🇺🇸 Global piyasa</Label>
          <p className="text-sm font-light leading-relaxed text-[#4A4A4A]">{result.market_context.US}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E8E8E4] bg-[#FAFAF8] px-5 py-4">
        <p className="text-xs font-light leading-relaxed text-[#9A9A9A]">{result.data_integrity.confidence_reason}</p>
        <div className="shrink-0 text-right">
          <p className="text-[10px] uppercase tracking-wider text-[#9A9A9A]">Güven</p>
          <p className="text-sm font-semibold text-[#4A4A4A]">{result.data_integrity.confidence}</p>
          <p className="text-[10px] text-[#9A9A9A]">{result.data_integrity.total_sources_count} kaynak</p>
        </div>
      </div>
    </div>
  );
}
