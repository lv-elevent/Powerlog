import { mockToday } from "@/mock/data";
import type { DaySnapshot } from "@/types";

export async function getTodayData(): Promise<DaySnapshot> {
  return mockToday;
}
