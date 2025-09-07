// src/api.js
const API_BASE = "https://fastapi-backend-p5qb.onrender.com"; // your Render backend URL

export async function fetchResults(query) {
  const res = await fetch(`${API_BASE}/search?query=${query}&country=US&ui_lang=en`);
  return res.json();
}
