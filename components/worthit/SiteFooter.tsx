export function SiteFooter() {
  return (
    <footer className="border-t border-white/6 px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <span className="font-serif text-xl italic" style={{ color: "#c8f135" }}>
          Worthit
        </span>
        <div className="flex gap-6 text-xs text-white/30">
          {["Hakkında", "Gizlilik", "Kullanım Şartları", "İletişim"].map((l) => (
            <a key={l} href="#" className="transition-colors hover:text-white/70">
              {l}
            </a>
          ))}
        </div>
        <span className="text-xs text-white/20">© 2026 Worthit</span>
      </div>
    </footer>
  );
}
