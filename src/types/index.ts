export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "pre_workout" | "post_workout" | "other";
export type TimelineKind = "sleep" | "cardio" | "meal" | "work" | "workout" | "water" | "expense" | "review" | "body" | "note";

export interface NutritionGoal {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MealItem {
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface Meal {
  id: string;
  type: MealType;
  label: string;
  time: string;
  description: string;
  totals: NutritionTotals;
  items: MealItem[];
}

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  detail: string;
  kind: TimelineKind;
  value?: string;
  completed?: boolean;
}

export interface WaterLog { id: string; amount: number; time: string; }
export interface Expense { id: string; amount: number; category: string; note: string; time: string; }
export interface BodyMeasurement { weight: number; time: string; waist?: number; }

export interface WorkoutExercise {
  id: string;
  name: string;
  focus: string;
  sets: number;
  reps: string;
  rest: number;
  last: string;
  color: "blue" | "green" | "purple" | "orange";
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  weight: number;
  reps: number;
  rir: number;
}

export interface WorkoutSummary {
  duration: number;
  sets: number;
  volume: number;
  best: string;
}

export interface Food {
  id: string;
  name: string;
  basis: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export type FoodWeightBasis = "cooked" | "raw" | "edible_cooked" | "packaged" | "serving" | "other";

export interface FoodLibraryItem {
  id: string;
  name: string;
  brand: string | null;
  servingName: string | null;
  servingWeightG: number | null;
  weightBasis: FoodWeightBasis;
  caloriesPer100G: number;
  proteinPer100G: number;
  carbsPer100G: number;
  fatPer100G: number;
  fiberPer100G: number;
  isFavorite: boolean;
  isActive: boolean;
  note: string | null;
}

export interface NutritionGoalRecord {
  id: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
  note: string | null;
}

export interface NutritionMealItem {
  id: string;
  foodId: string | null;
  foodNameSnapshot: string;
  brandSnapshot: string | null;
  quantityG: number | null;
  servingNameSnapshot: string | null;
  servingCount: number | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface NutritionMealRecord {
  id: string;
  recordDate: string;
  type: MealType;
  title: string | null;
  eatenAt: string;
  sourceTemplateId: string | null;
  items: NutritionMealItem[];
  totals: NutritionTotals;
}

export interface MealTemplateRecord {
  id: string;
  name: string;
  mealType: MealType;
  isFavorite: boolean;
  items: Array<{ id: string; foodId: string; quantityG: number | null; servingCount: number | null; food: FoodLibraryItem | null }>;
}

export interface DaySnapshot {
  date: string;
  completion: number;
  weight: number;
  nutrition: NutritionTotals;
  goal: NutritionGoal;
  water: number;
  expenses: number;
  workout: string;
  timeline: TimelineItem[];
  meals: Meal[];
}

export interface HistoryDay {
  date: string;
  workout: boolean;
  review: boolean;
  meal: boolean;
  completion: number;
}
