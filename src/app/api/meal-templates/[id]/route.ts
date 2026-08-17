import { NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/http";
import { requireUnlockedSession } from "@/lib/auth/session";
import { deleteMealTemplate, updateMealTemplate } from "@/lib/db/repositories";
import { mealTemplateSchema } from "@/lib/validation/daily";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUnlockedSession();
    const parsed = mealTemplateSchema.safeParse(await request.json());
    if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "餐食模板参数错误");
    const input = parsed.data;
    await updateMealTemplate((await context.params).id, { name: input.name, meal_type: input.mealType, is_favorite: input.isFavorite, note: input.note, items: input.items.map(item => ({ food_id: item.foodId, quantity_g: item.quantityG, serving_count: item.servingCount, sort_order: item.sortOrder })) });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUnlockedSession();
    await deleteMealTemplate((await context.params).id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
