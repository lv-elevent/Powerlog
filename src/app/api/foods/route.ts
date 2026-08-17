import { NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/http";
import { requireUnlockedSession } from "@/lib/auth/session";
import { createFood, listFoods } from "@/lib/db/repositories";
import { createFoodSchema } from "@/lib/validation/daily";

export async function GET(request: Request) {
  try {
    await requireUnlockedSession();
    const searchParams = new URL(request.url).searchParams;
    return NextResponse.json(await listFoods(searchParams.get("search") ?? undefined, searchParams.get("includeInactive") === "true"));
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireUnlockedSession();
    const parsed = createFoodSchema.safeParse(await request.json());
    if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "食品参数错误");
    const input = parsed.data;
    const record = await createFood({ name: input.name, brand: input.brand, serving_name: input.servingName, serving_weight_g: input.servingWeightG, weight_basis: input.weightBasis, calories_per_100g: input.caloriesPer100G, protein_per_100g: input.proteinPer100G, carbs_per_100g: input.carbsPer100G, fat_per_100g: input.fatPer100G, fiber_per_100g: input.fiberPer100G, sodium_mg_per_100g: input.sodiumMgPer100G, barcode: input.barcode, note: input.note });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
