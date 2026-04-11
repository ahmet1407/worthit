import { NextResponse } from "next/server";
import { getWorthitPersistence, runWorthitPipeline } from "@/lib/worthit";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { productName?: string };
    const productName = body.productName?.trim();
    if (!productName) {
      return NextResponse.json({ error: "productName gerekli." }, { status: 400 });
    }

    const { amazonUrl, report } = await runWorthitPipeline(productName);

    const persistence = getWorthitPersistence();
    await persistence.recordSuccessfulRun({
      query: productName,
      amazonUrl,
      report,
    });

    return NextResponse.json({ amazonUrl, report });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
