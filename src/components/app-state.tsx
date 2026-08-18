"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { mockToday } from "@/mock/data";
import { addDailyNote, addExpense as persistExpense, addWaterLog, currentRecordDate, getBackendDay, saveBodyMeasurement } from "@/services/backend-service";
import { mapGoal, mapMeal, mapMealToUi } from "@/services/nutrition-service";
import type { BodyMeasurement, Expense, Meal, NutritionGoal } from "@/types";

interface AppStateValue {
  recordDate: string;
  water: number;
  expenses: Expense[];
  body: BodyMeasurement;
  meals: Meal[];
  nutritionGoal: NutritionGoal;
  workout: { count: number; minutes: number };
  notes: string[];
  backendError: string | null;
  reload: () => Promise<void>;
  addWater: (amount: number) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id" | "time">) => Promise<void>;
  addBody: (body: BodyMeasurement) => Promise<void>;
  addNote: (text: string) => Promise<void>;
}
const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [water, setWater] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [body, setBody] = useState<BodyMeasurement>({ weight: mockToday.weight, time: "07:05" });
  const [meals, setMeals] = useState<Meal[]>([]);
  const [nutritionGoal, setNutritionGoal] = useState<NutritionGoal>(mockToday.goal);
  const [workout, setWorkout] = useState({ count: 0, minutes: 0 });
  const [notes, setNotes] = useState<string[]>([]);
  const [backendError, setBackendError] = useState<string | null>(null);
  const date = currentRecordDate();

  const refreshBackendState = useCallback(async () => {
    try {
      const data = await getBackendDay(date);
      setWater(data.water.totalMl);
      setExpenses(data.expenses.logs.map(item => ({ id: item.id, amount: Number(item.amount), category: item.category_name ?? "其他", note: item.note ?? "", time: new Date(item.spent_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) })));
      if (data.body) setBody({ weight: Number(data.body.weight_kg ?? 0), time: data.body.measured_at ? new Date(data.body.measured_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : "" });
      setNotes(data.notes.map(item => item.text));
      setMeals(data.nutrition.meals.map(mapMeal).map(mapMealToUi));
      setWorkout({ count: data.workouts.length, minutes: data.workouts.reduce((sum, item) => sum + Number(item.session.duration_minutes ?? 0), 0) });
      const goal = mapGoal(data.nutritionGoal);
      if (goal) setNutritionGoal({ calories: goal.calories, protein: goal.protein, carbs: goal.carbs, fat: goal.fat, fiber: goal.fiber, water: goal.water });
      setBackendError(null);
    } catch (error) {
      setBackendError(error instanceof Error ? error.message : "真实数据暂时不可用");
    }
  }, [date]);

  useEffect(() => { void refreshBackendState(); }, [refreshBackendState]);

  const value = useMemo<AppStateValue>(() => ({
    recordDate: date, water, expenses, body, meals, nutritionGoal, workout, notes, backendError, reload: refreshBackendState,
    addWater: async amount => { const result = await addWaterLog({ date, amountMl: amount }); if (!result) { setWater(current => current + amount); return; } await refreshBackendState(); },
    addExpense: async expense => { const result = await persistExpense({ date, amount: expense.amount, categoryName: expense.category, note: expense.note }); if (!result) { setExpenses(current => [...current, { ...expense, id: `offline-${crypto.randomUUID()}`, time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) }]); return; } await refreshBackendState(); },
    addBody: async next => { const result = await saveBodyMeasurement({ date, weightKg: next.weight, measuredAt: new Date().toISOString() }); if (!result) { setBody(next); return; } await refreshBackendState(); },
    addNote: async text => { const result = await addDailyNote({ date, text }); if (!result) { setNotes(current => [...current, text]); return; } await refreshBackendState(); },
  }), [water, expenses, body, meals, nutritionGoal, workout, notes, backendError, date, refreshBackendState]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
export function useAppState() { const value = useContext(AppStateContext); if (!value) throw new Error("useAppState must be used inside AppStateProvider"); return value; }
