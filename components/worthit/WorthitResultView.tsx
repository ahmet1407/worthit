"use client";

import type { Verdict, WorthitReport } from "@/lib/worthit/types";
import { ScoreRing } from "./ScoreRing";
import { verdictBadgeClass } from "./verdict-styles";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
      {children}
    </h2>
  );
}

type Props = {
  result: WorthitReport;
  amazonUrl: string | null;
  verdict: Verdict;
};

export function WorthitResultView({ result, amazonUrl, verdict }: Props) {
  const score = result.overall_score ?? 0;

  return (
    <article className="mx-auto w-full max-w-2xl space-y-8 rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-sm sm:p-10">
      <header className="space-y-1 border-b border-slate-100 pb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-indigo-600/90">
          {result.brand && result.category
            ? `${result.brand} · ${result.category}`
            : result.product_name || "Ürün raporu"}
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {result.product_name}
        </h2>
        {amazonUrl && (
          <p className="pt-2 text-sm text-slate-500">
            Kaynak:{" "}
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 underline decoration-indigo-200 underline-offset-2 hover:text-indigo-800"
            >
              Amazon ürün sayfası
            </a>
          </p>
        )}
      </header>

      <div className="flex flex-col items-center gap-5 border-b border-slate-100 pb-10">
        <ScoreRing score={score} verdict={verdict} />
        <span
          className={`rounded-full px-5 py-2 text-sm font-bold uppercase tracking-widest ${verdictBadgeClass(verdict)}`}
        >
          {verdict}
        </span>
        <p className="max-w-lg text-center text-sm leading-relaxed text-slate-600">
          {result.verdict_reason}
        </p>
        <div className="grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ["Memnuniyet", result.scores.satisfaction],
              ["Kusur riski", result.scores.flaw_risk],
              ["Uzman", result.scores.expert],
              ["Değer", result.scores.value],
            ] as const
          ).map(([label, val]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-100 bg-slate-50/90 py-3 text-center"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </div>
              <div className="mt-1 text-xl font-bold tabular-nums text-slate-900">
                {Math.round(val)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <section>
        <SectionTitle>Artılar</SectionTitle>
        <ul className="space-y-2">
          {result.top_pros.map((p, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl border border-emerald-100/80 bg-emerald-50/40 px-4 py-3 text-sm text-slate-800"
            >
              <span className="mt-0.5 shrink-0 font-semibold text-emerald-600" aria-hidden>
                ✓
              </span>
              <span>
                {p.point}
                <span className="mt-1 block text-xs text-slate-500">{p.source}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionTitle>Eksiler</SectionTitle>
        <ul className="space-y-2">
          {result.top_cons.map((c, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl border border-red-100/80 bg-red-50/40 px-4 py-3 text-sm text-slate-800"
            >
              <span className="mt-0.5 shrink-0 font-semibold text-red-600" aria-hidden>
                ✕
              </span>
              <span>
                {c.point}
                <span className="mt-1 block text-xs text-slate-500">{c.source}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <SectionTitle>Kimler için</SectionTitle>
          <ul className="space-y-1.5 text-sm text-slate-700">
            {result.use_case_fit.best_for.map((x, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-600">·</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionTitle>Kimler için değil</SectionTitle>
          <ul className="space-y-1.5 text-sm text-slate-700">
            {result.use_case_fit.not_ideal_for.map((x, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-slate-400">·</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
        <SectionTitle>Neden tercih ediliyor</SectionTitle>
        <p className="text-sm leading-relaxed text-slate-800">{result.why_people_buy.main_motivation}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {result.why_people_buy.owner_satisfaction_note}
        </p>
        <p className="mt-2 text-xs text-slate-500">{result.why_people_buy.love_rate}</p>
      </section>

      {result.chronic_issues.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-amber-800">
            Kronik sorunlar
          </h2>
          <ul className="space-y-2">
            {result.chronic_issues.map((c, i) => (
              <li
                key={i}
                className="rounded-xl border border-amber-200/90 bg-amber-50/80 px-4 py-3 text-sm text-amber-950"
              >
                <div className="font-semibold">{c.issue}</div>
                <div className="mt-1 text-xs text-amber-900/85">
                  Kaynak: {c.source_count} · Şiddet: {c.severity}
                </div>
                {c.sources?.length > 0 && (
                  <div className="mt-1 text-xs text-amber-800/90">{c.sources.join(" · ")}</div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="relative overflow-hidden rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 via-white to-slate-50/80">
        <div className="pointer-events-none select-none p-8 opacity-35 blur-md" aria-hidden>
          <div className="h-2.5 w-3/4 rounded-full bg-slate-300" />
          <div className="mt-4 h-2.5 w-full rounded-full bg-slate-200" />
          <div className="mt-3 h-2.5 w-5/6 rounded-full bg-slate-200" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75 px-6 text-center backdrop-blur-[3px]">
          <span className="rounded-full bg-violet-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            Premium
          </span>
          <p className="mt-4 max-w-sm text-sm font-medium text-slate-800">
            {result.paywall_hooks.main_risk_teaser}
          </p>
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-600">
            {result.paywall_hooks.hidden_insight_teaser}
          </p>
        </div>
      </section>

      <section>
        <SectionTitle>Alternatifler</SectionTitle>
        <ul className="space-y-2">
          {result.alternatives.map((a, i) => (
            <li
              key={i}
              className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm"
            >
              <span className="font-semibold text-slate-900">{a.name}</span>
              <p className="mt-1 text-slate-600">{a.why}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{a.price_diff}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 border-t border-slate-100 pt-8 sm:grid-cols-2">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">TR bağlam</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{result.market_context.TR}</p>
        </div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">US bağlam</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{result.market_context.US}</p>
        </div>
      </section>

      <footer className="border-t border-slate-100 pt-6 text-xs leading-relaxed text-slate-500">
        <p>
          Güven: <strong className="text-slate-700">{result.data_integrity.confidence}</strong> —{" "}
          {result.data_integrity.confidence_reason}
        </p>
        <p className="mt-2">Kaynak sayısı: {result.data_integrity.total_sources_count}</p>
      </footer>
    </article>
  );
}
