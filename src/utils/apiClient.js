import { getAuthTokenFromStorage } from './storageUtils';

export const API_URL = import.meta.env.VITE_API_URL || 'https://siut-internship-35635e91d124.herokuapp.com';

export function buildAuthHeaders(extraHeaders = {}) {
  const token = getAuthTokenFromStorage();
  const headers = { ...extraHeaders };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}
