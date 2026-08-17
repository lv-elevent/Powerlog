import { NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/http";
import { requireUnlockedSession } from "@/lib/auth/session";
import { createMeal, ensureDailyLog, listMeals } from "@/lib/db/repositories";
import { mealSchema } from "@/lib/validation/daily";

export async function GET(request: Request) {
  try {
    await requireUnlockedSession();
    const date = new URL(request.url).searchParams.get("date");
    if (!date) return badRequestResponse("date 必须是 YYYY-MM-DD");
    return NextResponse.json(await listMeals(date));
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireUnlockedSession();
    const parsed = mealSchema.safeParse(await request.json());
    if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "餐食参数错误");
    const input = parsed.data;
    await ensureDailyLog(input.date);
    const record = await createMeal({ record_date: input.date, meal_type: input.mealType, title: input.title, eaten_at: input.eatenAt ?? new Date().toISOString(), note: input.note, source_template_id: input.sourceTemplateId, client_idempotency_key: input.clientIdempotencyKey ?? crypto.randomUUID(), items: input.items.map(item => ({ food_id: item.foodId, quantity_g: item.quantityG, serving_count: item.servingCount })) });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
