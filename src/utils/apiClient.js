import {
  clearUserFromStorage,
  getAuthTokenFromStorage,
  getRefreshTokenFromStorage,
  getUserFromStorage,
  saveAuthTokenToStorage,
  saveRefreshTokenToStorage,
  saveUserToStorage,
} from './storageUtils';

export const API_URL = import.meta.env.VITE_API_URL || 'https://siut-36acde43fdb2.herokuapp.com';

const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';

function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function getStoredAuthState() {
  return {
    token: getAuthTokenFromStorage(),
    user: getUserFromStorage(),
  };
}

export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

export function isTokenExpiringSoon(token, thresholdMinutes = 5) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  const remainingMs = payload.exp * 1000 - Date.now();
  return remainingMs <= thresholdMinutes * 60 * 1000;
}

export function isAuthenticated() {
  const token = getAuthTokenFromStorage();
  return !!token && !isTokenExpired(token);
}

let _isRefreshing = false;
let _pendingRequests = [];

async function tryRefreshToken() {
  const refreshToken = getRefreshTokenFromStorage();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_URL}/usersInternship/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (!data?.token) return null;
    saveAuthTokenToStorage(data.token);
    if (data.refreshToken) saveRefreshTokenToStorage(data.refreshToken);
    return data.token;
  } catch {
    return null;
  }
}

export function logout(reason = 'logout') {
  const refreshToken = getRefreshTokenFromStorage();
  if (refreshToken) {
    fetch(`${API_URL}/usersInternship/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }
  clearUserFromStorage();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT, { detail: { reason } }));
  }
}

export function handleStoredTokenExpiry() {
  const token = getAuthTokenFromStorage();
  if (token && isTokenExpired(token)) {
    logout('expired');
    return false;
  }
  return !!token;
}

export function buildAuthHeaders(extraHeaders = {}) {
  const token = getAuthTokenFromStorage();
  const headers = { ...extraHeaders };

  if (token && !isTokenExpired(token)) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function getErrorMessageFromPayload(payload, status) {
  if (payload?.message) return payload.message;

  if (status === 401) return 'Session expired. Please login again.';
  if (status === 403) return "You don't have permission to perform this action";
  if (status === 500) return 'Server error. Please try again.';

  return 'Request failed';
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function prepareHeaders(headers = {}, body) {
  const finalHeaders = { ...headers };
  if (!(body instanceof FormData) && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  return finalHeaders;
}

export async function request(path, options = {}) {
  const {
    auth = true,
    handleUnauthorized = true,
    body,
    headers,
    _isRetry = false,
    ...rest
  } = options;

  const finalHeaders = prepareHeaders(headers, body);
  const token = getAuthTokenFromStorage();
  if (auth && token && !isTokenExpired(token)) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body,
    credentials: 'include',
  });

  const payload = await parseResponse(response);

  if (response.status === 401 && handleUnauthorized && !_isRetry) {
    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _pendingRequests.push({ resolve, reject, path, options });
      });
    }

    _isRefreshing = true;
    const newToken = await tryRefreshToken();
    _isRefreshing = false;

    if (newToken) {
      const pending = _pendingRequests.splice(0);
      pending.forEach(({ resolve, reject, path: p, options: o }) => {
        request(p, { ...o, _isRetry: true }).then(resolve).catch(reject);
      });
      return request(path, { ...options, _isRetry: true });
    }

    _pendingRequests.splice(0).forEach(({ reject }) => reject(new Error('Session expired')));
    logout('expired');
    throw Object.assign(new Error('Session expired. Please login again.'), {
      status: 401,
      payload,
    });
  }

  if (!response.ok) {
    throw Object.assign(new Error(getErrorMessageFromPayload(payload, response.status)), {
      status: response.status,
      payload,
    });
  }

  return payload;
}

export function get(path, options = {}) {
  return request(path, { ...options, method: 'GET' });
}

export function post(path, body, options = {}) {
  const isFormData = body instanceof FormData;
  return request(path, {
    ...options,
    method: 'POST',
    body: isFormData ? body : JSON.stringify(body),
    headers: options.headers,
  });
}

export function patch(path, body, options = {}) {
  const isFormData = body instanceof FormData;
  return request(path, {
    ...options,
    method: 'PATCH',
    body: isFormData ? body : JSON.stringify(body),
    headers: options.headers,
  });
}

export function del(path, options = {}) {
  return request(path, { ...options, method: 'DELETE' });
}

export function setAuthSession({ token, refreshToken, user }) {
  if (token) saveAuthTokenToStorage(token);
  if (refreshToken) saveRefreshTokenToStorage(refreshToken);
  if (user) saveUserToStorage(user);
}

export async function getCurrentUser() {
  return get('/usersInternship/me');
}

export function onAuthSessionExpired(handler) {
  if (typeof window === 'undefined') return () => {};

  const listener = (event) => handler(event);
  window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, listener);
  return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, listener);
}
