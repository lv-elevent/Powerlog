import { NextResponse } from "next/server";
import { requireUnlockedSession } from "@/lib/auth/session";
import { unauthorizedResponse, badRequestResponse, serverErrorResponse } from "@/lib/auth/http";
import { dateSchema } from "@/lib/validation/daily";
import { getDay } from "@/lib/db/daily";

export async function GET(request: Request) {
  try {
    await requireUnlockedSession();
    const date = new URL(request.url).searchParams.get("date") ?? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
    const parsed = dateSchema.safeParse(date);
    if (!parsed.success) return badRequestResponse("date 必须是 YYYY-MM-DD");
    return NextResponse.json(await getDay(parsed.data));
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
