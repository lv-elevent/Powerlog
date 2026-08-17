import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { InsightCategory, InsightRange, InsightSeriesPoint, InsightsPayload } from "@/types/insights";

interface RangeBounds { from: string; to: string; }
interface BodyRow { record_date: string; weight_kg: unknown; waist_cm: unknown; body_fat_pct: unknown; }
interface NutritionRow { record_date: string; calories_kcal: unknown; protein_g: unknown; carbs_g: unknown; fat_g: unknown; fiber_g: unknown; }
interface GoalRow { effective_from: string; effective_to: string | null; calories_kcal: unknown; protein_g: unknown; carbs_g: unknown; fat_g: unknown; fiber_g: unknown; }
interface WaterRow { record_date: string; water_ml: unknown; }
interface SleepRow { record_date: string; duration_minutes: unknown; quality_score: unknown; sleep_at: string | null; wake_at: string | null; }
interface WorkRow { record_date: string; duration_minutes: unknown; start_at: string | null; end_at: string | null; }
interface CardioRow { record_date: string; duration_minutes: unknown; }
interface WorkoutRow { id: string; record_date: string; workout_type_snapshot: string; duration_minutes: unknown; }
interface WorkoutSummaryRow { session_id: string; working_sets: unknown; total_volume_kg: unknown; }
interface SessionExerciseRow { id: string; session_id: string; exercise_id: string | null; exercise_name_snapshot: string; }
interface WorkoutSetRow { session_exercise_id: string; weight_kg: unknown; reps: unknown; }
interface DailyExpenseRow { record_date: string; total_expense: unknown; }
interface ExpenseRow { category_id: string | null; amount: unknown; }
interface CategoryRow { id: string; name: string; }

function unwrap<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

function numeric(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sum(values: Array<number | null>): number {
  return values.reduce<number>((total, value) => total + (value ?? 0), 0);
}

function average(values: Array<number | null>): number | null {
  const present = values.filter((value): value is number => value !== null && Number.isFinite(value));
  return present.length ? sum(present) / present.length : null;
}

function round(value: number | null, digits = 1): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function dateAtUtc(date: string): Date { return new Date(`${date}T00:00:00.000Z`); }
function dateKey(date: Date): string { return date.toISOString().slice(0, 10); }
function shiftDays(date: string, amount: number): string { const value = dateAtUtc(date); value.setUTCDate(value.getUTCDate() + amount); return dateKey(value); }
function shiftMonths(date: string, amount: number): string { const value = dateAtUtc(date); value.setUTCMonth(value.getUTCMonth() + amount); return dateKey(value); }
function todayInShanghai(): string { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date()); }

export function getInsightRangeBounds(range: InsightRange, endDate = todayInShanghai()): RangeBounds {
  const from = range === "7d" ? shiftDays(endDate, -6) : range === "30d" ? shiftDays(endDate, -29) : range === "3m" ? shiftMonths(endDate, -3) : shiftMonths(endDate, -12);
  return { from, to: endDate };
}

function label(date: string): string { return `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`; }
function point(date: string, value: number | null): InsightSeriesPoint { return { date, label: label(date), value: round(value) }; }

function exactCents(value: unknown): number {
  const text = String(value ?? "0");
  const [whole = "0", fraction = ""] = text.split(".");
  const sign = whole.startsWith("-") ? -1 : 1;
  const absoluteWhole = whole.replace("-", "");
  const fractionCents = Number(`${fraction.slice(0, 2).padEnd(2, "0")}`) || 0;
  return sign * ((Number(absoluteWhole) || 0) * 100 + fractionCents);
}

function centsToAmount(cents: number): number { return cents / 100; }

async function getBodyInsights(bounds: RangeBounds) {
  const queryFrom = shiftDays(bounds.to, -6) < bounds.from ? shiftDays(bounds.to, -6) : bounds.from;
  const [trendResult, latestResult] = await Promise.all([
    getSupabaseAdmin().from("body_measurements").select("record_date,weight_kg,waist_cm,body_fat_pct").gte("record_date", queryFrom).lte("record_date", bounds.to).order("record_date", { ascending: true }),
    getSupabaseAdmin().from("body_measurements").select("record_date,weight_kg,waist_cm,body_fat_pct").lte("record_date", bounds.to).not("weight_kg", "is", "null").order("record_date", { ascending: false }).limit(1),
  ]);
  const rows = unwrap(trendResult) as BodyRow[];
  const latest = (unwrap(latestResult) as BodyRow[])[0] ?? null;
  const periodRows = rows.filter(row => row.record_date >= bounds.from);
  const weightRows = periodRows.filter(row => numeric(row.weight_kg) !== null);
  const average7dRows = rows.filter(row => row.record_date >= shiftDays(bounds.to, -6));
  const average7d = average(average7dRows.map(row => numeric(row.weight_kg)));
  const firstWeight = numeric(weightRows[0]?.weight_kg);
  const lastWeight = numeric(weightRows.at(-1)?.weight_kg);
  const latestWithWaist = [...periodRows].reverse().find(row => numeric(row.waist_cm) !== null) ?? null;
  return {
    currentWeightKg: numeric(latest?.weight_kg),
    averageWeight7dKg: round(average7d),
    periodChangeKg: firstWeight !== null && lastWeight !== null && weightRows.length > 1 ? round(lastWeight - firstWeight) : null,
    latestWaistCm: numeric(latestWithWaist?.waist_cm),
    latestBodyFatPct: numeric(latest?.body_fat_pct),
    weightTrend: periodRows.map(row => point(row.record_date, numeric(row.weight_kg))),
    waistTrend: periodRows.map(row => point(row.record_date, numeric(row.waist_cm))),
  };
}

function goalForDate(date: string, goals: GoalRow[]): GoalRow | null {
  return goals.filter(goal => goal.effective_from <= date && (!goal.effective_to || goal.effective_to >= date)).sort((a, b) => b.effective_from.localeCompare(a.effective_from))[0] ?? null;
}

async function getNutritionInsights(bounds: RangeBounds) {
  const [nutritionResult, waterResult, goalsResult] = await Promise.all([
    getSupabaseAdmin().from("v_daily_nutrition").select("record_date,calories_kcal,protein_g,carbs_g,fat_g,fiber_g").gte("record_date", bounds.from).lte("record_date", bounds.to).order("record_date", { ascending: true }),
    getSupabaseAdmin().from("v_daily_water").select("record_date,water_ml").gte("record_date", bounds.from).lte("record_date", bounds.to).order("record_date", { ascending: true }),
    getSupabaseAdmin().from("nutrition_goals").select("effective_from,effective_to,calories_kcal,protein_g,carbs_g,fat_g,fiber_g").lte("effective_from", bounds.to).or(`effective_to.is.null,effective_to.gte.${bounds.from}`).order("effective_from", { ascending: true }),
  ]);
  const rows = unwrap(nutritionResult) as NutritionRow[];
  const waterRows = unwrap(waterResult) as WaterRow[];
  const goals = unwrap(goalsResult) as GoalRow[];
  const metrics = ["calories_kcal", "protein_g", "carbs_g", "fat_g", "fiber_g"] as const;
  const averages = Object.fromEntries(metrics.map(metric => [metric.replace("_kcal", "").replace("_g", ""), round(average(rows.map(row => numeric(row[metric]))))])) as Record<string, number | null>;
  const goalValues = Object.fromEntries(metrics.map(metric => [metric.replace("_kcal", "").replace("_g", ""), round(average(rows.map(row => numeric(goalForDate(row.record_date, goals)?.[metric]))))])) as Record<string, number | null>;
  const rates = Object.fromEntries(metrics.map(metric => {
    const ratios = rows.map(row => { const actual = numeric(row[metric]); const target = numeric(goalForDate(row.record_date, goals)?.[metric]); return actual !== null && target !== null && target > 0 ? (actual / target) * 100 : null; });
    return [metric.replace("_kcal", "").replace("_g", ""), round(average(ratios))];
  })) as Record<string, number | null>;
  return {
    averages: { calories: averages.calories ?? null, protein: averages.protein ?? null, carbs: averages.carbs ?? null, fat: averages.fat ?? null, fiber: averages.fiber ?? null },
    goals: { calories: goalValues.calories ?? null, protein: goalValues.protein ?? null, carbs: goalValues.carbs ?? null, fat: goalValues.fat ?? null, fiber: goalValues.fiber ?? null },
    achievementRates: { calories: rates.calories ?? null, protein: rates.protein ?? null, carbs: rates.carbs ?? null, fat: rates.fat ?? null, fiber: rates.fiber ?? null },
    averageWaterMl: round(average(waterRows.map(row => numeric(row.water_ml))), 0),
    calorieTrend: rows.map(row => point(row.record_date, numeric(row.calories_kcal))),
  };
}

async function getTrainingInsights(bounds: RangeBounds) {
  const sessions = unwrap(await getSupabaseAdmin().from("workout_sessions").select("id,record_date,workout_type_snapshot,duration_minutes").eq("status", "completed").gte("record_date", bounds.from).lte("record_date", bounds.to).order("record_date", { ascending: true })) as WorkoutRow[];
  if (!sessions.length) return { sessionsCount: 0, totalDurationMinutes: 0, workingSets: 0, totalVolumeKg: 0, splitCounts: { push: 0, pull: 0, legs: 0, core: 0 }, exerciseTrends: [] };
  const sessionIds = sessions.map(session => session.id);
  const [summaryResult, exercisesResult] = await Promise.all([
    getSupabaseAdmin().from("v_workout_session_summary").select("session_id,working_sets,total_volume_kg").in("session_id", sessionIds),
    getSupabaseAdmin().from("workout_session_exercises").select("id,session_id,exercise_id,exercise_name_snapshot").in("session_id", sessionIds),
  ]);
  const summaries = unwrap(summaryResult) as WorkoutSummaryRow[];
  const exercises = unwrap(exercisesResult) as SessionExerciseRow[];
  const sets = exercises.length ? unwrap(await getSupabaseAdmin().from("workout_sets").select("session_exercise_id,weight_kg,reps").in("session_exercise_id", exercises.map(exercise => exercise.id)).eq("is_completed", true).eq("set_type", "working")) as WorkoutSetRow[] : [];
  const summaryById = new Map(summaries.map(summary => [summary.session_id, summary]));
  const sessionById = new Map(sessions.map(session => [session.id, session]));
  const splitCounts = { push: 0, pull: 0, legs: 0, core: 0 };
  sessions.forEach(session => { const type = session.workout_type_snapshot.toLowerCase(); if (type in splitCounts) splitCounts[type as keyof typeof splitCounts] += 1; });
  const trendMap = new Map<string, { exerciseId: string | null; name: string; byDate: Map<string, number> }>();
  exercises.forEach(exercise => {
    const key = exercise.exercise_id ?? exercise.exercise_name_snapshot;
    if (!trendMap.has(key)) trendMap.set(key, { exerciseId: exercise.exercise_id, name: exercise.exercise_name_snapshot, byDate: new Map() });
    const trend = trendMap.get(key);
    if (!trend) return;
    sets.filter(set => set.session_exercise_id === exercise.id).forEach(set => {
      const session = sessionById.get(exercise.session_id);
      const weight = numeric(set.weight_kg);
      if (!session || weight === null) return;
      trend.byDate.set(session.record_date, Math.max(trend.byDate.get(session.record_date) ?? 0, weight));
    });
  });
  return {
    sessionsCount: sessions.length,
    totalDurationMinutes: Math.round(sum(sessions.map(session => numeric(session.duration_minutes)))),
    workingSets: Math.round(sum(summaries.map(summary => numeric(summary.working_sets)))),
    totalVolumeKg: round(sum(summaries.map(summary => numeric(summary.total_volume_kg))), 1) ?? 0,
    splitCounts,
    exerciseTrends: [...trendMap.values()].map(trend => ({ exerciseId: trend.exerciseId, name: trend.name, points: [...trend.byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => point(date, value)) })).filter(trend => trend.points.length > 0),
  };
}

function workDuration(row: WorkRow): number | null {
  const stored = numeric(row.duration_minutes);
  if (stored !== null) return stored;
  if (row.start_at && row.end_at) return Math.max(0, (new Date(row.end_at).getTime() - new Date(row.start_at).getTime()) / 60_000);
  return null;
}

function sleepDuration(row: SleepRow): number | null {
  const stored = numeric(row.duration_minutes);
  if (stored !== null) return stored;
  if (row.sleep_at && row.wake_at) return Math.max(0, (new Date(row.wake_at).getTime() - new Date(row.sleep_at).getTime()) / 60_000);
  return null;
}

async function getLifeInsights(bounds: RangeBounds) {
  const [sleepResult, waterResult, workResult, cardioResult] = await Promise.all([
    getSupabaseAdmin().from("sleep_logs").select("record_date,duration_minutes,quality_score,sleep_at,wake_at").gte("record_date", bounds.from).lte("record_date", bounds.to),
    getSupabaseAdmin().from("v_daily_water").select("record_date,water_ml").gte("record_date", bounds.from).lte("record_date", bounds.to),
    getSupabaseAdmin().from("work_sessions").select("record_date,duration_minutes,start_at,end_at").gte("record_date", bounds.from).lte("record_date", bounds.to),
    getSupabaseAdmin().from("cardio_sessions").select("record_date,duration_minutes").gte("record_date", bounds.from).lte("record_date", bounds.to),
  ]);
  const sleep = unwrap(sleepResult) as SleepRow[];
  const water = unwrap(waterResult) as WaterRow[];
  const work = unwrap(workResult) as WorkRow[];
  const cardio = unwrap(cardioResult) as CardioRow[];
  const workMinutes = sum(work.map(workDuration));
  return {
    averageSleepMinutes: round(average(sleep.map(sleepDuration))),
    averageSleepQuality: round(average(sleep.map(row => numeric(row.quality_score))), 1),
    averageWaterMl: round(average(water.map(row => numeric(row.water_ml))), 0),
    totalWorkMinutes: Math.round(workMinutes),
    averageWorkMinutes: round(average(work.map(workDuration))),
    totalCardioMinutes: Math.round(sum(cardio.map(row => numeric(row.duration_minutes)))),
  };
}

async function getFinanceInsights(bounds: RangeBounds) {
  const [dailyResult, expenseResult, categoryResult] = await Promise.all([
    getSupabaseAdmin().from("v_daily_expenses").select("record_date,total_expense").gte("record_date", bounds.from).lte("record_date", bounds.to).order("record_date", { ascending: true }),
    getSupabaseAdmin().from("expenses").select("category_id,amount").gte("record_date", bounds.from).lte("record_date", bounds.to),
    getSupabaseAdmin().from("expense_categories").select("id,name"),
  ]);
  const daily = unwrap(dailyResult) as DailyExpenseRow[];
  const expenses = unwrap(expenseResult) as ExpenseRow[];
  const categories = unwrap(categoryResult) as CategoryRow[];
  const dailyCents = daily.map(row => exactCents(row.total_expense));
  const totalCents = dailyCents.reduce((total, cents) => total + cents, 0);
  const categoryCents = new Map<string | null, number>();
  expenses.forEach(expense => categoryCents.set(expense.category_id, (categoryCents.get(expense.category_id) ?? 0) + exactCents(expense.amount)));
  const categoryName = new Map(categories.map(category => [category.id, category.name]));
  const categorySummaries = [...categoryCents.entries()].map(([categoryId, cents]) => ({ categoryId, label: categoryId ? categoryName.get(categoryId) ?? "未分类" : "未分类", amount: centsToAmount(cents), percent: totalCents > 0 ? Math.round((cents / totalCents) * 1000) / 10 : 0 })).sort((a, b) => b.amount - a.amount);
  return {
    totalAmount: centsToAmount(totalCents),
    averageDailyAmount: dailyCents.length ? centsToAmount(Math.round(totalCents / dailyCents.length)) : null,
    dailyTrend: daily.map(row => point(row.record_date, centsToAmount(exactCents(row.total_expense)))),
    categories: categorySummaries,
  };
}

export async function getInsights(range: InsightRange, category: InsightCategory): Promise<InsightsPayload> {
  const bounds = getInsightRangeBounds(range);
  const base: InsightsPayload = { range, category, ...bounds };
  if (category === "body") return { ...base, body: await getBodyInsights(bounds) };
  if (category === "nutrition") return { ...base, nutrition: await getNutritionInsights(bounds) };
  if (category === "training") return { ...base, training: await getTrainingInsights(bounds) };
  if (category === "life") return { ...base, life: await getLifeInsights(bounds) };
  return { ...base, finance: await getFinanceInsights(bounds) };
}
