import { NextResponse } from "next/server";
import { hashPin } from "@/lib/auth/pin";
import { issueSession } from "@/lib/auth/session";
import { serverErrorResponse } from "@/lib/auth/http";
import { getAppSecurity, updateAppSecurity } from "@/lib/db/repositories";
import { setupSchema } from "@/lib/validation/daily";

export async function POST(request: Request) {
  try {
    const parsed = setupSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "参数错误" }, { status: 400 });
    if (!process.env.APP_SETUP_SECRET || parsed.data.setupSecret !== process.env.APP_SETUP_SECRET) return NextResponse.json({ error: "初始化密钥不正确" }, { status: 403 });

    const security = await getAppSecurity();
    if (security.setup_completed) return NextResponse.json({ error: "App 已完成初始化" }, { status: 409 });
    const next = await updateAppSecurity({ setup_completed: true, pin_hash: await hashPin(parsed.data.pin), failed_attempts: 0, locked_until: null });
    await issueSession(next.session_version);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
