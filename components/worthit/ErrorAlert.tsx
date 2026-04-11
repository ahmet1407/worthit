"use client";

export function ErrorAlert({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div
      className="mx-auto flex w-full max-w-xl items-start gap-3 rounded-2xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-900 shadow-sm"
      role="alert"
    >
      <span className="mt-0.5 text-lg leading-none" aria-hidden>
        !
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">Bir şeyler ters gitti</p>
        <p className="mt-1 text-red-800/90">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100/80"
        >
          Kapat
        </button>
      )}
    </div>
  );
}
