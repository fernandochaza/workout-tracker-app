export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const STORAGE_KEYS = {
  COLLECTION_ROUTINES: 'app_routines',
  COLLECTION_SESSIONS: 'app_sessions',
  COLLECTION_WORKOUT_LOGS: 'app_workout_logs',
  COLLECTION_EXERCISES: 'app_exercises',
  SEEDED_V1: 'app_seeded_v1',
};
