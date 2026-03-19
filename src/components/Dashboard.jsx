import React, { useState, useEffect } from 'react';

const API_URL = 'https://siut-internship-35635e91d124.herokuapp.com';

export default function Dashboard({ onNewFaculty, onView }) {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/faculty`);
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
      const response = await fetch(`${API_URL}/faculty/${id}`, { method: 'DELETE' });
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
          padding: clamp(16px, 3vw, 44px);
          background:
            radial-gradient(1200px 600px at 10% 0%, rgba(99,91,255,.10), transparent 60%),
            radial-gradient(900px 520px at 90% 10%, rgba(6,201,160,.10), transparent 55%),
            linear-gradient(180deg, rgba(240,241,247,.65), rgba(255,255,255,1));
        }
        .dw-shell { width: 100%; max-width: 960px; margin: 0 auto; }
        .dw-head {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
        }
        .dw-title {
          font-family: 'Syne', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          font-size: 28px;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--t1, #0c0e18);
          margin: 0;
        }
        .dw-sub { margin-top: 4px; color: var(--t2, #5a6278); font-size: 14px; }
        .dw-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 12px;
          border: 1px solid rgba(99,91,255,.18);
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
          color: #fff;
          font-family: 'Epilogue', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: transform .15s ease, box-shadow .2s ease;
          box-shadow: 0 10px 30px rgba(99,91,255,.25);
        }
        .dw-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 16px 44px rgba(99,91,255,.30); }
        .dw-alert {
          border-radius: 14px;
          border: 1px solid rgba(255,0,0,.18);
          background: rgba(255,0,0,.05);
          color: #8a1f1f;
          padding: 14px 16px;
          margin-bottom: 20px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .dw-loading, .dw-empty {
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 18px;
          padding: 48px 24px;
          text-align: center;
          color: var(--t2, #5a6278);
          font-size: 15px;
          box-shadow: 0 14px 44px rgba(99,91,255,.10);
        }
        .dw-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) { .dw-list { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1000px) { .dw-list { grid-template-columns: repeat(3, 1fr); } }
        .dw-card {
          display: flex;
          flex-direction: column;
          padding: 0;
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 18px;
          box-shadow: 0 14px 44px rgba(99,91,255,.10);
          backdrop-filter: blur(18px);
          cursor: pointer;
          transition: transform .15s ease, box-shadow .2s ease, border-color .2s ease;
          overflow: hidden;
        }
        .dw-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 52px rgba(99,91,255,.14);
          border-color: rgba(99,91,255,.18);
        }
        .dw-card:hover .dw-card-open { opacity: 1; color: var(--a1, #635bff); }
        .dw-card-click {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 20px;
          text-align: left;
          border: none;
          background: none;
          cursor: pointer;
          font: inherit;
          color: inherit;
        }
        .dw-card-body { flex: 1; min-width: 0; }
        .dw-card-title {
          font-family: 'Syne', system-ui, sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--t1, #0c0e18);
          margin: 0 0 10px 0;
          line-height: 1.25;
        }
        .dw-card-row { font-size: 13px; color: var(--t2, #5a6278); margin: 0 0 6px 0; }
        .dw-card-row:last-of-type { margin-bottom: 12px; }
        .dw-card-plan {
          font-size: 12px;
          color: var(--t3, #9ba3bb);
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .dw-card-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: .03em;
        }
        .dw-card-badge--active { background: rgba(6,201,160,.18); color: #047857; }
        .dw-card-badge--pending { background: rgba(245,166,35,.2); color: #b45309; }
        .dw-card-badge--completed { background: rgba(99,91,255,.15); color: #4338ca; }
        .dw-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 20px;
          border-top: 1px solid rgba(0,0,0,.06);
          background: rgba(0,0,0,.02);
        }
        .dw-card-open {
          font-size: 13px;
          font-weight: 600;
          color: var(--t2, #5a6278);
          opacity: .85;
          transition: opacity .2s ease, color .2s ease;
        }
        .dw-card-actions { flex-shrink: 0; }
        .dw-btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(255,0,0,.2);
          background: rgba(255,59,48,.06);
          color: #c41e1e;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background .2s ease, border-color .2s ease;
        }
        .dw-btn-icon:hover {
          background: rgba(255,59,48,.12);
          border-color: rgba(255,59,48,.35);
        }
        @media (min-width: 720px) { .dw-title { font-size: 32px; } }
      `}</style>

      <div className="dw-shell">
        <div className="dw-head">
          <div>
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
          <div className="dw-loading">Loading internships…</div>
        ) : faculties.length === 0 ? (
          <div className="dw-empty">No internships yet. Create one to get started.</div>
        ) : (
          <ul className="dw-list" aria-label="Internship list">
            {faculties.map((faculty) => {
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
                        <p className="dw-card-row">{faculty.company}</p>
                        <p className="dw-card-row">{faculty.location}{faculty.duration ? ` · ${faculty.duration}` : ''}</p>
                        {faculty.status && (
                          <span className={`dw-card-badge ${statusClass}`}>{faculty.status}</span>
                        )}
                        {faculty.plan && (
                          <p className="dw-card-plan">{faculty.plan}</p>
                        )}
                      </div>
                    </button>
                    <div className="dw-card-footer">
                      <span className="dw-card-open">View details →</span>
                      <button
                        type="button"
                        className="dw-btn-icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!deletingId) {
                            removeFaculty(faculty._id);
                          }
                        }}
                        disabled={deletingId === faculty._id}
                        title={deletingId === faculty._id ? "Deleting..." : "Delete internship"}
                        aria-label={deletingId === faculty._id ? "Deleting internship..." : "Delete internship"}
                      >
                        {deletingId === faculty._id ? (
                          <span className="spinner">✓</span>
                        ) : (
                          '×'
                        )}
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
