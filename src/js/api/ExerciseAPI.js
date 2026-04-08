const BASE_URL = 'https://exercisedb.p.rapidapi.com';
const API_KEY = import.meta.env.VITE_EXERCISEDB_API_KEY;

const headers = {
  'x-rapidapi-key': API_KEY,
  'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
};

async function request(path, { query, responseType = 'json' } = {}) {
  const queryString = query ? `?${new URLSearchParams(query).toString()}` : '';
  const res = await fetch(`${BASE_URL}${path}${queryString}`, {
    headers,
    method: 'GET',
  });

  if (!res.ok) throw new Error(`ExerciseDB error: ${res.status}`);
  if (responseType === 'blob') return res.blob();
  return res.json();
}

export async function getAllExercises(limit = 20, offset = 0) {
  return request('/exercises', {
    query: { limit: String(limit), offset: String(offset) },
  });
}

export async function getExerciseById(id) {
  return request(`/exercises/exercise/${id}`);
}

export async function getExerciseImage(exerciseId, resolution = '720') {
  return request('/image', {
    query: {
      resolution: String(resolution),
      exerciseId: String(exerciseId),
    },
    responseType: 'blob',
  });
}

export async function getExercisesByBodyPart(bodyPart, limit = 20, offset = 0) {
  return request(`/exercises/bodyPart/${bodyPart}`, {
    query: { limit: String(limit), offset: String(offset) },
  });
}

export async function getExercisesByEquipment(
  equipment,
  limit = 20,
  offset = 0
) {
  return request(`/exercises/equipment/${equipment}`, {
    query: { limit: String(limit), offset: String(offset) },
  });
}

export async function getExercisesByMuscle(muscle, limit = 20, offset = 0) {
  return request(`/exercises/target/${muscle}`, {
    query: { limit: String(limit), offset: String(offset) },
  });
}

export async function getExercisesByName(name, limit = 20, offset = 0) {
  return request(`/exercises/name/${name}`, {
    query: { limit: String(limit), offset: String(offset) },
  });
}

export async function getBodyPartList() {
  return request('/exercises/bodyPartList');
}

export async function getEquipmentList() {
  return request('/exercises/equipmentList');
}

export async function getTargetList() {
  return request('/exercises/targetList');
}
