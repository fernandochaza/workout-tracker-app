import {
  getLocalStorage,
  setLocalStorage,
  STORAGE_KEYS,
} from '../utils/storage.js';
import { createSession } from '../entities/session.js';

function getSessionsCollection() {
  try {
    const sessions = getLocalStorage(STORAGE_KEYS.COLLECTION_SESSIONS);
    return Array.isArray(sessions) ? sessions : [];
  } catch {
    return [];
  }
}

function setSessionsCollection(sessions) {
  setLocalStorage(STORAGE_KEYS.COLLECTION_SESSIONS, sessions);
}

export function getAllSessions() {
  return getSessionsCollection();
}

export function getSessionById(id) {
  const sessions = getSessionsCollection();
  return sessions.find((session) => session.id === id) || null;
}

export function getSessionsByRoutineId(routineId) {
  const sessions = getSessionsCollection();
  return sessions.filter((session) => session.routineId === routineId);
}

export function getSessionsByDay(dayOfWeek) {
  const sessions = getSessionsCollection();
  return sessions.filter((session) => session.dayOfWeek === dayOfWeek);
}

export function saveSession(input) {
  const session = createSession(input);
  const sessions = getSessionsCollection();
  const existingIndex = sessions.findIndex((s) => s.id === session.id);

  if (existingIndex > -1) {
    session.updatedAt = Date.now();
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }

  setSessionsCollection(sessions);
  return session;
}

export function updateSession(id, updates) {
  const session = getSessionById(id);
  if (!session) return null;

  const updatedSession = createSession({
    ...session,
    ...updates,
    id,
  });

  const sessions = getSessionsCollection();
  const index = sessions.findIndex((s) => s.id === id);
  if (index > -1) {
    sessions[index] = updatedSession;
    setSessionsCollection(sessions);
  }

  return updatedSession;
}

export function deleteSession(id) {
  const sessions = getSessionsCollection();
  const filtered = sessions.filter((s) => s.id !== id);
  setSessionsCollection(filtered);
}

export function deleteSessionsByRoutineId(routineId) {
  const sessions = getSessionsCollection();
  const filtered = sessions.filter((s) => s.routineId !== routineId);
  setSessionsCollection(filtered);
}
