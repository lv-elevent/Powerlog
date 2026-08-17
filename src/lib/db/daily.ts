import { getBodyMeasurement, getDailyLog, listDailyNotes, listExpenseCategories, listExpenses, listWaterLogs } from "@/lib/db/repositories";

export async function getDay(recordDate: string) {
  const [daily, body, waterLogs, expenses, notes, categories] = await Promise.all([
    getDailyLog(recordDate),
    getBodyMeasurement(recordDate),
    listWaterLogs(recordDate),
    listExpenses(recordDate),
    listDailyNotes(recordDate),
    listExpenseCategories(),
  ]);
  const categoryById = new Map(categories.map(category => [category.id, category.name]));
  return {
    date: recordDate,
    daily,
    body,
    water: { totalMl: waterLogs.reduce((sum, item) => sum + Number(item.amount_ml), 0), logs: waterLogs },
    expenses: { total: expenses.reduce((sum, item) => sum + Number(item.amount), 0), logs: expenses.map(item => ({ ...item, category_name: item.category_id ? categoryById.get(item.category_id) ?? null : null })) },
    notes,
  };
}
