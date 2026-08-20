import type { FoodWeightBasis } from "@/types";
import { resolveFoodSearchAlias } from "@/lib/food-aliases";

const USDA_API_URL = "https://api.nal.usda.gov/fdc/v1";
const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;

export class USDAConfigurationError extends Error {
  constructor() {
    super("在线食品搜索未配置 USDA_FDC_API_KEY");
    this.name = "USDAConfigurationError";
  }
}

export class USDARequestError extends Error {
  constructor() {
    super("USDA 食品数据暂时不可用，请稍后重试");
    this.name = "USDARequestError";
  }
}

interface USDAFoodNutrient {
  nutrientId?: number;
  nutrientName?: string;
  unitName?: string;
  value?: number;
  amount?: number;
  nutrient?: { name?: string; unitName?: string };
}

interface USDAFood {
  fdcId: number;
  description: string;
  dataType?: string;
  foodNutrients?: USDAFoodNutrient[];
}

interface USDASearchResponse {
  foods?: USDAFood[];
}

export interface USDAFoodNutrition {
  sourceId: string;
  sourceName: string;
  dataType: string;
  weightBasis: FoodWeightBasis;
  caloriesPer100G: number;
  proteinPer100G: number;
  carbsPer100G: number;
  fatPer100G: number;
  fiberPer100G: number;
}

function apiKey(): string {
  const key = process.env.USDA_FDC_API_KEY?.trim();
  if (!key) throw new USDAConfigurationError();
  return key;
}

async function usdaRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${USDA_API_URL}${path}${path.includes("?") ? "&" : "?"}api_key=${encodeURIComponent(apiKey())}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok) throw new USDARequestError();
  return (await response.json()) as T;
}

function nutrientName(item: USDAFoodNutrient): string {
  return (item.nutrientName ?? item.nutrient?.name ?? "").toLowerCase();
}

function nutrientValue(items: USDAFoodNutrient[], nutrientId: number, nameParts: string[], unit?: string): number | null {
  const item = items.find(candidate => candidate.nutrientId === nutrientId && (!unit || (candidate.unitName ?? candidate.nutrient?.unitName ?? "").toUpperCase() === unit));
  const fallback = item ?? items.find(candidate => nameParts.every(part => nutrientName(candidate).includes(part)) && (!unit || (candidate.unitName ?? candidate.nutrient?.unitName ?? "").toUpperCase() === unit));
  const value = fallback?.amount ?? fallback?.value;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function weightBasis(description: string): FoodWeightBasis {
  const normalized = description.toLowerCase();
  if (/(cooked|boiled|steamed|baked|roasted|grilled|fried)/.test(normalized)) return "cooked";
  if (normalized.includes("raw")) return "raw";
  return "other";
}

export function normalizeUSDAFood(food: USDAFood): USDAFoodNutrition | null {
  const nutrients = food.foodNutrients ?? [];
  const values = {
    caloriesPer100G: nutrientValue(nutrients, 1008, ["energy"], "KCAL"),
    proteinPer100G: nutrientValue(nutrients, 1003, ["protein"]),
    carbsPer100G: nutrientValue(nutrients, 1005, ["carbohydrate"]),
    fatPer100G: nutrientValue(nutrients, 1004, ["total lipid"]),
    fiberPer100G: nutrientValue(nutrients, 1079, ["fiber"]),
  };
  if (Object.values(values).some(value => value === null)) return null;
  return {
    sourceId: String(food.fdcId),
    sourceName: food.description,
    dataType: food.dataType ?? "",
    weightBasis: weightBasis(food.description),
    caloriesPer100G: values.caloriesPer100G as number,
    proteinPer100G: values.proteinPer100G as number,
    carbsPer100G: values.carbsPer100G as number,
    fatPer100G: values.fatPer100G as number,
    fiberPer100G: values.fiberPer100G as number,
  };
}

const searchCache = new Map<string, { expiresAt: number; foods: USDAFoodNutrition[] }>();

export async function searchUSDAFoods(input: string): Promise<{ aliasName: string; foods: USDAFoodNutrition[] }> {
  const alias = resolveFoodSearchAlias(input);
  const cached = searchCache.get(alias.query.toLowerCase());
  if (cached && cached.expiresAt > Date.now()) return { aliasName: alias.displayName, foods: cached.foods };
  const payload = await usdaRequest<USDASearchResponse>("/foods/search", { method: "POST", body: JSON.stringify({ query: alias.query, pageSize: 20, dataType: ["Foundation", "SR Legacy"] }) });
  const foods = (payload.foods ?? []).map(normalizeUSDAFood).filter((food): food is USDAFoodNutrition => food !== null);
  searchCache.set(alias.query.toLowerCase(), { expiresAt: Date.now() + SEARCH_CACHE_TTL_MS, foods });
  return { aliasName: alias.displayName, foods };
}

export async function getUSDAFood(sourceId: string): Promise<USDAFoodNutrition | null> {
  const food = await usdaRequest<USDAFood>(`/food/${encodeURIComponent(sourceId)}`);
  return normalizeUSDAFood(food);
}
