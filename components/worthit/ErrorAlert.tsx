"use client";

type Props = { message: string; onDismiss: () => void };

export function ErrorAlert({ message, onDismiss }: Props) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-red-400/70 mb-1">Hata</p>
          <p className="text-sm text-white/60 leading-relaxed">{message}</p>
        </div>
        <button onClick={onDismiss} className="shrink-0 text-white/20 hover:text-white/50 transition-colors text-lg leading-none">×</button>
      </div>
    </div>
  );
}
