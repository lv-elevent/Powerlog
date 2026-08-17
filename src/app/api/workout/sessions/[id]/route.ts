import { NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/http";
import { requireUnlockedSession } from "@/lib/auth/session";
import { finishWorkoutSession, getWorkoutSession } from "@/lib/db/repositories";
import { finishWorkoutSchema } from "@/lib/validation/daily";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUnlockedSession();
    return NextResponse.json(await getWorkoutSession((await context.params).id));
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUnlockedSession();
    const parsed = finishWorkoutSchema.safeParse(await request.json());
    if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "训练完成参数错误");
    const input = parsed.data;
    return NextResponse.json(await finishWorkoutSession((await context.params).id, { feeling_score: input.feelingScore, note: input.note, duration_minutes: input.durationMinutes }));
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
