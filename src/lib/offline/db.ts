import Dexie, { type Table } from "dexie";

export interface OutboxRecord { id: string; endpoint: string; method: "POST"; payload: Record<string, unknown>; clientIdempotencyKey: string; status: "pending" | "syncing"; createdAt: string; lastError: string | null; }
export interface SyncMetadata { key: string; value: string; }
export interface CachedToday { date: string; payload: Record<string, unknown>; updatedAt: string; }
export interface LocalDraft { id: string; kind: string; payload: Record<string, unknown>; updatedAt: string; }

class PowerlogOfflineDatabase extends Dexie {
  syncOutbox!: Table<OutboxRecord, string>;
  syncMetadata!: Table<SyncMetadata, string>;
  cachedToday!: Table<CachedToday, string>;
  localDrafts!: Table<LocalDraft, string>;
  constructor() { super("powerlog-offline"); this.version(1).stores({ syncOutbox: "id,status,createdAt,clientIdempotencyKey", syncMetadata: "key", cachedToday: "date,updatedAt", localDrafts: "id,kind,updatedAt" }); }
}

export const offlineDb = new PowerlogOfflineDatabase();

export async function enqueueOutbox(input: Omit<OutboxRecord, "id" | "createdAt" | "status" | "lastError">): Promise<void> {
  await offlineDb.syncOutbox.put({ ...input, id: input.clientIdempotencyKey, status: "pending", createdAt: new Date().toISOString(), lastError: null });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("powerlog-sync-changed"));
}

export async function pendingOutboxCount(): Promise<number> { return offlineDb.syncOutbox.where("status").anyOf("pending", "syncing").count(); }
