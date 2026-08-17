import { getBackendHistoryDay, type BackendDayData } from "@/services/backend-service";

export type { BackendDayData } from "@/services/backend-service";

export async function getHistoryData(date: string): Promise<BackendDayData> { return getBackendHistoryDay(date); }
