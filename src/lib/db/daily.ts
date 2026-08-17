import { getBodyMeasurement, getDailyLog, getDailyNutrition, getNutritionGoal, getDailyReview, getSleepLog, listCardioSessions, listDailyNotes, listExpenseCategories, listExpenses, listMeals, listWorkSessions, listWaterLogs, listWorkoutSessions } from "@/lib/db/repositories";

export async function getDay(recordDate: string) {
  const [daily, body, waterLogs, expenses, notes, categories, nutritionTotals, meals, nutritionGoal, workouts, sleep, cardio, work, review] = await Promise.all([
    getDailyLog(recordDate),
    getBodyMeasurement(recordDate),
    listWaterLogs(recordDate),
    listExpenses(recordDate),
    listDailyNotes(recordDate),
    listExpenseCategories(),
    getDailyNutrition(recordDate),
    listMeals(recordDate),
    getNutritionGoal(recordDate),
    listWorkoutSessions(recordDate),
    getSleepLog(recordDate),
    listCardioSessions(recordDate),
    listWorkSessions(recordDate),
    getDailyReview(recordDate),
  ]);
  const categoryById = new Map(categories.map(category => [category.id, category.name]));
  return {
    date: recordDate,
    daily,
    body,
    water: { totalMl: waterLogs.reduce((sum, item) => sum + Number(item.amount_ml), 0), logs: waterLogs },
    expenses: { total: expenses.reduce((sum, item) => sum + Number(item.amount), 0), logs: expenses.map(item => ({ ...item, category_name: item.category_id ? categoryById.get(item.category_id) ?? null : null })) },
    notes,
    nutrition: { totals: nutritionTotals, meals },
    nutritionGoal,
    workouts,
    sleep,
    cardio,
    work,
    review,
  };
}
