import { NextResponse } from "next/server";
import { requireUnlockedSession } from "@/lib/auth/session";
import { unauthorizedResponse, serverErrorResponse } from "@/lib/auth/http";
import { listExpenseCategories } from "@/lib/db/repositories";

export async function GET() {
  try {
    await requireUnlockedSession();
    return NextResponse.json(await listExpenseCategories());
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
