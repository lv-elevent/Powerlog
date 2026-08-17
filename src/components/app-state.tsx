"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { meals as initialMeals, mockToday } from "@/mock/data";
import { addDailyNote, addExpense as persistExpense, addWaterLog, currentRecordDate, getBackendDay, saveBodyMeasurement } from "@/services/backend-service";
import type { BodyMeasurement, Expense, Meal } from "@/types";

interface AppStateValue {
  water: number;
  expenses: Expense[];
  body: BodyMeasurement;
  meals: Meal[];
  notes: string[];
  backendError: string | null;
  addWater: (amount: number) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id" | "time">) => Promise<void>;
  addBody: (body: BodyMeasurement) => Promise<void>;
  addNote: (text: string) => Promise<void>;
  addMeal: (meal: Meal) => void;
}
const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [water, setWater] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [body, setBody] = useState<BodyMeasurement>({ weight: mockToday.weight, time: "07:05" });
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
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
      setBackendError(null);
    } catch (error) {
      setBackendError(error instanceof Error ? error.message : "真实数据暂时不可用");
    }
  }, [date]);

  useEffect(() => { void refreshBackendState(); }, [refreshBackendState]);

  const value = useMemo<AppStateValue>(() => ({
    water, expenses, body, meals, notes, backendError,
    addWater: async amount => { await addWaterLog({ date, amountMl: amount }); await refreshBackendState(); },
    addExpense: async expense => { await persistExpense({ date, amount: expense.amount, categoryName: expense.category, note: expense.note }); await refreshBackendState(); },
    addBody: async next => { await saveBodyMeasurement({ date, weightKg: next.weight, measuredAt: new Date().toISOString() }); await refreshBackendState(); },
    addNote: async text => { await addDailyNote({ date, text }); await refreshBackendState(); },
    addMeal: next => setMeals(current => [...current, next]),
  }), [water, expenses, body, meals, notes, backendError, date, refreshBackendState]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
export function useAppState() { const value = useContext(AppStateContext); if (!value) throw new Error("useAppState must be used inside AppStateProvider"); return value; }
