import React, { useEffect, useState } from 'react';
import { GraduationCap, ArrowRight, FileText } from 'lucide-react';
import { post, setAuthSession } from '../utils/apiClient';
import { toast } from '../utils/toast';

export default function LoginPage({
  onLogin,
  onUserSet,
  onPublicForm,
  sessionMessage = '',
}) {
  const [f, setF] = useState({ login: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [formMode, setFormMode] = useState(false);

  useEffect(() => {
    if (sessionMessage) {
      toast.warning(sessionMessage);
    }
  }, [sessionMessage]);

  const handlePublicForm = () => {
    setFormMode(true);
    if (onPublicForm) onPublicForm();
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
          w: 460, h: 460,
          bg: "radial-gradient(circle,rgba(99,91,255,.38),transparent)",
          top: "-95px", left: "-95px",
          anim: "pulse 7s ease infinite",
        },
        {
          w: 360, h: 360,
          bg: "radial-gradient(circle,rgba(6,201,160,.30),transparent)",
          bottom: "-75px", right: "-75px",
          anim: "pulse 9s ease infinite 2s",
        },
        {
          w: 270, h: 270,
          bg: "radial-gradient(circle,rgba(255,95,160,.24),transparent)",
          top: "42%", right: "16%",
          anim: "float 11s ease infinite",
        },
      ].map((b, i) => (
        <div
          key={i}
          className="lblob"
          style={{
            width: b.w, height: b.h, background: b.bg,
            top: b.top, left: b.left, bottom: b.bottom, right: b.right,
            animation: b.anim,
          }}
        />
      ))}
      <div className="lcard">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30, animation: 'logoF 3s ease-in-out infinite' }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: 'linear-gradient(135deg,#635bff,#06c9a0)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(99,91,255,.5)' }}>
            <GraduationCap size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'Montserrat', fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-.35px' }}>
              SIUT
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.34)', fontWeight: 500 }}>
              Internship Portal
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Montserrat', fontSize: 23, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-.4px' }}>
            Welcome back
          </h1>
          <p style={{ color: 'rgba(255,255,255,.36)', fontSize: 13 }}>
            {formMode
              ? 'Sign in to access the Student Internship Report Form'
              : 'Sign in to your internship management portal'}
          </p>
        </div>

        {formMode && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            background: 'rgba(99,91,255,.14)', border: '1px solid rgba(99,91,255,.3)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
          }}>
            <FileText size={14} color="rgba(99,91,255,.9)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.82)', fontWeight: 500 }}>
              After signing in you will be taken directly to the report form
            </span>
          </div>
        )}

        <input
          type="text"
          placeholder="Login"
          className="linput"
          value={f.login}
          onChange={(ev) => setF((p) => ({ ...p, login: ev.target.value }))}
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
            <div style={{ width: 17, height: 17, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
          )}
          {loading ? 'Signing in…' : formMode ? 'Sign In & Open Form' : 'Sign In to Dashboard'}
        </button>

        {onPublicForm && !formMode && (
          <button
            type="button"
            onClick={handlePublicForm}
            style={{
              width: '100%', marginTop: 12, padding: '13px 16px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,.16)',
              borderRadius: 11,
              color: 'rgba(255,255,255,.68)',
              fontFamily: 'Montserrat', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'all .24s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.34)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.16)'; e.currentTarget.style.color = 'rgba(255,255,255,.68)'; }}
          >
            Fill Student Internship Report Form
            <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
