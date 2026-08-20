import { NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/http";
import { requireUnlockedSession } from "@/lib/auth/session";
import { findFoodBySource, listFoods } from "@/lib/db/repositories";
import { searchUSDAFoods, USDAConfigurationError, USDARequestError } from "@/lib/usda-fooddata";
import { foodExternalSearchSchema } from "@/lib/validation/daily";

export async function GET(request: Request) {
  try {
    await requireUnlockedSession();
    const parsed = foodExternalSearchSchema.safeParse({ query: new URL(request.url).searchParams.get("query") ?? "" });
    if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "搜索词无效");
    // 没有 USDA Key 时，优先返回本地内置食品，食品库不因外部服务配置缺失而不可用。
    if (!process.env.USDA_FDC_API_KEY?.trim()) {
      const localFoods = await listFoods(parsed.data.query, true);
      return NextResponse.json(localFoods.filter(food => food.source_id?.startsWith("builtin_")).map(food => ({
        source: "custom",
        sourceId: food.source_id as string,
        displayName: food.name,
        sourceName: "内置常见食品",
        dataType: "built_in",
        weightBasis: food.weight_basis,
        caloriesPer100G: Number(food.calories_per_100g),
        proteinPer100G: Number(food.protein_per_100g),
        carbsPer100G: Number(food.carbs_per_100g),
        fatPer100G: Number(food.fat_per_100g),
        fiberPer100G: Number(food.fiber_per_100g),
        isImported: true,
      })));
    }

    const result = await searchUSDAFoods(parsed.data.query);
    const imported = await Promise.all(result.foods.map(food => findFoodBySource("usda_fdc", food.sourceId)));
    return NextResponse.json(result.foods.map((food, index) => ({ ...food, source: "usda_fdc" as const, displayName: result.aliasName, isImported: Boolean(imported[index]) })));
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    if (error instanceof USDAConfigurationError) return NextResponse.json({ error: error.message }, { status: 503 });
    if (error instanceof USDARequestError) return NextResponse.json({ error: error.message }, { status: 502 });
    return serverErrorResponse(error);
  }
}
