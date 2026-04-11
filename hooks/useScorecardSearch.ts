"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SCORECARD_LOADING_MESSAGES } from "@/lib/config/loading-messages";
import type { ScorecardResult } from "@/lib/scorecard/types";

const ROTATE_MS = 2200;
const LOADING = SCORECARD_LOADING_MESSAGES;

export function useScorecardSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadMsgIndex, setLoadMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScorecardResult | null>(null);
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

  const submit = useCallback(async () => {
    const q = query.trim();
    if (!q || loading) return;
    setError(null);
    setResult(null);
    setAmazonUrl(null);
    setLoading(true);
    try {
      const res = await fetch("/api/scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İstek başarısız");
      setAmazonUrl(data.amazonUrl as string);
      setResult(data.scorecard as ScorecardResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [query, loading]);

  const reset = useCallback(() => {
    setResult(null);
    setAmazonUrl(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    query,
    setQuery,
    loading,
    loadMsgIndex,
    loadingMessage: LOADING[loadMsgIndex] ?? LOADING[0],
    loadingStepsTotal: LOADING.length,
    error,
    result,
    amazonUrl,
    submit,
    reset,
    clearError,
  };
}
