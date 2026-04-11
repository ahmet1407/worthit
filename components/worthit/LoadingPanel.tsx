"use client";

type Props = { message: string; step: number; total: number };

export function LoadingPanel({ message, step, total }: Props) {
  const progress = total > 0 ? Math.round((step / total) * 100) : 0;

  return (
    <div className="fade-up rounded-2xl border border-[#E8E8E4] bg-white p-8 shadow-sm">
      <div className="mb-7 h-0.5 w-full overflow-hidden rounded-full bg-[#F3F3F0]">
        <div className="h-full rounded-full bg-[#0D0D0D] transition-all duration-700" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center gap-5">
        <div className="relative h-9 w-9 shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-[#E8E8E4]" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent spin-slow"
            style={{ borderTopColor: "#0D0D0D" }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#0D0D0D]">{message}</p>
          <p className="mt-0.5 text-xs font-light text-[#9A9A9A]">Saniyeler içinde hazır olacak</p>
        </div>
        <div className="shrink-0 text-right">
          <span className="font-serif text-2xl italic text-[#4A4A4A]">{progress}</span>
          <span className="text-sm text-[#9A9A9A]">%</span>
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-[#E8E8E4] bg-[#FAFAF8] px-4 py-3">
        <p className="text-xs leading-relaxed text-[#9A9A9A]">
          💡 Binlerce yorum taranıyor, sahte değerlendirmeler ayıklanıyor, gerçek kullanıcı deneyimleri
          önceliklendiriliyor.
        </p>
      </div>
    </div>
  );
}
