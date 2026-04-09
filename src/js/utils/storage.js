export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const STORAGE_KEYS = {
  COLLECTION_ROUTINES: 'app_routines',
  COLLECTION_SESSIONS: 'app_sessions',
  COLLECTION_COMPLETED_SESSIONS: 'app_completed_sessions',
  COLLECTION_CUSTOM_EXERCISES: 'app_custom_exercises',
};
