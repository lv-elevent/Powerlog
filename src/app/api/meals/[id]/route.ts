import { NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/http";
import { requireUnlockedSession } from "@/lib/auth/session";
import { deleteMeal, getMeal, updateMeal } from "@/lib/db/repositories";
import { mealSchema } from "@/lib/validation/daily";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUnlockedSession();
    return NextResponse.json(await getMeal((await context.params).id));
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUnlockedSession();
    const parsed = mealSchema.safeParse(await request.json());
    if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "餐食参数错误");
    const input = parsed.data;
    const record = await updateMeal((await context.params).id, { record_date: input.date, meal_type: input.mealType, title: input.title, eaten_at: input.eatenAt ?? new Date().toISOString(), note: input.note, source_template_id: input.sourceTemplateId, items: input.items.map(item => ({ food_id: item.foodId, quantity_g: item.quantityG, serving_count: item.servingCount })) });
    return NextResponse.json(record);
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUnlockedSession();
    await deleteMeal((await context.params).id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
