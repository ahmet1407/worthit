"use client";

import { ErrorAlert } from "@/components/worthit/ErrorAlert";
import { LoadingPanel } from "@/components/worthit/LoadingPanel";
import { SearchForm } from "@/components/worthit/SearchForm";
import { SiteFooter } from "@/components/worthit/SiteFooter";
import { WorthitResultView } from "@/components/worthit/WorthitResultView";
import { normalizeVerdict } from "@/components/worthit/verdict-styles";
import { useWorthitSearch } from "@/hooks/useWorthitSearch";

export default function Home() {
  const { query, setQuery, loading, loadMsgIndex, loadingMessage, loadingStepsTotal, error, result, amazonUrl, submit, clearError } = useWorthitSearch();
  const verdict = result ? normalizeVerdict(result.verdict) : null;
  const hasResult = result && verdict !== null && !loading;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className={`transition-all duration-700 ${hasResult ? "pt-8 pb-6" : "pt-24 pb-20"}`}>
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          {!hasResult && (
            <div className="mb-12 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-widest text-white/40 uppercase">
                AI Ürün Analizi
              </div>
              <h1 className="mb-4 text-6xl font-black tracking-tight text-white sm:text-7xl">
                Worth<span className="text-[#a3e635]">it</span><span className="text-white/20">?</span>
              </h1>
              <p className="mx-auto max-w-sm text-base text-white/40 leading-relaxed">
                Ürün adı veya Amazon linki yaz.<br />Al ya da alma kararını biz verelim.
              </p>
            </div>
          )}
          {hasResult && (
            <div className="mb-6 flex items-center gap-3">
              <h1 className="text-2xl font-black text-white">Worth<span className="text-[#a3e635]">it</span></h1>
              <span className="text-white/20">·</span>
              <span className="text-sm text-white/40">Yeni analiz</span>
            </div>
          )}
          <SearchForm query={query} onQueryChange={setQuery} onSubmit={submit} loading={loading} />
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
        {loading && <LoadingPanel message={loadingMessage} step={loadMsgIndex} total={loadingStepsTotal} />}
        {error && <ErrorAlert message={error} onDismiss={clearError} />}
        {hasResult && <WorthitResultView result={result} amazonUrl={amazonUrl} verdict={verdict} />}
        {!loading && !error && !result && (
          <div className="mt-4 text-center">
            <p className="text-xs text-white/20 tracking-wide">Dyson V15 Detect · Sony WH-1000XM5 · iPhone 16 · amazon.com.tr/…</p>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
