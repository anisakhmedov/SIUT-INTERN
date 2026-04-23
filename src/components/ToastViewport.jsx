import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const timersRef = useRef(new Map());

  useEffect(() => {
    return subscribeToasts((incomingToast) => {
      setToasts((current) => {
        const next = [...current, incomingToast];
        return next.slice(-5);
      });
    });
  }, []);

  useEffect(() => {
    toasts.forEach((item) => {
      if (timersRef.current.has(item.id)) return;

      const timerId = setTimeout(() => {
        setToasts((current) => current.filter((toastItem) => toastItem.id !== item.id));
        timersRef.current.delete(item.id);
      }, item.duration);

      timersRef.current.set(item.id, timerId);
    });

    const ids = new Set(toasts.map((item) => item.id));
    Array.from(timersRef.current.keys()).forEach((id) => {
      if (ids.has(id)) return;
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    });

    return undefined;
  }, [toasts]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timerId) => clearTimeout(timerId));
      timers.clear();
    };
  }, []);

  const removeToast = (id) => {
    const timerId = timersRef.current.get(id);
    if (timerId) {
      clearTimeout(timerId);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((item) => item.id !== id));
  };

  const renderedToasts = useMemo(
    () => toasts.map((item) => {
      const meta = TYPE_META[item.type] || TYPE_META.info;
      return (
        <div
          key={item.id}
          className="tv-toast"
          style={{ borderColor: meta.border, background: meta.bg, color: meta.color }}
          role="status"
          aria-live="polite"
        >
          <span aria-hidden="true" className="tv-icon" style={{ borderColor: meta.border }}>
            {meta.icon}
          </span>
          <span className="tv-message">{item.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => removeToast(item.id)}
            className="tv-close"
            style={{ borderColor: meta.border, color: meta.color }}
          >
            ×
          </button>
          <div className="tv-progress" style={{ animationDuration: `${item.duration}ms` }}></div>
        </div>
      );
    }),
    [toasts],
  );

  if (!toasts.length || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <style>{`
        .tv-root {
          position: fixed;
          right: 16px;
          bottom: 16px;
          z-index: 1500;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
          pointer-events: none;
        }
        .tv-item { pointer-events: auto; }
        .tv-toast {
          position: relative;
          overflow: hidden;
          width: min(360px, calc(100vw - 24px));
          border-radius: 14px;
          border: 1px solid;
          box-shadow: 0 12px 26px rgba(15,23,42,.14);
          backdrop-filter: blur(6px);
          padding: 12px 12px;
          display: grid;
          grid-template-columns: 24px 1fr auto;
          align-items: start;
          gap: 10px;
          animation: tv-slide-in .24s ease-out;
        }
        .tv-icon {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          border: 1px solid;
          background: rgba(255,255,255,.55);
        }
        .tv-message {
          font-size: 13px;
          line-height: 1.45;
          padding-top: 2px;
          color: #0f172a;
          text-wrap: pretty;
        }
        .tv-close {
          width: 30px;
          height: 30px;
          border-radius: 10px;
          border: 1px solid;
          background: rgba(255,255,255,.55);
          cursor: pointer;
          font-size: 20px;
          font-weight: 500;
          line-height: 1;
          margin-top: -2px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform .16s ease, background-color .16s ease;
          padding: 0;
        }
        .tv-close:hover {
          transform: scale(1.04);
          background: rgba(255,255,255,.8);
        }
        .tv-progress {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 3px;
          background: linear-gradient(90deg, rgba(99,91,255,.9), rgba(6,201,160,.9));
          transform-origin: left;
          animation-name: tv-progress;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        @keyframes tv-slide-in {
          from { opacity: 0; transform: translateX(26px) scale(.98); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes tv-progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        @media (max-width: 600px) {
          .tv-root {
            right: 12px;
            left: 12px;
            bottom: 12px;
            align-items: stretch;
          }
          .tv-toast {
            width: 100%;
          }
        }
      `}</style>
      <div className="tv-root">
        {renderedToasts.map((node, index) => (
          <div key={toasts[index].id} className="tv-item">
            {node}
          </div>
        ))}
      </div>
    </>,
    document.body,
  );
}
