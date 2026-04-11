"use client";

type Props = { message: string; step: number; total: number };

export function LoadingPanel({ message, step, total }: Props) {
  const progress = total > 0 ? Math.round((step / total) * 100) : 0;
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-8">
      <div className="mb-6 h-0.5 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-[#a3e635] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="relative h-8 w-8 shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-white/8" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#a3e635]" />
        </div>
        <div>
          <p className="text-sm font-medium text-white/80">{message}</p>
          <p className="mt-0.5 text-xs text-white/30">Adım {step} / {total} · Birkaç dakika sürebilir</p>
        </div>
        <div className="ml-auto text-2xl font-black tabular-nums text-white/15">
          {progress}<span className="text-sm">%</span>
        </div>
      </div>
    </div>
  );
}
