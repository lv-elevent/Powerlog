import { NextResponse } from "next/server";
import { requireUnlockedSession } from "@/lib/auth/session";
import { unauthorizedResponse, badRequestResponse, serverErrorResponse } from "@/lib/auth/http";
import { ensureDailyLog, upsertBodyMeasurement } from "@/lib/db/repositories";
import { bodySchema } from "@/lib/validation/daily";

export async function POST(request: Request) {
  try {
    await requireUnlockedSession();
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "身体数据参数错误");
    await ensureDailyLog(parsed.data.date);
    const record = await upsertBodyMeasurement({ record_date: parsed.data.date, measured_at: parsed.data.measuredAt ?? new Date().toISOString(), weight_kg: parsed.data.weightKg, waist_cm: parsed.data.waistCm, note: parsed.data.note, client_idempotency_key: parsed.data.clientIdempotencyKey ?? null });
    return NextResponse.json(record, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
