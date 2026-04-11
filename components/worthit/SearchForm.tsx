"use client";

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
};

export function SearchForm({ query, onQueryChange, onSubmit, loading }: Props) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (!loading && query.trim()) onSubmit(); }}
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Tam ürün adı (örn. Dyson V15 Detect) veya Amazon linki…"
          disabled={loading}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-base text-white placeholder-white/25 outline-none transition-all focus:border-[#a3e635]/60 focus:bg-white/8 focus:ring-1 focus:ring-[#a3e635]/30 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-xl bg-[#a3e635] px-6 py-4 text-sm font-bold text-black transition-all hover:bg-[#bef264] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? "..." : "Analiz et"}
        </button>
      </div>
    </form>
  );
}
