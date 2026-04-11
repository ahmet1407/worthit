/**
 * Scorecard domain: arama → scrape → Claude. API route’ları buradan import etmeli.
 *
 * Genişletme noktaları:
 * - `persistence.ts` — skor geçmişi, cache, kullanıcı (DB)
 * - `pipeline.ts` — ek Tavily/Firecrawl adımları, kategori bazlı sorgular
 * - Ödeme: route veya middleware’de; pipeline’dan bağımsız tutulmalı
 */

export { runScorecardPipeline, pickFirstAmazonProductUrl } from "./pipeline";
export type { ScorecardPersistence } from "./persistence";
export { getScorecardPersistence } from "./persistence";
export type {
  Confidence,
  ScorecardResult,
  ScrapedAmazonPayload,
  Sentiment,
  SignalLevel,
  Verdict,
} from "./types";
