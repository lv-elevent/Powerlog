"use client";

import { Heart, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createFood, deactivateFood, getFoods, updateFood } from "@/services/nutrition-service";
import { Badge, SectionHeader } from "@/components/ui";
import type { FoodLibraryItem, FoodWeightBasis } from "@/types";

const basisOptions: Array<{ value: FoodWeightBasis; label: string }> = [
  { value: "cooked", label: "熟重" },
  { value: "raw", label: "生重" },
  { value: "edible_cooked", label: "可食熟重" },
  { value: "packaged", label: "包装标示" },
  { value: "serving", label: "按份记录" },
  { value: "other", label: "其他" },
];

export function FoodLibraryPanel({ onCreated }: { onCreated?: () => void }) {
  const [foods, setFoods] = useState<FoodLibraryItem[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [servingName, setServingName] = useState("1 份");
  const [servingWeightG, setServingWeightG] = useState("");
  const [weightBasis, setWeightBasis] = useState<FoodWeightBasis>("cooked");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [fiber, setFiber] = useState("");

  const load = useCallback(async () => {
    try {
      setFoods(await getFoods(search, true));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "食品库暂时不可用");
    }
  }, [search]);

  useEffect(() => { void load(); }, [load]);

  const reset = () => {
    setName(""); setBrand(""); setServingName("1 份"); setServingWeightG("");
    setCalories(""); setProtein(""); setCarbs(""); setFat(""); setFiber("");
  };

  const save = async () => {
    if (!name.trim()) {
      setError("请填写食品名称。");
      return;
    }
    const numberOrZero = (value: string) => value.trim() === "" ? 0 : Number(value);
    setSaving(true);
    try {
      await createFood({ name: name.trim(), brand: brand.trim() || null, servingName: servingName.trim() || null, servingWeightG: servingWeightG.trim() === "" ? null : Number(servingWeightG), weightBasis, caloriesPer100G: numberOrZero(calories), proteinPer100G: numberOrZero(protein), carbsPer100G: numberOrZero(carbs), fatPer100G: numberOrZero(fat), fiberPer100G: numberOrZero(fiber) });
      reset();
      await load();
      onCreated?.();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "食品保存失败");
    } finally {
      setSaving(false);
    }
  };

  const toggleFavorite = async (food: FoodLibraryItem) => { await updateFood(food.id, { isFavorite: !food.isFavorite }); await load(); };
  const deactivate = async (food: FoodLibraryItem) => { await deactivateFood(food.id); await load(); };

  return <>
    {error && <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
    <div className="app-card mt-6 p-5">
      <SectionHeader title="新增食品" />
      <p className="mb-4 text-sm leading-6 text-slate-500">营养数据统一按照 100g 记录；营养字段留空按 0 保存，常用份量只用于快速填写。</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="食品名称" value={name} onChange={setName} placeholder="例如：鸡胸肉" />
        <Field label="品牌（可选）" value={brand} onChange={setBrand} placeholder="例如：自制" />
        <label className="muted">称重基准<select className="field mt-1" value={weightBasis} onChange={event => setWeightBasis(event.target.value as FoodWeightBasis)}>{basisOptions.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <Field label="常用份量名称" value={servingName} onChange={setServingName} placeholder="例如：1 勺、1 个、1 盒" />
        <NumberField label="常用份量重量" unit="g" value={servingWeightG} onChange={setServingWeightG} placeholder="例如：30" />
      </div>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4"><div className="font-semibold">每 100g 营养数据</div><div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3"><NumberField label="热量" unit="kcal / 100g" value={calories} onChange={setCalories} placeholder="例如：133" /><NumberField label="蛋白质" unit="g / 100g" value={protein} onChange={setProtein} placeholder="例如：24.6" /><NumberField label="碳水化合物" unit="g / 100g" value={carbs} onChange={setCarbs} placeholder="例如：0" /><NumberField label="脂肪" unit="g / 100g" value={fat} onChange={setFat} placeholder="例如：3.5" /><NumberField label="膳食纤维" unit="g / 100g" value={fiber} onChange={setFiber} placeholder="例如：0" /></div></div>
      <button disabled={saving || !name.trim()} onClick={() => void save()} className="primary-button mt-5 w-full disabled:opacity-50"><Plus size={18} />{saving ? "保存中…" : "新增食品"}</button>
    </div>

    <div className="app-card mt-4 p-5">
      <SectionHeader title="食品库" />
      <input className="field" placeholder="搜索食品" value={search} onChange={event => setSearch(event.target.value)} />
      {!foods.length ? <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">食品库还没有匹配食品。先添加第一种食品，再创建餐食模板。</div> : <div className="mt-3 divide-y divide-slate-100">{foods.map(food => <div key={food.id} className={`py-4 ${!food.isActive ? "opacity-50" : ""}`}><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><div className="font-semibold">{food.name}</div>{food.isFavorite && <Badge tone="orange">常用</Badge>}</div><div className="mt-1 text-sm text-slate-500">{basisOptions.find(item => item.value === food.weightBasis)?.label ?? "其他"} · {food.servingName ?? "未设置常用份量"}{food.servingWeightG ? ` = ${food.servingWeightG}g` : ""}</div><div className="mt-1 text-xs text-slate-400">{food.caloriesPer100G} kcal / 100g · 蛋白质 {food.proteinPer100G}g · 碳水 {food.carbsPer100G}g · 脂肪 {food.fatPer100G}g</div></div><button aria-label={`收藏${food.name}`} onClick={() => void toggleFavorite(food)} className="rounded-lg p-2"><Heart size={17} className={food.isFavorite ? "fill-orange-400 text-orange-400" : "text-slate-300"} /></button>{food.isActive && <button aria-label={`停用${food.name}`} onClick={() => void deactivate(food)} className="rounded-lg p-2 text-slate-400 hover:text-red-500"><Trash2 size={17} /></button>}</div></div>)}</div>}
    </div>
  </>;
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="muted">{label}<input className="field mt-1" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} /></label>; }
function NumberField({ label, unit, value, onChange, placeholder }: { label: string; unit: string; value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="muted">{label}<div className="relative mt-1"><input className="field pr-24" type="number" min="0" step="any" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} /><span className="pointer-events-none absolute right-3 top-3 text-xs text-slate-400">{unit}</span></div></label>; }
