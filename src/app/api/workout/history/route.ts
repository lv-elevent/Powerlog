import { NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/http";
import { requireUnlockedSession } from "@/lib/auth/session";
import { getLastWorkoutSet } from "@/lib/db/repositories";

export async function GET(request: Request) {
  try {
    await requireUnlockedSession();
    const exerciseId = new URL(request.url).searchParams.get("exerciseId");
    if (!exerciseId) return badRequestResponse("exerciseId 必须提供");
    return NextResponse.json(await getLastWorkoutSet(exerciseId));
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
