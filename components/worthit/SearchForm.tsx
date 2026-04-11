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
      <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-[#E8E8E4] bg-white px-5 py-2 shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all focus-within:border-[#0D0D0D] focus-within:shadow-[0_4px_24px_rgba(0,0,0,0.10)]">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading && query.trim()) onSubmit();
          }}
          placeholder="Ürün adı veya Amazon linki yaz..."
          disabled={loading}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-[#0D0D0D] placeholder-[#9A9A9A] outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => {
            if (!loading && query.trim()) onSubmit();
          }}
          disabled={loading || !query.trim()}
          className="shrink-0 whitespace-nowrap rounded-lg bg-[#0D0D0D] px-6 py-2.5 text-sm font-medium text-white transition-all hover:opacity-80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "..." : "Analiz Et →"}
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
              className="rounded-full border border-[#E8E8E4] bg-white px-3 py-1 text-xs text-[#9A9A9A] transition-all hover:border-[#0D0D0D] hover:text-[#0D0D0D] hover:shadow-sm"
            >
              {h}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
