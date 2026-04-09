import { createId } from '../utils/id.js';

export const EXERCISE_SOURCES = {
  API: 'api',
  CUSTOM: 'custom',
};

export function createExercise(input = {}) {
  const now = Date.now();

  return {
    id: input.id || createId(),
    source: input.source || EXERCISE_SOURCES.CUSTOM,
    name: input.name || '',
    bodyPart: input.bodyPart || '',
    target: input.target || '',
    equipment: input.equipment || '',
    instructions: Array.isArray(input.instructions) ? input.instructions : [],
    mediaUrl: input.mediaUrl || '',
    notes: input.notes || '',
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}
