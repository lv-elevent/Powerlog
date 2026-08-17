import { z } from "zod";

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");
export const pinSchema = z.string().regex(/^\d{4,12}$/, "PIN must contain 4-12 digits");
export const setupSchema = z.object({ setupSecret: z.string().min(1), pin: pinSchema });
export const unlockSchema = z.object({ pin: pinSchema });
export const waterSchema = z.object({ date: dateSchema, amountMl: z.number().int().positive().max(10000), loggedAt: z.string().datetime().optional(), clientIdempotencyKey: z.string().min(1).max(120).optional() });
export const bodySchema = z.object({ date: dateSchema, weightKg: z.number().positive().max(500), measuredAt: z.string().datetime().optional(), waistCm: z.number().positive().max(300).optional(), note: z.string().max(2000).nullable().optional() });
export const expenseSchema = z.object({ date: dateSchema, amount: z.number().nonnegative().max(100000000), categoryId: z.string().uuid().nullable().optional(), merchant: z.string().max(200).nullable().optional(), note: z.string().max(2000).nullable().optional(), spentAt: z.string().datetime().optional(), clientIdempotencyKey: z.string().min(1).max(120).optional() });
export const noteSchema = z.object({ date: dateSchema, text: z.string().trim().min(1).max(10000), notedAt: z.string().datetime().optional(), clientIdempotencyKey: z.string().min(1).max(120).optional() });

const nutritionMealTypeSchema = z.enum(["breakfast", "lunch", "dinner", "snack", "pre_workout", "post_workout", "other"]);
const weightBasisSchema = z.enum(["cooked", "raw", "edible_cooked", "packaged", "serving", "other"]);
const foodFields = {
  name: z.string().trim().min(1).max(200),
  brand: z.string().max(200).nullable().optional(),
  servingName: z.string().max(100).nullable().optional(),
  servingWeightG: z.number().positive().max(100000).nullable().optional(),
  weightBasis: weightBasisSchema,
  caloriesPer100G: z.number().nonnegative().max(100000),
  proteinPer100G: z.number().nonnegative().max(100000),
  carbsPer100G: z.number().nonnegative().max(100000),
  fatPer100G: z.number().nonnegative().max(100000),
  fiberPer100G: z.number().nonnegative().max(100000),
  sodiumMgPer100G: z.number().nonnegative().max(1000000).nullable().optional(),
  barcode: z.string().max(100).nullable().optional(),
  note: z.string().max(2000).nullable().optional(),
};
export const createFoodSchema = z.object(foodFields);
export const updateFoodSchema = createFoodSchema.partial().extend({ isFavorite: z.boolean().optional(), isActive: z.boolean().optional() });
export const mealItemSchema = z.object({ foodId: z.string().uuid(), quantityG: z.number().positive().max(100000), servingCount: z.number().positive().max(1000).nullable().optional() });
export const mealSchema = z.object({ date: dateSchema, mealType: nutritionMealTypeSchema, title: z.string().max(200).nullable().optional(), eatenAt: z.string().datetime().optional(), note: z.string().max(2000).nullable().optional(), sourceTemplateId: z.string().uuid().nullable().optional(), clientIdempotencyKey: z.string().min(1).max(120).optional(), items: z.array(mealItemSchema).min(1).max(100) });
export const templateItemSchema = z.object({ foodId: z.string().uuid(), quantityG: z.number().positive().max(100000).nullable().optional(), servingCount: z.number().positive().max(1000).nullable().optional(), sortOrder: z.number().int().nonnegative() }).refine(value => value.quantityG !== null && value.quantityG !== undefined || value.servingCount !== null && value.servingCount !== undefined, "template item requires quantityG or servingCount");
export const mealTemplateSchema = z.object({ name: z.string().trim().min(1).max(200), mealType: nutritionMealTypeSchema, isFavorite: z.boolean().optional(), note: z.string().max(2000).nullable().optional(), items: z.array(templateItemSchema).min(1).max(100) });
export const nutritionGoalSchema = z.object({ effectiveFrom: dateSchema, effectiveTo: dateSchema.nullable().optional(), calories: z.number().nonnegative().max(100000), protein: z.number().nonnegative().max(100000), carbs: z.number().nonnegative().max(100000), fat: z.number().nonnegative().max(100000), fiber: z.number().nonnegative().max(100000), water: z.number().int().nonnegative().max(100000), note: z.string().max(2000).nullable().optional() });
export const workoutSessionSchema = z.object({ recordDate: dateSchema, planId: z.string().uuid(), planDayId: z.string().uuid(), clientIdempotencyKey: z.string().min(1).max(120).optional() });
export const workoutSetSchema = z.object({ sessionExerciseId: z.string().uuid(), setNumber: z.number().int().positive(), setType: z.enum(["warmup", "working", "drop", "backoff", "other"]), weightKg: z.number().nonnegative().nullable().optional(), reps: z.number().int().nonnegative().nullable().optional(), rir: z.number().nonnegative().nullable().optional(), durationSeconds: z.number().int().nonnegative().nullable().optional(), isCompleted: z.boolean(), clientIdempotencyKey: z.string().min(1).max(120).optional() });
export const finishWorkoutSchema = z.object({ feelingScore: z.number().int().min(1).max(5).nullable().optional(), note: z.string().max(2000).nullable().optional(), durationMinutes: z.number().int().nonnegative().nullable().optional() });
