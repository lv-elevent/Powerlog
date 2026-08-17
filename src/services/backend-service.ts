import type { BodyMeasurementRow, CardioSessionRow, DailyLogRow, DailyNoteRow, DailyNutritionRow, DailyReviewRow, ExpenseCategoryRow, ExpenseRow, FoodLibraryRow, MealItemRow, MealRow, MealTemplateItemRow, MealTemplateRow, MealTotalRow, NutritionGoalRow, SleepLogRow, WaterLogRow, WorkSessionRow, WorkoutSessionGraph } from "@/lib/db/repositories";
import type { InsightCategory, InsightRange, InsightsPayload } from "@/types/insights";

export interface BackendDayData {
  date: string;
  daily: DailyLogRow | null;
  body: BodyMeasurementRow | null;
  water: { totalMl: number; logs: WaterLogRow[] };
  expenses: { total: number; logs: ExpenseRow[] };
  notes: DailyNoteRow[];
  nutrition: { totals: DailyNutritionRow | null; meals: Array<{ meal: MealRow; items: MealItemRow[]; total: MealTotalRow | null }> };
  nutritionGoal: NutritionGoalRow | null;
  workouts: WorkoutSessionGraph[];
  sleep: SleepLogRow | null;
  cardio: CardioSessionRow[];
  work: WorkSessionRow[];
  review: DailyReviewRow | null;
}

export interface NutritionData {
  foods: FoodLibraryRow[];
  templates: Array<{ template: MealTemplateRow; items: MealTemplateItemRow[]; foods: FoodLibraryRow[] }>;
  goals: NutritionGoalRow[];
}

export function currentRecordDate(): string { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date()); }

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new Error(payload.error ?? `Request failed with status ${response.status}`);
  return payload;
}

export async function getBackendDay(date = currentRecordDate()): Promise<BackendDayData> {
  return request<BackendDayData>(`/api/today?date=${encodeURIComponent(date)}`, { cache: "no-store" });
}

export async function getBackendHistoryDay(date: string): Promise<BackendDayData> {
  return request<BackendDayData>(`/api/history/${encodeURIComponent(date)}`, { cache: "no-store" });
}

export async function addWaterLog(input: { date: string; amountMl: number }): Promise<WaterLogRow> {
  return request<WaterLogRow>("/api/water", { method: "POST", body: JSON.stringify({ ...input, clientIdempotencyKey: crypto.randomUUID() }) });
}

export async function saveBodyMeasurement(input: { date: string; weightKg: number; measuredAt?: string }): Promise<BodyMeasurementRow> {
  return request<BodyMeasurementRow>("/api/body", { method: "POST", body: JSON.stringify(input) });
}

export async function addExpense(input: { date: string; amount: number; categoryId?: string | null; categoryName?: string | null; note?: string | null }): Promise<ExpenseRow> {
  return request<ExpenseRow>("/api/expenses", { method: "POST", body: JSON.stringify({ ...input, clientIdempotencyKey: crypto.randomUUID() }) });
}

export async function addDailyNote(input: { date: string; text: string }): Promise<DailyNoteRow> {
  return request<DailyNoteRow>("/api/notes", { method: "POST", body: JSON.stringify({ ...input, clientIdempotencyKey: crypto.randomUUID() }) });
}

export async function getExpenseCategories(): Promise<ExpenseCategoryRow[]> {
  return request<ExpenseCategoryRow[]>("/api/expenses/categories", { cache: "no-store" });
}

export async function saveDailyReview(date: string, input: { bestThing: string; improvement: string; tomorrowPriority: string }): Promise<DailyReviewRow> { return request<DailyReviewRow>(`/api/review/${encodeURIComponent(date)}`, { method: "POST", body: JSON.stringify({ bestThing: input.bestThing || null, improvement: input.improvement || null, tomorrowPriority: input.tomorrowPriority || null }) }); }
export async function saveSleep(input: { date: string; durationMinutes: number; qualityScore: number }): Promise<SleepLogRow> { return request<SleepLogRow>("/api/sleep", { method: "POST", body: JSON.stringify(input) }); }
export async function addCardio(input: { date: string; cardioType: string; durationMinutes: number }): Promise<CardioSessionRow> { return request<CardioSessionRow>("/api/cardio", { method: "POST", body: JSON.stringify({ ...input, clientIdempotencyKey: crypto.randomUUID() }) }); }
export async function addWork(input: { date: string; sessionType: "work" | "study" | "project" | "other"; title: string; durationMinutes: number; didText?: string }): Promise<WorkSessionRow> { return request<WorkSessionRow>("/api/work", { method: "POST", body: JSON.stringify({ ...input, clientIdempotencyKey: crypto.randomUUID() }) }); }
export async function getInsightsData(range: InsightRange, category: InsightCategory): Promise<InsightsPayload> { return request<InsightsPayload>(`/api/insights?range=${range}&category=${category}`, { cache: "no-store" }); }
