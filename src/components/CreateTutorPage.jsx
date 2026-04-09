import React, { useState } from 'react';
import { UserPlus, ShieldCheck } from 'lucide-react';

const DEFAULT_API_URL = 'https://siut-internship-35635e91d124.herokuapp.com';

export default function CreateTutorPage({ apiUrl = DEFAULT_API_URL }) {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    login: '',
    password: '',
    role: 'Tutor',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${apiUrl}/usersInternship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      setSuccess('User was created successfully.');
      setFormData({
        name: '',
        surname: '',
        login: '',
        password: '',
        role: 'Tutor',
      });
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ctp-page">
      <style>{`
        .ctp-page {
          min-height: calc(100vh - 64px);
          padding: clamp(16px, 3vw, 44px);
          background:
            radial-gradient(1000px 500px at 5% 0%, rgba(8, 145, 178, .12), transparent 60%),
            radial-gradient(850px 450px at 100% 10%, rgba(22, 163, 74, .10), transparent 60%),
            linear-gradient(180deg, rgba(240, 249, 255, .86), rgba(255, 255, 255, 1));
        }
        .ctp-shell {
          max-width: 820px;
          margin: 0 auto;
        }
        .ctp-card {
          background: rgba(255, 255, 255, .95);
          border: 1px solid rgba(0, 0, 0, .08);
          border-radius: 20px;
          padding: clamp(20px, 2.5vw, 30px);
          box-shadow: 0 18px 50px rgba(14, 116, 144, .12);
          backdrop-filter: blur(12px);
        }
        .ctp-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }
        .ctp-title {
          margin: 0;
          font-family: 'Syne', system-ui, sans-serif;
          font-size: clamp(22px, 4vw, 30px);
          color: #0f172a;
          letter-spacing: -.01em;
        }
        .ctp-sub {
          margin: 8px 0 0;
          font-size: 14px;
          color: #475569;
          line-height: 1.55;
        }
        .ctp-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(8, 145, 178, .10);
          border: 1px solid rgba(8, 145, 178, .20);
          color: #0e7490;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }
        .ctp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .ctp-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ctp-field--full {
          grid-column: 1 / -1;
        }
        .ctp-label {
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: .04em;
          text-transform: uppercase;
        }
        .ctp-input {
          width: 100%;
          border-radius: 12px;
          border: 1.5px solid rgba(15, 23, 42, .12);
          background: rgba(255, 255, 255, .90);
          padding: 12px 14px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
        }
        .ctp-input:focus {
          border-color: rgba(8, 145, 178, .55);
          box-shadow: 0 0 0 4px rgba(8, 145, 178, .12);
          background: #fff;
        }
        .ctp-actions {
          margin-top: 18px;
          display: flex;
          justify-content: flex-end;
        }
        .ctp-btn {
          border: 1px solid rgba(8, 145, 178, .20);
          background: linear-gradient(135deg, #0891b2, #16a34a);
          color: #fff;
          border-radius: 12px;
          padding: 11px 16px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .ctp-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 30px rgba(8, 145, 178, .25);
        }
        .ctp-btn:disabled {
          opacity: .6;
          cursor: not-allowed;
        }
        .ctp-alert {
          margin-bottom: 14px;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13px;
          border: 1px solid;
        }
        .ctp-alert--error {
          color: #991b1b;
          border-color: rgba(220, 38, 38, .24);
          background: rgba(220, 38, 38, .08);
        }
        .ctp-alert--ok {
          color: #166534;
          border-color: rgba(22, 163, 74, .24);
          background: rgba(22, 163, 74, .08);
        }
        @media (max-width: 720px) {
          .ctp-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="ctp-shell">
        <div className="ctp-card">
          <div className="ctp-head">
            <div>
              <h1 className="ctp-title">Create Staff Account</h1>
              <p className="ctp-sub">
                Add a new system user for internship workflows. Admins can create Tutor, Admin, Rector, and Professor accounts.
              </p>
            </div>
            <span className="ctp-badge">
              <ShieldCheck size={14} /> Admin only
            </span>
          </div>

          {error && <div className="ctp-alert ctp-alert--error">{error}</div>}
          {success && <div className="ctp-alert ctp-alert--ok">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="ctp-grid">
              <label className="ctp-field">
                <span className="ctp-label">Name</span>
                <input className="ctp-input" name="name" value={formData.name} onChange={handleChange} required />
              </label>

              <label className="ctp-field">
                <span className="ctp-label">Surname</span>
                <input className="ctp-input" name="surname" value={formData.surname} onChange={handleChange} required />
              </label>

              <label className="ctp-field">
                <span className="ctp-label">Login</span>
                <input className="ctp-input" name="login" value={formData.login} onChange={handleChange} required />
              </label>

              <label className="ctp-field">
                <span className="ctp-label">Password</span>
                <input className="ctp-input" type="password" name="password" value={formData.password} onChange={handleChange} required />
              </label>

              <label className="ctp-field ctp-field--full">
                <span className="ctp-label">Select Area</span>
                <select className="ctp-input" name="role" value={formData.role} onChange={handleChange} required>
                  <option value="Tutor">Tutor</option>
                  <option value="Admin">Admin</option>
                  <option value="Rector">Rector</option>
                  <option value="Professor">Professor</option>
                </select>
              </label>
            </div>

            <div className="ctp-actions">
              <button className="ctp-btn" type="submit" disabled={submitting}>
                <UserPlus size={15} /> {submitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
