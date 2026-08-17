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

export interface ExerciseLibraryRow {
  id: string;
  name: string;
  category: string;
  primary_muscle: string | null;
  equipment: string | null;
  default_rest_seconds: number | null;
  is_active: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlanRow {
  id: string;
  name: string;
  version: string;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlanDayRow {
  id: string;
  plan_id: string;
  day_code: string;
  name: string;
  sort_order: number;
  estimated_minutes: number | null;
  is_rest_day: boolean;
  note: string | null;
}

export interface WorkoutPlanExerciseRow {
  id: string;
  plan_day_id: string;
  exercise_id: string;
  sort_order: number;
  target_sets: number;
  rep_min: number | null;
  rep_max: number | null;
  duration_min_seconds: number | null;
  duration_max_seconds: number | null;
  target_rir: number | null;
  rest_seconds: number;
  is_optional: boolean;
  note: string | null;
}

export interface WorkoutSessionRow {
  id: string;
  record_date: string;
  plan_id: string | null;
  plan_day_id: string | null;
  workout_type_snapshot: string;
  workout_name_snapshot: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  feeling_score: number | null;
  note: string | null;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  client_idempotency_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSessionExerciseRow {
  id: string;
  session_id: string;
  exercise_id: string | null;
  exercise_name_snapshot: string;
  sort_order: number;
  target_sets_snapshot: number | null;
  rep_min_snapshot: number | null;
  rep_max_snapshot: number | null;
  target_rir_snapshot: number | null;
  rest_seconds_snapshot: number | null;
  status: "pending" | "in_progress" | "completed" | "skipped";
  note: string | null;
}

export interface WorkoutSetRow {
  id: string;
  session_exercise_id: string;
  set_number: number;
  set_type: "warmup" | "working" | "drop" | "backoff" | "other";
  weight_kg: number | null;
  reps: number | null;
  rir: number | null;
  duration_seconds: number | null;
  completed_at: string | null;
  is_completed: boolean;
  client_idempotency_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSummaryRow {
  session_id: string;
  working_sets: number;
  total_reps: number;
  total_volume_kg: number;
}

export interface WorkoutPlanGraph {
  plan: WorkoutPlanRow;
  days: Array<{ day: WorkoutPlanDayRow; exercises: Array<{ planExercise: WorkoutPlanExerciseRow; exercise: ExerciseLibraryRow }> }>;
}

export interface WorkoutSessionGraph {
  session: WorkoutSessionRow;
  exercises: Array<{ exercise: WorkoutSessionExerciseRow; sets: WorkoutSetRow[] }>;
  summary: WorkoutSummaryRow | null;
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

const WORKOUT_SEED = [
  { dayCode: "push", name: "PUSH", estimatedMinutes: 56, exercises: [["杠铃卧推", 3, 6, 8, 150], ["上斜哑铃卧推", 3, 8, 12, 120], ["双杠臂屈伸", 2, 8, 12, 120], ["器械夹胸", 2, 10, 15, 75], ["哑铃侧平举", 4, 12, 20, 75], ["绳索过头臂屈伸", 3, 10, 15, 75]] },
  { dayCode: "pull", name: "PULL", estimatedMinutes: 52, exercises: [["对握高位下拉", 3, 8, 12, 120], ["单手器械划船", 3, 8, 12, 120], ["坐姿绳索划船", 2, 10, 15, 90], ["反向蝴蝶机飞鸟", 3, 12, 20, 75], ["绳索弯举", 3, 10, 15, 75]] },
  { dayCode: "legs", name: "LEGS", estimatedMinutes: 58, exercises: [["哈克深蹲", 3, 6, 10, 150], ["罗马尼亚硬拉", 3, 8, 10, 120], ["保加利亚分腿蹲", 2, 8, 12, 120], ["腿弯举", 3, 10, 15, 90], ["腿屈伸", 2, 10, 15, 75], ["提踵", 3, 10, 15, 60]] },
  { dayCode: "core", name: "CORE", estimatedMinutes: 35, exercises: [["绳索卷腹", 3, 10, 15, 75], ["悬垂举膝", 3, 8, 15, 75], ["健腹轮", 3, 6, 12, 90], ["Pallof Press", 3, 10, 15, 60], ["侧桥", 2, 30, 45, 60]] },
  { dayCode: "rest", name: "REST", estimatedMinutes: 0, exercises: [] },
] as const;

async function getWorkoutPlanGraph(planId: string): Promise<WorkoutPlanGraph> {
  const plan = unwrap<WorkoutPlanRow>(await getSupabaseAdmin().from("workout_plans").select("*").eq("id", planId).single());
  const days = unwrap(await getSupabaseAdmin().from("workout_plan_days").select("*").eq("plan_id", planId).order("sort_order", { ascending: true })) as WorkoutPlanDayRow[];
  if (!days.length) return { plan, days: [] };
  const planExercises = unwrap(await getSupabaseAdmin().from("workout_plan_exercises").select("*").in("plan_day_id", days.map(day => day.id)).order("sort_order", { ascending: true })) as WorkoutPlanExerciseRow[];
  const exercises = planExercises.length ? (unwrap(await getSupabaseAdmin().from("exercise_library").select("*").in("id", planExercises.map(item => item.exercise_id))) as ExerciseLibraryRow[]) : [];
  return { plan, days: days.map(day => ({ day, exercises: planExercises.filter(item => item.plan_day_id === day.id).map(planExercise => ({ planExercise, exercise: exercises.find(item => item.id === planExercise.exercise_id) })).filter((item): item is { planExercise: WorkoutPlanExerciseRow; exercise: ExerciseLibraryRow } => Boolean(item.exercise)) })) };
}

export async function ensureWorkoutSeed(): Promise<WorkoutPlanGraph> {
  const existing = await getSupabaseAdmin().from("workout_plans").select("*").eq("name", "PPL + Core V1").eq("version", "V1").maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  const plan = existing.data as WorkoutPlanRow | null;
  const currentPlan = plan ?? unwrap<WorkoutPlanRow>(await getSupabaseAdmin().from("workout_plans").insert({ name: "PPL + Core V1", version: "V1", description: "Push · Pull · Legs · Core · Rest" }).select("*").single());
  for (const [dayIndex, daySeed] of WORKOUT_SEED.entries()) {
    const day = unwrap<WorkoutPlanDayRow>(await getSupabaseAdmin().from("workout_plan_days").upsert({ plan_id: currentPlan.id, day_code: daySeed.dayCode, name: daySeed.name, sort_order: dayIndex, estimated_minutes: daySeed.estimatedMinutes, is_rest_day: daySeed.dayCode === "rest" }, { onConflict: "plan_id,day_code" }).select("*").single());
    const exerciseNames = daySeed.exercises.map(item => item[0]);
    if (!exerciseNames.length) continue;
    const exerciseRows = unwrap(await getSupabaseAdmin().from("exercise_library").upsert(exerciseNames.map(name => ({ name, category: "strength", primary_muscle: daySeed.dayCode, default_rest_seconds: daySeed.exercises.find(item => item[0] === name)?.[4] ?? 90 })), { onConflict: "name" }).select("*")) as ExerciseLibraryRow[];
    for (const [sortOrder, seed] of daySeed.exercises.entries()) {
      const exercise = exerciseRows.find(row => row.name === seed[0]);
      if (!exercise) continue;
      await unwrap(await getSupabaseAdmin().from("workout_plan_exercises").upsert({ plan_day_id: day.id, exercise_id: exercise.id, sort_order: sortOrder, target_sets: seed[1], rep_min: seed[2], rep_max: seed[3], target_rir: 2, rest_seconds: seed[4], is_optional: false }, { onConflict: "plan_day_id,sort_order" }).select("*").single());
    }
  }
  return getWorkoutPlanGraph(currentPlan.id);
}

export async function listWorkoutPlans(): Promise<WorkoutPlanGraph[]> {
  const seeded = await ensureWorkoutSeed();
  return [seeded];
}

export async function createWorkoutSession(input: { record_date: string; plan_id: string; plan_day_id: string; client_idempotency_key: string }): Promise<WorkoutSessionGraph> {
  await ensureDailyLog(input.record_date);
  const graph = await getWorkoutPlanGraph(input.plan_id);
  const day = graph.days.find(item => item.day.id === input.plan_day_id);
  if (!day) throw new Error("Workout plan day not found");
  const session = unwrap<WorkoutSessionRow>(await getSupabaseAdmin().from("workout_sessions").insert({ record_date: input.record_date, plan_id: graph.plan.id, plan_day_id: day.day.id, workout_type_snapshot: day.day.day_code, workout_name_snapshot: day.day.name, started_at: new Date().toISOString(), status: "in_progress", client_idempotency_key: input.client_idempotency_key }).select("*").single());
  try {
    await unwrap(await getSupabaseAdmin().from("workout_session_exercises").insert(day.exercises.map(({ planExercise, exercise }, index) => ({ session_id: session.id, exercise_id: exercise.id, exercise_name_snapshot: exercise.name, sort_order: index, target_sets_snapshot: planExercise.target_sets, rep_min_snapshot: planExercise.rep_min, rep_max_snapshot: planExercise.rep_max, target_rir_snapshot: planExercise.target_rir, rest_seconds_snapshot: planExercise.rest_seconds, status: "pending" }))).select("*"));
  } catch (error) {
    await getSupabaseAdmin().from("workout_sessions").delete().eq("id", session.id);
    throw error;
  }
  return getWorkoutSession(session.id);
}

export async function getWorkoutSession(sessionId: string): Promise<WorkoutSessionGraph> {
  const session = unwrap<WorkoutSessionRow>(await getSupabaseAdmin().from("workout_sessions").select("*").eq("id", sessionId).single());
  const exercises = unwrap(await getSupabaseAdmin().from("workout_session_exercises").select("*").eq("session_id", sessionId).order("sort_order", { ascending: true })) as WorkoutSessionExerciseRow[];
  const sets = exercises.length ? (unwrap(await getSupabaseAdmin().from("workout_sets").select("*").in("session_exercise_id", exercises.map(item => item.id)).order("set_number", { ascending: true })) as WorkoutSetRow[]) : [];
  const summaryResult = await getSupabaseAdmin().from("v_workout_session_summary").select("*").eq("session_id", sessionId).maybeSingle();
  if (summaryResult.error) throw new Error(summaryResult.error.message);
  return { session, exercises: exercises.map(exercise => ({ exercise, sets: sets.filter(set => set.session_exercise_id === exercise.id) })), summary: summaryResult.data as WorkoutSummaryRow | null };
}

export async function listWorkoutSessions(recordDate: string): Promise<WorkoutSessionGraph[]> {
  const sessions = unwrap(await getSupabaseAdmin().from("workout_sessions").select("*").eq("record_date", recordDate).order("started_at", { ascending: true })) as WorkoutSessionRow[];
  return Promise.all(sessions.map(session => getWorkoutSession(session.id)));
}

export async function upsertWorkoutSet(sessionId: string, input: { session_exercise_id: string; set_number: number; set_type: WorkoutSetRow["set_type"]; weight_kg?: number | null; reps?: number | null; rir?: number | null; duration_seconds?: number | null; is_completed: boolean; client_idempotency_key: string }): Promise<WorkoutSetRow> {
  const sessionExercise = unwrap<WorkoutSessionExerciseRow>(await getSupabaseAdmin().from("workout_session_exercises").select("*").eq("id", input.session_exercise_id).eq("session_id", sessionId).single());
  const set = unwrap<WorkoutSetRow>(await getSupabaseAdmin().from("workout_sets").upsert({ ...input, completed_at: input.is_completed ? new Date().toISOString() : null }, { onConflict: "session_exercise_id,set_number,set_type" }).select("*").single());
  const completed = await getSupabaseAdmin().from("workout_sets").select("id", { count: "exact", head: true }).eq("session_exercise_id", sessionExercise.id).eq("is_completed", true);
  if (completed.error) throw new Error(completed.error.message);
  const status = sessionExercise.target_sets_snapshot && Number(completed.count ?? 0) >= sessionExercise.target_sets_snapshot ? "completed" : "in_progress";
  await getSupabaseAdmin().from("workout_session_exercises").update({ status }).eq("id", sessionExercise.id);
  return set;
}

export async function finishWorkoutSession(sessionId: string, input: { feeling_score?: number | null; note?: string | null; duration_minutes?: number | null }): Promise<WorkoutSessionGraph> {
  const current = await getWorkoutSession(sessionId);
  const duration = input.duration_minutes ?? Math.max(0, Math.round((Date.now() - new Date(current.session.started_at).getTime()) / 60_000));
  await unwrap(await getSupabaseAdmin().from("workout_sessions").update({ status: "completed", ended_at: new Date().toISOString(), duration_minutes: duration, feeling_score: input.feeling_score ?? null, note: input.note ?? null }).eq("id", sessionId).select("*"));
  return getWorkoutSession(sessionId);
}

export async function getLastWorkoutSet(exerciseId: string, excludeSessionId?: string): Promise<{ date: string; set: WorkoutSetRow } | null> {
  let query = getSupabaseAdmin().from("workout_sessions").select("id,record_date,started_at").eq("status", "completed").order("started_at", { ascending: false }).limit(20);
  if (excludeSessionId) query = query.neq("id", excludeSessionId);
  const sessions = unwrap(await query) as Array<{ id: string; record_date: string; started_at: string }>;
  for (const session of sessions) {
    const exercises = unwrap(await getSupabaseAdmin().from("workout_session_exercises").select("id").eq("session_id", session.id).eq("exercise_id", exerciseId)) as Array<{ id: string }>;
    if (!exercises.length) continue;
    const sets = unwrap(await getSupabaseAdmin().from("workout_sets").select("*").in("session_exercise_id", exercises.map(item => item.id)).eq("is_completed", true).eq("set_type", "working").order("set_number", { ascending: false }).limit(1)) as WorkoutSetRow[];
    if (sets[0]) return { date: session.record_date, set: sets[0] };
  }
  return null;
}
