import { workoutExercises } from "@/mock/data";
import type { WorkoutExercise } from "@/types";

export async function getPushPlan(): Promise<WorkoutExercise[]> { return workoutExercises; }
