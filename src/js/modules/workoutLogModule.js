import {
  getLocalStorage,
  setLocalStorage,
  STORAGE_KEYS,
} from '../utils/storage.js';
import { createWorkoutLog } from '../entities/workout-log.js';

function getWorkoutLogsCollection() {
  try {
    const logs = getLocalStorage(STORAGE_KEYS.COLLECTION_WORKOUT_LOGS);
    return Array.isArray(logs) ? logs : [];
  } catch {
    return [];
  }
}

function setWorkoutLogsCollection(logs) {
  setLocalStorage(STORAGE_KEYS.COLLECTION_WORKOUT_LOGS, logs);
}

export function getAllWorkoutLogs() {
  return getWorkoutLogsCollection();
}

export function getWorkoutLogById(id) {
  const logs = getWorkoutLogsCollection();
  return logs.find((log) => log.id === id) || null;
}

export function getWorkoutLogsBySessionId(sessionId) {
  const logs = getWorkoutLogsCollection();
  return logs.filter((log) => log.sessionId === sessionId);
}

export function getWorkoutLogsByRoutineId(routineId) {
  const logs = getWorkoutLogsCollection();
  return logs.filter((log) => log.routineId === routineId);
}

export function getWorkoutLogsForDateRange(startDate, endDate) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const logs = getWorkoutLogsCollection();
  return logs.filter((log) => log.startedAt >= start && log.startedAt <= end);
}

// TODO
// export function getPersonalRecordByExerciseId(exerciseId) {}

export function saveWorkoutLog(input) {
  const log = createWorkoutLog(input);
  const logs = getWorkoutLogsCollection();
  logs.push(log);
  setWorkoutLogsCollection(logs);
  return log;
}

export function deleteWorkoutLog(id) {
  const logs = getWorkoutLogsCollection();
  const filtered = logs.filter((log) => log.id !== id);
  setWorkoutLogsCollection(filtered);
}
