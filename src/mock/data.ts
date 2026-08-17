import type { DaySnapshot, Food, HistoryDay, Meal, NutritionGoal, WorkoutExercise } from "@/types";

export const nutritionGoal: NutritionGoal = { calories: 2050, protein: 125, carbs: 270, fat: 55, fiber: 28, water: 2500 };

export const foods: Food[] = [
  { id: "egg", name: "鸡蛋（煮）", basis: "1 个（约 50g）", calories: 140, protein: 12.6, carbs: 1.1, fat: 9.5, fiber: 0 },
  { id: "sweet-potato", name: "红薯（蒸）", basis: "100g", calories: 86, protein: 1.6, carbs: 20.1, fat: .1, fiber: 2.8 },
  { id: "protein", name: "酵母蛋白粉", basis: "30g / 1 勺", calories: 124, protein: 22.6, carbs: 3.8, fat: 2.1, fiber: 1.2 },
  { id: "rice", name: "米饭", basis: "100g", calories: 116, protein: 2.6, carbs: 25.9, fat: .3, fiber: .3 },
  { id: "chicken", name: "鸡胸肉", basis: "100g", calories: 133, protein: 24.6, carbs: 0, fat: 3.5, fiber: 0 },
  { id: "broccoli", name: "西兰花", basis: "100g", calories: 34, protein: 3.6, carbs: 4.3, fat: .4, fiber: 2.6 },
  { id: "oats", name: "燕麦（生）", basis: "30g", calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6 },
];

export const meals: Meal[] = [
  { id: "breakfast", type: "breakfast", label: "早餐", time: "08:05", description: "红薯 · 鸡蛋 × 2 · 酵母蛋白粉", totals: { calories: 420, protein: 39, carbs: 46, fat: 13, fiber: 6 }, items: [{ name: "红薯", amount: "250g", calories: 215, protein: 4, carbs: 50, fat: 0, fiber: 7 }, { name: "鸡蛋", amount: "2 个", calories: 140, protein: 13, carbs: 1, fat: 10, fiber: 0 }, { name: "酵母蛋白粉", amount: "30g", calories: 124, protein: 22.6, carbs: 3.8, fat: 2.1, fiber: 1.2 }] },
  { id: "lunch", type: "lunch", label: "午餐", time: "12:30", description: "米饭 · 鸡胸肉 · 西兰花", totals: { calories: 560, protein: 39, carbs: 82, fat: 10, fiber: 8 }, items: [{ name: "米饭", amount: "250g", calories: 290, protein: 6.5, carbs: 64.8, fat: .8, fiber: .8 }, { name: "鸡胸肉", amount: "150g", calories: 200, protein: 36.9, carbs: 0, fat: 5.2, fiber: 0 }, { name: "西兰花", amount: "200g", calories: 68, protein: 7.2, carbs: 8.6, fat: .8, fiber: 5.2 }] },
];

export const workoutExercises: WorkoutExercise[] = [
  { id: "bench", name: "杠铃卧推", focus: "胸 · Compound", sets: 3, reps: "6–8", rest: 150, last: "45kg · 8 / 8 / 7", color: "purple" },
  { id: "incline", name: "上斜哑铃卧推", focus: "胸 · Upper", sets: 3, reps: "8–12", rest: 120, last: "18kg · 10 / 9 / 8", color: "green" },
  { id: "dip", name: "双杠臂屈伸", focus: "三头 · Compound", sets: 2, reps: "8–12", rest: 120, last: "自重 · 10 / 9", color: "blue" },
  { id: "fly", name: "器械夹胸", focus: "胸 · Isolation", sets: 2, reps: "10–15", rest: 75, last: "35kg · 12 / 11", color: "purple" },
  { id: "raise", name: "哑铃侧平举", focus: "肩 · Isolation", sets: 4, reps: "12–20", rest: 60, last: "8kg · 16 / 15 / 14 / 13", color: "green" },
  { id: "extension", name: "绳索过头臂屈伸", focus: "三头 · Isolation", sets: 3, reps: "10–15", rest: 75, last: "20kg · 12 / 11 / 10", color: "blue" },
];

export const timeline = [
  { id: "sleep", time: "07:03", title: "起床", detail: "睡眠 7 小时 18 分 · 质量 4/5", kind: "sleep" as const, value: "⭐⭐⭐⭐" },
  { id: "cardio", time: "07:20", title: "有氧", detail: "爬坡 · 15 分钟", kind: "cardio" as const, value: "完成", completed: true },
  { id: "breakfast", time: "08:05", title: "早餐", detail: "红薯 / 鸡蛋 / 蛋白粉", kind: "meal" as const, value: "420 kcal" },
  { id: "work", time: "09:00", title: "上午工作", detail: "完成数据库接口设计 · 专注 90 分钟", kind: "work" as const, value: "90 min" },
  { id: "lunch", time: "12:30", title: "午餐", detail: "米饭 / 鸡胸 / 西兰花", kind: "meal" as const, value: "560 kcal" },
  { id: "training", time: "19:00", title: "晚间 PUSH 训练", detail: "6 个动作 · 预计 55 分钟", kind: "workout" as const, value: "开始" },
  { id: "review", time: "21:30", title: "完成今天复盘", detail: "记录收获与改进，规划明天", kind: "review" as const, value: "待完成" },
];

export const mockToday: DaySnapshot = {
  date: "2026-08-17", completion: 68, weight: 60.1, nutrition: { calories: 1280, protein: 78, carbs: 132, fat: 31, fiber: 14 }, goal: nutritionGoal, water: 1300, expenses: 46, workout: "PUSH", timeline, meals,
};

export const historyDays: HistoryDay[] = Array.from({ length: 31 }, (_, index) => ({
  date: `2026-08-${String(index + 1).padStart(2, "0")}`,
  workout: index % 3 !== 1,
  review: index % 4 !== 1,
  meal: index % 5 !== 2,
  completion: 62 + ((index * 7) % 34),
}));

export const insightWeight = [
  { day: "7/18", value: 61.1 }, { day: "7/21", value: 61.4 }, { day: "7/25", value: 61.0 }, { day: "7/28", value: 60.9 }, { day: "8/1", value: 60.6 }, { day: "8/5", value: 60.4 }, { day: "8/8", value: 60.0 }, { day: "8/12", value: 59.9 }, { day: "8/15", value: 60.0 },
];

export const insightNutrition = [
  { day: "8/11", value: 1980 }, { day: "8/12", value: 2140 }, { day: "8/13", value: 2050 }, { day: "8/14", value: 1920 }, { day: "8/15", value: 2200 }, { day: "8/16", value: 2030 }, { day: "8/17", value: 2054 },
];
