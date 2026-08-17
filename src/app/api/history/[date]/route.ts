import { NextResponse } from "next/server";
import { requireUnlockedSession } from "@/lib/auth/session";
import { unauthorizedResponse, badRequestResponse, serverErrorResponse } from "@/lib/auth/http";
import { dateSchema } from "@/lib/validation/daily";
import { getDay } from "@/lib/db/daily";

export async function GET(_request: Request, context: { params: Promise<{ date: string }> }) {
  try {
    await requireUnlockedSession();
    const date = (await context.params).date;
    const parsed = dateSchema.safeParse(date);
    if (!parsed.success) return badRequestResponse("date 必须是 YYYY-MM-DD");
    return NextResponse.json(await getDay(parsed.data));
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
