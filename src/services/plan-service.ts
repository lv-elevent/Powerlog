import type { TimelineItem, WorkoutPlanRecord } from "@/types";

const PLAN_KEY = "powerlog:workout-plan:v1";
const PLAN_OVERRIDE_KEY = "powerlog:workout-plan-override:v1";
const TODOS_KEY = "powerlog:plan-todos:v1";

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 本地缓存失败不应阻塞计划页面，服务端数据仍可继续使用。
  }
}

export function getCachedWorkoutPlan(): WorkoutPlanRecord | null {
  return readJson<WorkoutPlanRecord>(PLAN_OVERRIDE_KEY) ?? readJson<WorkoutPlanRecord>(PLAN_KEY);
}

export function saveWorkoutPlanCache(plan: WorkoutPlanRecord): void {
  writeJson(PLAN_KEY, plan);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("powerlog-plan-changed"));
}

export function saveWorkoutPlanOverride(plan: WorkoutPlanRecord): void {
  writeJson(PLAN_OVERRIDE_KEY, plan);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("powerlog-plan-changed"));
}

export function hasWorkoutPlanOverride(): boolean {
  return getCachedWorkoutPlan() !== null && readJson<WorkoutPlanRecord>(PLAN_OVERRIDE_KEY) !== null;
}

export function getPlanTodos(fallback: TimelineItem[]): TimelineItem[] {
  return readJson<TimelineItem[]>(TODOS_KEY) ?? fallback;
}

export function savePlanTodos(todos: TimelineItem[]): void {
  writeJson(TODOS_KEY, todos);
}
