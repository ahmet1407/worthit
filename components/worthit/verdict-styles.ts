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
        emoji: "🟢",
        color: "#c8f135",
        bg: "bg-[#c8f135]/12",
        border: "border-[#c8f135]/30",
        text: "text-[#c8f135]",
        glow: "shadow-[0_0_80px_rgba(200,241,53,0.12)]",
      };
    case "SKIP":
      return {
        label: "ALMA",
        emoji: "🔴",
        color: "#ff6b6b",
        bg: "bg-[#ff6b6b]/12",
        border: "border-[#ff6b6b]/30",
        text: "text-[#ff6b6b]",
        glow: "shadow-[0_0_80px_rgba(255,107,107,0.12)]",
      };
    case "WAIT":
    default:
      return {
        label: "BEKLE",
        emoji: "🟡",
        color: "#ffd93d",
        bg: "bg-[#ffd93d]/12",
        border: "border-[#ffd93d]/30",
        text: "text-[#ffd93d]",
        glow: "shadow-[0_0_80px_rgba(255,217,61,0.12)]",
      };
  }
}

export function verdictBadgeClass(verdict: Verdict): string {
  const c = verdictConfig(verdict);
  return `${c.bg} ${c.border} border ${c.text}`;
}
