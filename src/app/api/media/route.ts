import { NextResponse } from "next/server";
import { deleteMediaAsset, ensurePrivateMediaBucket, getMediaAsset, insertMediaAsset, listMediaAssets, PRIVATE_MEDIA_BUCKET, signedMediaUrl } from "@/lib/db/media";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/http";
import { requireUnlockedSession } from "@/lib/auth/session";

const ENTITY_TYPES = new Set(["meal", "body_measurement", "work_session", "daily_note"]);
const MAX_FILE_BYTES = 10 * 1024 * 1024;
function validUuid(value: string): boolean { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }
function safeFilename(value: string): string { return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "image"; }
function isUnauthorized(error: unknown): boolean { return error instanceof Error && error.name === "UnauthorizedError"; }

export async function GET(request: Request) {
  try {
    await requireUnlockedSession();
    const params = new URL(request.url).searchParams;
    const entityType = params.get("entityType") ?? ""; const entityId = params.get("entityId") ?? "";
    if (!ENTITY_TYPES.has(entityType) || !validUuid(entityId)) return badRequestResponse("图片关联对象参数错误");
    const assets = await listMediaAssets(entityType, entityId);
    return NextResponse.json(await Promise.all(assets.map(async asset => ({ ...asset, signedUrl: await signedMediaUrl(asset) }))), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { if (isUnauthorized(error)) return unauthorizedResponse(); return serverErrorResponse(error); }
}

export async function POST(request: Request) {
  let storagePath: string | null = null;
  try {
    await requireUnlockedSession();
    const form = await request.formData(); const file = form.get("file");
    const entityType = String(form.get("entityType") ?? ""); const entityId = String(form.get("entityId") ?? ""); const role = String(form.get("role") ?? "photo").slice(0, 80);
    if (!(file instanceof File) || !file.size) return badRequestResponse("请选择图片");
    if (!file.type.startsWith("image/")) return badRequestResponse("目前只支持图片文件");
    if (file.size > MAX_FILE_BYTES) return badRequestResponse("图片不能超过 10MB");
    if (!ENTITY_TYPES.has(entityType) || !validUuid(entityId)) return badRequestResponse("图片关联对象参数错误");
    await ensurePrivateMediaBucket();
    storagePath = `${entityType}/${entityId}/${crypto.randomUUID()}-${safeFilename(file.name)}`;
    const uploaded = await getSupabaseAdmin().storage.from(PRIVATE_MEDIA_BUCKET).upload(storagePath, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
    if (uploaded.error) throw new Error(uploaded.error.message);
    const asset = await insertMediaAsset({ entity_type: entityType, entity_id: entityId, storage_bucket: PRIVATE_MEDIA_BUCKET, storage_path: storagePath, media_type: "image", role, original_filename: file.name, mime_type: file.type, size_bytes: file.size, width: null, height: null, captured_at: null, sort_order: 0 });
    return NextResponse.json({ ...asset, signedUrl: await signedMediaUrl(asset) }, { status: 201 });
  } catch (error) {
    if (storagePath) { try { await getSupabaseAdmin().storage.from(PRIVATE_MEDIA_BUCKET).remove([storagePath]); } catch { /* best effort cleanup */ } }
    if (isUnauthorized(error)) return unauthorizedResponse(); return serverErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try { await requireUnlockedSession(); const id = new URL(request.url).searchParams.get("id") ?? ""; if (!validUuid(id)) return badRequestResponse("图片 id 参数错误"); await deleteMediaAsset(await getMediaAsset(id)); return NextResponse.json({ ok: true }); }
  catch (error) { if (isUnauthorized(error)) return unauthorizedResponse(); return serverErrorResponse(error); }
}
