import Anthropic from "@anthropic-ai/sdk";
import { WORTHIT_SYSTEM_PROMPT } from "./system-prompt";
import type { ScrapedAmazonPayload, Verdict, WorthitReport } from "./types";

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

function sortResultsPreferAmazonTr<T extends { url?: string }>(results: T[]): T[] {
  return [...results].sort((a, b) => {
    const sa = a.url?.includes("amazon.com.tr") ? 0 : 1;
    const sb = b.url?.includes("amazon.com.tr") ? 0 : 1;
    return sa - sb;
  });
}

export function pickFirstAmazonProductUrl(results: { url?: string }[]): string | null {
  const ordered = sortResultsPreferAmazonTr(results);
  for (const r of ordered) {
    const u = r.url;
    if (!u) continue;
    if (AMAZON_URL_RE.test(u) && !u.includes("/browse") && !u.includes("/stores")) {
      return u.split("?")[0];
    }
  }
  return null;
}

function asinFromProductUrl(u: string): string | null {
  const m = u.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return m ? m[1].toUpperCase() : null;
}

function urlsForAsin(asin: string): string[] {
  return [
    `https://www.amazon.com.tr/dp/${asin}`,
    `https://www.amazon.com/dp/${asin}`,
    `https://www.amazon.co.uk/dp/${asin}`,
    `https://www.amazon.de/dp/${asin}`,
  ];
}

function cleanAmazonUrl(raw: string): string {
  try {
    const u = new URL(raw.trim().split(/\s/)[0].split("?")[0]);
    if (!AMAZON_URL_RE.test(u.href)) return raw.trim();
    return `${u.origin}${u.pathname}`.replace(/\/$/, "");
  } catch {
    return raw.trim();
  }
}

/** Metinde yapıştırılmış Amazon linki */
function extractPastedAmazonUrl(text: string): string | null {
  const m = text.match(/https?:\/\/(?:www\.)?amazon\.[a-z.]+\/(?:[\w-]+\/)?(?:dp|gp\/product)\/[A-Z0-9]{10}/i);
  return m ? cleanAmazonUrl(m[0]) : null;
}

/** Sadece ASIN veya metin içinde ASIN */
function extractAsinFromUserQuery(q: string): string | null {
  const pasted = extractPastedAmazonUrl(q);
  if (pasted) return asinFromProductUrl(pasted);
  const compact = q.replace(/\s/g, "");
  if (/^[A-Z0-9]{10}$/i.test(compact)) return compact.toUpperCase();
  const bm = q.match(/\b(B[0-9A-Z]{9})\b/i);
  if (bm) return bm[1]!.toUpperCase();
  return null;
}

function simplifyProductQuery(q: string): string {
  const noUrl = q.replace(/https?:\/\/\S+/gi, " ").trim();
  // Harf/rakam: ASCII + Türkçe + yaygın Latin uzantıları (\p{L}\p{N} yerine — eski TS hedefiyle uyumlu)
  const s = noUrl
    .replace(/[^a-zA-Z0-9ĞğÜüŞşİıÖöÇç\u00C0-\u024F\u0400-\u04FF\s+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (s.length >= 3 ? s : noUrl).slice(0, 140);
}

/** Aynı ASIN’in farklı ülke mağazalarını koru; yalnızca (asin|host) tekrarını at */
function dedupeAmazonUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    const u = raw.split("?")[0];
    const a = asinFromProductUrl(u);
    if (!a) continue;
    let host = "";
    try {
      host = new URL(u).hostname.toLowerCase();
    } catch {
      continue;
    }
    const key = `${a}|${host}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(u);
  }
  return out;
}

async function tavilySearchBody(body: Record<string, unknown>): Promise<{ results?: { url: string }[] }> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw new Error("TAVILY_API_KEY eksik");
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      search_depth: "advanced",
      max_results: 20,
      include_answer: false,
      ...body,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Tavily hatası: ${res.status} ${t}`);
  }
  return (await res.json()) as { results?: { url: string }[] };
}

async function tavilyCollectAmazonUrls(searchQuery: string): Promise<string[]> {
  const q = searchQuery.trim();
  const simple = simplifyProductQuery(q);
  const strategies: Record<string, unknown>[] = [
    { query: q, include_domains: ["amazon.com.tr"] },
    { query: `${q} alışveriş`, include_domains: ["amazon.com.tr"] },
    { query: `${q} site:amazon.com.tr` },
    { query: `${q} site:amazon.com OR site:amazon.com.tr OR site:amazon.co.uk` },
    { query: simple !== q ? simple : `${q} amazon`, include_domains: ["amazon.com.tr"] },
    { query: `${simple} amazon dp`, max_results: 15 },
    { query: `${simple} buy amazon`, max_results: 15 },
  ];

  const found = new Map<string, string>();
  for (const s of strategies) {
    try {
      const data = await tavilySearchBody(s);
      for (const r of sortResultsPreferAmazonTr(data.results ?? [])) {
        const u = r.url;
        if (!u || !AMAZON_URL_RE.test(u)) continue;
        if (u.includes("/browse") || u.includes("/stores") || u.includes("/gp/browse")) continue;
        const clean = u.split("?")[0];
        const a = asinFromProductUrl(clean);
        if (a && !found.has(a)) found.set(a, clean);
      }
      if (found.size >= 4) break;
    } catch {
      /* sonraki strateji */
    }
  }

  const list = sortResultsPreferAmazonTr(Array.from(found.values(), (url) => ({ url }))).map((x) => x.url!);
  return list;
}

/** Tavily + yapıştırılan URL/ASIN + bölge varyantları — sırayla dene */
export async function resolveAmazonProductPageUrls(userInput: string): Promise<string[]> {
  const raw = userInput.trim();
  const collected: string[] = [];

  const pasted = extractPastedAmazonUrl(raw);
  if (pasted) collected.push(pasted);

  const asinOnly = extractAsinFromUserQuery(raw);
  if (asinOnly && !pasted) {
    for (const u of urlsForAsin(asinOnly)) {
      collected.push(u);
    }
  }

  const searchPart = simplifyProductQuery(raw) || raw;
  let tavilyUrls: string[] = [];
  try {
    tavilyUrls = await tavilyCollectAmazonUrls(searchPart);
  } catch {
    tavilyUrls = [];
  }

  for (const u of tavilyUrls) {
    if (!collected.includes(u)) collected.push(u);
  }

  if (collected.length === 0) {
    throw new Error(
      "Amazon ürün linki bulunamadı. Tam ürün adı, yapıştırılmış Amazon URL’si veya B0… ile başlayan ASIN dene."
    );
  }

  const firstAsin = asinFromProductUrl(collected[0]!);
  if (firstAsin) {
    for (const u of urlsForAsin(firstAsin)) {
      if (!collected.includes(u)) collected.push(u);
    }
  }

  return dedupeAmazonUrls(collected).slice(0, 14);
}

/** @deprecated Tek URL — resolveAmazonProductPageUrls kullan */
export async function tavilySearchAmazon(productName: string): Promise<string> {
  const urls = await resolveAmazonProductPageUrls(productName);
  return urls[0]!;
}

function extractAsin(url: string): string | null {
  const m = url.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return m ? m[1] : null;
}

function isAmazonHost(url: string): boolean {
  try {
    return /amazon\./i.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** İçerik kalitesi: yüksek = ürün sayfası ihtimali */
function scoreAmazonMarkdownQuality(markdown: string): number {
  const t = markdown.trim();
  let s = 0;
  s += Math.min(35, Math.floor(t.length / 400));
  if (/out of 5|out of five|von 5|Sternen|yıldız|stars?|ratings?|global ratings|değerlendirme|müşteri yorumu/i.test(t))
    s += 28;
  if (/₺|\$|€|£|EUR|GBP|TRY|Sepete|Sepete Ekle|Add to Cart|add-to-cart|Buy Now|ürün detayı|product details|customer reviews|See all reviews/i.test(t))
    s += 22;
  if (/robot check|Robot Check|Type the characters|Enter the characters|automated access|Sorry, we just need to make sure|Bir robot olmadığınızı doğrulayın|captcha/i.test(t))
    s -= 45;
  return s;
}

function amazonMarkdownHardBlocked(markdown: string): boolean {
  const t = markdown.trim();
  if (t.length < 120) return true;
  const block =
    /robot check|Robot Check|Type the characters|Enter the characters|Bir robot olmadığınızı doğrulayın/i.test(t);
  const productLike =
    /out of 5|yıldız|stars?|ratings?|Sepete|Add to Cart|customer review|ürün/i.test(t);
  return block && !productLike;
}

async function firecrawlFetchMarkdown(key: string, payload: Record<string, unknown>): Promise<string> {
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      formats: ["markdown"],
      timeout: 120000,
      ...payload,
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

/** Birden fazla parametre setiyle dene; en iyi markdown’u döndür */
async function firecrawlScrapeAmazonPage(url: string, thorough: boolean): Promise<{ markdown: string; quality: number }> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY eksik");

  if (!isAmazonHost(url)) {
    const md = await firecrawlFetchMarkdown(key, { url, onlyMainContent: true });
    return { markdown: md, quality: scoreAmazonMarkdownQuality(md) };
  }

  const tr = url.includes("amazon.com.tr");
  const attempts: Record<string, unknown>[] = [];

  if (tr) {
    attempts.push({
      url,
      onlyMainContent: false,
      waitFor: 8000,
      headers: { "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7" },
    });
  }
  attempts.push({ url, onlyMainContent: false, waitFor: thorough ? 7000 : 5000 });
  attempts.push({ url, onlyMainContent: true, waitFor: thorough ? 6500 : 4500 });
  attempts.push({
    url,
    onlyMainContent: false,
    waitFor: 5000,
    mobile: true,
  });
  attempts.push({
    url,
    onlyMainContent: true,
    waitFor: 4500,
    mobile: true,
  });

  let best = "";
  let bestQ = -999;
  for (const extra of attempts) {
    try {
      const md = await firecrawlFetchMarkdown(key, extra);
      const q = scoreAmazonMarkdownQuality(md);
      if (q > bestQ || (q === bestQ && md.length > best.length)) {
        bestQ = q;
        best = md;
      }
      if (q >= 38 && !amazonMarkdownHardBlocked(md)) {
        return { markdown: md, quality: q };
      }
    } catch {
      /* deneme */
    }
  }

  if (!best.trim()) throw new Error("Firecrawl bu URL için içerik döndürmedi.");
  return { markdown: best, quality: bestQ };
}

async function firecrawlScrapeUrl(url: string): Promise<string> {
  const { markdown } = await firecrawlScrapeAmazonPage(url, false);
  return markdown;
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

export async function scrapeAmazonForWorthit(productUrl: string): Promise<ScrapedAmazonPayload> {
  const { markdown: mainMd, quality } = await firecrawlScrapeAmazonPage(productUrl, true);

  if (amazonMarkdownHardBlocked(mainMd)) {
    throw new Error("Bu Amazon URL’si bot koruması veya boş yanıt döndürdü.");
  }

  let scrapingNote: string | undefined;
  if (quality < 18 && mainMd.trim().length < 900) {
    throw new Error("Sayfa içeriği çok kısa; başka bölge linki deneniyor.");
  }
  if (quality < 28) {
    scrapingNote =
      "NOT (otomatik): Ürün sayfası kısmen okunabildi. Yalnızca aşağıdaki ham metne dayan; eksik alanları tahmin etme, confidence düşür.";
  } else if (quality < 40) {
    scrapingNote =
      "NOT (otomatik): Veri orta düzeyde; iddiaları mesajdaki metinle sınırlı tut.";
  }

  let reviewsMd = "";
  const ru = reviewsUrlFromProductUrl(productUrl);
  if (ru) {
    try {
      const { markdown } = await firecrawlScrapeAmazonPage(ru, false);
      if (!amazonMarkdownHardBlocked(markdown)) reviewsMd = markdown;
    } catch {
      reviewsMd = "";
    }
  }

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

  const maxExcerpt = 16_000;
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
    scrapingNote,
  };
}

function buildUserMessage(productName: string, s: ScrapedAmazonPayload): string {
  const head = s.scrapingNote ? `${s.scrapingNote}\n\n` : "";
  return `${head}Ürün: ${productName}

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

function extractJsonFromClaudeText(text: string): WorthitReport {
  let t = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m;
  const fm = t.match(fence);
  if (fm) t = fm[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Claude yanıtında JSON bulunamadı.");
  t = t.slice(start, end + 1);
  const raw = JSON.parse(t) as Partial<WorthitReport>;
  return normalizeWorthitReport(raw);
}

function normalizeWorthitReport(raw: Partial<WorthitReport>): WorthitReport {
  const emptyScores = { satisfaction: 0, flaw_risk: 0, expert: 0, value: 0 };
  const emptyTrust = {
    platform_rating: 0,
    worthit_true_score: 0,
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
      worthit_true_score:
        Number(raw.trust_signals?.worthit_true_score) ||
        Number(
          (raw.trust_signals as { scorecard_true_score?: number } | undefined)
            ?.scorecard_true_score
        ) ||
        emptyTrust.worthit_true_score,
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
): Promise<WorthitReport> {
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
    system: WORTHIT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });

  const block = msg.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("Claude metin yanıtı döndürmedi.");
  return extractJsonFromClaudeText(block.text);
}

export async function runWorthitPipeline(productName: string): Promise<{
  amazonUrl: string;
  report: WorthitReport;
}> {
  const trimmed = productName.trim();
  if (!trimmed) throw new Error("Ürün adı gerekli.");

  const urls = await resolveAmazonProductPageUrls(trimmed);
  const errors: string[] = [];

  for (const amazonUrl of urls) {
    try {
      const scraped = await scrapeAmazonForWorthit(amazonUrl);
      const report = await analyzeWithClaude(trimmed, scraped);
      return { amazonUrl, report };
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }

  const hint = errors.length ? errors[Math.min(errors.length - 1, 2)] : "";
  throw new Error(
    `Amazon verisi alınamadı (${urls.length} farklı URL denendi). Son hata: ${hint}`.slice(0, 600)
  );
}
