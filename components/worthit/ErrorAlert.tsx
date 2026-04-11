"use client";

type Props = { message: string; onDismiss: () => void };

export function ErrorAlert({ message, onDismiss }: Props) {
  return (
    <div className="fade-up rounded-2xl border border-red-200 bg-red-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-red-600">Analiz tamamlanamadı</p>
          <p className="text-sm leading-relaxed text-[#4A4A4A]">{message}</p>
          <p className="mt-2 text-xs text-[#9A9A9A]">Farklı bir ürün adı veya direkt Amazon linki ile tekrar deneyin.</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xl leading-none text-[#9A9A9A] transition-colors hover:text-[#0D0D0D]"
        >
          ×
        </button>
      </div>
    </div>
  );
}
