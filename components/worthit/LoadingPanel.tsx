"use client";

type Props = { message: string; step: number; total: number };

export function LoadingPanel({ message, step, total }: Props) {
  const progress = total > 0 ? Math.round((step / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-[#c8f135]/15 bg-[#c8f135]/4 p-8 fade-up">
      <div className="mb-7 h-0.5 w-full overflow-hidden rounded-full bg-white/6">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg,#a3e635,#c8f135)",
            boxShadow: "0 0 12px rgba(200,241,53,0.5)",
          }}
        />
      </div>
      <div className="flex items-center gap-5">
        <div className="relative h-9 w-9 shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-white/6" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent spin-slow"
            style={{ borderTopColor: "#c8f135", filter: "drop-shadow(0 0 4px #c8f13566)" }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white/90">{message}</p>
          <p className="mt-0.5 text-xs text-white/30">Bu işlem birkaç dakika sürebilir</p>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-2xl font-black tabular-nums" style={{ color: "#c8f135" }}>
            {progress}
          </span>
          <span className="text-sm text-white/30">%</span>
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-white/6 bg-white/3 px-4 py-3">
        <p className="text-xs leading-relaxed text-white/35">
          💡 Her sorguda binlerce yorum taranıyor, sahte olanlar ayıklanıyor, gerçek kullanıcı deneyimleri
          önceliklendiriliyor.
        </p>
      </div>
    </div>
  );
}
