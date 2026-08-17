export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
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
