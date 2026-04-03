const BASE_URL = 'https://exercisedb.p.rapidapi.com';
const API_KEY = import.meta.env.VITE_EXERCISEDB_API_KEY;

const headers = {
  'x-rapidapi-key': API_KEY,
  'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
};

export async function getAllExercises(limit = 20, offset = 0) {
  const res = await fetch(
    `${BASE_URL}/exercises?limit=${limit}&offset=${offset}`,
    { headers, method: 'GET' }
  );
  if (!res.ok) throw new Error(`ExerciseDB error: ${res.status}`);
  return res.json();
}

export async function getExerciseById(id) {
  const res = await fetch(`${BASE_URL}/exercises/exercise/${id}`, {
    headers,
    method: 'GET',
  });
  if (!res.ok) throw new Error(`ExerciseDB error: ${res.status}`);
  return res.json();
}

export async function getExercisesByBodyPart(bodyPart, limit = 20, offset = 0) {
  const res = await fetch(
    `${BASE_URL}/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=${limit}&offset=${offset}`,
    { headers, method: 'GET' }
  );
  if (!res.ok) throw new Error(`ExerciseDB error: ${res.status}`);
  return res.json();
}

export async function getExercisesByEquipment(
  equipment,
  limit = 20,
  offset = 0
) {
  const res = await fetch(
    `${BASE_URL}/exercises/equipment/${encodeURIComponent(equipment)}?limit=${limit}&offset=${offset}`,
    { headers, method: 'GET' }
  );
  if (!res.ok) throw new Error(`ExerciseDB error: ${res.status}`);
  return res.json();
}

export async function getExercisesByMuscle(muscle, limit = 20, offset = 0) {
  const res = await fetch(
    `${BASE_URL}/exercises/target/${encodeURIComponent(muscle)}?limit=${limit}&offset=${offset}`,
    { headers }
  );
  if (!res.ok) throw new Error(`ExerciseDB error: ${res.status}`);
  return res.json();
}

export async function getBodyPartList() {
  const res = await fetch(`${BASE_URL}/exercises/bodyPartList`, { headers });
  if (!res.ok) throw new Error(`ExerciseDB error: ${res.status}`);
  return res.json();
}

export async function getEquipmentList() {
  const res = await fetch(`${BASE_URL}/exercises/equipmentList`, { headers });
  if (!res.ok) throw new Error(`ExerciseDB error: ${res.status}`);
  return res.json();
}

export async function getTargetList() {
  const res = await fetch(`${BASE_URL}/exercises/targetList`, { headers });
  if (!res.ok) throw new Error(`ExerciseDB error: ${res.status}`);
  return res.json();
}
