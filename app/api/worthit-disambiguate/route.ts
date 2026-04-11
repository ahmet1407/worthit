import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export type ProductSuggestion = {
  name: string;
  subtitle: string;
  query: string;
};

type DisambiguateResult =
  | { ambiguous: false }
  | { ambiguous: true; question: string; suggestions: ProductSuggestion[] };

const DISAMBIGUATE_PROMPT = (query: string) => `Kullanıcı bir ürün analizi için şunu yazdı: "${query}"

Görevin: Bu sorgunun analiz yapılabilmesi için yeterince spesifik olup olmadığına karar ver.

Düşünme rehberi:
- Birden fazla farklı ürün/model eşleşebiliyorsa → belirsiz
- Yıl, km, model gibi kritik bilgi eksikse (ikinci el araç, konut vb.) → belirsiz
- Tek spesifik ürünü işaret ediyorsa → net

Örnekler:
- "Sony WH-1000XM5" → net
- "iPhone" → belirsiz, hangi model?
- "Mercedes C180" → belirsiz, hangi yıl? sıfır mı ikinci el mi?
- "Dyson V15 Detect" → net
- "Samsung telefon" → belirsiz
- "MacBook Pro 14 M3" → net
- "ikinci el BMW" → belirsiz, hangi model, yıl, km?
- "Bosch bulaşık makinesi" → belirsiz, hangi seri?
- "https://amazon.com.tr/dp/B09..." → net, link var

SADECE JSON döndür:

Net ise:
{"ambiguous": false}

Belirsiz ise:
{
  "ambiguous": true,
  "question": "Kullanıcıya sorulacak kısa soru (max 1 cümle, Türkçe)",
  "suggestions": [
    {
      "name": "Spesifik ürün/model adı",
      "subtitle": "Ayırt edici detay (yıl, km aralığı, özellik, fiyat segmenti)",
      "query": "Analiz için kullanılacak net arama sorgusu"
    }
  ]
}

Suggestions kuralları:
- Max 5 öneri, birbirinden gerçekten farklı
- En popüler/güncel önce
- Araç: farklı yıllar veya sıfır/ikinci el
- Telefon: farklı nesiller
- Beyaz eşya: farklı seriler
- Aksesuar, kılıf, kitap dahil etme`;

async function aiDisambiguate(query: string): Promise<DisambiguateResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ambiguous: false };

  const model =
    process.env.WORTHIT_DISAMBIGUATE_MODEL?.trim() || "claude-3-5-haiku-20241022";
  const client = new Anthropic({ apiKey: key });

  try {
    const msg = await client.messages.create({
      model,
      max_tokens: 600,
      system:
        "Yalnızca geçerli JSON döndür; açıklama veya markdown kod çiti kullanma.",
      messages: [{ role: "user", content: DISAMBIGUATE_PROMPT(query) }],
    });
    const block = msg.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return { ambiguous: false };
    const text = block.text.trim();
    const clean = text.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(clean) as DisambiguateResult;
    if (!parsed || typeof parsed !== "object") return { ambiguous: false };
    if (!parsed.ambiguous) return { ambiguous: false };
    if (!("suggestions" in parsed) || !Array.isArray(parsed.suggestions) || parsed.suggestions.length < 2) {
      return { ambiguous: false };
    }
    return parsed;
  } catch {
    return { ambiguous: false };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { query?: string };
    const raw = body.query?.trim();
    if (!raw) return NextResponse.json({ ambiguous: false });

    const compact = raw.replace(/\s/g, "");
    if (
      /https?:\/\//.test(raw) ||
      /\bB[0-9A-Z]{9}\b/i.test(raw) ||
      /^[A-Z0-9]{10}$/i.test(compact)
    ) {
      return NextResponse.json({ ambiguous: false });
    }

    const result = await aiDisambiguate(raw);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ambiguous: false });
  }
}
