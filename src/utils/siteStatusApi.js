import { get, post } from './apiClient';

const DEFAULT_SITE_STATUS = {
  live: true,
  message: '',
  env: 'production',
  source: 'env',
};

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const raw = value.trim().toLowerCase();
    if (raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on') return true;
    if (raw === 'false' || raw === '0' || raw === 'no' || raw === 'off') return false;
  }
  return Boolean(value);
}

export function normalizeSiteStatus(payload) {
  const data = payload?.data && typeof payload.data === 'object' ? payload.data : payload || {};
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  const env = data.env === 'development' ? 'development' : 'production';
  const source = data.source === 'db' ? 'db' : 'env';

  return {
    ...DEFAULT_SITE_STATUS,
    ...data,
    live: toBoolean(data.live),
    message,
    env,
    source,
  };
}

export async function fetchSiteStatus() {
  const response = await get('/status', {
    auth: false,
    handleUnauthorized: false,
  });

  return normalizeSiteStatus(response);
}

export async function updateSiteStatus(nextStatus) {
  const payload = {
    live: Boolean(nextStatus?.live),
    message: typeof nextStatus?.message === 'string' ? nextStatus.message.trim() : '',
  };

  const response = await post('/status', payload, {
    auth: true,
    handleUnauthorized: true,
  });

  return normalizeSiteStatus(response);
}

export { DEFAULT_SITE_STATUS };
