"use client";

import { useCallback, useEffect } from "react";
import { ErrorAlert } from "@/components/worthit/ErrorAlert";
import { LoadingPanel } from "@/components/worthit/LoadingPanel";
import { SearchForm } from "@/components/worthit/SearchForm";
import { SiteFooter } from "@/components/worthit/SiteFooter";
import { WorthitResultView } from "@/components/worthit/WorthitResultView";
import { normalizeVerdict } from "@/components/worthit/verdict-styles";
import { DisambiguationPanel } from "@/components/worthit/DisambiguationPanel";
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
  { name: "Nespresso Vertuo", v: "AL", s: 79 },
  { name: "Oral-B iO Series 9", v: "AL", s: 86 },
] as const;

const VC: Record<string, string> = { AL: "#c8f135", BEKLE: "#ffd93d", ALMA: "#ff6b6b" };

function TickerBar() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="overflow-hidden border-b border-white/5 bg-white/2 py-2.5">
      <div className="ticker-track flex gap-10 whitespace-nowrap" style={{ width: "max-content" }}>
        {items.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-2.5 text-xs">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: VC[it.v] ?? "#fff" }} />
            <span className="font-medium text-white/50">{it.name}</span>
            <span className="text-[10px] font-black" style={{ color: VC[it.v] }}>
              {it.v}
            </span>
            <span className="text-white/20">{it.s}/100</span>
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
      <span className="mr-1 text-xs font-medium text-white/25">🔥 Trend</span>
      {TRENDING.map((t) => (
        <button
          key={t.q}
          type="button"
          onClick={() => onSelect(t.q)}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)] ${
            t.risk
              ? "border-[#ff6b6b]/25 bg-[#ff6b6b]/8 text-[#ff6b6b]/70 hover:bg-[#ff6b6b]/15"
              : t.isnew
                ? "border-blue-500/25 bg-blue-500/8 text-blue-400/80 hover:bg-blue-500/15"
                : t.hot
                  ? "border-orange-500/25 bg-orange-500/8 text-orange-400/80 hover:bg-orange-500/15"
                  : "border-white/10 bg-white/4 text-white/50 hover:bg-white/10 hover:text-white/80"
          }`}
        >
          <span>{t.label}</span>
          <span className="text-[10px] opacity-40">{t.sub}</span>
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
    accent: "linear-gradient(90deg,#16a34a,#c8f135)",
    scoreColor: "#c8f135",
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
    accent: "linear-gradient(90deg,#d97706,#ffd93d)",
    scoreColor: "#ffd93d",
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
    scoreColor: "#60a5fa",
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
            ? "border-[#c8f135]/25 bg-[#c8f135]/10 text-[#c8f135]"
            : "border-[#ffd93d]/25 bg-[#ffd93d]/10 text-[#ffd93d]";
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
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/8 bg-white/3 transition-all duration-300 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
          >
            <div className="h-[3px] w-full" style={{ background: ex.accent }} />
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-white/35">{ex.cat}</span>
                <span className={`rounded-full border px-3 py-0.5 text-[10px] font-black tracking-wider ${vStyle}`}>
                  {ex.verdict === "AL" ? "✓ ALINIR" : "⚡ BEKLE"}
                </span>
              </div>
              <h3 className="mb-4 font-serif text-xl italic leading-tight text-white">{ex.name}</h3>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="font-serif text-5xl italic leading-none" style={{ color: ex.scoreColor }}>
                  {ex.score}
                </span>
                <span className="pb-1 text-xs text-white/30">Genel Skor</span>
              </div>
              <div className="mb-4 space-y-2">
                {(
                  [
                    ["Memnuniyet", ex.sat, "#c8f135"],
                    ["Risk", ex.risk, "#ff6b6b"],
                    ["Değer", ex.val, "#60a5fa"],
                  ] as const
                ).map(([l, v, c]) => (
                  <div key={String(l)} className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-[9px] uppercase tracking-wider text-white/25">{l}</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/8">
                      <div className="h-full rounded-full" style={{ width: `${v}%`, background: String(c) }} />
                    </div>
                    <span className="w-5 text-right text-[10px] text-white/30">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {ex.tags.map((tag) => (
                  <span
                    key={tag.t}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                      tag.pro ? "bg-[#c8f135]/8 text-[#c8f135]/70" : "bg-[#ff6b6b]/8 text-[#ff6b6b]/70"
                    }`}
                  >
                    {tag.t}
                  </span>
                ))}
              </div>
              <p className="font-serif text-xs italic leading-relaxed text-white/35">{ex.insight}</p>
            </div>
            <div className="border-t border-white/6 px-5 py-3 text-xs font-medium text-white/30 transition-all group-hover:bg-[#c8f135]/8 group-hover:text-[#c8f135]/70">
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
    <div className="reveal border-t border-white/6 py-24" id="how">
      <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white/25">Nasıl Çalışır</p>
      <h2 className="mb-12 text-center font-serif text-4xl italic leading-tight text-white">
        Üç adımda <span className="text-white/30">net karar.</span>
      </h2>
      <div className="grid grid-cols-1 divide-y divide-white/6 overflow-hidden rounded-2xl border border-white/6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {(
          [
            ["01", "Ürün adını yaz", "Ürün adı, Amazon linki veya ASIN. Ne yazarsan yaz, sistem tanır ve kategorize eder."],
            ["02", "AI araştırır", "Yorumlar, uzman testleri, şikayetler — 500+ veri noktası saniyeler içinde analiz edilir."],
            ["03", "Net karar al", "Al / Bekle / Alma. Skor, risk özeti, en güçlü alternatif. Pişmanlık yok."],
          ] as const
        ).map(([n, t, d]) => (
          <div key={n} className="bg-white/2 p-8">
            <div className="mb-5 font-serif text-5xl italic leading-none text-white/8">{n}</div>
            <h3 className="mb-2 text-base font-semibold text-white">{t}</h3>
            <p className="text-sm font-light leading-relaxed text-white/40">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreBreakdown() {
  return (
    <div className="reveal overflow-hidden rounded-2xl border border-white/6">
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <div className="border-b border-white/6 bg-white/3 p-8 sm:border-b-0 sm:border-r sm:p-10">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/25">Skor Mimarisi</p>
          <h2 className="mb-4 font-serif text-3xl italic leading-tight text-white">
            Her kararın <span className="text-white/30">arkasında veri var.</span>
          </h2>
          <p className="text-sm font-light leading-relaxed text-white/40">
            Tek bir yıldız ortalaması değil. Dört farklı boyutu ölçüyoruz, ağırlıklı bir karar üretiyoruz.
          </p>
        </div>
        <div className="divide-y divide-white/6 bg-white/2 p-8 sm:p-10">
          {(
            [
              ["★", "Satisfaction Score", "Gerçek memnuniyet, tekrar alma niyeti", "30%", "#c8f135"],
              ["⚠", "Flaw / Risk Score", "Şikayetler, arıza oranı, iade dili", "25%", "#ff6b6b"],
              ["◎", "Expert Score", "Uzman testleri, benchmark, editör tavsiyesi", "20%", "#60a5fa"],
              ["◈", "Price / Value Score", "Segment içi fiyat kıyası, overpriced sinyali", "25%", "#ffd93d"],
            ] as const
          ).map(([icon, name, detail, pct, color]) => (
            <div key={String(name)} className="flex items-center gap-4 py-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                style={{ background: `${color}15`, color }}
              >
                {icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white/80">{name}</p>
                <p className="text-xs font-light text-white/35">{detail}</p>
              </div>
              <span className="shrink-0 font-serif text-xl italic text-white/25">{pct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type Plan = {
  name: string;
  price: string;
  credits: string;
  features: string[];
  featured: boolean;
  badge?: string;
};

const PLANS: Plan[] = [
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
];

function Pricing() {
  return (
    <div className="reveal border-t border-white/6 py-24" id="pricing">
      <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white/25">Fiyatlandırma</p>
      <h2 className="mb-12 text-center font-serif text-4xl italic leading-tight text-white">
        Kullandığın kadar <span className="text-white/30">öde.</span>
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-2xl border p-6 transition-all hover:-translate-y-1 ${
              p.featured
                ? "border-[#c8f135]/35 shadow-[0_0_40px_rgba(200,241,53,0.08)]"
                : "border-white/8 bg-white/3 hover:border-white/20"
            }`}
            style={
              p.featured ? { background: "linear-gradient(135deg,rgba(200,241,53,0.07) 0%,#111 60%)" } : undefined
            }
          >
            {p.badge ? (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#c8f135] px-3 py-0.5 text-[10px] font-black tracking-wider text-black">
                {p.badge}
              </div>
            ) : null}
            <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-white/30">{p.name}</p>
            <p className="mb-1 font-serif text-4xl italic leading-none text-white">{p.price}</p>
            <p className="mb-5 text-xs font-light text-white/30">{p.credits}</p>
            <ul className="mb-6 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs font-light text-white/45">
                  <span className="text-white/20">—</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`w-full rounded-xl py-2.5 text-xs font-black tracking-wide transition-all ${
                p.featured
                  ? "bg-[#c8f135] text-black hover:bg-[#d4f75a] hover:shadow-[0_0_20px_rgba(200,241,53,0.3)]"
                  : "border border-white/10 text-white/50 hover:border-white/25 hover:text-white/80"
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
    <div className="reveal border-t border-white/6 py-24">
      <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white/25">Kullanıcılar</p>
      <h2 className="mb-12 text-center font-serif text-4xl italic leading-tight text-white">
        Pişmanlık yok, <span className="text-white/30">karar var.</span>
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((t) => (
          <div key={t.name} className="rounded-2xl border border-white/8 bg-white/3 p-6">
            <p className="mb-5 font-serif text-base italic leading-relaxed text-white/75">
              &ldquo;{t.q}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/8 text-xs font-bold text-white/50">
                {t.init}
              </div>
              <div>
                <p className="text-xs font-semibold text-white/70">{t.name}</p>
                <p className="text-[10px] text-white/35">{t.handle}</p>
              </div>
              <span className="ml-auto whitespace-nowrap rounded-full border border-[#c8f135]/20 bg-[#c8f135]/10 px-2.5 py-1 text-[10px] font-semibold text-[#c8f135]/70">
                {t.saved}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const {
    query,
    setQuery,
    loading,
    checking,
    disambiguation,
    loadMsgIndex,
    loadingMessage,
    loadingStepsTotal,
    error,
    result,
    amazonUrl,
    submit,
    selectSuggestion,
    dismissSuggestions,
    clearError,
    reset,
  } = useWorthitSearch();
  const verdict = result ? normalizeVerdict(result.verdict) : null;
  const busy = loading || checking;
  const hasResult = result && verdict !== null && !loading && !disambiguation;

  const handleSelect = useCallback(
    (q: string) => {
      setQuery(q);
      void submit(q);
    },
    [setQuery, submit]
  );

  const runSubmit = useCallback(() => void submit(), [submit]);

  useEffect(() => {
    if (hasResult || loading || checking) return;
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
  }, [hasResult, loading, checking]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav
        className="fixed left-0 right-0 top-0 z-50 flex h-[60px] items-center justify-between border-b border-white/6 px-6 sm:px-10"
        style={{ background: "rgba(10,10,10,0.88)", backdropFilter: "blur(12px)" }}
      >
        <span className="font-serif text-xl italic" style={{ color: "#c8f135" }}>
          Worthit
        </span>
        <div className="hidden gap-8 text-sm text-white/40 sm:flex">
          <a href="#how" className="transition-colors hover:text-white/80">
            Nasıl Çalışır
          </a>
          <a href="#pricing" className="transition-colors hover:text-white/80">
            Fiyatlar
          </a>
        </div>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="rounded-lg bg-[#c8f135] px-4 py-2 text-xs font-black text-black transition-all hover:bg-[#d4f75a]"
        >
          Ücretsiz Dene
        </button>
      </nav>

      <TickerBar />

      <div className={`pt-[60px] transition-all duration-700 ${hasResult ? "" : "pb-0"}`}>
        <div className={`mx-auto max-w-2xl px-4 sm:px-6 ${hasResult ? "pt-8" : ""}`}>
          {!hasResult && (
            <div className="flex flex-col items-center pb-14 pt-20 text-center">
              {/* Worthit branding */}
              <div className="anim-1 mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/30">Ürün Kararı</p>
              </div>

              <h1
                className="anim-2 mb-2 font-sans"
                style={{
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  fontSize: "clamp(64px,10vw,108px)",
                }}
              >
                <span style={{ color: "#ffffff", fontWeight: 900 }}>Worth</span>
                <span
                  style={{
                    color: "#c8f135",
                    fontWeight: 900,
                    textShadow: "0 0 60px rgba(200,241,53,0.4)",
                  }}
                >
                  it
                </span>
                <span style={{ color: "rgba(255,255,255,0.12)", fontWeight: 900 }}>?</span>
              </h1>

              <p className="anim-3 mb-12 max-w-md text-lg font-light leading-relaxed text-white/40">
                500 yorumu ve uzman testlerini 30 saniyede analiz ediyoruz.
                <br />
                <span className="font-normal text-white/65">Tek ekranda net bir karar.</span>
              </p>

              <div className="anim-4 w-full max-w-xl">
                <SearchForm
                  query={query}
                  onQueryChange={setQuery}
                  onSubmit={runSubmit}
                  loading={busy}
                  onSuggestion={(q) => handleSelect(q)}
                />
              </div>

              <div className="anim-5 mt-8 flex items-center gap-4">
                <div className="flex">
                  {["AK", "MB", "SY", "+"].map((init, i) => (
                    <div
                      key={init}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0a0a0a] bg-white/10 text-[11px] font-medium text-white/60"
                      style={{ marginLeft: i === 0 ? 0 : -8 }}
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-light text-white/40">
                  <span className="font-semibold text-white/65">2.400+</span> analiz yapıldı — bu hafta
                </p>
              </div>
            </div>
          )}

          {hasResult && (
            <>
              <div className="mb-6 flex items-center gap-3">
                <span className="font-serif text-2xl italic" style={{ color: "#c8f135" }}>
                  Worthit
                </span>
                <span className="text-white/20">·</span>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    clearError();
                  }}
                  className="text-sm text-white/35 transition-colors hover:text-white/70"
                >
                  Yeni analiz
                </button>
              </div>
              <div className="mb-6">
                <SearchForm
                  query={query}
                  onQueryChange={setQuery}
                  onSubmit={runSubmit}
                  loading={busy}
                  onSuggestion={(q) => handleSelect(q)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-10 sm:px-6">
        {(checking || loading) && !disambiguation && (
          <LoadingPanel
            message={checking ? "Ürün kontrol ediliyor..." : loadingMessage}
            step={checking ? 0 : loadMsgIndex}
            total={loadingStepsTotal}
          />
        )}
        {disambiguation && !loading && (
          <DisambiguationPanel
            question={disambiguation.question}
            suggestions={disambiguation.suggestions}
            onSelect={selectSuggestion}
            onDismiss={dismissSuggestions}
          />
        )}
        {error && <ErrorAlert message={error} onDismiss={clearError} />}
        {hasResult && <WorthitResultView result={result} amazonUrl={amazonUrl} verdict={verdict} />}
      </div>

      {!hasResult && !loading && !checking && !disambiguation && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="border-t border-white/6 pb-16 pt-12">
            <div className="mb-8">
              <TrendingPills onSelect={handleSelect} />
            </div>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">Popüler Analizler</p>
              <a href="#" className="text-xs text-white/30 transition-colors hover:text-white/60">
                Tümünü gör →
              </a>
            </div>
            <ExampleCards onSelect={handleSelect} />
          </div>
          <HowItWorks />
          <ScoreBreakdown />
          <Pricing />
          <Testimonials />
          <div className="reveal border-t border-white/6 py-24 text-center">
            <h2 className="mb-4 font-serif text-5xl italic leading-tight text-white">
              İlk analizin
              <br />
              <span className="text-white/30">ücretsiz.</span>
            </h2>
            <p className="mb-8 text-base font-light leading-relaxed text-white/40">
              Kredi kartı yok. Kayıt zorunlu değil.
              <br />
              Ürün adını yaz, karar sende.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="rounded-xl bg-[#c8f135] px-8 py-3.5 text-sm font-black text-black transition-all hover:bg-[#d4f75a] hover:shadow-[0_0_28px_rgba(200,241,53,0.35)]"
              >
                Hemen Dene →
              </button>
              <a
                href="#how"
                className="rounded-xl border border-white/10 px-8 py-3.5 text-sm font-medium text-white/50 transition-all hover:border-white/25 hover:text-white/80"
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
