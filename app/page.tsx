"use client";

import { useCallback, useEffect, useState } from "react";
import { ErrorAlert } from "@/components/worthit/ErrorAlert";
import { LoadingPanel } from "@/components/worthit/LoadingPanel";
import { SearchForm } from "@/components/worthit/SearchForm";
import { SiteFooter } from "@/components/worthit/SiteFooter";
import { WorthitResultView } from "@/components/worthit/WorthitResultView";
import { normalizeVerdict } from "@/components/worthit/verdict-styles";
import { useWorthitSearch } from "@/hooks/useWorthitSearch";

const TICKER = [
  { name: "Sony WH-1000XM5", v: "AL", s: 88 },
  { name: "Dyson V15 Detect", v: "AL", s: 91 },
  { name: "iPhone 16 Pro", v: "AL", s: 85 },
  { name: "Samsung S25 Ultra", v: "BEKLE", s: 72 },
  { name: "AirPods Pro 2", v: "AL", s: 83 },
  { name: "Garmin Fenix 8", v: "AL", s: 90 },
  { name: "Xiaomi Watch S3", v: "BEKLE", s: 64 },
  { name: "Roomba j7+", v: "BEKLE", s: 61 },
] as const;

const VC: Record<string, string> = { AL: "#16a34a", BEKLE: "#C05A1A", ALMA: "#C0281A" };

function TickerBar() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="overflow-hidden border-b border-[#E8E8E4] bg-[#F3F3F0]/60 py-2.5">
      <div className="ticker-track flex gap-10 whitespace-nowrap" style={{ width: "max-content" }}>
        {items.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-2.5 text-xs">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: VC[it.v] ?? "#000" }} />
            <span className="font-medium text-[#4A4A4A]">{it.name}</span>
            <span className="text-[10px] font-bold" style={{ color: VC[it.v] }}>
              {it.v}
            </span>
            <span className="text-[#9A9A9A]">{it.s}/100</span>
          </span>
        ))}
      </div>
    </div>
  );
}

type TrendingItem = {
  q: string;
  label: string;
  sub: string;
  hot?: boolean;
  isnew?: boolean;
  risk?: boolean;
};

const TRENDING: TrendingItem[] = [
  { q: "Dyson V15 Detect", label: "🔥 Dyson V15", sub: "847 analiz", hot: true },
  { q: "iPhone 16 Pro", label: "iPhone 16 Pro", sub: "1.2k analiz", isnew: true },
  { q: "Samsung S25 Ultra", label: "Samsung S25", sub: "634 analiz" },
  { q: "Roomba j7+", label: "Roomba j7+", sub: "Risk var", risk: true },
  { q: "Sony WH-1000XM5", label: "🔥 Sony XM5", sub: "923 analiz", hot: true },
  { q: "Apple Watch S10", label: "Apple Watch S10", sub: "298 analiz" },
];

function TrendingPills({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="mr-1 text-xs font-medium text-[#9A9A9A]">🔥 Trend</span>
      {TRENDING.map((t) => (
        <button
          key={t.q}
          type="button"
          onClick={() => onSelect(t.q)}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-md ${
            t.risk
              ? "border-red-200 bg-red-50 text-red-700 hover:border-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white"
              : t.isnew
                ? "border-blue-200 bg-blue-50 text-blue-700 hover:border-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white"
                : t.hot
                  ? "border-orange-200 bg-orange-50 text-orange-700 hover:border-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white"
                  : "border-[#E8E8E4] bg-white text-[#4A4A4A] hover:border-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white"
          }`}
        >
          <span>{t.label}</span>
          <span className="text-[10px] opacity-50">{t.sub}</span>
        </button>
      ))}
    </div>
  );
}

const EXAMPLES = [
  {
    name: "Dyson V15 Detect",
    cat: "🧹 Dikey Süpürge",
    verdict: "AL",
    score: 91,
    accent: "linear-gradient(90deg,#16a34a,#4ade80)",
    scoreColor: "#16a34a",
    sat: 91,
    risk: 12,
    val: 81,
    tags: [
      { t: "Lazer toz tespiti", pro: true },
      { t: "Uzun batarya", pro: true },
      { t: "Pahalı", pro: false },
    ],
    insight: "Segmentinde rakipsiz. Fiyatı haklı çıkarıyor.",
    q: "Dyson V15 Detect",
  },
  {
    name: "Roomba j7+",
    cat: "🤖 Robot Süpürge",
    verdict: "BEKLE",
    score: 64,
    accent: "linear-gradient(90deg,#ea580c,#fb923c)",
    scoreColor: "#C05A1A",
    sat: 72,
    risk: 41,
    val: 58,
    tags: [
      { t: "İyi haritalama", pro: true },
      { t: "Yüksek risk", pro: false },
      { t: "Alternatif var", pro: false },
    ],
    insight: "Bu fiyata Dreame L20 Ultra çok daha güçlü çıkıyor.",
    q: "Roomba j7+",
  },
  {
    name: "Sony WH-1000XM5",
    cat: "🎧 Kulaklık",
    verdict: "AL",
    score: 84,
    accent: "linear-gradient(90deg,#2563eb,#60a5fa)",
    scoreColor: "#2563eb",
    sat: 88,
    risk: 18,
    val: 74,
    tags: [
      { t: "ANC sınıfın en iyisi", pro: true },
      { t: "30 saat batarya", pro: true },
      { t: "Mikrofon zayıf", pro: false },
    ],
    insight: "Gürültü engellemede rakipsiz. Mikrofon hayal kırıklığı yaratabilir.",
    q: "Sony WH-1000XM5",
  },
] as const;

function ExampleCards({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {EXAMPLES.map((ex) => {
        const vStyle =
          ex.verdict === "AL"
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-orange-200 bg-orange-50 text-orange-700";
        return (
          <div
            key={ex.name}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(ex.q)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(ex.q);
              }
            }}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#E8E8E4] bg-white transition-all duration-300 hover:-translate-y-2 hover:border-[#0D0D0D]/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)]"
          >
            <div className="h-[3px] w-full" style={{ background: ex.accent }} />
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-[#9A9A9A]">{ex.cat}</span>
                <span className={`rounded-full border px-3 py-0.5 text-[10px] font-bold tracking-wider ${vStyle}`}>
                  {ex.verdict === "AL" ? "✓ ALINIR" : "⚡ BEKLE"}
                </span>
              </div>
              <h3 className="mb-4 font-serif text-xl italic leading-tight text-[#0D0D0D]">{ex.name}</h3>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="font-serif text-5xl italic leading-none" style={{ color: ex.scoreColor }}>
                  {ex.score}
                </span>
                <span className="pb-1 text-xs text-[#9A9A9A]">Genel Skor</span>
              </div>
              <div className="mb-4 space-y-2">
                {(
                  [
                    ["Memnuniyet", ex.sat, "#16a34a"],
                    ["Risk", ex.risk, "#C0281A"],
                    ["Değer", ex.val, "#2563eb"],
                  ] as const
                ).map(([l, v, c]) => (
                  <div key={String(l)} className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-[9px] uppercase tracking-wider text-[#9A9A9A]">{l}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F3F3F0]">
                      <div className="h-full rounded-full" style={{ width: `${v}%`, background: String(c) }} />
                    </div>
                    <span className="w-5 text-right text-[10px] text-[#9A9A9A]">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {ex.tags.map((tag) => (
                  <span
                    key={tag.t}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                      tag.pro ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {tag.t}
                  </span>
                ))}
              </div>
              <p className="text-xs italic leading-relaxed text-[#9A9A9A]">{ex.insight}</p>
            </div>
            <div className="border-t border-[#E8E8E4] px-5 py-3 text-xs font-medium text-[#9A9A9A] transition-all group-hover:bg-[#0D0D0D] group-hover:text-white">
              Bu ürünü analiz et →
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HowItWorks() {
  return (
    <div className="reveal border-t border-[#E8E8E4] py-24">
      <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-[#9A9A9A]">Nasıl Çalışır</p>
      <h2 className="mb-12 text-center font-serif text-4xl italic leading-tight text-[#0D0D0D]">
        Üç adımda <span className="text-[#9A9A9A]">net karar.</span>
      </h2>
      <div className="grid grid-cols-1 divide-y divide-[#E8E8E4] overflow-hidden rounded-2xl border border-[#E8E8E4] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {(
          [
            ["01", "Ürün adını yaz", "Ürün adı, Amazon linki veya ASIN. Ne yazarsan yaz, sistem tanır ve kategorize eder."],
            ["02", "AI araştırır", "Yorumlar, uzman testleri, şikayetler — 500+ veri noktası saniyeler içinde analiz edilir."],
            ["03", "Net karar al", "Al / Bekle / Alma. Skor, risk özeti, en güçlü alternatif. Pişmanlık yok."],
          ] as const
        ).map(([n, t, d]) => (
          <div key={n} className="bg-white p-8">
            <div className="mb-5 font-serif text-5xl italic leading-none text-[#E8E8E4]">{n}</div>
            <h3 className="mb-2 text-base font-semibold text-[#0D0D0D]">{t}</h3>
            <p className="text-sm font-light leading-relaxed text-[#4A4A4A]">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreBreakdown() {
  return (
    <div className="reveal overflow-hidden rounded-2xl border border-[#E8E8E4]">
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <div className="bg-[#0D0D0D] p-8 sm:p-10">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">Skor Mimarisi</p>
          <h2 className="mb-4 font-serif text-3xl italic leading-tight text-white">
            Her kararın <span className="text-white/40">arkasında veri var.</span>
          </h2>
          <p className="text-sm font-light leading-relaxed text-white/50">
            Tek bir yıldız ortalaması değil. Dört farklı boyutu ölçüyoruz, ağırlıklı bir karar üretiyoruz.
          </p>
        </div>
        <div className="divide-y divide-[#E8E8E4] bg-white p-8 sm:p-10">
          {(
            [
              ["★", "Satisfaction Score", "Gerçek memnuniyet, tekrar alma niyeti", "30%", "#16a34a"],
              ["⚠", "Flaw / Risk Score", "Şikayetler, arıza oranı, iade dili", "25%", "#C0281A"],
              ["◎", "Expert Score", "Uzman testleri, benchmark, editör tavsiyesi", "20%", "#2563eb"],
              ["◈", "Price / Value Score", "Segment içi fiyat kıyası, overpriced sinyali", "25%", "#C05A1A"],
            ] as const
          ).map(([icon, name, detail, pct, color]) => (
            <div key={String(name)} className="flex items-center gap-4 py-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8E8E4] text-lg"
                style={{ color }}
              >
                {icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#0D0D0D]">{name}</p>
                <p className="text-xs font-light text-[#9A9A9A]">{detail}</p>
              </div>
              <span className="shrink-0 font-serif text-xl italic text-[#9A9A9A]">{pct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Pricing() {
  const plans = [
    { name: "Ücretsiz", price: "$0", credits: "2 analiz hakkı", features: ["Temel skor", "1 alternatif", "Risk özeti"], featured: false },
    { name: "Starter", price: "$5", credits: "7 analiz kredisi", features: ["Tam skor detayı", "2 alternatif", "Risk breakdown", "Analiz geçmişi"], featured: false },
    {
      name: "Standard",
      price: "$10",
      credits: "15 analiz kredisi",
      features: ["Her şey dahil", "Karşılaştırma modu", "Derin risk analizi", "Öncelikli analiz"],
      featured: true,
      badge: "En Popüler",
    },
    { name: "Pro", price: "$25", credits: "40 analiz kredisi", features: ["Her şey dahil", "Derin kategoriler", "Fiyat alarmı", "API erişimi"], featured: false },
  ] as const;
  return (
    <div className="reveal border-t border-[#E8E8E4] py-24">
      <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-[#9A9A9A]">Fiyatlandırma</p>
      <h2 className="mb-12 text-center font-serif text-4xl italic leading-tight text-[#0D0D0D]">
        Kullandığın kadar <span className="text-[#9A9A9A]">öde.</span>
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-2xl border p-6 transition-all hover:-translate-y-1 ${
              p.featured
                ? "border-[#0D0D0D] bg-[#0D0D0D] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                : "border-[#E8E8E4] bg-white hover:border-[#0D0D0D]/30 hover:shadow-md"
            }`}
          >
            {"badge" in p && p.badge ? (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#0D0D0D] px-3 py-0.5 text-[10px] font-bold tracking-wider text-white">
                {p.badge}
              </div>
            ) : null}
            <p className={`mb-3 text-[10px] font-bold uppercase tracking-wider ${p.featured ? "text-white/40" : "text-[#9A9A9A]"}`}>
              {p.name}
            </p>
            <p className={`mb-1 font-serif text-4xl italic leading-none ${p.featured ? "text-white" : "text-[#0D0D0D]"}`}>
              {p.price}
            </p>
            <p className={`mb-5 text-xs font-light ${p.featured ? "text-white/50" : "text-[#9A9A9A]"}`}>{p.credits}</p>
            <ul className="mb-6 space-y-2">
              {p.features.map((f) => (
                <li
                  key={f}
                  className={`flex items-center gap-2 text-xs font-light ${p.featured ? "text-white/60" : "text-[#4A4A4A]"}`}
                >
                  <span className={p.featured ? "text-white/25" : "text-[#9A9A9A]"}>—</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`w-full rounded-xl py-2.5 text-xs font-bold tracking-wide transition-all ${
                p.featured
                  ? "bg-white text-[#0D0D0D] hover:bg-white/90"
                  : "border border-[#E8E8E4] text-[#4A4A4A] hover:border-[#0D0D0D] hover:text-[#0D0D0D]"
              }`}
            >
              {p.featured ? "Başla →" : "Seç"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Testimonials() {
  const items = [
    {
      q: "Sony XM5 almak üzereydim. Worthit Bose QC Ultra'nın benim için daha mantıklı olduğunu gösterdi. 200 dolar kurtardım.",
      name: "Ahmet K.",
      handle: "@ahmetk · İstanbul",
      init: "AK",
      saved: "₺6.200 kurtardı",
    },
    {
      q: "Dyson mi Miele mi diye haftalarca araştırdım. Worthit 3 dakikada Dyson dedi ve neden dedi. Aldım, harika.",
      name: "Merve B.",
      handle: "@merveb · Ankara",
      init: "MB",
      saved: "4 saat kurtardı",
    },
    {
      q: "Risk skoru yüksek çıkan ürünü almamıştım. 3 ay sonra aynı ürün Reddit'te şikayet yağmuruna tutuldu.",
      name: "Sercan Y.",
      handle: "@sercany · İzmir",
      init: "SY",
      saved: "Riski gördü",
    },
  ];
  return (
    <div className="reveal border-t border-[#E8E8E4] py-24">
      <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-[#9A9A9A]">Kullanıcılar</p>
      <h2 className="mb-12 text-center font-serif text-4xl italic leading-tight text-[#0D0D0D]">
        Pişmanlık yok, <span className="text-[#9A9A9A]">karar var.</span>
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((t) => (
          <div key={t.name} className="rounded-2xl border border-[#E8E8E4] bg-white p-6">
            <p className="mb-5 font-serif text-base italic leading-relaxed text-[#0D0D0D]">&ldquo;{t.q}&rdquo;</p>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F3F0] text-xs font-semibold text-[#4A4A4A]">
                {t.init}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0D0D0D]">{t.name}</p>
                <p className="text-[10px] text-[#9A9A9A]">{t.handle}</p>
              </div>
              <span className="ml-auto whitespace-nowrap rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                {t.saved}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveCounter() {
  const [n, setN] = useState(2847);
  useEffect(() => {
    const t = setInterval(() => setN((c) => c + Math.floor(Math.random() * 3)), 7000);
    return () => clearInterval(t);
  }, []);
  return <>{n.toLocaleString("tr-TR")}</>;
}

export default function Home() {
  const {
    query,
    setQuery,
    loading,
    loadMsgIndex,
    loadingMessage,
    loadingStepsTotal,
    error,
    result,
    amazonUrl,
    submit,
    clearError,
    reset,
  } = useWorthitSearch();
  const verdict = result ? normalizeVerdict(result.verdict) : null;
  const hasResult = result && verdict !== null && !loading;

  const handleSelect = useCallback(
    (q: string) => {
      setQuery(q);
      void submit(q);
    },
    [setQuery, submit]
  );

  useEffect(() => {
    if (hasResult || loading) return;
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [hasResult, loading]);

  const runSubmit = useCallback(() => void submit(), [submit]);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <nav className="fixed left-0 right-0 top-0 z-50 flex h-[60px] items-center justify-between border-b border-[#E8E8E4] bg-[#FAFAF8]/90 px-6 backdrop-blur-md sm:px-10">
        <span className="font-serif text-xl italic text-[#0D0D0D]">Worthit</span>
        <div className="hidden gap-8 text-sm text-[#4A4A4A] sm:flex">
          <a href="#how" className="transition-colors hover:text-[#0D0D0D]">
            Nasıl Çalışır
          </a>
          <a href="#pricing" className="transition-colors hover:text-[#0D0D0D]">
            Fiyatlar
          </a>
        </div>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="rounded-lg bg-[#0D0D0D] px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-80"
        >
          Ücretsiz Dene
        </button>
      </nav>

      <TickerBar />

      <div className={`pb-0 pt-[60px] transition-all duration-700 ${hasResult ? "pb-6 pt-[72px]" : ""}`}>
        <div className={`mx-auto max-w-2xl px-4 sm:px-6 ${hasResult ? "pt-8" : ""}`}>
          {!hasResult && (
            <div className="flex flex-col items-center pb-14 pt-20 text-center">
              <div className="anim-1 mb-10 inline-flex items-center gap-2 rounded-full border border-[#E8E8E4] bg-white px-4 py-1.5 text-xs font-medium text-[#4A4A4A] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 pulse-dot" />
                <LiveCounter /> analiz yapıldı bu hafta
              </div>

              <h1 className="anim-2 max-w-xl text-[clamp(52px,8vw,88px)] font-serif italic leading-[1.05] tracking-tight text-[#0D0D0D]">
                Bu ürünü
                <br />
                <span className="text-[#9A9A9A]">almalı mısın?</span>
              </h1>

              <p className="anim-3 mb-12 max-w-md text-lg font-light leading-relaxed text-[#4A4A4A]">
                500 yorumu ve uzman testlerini 30 saniyede analiz ediyoruz. Tek ekranda net bir karar.
              </p>

              <div className="anim-4 w-full max-w-xl">
                <SearchForm
                  query={query}
                  onQueryChange={setQuery}
                  onSubmit={runSubmit}
                  loading={loading}
                  onSuggestion={(q) => handleSelect(q)}
                />
              </div>

              <div className="anim-5 mt-8 flex items-center gap-4">
                <div className="flex">
                  {["AK", "MB", "SY", "+"].map((init, i) => (
                    <div
                      key={init}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#FAFAF8] bg-[#F3F3F0] text-[11px] font-medium text-[#4A4A4A]"
                      style={{ marginLeft: i === 0 ? 0 : -8 }}
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-light text-[#4A4A4A]">
                  <span className="font-semibold text-[#0D0D0D]">2.400+</span> analiz yapıldı — bu hafta
                </p>
              </div>
            </div>
          )}

          {hasResult && (
            <div className="mb-6 flex items-center gap-3">
              <span className="font-serif text-2xl italic text-[#0D0D0D]">Worthit</span>
              <span className="text-[#E8E8E4]">·</span>
              <button
                type="button"
                onClick={() => {
                  reset();
                  clearError();
                }}
                className="text-sm text-[#9A9A9A] transition-colors hover:text-[#0D0D0D]"
              >
                Yeni analiz
              </button>
            </div>
          )}

          {hasResult && (
            <div className="mb-6">
              <SearchForm
                query={query}
                onQueryChange={setQuery}
                onSubmit={runSubmit}
                loading={loading}
                onSuggestion={(q) => handleSelect(q)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-10 sm:px-6">
        {loading && <LoadingPanel message={loadingMessage} step={loadMsgIndex} total={loadingStepsTotal} />}
        {error && <ErrorAlert message={error} onDismiss={clearError} />}
        {hasResult && <WorthitResultView result={result} amazonUrl={amazonUrl} verdict={verdict} />}
      </div>

      {!hasResult && !loading && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="border-t border-[#E8E8E4] pb-16 pt-12">
            <div className="mb-8">
              <TrendingPills onSelect={handleSelect} />
            </div>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9A9A9A]">Popüler Analizler</p>
              <a href="#" className="text-xs text-[#9A9A9A] transition-colors hover:text-[#0D0D0D]">
                Tümünü gör →
              </a>
            </div>
            <ExampleCards onSelect={handleSelect} />
          </div>

          <div id="how">
            <HowItWorks />
          </div>
          <ScoreBreakdown />
          <div id="pricing">
            <Pricing />
          </div>
          <Testimonials />

          <div className="reveal border-t border-[#E8E8E4] py-24 text-center">
            <h2 className="mb-4 font-serif text-5xl italic leading-tight text-[#0D0D0D]">
              İlk analizin
              <br />
              <span className="text-[#9A9A9A]">ücretsiz.</span>
            </h2>
            <p className="mb-8 text-base font-light leading-relaxed text-[#4A4A4A]">
              Kredi kartı yok. Kayıt zorunlu değil.
              <br />
              Ürün adını yaz, karar sende.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="rounded-xl bg-[#0D0D0D] px-8 py-3.5 text-sm font-bold text-white transition-all hover:opacity-80"
              >
                Hemen Dene →
              </button>
              <a
                href="#how"
                className="rounded-xl border-[1.5px] border-[#E8E8E4] px-8 py-3.5 text-sm font-medium text-[#4A4A4A] transition-all hover:border-[#0D0D0D] hover:text-[#0D0D0D]"
              >
                Nasıl Çalışır
              </a>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
