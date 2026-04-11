import Anthropic from "@anthropic-ai/sdk";
import { SCORECARD_SYSTEM_PROMPT } from "./system-prompt";
import type { ScrapedAmazonPayload, ScorecardResult, Verdict } from "./types";

function coerceVerdict(v: unknown): Verdict {
  const s = String(v ?? "")
    .replace(/\s+/g, "")
    .toUpperCase();
  if (s.includes("SKIP")) return "SKIP";
  if (s.includes("WAIT")) return "WAIT";
  if (s.includes("BUY")) return "BUY";
  return "WAIT";
}

const AMAZON_URL_RE = /https?:\/\/(?:www\.)?amazon\.(?:com|co\.uk|de|fr|es|it|nl|se|pl|com\.tr|ca|com\.au|in|co\.jp|sg|ae|sa|mx|br)\/(?:[\w-]+\/)?(?:dp|gp\/product)\/([A-Z0-9]{10})/i;

export function pickFirstAmazonProductUrl(results: { url?: string }[]): string | null {
  for (const r of results) {
    const u = r.url;
    if (!u) continue;
    if (AMAZON_URL_RE.test(u) && !u.includes("/browse") && !u.includes("/stores")) {
      return u.split("?")[0];
    }
  }
  return null;
}

export async function tavilySearchAmazon(productName: string): Promise<string> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw new Error("TAVILY_API_KEY eksik");

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      query: `${productName} site:amazon.com OR site:amazon.co.uk OR site:amazon.com.tr`,
      search_depth: "advanced",
      max_results: 12,
      include_answer: false,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Tavily hatası: ${res.status} ${t}`);
  }

  const data = (await res.json()) as { results?: { url: string; title?: string }[] };
  const url = pickFirstAmazonProductUrl(data.results ?? []);
  if (!url) throw new Error("Amazon ürün URL’si bulunamadı. Farklı bir arama deneyin.");
  return url;
}

function extractAsin(url: string): string | null {
  const m = url.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return m ? m[1] : null;
}

async function firecrawlScrapeUrl(url: string): Promise<string> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY eksik");

  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
      timeout: 120000,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Firecrawl hatası: ${res.status} ${t}`);
  }

  const json = (await res.json()) as {
    success?: boolean;
    data?: { markdown?: string; content?: string };
    error?: string;
  };

  if (!json.success && json.error) throw new Error(json.error);
  const md = json.data?.markdown ?? json.data?.content ?? "";
  if (!md.trim()) throw new Error("Firecrawl boş içerik döndü.");
  return md;
}

/** Pull star rating from common Amazon markdown patterns */
function parseStarRating(markdown: string): string {
  const patterns = [
    /(\d+[.,]\d+)\s*out of 5 stars/i,
    /(\d+[.,]\d+)\s*\/\s*5\s*yıldız/i,
    /(\d+[.,]\d+)\s*yıldızdan\s*(\d+[.,]\d+)/i,
    /Ortalama:\s*(\d+[.,]\d+)/i,
    /\b(\d+[.,]\d+)\s*⭐/,
  ];
  for (const p of patterns) {
    const m = markdown.match(p);
    if (m) return m[1].replace(",", ".");
  }
  return "bilinmiyor";
}

function parseReviewCount(markdown: string): string {
  const patterns = [
    /([\d.,]+)\s*(?:global\s*)?ratings?/i,
    /([\d.,]+)\s*yorum/i,
    /([\d.,]+)\s*değerlendirme/i,
    /Ratings?\s*([\d.,]+)/i,
  ];
  for (const p of patterns) {
    const m = markdown.match(p);
    if (m) return m[1];
  }
  return "bilinmiyor";
}

function parseTitle(markdown: string): string {
  const lines = markdown.split("\n").map((l) => l.trim()).filter(Boolean);
  const h1 = lines.find((l) => l.startsWith("# "));
  if (h1) return h1.replace(/^#\s+/, "").slice(0, 500);
  const skip = /^(skip|amazon|sign in|hello)/i;
  for (const l of lines.slice(0, 25)) {
    if (l.length > 15 && l.length < 400 && !skip.test(l)) return l.slice(0, 500);
  }
  return lines[0]?.slice(0, 500) ?? "Başlık çıkarılamadı";
}

function parseBreadcrumb(markdown: string): string {
  const m = markdown.match(/(?:›|>)\s*([^\n]+(?:\s*(?:›|>)\s*[^\n]+){1,8})/);
  if (m) return m[1].replace(/\s+/g, " ").trim().slice(0, 400);
  return "bilinmiyor";
}

type ReviewChunk = { stars: number; text: string };

function extractReviewChunks(markdown: string): ReviewChunk[] {
  const chunks: ReviewChunk[] = [];
  const blocks = markdown.split(/\n{2,}/);

  for (const block of blocks) {
    const star =
      block.match(/(\d)\s*out of 5 stars/i) ||
      block.match(/(\d)\s*\/\s*5/) ||
      block.match(/(\d)\.0\s*out of 5/i);
    if (!star) continue;
    const n = parseInt(star[1], 10);
    if (n < 1 || n > 5) continue;
    const text = block.replace(/\s+/g, " ").trim();
    if (text.length < 40) continue;
    chunks.push({ stars: n, text: text.slice(0, 1200) });
  }

  chunks.sort((a, b) => a.stars - b.stars);
  return chunks;
}

function reviewsUrlFromProductUrl(productUrl: string): string | null {
  const asin = extractAsin(productUrl);
  if (!asin) return null;
  let host: string;
  try {
    host = new URL(productUrl).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  const domain = host.includes("amazon.") ? host : `www.${host}`;
  return `https://${domain}/product-reviews/${asin}/ref=cm_cr_arp_d_viewopt_srt?ie=UTF8&reviewerType=all_reviews&sortBy=helpful&filterByStar=one_star&pageNumber=1`;
}

export async function scrapeAmazonForScorecard(productUrl: string): Promise<ScrapedAmazonPayload> {
  const [mainMd, reviewsMd] = await Promise.all([
    firecrawlScrapeUrl(productUrl),
    (async () => {
      const ru = reviewsUrlFromProductUrl(productUrl);
      if (!ru) return "";
      try {
        return await firecrawlScrapeUrl(ru);
      } catch {
        return "";
      }
    })(),
  ]);

  const combined = `${mainMd}\n\n---\n\n## Düşük puanlı yorumlar sayfası\n\n${reviewsMd}`;
  const title = parseTitle(mainMd);
  const breadcrumb = parseBreadcrumb(mainMd);
  const starRating = parseStarRating(mainMd);
  const reviewCount = parseReviewCount(mainMd);

  const fromCombined = extractReviewChunks(combined);
  const topLow = fromCombined.slice(0, 20);
  const lowestReviewsText =
    topLow.length > 0
      ? topLow.map((r, i) => `${i + 1}. [${r.stars}★] ${r.text}`).join("\n\n")
      : combined.slice(0, 8000);

  const maxExcerpt = 14_000;
  const markdownExcerpt =
    combined.length > maxExcerpt
      ? `${combined.slice(0, maxExcerpt)}\n\n[…içerik kısaltıldı]`
      : combined;

  return {
    title,
    breadcrumb,
    starRating,
    reviewCount,
    lowestReviewsText,
    markdownExcerpt,
    sourceUrl: productUrl,
  };
}

function buildUserMessage(productName: string, s: ScrapedAmazonPayload): string {
  return `Ürün: ${productName}

Amazon'dan çekilen veriler:
- Başlık: ${s.title}
- Kategori: ${s.breadcrumb}
- Puan: ${s.starRating} (${s.reviewCount} yorum)
- En düşük puanlı yorumlar: ${s.lowestReviewsText}

Bu ürünü analiz et ve yukarıdaki JSON formatında yanıt ver.

Ek bağlam (Firecrawl markdown özeti, URL: ${s.sourceUrl}):
---
${s.markdownExcerpt}
---`;
}

function extractJsonFromClaudeText(text: string): ScorecardResult {
  let t = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m;
  const fm = t.match(fence);
  if (fm) t = fm[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Claude yanıtında JSON bulunamadı.");
  t = t.slice(start, end + 1);
  const raw = JSON.parse(t) as Partial<ScorecardResult>;
  return normalizeScorecard(raw);
}

function normalizeScorecard(raw: Partial<ScorecardResult>): ScorecardResult {
  const emptyScores = { satisfaction: 0, flaw_risk: 0, expert: 0, value: 0 };
  const emptyTrust = {
    platform_rating: 0,
    scorecard_true_score: 0,
    fake_review_signal: "LOW" as const,
    hype_reality_gap: "LOW" as const,
    hype_note: "",
    influencer_vs_real: { influencer_score: 0, real_user_score: 0, gap: "LOW" as const },
    price_adjusted_score: { raw_score: 0, adjusted: 0, note: "" },
    review_count_signal: { count: 0, threshold_met: false, note: "" },
  };
  return {
    product_name: raw.product_name ?? "",
    brand: raw.brand ?? "",
    category: raw.category ?? "",
    overall_score: Number(raw.overall_score) || 0,
    verdict: coerceVerdict(raw.verdict),
    verdict_reason: raw.verdict_reason ?? "",
    scores: { ...emptyScores, ...raw.scores },
    trust_signals: {
      ...emptyTrust,
      ...raw.trust_signals,
      influencer_vs_real: {
        ...emptyTrust.influencer_vs_real,
        ...raw.trust_signals?.influencer_vs_real,
      },
      price_adjusted_score: {
        ...emptyTrust.price_adjusted_score,
        ...raw.trust_signals?.price_adjusted_score,
      },
      review_count_signal: {
        ...emptyTrust.review_count_signal,
        ...raw.trust_signals?.review_count_signal,
      },
    },
    recency: {
      last_90_days_sentiment: raw.recency?.last_90_days_sentiment ?? "mixed",
      quality_change_detected: Boolean(raw.recency?.quality_change_detected),
      recency_note: raw.recency?.recency_note ?? "",
    },
    chronic_issues: Array.isArray(raw.chronic_issues) ? raw.chronic_issues : [],
    top_pros: Array.isArray(raw.top_pros) ? raw.top_pros : [],
    top_cons: Array.isArray(raw.top_cons) ? raw.top_cons : [],
    paywall_hooks: {
      main_risk_teaser: raw.paywall_hooks?.main_risk_teaser ?? "",
      hidden_insight_teaser: raw.paywall_hooks?.hidden_insight_teaser ?? "",
    },
    premium_data: {
      main_risk_revealed: raw.premium_data?.main_risk_revealed ?? "",
      hidden_insight_revealed: raw.premium_data?.hidden_insight_revealed ?? "",
    },
    use_case_fit: {
      best_for: raw.use_case_fit?.best_for ?? [],
      not_ideal_for: raw.use_case_fit?.not_ideal_for ?? [],
    },
    why_people_buy: {
      main_motivation: raw.why_people_buy?.main_motivation ?? "",
      owner_satisfaction_note: raw.why_people_buy?.owner_satisfaction_note ?? "",
      love_rate: raw.why_people_buy?.love_rate ?? "",
    },
    alternatives: Array.isArray(raw.alternatives) ? raw.alternatives : [],
    market_context: {
      TR: raw.market_context?.TR ?? "",
      US: raw.market_context?.US ?? "",
    },
    data_integrity: {
      sources_analyzed: raw.data_integrity?.sources_analyzed ?? [],
      total_sources_count: raw.data_integrity?.total_sources_count ?? 0,
      confidence: raw.data_integrity?.confidence ?? "INSUFFICIENT_DATA",
      confidence_reason: raw.data_integrity?.confidence_reason ?? "",
    },
  };
}

export async function analyzeWithClaude(
  productName: string,
  scraped: ScrapedAmazonPayload
): Promise<ScorecardResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY eksik");

  // Retired IDs (Anthropic returns 404) — ignore if still present in .env.local.
  const RETIRED = /^claude-3-5-sonnet-20241022$/i;
  const fromEnv = process.env.ANTHROPIC_MODEL?.trim();
  const fallback = "claude-sonnet-4-20250514";
  const model =
    fromEnv && !RETIRED.test(fromEnv) ? fromEnv : fallback;
  const client = new Anthropic({ apiKey: key });
  const userContent = buildUserMessage(productName, scraped);

  const msg = await client.messages.create({
    model,
    max_tokens: 8192,
    system: SCORECARD_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });

  const block = msg.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("Claude metin yanıtı döndürmedi.");
  return extractJsonFromClaudeText(block.text);
}

export async function runScorecardPipeline(productName: string): Promise<{
  amazonUrl: string;
  scorecard: ScorecardResult;
}> {
  const trimmed = productName.trim();
  if (!trimmed) throw new Error("Ürün adı gerekli.");

  const amazonUrl = await tavilySearchAmazon(trimmed);
  const scraped = await scrapeAmazonForScorecard(amazonUrl);
  const scorecard = await analyzeWithClaude(trimmed, scraped);

  return { amazonUrl, scorecard };
}
