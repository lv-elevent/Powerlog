import { historyDays } from "@/mock/data";
import type { HistoryDay } from "@/types";

export async function getHistoryDays(): Promise<HistoryDay[]> { return historyDays; }
