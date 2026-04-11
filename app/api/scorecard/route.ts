import { NextResponse } from "next/server";
import { getScorecardPersistence, runScorecardPipeline } from "@/lib/scorecard";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { productName?: string };
    const productName = body.productName?.trim();
    if (!productName) {
      return NextResponse.json({ error: "productName gerekli." }, { status: 400 });
    }

    const { amazonUrl, scorecard } = await runScorecardPipeline(productName);

    const persistence = getScorecardPersistence();
    await persistence.recordSuccessfulRun({
      query: productName,
      amazonUrl,
      scorecard,
    });

    return NextResponse.json({ amazonUrl, scorecard });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
