#!/usr/bin/env node
/**
 * flash_products.jsonl → Supabase public.flash_products (upsert, id).
 *
 * Önkoşul: supabase/migrations içindeki flash_products migration çalışmış olmalı.
 *
 * Kullanım:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/import-flash-to-supabase.cjs ./flash_products.jsonl
 *
 * veya:
 *   FLASH_PRODUCTS_JSONL=./flash_products.jsonl npm run import-flash
 *
 * Seçenekler (env):
 *   FLASH_IMPORT_BATCH=200   (varsayılan 200)
 *   FLASH_IMPORT_DRY_RUN=1   sadece say, yazma
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const readline = require("readline");
const path = require("path");

function normalizeRow(o) {
  return {
    id: Number(o.id),
    name: String(o.name || ""),
    score: Number(o.score) || 0,
    description: String(o.description || ""),
    category: String(o.category || ""),
    pros: Array.isArray(o.pros) ? o.pros : [],
    cons: Array.isArray(o.cons) ? o.cons : [],
    specs:
      o.specs && typeof o.specs === "object" && !Array.isArray(o.specs) ? o.specs : {},
    url: String(o.url || ""),
  };
}

async function flushBatch(sb, batch, dry) {
  if (batch.length === 0) return { ok: 0, err: 0 };
  if (dry) {
    return { ok: batch.length, err: 0 };
  }
  const { error } = await sb.from("flash_products").upsert(batch, { onConflict: "id" });
  if (error) {
    console.error(JSON.stringify({ import_flash_error: error.message, batch_start_id: batch[0]?.id }));
    return { ok: 0, err: batch.length };
  }
  return { ok: batch.length, err: 0 };
}

async function main() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const filePath = path.resolve(
    process.argv[2] || process.env.FLASH_PRODUCTS_JSONL || ""
  );

  if (!filePath || !fs.existsSync(filePath)) {
    console.error(
      "Dosya yok. Örnek:\n  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-flash-to-supabase.cjs ./flash_products.jsonl"
    );
    process.exit(1);
  }
  if (!url || !key) {
    console.error("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
    process.exit(1);
  }

  const batchSize = Math.min(500, Math.max(50, Number(process.env.FLASH_IMPORT_BATCH) || 200));
  const dry = /^1$|^true$/i.test(process.env.FLASH_IMPORT_DRY_RUN || "");

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: "utf-8" }),
    crlfDelay: Infinity,
  });

  let batch = [];
  let lineNo = 0;
  let totalOk = 0;
  let totalErr = 0;
  let parseSkip = 0;

  for await (const line of rl) {
    lineNo++;
    const t = line.trim();
    if (!t) continue;
    let o;
    try {
      o = JSON.parse(t);
    } catch {
      parseSkip++;
      continue;
    }
    if (typeof o.id !== "number" && typeof o.id !== "string") {
      parseSkip++;
      continue;
    }
    const row = normalizeRow(o);
    if (!Number.isFinite(row.id) || row.id < 1) {
      parseSkip++;
      continue;
    }
    batch.push(row);
    if (batch.length >= batchSize) {
      const r = await flushBatch(sb, batch, dry);
      totalOk += r.ok;
      totalErr += r.err;
      batch = [];
      if (lineNo % (batchSize * 5) === 0) {
        process.stderr.write(`… ${lineNo} satır işlendi, ${totalOk} satır yazıldı\n`);
      }
    }
  }

  const r2 = await flushBatch(sb, batch, dry);
  totalOk += r2.ok;
  totalErr += r2.err;

  console.log(
    JSON.stringify(
      {
        import_flash_done: true,
        dry_run: dry,
        file: filePath,
        lines_seen: lineNo,
        rows_upserted: totalOk,
        rows_failed: totalErr,
        parse_skipped: parseSkip,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
