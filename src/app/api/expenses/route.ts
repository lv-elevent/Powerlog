import { NextResponse } from "next/server";
import { requireUnlockedSession } from "@/lib/auth/session";
import { unauthorizedResponse, badRequestResponse, serverErrorResponse } from "@/lib/auth/http";
import { ensureDailyLog, insertExpense, listExpenseCategories } from "@/lib/db/repositories";
import { expenseSchema } from "@/lib/validation/daily";

export async function POST(request: Request) {
  try {
    await requireUnlockedSession();
    const parsed = expenseSchema.extend({ categoryName: expenseSchema.shape.note.optional() }).safeParse(await request.json());
    if (!parsed.success) return badRequestResponse(parsed.error.issues[0]?.message ?? "支出参数错误");
    const categoryName = typeof parsed.data.categoryName === "string" ? parsed.data.categoryName : null;
    const categoryId = parsed.data.categoryId ?? (categoryName ? (await listExpenseCategories()).find(category => category.name === categoryName)?.id : null) ?? null;
    await ensureDailyLog(parsed.data.date);
    const record = await insertExpense({ record_date: parsed.data.date, spent_at: parsed.data.spentAt ?? new Date().toISOString(), amount: parsed.data.amount, category_id: categoryId, merchant: parsed.data.merchant, note: parsed.data.note, client_idempotency_key: parsed.data.clientIdempotencyKey ?? crypto.randomUUID() });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") return unauthorizedResponse();
    return serverErrorResponse(error);
  }
}
