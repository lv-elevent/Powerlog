import type { ExerciseLibraryRow, WorkoutPlanGraph, WorkoutSessionGraph, WorkoutSetRow } from "@/lib/db/repositories";
import type { ExerciseLibraryRecord, WorkoutPlanRecord, WorkoutSessionRecord, WorkoutSessionExerciseRecord, WorkoutSetRecord } from "@/types";
import { getCachedWorkoutPlan, hasWorkoutPlanOverride, saveWorkoutPlanCache } from "@/services/plan-service";
import { postWithOfflineFallback } from "@/lib/offline/sync";

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) throw new Error(payload.error ?? `Request failed with status ${response.status}`);
  return payload;
}

function mapExercise(row: ExerciseLibraryRow): ExerciseLibraryRecord { return { id: row.id, name: row.name, category: row.category, primaryMuscle: row.primary_muscle, equipment: row.equipment, defaultRestSeconds: row.default_rest_seconds === null ? null : Number(row.default_rest_seconds), isActive: row.is_active }; }
function mapPlan(graph: WorkoutPlanGraph): WorkoutPlanRecord { return { id: graph.plan.id, name: graph.plan.name, version: graph.plan.version, description: graph.plan.description, days: graph.days.map(({ day, exercises }) => ({ id: day.id, dayCode: day.day_code, name: day.name, sortOrder: day.sort_order, estimatedMinutes: day.estimated_minutes === null ? null : Number(day.estimated_minutes), isRestDay: day.is_rest_day, exercises: exercises.map(({ planExercise, exercise }) => ({ id: planExercise.id, exerciseId: planExercise.exercise_id, exercise: mapExercise(exercise), sortOrder: planExercise.sort_order, targetSets: planExercise.target_sets, repMin: planExercise.rep_min, repMax: planExercise.rep_max, targetRir: planExercise.target_rir === null ? null : Number(planExercise.target_rir), restSeconds: planExercise.rest_seconds, isOptional: planExercise.is_optional })) })) }; }
function mapSet(row: WorkoutSetRow): WorkoutSetRecord { return { id: row.id, sessionExerciseId: row.session_exercise_id, setNumber: row.set_number, setType: row.set_type, weightKg: row.weight_kg === null ? null : Number(row.weight_kg), reps: row.reps === null ? null : Number(row.reps), rir: row.rir === null ? null : Number(row.rir), durationSeconds: row.duration_seconds === null ? null : Number(row.duration_seconds), completedAt: row.completed_at, isCompleted: row.is_completed }; }
function mapSession(graph: WorkoutSessionGraph): WorkoutSessionRecord { return { id: graph.session.id, recordDate: graph.session.record_date, planId: graph.session.plan_id, planDayId: graph.session.plan_day_id, workoutTypeSnapshot: graph.session.workout_type_snapshot, workoutNameSnapshot: graph.session.workout_name_snapshot, startedAt: graph.session.started_at, endedAt: graph.session.ended_at, durationMinutes: graph.session.duration_minutes === null ? null : Number(graph.session.duration_minutes), feelingScore: graph.session.feeling_score, note: graph.session.note, status: graph.session.status, exercises: graph.exercises.map(({ exercise, sets }) => ({ id: exercise.id, sessionId: exercise.session_id, exerciseId: exercise.exercise_id, exerciseNameSnapshot: exercise.exercise_name_snapshot, sortOrder: exercise.sort_order, targetSetsSnapshot: exercise.target_sets_snapshot, repMinSnapshot: exercise.rep_min_snapshot, repMaxSnapshot: exercise.rep_max_snapshot, targetRirSnapshot: exercise.target_rir_snapshot === null ? null : Number(exercise.target_rir_snapshot), restSecondsSnapshot: exercise.rest_seconds_snapshot, status: exercise.status, sets: sets.map(mapSet) })), summary: graph.summary ? { workingSets: Number(graph.summary.working_sets), totalReps: Number(graph.summary.total_reps), totalVolumeKg: Number(graph.summary.total_volume_kg) } : null }; }

export function getCachedWorkoutPlans(): WorkoutPlanRecord[] { const cached = getCachedWorkoutPlan(); return cached ? [cached] : []; }
export async function refreshWorkoutPlans(): Promise<WorkoutPlanRecord[]> { if (hasWorkoutPlanOverride()) { const cached = getCachedWorkoutPlan(); return cached ? [cached] : []; } const rows = await request<WorkoutPlanGraph[]>("/api/workout/plans", { cache: "no-store" }); const plans = rows.map(mapPlan); if (plans[0]) saveWorkoutPlanCache(plans[0]); return plans; }
export async function getWorkoutPlans(): Promise<WorkoutPlanRecord[]> { return refreshWorkoutPlans(); }
const sessionCache = new Map<string, WorkoutSessionRecord>();
const sessionSync = new Map<string, { remoteId: string; exerciseIds: Map<string, string> }>();

function createLocalSession(input: { recordDate: string; plan: WorkoutPlanRecord; planDayId: string }): WorkoutSessionRecord {
  const day = input.plan.days.find(item => item.id === input.planDayId);
  if (!day) throw new Error("训练计划不存在");

  const id = `local-${crypto.randomUUID()}`;
  const exercises: WorkoutSessionExerciseRecord[] = day.exercises.map((item, index) => ({
    id: `${id}-exercise-${index}`,
    sessionId: id,
    exerciseId: item.exerciseId,
    exerciseNameSnapshot: item.exercise?.name ?? "自定义动作",
    sortOrder: index,
    targetSetsSnapshot: item.targetSets,
    repMinSnapshot: item.repMin,
    repMaxSnapshot: item.repMax,
    targetRirSnapshot: item.targetRir,
    restSecondsSnapshot: item.restSeconds,
    status: "pending",
    sets: [],
  }));
  const session: WorkoutSessionRecord = {
    id,
    recordDate: input.recordDate,
    planId: input.plan.id,
    planDayId: day.id,
    workoutTypeSnapshot: day.dayCode,
    workoutNameSnapshot: day.name,
    startedAt: new Date().toISOString(),
    endedAt: null,
    durationMinutes: null,
    feelingScore: null,
    note: null,
    status: "in_progress",
    exercises,
    summary: null,
  };
  sessionCache.set(id, session);
  return session;
}

export function createOptimisticWorkoutSession(input: { recordDate: string; plan: WorkoutPlanRecord; planDayId: string }): WorkoutSessionRecord {
  return createLocalSession(input);
}

export async function syncWorkoutSession(localId: string, input: { recordDate: string; planId: string; planDayId: string }): Promise<void> {
  const local = sessionCache.get(localId);
  if (!local || !localId.startsWith("local-")) return;
  try {
    const row = await request<WorkoutSessionGraph>("/api/workout/sessions", { method: "POST", body: JSON.stringify({ ...input, clientIdempotencyKey: localId }) });
    const remote = mapSession(row);
    const exerciseIds = new Map(local.exercises.map((exercise, index) => [exercise.id, remote.exercises[index]?.id ?? exercise.id]));
    sessionSync.set(localId, { remoteId: remote.id, exerciseIds });

    const latestBeforeSetSync = sessionCache.get(localId) ?? local;
    for (const exercise of latestBeforeSetSync.exercises) {
      for (const set of exercise.sets) {
        const key = crypto.randomUUID();
        await postWithOfflineFallback<WorkoutSetRow>(`/api/workout/sessions/${remote.id}/sets`, {
          sessionExerciseId: exerciseIds.get(exercise.id) ?? exercise.id,
          setNumber: set.setNumber,
          setType: set.setType,
          weightKg: set.weightKg,
          reps: set.reps,
          rir: set.rir,
          durationSeconds: set.durationSeconds,
          isCompleted: set.isCompleted,
          clientIdempotencyKey: key,
        }, key);
      }
    }

    const latest = sessionCache.get(localId);
    if (latest?.status === "completed") {
      await request<WorkoutSessionGraph>(`/api/workout/sessions/${remote.id}`, { method: "PATCH", body: JSON.stringify({ feelingScore: latest.feelingScore, note: latest.note, durationMinutes: latest.durationMinutes }) });
    }
  } catch {
    // 训练页面已经可以继续使用；联网恢复后由用户再次进入时继续走正常同步链路。
  }
}

export async function startWorkout(input: { recordDate: string; planId: string; planDayId: string }): Promise<WorkoutSessionRecord> { const row = await request<WorkoutSessionGraph>("/api/workout/sessions", { method: "POST", body: JSON.stringify({ ...input, clientIdempotencyKey: crypto.randomUUID() }) }); const session = mapSession(row); sessionCache.set(session.id, session); return session; }
export function getCachedWorkoutSession(id: string): WorkoutSessionRecord | null { return sessionCache.get(id) ?? null; }
export async function getWorkoutSession(id: string): Promise<WorkoutSessionRecord> { const cached = getCachedWorkoutSession(id); if (cached) return cached; const session = mapSession(await request<WorkoutSessionGraph>(`/api/workout/sessions/${id}`, { cache: "no-store" })); sessionCache.set(session.id, session); return session; }
export async function recordWorkoutSet(sessionId: string, input: { sessionExerciseId: string; setNumber: number; setType: WorkoutSetRecord["setType"]; weightKg: number | null; reps: number | null; rir: number | null; durationSeconds?: number | null; isCompleted?: boolean }): Promise<WorkoutSetRecord | null> {
  const cached = sessionCache.get(sessionId);
  if (cached?.id.startsWith("local-")) {
    const exercise = cached.exercises.find(item => item.id === input.sessionExerciseId);
    if (!exercise) throw new Error("训练动作不存在");
    const localSet: WorkoutSetRecord = { id: `${sessionId}-set-${crypto.randomUUID()}`, sessionExerciseId: input.sessionExerciseId, setNumber: input.setNumber, setType: input.setType, weightKg: input.weightKg, reps: input.reps, rir: input.rir, durationSeconds: input.durationSeconds ?? null, completedAt: new Date().toISOString(), isCompleted: input.isCompleted ?? true };
    const nextExercises = cached.exercises.map(item => {
      if (item.id !== exercise.id) return item;
      const sets = [...item.sets.filter(set => !(set.setNumber === localSet.setNumber && set.setType === localSet.setType)), localSet];
      const completedSets = sets.filter(set => set.isCompleted).length;
      const status: WorkoutSessionExerciseRecord["status"] = item.targetSetsSnapshot !== null && completedSets >= item.targetSetsSnapshot ? "completed" : "in_progress";
      return { ...item, status, sets };
    });
    sessionCache.set(sessionId, { ...cached, exercises: nextExercises });
    const sync = sessionSync.get(sessionId);
    if (sync) {
      const key = crypto.randomUUID();
      void postWithOfflineFallback<WorkoutSetRow>(`/api/workout/sessions/${sync.remoteId}/sets`, { ...input, sessionExerciseId: sync.exerciseIds.get(input.sessionExerciseId) ?? input.sessionExerciseId, isCompleted: input.isCompleted ?? true, clientIdempotencyKey: key }, key);
    }
    return localSet;
  }
  const clientIdempotencyKey = crypto.randomUUID();
  const row = await postWithOfflineFallback<WorkoutSetRow>(`/api/workout/sessions/${sessionId}/sets`, { ...input, isCompleted: input.isCompleted ?? true, clientIdempotencyKey }, clientIdempotencyKey);
  return row ? mapSet(row) : null;
}
export async function finishWorkout(id: string, input: { feelingScore: number | null; note: string | null; durationMinutes?: number | null }): Promise<WorkoutSessionRecord> {
  const cached = sessionCache.get(id);
  if (cached?.id.startsWith("local-")) {
    const next = { ...cached, endedAt: new Date().toISOString(), durationMinutes: input.durationMinutes ?? cached.durationMinutes, feelingScore: input.feelingScore, note: input.note, status: "completed" as const };
    sessionCache.set(id, next);
    const sync = sessionSync.get(id);
    if (sync) void request<WorkoutSessionGraph>(`/api/workout/sessions/${sync.remoteId}`, { method: "PATCH", body: JSON.stringify({ ...input, durationMinutes: next.durationMinutes }) });
    return next;
  }
  const session = mapSession(await request<WorkoutSessionGraph>(`/api/workout/sessions/${id}`, { method: "PATCH", body: JSON.stringify(input) }));
  sessionCache.set(session.id, session);
  return session;
}
export async function getLastWorkoutSet(exerciseId: string, sessionId?: string): Promise<{ date: string; set: WorkoutSetRecord } | null> { const row = await request<{ date: string; set: WorkoutSetRow } | null>(`/api/workout/history?exerciseId=${encodeURIComponent(exerciseId)}${sessionId ? `&sessionId=${encodeURIComponent(sessionId)}` : ""}`, { cache: "no-store" }); return row ? { date: row.date, set: mapSet(row.set) } : null; }
export async function getWorkoutSessions(date: string): Promise<WorkoutSessionRecord[]> { const rows = await request<WorkoutSessionGraph[]>(`/api/workout/sessions?date=${encodeURIComponent(date)}`, { cache: "no-store" }); return rows.map(mapSession); }
