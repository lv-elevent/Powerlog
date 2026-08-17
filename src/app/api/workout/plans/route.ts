import { NextResponse } from "next/server";
import { serverErrorResponse, unauthorizedResponse } from "@/lib/auth/http";
import { requireUnlockedSession } from "@/lib/auth/session";
import { listWorkoutPlans } from "@/lib/db/repositories";

export async function GET() {
  try {
    await requireUnlockedSession();
    return NextResponse.json(await listWorkoutPlans());
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
