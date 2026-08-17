import { foods, meals } from "@/mock/data";
import type { Food, Meal } from "@/types";

export async function getMeals(): Promise<Meal[]> { return meals; }
export async function getFoodLibrary(): Promise<Food[]> { return foods; }
