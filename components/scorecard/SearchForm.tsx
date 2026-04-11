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
      className="mx-auto flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-stretch"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="product-search" className="sr-only">
        Ürün adı
      </label>
      <input
        id="product-search"
        type="search"
        enterKeyHint="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Örn. Dyson V15, Sony WH-1000XM5…"
        className="min-h-12 flex-1 rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-3 text-base text-slate-900 shadow-sm outline-none ring-slate-200/80 backdrop-blur-sm placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
        disabled={loading}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <button
        type="submit"
        disabled={loading || !query.trim()}
        className="min-h-12 shrink-0 rounded-2xl bg-slate-900 px-8 py-3 text-base font-semibold text-white shadow-md transition hover:bg-slate-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45"
      >
        {loading ? "Analiz ediliyor…" : "Skorla"}
      </button>
    </form>
  );
}
