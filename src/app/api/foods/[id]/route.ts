import { NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/http";
import { requireUnlockedSession } from "@/lib/auth/session";
import { deactivateFood, updateFood } from "@/lib/db/repositories";
import { updateFoodSchema } from "@/lib/validation/daily";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUnlockedSession();
    const parsed = updateFoodSchema.safeParse(await request.json());
    if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "食品参数错误");
    const input = parsed.data;
    const record = await updateFood((await context.params).id, { name: input.name, brand: input.brand, serving_name: input.servingName, serving_weight_g: input.servingWeightG, weight_basis: input.weightBasis, calories_per_100g: input.caloriesPer100G, protein_per_100g: input.proteinPer100G, carbs_per_100g: input.carbsPer100G, fat_per_100g: input.fatPer100G, fiber_per_100g: input.fiberPer100G, sodium_mg_per_100g: input.sodiumMgPer100G, barcode: input.barcode, note: input.note, is_favorite: input.isFavorite, is_active: input.isActive });
    return NextResponse.json(record);
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUnlockedSession();
    return NextResponse.json(await deactivateFood((await context.params).id));
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
