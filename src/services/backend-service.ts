import type { BodyMeasurementRow, DailyLogRow, DailyNoteRow, DailyNutritionRow, ExpenseCategoryRow, ExpenseRow, FoodLibraryRow, MealItemRow, MealRow, MealTemplateItemRow, MealTemplateRow, MealTotalRow, NutritionGoalRow, WaterLogRow } from "@/lib/db/repositories";

export interface BackendDayData {
  date: string;
  daily: DailyLogRow | null;
  body: BodyMeasurementRow | null;
  water: { totalMl: number; logs: WaterLogRow[] };
  expenses: { total: number; logs: ExpenseRow[] };
  notes: DailyNoteRow[];
  nutrition: { totals: DailyNutritionRow | null; meals: Array<{ meal: MealRow; items: MealItemRow[]; total: MealTotalRow | null }> };
  nutritionGoal: NutritionGoalRow | null;
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
