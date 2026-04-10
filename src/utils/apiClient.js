import { getAuthTokenFromStorage } from './storageUtils';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7777';

export function buildAuthHeaders(extraHeaders = {}) {
  const token = getAuthTokenFromStorage();
  const headers = { ...extraHeaders };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}
