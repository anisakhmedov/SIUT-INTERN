import React from 'react';
import { AlertTriangle, ArrowLeft, Home, RefreshCw, ShieldAlert, ServerCrash, TimerReset } from 'lucide-react';

const ERROR_COPY = {
  404: {
    icon: Home,
    eyebrow: 'Page not found',
    title: 'This page does not exist',
    message: 'The requested section was not found. The link may be outdated, mistyped, or removed.',
    causes: ['The address is wrong', 'The section was deleted or renamed', 'You do not have access to this route'],
  },
  403: {
    icon: ShieldAlert,
    eyebrow: 'Access denied',
    title: 'You cannot open this page',
    message: 'Your account role does not have permission to view this content.',
    causes: ['The current role is restricted', 'You need a different account', 'The page is private to admins or tutors'],
  },
  500: {
    icon: ServerCrash,
    eyebrow: 'Server error',
    title: 'The server failed to process the request',
    message: 'Something unexpected happened on the backend. Try again in a moment.',
    causes: ['An internal exception happened', 'A dependency timed out', 'The API returned an invalid response'],
  },
  502: {
    icon: AlertTriangle,
    eyebrow: 'Bad gateway',
    title: 'The backend gateway returned an invalid response',
    message: 'The app could not get a valid response from the service behind the gateway.',
    causes: ['The upstream service is down', 'A proxy or gateway misfired', 'The API deployment is restarting'],
  },
  503: {
    icon: TimerReset,
    eyebrow: 'Service unavailable',
    title: 'The service is temporarily unavailable',
    message: 'The server is online, but it is currently overloaded, restarting, or under maintenance.',
    causes: ['Maintenance is in progress', 'The service is overloaded', 'A temporary outage is happening'],
  },
  504: {
    icon: RefreshCw,
    eyebrow: 'Gateway timeout',
    title: 'The request took too long',
    message: 'The backend did not respond before the gateway timeout expired.',
    causes: ['The network is slow', 'The upstream service is frozen', 'The request needs to be retried'],
  },
};

function getErrorCopy(status) {
  return ERROR_COPY[status] || ERROR_COPY[500];
}

export default function ErrorPage({
  status = 500,
  title,
  message,
  details,
  causes = [],
  primaryAction,
  secondaryAction,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel = 'Try again',
  secondaryActionLabel = 'Go back',
}) {
  const copy = getErrorCopy(status);
  const Icon = copy.icon;
  const resolvedCauses = causes.length > 0 ? causes : copy.causes;
  const resolvedTitle = title || copy.title;
  const resolvedMessage = message || copy.message;
  const resolvedDetails = details || copy.eyebrow;

  const buttonStyle = {
    border: 'none',
    borderRadius: 14,
    padding: '12px 18px',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'transform .18s ease, box-shadow .18s ease, opacity .18s ease',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        padding: 'clamp(18px, 4vw, 42px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at top left, rgba(99,91,255,.20), transparent 28%), radial-gradient(circle at bottom right, rgba(6,201,160,.16), transparent 24%), linear-gradient(140deg, #090b14 0%, #11162a 56%, #0a0d17 100%)',
        color: '#fff',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 940,
          borderRadius: 30,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,.09)',
          background: 'rgba(255,255,255,.05)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 80px rgba(0,0,0,.32)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 'auto -80px -80px auto',
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'rgba(99,91,255,.22)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '-100px auto auto -80px',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'rgba(6,201,160,.16)',
            filter: 'blur(72px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, .9fr)',
            gap: 0,
          }}
        >
          <div style={{ padding: 'clamp(24px, 5vw, 44px)' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,.08)',
                border: '1px solid rgba(255,255,255,.08)',
                color: 'rgba(255,255,255,.88)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
              }}
            >
              <Icon size={14} />
              {resolvedDetails}
            </div>

            <div style={{ marginTop: 22 }}>
              <div
                style={{
                  fontSize: 'clamp(54px, 10vw, 108px)',
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: '-.06em',
                  color: 'white',
                }}
              >
                {status}
              </div>
              <h1
                style={{
                  marginTop: 10,
                  marginBottom: 0,
                  fontSize: 'clamp(28px, 4.1vw, 48px)',
                  lineHeight: 1.05,
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                {resolvedTitle}
              </h1>
              <p
                style={{
                  marginTop: 16,
                  marginBottom: 0,
                  maxWidth: 620,
                  color: 'rgba(255,255,255,.72)',
                  fontSize: 16,
                  lineHeight: 1.7,
                }}
              >
                {resolvedMessage}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
              {primaryAction || onPrimaryAction ? (
                primaryAction || (
                  <button
                    type="button"
                    onClick={onPrimaryAction}
                    style={{
                      ...buttonStyle,
                      background: 'linear-gradient(135deg, #635bff, #06c9a0)',
                      color: '#fff',
                      boxShadow: '0 14px 34px rgba(99,91,255,.24)',
                    }}
                  >
                    <RefreshCw size={16} />
                    {primaryActionLabel}
                  </button>
                )
              ) : null}

              {secondaryAction || onSecondaryAction ? (
                secondaryAction || (
                  <button
                    type="button"
                    onClick={onSecondaryAction}
                    style={{
                      ...buttonStyle,
                      background: 'rgba(255,255,255,.08)',
                      border: '1px solid rgba(255,255,255,.10)',
                      color: '#fff',
                    }}
                  >
                    <ArrowLeft size={16} />
                    {secondaryActionLabel}
                  </button>
                )
              ) : null}
            </div>
          </div>

          <div
            style={{
              padding: 'clamp(22px, 4vw, 38px)',
              background: 'rgba(255,255,255,.05)',
              borderLeft: '1px solid rgba(255,255,255,.08)',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,.42)',
                marginBottom: 14,
              }}
            >
              Why this happens
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {resolvedCauses.map((cause) => (
                <div
                  key={cause}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,.06)',
                    border: '1px solid rgba(255,255,255,.08)',
                    color: 'rgba(255,255,255,.80)',
                    lineHeight: 1.55,
                    fontSize: 14,
                  }}
                >
                  {cause}
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 18,
                padding: '14px 16px',
                borderRadius: 16,
                background: 'rgba(99,91,255,.12)',
                border: '1px solid rgba(99,91,255,.18)',
                color: 'rgba(255,255,255,.86)',
                lineHeight: 1.55,
                fontSize: 13.5,
              }}
            >
              If the error keeps coming back, refresh the page or contact support with the status code above.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}