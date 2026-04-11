export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-slate-200/80 bg-white/40 py-10 text-center text-xs text-slate-500 backdrop-blur-sm">
      <p className="mx-auto max-w-md leading-relaxed">
        Scorecard, Amazon listeleri ve yapay zeka ile özet üretir; yatırım tavsiyesi değildir. Satın almadan önce
        fiyat ve garantiyi kendi kontrol edin.
      </p>
      <p className="mt-4 text-slate-400">© {new Date().getFullYear()} Scorecard</p>
    </footer>
  );
}
