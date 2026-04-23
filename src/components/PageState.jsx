import React from 'react';

const VARIANT_STYLES = {
  loading: {
    background: 'rgba(99,91,255,.10)',
    borderColor: 'rgba(99,91,255,.28)',
    color: '#4338ca',
  },
  error: {
    background: 'rgba(239,68,68,.10)',
    borderColor: 'rgba(239,68,68,.28)',
    color: '#b91c1c',
  },
  empty: {
    background: 'rgba(15,23,42,.05)',
    borderColor: 'rgba(15,23,42,.12)',
    color: '#334155',
  },
  forbidden: {
    background: 'rgba(245,158,11,.10)',
    borderColor: 'rgba(245,158,11,.30)',
    color: '#92400e',
  },
};

export default function PageState({
  variant = 'empty',
  title,
  message,
  action = null,
  className = '',
}) {
  const palette = VARIANT_STYLES[variant] || VARIANT_STYLES.empty;
  const resolvedTitle = title || (
    variant === 'loading'
      ? 'Loading'
      : variant === 'error'
        ? 'Something went wrong'
        : variant === 'forbidden'
          ? 'Access denied'
          : 'Nothing to show'
  );

  return (
    <div
      className={className}
      role={variant === 'error' || variant === 'forbidden' ? 'alert' : 'status'}
      style={{
        border: `1px solid ${palette.borderColor}`,
        background: palette.background,
        color: palette.color,
        borderRadius: 14,
        padding: '18px 20px',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: message ? 6 : 0 }}>{resolvedTitle}</div>
      {message ? <div style={{ fontSize: 14, lineHeight: 1.5 }}>{message}</div> : null}
      {action ? <div style={{ marginTop: 14 }}>{action}</div> : null}
    </div>
  );
}
