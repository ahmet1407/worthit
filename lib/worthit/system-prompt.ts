import fs from "node:fs";
import path from "node:path";

/**
 * Master v3 tam metin: `master-prompt-v3.md` (ADIM 1–7, kategori sorguları, JSON şeması).
 * Worthit markası + worthit_true_score .md içinde güncel.
 */
const MVP_CONTEXT = `

---
OPERASYONEL BAĞLAM (Backend MVP — şu anki üretim kodu)
Kullanıcı mesajında her zaman: ürün adı, Amazon başlık/kategori/puan/yorum özeti, Firecrawl ile çekilmiş Amazon markdown özeti bulunur.
Mesajda "Tavily ile çekilen ek web pasajları" bölümü varsa: bunlar Amazon dışı sitelerden (ör. Şikayetvar, Reddit, RTINGS/Notebookcheck, TR forum) gelen kısaltılmış arama özetleridir; master prompttaki kaynak ağırlıklarına göre değerlendir. Yalnızca bu pasajlarda veya Amazon metninde açıkça geçen iddiaları kullan; rakam, test sonucu veya siteye özel iddia uydurma. Ek pasajları kullandıysan data_integrity.sources_analyzed içinde tam URL’leri listele; total_sources_count ile tutarlı olsun. Pasaj yoksa veya çok zayıfsa confidence düşük kalmalıdır.
fake_review_signal, last_90_days, kronik sorun alanlarını yalnızca iletilen metinden çıkarılabildiği ölçüde doldur.

ÇIKTI: Sadece geçerli JSON (tek obje). Markdown code fence yok. Önce/sonra açıklama yok.
`;

function readMasterPromptFile(): string {
  const mdPath = path.join(process.cwd(), "lib", "worthit", "master-prompt-v3.md");
  return fs.readFileSync(mdPath, "utf-8");
}

export const WORTHIT_SYSTEM_PROMPT = readMasterPromptFile() + MVP_CONTEXT;
