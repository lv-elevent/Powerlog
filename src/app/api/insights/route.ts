import { NextResponse } from "next/server";
import { requireUnlockedSession } from "@/lib/auth/session";
import { serverErrorResponse, unauthorizedResponse, badRequestResponse } from "@/lib/auth/http";
import { getInsights } from "@/lib/db/insights";
import type { InsightCategory, InsightRange } from "@/types/insights";

const ranges = new Set<InsightRange>(["7d", "30d", "3m", "1y"]);
const categories = new Set<InsightCategory>(["body", "nutrition", "training", "life", "finance"]);

export async function GET(request: Request) {
  try {
    await requireUnlockedSession();
    const params = new URL(request.url).searchParams;
    const range = params.get("range") as InsightRange | null;
    const category = params.get("category") as InsightCategory | null;
    if (!range || !ranges.has(range)) return badRequestResponse("range 必须是 7d、30d、3m 或 1y");
    if (!category || !categories.has(category)) return badRequestResponse("category 参数错误");
    return NextResponse.json(await getInsights(range, category), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
