import { getBackendDay, type BackendDayData } from "@/services/backend-service";

export async function getTodayData(date?: string): Promise<BackendDayData> {
  return getBackendDay(date);
}
