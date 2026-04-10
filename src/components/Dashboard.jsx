import React, { useState, useEffect } from 'react';
import { API_URL, buildAuthHeaders } from '../utils/apiClient';

export default function Dashboard({ onNewFaculty, onView, search = '' }) {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter faculties based on search term
  const filteredFaculties = faculties.filter(faculty => {
    const searchLower = search.toLowerCase();
    return (
      faculty.name?.toLowerCase().includes(searchLower) ||
      faculty.company?.toLowerCase().includes(searchLower) ||
      faculty.location?.toLowerCase().includes(searchLower) ||
      faculty.plan?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/faculty`, {
        headers: buildAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch faculties');
      const data = await response.json();
      setFaculties(data);
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Error fetching faculties:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFaculty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this internship?')) return;
    try {
      const response = await fetch(`${API_URL}/faculty/${id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete');
      setFaculties(prevFaculties => prevFaculties.filter(f => f._id !== id));
    } catch (err) {
      setError('Failed to delete internship');
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="dw-page">
      <style>{`
        .dw-page {
          min-height: calc(100vh - 64px);
          padding: clamp(20px, 4vw, 48px);
          background:
            radial-gradient(1400px 700px at 5% -10%, rgba(99,91,255,.12), transparent 55%),
            radial-gradient(1000px 600px at 95% 5%, rgba(6,201,160,.12), transparent 65%),
            radial-gradient(800px 500px at 50% 100%, rgba(99,91,255,.08), transparent 70%),
            linear-gradient(180deg, rgba(240,241,247,.8), rgba(255,255,255,1));
          position: relative;
          overflow: hidden;
        }
        .dw-shell {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }
        .dw-head {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 44px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(0,0,0,.06);
        }
        .dw-head-group {
          flex: 1;
        }
        .dw-eyebrow {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--a1, #635bff);
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dw-eyebrow::before {
          content: '';
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
          border-radius: 50%;
        }
        .dw-title {
          font-family: 'Syne', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          font-size: clamp(28px, 5vw, 42px);
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--t1, #0c0e18);
          margin: 0;
          font-weight: 700;
        }
        .dw-sub {
          margin-top: 6px;
          color: var(--t2, #5a6278);
          font-size: 15px;
          font-weight: 400;
        }
        .dw-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 26px;
          border-radius: 13px;
          border: 1px solid rgba(99,91,255,.2);
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
          color: #fff;
          font-family: 'Syne', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all .25s cubic-bezier(.22,1,.36,1);
          box-shadow: 0 12px 36px rgba(99,91,255,.28);
          position: relative;
        }
        .dw-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 48px rgba(99,91,255,.35);
        }
        .dw-btn-primary:active {
          transform: translateY(0);
        }
        .dw-alert {
          border-radius: 14px;
          border: 1px solid rgba(220,38,38,.2);
          background: linear-gradient(135deg, rgba(254,226,226,.6), rgba(254,242,242,.8));
          color: #7f1d1d;
          padding: 14px 16px;
          margin-bottom: 24px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
          backdrop-filter: blur(10px);
        }
        .dw-loading, .dw-empty {
          background: rgba(255,255,255,.65);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 20px;
          padding: 64px 32px;
          text-align: center;
          color: var(--t2, #5a6278);
          font-size: 16px;
          box-shadow: 0 16px 48px rgba(99,91,255,.12);
          backdrop-filter: blur(20px);
        }
        .dw-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        @media (min-width: 640px) { .dw-list { grid-template-columns: repeat(2, 1fr); gap: 28px; } }
        @media (min-width: 1024px) { .dw-list { grid-template-columns: repeat(3, 1fr); gap: 28px; } }
        .dw-list li {
          margin: 0;
          padding: 0;
        }
        .dw-card {
          display: flex;
          flex-direction: column;
          padding: 0;
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(99,91,255,.08);
          backdrop-filter: blur(20px);
          cursor: pointer;
          transition: all .3s cubic-bezier(.22,1,.36,1);
          overflow: hidden;
          position: relative;
        }
        .dw-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--a1, #635bff), var(--a2, #06c9a0));
          opacity: 0;
          transition: opacity .3s ease;
        }
        .dw-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 56px rgba(99,91,255,.16);
          border-color: rgba(99,91,255,.15);
          background: rgba(255,255,255,.88);
        }
        .dw-card:hover::before {
          opacity: 1;
        }
        .dw-card:hover .dw-card-open {
          opacity: 1;
          color: var(--a1, #635bff);
          gap: 12px;
        }
        .dw-card-click {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 28px;
          text-align: left;
          border: none;
          background: none;
          cursor: pointer;
          font: inherit;
          color: inherit;
          gap: 12px;
        }
        .dw-card-body { flex: 1; min-width: 0; }
        .dw-card-title {
          font-family: 'Syne', system-ui, sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--t1, #0c0e18);
          margin: 0 0 8px 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .dw-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 13px;
          color: var(--t2, #5a6278);
        }
        .dw-card-meta-divider {
          width: 1px;
          height: 14px;
          background: rgba(0,0,0,.1);
        }
        .dw-card-row {
          font-size: 13px;
          color: var(--t2, #5a6278);
          margin: 0 0 4px 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .dw-card-row:last-of-type { margin-bottom: 12px; }
        .dw-card-plan {
          font-size: 12px;
          color: var(--t3, #9ba3bb);
          margin: 12px 0 0 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .dw-card-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 800;
          padding: 5px 11px;
          margin-bottom: 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: .05em;
          white-space: nowrap;
        }
        .dw-card-badge::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          display: inline-block;
        }
        .dw-card-badge--active {
          background: rgba(6,201,160,.15);
          color: #0d7a5c;
        }
        .dw-card-badge--active::before {
          background: #06c9a0;
        }
        .dw-card-badge--pending {
          background: rgba(245,166,35,.15);
          color: #92400e;
        }
        .dw-card-badge--pending::before {
          background: #f5a623;
        }
        .dw-card-badge--completed {
          background: rgba(99,91,255,.15);
          color: #4c1d95;
        }
        .dw-card-badge--completed::before {
          background: #635bff;
        }
        .dw-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 28px;
          border-top: 1px solid rgba(0,0,0,.06);
          background: linear-gradient(135deg, rgba(99,91,255,.02), rgba(6,201,160,.02));
        }
        .dw-card-open {
          font-size: 12px;
          font-weight: 700;
          color: var(--t2, #5a6278);
          opacity: .75;
          transition: all .25s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: .04em;
        }
        .dw-card-actions { flex-shrink: 0; }
        .dw-btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1.5px solid rgba(220,38,38,.2);
          background: rgba(254,242,242,.8);
          color: #c41e1e;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background .2s ease, border-color .2s ease, color .2s ease;
          font-weight: 300;
        }
        .dw-btn-icon:hover {
          background: rgba(239,68,68,.15);
          border-color: rgba(220,38,38,.4);
        }
        @media (max-width: 768px) {
          .dw-list { grid-template-columns: 1fr; }
          .dw-title { font-size: 32px; }
          .dw-head { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="dw-shell">
        <div className="dw-head">
          <div className="dw-head-group">
            <div className="dw-eyebrow">Active Programs</div>
            <h1 className="dw-title">Internships</h1>
            <p className="dw-sub">Manage and open internship records</p>
          </div>
          <button type="button" className="dw-btn-primary" onClick={onNewFaculty}>
            <span aria-hidden="true">+</span>
            New Internship
          </button>
        </div>

        {error && (
          <div className="dw-alert" role="alert">
            <span aria-hidden="true">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="dw-loading">✦ Loading internships…</div>
        ) : faculties.length === 0 ? (
          <div className="dw-empty">✨ No internships yet. Create one to get started.</div>
        ) : filteredFaculties.length === 0 ? (
          <div className="dw-empty">🔍 No internships match your search.</div>
        ) : (
          <ul className="dw-list" aria-label="Internship list">
            {filteredFaculties.map((faculty) => {
              const statusClass = faculty.status === 'Active' ? 'dw-card-badge--active' : faculty.status === 'Pending' ? 'dw-card-badge--pending' : 'dw-card-badge--completed';
              return (
                <li key={faculty._id}>
                  <article className="dw-card">
                    <button
                      type="button"
                      className="dw-card-click"
                      onClick={() => onView(faculty._id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onView(faculty._id);
                        }
                      }}
                    >
                      <div className="dw-card-body">
                        <h3 className="dw-card-title">{faculty.name}</h3>
                        {faculty.status && (
                          <span className={`dw-card-badge ${statusClass}`}>{faculty.status}</span>
                        )}
                        <div className="dw-card-meta">
                          <span>{faculty.company}</span>
                          <div className="dw-card-meta-divider"></div>
                          <span>{faculty.location}</span>
                          {faculty.duration && (
                            <>
                              <div className="dw-card-meta-divider"></div>
                              <span>{faculty.duration}</span>
                            </>
                          )}
                        </div>
                        {faculty.plan && (
                          <p className="dw-card-plan">{faculty.plan}</p>
                        )}
                      </div>
                    </button>
                    <div className="dw-card-footer">
                      <span className="dw-card-open">View Details</span>
                      <button
                        type="button"
                        className="dw-btn-icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFaculty(faculty._id);
                        }}
                        title="Delete internship"
                        aria-label="Delete internship"
                      >
                        ×
                      </button>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
