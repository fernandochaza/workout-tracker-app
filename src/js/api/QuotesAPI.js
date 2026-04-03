const BASE_URL = 'https://api.api-ninjas.com/v2';
const API_KEY = import.meta.env.VITE_API_NINJAS_KEY;

const headers = {
  'X-Api-Key': API_KEY,
};

export async function getQuotesByCategory(category) {
  const res = await fetch(
    `${BASE_URL}/quotes?categories=${encodeURIComponent(category)}`,
    { headers }
  );
  if (!res.ok) throw new Error(`Quotes API error: ${res.status}`);
  const data = await res.json();
  return data[0] ?? null;
}

export async function getQuoteOfTheDay() {
  const res = await fetch(`${BASE_URL}/quoteoftheday`, { headers });
  if (!res.ok) throw new Error(`Quotes API error: ${res.status}`);
  const data = await res.json();
  return data[0] ?? null;
}
