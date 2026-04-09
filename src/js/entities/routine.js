import { createId } from '../utils/id.js';

export function createRoutine(input = {}) {
  const now = Date.now();

  return {
    id: input.id || createId(),
    name: input.name || '',
    description: input.description || '',
    status: input.status || 'active',
    templateType: input.templateType ?? null,
    onboardingCompleted: Boolean(input.onboardingCompleted),
    sessionIds: Array.isArray(input.sessionIds) ? input.sessionIds : [],
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}
