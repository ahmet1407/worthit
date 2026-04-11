"use client";

type Props = { message: string; onDismiss: () => void };

export function ErrorAlert({ message, onDismiss }: Props) {
  return (
    <div className="fade-up rounded-2xl border border-[#ff6b6b]/25 bg-[#ff6b6b]/8 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-[#ff6b6b]/80">
            Analiz tamamlanamadı
          </p>
          <p className="text-sm leading-relaxed text-white/60">{message}</p>
          <p className="mt-2 text-xs text-white/30">
            Amazon bu ürün için veri vermemiş olabilir. Farklı bir ürün adı veya direkt Amazon linki ile tekrar
            deneyin.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-xl leading-none text-white/20 transition-colors hover:text-white/60"
        >
          ×
        </button>
      </div>
    </div>
  );
}
