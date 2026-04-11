"use client";

import { ErrorAlert } from "@/components/scorecard/ErrorAlert";
import { LoadingPanel } from "@/components/scorecard/LoadingPanel";
import { ScorecardResultView } from "@/components/scorecard/ScorecardResultView";
import { SearchForm } from "@/components/scorecard/SearchForm";
import { SiteFooter } from "@/components/scorecard/SiteFooter";
import { normalizeVerdict } from "@/components/scorecard/verdict-styles";
import { useScorecardSearch } from "@/hooks/useScorecardSearch";

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
  } = useScorecardSearch();

  const verdict = result ? normalizeVerdict(result.verdict) : null;

  return (
    <div className="min-h-screen bg-mesh">
      <main className="mx-auto max-w-3xl px-4 pb-8 pt-14 sm:px-6 sm:pt-20">
        <header className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600/90">
            Ürün kararı
          </p>
          <h1 className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Scorecard
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600">
            Ürün adını yaz; Amazon verisi ve yapay zeka ile skor, artı/eksi ve özet karar görüntülensin.
          </p>
        </header>

        <SearchForm
          query={query}
          onQueryChange={setQuery}
          onSubmit={submit}
          loading={loading}
        />

        <div className="mt-10 space-y-8">
          {loading && (
            <LoadingPanel
              message={loadingMessage}
              step={loadMsgIndex}
              total={loadingStepsTotal}
            />
          )}

          {error && (
            <ErrorAlert message={error} onDismiss={clearError} />
          )}

          {result && verdict !== null && !loading && (
            <ScorecardResultView result={result} amazonUrl={amazonUrl} verdict={verdict} />
          )}

          {!loading && !error && !result && (
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-200/90 bg-white/50 px-6 py-10 text-center text-sm text-slate-500 backdrop-blur-sm">
              <p className="font-medium text-slate-600">Henüz arama yok</p>
              <p className="mt-2 leading-relaxed">
                Yukarıya marka + model yazıp <strong className="text-slate-700">Skorla</strong>ya bas. Sonuç burada
                kart olarak açılır.
              </p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
