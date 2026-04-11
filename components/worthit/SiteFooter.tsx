export function SiteFooter() {
  return (
    <footer className="border-t border-[#E8E8E4] px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <span className="font-serif text-xl italic text-[#0D0D0D]">Worthit</span>
        <div className="flex gap-6 text-xs text-[#9A9A9A]">
          {["Hakkında", "Gizlilik", "Kullanım Şartları", "İletişim"].map((l) => (
            <a key={l} href="#" className="transition-colors hover:text-[#0D0D0D]">
              {l}
            </a>
          ))}
        </div>
        <span className="text-xs text-[#9A9A9A]">© 2026 Worthit</span>
      </div>
    </footer>
  );
}
