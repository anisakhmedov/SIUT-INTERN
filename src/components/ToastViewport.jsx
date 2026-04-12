import React, { useEffect, useMemo, useState } from 'react';
import { subscribeToasts } from '../utils/toast';

const TYPE_META = {
  success: {
    bg: 'linear-gradient(135deg, rgba(34,197,94,.2), rgba(22,163,74,.14))',
    border: 'rgba(34,197,94,.52)',
    color: '#14532d',
    icon: '✓',
  },
  error: {
    bg: 'linear-gradient(135deg, rgba(239,68,68,.2), rgba(220,38,38,.14))',
    border: 'rgba(239,68,68,.52)',
    color: '#7f1d1d',
    icon: '✕',
  },
  warning: {
    bg: 'linear-gradient(135deg, rgba(245,158,11,.2), rgba(217,119,6,.14))',
    border: 'rgba(245,158,11,.52)',
    color: '#78350f',
    icon: '⚠',
  },
  info: {
    bg: 'linear-gradient(135deg, rgba(59,130,246,.2), rgba(37,99,235,.14))',
    border: 'rgba(59,130,246,.5)',
    color: '#1e3a8a',
    icon: 'i',
  },
};

export default function ToastViewport() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToasts((incomingToast) => {
      setToasts((current) => [...current, incomingToast]);
    });
  }, []);

  useEffect(() => {
    if (!toasts.length) return undefined;

    const timers = toasts.map((item) => setTimeout(() => {
      setToasts((current) => current.filter((toastItem) => toastItem.id !== item.id));
    }, item.duration));

    return () => {
      timers.forEach((timerId) => clearTimeout(timerId));
    };
  }, [toasts]);

  const renderedToasts = useMemo(
    () => toasts.map((item) => {
      const meta = TYPE_META[item.type] || TYPE_META.info;
      return (
        <div
          key={item.id}
          style={{
            width: 'min(340px, calc(100vw - 32px))',
            borderRadius: 14,
            border: `1px solid ${meta.border}`,
            background: meta.bg,
            color: meta.color,
            boxShadow: '0 12px 26px rgba(15,23,42,.14)',
            backdropFilter: 'blur(6px)',
            padding: '10px 12px',
            display: 'grid',
            gridTemplateColumns: '24px 1fr auto',
            alignItems: 'start',
            gap: 10,
            animation: 'toast-slide-in .24s ease-out',
          }}
          role="status"
          aria-live="polite"
        >
          <span
            aria-hidden="true"
            style={{
              width: 24,
              height: 24,
              borderRadius: 999,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              border: `1px solid ${meta.border}`,
              background: 'rgba(255,255,255,.55)',
            }}
          >
            {meta.icon}
          </span>
          <span style={{ fontSize: 13, lineHeight: 1.45, paddingTop: 2 }}>{item.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToasts((current) => current.filter((toastItem) => toastItem.id !== item.id))}
            style={{
              width: 22,
              height: 22,
              borderRadius: 8,
              border: `1px solid ${meta.border}`,
              background: 'rgba(255,255,255,.55)',
              color: meta.color,
              cursor: 'pointer',
              fontSize: 14,
              lineHeight: 1,
              marginTop: 1,
            }}
          >
            ×
          </button>
        </div>
      );
    }),
    [toasts],
  );

  if (!toasts.length) return null;

  return (
    <>
      <style>{`
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateX(26px) scale(.98); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
          pointerEvents: 'none',
        }}
      >
        {renderedToasts.map((node, index) => (
          <div key={toasts[index].id} style={{ pointerEvents: 'auto' }}>
            {node}
          </div>
        ))}
      </div>
    </>
  );
}
