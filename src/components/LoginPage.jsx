import React, { useEffect, useState } from 'react';
import { ArrowRight, Building2, GraduationCap, Sparkles } from 'lucide-react';
import { post, setAuthSession } from '../utils/apiClient';
import { toast } from '../utils/toast';

export default function LoginPage({
  onLogin,
  onUserSet,
  sessionMessage = '',
  onOpenPublicEvaluation,
  onOpenCompanyEvaluation,
}) {
  const [f, setF] = useState({ login: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionMessage) {
      toast.warning(sessionMessage);
    }
  }, [sessionMessage]);

  const publicButtonBase = {
    width: '100%',
    minHeight: 66,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    padding: '14px 16px',
    borderRadius: 16,
    cursor: 'pointer',
    background:
      'linear-gradient(135deg, rgba(255,255,255,.96), rgba(255,255,255,.84))',
    color: '#0c0e18',
    boxShadow: '0 12px 30px rgba(2,6,23,.12)',
    transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease',
    textAlign: 'left',
  };

  const publicButtonLeft = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  };

  const publicButtonIcon = {
    width: 40,
    height: 40,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.45)',
  };

  const publicButtonTitle = {
    fontSize: 14,
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: '-.2px',
    color: '#0c0e18',
  };

  const publicButtonSubtitle = {
    marginTop: 3,
    fontSize: 12,
    color: 'rgba(12,14,24,.62)',
    lineHeight: 1.45,
  };

  const publicButtonArrow = {
    width: 32,
    height: 32,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: 'rgba(12,14,24,.05)',
    color: 'rgba(12,14,24,.72)',
  };

  const go = async () => {
    if (!f.login || !f.password) {
      toast.warning('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const payload = await post('/usersInternship/login', { login: f.login, password: f.password }, { auth: false, handleUnauthorized: false });

      const user = payload?.user;
      const token = payload?.token;

      if (!user || !token) {
        throw new Error('Authentication response is missing user or token.');
      }

      setAuthSession({ token, user });
      if (onUserSet) onUserSet(user);
      onLogin();
    } catch (error) {
      if (error?.status === 401) {
        toast.error('Invalid login credentials.');
      } else {
        toast.error(error.message || 'Connection error. Please try again.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lw">
      {[
        {
          w: 460,
          h: 460,
          bg: "radial-gradient(circle,rgba(99,91,255,.38),transparent)",
          top: "-95px",
          left: "-95px",
          anim: "pulse 7s ease infinite",
        },
        {
          w: 360,
          h: 360,
          bg: "radial-gradient(circle,rgba(6,201,160,.30),transparent)",
          bottom: "-75px",
          right: "-75px",
          anim: "pulse 9s ease infinite 2s",
        },
        {
          w: 270,
          h: 270,
          bg: "radial-gradient(circle,rgba(255,95,160,.24),transparent)",
          top: "42%",
          right: "16%",
          anim: "float 11s ease infinite",
        },
      ].map((b, i) => (
        <div
          key={i}
          className="lblob"
          style={{
            width: b.w,
            height: b.h,
            background: b.bg,
            top: b.top,
            left: b.left,
            bottom: b.bottom,
            right: b.right,
            animation: b.anim,
          }}
        />
      ))}
      <div className="lcard">
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 30,
            animation: 'logoF 3s ease-in-out infinite',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 13,
              background: 'linear-gradient(135deg,#635bff,#06c9a0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 22px rgba(99,91,255,.5)',
            }}
          >
            <GraduationCap size={24} color="#fff" />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'Syne',
                fontSize: 18,
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-.35px',
              }}
            >
              InternTrack
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,.34)',
                fontWeight: 500,
              }}
            >
              Institute of Technology · Portal
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontFamily: 'Syne',
              fontSize: 23,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 6,
              letterSpacing: '-.4px',
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: 'rgba(255,255,255,.36)', fontSize: 13 }}>
            Sign in to your internship management portal
          </p>
        </div>
        <input
          type="text"
          placeholder="Login"
          className="linput"
          value={f.login}
          onChange={(ev) =>
            setF((p) => ({ ...p, login: ev.target.value }))
          }
          onKeyDown={(ev) => ev.key === 'Enter' && go()}
        />
        <input
          type="password"
          placeholder="Password"
          className="linput"
          value={f.password}
          onChange={(ev) => setF((p) => ({ ...p, password: ev.target.value }))}
          onKeyDown={(ev) => ev.key === 'Enter' && go()}
        />
          <button className="lbtn" onClick={go} type="button">
          {loading && (
            <div
              style={{
                width: 17,
                height: 17,
                border: '2px solid rgba(255,255,255,.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin .7s linear infinite',
              }}
            ></div>
          )}
          {loading ? 'Signing in…' : 'Sign In to Dashboard'}
        </button>
        {/* <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
          <button
            className="lpublic"
            onClick={() => {
              if (onOpenPublicEvaluation) onOpenPublicEvaluation();
            }}
            type="button"
            style={{
              ...publicButtonBase,
              background:
                'linear-gradient(135deg, rgba(99,91,255,.18), rgba(255,255,255,.96))',
              borderColor: 'rgba(99,91,255,.18)',
            }}
          >
            <span style={publicButtonLeft}>
              <span
                style={{
                  ...publicButtonIcon,
                  background: 'linear-gradient(135deg, #635bff, #8a84ff)',
                  color: '#fff',
                }}
              >
                <GraduationCap size={18} />
              </span>
              <span style={{ display: 'grid', gap: 1 }}>
                <span style={publicButtonTitle}>Open for students</span>
                <span style={publicButtonSubtitle}>Student internship evaluation form</span>
              </span>
            </span>
            <span style={publicButtonArrow}>
              <ArrowRight size={16} />
            </span>
          </button>
          <button
            className="lpublic"
            onClick={() => {
              if (onOpenCompanyEvaluation) onOpenCompanyEvaluation();
            }}
            type="button"
            style={{
              ...publicButtonBase,
              background:
                'linear-gradient(135deg, rgba(6,201,160,.18), rgba(255,255,255,.96))',
              borderColor: 'rgba(6,201,160,.18)',
            }}
          >
            <span style={publicButtonLeft}>
              <span
                style={{
                  ...publicButtonIcon,
                  background: 'linear-gradient(135deg, #06c9a0, #48e1bc)',
                  color: '#fff',
                }}
              >
                <Building2 size={18} />
              </span>
              <span style={{ display: 'grid', gap: 1 }}>
                <span style={publicButtonTitle}>Open company evaluation form</span>
                <span style={publicButtonSubtitle}>Supervisor submission and review form</span>
              </span>
            </span>
            <span style={publicButtonArrow}>
              <ArrowRight size={16} />
            </span>
          </button>
        </div> */}
      </div>
    </div>
  );
}