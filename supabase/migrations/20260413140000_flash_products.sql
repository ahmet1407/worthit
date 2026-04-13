-- Flash.co crawl → Supabase. worthit lib/worthit/flash-supplement.ts ile okunur.
-- İmport: JSONL satırlarını COPY veya küçük script ile yükleyin.

create extension if not exists pg_trgm;

create table if not exists public.flash_products (
  id bigint primary key,
  name text not null,
  score numeric default 0,
  description text default '',
  category text default '',
  pros jsonb default '[]'::jsonb,
  cons jsonb default '[]'::jsonb,
  specs jsonb default '{}'::jsonb,
  url text default ''
);

create index if not exists flash_products_name_trgm_idx
  on public.flash_products using gin (name gin_trgm_ops);

alter table public.flash_products enable row level security;

comment on table public.flash_products is 'Worthit Flash.co supplemental eşleştirme (service role ile okunur)';
