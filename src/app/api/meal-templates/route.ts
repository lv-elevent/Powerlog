import { NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/http";
import { requireUnlockedSession } from "@/lib/auth/session";
import { createMealTemplate, listMealTemplates } from "@/lib/db/repositories";
import { mealTemplateSchema } from "@/lib/validation/daily";

export async function GET() {
  try {
    await requireUnlockedSession();
    return NextResponse.json(await listMealTemplates());
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireUnlockedSession();
    const parsed = mealTemplateSchema.safeParse(await request.json());
    if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "餐食模板参数错误");
    const input = parsed.data;
    await createMealTemplate({ name: input.name, meal_type: input.mealType, is_favorite: input.isFavorite, note: input.note, items: input.items.map(item => ({ food_id: item.foodId, quantity_g: item.quantityG, serving_count: item.servingCount, sort_order: item.sortOrder })) });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
