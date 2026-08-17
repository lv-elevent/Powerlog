export type InsightRange = "7d" | "30d" | "3m" | "1y";
export type InsightCategory = "body" | "nutrition" | "training" | "life" | "finance";

export interface InsightSeriesPoint {
  date: string;
  label: string;
  value: number | null;
}

export interface BodyInsights {
  currentWeightKg: number | null;
  averageWeight7dKg: number | null;
  periodChangeKg: number | null;
  latestWaistCm: number | null;
  latestBodyFatPct: number | null;
  weightTrend: InsightSeriesPoint[];
  waistTrend: InsightSeriesPoint[];
}

export interface NutritionInsights {
  averages: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null; fiber: number | null };
  goals: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null; fiber: number | null };
  achievementRates: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null; fiber: number | null };
  averageWaterMl: number | null;
  calorieTrend: InsightSeriesPoint[];
}

export interface TrainingExerciseTrend {
  exerciseId: string | null;
  name: string;
  points: InsightSeriesPoint[];
}

export interface TrainingInsights {
  sessionsCount: number;
  totalDurationMinutes: number;
  workingSets: number;
  totalVolumeKg: number;
  splitCounts: { push: number; pull: number; legs: number; core: number };
  exerciseTrends: TrainingExerciseTrend[];
}

export interface LifeInsights {
  averageSleepMinutes: number | null;
  averageSleepQuality: number | null;
  averageWaterMl: number | null;
  totalWorkMinutes: number;
  averageWorkMinutes: number | null;
  totalCardioMinutes: number;
}

export interface FinanceCategorySummary {
  categoryId: string | null;
  label: string;
  amount: number;
  percent: number;
}

export interface FinanceInsights {
  totalAmount: number;
  averageDailyAmount: number | null;
  dailyTrend: InsightSeriesPoint[];
  categories: FinanceCategorySummary[];
}

export interface InsightsPayload {
  range: InsightRange;
  category: InsightCategory;
  from: string;
  to: string;
  body?: BodyInsights;
  nutrition?: NutritionInsights;
  training?: TrainingInsights;
  life?: LifeInsights;
  finance?: FinanceInsights;
}
