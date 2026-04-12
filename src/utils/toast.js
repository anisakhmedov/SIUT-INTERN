const listeners = new Set();

const DEFAULT_DURATION = 4200;

function emitToast(toast) {
  listeners.forEach((listener) => listener(toast));
}

export function subscribeToasts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function toast(message, options = {}) {
  const text = String(message || '').trim();
  if (!text) return null;

  const payload = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    message: text,
    type: options.type || 'info',
    duration: Number.isFinite(options.duration) ? Math.max(1000, options.duration) : DEFAULT_DURATION,
  };

  emitToast(payload);
  return payload.id;
}

toast.success = (message, options = {}) => toast(message, { ...options, type: 'success' });
toast.error = (message, options = {}) => toast(message, { ...options, type: 'error' });
toast.warning = (message, options = {}) => toast(message, { ...options, type: 'warning' });
toast.info = (message, options = {}) => toast(message, { ...options, type: 'info' });
