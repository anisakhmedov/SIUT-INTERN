import React, { useEffect } from 'react';
import { AlertCircle, Shield, Sparkles, RefreshCw } from 'lucide-react';

export default function MaintenancePage() {
  useEffect(() => {
    document.title = 'Under Maintenance — SIUT';
    const meta = document.querySelector('meta[name="robots"]');
    if (meta) meta.setAttribute('content', 'noindex, nofollow');
    return () => { document.title = 'SIUT — Internship Portal'; };
  }, []);
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
    <div className="maint-root" style={{ color: '#fff', overflow: 'hidden' }}>
      <style>{`
        .maint-root{
          min-height:100vh; width:100%; padding:clamp(12px,4vw,36px);
          display:flex; align-items:center; justify-content:center;
          background: radial-gradient(circle at top left, rgba(99,91,255,.22), transparent 30%), radial-gradient(circle at bottom right, rgba(6,201,160,.18), transparent 26%), linear-gradient(140deg, #090b14 0%, #11162a 56%, #0a0d17 100%);
          font-family: Montserrat, sans-serif;
        }
        .maint-card{ position:relative; width:100%; max-width:677px; border-radius:20px; overflow:hidden; border:1px solid rgba(255,255,255,.09); background:rgba(255,255,255,.04); backdrop-filter:blur(20px); box-shadow:0 20px 60px rgba(0,0,0,.32); }
        .maint-grid{ display:grid; grid-template-columns: 1fr; }
        .maint-left{ padding: clamp(18px,4vw,36px); }
        .maint-right{ padding: clamp(16px,3.5vw,30px); background: rgba(255,255,255,.03); border-top:1px solid rgba(255,255,255,.04); display:flex; flex-direction:column; gap:12px; }
        .maint-badge{ display:inline-flex; align-items:center; gap:10px; padding:8px 14px; border-radius:999px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.06); color:rgba(255,255,255,.9); font-size:12px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; }
        .maint-code{ font-size: clamp(44px, 12vw, 96px); line-height:1; font-weight:900; color: #fff; }
        .maint-title{ margin-top:10px; margin-bottom:0; font-size: clamp(20px, 5vw, 44px); line-height:1.05; font-weight:800; }
        .maint-desc{ margin-top:14px; color:rgba(255,255,255,.78); font-size:15px; line-height:1.6; max-width:100%; }
        .maint-actions{ display:flex; flex-wrap:wrap; gap:12px; margin-top:20px; }
        .maint-btn{ border:none; border-radius:14px; padding:10px 16px; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:8px; transition:transform .18s ease, box-shadow .18s ease, opacity .12s ease; }
        .maint-blob{ position:absolute; border-radius:50%; filter:blur(72px); pointer-events:none; }
        .maint-blob.left{ inset: -90px auto auto -90px; width:240px; height:240px; background: rgba(99,91,255,.20); }
        .maint-blob.right{ inset: auto -70px -70px auto; width:220px; height:220px; background: rgba(6,201,160,.16); }

        /* Desktop layout */
        @media(min-width: 760px){
          .maint-right{ border-left:1px solid rgba(255,255,255,.08); border-top:none; }
          .maint-card{ border-radius:30px; }
          .maint-blob{ display:block; }
        }

        /* Mobile tweaks */
        @media(max-width:759px){
          .maint-card{ border-radius:16px; }
          .maint-left{ padding:18px; }
          .maint-right{ padding:14px; }
          .maint-blob{ display:none; }
          .maint-badge{ font-size:11px; }
          .maint-desc{ font-size:14px; }
        }
      `}</style>

      <div className="maint-card">
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

        <div className="maint-grid" style={{ position: 'relative', zIndex: 1 }}>
          <div className="maint-left">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                color: 'rgba(255,255,255,.88)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
              }}
            >
              <span className="maint-badge">Site under development</span>
            </div>

            <div style={{ marginTop: 15 }}>
              <div className="maint-code">503</div>
              <h1 className="maint-title">The site is temporarily closed for maintenance</h1>
              <p className="maint-desc">
                The portal is in development mode. Regular users cannot open pages until maintenance is turned off.
              </p>
            </div>
            <div className="maint-actions">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="maint-btn"
                style={{ ...buttonStyle, background: 'linear-gradient(135deg, #635bff, #06c9a0)', color: '#fff', boxShadow: '0 14px 34px rgba(99,91,255,.24)' }}
              >
                <RefreshCw size={16} />
                Check again
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="maint-blob left" />
    </div>
  );
}
