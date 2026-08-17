import { getSupabaseAdmin } from "@/lib/supabase/server";

export const PRIVATE_MEDIA_BUCKET = "private-media";

export interface MediaAssetRow {
  id: string; entity_type: string; entity_id: string; storage_bucket: string; storage_path: string;
  media_type: "image" | "file"; role: string | null; original_filename: string | null; mime_type: string | null;
  size_bytes: number | null; width: number | null; height: number | null; captured_at: string | null;
  sort_order: number; created_at: string;
}

export async function ensurePrivateMediaBucket(): Promise<void> {
  const admin = getSupabaseAdmin();
  const existing = await admin.storage.getBucket(PRIVATE_MEDIA_BUCKET);
  if (existing.data) return;
  const created = await admin.storage.createBucket(PRIVATE_MEDIA_BUCKET, { public: false, fileSizeLimit: "10MB", allowedMimeTypes: ["image/*"] });
  if (created.error && !created.error.message.toLowerCase().includes("already exists")) throw new Error(created.error.message);
}

export async function insertMediaAsset(input: Omit<MediaAssetRow, "id" | "created_at">): Promise<MediaAssetRow> {
  const result = await getSupabaseAdmin().from("media_assets").insert(input).select("*").single();
  if (result.error) throw new Error(result.error.message);
  return result.data as MediaAssetRow;
}

export async function listMediaAssets(entityType: string, entityId: string): Promise<MediaAssetRow[]> {
  const result = await getSupabaseAdmin().from("media_assets").select("*").eq("entity_type", entityType).eq("entity_id", entityId).order("created_at", { ascending: false });
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []) as MediaAssetRow[];
}

export async function getMediaAsset(id: string): Promise<MediaAssetRow> {
  const result = await getSupabaseAdmin().from("media_assets").select("*").eq("id", id).single();
  if (result.error) throw new Error(result.error.message);
  return result.data as MediaAssetRow;
}

export async function deleteMediaAsset(asset: MediaAssetRow): Promise<void> {
  const removed = await getSupabaseAdmin().storage.from(asset.storage_bucket).remove([asset.storage_path]);
  if (removed.error) throw new Error(removed.error.message);
  const result = await getSupabaseAdmin().from("media_assets").delete().eq("id", asset.id);
  if (result.error) throw new Error(result.error.message);
}

export async function signedMediaUrl(asset: MediaAssetRow): Promise<string> {
  const result = await getSupabaseAdmin().storage.from(asset.storage_bucket).createSignedUrl(asset.storage_path, 60 * 60);
  if (result.error || !result.data?.signedUrl) throw new Error(result.error?.message ?? "无法生成图片访问链接");
  return result.data.signedUrl;
}
