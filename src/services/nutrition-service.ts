import type { FoodLibraryRow, MealItemRow, MealRow, MealTemplateItemRow, MealTemplateRow, MealTotalRow, NutritionGoalRow } from "@/lib/db/repositories";
import type { FoodLibraryItem, Meal, MealTemplateRecord, NutritionGoalRecord, NutritionMealRecord, NutritionTotals } from "@/types";

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new Error(payload.error ?? `Request failed with status ${response.status}`);
  return payload;
}

export function mapFood(row: FoodLibraryRow): FoodLibraryItem {
  return { id: row.id, name: row.name, brand: row.brand, servingName: row.serving_name, servingWeightG: row.serving_weight_g === null ? null : Number(row.serving_weight_g), weightBasis: row.weight_basis, caloriesPer100G: Number(row.calories_per_100g), proteinPer100G: Number(row.protein_per_100g), carbsPer100G: Number(row.carbs_per_100g), fatPer100G: Number(row.fat_per_100g), fiberPer100G: Number(row.fiber_per_100g), isFavorite: row.is_favorite, isActive: row.is_active, note: row.note };
}

export function mapGoal(row: NutritionGoalRow | null): NutritionGoalRecord | null {
  if (!row) return null;
  return { id: row.id, effectiveFrom: row.effective_from, effectiveTo: row.effective_to, calories: Number(row.calories_kcal ?? 0), protein: Number(row.protein_g ?? 0), carbs: Number(row.carbs_g ?? 0), fat: Number(row.fat_g ?? 0), fiber: Number(row.fiber_g ?? 0), water: Number(row.water_ml ?? 0), note: row.note };
}

function totalsFromItems(items: MealItemRow[]): NutritionTotals { return items.reduce((total, item) => ({ calories: total.calories + Number(item.calories_snapshot), protein: total.protein + Number(item.protein_snapshot), carbs: total.carbs + Number(item.carbs_snapshot), fat: total.fat + Number(item.fat_snapshot), fiber: total.fiber + Number(item.fiber_snapshot) }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }); }

export function mapMeal(group: { meal: MealRow; items: MealItemRow[]; total: MealTotalRow | null }): NutritionMealRecord {
  const totals = group.total ? { calories: Number(group.total.calories_kcal), protein: Number(group.total.protein_g), carbs: Number(group.total.carbs_g), fat: Number(group.total.fat_g), fiber: Number(group.total.fiber_g) } : totalsFromItems(group.items);
  return { id: group.meal.id, recordDate: group.meal.record_date, type: group.meal.meal_type as NutritionMealRecord["type"], title: group.meal.title, eatenAt: group.meal.eaten_at, sourceTemplateId: group.meal.source_template_id, items: group.items.map(item => ({ id: item.id, foodId: item.food_id, foodNameSnapshot: item.food_name_snapshot, brandSnapshot: item.brand_snapshot, quantityG: item.quantity_g === null ? null : Number(item.quantity_g), servingNameSnapshot: item.serving_name_snapshot, servingCount: item.serving_count === null ? null : Number(item.serving_count), calories: Number(item.calories_snapshot), protein: Number(item.protein_snapshot), carbs: Number(item.carbs_snapshot), fat: Number(item.fat_snapshot), fiber: Number(item.fiber_snapshot) })), totals };
}

export function mapMealToUi(meal: NutritionMealRecord): Meal {
  return { id: meal.id, type: meal.type, label: ({ breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐", pre_workout: "训练前", post_workout: "训练后", other: "其他" }[meal.type]), time: new Date(meal.eatenAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }), description: meal.items.map(item => `${item.foodNameSnapshot}${item.quantityG ? ` ${item.quantityG}g` : ""}`).join(" · "), totals: meal.totals, items: meal.items.map(item => ({ name: item.foodNameSnapshot, amount: item.quantityG ? `${item.quantityG}g` : item.servingNameSnapshot ?? "1 份", calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat, fiber: item.fiber })) };
}

export function mapTemplate(group: { template: MealTemplateRow; items: MealTemplateItemRow[]; foods: FoodLibraryRow[] }): MealTemplateRecord {
  return { id: group.template.id, name: group.template.name, mealType: group.template.meal_type as MealTemplateRecord["mealType"], isFavorite: group.template.is_favorite, items: group.items.map(item => ({ id: item.id, foodId: item.food_id, quantityG: item.quantity_g === null ? null : Number(item.quantity_g), servingCount: item.serving_count === null ? null : Number(item.serving_count), food: group.foods.find(food => food.id === item.food_id) ? mapFood(group.foods.find(food => food.id === item.food_id) as FoodLibraryRow) : null })) };
}

export async function getFoods(search?: string, includeInactive = false): Promise<FoodLibraryItem[]> { const query = new URLSearchParams(); if (search) query.set("search", search); if (includeInactive) query.set("includeInactive", "true"); const rows = await request<FoodLibraryRow[]>(`/api/foods${query.toString() ? `?${query}` : ""}`, { cache: "no-store" }); return rows.map(mapFood); }
export async function createFood(input: { name: string; brand?: string | null; servingName?: string | null; servingWeightG?: number | null; weightBasis: FoodLibraryItem["weightBasis"]; caloriesPer100G: number; proteinPer100G: number; carbsPer100G: number; fatPer100G: number; fiberPer100G: number; note?: string | null }): Promise<FoodLibraryItem> { return mapFood(await request<FoodLibraryRow>("/api/foods", { method: "POST", body: JSON.stringify(input) })); }
export async function updateFood(id: string, input: Partial<Parameters<typeof createFood>[0]> & { isFavorite?: boolean; isActive?: boolean }): Promise<FoodLibraryItem> { return mapFood(await request<FoodLibraryRow>(`/api/foods/${id}`, { method: "PATCH", body: JSON.stringify(input) })); }
export async function deactivateFood(id: string): Promise<FoodLibraryItem> { return mapFood(await request<FoodLibraryRow>(`/api/foods/${id}`, { method: "DELETE" })); }

export async function getMeal(id: string): Promise<NutritionMealRecord> { return mapMeal(await request<{ meal: MealRow; items: MealItemRow[]; total: MealTotalRow | null }>(`/api/meals/${id}`, { cache: "no-store" })); }
export async function createMeal(input: { date: string; mealType: NutritionMealRecord["type"]; title?: string | null; eatenAt?: string; sourceTemplateId?: string | null; items: Array<{ foodId: string; quantityG: number; servingCount?: number | null }> }): Promise<NutritionMealRecord> { return mapMeal(await request<{ meal: MealRow; items: MealItemRow[]; total: MealTotalRow | null }>("/api/meals", { method: "POST", body: JSON.stringify({ ...input, clientIdempotencyKey: crypto.randomUUID() }) })); }
export async function updateMeal(id: string, input: Omit<Parameters<typeof createMeal>[0], "date"> & { date: string }): Promise<NutritionMealRecord> { return mapMeal(await request<{ meal: MealRow; items: MealItemRow[]; total: MealTotalRow | null }>(`/api/meals/${id}`, { method: "PATCH", body: JSON.stringify({ ...input, clientIdempotencyKey: crypto.randomUUID() }) })); }
export async function deleteMeal(id: string): Promise<void> { await request<{ ok: true }>(`/api/meals/${id}`, { method: "DELETE" }); }

export async function getMealTemplates(): Promise<MealTemplateRecord[]> { const rows = await request<Array<{ template: MealTemplateRow; items: MealTemplateItemRow[]; foods: FoodLibraryRow[] }>>("/api/meal-templates", { cache: "no-store" }); return rows.map(mapTemplate); }
export async function createMealTemplate(input: { name: string; mealType: NutritionMealRecord["type"]; items: Array<{ foodId: string; quantityG: number }> }): Promise<void> { await request("/api/meal-templates", { method: "POST", body: JSON.stringify({ ...input, items: input.items.map((item, index) => ({ ...item, sortOrder: index })) }) }); }
export async function getNutritionGoals(): Promise<NutritionGoalRecord[]> { const rows = await request<NutritionGoalRow[]>("/api/nutrition-goals", { cache: "no-store" }); return rows.map(row => mapGoal(row)).filter((row): row is NutritionGoalRecord => row !== null); }
export async function createNutritionGoal(input: Omit<NutritionGoalRecord, "id" | "effectiveTo" | "note"> & { effectiveTo?: string | null; note?: string | null }): Promise<NutritionGoalRecord> { return mapGoal(await request<NutritionGoalRow>("/api/nutrition-goals", { method: "POST", body: JSON.stringify({ ...input, note: input.note ?? null }) })) as NutritionGoalRecord; }
