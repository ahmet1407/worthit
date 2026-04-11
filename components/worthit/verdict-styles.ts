import type { Verdict } from "@/lib/worthit/types";

export function normalizeVerdict(v: string): Verdict {
  const u = v?.toUpperCase();
  if (u === "BUY" || u === "WAIT" || u === "SKIP") return u as Verdict;
  return "WAIT";
}

export function verdictConfig(verdict: Verdict) {
  switch (verdict) {
    case "BUY":
      return {
        label: "AL",
        labelLong: "ALINIR",
        emoji: "✓",
        color: "#c8f135",
        dimColor: "#86efac",
        bg: "bg-[#c8f135]/10",
        border: "border-[#c8f135]/25",
        text: "text-[#c8f135]",
        accentBar: "linear-gradient(90deg,#16a34a,#c8f135)",
        glow: "shadow-[0_0_60px_rgba(200,241,53,0.10)]",
      };
    case "SKIP":
      return {
        label: "ALMA",
        labelLong: "ALINMAZ",
        emoji: "✕",
        color: "#ff6b6b",
        dimColor: "#fca5a5",
        bg: "bg-[#ff6b6b]/10",
        border: "border-[#ff6b6b]/25",
        text: "text-[#ff6b6b]",
        accentBar: "linear-gradient(90deg,#dc2626,#ff6b6b)",
        glow: "shadow-[0_0_60px_rgba(255,107,107,0.10)]",
      };
    default:
      return {
        label: "BEKLE",
        labelLong: "BEKLE",
        emoji: "⚡",
        color: "#ffd93d",
        dimColor: "#fde68a",
        bg: "bg-[#ffd93d]/10",
        border: "border-[#ffd93d]/25",
        text: "text-[#ffd93d]",
        accentBar: "linear-gradient(90deg,#d97706,#ffd93d)",
        glow: "shadow-[0_0_60px_rgba(255,217,61,0.10)]",
      };
  }
}

export function verdictBadgeClass(verdict: Verdict): string {
  const c = verdictConfig(verdict);
  return `${c.bg} ${c.border} border ${c.text}`;
}
