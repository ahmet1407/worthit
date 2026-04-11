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
        color: "#a3e635",
        bg: "bg-[#a3e635]/10",
        border: "border-[#a3e635]/20",
        text: "text-[#a3e635]",
        glow: "shadow-[0_0_60px_rgba(163,230,53,0.08)]",
      };
    case "SKIP":
      return {
        label: "ALMA",
        color: "#f87171",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-red-400",
        glow: "shadow-[0_0_60px_rgba(248,113,113,0.08)]",
      };
    case "WAIT":
    default:
      return {
        label: "BEKLE",
        color: "#fbbf24",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        text: "text-amber-400",
        glow: "shadow-[0_0_60px_rgba(251,191,36,0.08)]",
      };
  }
}

export function verdictBadgeClass(verdict: Verdict): string {
  const c = verdictConfig(verdict);
  return `${c.bg} ${c.border} border ${c.text}`;
}
