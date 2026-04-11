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
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading && query.trim()) onSubmit();
      }}
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Ürün adı veya Amazon linki..."
          disabled={loading}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-base text-white placeholder-white/20 outline-none transition-all duration-200 focus:border-[#c8f135]/50 focus:bg-white/8 focus:shadow-[0_0_24px_rgba(200,241,53,0.12)] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-2xl px-7 py-4 text-sm font-black tracking-wide text-black transition-all duration-200 bg-[#c8f135] hover:bg-[#d4f75a] hover:shadow-[0_0_28px_rgba(200,241,53,0.4)] active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? "..." : "Analiz et →"}
        </button>
      </div>
    </form>
  );
}
