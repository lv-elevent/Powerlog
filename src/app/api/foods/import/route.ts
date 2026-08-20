import { NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/http";
import { requireUnlockedSession } from "@/lib/auth/session";
import { createFood, findFoodBySource } from "@/lib/db/repositories";
import { getUSDAFood, USDAConfigurationError, USDARequestError } from "@/lib/usda-fooddata";
import { foodImportSchema } from "@/lib/validation/daily";

export async function POST(request: Request) {
  try {
    await requireUnlockedSession();
    const parsed = foodImportSchema.safeParse(await request.json());
    if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "食品导入参数无效");
    const existing = await findFoodBySource(parsed.data.source, parsed.data.sourceId);
    if (existing) return NextResponse.json(existing);
    const detail = await getUSDAFood(parsed.data.sourceId);
    if (!detail) return badRequestResponse("该 USDA 食品缺少完整的核心营养数据，暂时无法导入");
    const record = await createFood({
      name: parsed.data.displayName ?? detail.sourceName,
      source: "usda_fdc",
      source_id: detail.sourceId,
      brand: null,
      serving_name: "100g",
      serving_weight_g: 100,
      weight_basis: detail.weightBasis,
      calories_per_100g: detail.caloriesPer100G,
      protein_per_100g: detail.proteinPer100G,
      carbs_per_100g: detail.carbsPer100G,
      fat_per_100g: detail.fatPer100G,
      fiber_per_100g: detail.fiberPer100G,
      note: `来源：USDA FoodData Central · ${detail.sourceName}`,
    });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    if (error instanceof USDAConfigurationError) return NextResponse.json({ error: error.message }, { status: 503 });
    if (error instanceof USDARequestError) return NextResponse.json({ error: error.message }, { status: 502 });
    return serverErrorResponse(error);
  }
}
