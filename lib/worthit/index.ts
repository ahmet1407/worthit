/**
 * Worthit domain: arama → scrape → Claude. API route’ları buradan import etmeli.
 *
 * Genişletme: `persistence.ts` (DB), `pipeline.ts` (çoklu kaynak), ödeme ayrı katmanda.
 */

export { runWorthitPipeline, pickFirstAmazonProductUrl } from "./pipeline";
export type { WorthitPersistence } from "./persistence";
export { getWorthitPersistence } from "./persistence";
export type {
  Confidence,
  ScrapedAmazonPayload,
  Sentiment,
  SignalLevel,
  Verdict,
  WorthitReport,
} from "./types";
