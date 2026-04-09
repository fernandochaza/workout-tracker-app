import { getLocalStorage, setLocalStorage, STORAGE_KEYS } from '../utils/storage.js';
import { createRoutine } from '../entities/routine.js';

function getRoutinesCollection() {
  try {
    const routines = getLocalStorage(STORAGE_KEYS.COLLECTION_ROUTINES);
    return Array.isArray(routines) ? routines : [];
  } catch {
    return [];
  }
}

function setRoutinesCollection(routines) {
  setLocalStorage(STORAGE_KEYS.COLLECTION_ROUTINES, routines);
}

export function getAllRoutines() {
  return getRoutinesCollection();
}

export function getRoutineById(id) {
  const routines = getRoutinesCollection();
  return routines.find((routine) => routine.id === id) || null;
}

export function saveRoutine(input) {
  const routine = createRoutine(input);
  const routines = getRoutinesCollection();
  const existingIndex = routines.findIndex((r) => r.id === routine.id);

  if (existingIndex > -1) {
    routine.updatedAt = Date.now();
    routines[existingIndex] = routine;
  } else {
    routines.push(routine);
  }

  setRoutinesCollection(routines);
  return routine;
}

// TODO
// export function updateRoutine(id, updates) {}

export function deleteRoutine(id) {
  const routines = getRoutinesCollection();
  const filtered = routines.filter((r) => r.id !== id);
  setRoutinesCollection(filtered);
  // TODO: Clean up orphaned sessions via sessionModule when available
}
