import {
  getLocalStorage,
  setLocalStorage,
  STORAGE_KEYS,
} from '../utils/storage.js';
import { createExercise, EXERCISE_SOURCES } from '../entities/exercise.js';
import { DEFAULT_EXERCISES } from '../data/defaultExercises.js';

function getExercisesCollection() {
  try {
    const exercises = getLocalStorage(STORAGE_KEYS.COLLECTION_EXERCISES);
    return Array.isArray(exercises) ? exercises : [];
  } catch {
    return [];
  }
}

function setExercisesCollection(exercises) {
  setLocalStorage(STORAGE_KEYS.COLLECTION_EXERCISES, exercises);
}

export function getAllExercises() {
  return getExercisesCollection();
}

export function getExerciseById(id) {
  const exercises = getExercisesCollection();
  return exercises.find((ex) => ex.id === id) || null;
}

export function getExercisesBySource(source) {
  const exercises = getExercisesCollection();
  return exercises.filter((ex) => ex.source === source);
}

export function searchExercises(query) {
  const exercises = getExercisesCollection();
  const lower = query.toLowerCase();
  return exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(lower) ||
      ex.bodyPart.toLowerCase().includes(lower) ||
      ex.target.toLowerCase().includes(lower) ||
      ex.equipment.toLowerCase().includes(lower)
  );
}

export function saveExercise(input) {
  const exercise = createExercise(input);
  const exercises = getExercisesCollection();

  // Prevent duplicates by matching id
  const existingIndex = exercises.findIndex((ex) => ex.id === exercise.id);
  if (existingIndex > -1) {
    exercise.updatedAt = Date.now();
    exercises[existingIndex] = exercise;
  } else {
    exercises.push(exercise);
  }

  setExercisesCollection(exercises);
  return exercise;
}

export function saveFromApi(apiExercise) {
  return saveExercise({
    id: apiExercise.id,
    source: EXERCISE_SOURCES.API,
    name: apiExercise.name,
    bodyPart: apiExercise.bodyPart,
    target: apiExercise.target,
    equipment: apiExercise.equipment,
    instructions: apiExercise.instructions,
    mediaUrl: apiExercise.gifUrl || '',
  });
}

export function deleteExercise(id) {
  const exercises = getExercisesCollection();
  const filtered = exercises.filter((ex) => ex.id !== id);
  setExercisesCollection(filtered);
}

export function exerciseExists(id) {
  return getExerciseById(id) !== null;
}

export function seedDefaultExercises() {
  if (getLocalStorage(STORAGE_KEYS.SEEDED_V1)) return;
  DEFAULT_EXERCISES.forEach((ex) =>
    saveExercise({ ...ex, source: EXERCISE_SOURCES.CUSTOM })
  );
  setLocalStorage(STORAGE_KEYS.SEEDED_V1, true);
}
