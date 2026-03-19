import React, { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = 'https://siut-internship-35635e91d124.herokuapp.com';

export default function InternshipPage({ facultyId, onBack, user }) {
  const [faculty, setFaculty] = useState(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const commentsSectionRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  const fetchFaculty = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/faculty/${facultyId}`);
      if (!response.ok) throw new Error('Failed to fetch faculty');
      const data = await response.json();
      setFaculty(data);
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Error fetching faculty:', err);
    } finally {
      setLoading(false);
    }
  }, [facultyId]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const days = faculty?.days || [];
  const currentDay = days[dayIndex];
  const canWriteReport = user?.role === 'Tutor' || user?.role === 'Admin';
  const canApprove = user?.role === 'Admin';
  const canExport = user?.role === 'Admin';
  const canViewComments = ['Admin', 'Rector', 'Professor'].includes(user?.role);

  const clearActionFeedback = useCallback(() => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => {
      setActionMessage('');
      setActionError('');
      feedbackTimeoutRef.current = null;
    }, 4000);
  }, []);

  const getDayId = useCallback((day) => {
    if (!day) return null;
    return day._id ?? day.id ?? null;
  }, []);

  const updateDay = useCallback(async (day, payload, index = null) => {
    const dayId = getDayId(day) ?? (index != null ? String(index) : null);
    if (dayId == null) {
      setActionError('Day could not be identified. Try refreshing.');
      clearActionFeedback();
      return;
    }
    setSubmitting(true);
    setActionError('');
    setActionMessage('');
    try {
      const res = await fetch(`${API_URL}/faculty/${facultyId}/days/${dayId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchFaculty(); // Refresh the data
      setActionMessage('Saved.');
      clearActionFeedback();
    } catch (err) {
      setActionError(err.message || 'Something went wrong.');
      clearActionFeedback();
    } finally {
      setSubmitting(false);
    }
  }, [facultyId, getDayId, fetchFaculty, clearActionFeedback]);

  const handleWriteReportOpen = useCallback(() => {
    if (currentDay?.shortReport) {
      setReportTitle(currentDay.shortReport.title || '');
      setReportDescription(currentDay.shortReport.description || '');
    } else {
      setReportTitle('');
      setReportDescription('');
    }
    setShowReportForm(true);
  }, [currentDay]);

  const handleReportSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!currentDay) return;
    const shortReport = {
      title: reportTitle.trim() || 'Report',
      description: reportDescription.trim() || '',
      images: currentDay.shortReport?.images || [],
      date: currentDay.shortReport?.date || new Date().toISOString(),
      dayID: currentDay.shortReport?.dayID || null,
    };
    await updateDay(currentDay, { ...currentDay, shortReport }, dayIndex);
    setShowReportForm(false);
  }, [currentDay, reportTitle, reportDescription, updateDay, dayIndex]);

  const handleApprove = useCallback(async () => {
    if (!currentDay) return;
    await updateDay(currentDay, { ...currentDay, approved: true }, dayIndex);
  }, [currentDay, updateDay, dayIndex]);

  const handleViewComments = useCallback(() => {
    commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handlePostComment = useCallback(async (e) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text || !currentDay) return;
    const comments = [...(currentDay.comments || []), text];
    await updateDay(currentDay, { ...currentDay, comments }, dayIndex);
    setNewComment('');
  }, [currentDay, newComment, updateDay, dayIndex]);

  const handleAddDay = useCallback(async () => {
    setSubmitting(true);
    setActionError('');
    setActionMessage('');
    try {
      const today = new Date().toISOString().slice(0, 10);
      const newDay = {
        dayNumber: String((days.length || 0) + 1),
        date: today,
        approved: false,
        shortReport: null,
        comments: [],
      };
      const res = await fetch(`${API_URL}/faculty/${facultyId}/days`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDay),
      });
      if (!res.ok) throw new Error('Failed to add day');
      await fetchFaculty(); // Refresh the data
      setDayIndex(days.length);
      setActionMessage('Day added.');
      clearActionFeedback();
    } catch (err) {
      setActionError(err.message || 'Failed to add day.');
      clearActionFeedback();
    } finally {
      setSubmitting(false);
    }
  }, [facultyId, days.length, fetchFaculty, clearActionFeedback]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="ip-page">
          <style>{ipStyles}</style>
          <div className="ip-shell">
            <button type="button" className="ip-back" onClick={onBack}>← Back to dashboard</button>
            <div className="ip-loading">Loading internship details…</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="ip-page">
          <style>{ipStyles}</style>
          <div className="ip-shell">
            <button type="button" className="ip-back" onClick={onBack}>← Back to dashboard</button>
            <div className="ip-alert" role="alert">
              <span aria-hidden="true">⚠</span>
              <span>{error}</span>
            </div>
          </div>
        </div>
      );
    }

    if (!faculty) {
      return (
        <div className="ip-page">
          <style>{ipStyles}</style>
          <div className="ip-shell">
            <button type="button" className="ip-back" onClick={onBack}>← Back to dashboard</button>
            <div className="ip-empty">Internship not found.</div>
          </div>
        </div>
      );
    }

    return (
      <div className="ip-page">
        <style>{ipStyles}</style>
        <div className="ip-shell">
          <button type="button" className="ip-back" onClick={onBack}>
            ← Back to dashboard
          </button>

          <header className="ip-hero">
            <h1 className="ip-hero-title">{faculty.name}</h1>
            <div className="ip-hero-grid">
              <div className="ip-hero-item">
                <span className="ip-hero-label">Company</span>
                <span className="ip-hero-value">{faculty.company}</span>
              </div>
              <div className="ip-hero-item">
                <span className="ip-hero-label">Location</span>
                <span className="ip-hero-value">{faculty.location}</span>
              </div>
              <div className="ip-hero-item">
                <span className="ip-hero-label">Duration</span>
                <span className="ip-hero-value">{faculty.duration}</span>
              </div>
              <div className="ip-hero-item">
                <span className="ip-hero-label">Status</span>
                <span className="ip-hero-value">{faculty.status}</span>
              </div>
              <div className="ip-hero-item ip-hero-item--full">
                <span className="ip-hero-label">Plan</span>
                <span className="ip-hero-value">{faculty.plan}</span>
              </div>
              {faculty.progressAll != null && (
                <div className="ip-hero-item">
                  <span className="ip-hero-label">Progress</span>
                  <span className="ip-hero-value">{faculty.progressAll}</span>
                </div>
              )}
              {faculty.tutorID && (
                <div className="ip-hero-item">
                  <span className="ip-hero-label">Tutor ID</span>
                  <span className="ip-hero-value">{faculty.tutorID}</span>
                </div>
              )}
            </div>
          </header>

          {(actionMessage || actionError) && (
            <div className={actionError ? 'ip-alert' : 'ip-success'} style={{ marginBottom: 16 }}>
              <span aria-hidden="true">{actionError ? '⚠' : '✓'}</span>
              <span>{actionError || actionMessage}</span>
            </div>
          )}
          <div className="ip-actions">
            {canWriteReport && (
              <button
                type="button"
                className="ip-btn ip-btn--primary"
                disabled={!currentDay || submitting}
                onClick={handleWriteReportOpen}
              >
                Write report
              </button>
            )}
            {canApprove && (
              <button
                type="button"
                className="ip-btn ip-btn--primary"
                disabled={!currentDay || submitting || currentDay?.approved}
                onClick={handleApprove}
              >
                Approve report
              </button>
            )}
            {canExport && (
              <button type="button" className="ip-btn ip-btn--primary" onClick={() => window.print()}>
                Export PDF
              </button>
            )}
            {canViewComments && (
              <button
                type="button"
                className="ip-btn ip-btn--primary"
                onClick={handleViewComments}
              >
                View comments
              </button>
            )}
          </div>

          {showReportForm && currentDay && (
            <div className="ip-report-form-card">
              <h4 className="ip-report-form-title">Write report — Day {currentDay.dayNumber}</h4>
              <form onSubmit={handleReportSubmit}>
                <div className="ip-field">
                  <label className="ip-label" htmlFor="ip-report-title">Title</label>
                  <input
                    id="ip-report-title"
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="ip-input"
                    placeholder="Report title"
                  />
                </div>
                <div className="ip-field">
                  <label className="ip-label" htmlFor="ip-report-desc">Description</label>
                  <textarea
                    id="ip-report-desc"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="ip-input"
                    placeholder="What was done today?"
                    rows={4}
                  />
                </div>
                <div className="ip-form-actions">
                  <button type="button" className="ip-btn ip-btn--secondary" onClick={() => setShowReportForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="ip-btn ip-btn--primary" disabled={submitting}>
                    {submitting ? 'Saving…' : 'Save report'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {days.length > 0 ? (
            <div className="ip-days">
              <div className="ip-day-nav">
                <label className="ip-day-label" htmlFor="ip-day-select">Select day</label>
                <select
                  id="ip-day-select"
                  value={dayIndex}
                  onChange={(e) => setDayIndex(Number(e.target.value))}
                  className="ip-select"
                >
                  {days.map((d, idx) => (
                    <option key={idx} value={idx}>
                      Day {d.dayNumber} — {d.date || 'No date'}
                    </option>
                  ))}
                </select>
                <div className="ip-day-btns">
                  <button
                    type="button"
                    className="ip-btn ip-btn--secondary"
                    disabled={dayIndex === 0}
                    onClick={() => setDayIndex(dayIndex - 1)}
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    className="ip-btn ip-btn--secondary"
                    disabled={dayIndex === days.length - 1}
                    onClick={() => setDayIndex(dayIndex + 1)}
                  >
                    Next →
                  </button>
                </div>
              </div>

              {currentDay && (
                <div className="ip-day-card">
                  <div className="ip-day-header">
                    <span className="ip-day-title">Day {currentDay.dayNumber} — {currentDay.date || 'No date'}</span>
                    <span className={`ip-day-badge ${currentDay.approved ? 'ip-day-badge--ok' : 'ip-day-badge--pending'}`}>
                      {currentDay.approved ? '✓ Approved' : 'Pending'}
                    </span>
                  </div>

                  {currentDay.shortReport && (
                    <div className="ip-report">
                      <h4 className="ip-report-title">{currentDay.shortReport.title || 'Untitled'}</h4>
                      <p className="ip-report-desc">{currentDay.shortReport.description}</p>
                      {currentDay.shortReport.images && currentDay.shortReport.images.length > 0 && (
                        <div className="ip-report-images">
                          {currentDay.shortReport.images.map((img, idx) => (
                            <img key={idx} src={img} alt={`Report ${idx + 1}`} className="ip-report-img" />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {(currentDay.comments?.length > 0 || canWriteReport) && (
                    <div className="ip-comments" ref={commentsSectionRef}>
                      <h4 className="ip-comments-title">Comments ({currentDay.comments?.length || 0})</h4>
                      {currentDay.comments && currentDay.comments.length > 0 && (
                        <ul className="ip-comments-list">
                          {currentDay.comments.map((comment, idx) => (
                            <li key={idx} className="ip-comment">{comment}</li>
                          ))}
                        </ul>
                      )}
                      {canWriteReport && (
                        <form className="ip-comment-form" onSubmit={handlePostComment}>
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment…"
                            className="ip-input"
                          />
                          <button type="submit" className="ip-btn ip-btn--primary" disabled={submitting || !newComment.trim()}>
                            Post
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="ip-empty-card">
              <p style={{ margin: '0 0 16px 0' }}>No days recorded for this internship yet.</p>
              {canWriteReport && (
                <button
                  type="button"
                  className="ip-btn ip-btn--primary"
                  disabled={submitting}
                  onClick={handleAddDay}
                >
                  {submitting ? 'Adding…' : 'Add first day'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return renderContent();
}

const ipStyles = `
  .ip-page {
    min-height: calc(100vh - 64px);
    padding: clamp(16px, 3vw, 44px);
    background:
      radial-gradient(1200px 600px at 10% 0%, rgba(99,91,255,.10), transparent 60%),
      radial-gradient(900px 520px at 90% 10%, rgba(6,201,160,.10), transparent 55%),
      linear-gradient(180deg, rgba(240,241,247,.65), rgba(255,255,255,1));
  }
  .ip-shell { width: 100%; max-width: 880px; margin: 0 auto; }
  .ip-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 20px;
    padding: 8px 0;
    border: none;
    background: none;
    color: var(--a1, #635bff);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: color .2s ease;
  }
  .ip-back:hover { color: var(--a2, #06c9a0); }
  .ip-loading, .ip-empty {
    background: rgba(255,255,255,.86);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 18px;
    padding: 48px 24px;
    text-align: center;
    color: var(--t2, #5a6278);
    font-size: 15px;
    box-shadow: 0 14px 44px rgba(99,91,255,.10);
  }
  .ip-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 14px;
    border: 1px solid rgba(255,0,0,.18);
    background: rgba(255,0,0,.05);
    color: #8a1f1f;
    padding: 14px 16px;
    font-size: 13px;
  }
  .ip-success {
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 14px;
    border: 1px solid rgba(6,201,160,.3);
    background: rgba(6,201,160,.08);
    color: #047857;
    padding: 14px 16px;
    font-size: 13px;
  }
  .ip-report-form-card {
    background: rgba(255,255,255,.86);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 18px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 14px 44px rgba(99,91,255,.10);
  }
  .ip-report-form-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0 0 16px 0;
  }
  .ip-field { margin-bottom: 14px; }
  .ip-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--t2, #5a6278);
    margin-bottom: 6px;
  }
  .ip-form-actions {
    display: flex;
    gap: 10px;
    margin-top: 16px;
  }
  .ip-hero {
    background: rgba(255,255,255,.86);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 18px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 14px 44px rgba(99,91,255,.10);
    backdrop-filter: blur(18px);
  }
  .ip-hero-title {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--t1, #0c0e18);
    margin: 0 0 20px 0;
  }
  .ip-hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 24px;
  }
  .ip-hero-item--full { grid-column: 1 / -1; }
  .ip-hero-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .05em;
    color: var(--t3, #9ba3bb);
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .ip-hero-value { font-size: 14px; color: var(--t1, #0c0e18); }
  .ip-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 24px;
  }
  .ip-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 12px;
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: transform .15s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
  }
  .ip-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
  .ip-btn--primary {
    border: 1px solid rgba(99,91,255,.18);
    background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
    color: #fff;
    box-shadow: 0 10px 30px rgba(99,91,255,.25);
  }
  .ip-btn--primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 16px 44px rgba(99,91,255,.30);
  }
  .ip-btn--secondary {
    border: 1px solid rgba(0,0,0,.12);
    background: rgba(255,255,255,.8);
    color: var(--t1, #0c0e18);
  }
  .ip-btn--secondary:hover:not(:disabled) { background: rgba(0,0,0,.04); }
  .ip-days { margin-bottom: 24px; }
  .ip-day-nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  .ip-day-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--t2, #5a6278);
  }
  .ip-select {
    padding: 10px 14px;
    border-radius: 12px;
    border: 1.5px solid rgba(0,0,0,.10);
    background: rgba(0,0,0,.03);
    color: var(--t1, #0c0e18);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color .2s ease, box-shadow .2s ease;
  }
  .ip-select:focus {
    border-color: rgba(99,91,255,.55);
    box-shadow: 0 0 0 4px rgba(99,91,255,.14);
  }
  .ip-day-btns { display: flex; gap: 8px; }
  .ip-day-card {
    background: rgba(255,255,255,.86);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 18px;
    padding: 24px;
    box-shadow: 0 14px 44px rgba(99,91,255,.10);
    backdrop-filter: blur(18px);
  }
  .ip-day-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(0,0,0,.06);
  }
  .ip-day-title {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
  }
  .ip-day-badge {
    font-size: 12px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 10px;
  }
  .ip-day-badge--ok { background: rgba(6,201,160,.15); color: #047857; }
  .ip-day-badge--pending { background: rgba(245,166,35,.2); color: #b45309; }
  .ip-report {
    margin-bottom: 20px;
    padding: 16px;
    background: rgba(0,0,0,.03);
    border-radius: 14px;
    border: 1px solid rgba(0,0,0,.06);
  }
  .ip-report-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0 0 8px 0;
  }
  .ip-report-desc { font-size: 14px; color: var(--t2, #5a6278); margin: 0; line-height: 1.5; }
  .ip-report-images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
    margin-top: 14px;
  }
  .ip-report-img {
    width: 100%;
    height: 100px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid rgba(0,0,0,.08);
  }
  .ip-comments { margin-top: 20px; }
  .ip-comments-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0 0 12px 0;
  }
  .ip-comments-list { list-style: none; margin: 0; padding: 0; }
  .ip-comment {
    padding: 12px 14px;
    background: rgba(255,255,255,.9);
    border: 1px solid rgba(0,0,0,.06);
    border-radius: 12px;
    font-size: 13px;
    color: var(--t2, #5a6278);
    margin-bottom: 8px;
  }
  .ip-comment-form {
    display: flex;
    gap: 10px;
    margin-top: 14px;
  }
  .ip-input {
    flex: 1;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1.5px solid rgba(0,0,0,.10);
    background: rgba(0,0,0,.03);
    color: var(--t1, #0c0e18);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color .2s ease, box-shadow .2s ease;
  }
  .ip-input::placeholder { color: rgba(90,98,120,.55); }
  .ip-input:focus {
    border-color: rgba(99,91,255,.55);
    box-shadow: 0 0 0 4px rgba(99,91,255,.14);
  }
  .ip-empty-card {
    background: rgba(255,255,255,.86);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 18px;
    padding: 40px 24px;
    text-align: center;
    color: var(--t2, #5a6278);
    font-size: 14px;
    box-shadow: 0 14px 44px rgba(99,91,255,.10);
  }
  @media (min-width: 640px) {
    .ip-hero-title { font-size: 28px; }
    .ip-hero { padding: 28px; }
    .ip-hero-grid { grid-template-columns: repeat(3, 1fr); }
    .ip-hero-item--full { grid-column: 1 / -1; }
  }
`;