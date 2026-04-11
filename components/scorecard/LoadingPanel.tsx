"use client";

type Props = { message: string; step: number; total: number };

export function LoadingPanel({ message, step, total }: Props) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div
      className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-lg shadow-slate-200/40 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-4">
        <div
          className="relative h-12 w-12 shrink-0"
          aria-hidden
        >
          <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">{message}</p>
          <p className="mt-1 text-xs text-slate-500">
            Bu işlem birkaç dakika sürebilir. Sekmeyi kapatmayın.
          </p>
        </div>
      </div>
      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400">
        Adım {step + 1} / {total}
      </p>
    </div>
  );
}
