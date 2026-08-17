export type MediaEntityType = "meal" | "body_measurement" | "work_session" | "daily_note";

export interface MediaAsset { id: string; entity_type: MediaEntityType; entity_id: string; role: string | null; original_filename: string | null; mime_type: string | null; size_bytes: number | null; created_at: string; signedUrl: string; }

export async function listMedia(entityType: MediaEntityType, entityId: string): Promise<MediaAsset[]> {
  const response = await fetch(`/api/media?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`, { cache: "no-store" });
  const payload = (await response.json().catch(() => [])) as MediaAsset[] | { error?: string };
  if (!response.ok) throw new Error("error" in payload ? payload.error ?? "图片加载失败" : "图片加载失败");
  return payload as MediaAsset[];
}

export async function uploadMedia(input: { file: File; entityType: MediaEntityType; entityId: string; role: string }): Promise<MediaAsset> {
  const form = new FormData(); form.set("file", input.file); form.set("entityType", input.entityType); form.set("entityId", input.entityId); form.set("role", input.role);
  const response = await fetch("/api/media", { method: "POST", body: form });
  const payload = (await response.json().catch(() => ({}))) as MediaAsset | { error?: string };
  if (!response.ok) throw new Error("error" in payload ? payload.error ?? "图片上传失败" : "图片上传失败");
  return payload as MediaAsset;
}

export async function removeMedia(id: string): Promise<void> {
  const response = await fetch(`/api/media?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) { const payload = (await response.json().catch(() => ({}))) as { error?: string }; throw new Error(payload.error ?? "图片删除失败"); }
}
