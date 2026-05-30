import React from 'react';
import { AlertCircle, Shield, Sparkles, RefreshCw } from 'lucide-react';

export default function MaintenancePage() {
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
          'radial-gradient(circle at top left, rgba(99,91,255,.22), transparent 30%), radial-gradient(circle at bottom right, rgba(6,201,160,.18), transparent 26%), linear-gradient(140deg, #090b14 0%, #11162a 56%, #0a0d17 100%)',
        color: '#fff',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 980,
          borderRadius: 30,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,.09)',
          background: 'rgba(255,255,255,.05)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 80px rgba(0,0,0,.34)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '-90px auto auto -90px',
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'rgba(99,91,255,.20)',
            filter: 'blur(74px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 'auto -70px -70px auto',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'rgba(6,201,160,.16)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(280px, .85fr)',
          }}
        >
          <div style={{ padding: 'clamp(24px, 5vw, 48px)' }}>
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
              <AlertCircle size={14} />
              Site under development
            </div>

            <div style={{ marginTop: 22 }}>
              <div
                style={{
                  fontSize: 'clamp(52px, 10vw, 104px)',
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: '-.06em',
                  color: 'white',
                }}
              >
                503
              </div>
              <h1
                style={{
                  marginTop: 10,
                  marginBottom: 0,
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  lineHeight: 1.05,
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                The site is temporarily closed for maintenance
              </h1>
              <p
                style={{
                  marginTop: 16,
                  marginBottom: 0,
                  maxWidth: 640,
                  color: 'rgba(255,255,255,.74)',
                  fontSize: 16,
                  lineHeight: 1.7,
                }}
              >
                The portal is in development mode. Regular users cannot open pages until maintenance is turned off.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  ...buttonStyle,
                  background: 'linear-gradient(135deg, #635bff, #06c9a0)',
                  color: '#fff',
                  boxShadow: '0 14px 34px rgba(99,91,255,.24)',
                }}
              >
                <RefreshCw size={16} />
                Check again
              </button>
            </div>
          </div>

          <div
            style={{
              padding: 'clamp(22px, 4vw, 38px)',
              background: 'rgba(255,255,255,.05)',
              borderLeft: '1px solid rgba(255,255,255,.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div
              style={{
                borderRadius: 22,
                border: '1px solid rgba(255,255,255,.08)',
                background: 'rgba(255,255,255,.05)',
                padding: 18,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Shield size={16} color="#06c9a0" />
                <div style={{ fontWeight: 800, fontSize: 14 }}>Access policy</div>
              </div>
              <div style={{ color: 'rgba(255,255,255,.72)', fontSize: 13.5, lineHeight: 1.65 }}>
                The maintenance switch is controlled from the sidebar by privileged accounts. When it is on,
                the rest of the portal stays hidden for everyone else.
              </div>
            </div>

            <div
              style={{
                borderRadius: 22,
                border: '1px solid rgba(255,255,255,.08)',
                background: 'rgba(255,255,255,.05)',
                padding: 18,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Sparkles size={16} color="#635bff" />
                <div style={{ fontWeight: 800, fontSize: 14 }}>What is available</div>
              </div>
              <div style={{ color: 'rgba(255,255,255,.72)', fontSize: 13.5, lineHeight: 1.65 }}>
                Developer user can continue to manage the portal, switch maintenance off, and return
                the site to normal access when the work is finished.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
