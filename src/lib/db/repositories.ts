import { getSupabaseAdmin } from "@/lib/supabase/server";

export interface AppSecurityRow {
  id: number;
  setup_completed: boolean;
  pin_hash: string | null;
  session_version: number;
  auto_lock_minutes: number;
  failed_attempts: number;
  locked_until: string | null;
  updated_at: string;
}

export interface DailyLogRow {
  id: string;
  record_date: string;
  is_closed: boolean;
  completion_score: number | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BodyMeasurementRow {
  id: string;
  record_date: string;
  measured_at: string | null;
  weight_kg: number | null;
  body_fat_pct: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  arm_cm: number | null;
  thigh_cm: number | null;
  hip_cm: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface WaterLogRow {
  id: string;
  record_date: string;
  logged_at: string;
  amount_ml: number;
  client_idempotency_key: string | null;
  created_at: string;
}

export interface ExpenseCategoryRow {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ExpenseRow {
  id: string;
  record_date: string;
  spent_at: string;
  amount: number;
  category_id: string | null;
  merchant: string | null;
  note: string | null;
  client_idempotency_key: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string | null;
}

export interface DailyNoteRow {
  id: string;
  record_date: string;
  noted_at: string;
  text: string;
  client_idempotency_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoodLibraryRow {
  id: string;
  name: string;
  brand: string | null;
  serving_name: string | null;
  serving_weight_g: number | null;
  weight_basis: "cooked" | "raw" | "edible_cooked" | "packaged" | "serving" | "other";
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  sodium_mg_per_100g: number | null;
  barcode: string | null;
  is_favorite: boolean;
  is_active: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface NutritionGoalRow {
  id: string;
  effective_from: string;
  effective_to: string | null;
  calories_kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  water_ml: number | null;
  note: string | null;
  created_at: string;
}

export interface MealTemplateRow {
  id: string;
  name: string;
  meal_type: string;
  is_favorite: boolean;
  is_active: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface MealTemplateItemRow {
  id: string;
  template_id: string;
  food_id: string;
  quantity_g: number | null;
  serving_count: number | null;
  sort_order: number;
  created_at: string;
}

export interface MealRow {
  id: string;
  record_date: string;
  meal_type: string;
  title: string | null;
  eaten_at: string;
  note: string | null;
  source_template_id: string | null;
  client_idempotency_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface MealItemRow {
  id: string;
  meal_id: string;
  food_id: string | null;
  food_name_snapshot: string;
  brand_snapshot: string | null;
  quantity_g: number | null;
  serving_name_snapshot: string | null;
  serving_count: number | null;
  calories_snapshot: number;
  protein_snapshot: number;
  carbs_snapshot: number;
  fat_snapshot: number;
  fiber_snapshot: number;
  sodium_mg_snapshot: number | null;
  sort_order: number;
  created_at: string;
}

export interface MealTotalRow {
  meal_id: string;
  record_date: string;
  meal_type: string;
  eaten_at: string;
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface DailyNutritionRow {
  record_date: string;
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface NutritionMealItemInput {
  food_id: string;
  quantity_g: number;
  serving_count?: number | null;
}

export interface NutritionMealInput {
  record_date: string;
  meal_type: string;
  title?: string | null;
  eaten_at: string;
  note?: string | null;
  source_template_id?: string | null;
  client_idempotency_key: string;
  items: NutritionMealItemInput[];
}

export interface NutritionTemplateItemInput {
  food_id: string;
  quantity_g?: number | null;
  serving_count?: number | null;
  sort_order: number;
}

type QueryResult<T> = { data: T | null; error: { message: string } | null };

function unwrap<T>({ data, error }: QueryResult<T>): T {
  if (error) throw new Error(error.message);
  if (data === null) throw new Error("Database returned no record");
  return data;
}

export async function getAppSecurity(): Promise<AppSecurityRow> {
  return unwrap(await getSupabaseAdmin().from("app_security").select("*").eq("id", 1).single());
}

export async function updateAppSecurity(values: Partial<AppSecurityRow>): Promise<AppSecurityRow> {
  return unwrap(await getSupabaseAdmin().from("app_security").update(values).eq("id", 1).select("*").single());
}

export async function ensureDailyLog(recordDate: string): Promise<DailyLogRow> {
  return unwrap(await getSupabaseAdmin().from("daily_logs").upsert({ record_date: recordDate }, { onConflict: "record_date" }).select("*").single());
}

export async function getDailyLog(recordDate: string): Promise<DailyLogRow | null> {
  const result = await getSupabaseAdmin().from("daily_logs").select("*").eq("record_date", recordDate).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return result.data as DailyLogRow | null;
}

export async function upsertWaterLog(input: { record_date: string; amount_ml: number; logged_at: string; client_idempotency_key: string }): Promise<WaterLogRow> {
  return unwrap(await getSupabaseAdmin().from("water_logs").upsert(input, { onConflict: "client_idempotency_key" }).select("*").single());
}

export async function listWaterLogs(recordDate: string): Promise<WaterLogRow[]> {
  return unwrap(await getSupabaseAdmin().from("water_logs").select("*").eq("record_date", recordDate).order("logged_at", { ascending: true })) as WaterLogRow[];
}

export async function upsertBodyMeasurement(input: { record_date: string; measured_at: string; weight_kg: number; waist_cm?: number | null; note?: string | null }): Promise<BodyMeasurementRow> {
  return unwrap(await getSupabaseAdmin().from("body_measurements").upsert(input, { onConflict: "record_date" }).select("*").single());
}

export async function getBodyMeasurement(recordDate: string): Promise<BodyMeasurementRow | null> {
  const result = await getSupabaseAdmin().from("body_measurements").select("*").eq("record_date", recordDate).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return result.data as BodyMeasurementRow | null;
}

export async function listExpenseCategories(): Promise<ExpenseCategoryRow[]> {
  return unwrap(await getSupabaseAdmin().from("expense_categories").select("*").eq("is_active", true).order("sort_order", { ascending: true })) as ExpenseCategoryRow[];
}

export async function insertExpense(input: { record_date: string; spent_at: string; amount: number; category_id?: string | null; merchant?: string | null; note?: string | null; client_idempotency_key: string }): Promise<ExpenseRow> {
  return unwrap(await getSupabaseAdmin().from("expenses").upsert(input, { onConflict: "client_idempotency_key" }).select("*").single());
}

export async function listExpenses(recordDate: string): Promise<ExpenseRow[]> {
  return unwrap(await getSupabaseAdmin().from("expenses").select("*").eq("record_date", recordDate).order("spent_at", { ascending: true })) as ExpenseRow[];
}

export async function insertDailyNote(input: { record_date: string; noted_at: string; text: string; client_idempotency_key: string }): Promise<DailyNoteRow> {
  return unwrap(await getSupabaseAdmin().from("daily_notes").upsert(input, { onConflict: "client_idempotency_key" }).select("*").single());
}

export async function listDailyNotes(recordDate: string): Promise<DailyNoteRow[]> {
  return unwrap(await getSupabaseAdmin().from("daily_notes").select("*").eq("record_date", recordDate).order("noted_at", { ascending: true })) as DailyNoteRow[];
}

export async function listFoods(search?: string, includeInactive = false): Promise<FoodLibraryRow[]> {
  let query = getSupabaseAdmin().from("food_library").select("*").order("name", { ascending: true });
  if (!includeInactive) query = query.eq("is_active", true);
  if (search) query = query.ilike("name", `%${search}%`);
  return unwrap(await query) as FoodLibraryRow[];
}

export async function getFood(foodId: string): Promise<FoodLibraryRow> {
  return unwrap(await getSupabaseAdmin().from("food_library").select("*").eq("id", foodId).single());
}

export interface FoodLibraryInput {
  name: string;
  brand?: string | null;
  serving_name?: string | null;
  serving_weight_g?: number | null;
  weight_basis: FoodLibraryRow["weight_basis"];
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  sodium_mg_per_100g?: number | null;
  barcode?: string | null;
  is_favorite?: boolean;
  is_active?: boolean;
  note?: string | null;
}

export async function createFood(input: FoodLibraryInput): Promise<FoodLibraryRow> {
  return unwrap(await getSupabaseAdmin().from("food_library").insert(input).select("*").single());
}

export async function updateFood(foodId: string, input: Partial<FoodLibraryInput>): Promise<FoodLibraryRow> {
  return unwrap(await getSupabaseAdmin().from("food_library").update(input).eq("id", foodId).select("*").single());
}

export async function deactivateFood(foodId: string): Promise<FoodLibraryRow> {
  return updateFood(foodId, { is_active: false });
}

export async function listNutritionGoals(): Promise<NutritionGoalRow[]> {
  return unwrap(await getSupabaseAdmin().from("nutrition_goals").select("*").order("effective_from", { ascending: false })) as NutritionGoalRow[];
}

export async function getNutritionGoal(recordDate: string): Promise<NutritionGoalRow | null> {
  const result = await getSupabaseAdmin().from("nutrition_goals").select("*").lte("effective_from", recordDate).or(`effective_to.is.null,effective_to.gte.${recordDate}`).order("effective_from", { ascending: false }).limit(1).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return result.data as NutritionGoalRow | null;
}

export async function createNutritionGoal(input: Omit<NutritionGoalRow, "id" | "created_at">): Promise<NutritionGoalRow> {
  const effectiveDate = new Date(`${input.effective_from}T00:00:00.000Z`);
  effectiveDate.setUTCDate(effectiveDate.getUTCDate() - 1);
  const previousEffectiveTo = effectiveDate.toISOString().slice(0, 10);
  const closePrevious = await getSupabaseAdmin().from("nutrition_goals").update({ effective_to: previousEffectiveTo }).is("effective_to", null).lt("effective_from", input.effective_from);
  if (closePrevious.error) throw new Error(closePrevious.error.message);
  return unwrap(await getSupabaseAdmin().from("nutrition_goals").insert(input).select("*").single());
}

export async function listMealTotals(recordDate: string): Promise<MealTotalRow[]> {
  return unwrap(await getSupabaseAdmin().from("v_meal_totals").select("*").eq("record_date", recordDate).order("eaten_at", { ascending: true })) as MealTotalRow[];
}

export async function getDailyNutrition(recordDate: string): Promise<DailyNutritionRow | null> {
  const result = await getSupabaseAdmin().from("v_daily_nutrition").select("*").eq("record_date", recordDate).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return result.data as DailyNutritionRow | null;
}

async function listMealRows(mealId?: string, recordDate?: string): Promise<MealRow[]> {
  let query = getSupabaseAdmin().from("meals").select("*").order("eaten_at", { ascending: true });
  if (mealId) query = query.eq("id", mealId);
  if (recordDate) query = query.eq("record_date", recordDate);
  return unwrap(await query) as MealRow[];
}

export async function getMeal(mealId: string): Promise<{ meal: MealRow; items: MealItemRow[]; total: MealTotalRow | null }> {
  const meals = await listMealRows(mealId);
  const meal = meals[0];
  if (!meal) throw new Error("Meal not found");
  const items = unwrap(await getSupabaseAdmin().from("meal_items").select("*").eq("meal_id", mealId).order("sort_order", { ascending: true })) as MealItemRow[];
  const totalResult = await getSupabaseAdmin().from("v_meal_totals").select("*").eq("meal_id", mealId).maybeSingle();
  if (totalResult.error) throw new Error(totalResult.error.message);
  return { meal, items, total: totalResult.data as MealTotalRow | null };
}

export async function listMeals(recordDate: string): Promise<Array<{ meal: MealRow; items: MealItemRow[]; total: MealTotalRow | null }>> {
  const meals = await listMealRows(undefined, recordDate);
  if (!meals.length) return [];
  const ids = meals.map(meal => meal.id);
  const items = unwrap(await getSupabaseAdmin().from("meal_items").select("*").in("meal_id", ids).order("sort_order", { ascending: true })) as MealItemRow[];
  const totals = await listMealTotals(recordDate);
  return meals.map(meal => ({ meal, items: items.filter(item => item.meal_id === meal.id), total: totals.find(total => total.meal_id === meal.id) ?? null }));
}

function nutritionPerQuantity(food: FoodLibraryRow, quantityG: number) {
  const factor = quantityG / 100;
  return { calories_snapshot: Number(food.calories_per_100g) * factor, protein_snapshot: Number(food.protein_per_100g) * factor, carbs_snapshot: Number(food.carbs_per_100g) * factor, fat_snapshot: Number(food.fat_per_100g) * factor, fiber_snapshot: Number(food.fiber_per_100g) * factor, sodium_mg_snapshot: food.sodium_mg_per_100g === null ? null : Number(food.sodium_mg_per_100g) * factor };
}

async function buildMealItems(items: NutritionMealItemInput[], mealId: string): Promise<Array<Omit<MealItemRow, "id" | "created_at">>> {
  const foods = unwrap(await getSupabaseAdmin().from("food_library").select("*").in("id", items.map(item => item.food_id))) as FoodLibraryRow[];
  return items.map((input, index) => {
    const food = foods.find(current => current.id === input.food_id);
    if (!food) throw new Error(`Food not found: ${input.food_id}`);
    return { meal_id: mealId, food_id: food.id, food_name_snapshot: food.name, brand_snapshot: food.brand, quantity_g: input.quantity_g, serving_name_snapshot: food.serving_name, serving_count: input.serving_count ?? null, sort_order: index, ...nutritionPerQuantity(food, input.quantity_g) };
  });
}

export async function createMeal(input: NutritionMealInput): Promise<{ meal: MealRow; items: MealItemRow[]; total: MealTotalRow | null }> {
  const meal = unwrap<MealRow>(await getSupabaseAdmin().from("meals").insert({ record_date: input.record_date, meal_type: input.meal_type, title: input.title ?? null, eaten_at: input.eaten_at, note: input.note ?? null, source_template_id: input.source_template_id ?? null, client_idempotency_key: input.client_idempotency_key }).select("*").single());
  try {
    const items = await buildMealItems(input.items, meal.id);
    await unwrap(await getSupabaseAdmin().from("meal_items").insert(items).select("*"));
    return getMeal(meal.id);
  } catch (error) {
    await getSupabaseAdmin().from("meals").delete().eq("id", meal.id);
    throw error;
  }
}

export async function updateMeal(mealId: string, input: Omit<NutritionMealInput, "client_idempotency_key">): Promise<{ meal: MealRow; items: MealItemRow[]; total: MealTotalRow | null }> {
  const meal = unwrap<MealRow>(await getSupabaseAdmin().from("meals").update({ record_date: input.record_date, meal_type: input.meal_type, title: input.title ?? null, eaten_at: input.eaten_at, note: input.note ?? null, source_template_id: input.source_template_id ?? null }).eq("id", mealId).select("*").single());
  const items = await buildMealItems(input.items, mealId);
  const removeItems = await getSupabaseAdmin().from("meal_items").delete().eq("meal_id", mealId);
  if (removeItems.error) throw new Error(removeItems.error.message);
  await unwrap(await getSupabaseAdmin().from("meal_items").insert(items).select("*"));
  return getMeal(mealId);
}

export async function deleteMeal(mealId: string): Promise<void> {
  const result = await getSupabaseAdmin().from("meals").delete().eq("id", mealId);
  if (result.error) throw new Error(result.error.message);
}

export async function listMealTemplates(): Promise<Array<{ template: MealTemplateRow; items: MealTemplateItemRow[]; foods: FoodLibraryRow[] }>> {
  const templates = unwrap(await getSupabaseAdmin().from("meal_templates").select("*").eq("is_active", true).order("name", { ascending: true })) as MealTemplateRow[];
  if (!templates.length) return [];
  const templateIds = templates.map(template => template.id);
  const items = unwrap(await getSupabaseAdmin().from("meal_template_items").select("*").in("template_id", templateIds).order("sort_order", { ascending: true })) as MealTemplateItemRow[];
  const foods = items.length ? (unwrap(await getSupabaseAdmin().from("food_library").select("*").in("id", items.map(item => item.food_id))) as FoodLibraryRow[]) : [];
  return templates.map(template => ({ template, items: items.filter(item => item.template_id === template.id), foods: foods.filter(food => items.some(item => item.template_id === template.id && item.food_id === food.id)) }));
}

export async function createMealTemplate(input: { name: string; meal_type: string; is_favorite?: boolean; note?: string | null; items: NutritionTemplateItemInput[] }): Promise<void> {
  const template = unwrap<MealTemplateRow>(await getSupabaseAdmin().from("meal_templates").insert({ name: input.name, meal_type: input.meal_type, is_favorite: input.is_favorite ?? false, note: input.note ?? null }).select("*").single());
  try {
    await unwrap(await getSupabaseAdmin().from("meal_template_items").insert(input.items.map(item => ({ ...item, template_id: template.id })).filter(item => item.quantity_g !== null || item.serving_count !== null)).select("*"));
  } catch (error) {
    await getSupabaseAdmin().from("meal_templates").delete().eq("id", template.id);
    throw error;
  }
}

export async function updateMealTemplate(templateId: string, input: { name: string; meal_type: string; is_favorite?: boolean; note?: string | null; items: NutritionTemplateItemInput[] }): Promise<void> {
  await unwrap(await getSupabaseAdmin().from("meal_templates").update({ name: input.name, meal_type: input.meal_type, is_favorite: input.is_favorite ?? false, note: input.note ?? null }).eq("id", templateId).select("*"));
  await getSupabaseAdmin().from("meal_template_items").delete().eq("template_id", templateId);
  await unwrap(await getSupabaseAdmin().from("meal_template_items").insert(input.items.map(item => ({ ...item, template_id: templateId })).filter(item => item.quantity_g !== null || item.serving_count !== null)).select("*"));
}

export async function deleteMealTemplate(templateId: string): Promise<void> {
  const result = await getSupabaseAdmin().from("meal_templates").delete().eq("id", templateId);
  if (result.error) throw new Error(result.error.message);
}
