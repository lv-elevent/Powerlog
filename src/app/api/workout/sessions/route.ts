import { NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/http";
import { requireUnlockedSession } from "@/lib/auth/session";
import { createWorkoutSession, listWorkoutSessions } from "@/lib/db/repositories";
import { workoutSessionSchema, dateSchema } from "@/lib/validation/daily";

export async function GET(request: Request) {
  try {
    await requireUnlockedSession();
    const date = new URL(request.url).searchParams.get("date");
    const parsed = dateSchema.safeParse(date);
    if (!parsed.success) return badRequestResponse("date 必须是 YYYY-MM-DD");
    return NextResponse.json(await listWorkoutSessions(parsed.data));
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireUnlockedSession();
    const parsed = workoutSessionSchema.safeParse(await request.json());
    if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "训练参数错误");
    const input = parsed.data;
    return NextResponse.json(await createWorkoutSession({ record_date: input.recordDate, plan_id: input.planId, plan_day_id: input.planDayId, client_idempotency_key: input.clientIdempotencyKey ?? crypto.randomUUID() }), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
