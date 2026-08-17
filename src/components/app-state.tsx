"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { meals as initialMeals, mockToday } from "@/mock/data";
import type { BodyMeasurement, Expense, Meal, WaterLog } from "@/types";

interface AppStateValue {
  water: number;
  expenses: Expense[];
  body: BodyMeasurement;
  meals: Meal[];
  addWater: (amount: number) => void;
  addExpense: (expense: Omit<Expense, "id" | "time">) => void;
  addBody: (body: BodyMeasurement) => void;
  addMeal: (meal: Meal) => void;
}
const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [water, setWater] = useState(mockToday.water);
  const [expenses, setExpenses] = useState<Expense[]>([{ id: "expense-1", amount: 46, category: "餐饮", note: "午餐", time: "12:45" }]);
  const [body, setBody] = useState<BodyMeasurement>({ weight: mockToday.weight, time: "07:05" });
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  useEffect(() => { const saved = window.localStorage.getItem("daily-os-demo"); if (!saved) return; try { const parsed = JSON.parse(saved) as Partial<AppStateValue>; if (typeof parsed.water === "number") setWater(parsed.water); if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses); if (parsed.body) setBody(parsed.body); if (Array.isArray(parsed.meals)) setMeals(parsed.meals); } catch { /* ignore malformed demo state */ } }, []);
  useEffect(() => { window.localStorage.setItem("daily-os-demo", JSON.stringify({ water, expenses, body, meals })); }, [water, expenses, body, meals]);
  const value = useMemo<AppStateValue>(() => ({ water, expenses, body, meals, addWater: amount => setWater(current => current + amount), addExpense: expense => setExpenses(current => [...current, { ...expense, id: crypto.randomUUID(), time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) }]), addBody: next => setBody(next), addMeal: next => setMeals(current => [...current, next]) }), [water, expenses, body, meals]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
export function useAppState() { const value = useContext(AppStateContext); if (!value) throw new Error("useAppState must be used inside AppStateProvider"); return value; }
