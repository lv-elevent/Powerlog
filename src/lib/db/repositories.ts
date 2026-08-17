import { getSupabaseAdmin } from "@/lib/supabase/server";

export interface AppSecurityRow {
  id: number;
  setup_completed: boolean;
  pin_hash: string | null;
  session_version: number;
  auto_lock_minutes: number;
  failed_attempts: number;
  locked_until: string | null;
  updated_at: string;
}

export interface DailyLogRow {
  id: string;
  record_date: string;
  is_closed: boolean;
  completion_score: number | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BodyMeasurementRow {
  id: string;
  record_date: string;
  measured_at: string | null;
  weight_kg: number | null;
  body_fat_pct: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  arm_cm: number | null;
  thigh_cm: number | null;
  hip_cm: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface WaterLogRow {
  id: string;
  record_date: string;
  logged_at: string;
  amount_ml: number;
  client_idempotency_key: string | null;
  created_at: string;
}

export interface ExpenseCategoryRow {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ExpenseRow {
  id: string;
  record_date: string;
  spent_at: string;
  amount: number;
  category_id: string | null;
  merchant: string | null;
  note: string | null;
  client_idempotency_key: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string | null;
}

export interface DailyNoteRow {
  id: string;
  record_date: string;
  noted_at: string;
  text: string;
  client_idempotency_key: string | null;
  created_at: string;
  updated_at: string;
}

type QueryResult<T> = { data: T | null; error: { message: string } | null };

function unwrap<T>({ data, error }: QueryResult<T>): T {
  if (error) throw new Error(error.message);
  if (data === null) throw new Error("Database returned no record");
  return data;
}

export async function getAppSecurity(): Promise<AppSecurityRow> {
  return unwrap(await getSupabaseAdmin().from("app_security").select("*").eq("id", 1).single());
}

export async function updateAppSecurity(values: Partial<AppSecurityRow>): Promise<AppSecurityRow> {
  return unwrap(await getSupabaseAdmin().from("app_security").update(values).eq("id", 1).select("*").single());
}

export async function ensureDailyLog(recordDate: string): Promise<DailyLogRow> {
  return unwrap(await getSupabaseAdmin().from("daily_logs").upsert({ record_date: recordDate }, { onConflict: "record_date" }).select("*").single());
}

export async function getDailyLog(recordDate: string): Promise<DailyLogRow | null> {
  const result = await getSupabaseAdmin().from("daily_logs").select("*").eq("record_date", recordDate).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return result.data as DailyLogRow | null;
}

export async function upsertWaterLog(input: { record_date: string; amount_ml: number; logged_at: string; client_idempotency_key: string }): Promise<WaterLogRow> {
  return unwrap(await getSupabaseAdmin().from("water_logs").upsert(input, { onConflict: "client_idempotency_key" }).select("*").single());
}

export async function listWaterLogs(recordDate: string): Promise<WaterLogRow[]> {
  return unwrap(await getSupabaseAdmin().from("water_logs").select("*").eq("record_date", recordDate).order("logged_at", { ascending: true })) as WaterLogRow[];
}

export async function upsertBodyMeasurement(input: { record_date: string; measured_at: string; weight_kg: number; waist_cm?: number | null; note?: string | null }): Promise<BodyMeasurementRow> {
  return unwrap(await getSupabaseAdmin().from("body_measurements").upsert(input, { onConflict: "record_date" }).select("*").single());
}

export async function getBodyMeasurement(recordDate: string): Promise<BodyMeasurementRow | null> {
  const result = await getSupabaseAdmin().from("body_measurements").select("*").eq("record_date", recordDate).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return result.data as BodyMeasurementRow | null;
}

export async function listExpenseCategories(): Promise<ExpenseCategoryRow[]> {
  return unwrap(await getSupabaseAdmin().from("expense_categories").select("*").eq("is_active", true).order("sort_order", { ascending: true })) as ExpenseCategoryRow[];
}

export async function insertExpense(input: { record_date: string; spent_at: string; amount: number; category_id?: string | null; merchant?: string | null; note?: string | null; client_idempotency_key: string }): Promise<ExpenseRow> {
  return unwrap(await getSupabaseAdmin().from("expenses").upsert(input, { onConflict: "client_idempotency_key" }).select("*").single());
}

export async function listExpenses(recordDate: string): Promise<ExpenseRow[]> {
  return unwrap(await getSupabaseAdmin().from("expenses").select("*").eq("record_date", recordDate).order("spent_at", { ascending: true })) as ExpenseRow[];
}

export async function insertDailyNote(input: { record_date: string; noted_at: string; text: string; client_idempotency_key: string }): Promise<DailyNoteRow> {
  return unwrap(await getSupabaseAdmin().from("daily_notes").upsert(input, { onConflict: "client_idempotency_key" }).select("*").single());
}

export async function listDailyNotes(recordDate: string): Promise<DailyNoteRow[]> {
  return unwrap(await getSupabaseAdmin().from("daily_notes").select("*").eq("record_date", recordDate).order("noted_at", { ascending: true })) as DailyNoteRow[];
}
