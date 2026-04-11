"use client";

import type { ProductSuggestion } from "@/hooks/useWorthitSearch";

type Props = {
  question: string;
  suggestions: ProductSuggestion[];
  onSelect: (s: ProductSuggestion) => void;
  onDismiss: () => void;
};

export function DisambiguationPanel({ question, suggestions, onSelect, onDismiss }: Props) {
  return (
    <div className="fade-up rounded-2xl border border-[#c8f135]/20 bg-white/[0.03] p-6">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#c8f135]/70">
        Biraz daha bilgi lazım
      </p>
      <p className="mb-5 text-sm leading-relaxed text-white/70">{question}</p>
      <div className="mb-5 space-y-2">
        {suggestions.map((s, i) => (
          <button
            key={`${s.query}-${i}`}
            type="button"
            onClick={() => onSelect(s)}
            className="group w-full rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5 text-left transition-all hover:border-[#c8f135]/30 hover:bg-[#c8f135]/5"
          >
            <p className="text-sm font-semibold text-white/85 transition-colors group-hover:text-white">{s.name}</p>
            {s.subtitle ? <p className="mt-0.5 text-xs text-white/35">{s.subtitle}</p> : null}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-xs text-white/25 transition-colors hover:text-white/50"
      >
        Devam et — en iyi eşleşmeyi bul →
      </button>
    </div>
  );
}
