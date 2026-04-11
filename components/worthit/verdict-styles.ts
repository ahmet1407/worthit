import type { Verdict } from "@/lib/worthit/types";

export function verdictBadgeClass(v: Verdict): string {
  switch (v) {
    case "BUY":
      return "bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-500/40";
    case "WAIT":
      return "bg-amber-500/15 text-amber-900 ring-1 ring-amber-500/40";
    case "SKIP":
      return "bg-red-500/15 text-red-800 ring-1 ring-red-500/40";
    default:
      return "bg-slate-100 text-slate-800 ring-1 ring-slate-300";
  }
}

export function normalizeVerdict(raw: string): Verdict {
  const t = raw.replace(/\s/g, "").toUpperCase();
  if (t.includes("BUY")) return "BUY";
  if (t.includes("WAIT")) return "WAIT";
  if (t.includes("SKIP")) return "SKIP";
  return "WAIT";
}

export function ringAccentForVerdict(v: Verdict): { from: string; to: string } {
  switch (v) {
    case "BUY":
      return { from: "#10b981", to: "#059669" };
    case "WAIT":
      return { from: "#f59e0b", to: "#d97706" };
    case "SKIP":
      return { from: "#ef4444", to: "#dc2626" };
    default:
      return { from: "#6366f1", to: "#8b5cf6" };
  }
}
