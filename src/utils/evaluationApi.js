import { get } from './apiClient';

const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
  ? import.meta.env.VITE_API_BASE
  : 'https://siut-internships-5e35adaf79be.herokuapp.com';

function buildUrl(path) {
  if (!BASE) return path;
  return `${BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export async function postEvaluation(payload) {
  try {
    const res = await fetch(buildUrl('/internship-evaluations'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        try {
          const j = JSON.parse(text);
          throw new Error(j.message || JSON.stringify(j));
        } catch (e) {
          throw new Error(text || `Request failed with status ${res.status}`);
        }
      }
      throw new Error(text || `Request failed with status ${res.status}`);
    }

    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await res.text();
      throw new Error(`Expected JSON response but received: ${text.slice(0, 200)}`);
    }

    return await res.json();
  } catch (err) {
    throw err;
  }
}

export default { postEvaluation };

export async function getEvaluations() {
  try {
    return await get('/internship-evaluations');
  } catch (err) {
    throw err;
  }
}
