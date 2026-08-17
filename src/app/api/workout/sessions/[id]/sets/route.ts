import { NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/http";
import { requireUnlockedSession } from "@/lib/auth/session";
import { upsertWorkoutSet } from "@/lib/db/repositories";
import { workoutSetSchema } from "@/lib/validation/daily";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUnlockedSession();
    const parsed = workoutSetSchema.safeParse(await request.json());
    if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "训练组参数错误");
    const input = parsed.data;
    return NextResponse.json(await upsertWorkoutSet((await context.params).id, { session_exercise_id: input.sessionExerciseId, set_number: input.setNumber, set_type: input.setType, weight_kg: input.weightKg, reps: input.reps, rir: input.rir, duration_seconds: input.durationSeconds, is_completed: input.isCompleted, client_idempotency_key: input.clientIdempotencyKey ?? crypto.randomUUID() }), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
