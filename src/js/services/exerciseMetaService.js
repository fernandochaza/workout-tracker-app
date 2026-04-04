import {
  getBodyPartList,
  getEquipmentList,
  getTargetList,
} from '../api/ExerciseAPI.js';
import { getLocalStorage, setLocalStorage } from '../utils/storage.js';

const KEYS = {
  bodyParts: 'meta_bodyParts',
  equipment: 'meta_equipment',
  targets: 'meta_targets',
};

export async function initExerciseMeta() {
  if (getLocalStorage(KEYS.bodyParts)) return;

  const [bodyParts, equipment, targets] = await Promise.all([
    getBodyPartList(),
    getEquipmentList(),
    getTargetList(),
  ]);

  setLocalStorage(KEYS.bodyParts, bodyParts);
  setLocalStorage(KEYS.equipment, equipment);
  setLocalStorage(KEYS.targets, targets);
}

export function getBodyParts() {
  return getLocalStorage(KEYS.bodyParts) || [];
}

export function getEquipment() {
  return getLocalStorage(KEYS.equipment) || [];
}

export function getTargets() {
  return getLocalStorage(KEYS.targets) || [];
}
