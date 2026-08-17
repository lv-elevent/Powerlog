import { NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/http";
import { requireUnlockedSession } from "@/lib/auth/session";
import { createNutritionGoal, getNutritionGoal, listNutritionGoals } from "@/lib/db/repositories";
import { nutritionGoalSchema } from "@/lib/validation/daily";

export async function GET(request: Request) {
  try {
    await requireUnlockedSession();
    const date = new URL(request.url).searchParams.get("date");
    return NextResponse.json(date ? await getNutritionGoal(date) : await listNutritionGoals());
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireUnlockedSession();
    const parsed = nutritionGoalSchema.safeParse(await request.json());
    if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "营养目标参数错误");
    const input = parsed.data;
    const record = await createNutritionGoal({ effective_from: input.effectiveFrom, effective_to: input.effectiveTo ?? null, calories_kcal: input.calories, protein_g: input.protein, carbs_g: input.carbs, fat_g: input.fat, fiber_g: input.fiber, water_ml: input.water, note: input.note ?? null });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
