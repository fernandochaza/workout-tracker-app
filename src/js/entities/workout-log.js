import { createId } from '../utils/id.js';

function createLogSet(set = {}, index = 0) {
  return {
    setNumber: set.setNumber || index + 1,
    reps: set.reps || 0,
    weight: set.weight || 0,
    restSeconds: set.restSeconds || 0,
    notes: set.notes || '',
  };
}

function createLogExercise(exercise = {}) {
  return {
    exerciseId: exercise.exerciseId || '',
    // Snapshot from current exercise status to prevent errors when deleting an exercise
    exerciseSource: exercise.exerciseSource || 'api',
    name: exercise.name || '',
    bodyPart: exercise.bodyPart || '',
    target: exercise.target || '',
    equipment: exercise.equipment || '',
    sets: Array.isArray(exercise.sets)
      ? exercise.sets.map((set, index) => createLogSet(set, index))
      : [],
    notes: exercise.notes || '',
    skipped: Boolean(exercise.skipped),
  };
}

export function createWorkoutLog(input = {}) {
  return {
    id: input.id || createId(),
    sessionId: input.sessionId || '',
    routineId: input.routineId || '',
    startedAt: input.startedAt || Date.now(),
    completedAt: input.completedAt || Date.now(),
    durationSeconds: input.durationSeconds || 0,
    exercises: Array.isArray(input.exercises)
      ? input.exercises.map((exercise) => createLogExercise(exercise))
      : [],
    notes: input.notes || '',
  };
}
