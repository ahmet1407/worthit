"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WORTHIT_LOADING_MESSAGES } from "@/lib/config/loading-messages";
import type { WorthitReport } from "@/lib/worthit/types";

const ROTATE_MS = 2200;
const LOADING = WORTHIT_LOADING_MESSAGES;

export type ProductSuggestion = {
  name: string;
  subtitle: string;
  query: string;
};

export type Disambiguation = {
  question: string;
  suggestions: ProductSuggestion[];
} | null;

export function useWorthitSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [disambiguation, setDisambiguation] = useState<Disambiguation>(null);
  const [loadMsgIndex, setLoadMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WorthitReport | null>(null);
  const [amazonUrl, setAmazonUrl] = useState<string | null>(null);
  const loadTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!loading) {
      if (loadTimer.current) {
        clearInterval(loadTimer.current);
        loadTimer.current = null;
      }
      return;
    }
    setLoadMsgIndex(0);
    loadTimer.current = setInterval(() => {
      setLoadMsgIndex((i) => (i + 1) % LOADING.length);
    }, ROTATE_MS);
    return () => {
      if (loadTimer.current) clearInterval(loadTimer.current);
    };
  }, [loading]);

  const runAnalysis = useCallback(async (q: string) => {
    setError(null);
    setResult(null);
    setAmazonUrl(null);
    setDisambiguation(null);
    setLoading(true);
    try {
      const res = await fetch("/api/worthit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İstek başarısız");
      setAmazonUrl(data.amazonUrl as string);
      setResult(data.report as WorthitReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setLoading(false);
    }
  }, []);

  const submit = useCallback(
    async (productOverride?: string) => {
      const q = (productOverride ?? query).trim();
      if (!q || loading || checking) return;

      if (productOverride !== undefined) {
        await runAnalysis(q);
        return;
      }

      setChecking(true);
      try {
        const res = await fetch("/api/worthit-disambiguate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });
        const data = (await res.json()) as {
          ambiguous: boolean;
          question?: string;
          suggestions?: ProductSuggestion[];
        };

        if (data.ambiguous && data.suggestions && data.suggestions.length >= 2) {
          setDisambiguation({
            question: data.question ?? "Hangisini kastediyorsunuz?",
            suggestions: data.suggestions,
          });
          return;
        }
      } catch {
        /* belirsizlik kontrolü başarısız → direkt analiz */
      } finally {
        setChecking(false);
      }

      await runAnalysis(q);
    },
    [query, loading, checking, runAnalysis]
  );

  const selectSuggestion = useCallback(
    async (s: ProductSuggestion) => {
      setQuery(s.name);
      setDisambiguation(null);
      await runAnalysis(s.query);
    },
    [runAnalysis]
  );

  const dismissSuggestions = useCallback(async () => {
    const q = query.trim();
    setDisambiguation(null);
    await runAnalysis(q);
  }, [query, runAnalysis]);

  const reset = useCallback(() => {
    setResult(null);
    setAmazonUrl(null);
    setError(null);
    setDisambiguation(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    query,
    setQuery,
    loading,
    checking,
    disambiguation,
    loadMsgIndex,
    loadingMessage: LOADING[loadMsgIndex] ?? LOADING[0],
    loadingStepsTotal: LOADING.length,
    error,
    result,
    amazonUrl,
    submit,
    selectSuggestion,
    dismissSuggestions,
    reset,
    clearError,
  };
}
