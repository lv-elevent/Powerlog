import { z } from "zod";

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");
export const pinSchema = z.string().regex(/^\d{4,12}$/, "PIN must contain 4-12 digits");
export const setupSchema = z.object({ setupSecret: z.string().min(1), pin: pinSchema });
export const unlockSchema = z.object({ pin: pinSchema });
export const waterSchema = z.object({ date: dateSchema, amountMl: z.number().int().positive().max(10000), loggedAt: z.string().datetime().optional(), clientIdempotencyKey: z.string().min(1).max(120).optional() });
export const bodySchema = z.object({ date: dateSchema, weightKg: z.number().positive().max(500), measuredAt: z.string().datetime().optional(), waistCm: z.number().positive().max(300).optional(), note: z.string().max(2000).nullable().optional() });
export const expenseSchema = z.object({ date: dateSchema, amount: z.number().nonnegative().max(100000000), categoryId: z.string().uuid().nullable().optional(), merchant: z.string().max(200).nullable().optional(), note: z.string().max(2000).nullable().optional(), spentAt: z.string().datetime().optional(), clientIdempotencyKey: z.string().min(1).max(120).optional() });
export const noteSchema = z.object({ date: dateSchema, text: z.string().trim().min(1).max(10000), notedAt: z.string().datetime().optional(), clientIdempotencyKey: z.string().min(1).max(120).optional() });
