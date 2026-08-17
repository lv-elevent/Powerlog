import { NextResponse } from "next/server";
import { requireUnlockedSession } from "@/lib/auth/session";
import { unauthorizedResponse, badRequestResponse, serverErrorResponse } from "@/lib/auth/http";
import { ensureDailyLog, insertDailyNote } from "@/lib/db/repositories";
import { noteSchema } from "@/lib/validation/daily";

export async function POST(request: Request) {
  try {
    await requireUnlockedSession();
    const parsed = noteSchema.safeParse(await request.json());
    if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "随手记参数错误");
    await ensureDailyLog(parsed.data.date);
    const record = await insertDailyNote({ record_date: parsed.data.date, noted_at: parsed.data.notedAt ?? new Date().toISOString(), text: parsed.data.text, client_idempotency_key: parsed.data.clientIdempotencyKey ?? crypto.randomUUID() });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
