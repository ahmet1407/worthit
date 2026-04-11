import type { Verdict } from "@/lib/worthit/types";

export function normalizeVerdict(v: string): Verdict {
  const upper = v?.toUpperCase();
  if (upper === "BUY" || upper === "WAIT" || upper === "SKIP") return upper as Verdict;
  return "WAIT";
}

export function verdictConfig(verdict: Verdict) {
  switch (verdict) {
    case "BUY":
      return {
        label: "AL",
        labelLong: "ALINIR",
        emoji: "✓",
        color: "#16a34a",
        colorLight: "#4ade80",
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        accentBar: "linear-gradient(90deg,#16a34a,#4ade80)",
        glow: "shadow-[0_8px_32px_rgba(22,163,74,0.12)]",
      };
    case "SKIP":
      return {
        label: "ALMA",
        labelLong: "ALINMAZ",
        emoji: "✕",
        color: "#C0281A",
        colorLight: "#f87171",
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        accentBar: "linear-gradient(90deg,#C0281A,#f87171)",
        glow: "shadow-[0_8px_32px_rgba(192,40,26,0.10)]",
      };
    case "WAIT":
    default:
      return {
        label: "BEKLE",
        labelLong: "BEKLE",
        emoji: "⚡",
        color: "#C05A1A",
        colorLight: "#fb923c",
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        accentBar: "linear-gradient(90deg,#C05A1A,#fb923c)",
        glow: "shadow-[0_8px_32px_rgba(192,90,26,0.10)]",
      };
  }
}

export function verdictBadgeClass(verdict: Verdict): string {
  const c = verdictConfig(verdict);
  return `${c.bg} ${c.border} border ${c.text}`;
}
