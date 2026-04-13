/**
 * Flash.co ürün özetleri: Supabase (tercih) veya FLASH_PRODUCTS_JSONL ile eşleştirme,
 * Claude supplemental bloğu üretir.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, statSync } from "node:fs";

export type FlashProductRow = {
  id: number;
  name: string;
  score: number;
  description: string;
  category: string;
  pros: Array<{ title: string; detail: string }>;
  cons: Array<{ title: string; detail: string }>;
  specs: Record<string, string>;
  url: string;
};

const MAX_JSONL_BYTES = 80 * 1024 * 1024;

let jsonlCatalog: FlashProductRow[] | null = null;
let jsonlLoadedPath: string | null = null;

let supabaseClient: SupabaseClient | null | undefined;

function getSupabase(): SupabaseClient | null {
  if (supabaseClient !== undefined) return supabaseClient;
  const url = process.env.SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    supabaseClient = null;
    return null;
  }
  supabaseClient = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return supabaseClient;
}

function normalizeMatchText(q: string): string {
  return q
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractSearchTokens(q: string): string[] {
  const n = normalizeMatchText(q);
  const parts = n.split(/\s+/).filter((t) => t.length > 2);
  return Array.from(new Set(parts)).slice(0, 14);
}

function scoreNameAgainstTokens(tokens: string[], name: string): number {
  const hn = normalizeMatchText(name);
  if (!tokens.length) return 0;
  let hits = 0;
  for (const t of tokens) {
    if (hn.includes(t)) hits++;
  }
  return hits / tokens.length;
}

function sanitizeIlikeToken(t: string): string | null {
  const s = t.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, "").slice(0, 48);
  return s.length >= 3 ? s : null;
}

async function searchFlashSupabase(combined: string): Promise<FlashProductRow[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const tokens = extractSearchTokens(combined)
    .map(sanitizeIlikeToken)
    .filter((x): x is string => Boolean(x))
    .slice(0, 5);
  if (!tokens.length) return [];

  const ors = tokens.map((t) => `name.ilike.%${t}%`).join(",");
  const { data, error } = await sb
    .from("flash_products")
    .select("id,name,score,description,category,pros,cons,specs,url")
    .or(ors)
    .limit(45);

  if (error || !data?.length) return [];

  const qTokens = extractSearchTokens(combined);
  const scored = (data as FlashProductRow[])
    .map((row) => ({ row, s: scoreNameAgainstTokens(qTokens, row.name) }))
    .filter((x) => x.s >= 0.28)
    .sort((a, b) => b.s - a.s);

  if (!scored.length) return [];
  const top = scored[0]!.s;
  return scored.filter((x) => x.s >= Math.max(0.32, top - 0.18)).slice(0, 3).map((x) => x.row);
}

function loadFlashJsonl(): FlashProductRow[] {
  const p = process.env.FLASH_PRODUCTS_JSONL?.trim();
  if (!p) return [];
  if (jsonlCatalog && jsonlLoadedPath === p) return jsonlCatalog;
  if (!existsSync(p)) return [];
  const st = statSync(p);
  if (st.size > MAX_JSONL_BYTES) {
    console.warn(
      JSON.stringify({
        worthit_flash: "jsonl_too_large",
        path: p,
        max_bytes: MAX_JSONL_BYTES,
        size: st.size,
      })
    );
    return [];
  }
  const raw = readFileSync(p, "utf-8");
  const out: FlashProductRow[] = [];
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    try {
      const o = JSON.parse(t) as FlashProductRow;
      if (o && typeof o.id === "number" && typeof o.name === "string" && o.name.length > 0) {
        out.push({
          ...o,
          score: Number(o.score) || 0,
          description: String(o.description ?? ""),
          category: String(o.category ?? ""),
          pros: Array.isArray(o.pros) ? o.pros : [],
          cons: Array.isArray(o.cons) ? o.cons : [],
          specs: o.specs && typeof o.specs === "object" ? o.specs : {},
          url: String(o.url ?? ""),
        });
      }
    } catch {
      /* satır atla */
    }
  }
  jsonlCatalog = out;
  jsonlLoadedPath = p;
  return out;
}

function searchFlashJsonl(combined: string): FlashProductRow[] {
  const qTokens = extractSearchTokens(combined);
  if (!qTokens.length) return [];
  const cat = loadFlashJsonl();
  if (!cat.length) return [];

  const scored = cat
    .map((row) => ({ row, s: scoreNameAgainstTokens(qTokens, row.name) }))
    .filter((x) => x.s >= 0.32)
    .sort((a, b) => b.s - a.s);

  if (!scored.length) return [];
  const top = scored[0]!.s;
  return scored.filter((x) => x.s >= Math.max(0.35, top - 0.2)).slice(0, 3).map((x) => x.row);
}

function formatFlashBlock(rows: FlashProductRow[]): { block: string; urls: string[] } {
  const urls = rows.map((r) => r.url).filter(Boolean);
  const parts = rows.map((r) => {
    const pros =
      (r.pros ?? [])
        .slice(0, 8)
        .map((p) => `  • ${p.title || "—"}: ${(p.detail || "").slice(0, 220)}`)
        .join("\n") || "";
    const cons =
      (r.cons ?? [])
        .slice(0, 6)
        .map((c) => `  • ${c.title || "—"}: ${(c.detail || "").slice(0, 220)}`)
        .join("\n") || "";
    const specEntries = Object.entries(r.specs || {}).slice(0, 18);
    const specLines = specEntries.map(([k, v]) => `  - ${k}: ${String(v).slice(0, 140)}`).join("\n");

    return [
      `### Flash.co — ${r.name}`,
      `Kaynak: ${r.url || "—"}`,
      `Skor: ${r.score}/100 | Kategori: ${r.category || "—"}`,
      r.description ? `Özet: ${r.description.slice(0, 700)}` : "",
      pros ? `Artılar:\n${pros}` : "",
      cons ? `Eksiler:\n${cons}` : "",
      specLines ? `Özellikler:\n${specLines}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const block =
    `(Flash.co — ${rows.length} eşleşen ürün özeti; yalnızca bu metne dayan, uydurma. Kaynak URL'leri data_integrity.sources_analyzed içine yaz.)\n\n` +
    parts.join("\n\n---\n\n");
  return { block: block.slice(0, 4800), urls };
}

export type FlashSupplementResult = {
  block: string;
  urls: string[];
  /** 0–1 token örtüşmesi (en iyi eşleşme) */
  confidence: number;
};

/**
 * Kullanıcı sorgusu + Amazon başlığı ile Flash satırlarını arar, supplemental metin üretir.
 */
export async function fetchFlashSupplemental(
  userQuery: string,
  amazonTitle: string
): Promise<FlashSupplementResult> {
  const combined = `${userQuery} ${amazonTitle}`.slice(0, 320);
  const tokens = extractSearchTokens(combined);
  if (tokens.length === 0) {
    return { block: "", urls: [], confidence: 0 };
  }

  let rows: FlashProductRow[] = [];
  try {
    rows = await searchFlashSupabase(combined);
  } catch {
    rows = [];
  }
  if (!rows.length) {
    rows = searchFlashJsonl(combined);
  }

  if (!rows.length) {
    return { block: "", urls: [], confidence: 0 };
  }

  const confidence = Math.max(...rows.map((r) => scoreNameAgainstTokens(tokens, r.name)));
  const { block, urls } = formatFlashBlock(rows);
  return { block, urls, confidence };
}
