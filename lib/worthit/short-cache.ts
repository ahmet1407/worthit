import { createHash } from "node:crypto";

type Entry = { exp: number; val: unknown };

const store = new Map<string, Entry>();

function ttlMs(): number {
  const n = Number(process.env.WORTHIT_CACHE_TTL_MS);
  return Number.isFinite(n) && n > 0 ? n : 900_000;
}

export function shortCacheKey(prefix: string, raw: string): string {
  const h = createHash("sha256").update(raw).digest("hex").slice(0, 32);
  return `${prefix}:${h}`;
}

export function shortCacheGet<T>(key: string): T | undefined {
  const e = store.get(key);
  if (!e) return undefined;
  if (Date.now() > e.exp) {
    store.delete(key);
    return undefined;
  }
  return e.val as T;
}

export function shortCacheSet<T>(key: string, val: T, ms?: number): void {
  store.set(key, { exp: Date.now() + (ms ?? ttlMs()), val });
}
