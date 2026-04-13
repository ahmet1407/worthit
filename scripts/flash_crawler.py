#!/usr/bin/env python3
"""
Flash.co ürün sayfalarından Schema.org JSON-LD çıkarır → JSONL.

ÖNEMLİ: flash.co kullanım şartları ve robots.txt'yi okuyun. Yüksek hacimli /
paralel tarama siteye zarar verebilir veya yasaklanabilir. Bu script yalnızca
araştırma / kendi riskiniz için; üretimde resmi API veya izin tercih edin.

Örnek (küçük test):
  pip install httpx beautifulsoup4
  python scripts/flash_crawler.py --start 75700 --end 75720 --concurrency 5

Sonra Supabase’e yüklemek için scripts/FLASH_SETUP.txt ve:
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run import-flash -- ./flash_products.jsonl
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

import httpx
from bs4 import BeautifulSoup


def _iter_product_nodes(obj: object) -> list[dict]:
    """Tek Product, @graph veya JSON-LD listesi."""
    out: list[dict] = []
    if isinstance(obj, list):
        for el in obj:
            out.extend(_iter_product_nodes(el))
        return out
    if not isinstance(obj, dict):
        return out
    t = obj.get("@type")
    if t == "Product" or (isinstance(t, list) and "Product" in t):
        out.append(obj)
    graph = obj.get("@graph")
    if isinstance(graph, list):
        for g in graph:
            out.extend(_iter_product_nodes(g))
    return out


def parse_json_ld_scripts(html: str) -> dict | None:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup.find_all("script", type="application/ld+json"):
        raw = tag.string or tag.get_text() or ""
        raw = raw.strip()
        if not raw:
            continue
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue
        for product in _iter_product_nodes(data):
            if product.get("name"):
                return product
    return None


def product_to_record(product_id: int, base_url: str, product: dict) -> dict:
    review = product.get("review") or {}
    if isinstance(review, list):
        review = review[0] if review else {}
    rating = (review.get("reviewRating") or {}) if isinstance(review, dict) else {}
    score = rating.get("ratingValue", 0)

    def list_notes(key: str) -> list[dict]:
        block = product.get(key) or {}
        if not isinstance(block, dict):
            return []
        elements = block.get("itemListElement") or []
        if not isinstance(elements, list):
            return []
        rows = []
        for item in elements:
            if not isinstance(item, dict):
                continue
            rows.append(
                {
                    "title": item.get("name", "") or "",
                    "detail": item.get("description", "") or "",
                }
            )
        return rows

    pros = list_notes("positiveNotes")
    cons = list_notes("negativeNotes")

    specs: dict[str, str] = {}
    for prop in product.get("additionalProperty") or []:
        if not isinstance(prop, dict):
            continue
        n, v = prop.get("name"), prop.get("value")
        if n and v is not None:
            specs[str(n)] = str(v)

    description = product.get("description", "") or ""
    category = specs.get("Category", "") or ""

    slug = "x"
    url = f"{base_url.rstrip('/')}/item/{product_id}/{slug}"

    return {
        "id": product_id,
        "name": product.get("name", ""),
        "score": score,
        "description": description,
        "category": category,
        "pros": pros,
        "cons": cons,
        "specs": specs,
        "url": url,
    }


async def fetch_product(
    client: httpx.AsyncClient,
    product_id: int,
    base_url: str,
) -> dict | None:
    url = f"{base_url.rstrip('/')}/item/{product_id}/x"
    try:
        r = await client.get(url, timeout=20.0)
        if r.status_code != 200:
            return None
        product = parse_json_ld_scripts(r.text)
        if not product:
            return None
        rec = product_to_record(product_id, base_url, product)
        if not rec.get("name"):
            return None
        return rec
    except (httpx.HTTPError, OSError, ValueError):
        return None


async def crawl(
    start_id: int,
    end_id: int,
    concurrency: int,
    output_file: Path,
    base_url: str,
) -> None:
    sem = asyncio.Semaphore(max(1, concurrency))
    # flash.co boş/script UA’lara 403 veriyor; gerçek tarayıcı dizesi gerekli
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
    }

    output_file.parent.mkdir(parents=True, exist_ok=True)
    count_ok = 0
    lock = asyncio.Lock()

    async with httpx.AsyncClient(headers=headers, follow_redirects=True) as client:
        with output_file.open("w", encoding="utf-8") as f:

            async def one(pid: int) -> None:
                nonlocal count_ok
                async with sem:
                    result = await fetch_product(client, pid, base_url)
                async with lock:
                    if result:
                        f.write(json.dumps(result, ensure_ascii=False) + "\n")
                        f.flush()
                        count_ok += 1
                        print(f"ok {pid}: {result['name'][:60]} — {result['score']}/100", flush=True)
                    else:
                        print(f"-- {pid}: (yok veya parse edilemedi)", flush=True)

            await asyncio.gather(*(one(i) for i in range(start_id, end_id + 1)))

    print(f"\nBitti: {count_ok} ürün → {output_file}", file=sys.stderr)


def main() -> None:
    p = argparse.ArgumentParser(description="Flash.co JSON-LD → JSONL (dikkatli kullanın).")
    p.add_argument("--start", type=int, default=1, help="İlk ürün ID")
    p.add_argument("--end", type=int, default=100, help="Son ürün ID (dahil)")
    p.add_argument("--concurrency", type=int, default=5, help="Paralel istek (düşük tutun)")
    p.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("flash_products.jsonl"),
        help="Çıktı JSONL",
    )
    p.add_argument(
        "--base-url",
        default="https://flash.co",
        help="Örn. https://flash.co",
    )
    args = p.parse_args()
    if args.end < args.start:
        p.error("--end >= --start olmalı")
    asyncio.run(
        crawl(
            args.start,
            args.end,
            args.concurrency,
            args.output,
            args.base_url,
        )
    )


if __name__ == "__main__":
    main()
