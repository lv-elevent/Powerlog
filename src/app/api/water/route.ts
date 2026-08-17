import { NextResponse } from "next/server";
import { requireUnlockedSession } from "@/lib/auth/session";
import { unauthorizedResponse, badRequestResponse, serverErrorResponse } from "@/lib/auth/http";
import { ensureDailyLog, upsertWaterLog } from "@/lib/db/repositories";
import { waterSchema } from "@/lib/validation/daily";

export async function POST(request: Request) {
  try {
    await requireUnlockedSession();
    const parsed = waterSchema.safeParse(await request.json());
    if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "饮水参数错误");
    await ensureDailyLog(parsed.data.date);
    const record = await upsertWaterLog({ record_date: parsed.data.date, amount_ml: parsed.data.amountMl, logged_at: parsed.data.loggedAt ?? new Date().toISOString(), client_idempotency_key: parsed.data.clientIdempotencyKey ?? crypto.randomUUID() });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
