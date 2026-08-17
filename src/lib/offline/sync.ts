import { enqueueOutbox, offlineDb, pendingOutboxCount } from "@/lib/offline/db";

function networkFailure(error: unknown): boolean { return typeof navigator !== "undefined" && !navigator.onLine || error instanceof TypeError; }

export async function postWithOfflineFallback<T>(endpoint: string, payload: Record<string, unknown>, clientIdempotencyKey: string): Promise<T | null> {
  try {
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = (await response.json().catch(() => ({}))) as T & { error?: string };
    if (!response.ok) throw new Error(data.error ?? `Request failed with status ${response.status}`);
    return data as T;
  } catch (error) {
    if (!networkFailure(error)) throw error;
    await enqueueOutbox({ endpoint, method: "POST", payload, clientIdempotencyKey });
    return null;
  }
}

export async function syncOutbox(): Promise<{ synced: number; pending: number }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return { synced: 0, pending: await pendingOutboxCount() };
  const records = await offlineDb.syncOutbox.where("status").equals("pending").sortBy("createdAt");
  let synced = 0;
  for (const record of records) {
    await offlineDb.syncOutbox.update(record.id, { status: "syncing" });
    try {
      const response = await fetch(record.endpoint, { method: record.method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(record.payload) });
      if (!response.ok) throw new Error(`同步失败：${response.status}`);
      await offlineDb.syncOutbox.delete(record.id); synced += 1;
    } catch (error) {
      await offlineDb.syncOutbox.update(record.id, { status: "pending", lastError: error instanceof Error ? error.message : "同步失败" });
      if (networkFailure(error)) break;
    }
  }
  const pending = await pendingOutboxCount();
  if (typeof window !== "undefined") window.dispatchEvent(new Event("powerlog-sync-changed"));
  return { synced, pending };
}
