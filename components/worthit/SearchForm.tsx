"use client";

const HINTS = ["Dyson V15 Detect", "Sony WH-1000XM5", "iPhone 16 Pro", "Roomba j7+"];

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  onSuggestion?: (q: string) => void;
};

export function SearchForm({ query, onQueryChange, onSubmit, loading, onSuggestion }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-sm transition-all focus-within:border-[#c8f135]/50 focus-within:shadow-[0_0_28px_rgba(200,241,53,0.10)]">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading && query.trim()) onSubmit();
          }}
          placeholder="Ürün adı veya Amazon linki yaz..."
          disabled={loading}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-white placeholder-white/25 outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => {
            if (!loading && query.trim()) onSubmit();
          }}
          disabled={loading || !query.trim()}
          className="shrink-0 whitespace-nowrap rounded-xl bg-[#c8f135] px-6 py-2.5 text-sm font-black text-black transition-all hover:bg-[#d4f75a] hover:shadow-[0_0_24px_rgba(200,241,53,0.4)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
        >
          {loading ? "..." : "Analiz et →"}
        </button>
      </div>
      {!loading && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {HINTS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => {
                onQueryChange(h);
                onSuggestion?.(h);
              }}
              className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs text-white/40 transition-all hover:border-white/25 hover:bg-white/8 hover:text-white/80"
            >
              {h}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
