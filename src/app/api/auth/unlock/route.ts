import { NextResponse } from "next/server";
import { verifyPin } from "@/lib/auth/pin";
import { issueSession } from "@/lib/auth/session";
import { serverErrorResponse } from "@/lib/auth/http";
import { getAppSecurity, updateAppSecurity } from "@/lib/db/repositories";
import { unlockSchema } from "@/lib/validation/daily";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function POST(request: Request) {
  try {
    const parsed = unlockSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "PIN 格式不正确" }, { status: 400 });
    const security = await getAppSecurity();
    if (!security.setup_completed || !security.pin_hash) return NextResponse.json({ error: "请先完成 App 初始化", code: "SETUP_REQUIRED" }, { status: 409 });
    if (security.locked_until && new Date(security.locked_until).getTime() > Date.now()) return NextResponse.json({ error: "多次输入失败，请稍后再试" }, { status: 423 });

    if (!(await verifyPin(parsed.data.pin, security.pin_hash))) {
      const failedAttempts = security.failed_attempts + 1;
      await updateAppSecurity({ failed_attempts: failedAttempts, locked_until: failedAttempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : null });
      return NextResponse.json({ error: failedAttempts >= MAX_FAILED_ATTEMPTS ? "多次输入失败，请稍后再试" : "PIN 不正确" }, { status: failedAttempts >= MAX_FAILED_ATTEMPTS ? 423 : 401 });
    }

    const next = await updateAppSecurity({ failed_attempts: 0, locked_until: null });
    await issueSession(next.session_version);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
