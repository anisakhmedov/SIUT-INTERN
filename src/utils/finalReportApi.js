import { API_URL } from './apiClient';

const DEFAULT_TIMEOUT_MS = 35000;

export async function generateFinalReport(
  payload,
  token,
  endpoint = '/ai/final-report',
  timeoutMs = DEFAULT_TIMEOUT_MS,
) {
  if (!token) {
    throw new Error('Authentication token is missing. Please log in again.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...payload,
        days: Array.isArray(payload?.days) ? payload.days.slice(0, 30) : [],
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = typeof data?.message === 'string'
        ? data.message
        : 'Failed to generate final report';
      throw new Error(message);
    }

    if (typeof data?.report !== 'string' || !data.report.trim()) {
      throw new Error('Backend returned empty report');
    }

    return { report: data.report };
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
