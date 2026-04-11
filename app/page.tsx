"use client";

import { useEffect, useState } from "react";
import { ErrorAlert } from "@/components/worthit/ErrorAlert";
import { LoadingPanel } from "@/components/worthit/LoadingPanel";
import { SearchForm } from "@/components/worthit/SearchForm";
import { SiteFooter } from "@/components/worthit/SiteFooter";
import { WorthitResultView } from "@/components/worthit/WorthitResultView";
import { normalizeVerdict } from "@/components/worthit/verdict-styles";
import { useWorthitSearch } from "@/hooks/useWorthitSearch";

const TICKER_ITEMS = [
  { name: "Sony WH-1000XM5", verdict: "AL", score: 88 },
  { name: "Dyson V15 Detect", verdict: "AL", score: 91 },
  { name: "iPhone 16 Pro", verdict: "AL", score: 85 },
  { name: "Samsung S25 Ultra", verdict: "BEKLE", score: 72 },
  { name: "AirPods Pro 2", verdict: "AL", score: 83 },
  { name: "Xiaomi Watch S3", verdict: "BEKLE", score: 64 },
  { name: "Nespresso Vertuo", verdict: "AL", score: 79 },
  { name: "Oral-B iO Series 9", verdict: "AL", score: 86 },
  { name: "Garmin Fenix 8", verdict: "AL", score: 90 },
  { name: "Philips Hue Starter", verdict: "BEKLE", score: 68 },
] as const;

const VC: Record<string, string> = { AL: "#c8f135", BEKLE: "#ffd93d", ALMA: "#ff6b6b" };

function TickerBar() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-b border-white/5 bg-white/2 py-2.5">
      <div className="ticker-track flex gap-10 whitespace-nowrap" style={{ width: "max-content" }}>
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2.5 text-xs">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: VC[item.verdict] ?? "#fff" }} />
            <span className="font-medium text-white/50">{item.name}</span>
            <span className="text-[10px] font-black" style={{ color: VC[item.verdict] }}>
              {item.verdict}
            </span>
            <span className="text-white/20">{item.score}/100</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function LiveCounter() {
  const [count, setCount] = useState(2847);
  useEffect(() => {
    const t = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 3)), 7000);
    return () => clearInterval(t);
  }, []);
  return <>{count.toLocaleString("tr-TR")}</>;
}

export default function Home() {
  const {
    query,
    setQuery,
    loading,
    loadMsgIndex,
    loadingMessage,
    loadingStepsTotal,
    error,
    result,
    amazonUrl,
    submit,
    clearError,
    reset,
  } = useWorthitSearch();
  const verdict = result ? normalizeVerdict(result.verdict) : null;
  const hasResult = result && verdict !== null && !loading;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <TickerBar />

      <div className={`transition-all duration-700 ${hasResult ? "pb-6 pt-8" : "pb-12 pt-14"}`}>
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          {!hasResult && (
            <>
              <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
                {(
                  [
                    ["Ücretsiz", "kayıt gerekmez"],
                    ["~60sn", "analiz süresi"],
                  ] as const
                ).map(([v, l]) => (
                  <div
                    key={v}
                    className="flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-4 py-1.5"
                  >
                    <span className="text-xs font-black text-white/70">{v}</span>
                    <span className="text-xs text-white/35">{l}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-4 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c8f135] pulse-glow" />
                  <span className="text-xs font-black text-white/70">
                    <LiveCounter />
                  </span>
                  <span className="text-xs text-white/35">bu hafta analiz edildi</span>
                </div>
              </div>

              <div className="mb-8 text-center">
                <h1 className="text-7xl font-black tracking-tight text-white sm:text-8xl">
                  Worth
                  <span style={{ color: "#c8f135", textShadow: "0 0 40px rgba(200,241,53,0.35)" }}>it</span>
                  <span className="text-white/15">?</span>
                </h1>
                <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-white/40">
                  Ürün adı veya Amazon linki yaz.
                  <br />
                  <span className="font-medium text-white/65">Al ya da alma kararını biz verelim.</span>
                </p>
              </div>
            </>
          )}

          {hasResult && (
            <div className="mb-6 flex items-center gap-3">
              <h1 className="text-2xl font-black text-white">
                Worth<span style={{ color: "#c8f135" }}>it</span>
              </h1>
              <span className="text-white/20">·</span>
              <button
                type="button"
                onClick={() => {
                  reset();
                  clearError();
                }}
                className="text-sm text-white/40 transition-colors hover:text-white/70"
              >
                Yeni analiz
              </button>
            </div>
          )}

          <SearchForm query={query} onQueryChange={setQuery} onSubmit={submit} loading={loading} />

          {!hasResult && !loading && (
            <p className="mt-3 text-center text-xs tracking-wide text-white/20">
              Dyson V15 · Sony WH-1000XM5 · iPhone 16 · amazon.com.tr/dp/...
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
        {loading && <LoadingPanel message={loadingMessage} step={loadMsgIndex} total={loadingStepsTotal} />}
        {error && <ErrorAlert message={error} onDismiss={clearError} />}
        {hasResult && <WorthitResultView result={result} amazonUrl={amazonUrl} verdict={verdict} />}
      </div>

      <SiteFooter />
    </div>
  );
}
