import React, { useState } from 'react';
import {
  GraduationCap,
  AlertCircle,
} from 'lucide-react';
import { saveUserToStorage } from '../utils/storageUtils';

const API_URL = 'https://siut-internship-35635e91d124.herokuapp.com';

export default function LoginPage({ onLogin, onUserSet }) {
  const [f, setF] = useState({ login: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const go = async () => {
    if (!f.login || !f.password) {
      setErr('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const response = await fetch(`${API_URL}/usersInternship`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Login failed');
      const users = await response.json();
      const user = users.find(u => u.login === f.login && u.password === f.password);
      if (user) {
        // Save user to localStorage using utility function
        saveUserToStorage(user);
        if (onUserSet) onUserSet(user);
        onLogin();
      } else {
        setErr('Invalid login credentials.');
      }
    } catch (error) {
      setErr('Connection error. Please try again.');
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
        {err && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 10,
              color: '#f87171',
              fontSize: 12,
            }}
          >
            <AlertCircle size={12} />
            {err}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
            marginBottom: 16,
          }}
        >
          <button
            className="bg"
            onClick={() =>
              setF((p) => ({
                ...p,
                login: 'jdoe',
                password: 'secret123',
              }))
            }
            style={{ fontSize: 12 }}
          >
            Autofill
          </button>
        </div>
        <button className="lbtn" onClick={go}>
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
      </div>
    </div>
  );
}
