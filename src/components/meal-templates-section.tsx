"use client";

import { Check, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createMealTemplate, getFoods, getMealTemplates } from "@/services/nutrition-service";
import { Badge, SectionHeader } from "@/components/ui";
import type { FoodLibraryItem, MealTemplateRecord, MealType } from "@/types";

const mealTypes: Array<{ key: MealType; label: string }> = [{ key: "breakfast", label: "早餐" }, { key: "lunch", label: "午餐" }, { key: "dinner", label: "晚餐" }, { key: "snack", label: "加餐" }, { key: "pre_workout", label: "训练前" }, { key: "post_workout", label: "训练后" }];

export function MealTemplatesPanel() {
  const [foods, setFoods] = useState<FoodLibraryItem[]>([]);
  const [templates, setTemplates] = useState<MealTemplateRecord[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [name, setName] = useState("早餐 A");
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => { try { const [nextFoods, nextTemplates] = await Promise.all([getFoods(), getMealTemplates()]); setFoods(nextFoods); setTemplates(nextTemplates); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "模板暂时不可用"); } }, []);
  useEffect(() => { void load(); }, [load]);

  const selectedFoods = foods.filter(food => Object.hasOwn(selected, food.id));
  const visibleFoods = foods.filter(food => food.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  const totals = useMemo(() => selectedFoods.reduce((total, food) => { const factor = (selected[food.id] ?? 0) / 100; return { calories: total.calories + food.caloriesPer100G * factor, protein: total.protein + food.proteinPer100G * factor, carbs: total.carbs + food.carbsPer100G * factor, fat: total.fat + food.fatPer100G * factor, fiber: total.fiber + food.fiberPer100G * factor }; }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }), [selected, selectedFoods]);

  const toggleFood = (food: FoodLibraryItem) => setSelected(current => current[food.id] ? Object.fromEntries(Object.entries(current).filter(([id]) => id !== food.id)) : { ...current, [food.id]: food.servingWeightG ?? 100 });
  const save = async () => { if (!name.trim() || !selectedFoods.length) return; setSaving(true); try { await createMealTemplate({ name: name.trim(), mealType, items: selectedFoods.map(food => ({ foodId: food.id, quantityG: selected[food.id] ?? 100 })) }); setSelected({}); await load(); } catch (reason) { setError(reason instanceof Error ? reason.message : "模板保存失败"); } finally { setSaving(false); } };

  return <>
    {error && <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
    <div className="app-card mt-6 p-5"><SectionHeader title="创建模板" /><div className="grid gap-3 sm:grid-cols-2"><label className="muted">模板名称<input className="field mt-1" value={name} onChange={event => setName(event.target.value)} placeholder="例如：早餐 A" /></label><label className="muted">餐食类型<select className="field mt-1" value={mealType} onChange={event => setMealType(event.target.value as MealType)}>{mealTypes.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label></div><div className="mt-5"><div className="font-semibold">添加食品</div><input className="field mt-2" placeholder="搜索食品" value={search} onChange={event => setSearch(event.target.value)} />{!foods.length ? <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">还没有可添加的食品，请先去食品库添加。</div> : <div className="mt-3 divide-y divide-slate-100">{visibleFoods.map(food => { const active = Object.hasOwn(selected, food.id); return <div key={food.id} className="flex items-center gap-3 py-3"><button aria-label={active ? `移除${food.name}` : `添加${food.name}`} onClick={() => toggleFood(food)} className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-500"}`}><Check size={17} /></button><div className="min-w-0 flex-1"><div className="font-semibold">{food.name}</div><div className="text-xs text-slate-400">{food.servingName ?? `${food.servingWeightG ?? 100}g`} · {food.caloriesPer100G} kcal / 100g</div></div>{active && <div className="flex items-center gap-1"><input aria-label={`${food.name}重量`} className="field w-24 px-2" type="number" min="1" value={selected[food.id]} onChange={event => setSelected(current => ({ ...current, [food.id]: Number(event.target.value) || 1 }))} /><span className="text-sm text-slate-400">g</span></div>}</div>; })}</div>}</div><div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">{selectedFoods.length ? <>预计 {Math.round(totals.calories)} kcal · 蛋白质 {Math.round(totals.protein)}g · 碳水 {Math.round(totals.carbs)}g · 脂肪 {Math.round(totals.fat)}g</> : "请至少添加 1 种食品后查看营养预览。"}</div><button disabled={saving || !name.trim() || !selectedFoods.length} onClick={() => void save()} className="primary-button mt-4 w-full disabled:opacity-50"><Plus size={18} />{saving ? "保存中…" : "保存模板"}</button></div>
    <div className="app-card mt-4 p-5"><SectionHeader title="已有模板" />{!templates.length ? <p className="text-sm text-slate-400">还没有模板。创建后会显示在这里。</p> : <div className="divide-y divide-slate-100">{templates.map(template => <div key={template.id} className="py-4"><div className="flex items-center justify-between gap-3"><div className="font-semibold">{template.name}</div><Badge>{mealTypes.find(item => item.key === template.mealType)?.label ?? "其他"} · {template.items.length} 项</Badge></div><div className="mt-2 text-sm text-slate-500">{template.items.map(item => `${item.food?.name ?? "已停用食品"} ${item.quantityG ?? item.food?.servingWeightG ?? "—"}g`).join(" · ")}</div></div>)}</div>}</div>
  </>;
}
