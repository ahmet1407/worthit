import fs from "node:fs";
import path from "node:path";

/**
 * Master v3 tam metin: `master-prompt-v3.md` (ADIM 1–7, kategori sorguları, JSON şeması).
 * Worthit markası + worthit_true_score .md içinde güncel.
 */
const MVP_CONTEXT = `

---
OPERASYONEL BAĞLAM (Backend MVP — şu anki üretim kodu)
Kullanıcı mesajına genellikle şunlar eklenir: ürün adı, Amazon başlık/kategori/puan/yorum özeti, Firecrawl ile çekilmiş sayfa markdown’u (çoğunlukla amazon.com / amazon.com.tr).
ADIM 3’teki Reddit, Şikayetvar, RTINGS, bağımsız test siteleri vb. için ayrı ham metin çoğu istekte iletilmez. Bu kaynak tiplerini ve ağırlıkları bil; ancak mesajda veya markdown’da görünmeyen siteye özel iddia, ölçüm veya rakam uydurma. Şüphede data_integrity.confidence düşür; sources_analyzed ile total_sources_count yalnızca mesajda gerçekten dayanak bulunan kaynaklarla tutarlı olsun.
fake_review_signal, last_90_days, kronik sorun alanlarını yalnızca iletilen metinden çıkarılabildiği ölçüde doldur.

ÇIKTI: Sadece geçerli JSON (tek obje). Markdown code fence yok. Önce/sonra açıklama yok.
`;

function readMasterPromptFile(): string {
  const mdPath = path.join(process.cwd(), "lib", "worthit", "master-prompt-v3.md");
  return fs.readFileSync(mdPath, "utf-8");
}

export const WORTHIT_SYSTEM_PROMPT = readMasterPromptFile() + MVP_CONTEXT;
