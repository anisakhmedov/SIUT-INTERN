import { useState, useEffect, useCallback } from 'react';
import { get } from '../utils/apiClient';
import { toast } from '../utils/toast';
import { Search, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import PageState from './PageState';
import { CustomSelect } from './ui';

const normList = (r) => (Array.isArray(r) ? r : Array.isArray(r?.data) ? r.data : []);
const normTotal = (r, list) => (typeof r?.total === 'number' ? r.total : list.length);

function useIsMobile(bp = 640) {
  const [mob, setMob] = useState(() => typeof window !== 'undefined' && window.innerWidth < bp);
  useEffect(() => {
    const fn = () => setMob(window.innerWidth < bp);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return mob;
}

const fmtDate = (d) => {
  if (!d) return '—';
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return String(d).slice(0, 10);
  return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const RATING_LABELS = { 1: 'Poor', 2: 'Below Average', 3: 'Satisfactory', 4: 'Good', 5: 'Excellent' };
const ratingColor = (v) => {
  if (v >= 5) return { c: '#166534', bg: 'rgba(34,197,94,.14)' };
  if (v >= 4) return { c: '#1d4ed8', bg: 'rgba(59,130,246,.14)' };
  if (v >= 3) return { c: '#6d28d9', bg: 'rgba(109,40,217,.12)' };
  if (v >= 2) return { c: '#b45309', bg: 'rgba(245,166,35,.14)' };
  return { c: '#b91c1c', bg: 'rgba(239,68,68,.1)' };
};

const toLabel = (key) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();

function ScoreBar({ value }) {
  const pct = ((value || 0) / 5) * 100;
  const color = value >= 4 ? '#06c9a0' : value >= 3 ? '#635bff' : '#f5a623';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'rgba(0,0,0,.07)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width .4s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 20, textAlign: 'right' }}>{value || '—'}</span>
    </div>
  );
}

function DetailPanel({ record, onClose }) {
  if (!record) return null;
  const isMobile = useIsMobile(480);
  const si = record.studentInformation || {};
  const ci = record.companyInformation || {};
  const io = record.internshipOverview || {};
  const rl = record.reflectionOnLearning || {};
  const fc = record.feedbackForCompany || {};
  const rating = fc.overallRating;
  const rs = ratingColor(rating);

  const OVERVIEW_FIELDS = [
    { key: 'internshipRole', label: 'Internship Role / Position' },
    { key: 'keyProjectsTasks', label: 'Key Projects / Tasks' },
    { key: 'skillsDeveloped', label: 'Skills Developed' },
    { key: 'challengesFaced', label: 'Challenges Faced' },
    { key: 'achievements', label: 'Achievements' },
  ];

  const REFLECTION_FIELDS = [
    { key: 'alignmentWithAcademicKnowledge', label: 'Alignment with Academic Knowledge' },
    { key: 'newKnowledgeGained', label: 'New Knowledge Gained' },
    { key: 'careerGoals', label: 'Career Goals' },
  ];

  const FEEDBACK_FIELDS = [
    { key: 'companySupport', label: 'Company Support' },
    { key: 'workEnvironment', label: 'Work Environment' },
    { key: 'suggestionsForCompany', label: 'Suggestions for Company' },
    { key: 'universityPreparation', label: 'University Preparation' },
    { key: 'internshipCoordination', label: 'Internship Coordination' },
    { key: 'suggestionsForUniversity', label: 'Suggestions for University' },
  ];

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.38)', zIndex: 199, backdropFilter: 'blur(5px)', animation: 'fadeIn .18s ease' }} onClick={onClose} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: isMobile ? '100vw' : 'clamp(360px,55vw,660px)', background: '#fff', boxShadow: '-6px 0 38px rgba(0,0,0,.13)', zIndex: 200, display: 'flex', flexDirection: 'column', animation: 'panelIn .33s cubic-bezier(.22,1,.36,1) both', overflow: 'hidden' }}>

        {/* panel header */}
        <div style={{ padding: isMobile ? '14px 16px 12px' : '18px 22px 14px', borderBottom: '1px solid rgba(0,0,0,.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'linear-gradient(135deg,#0c0e18,#1a1d30)', color: '#fff', gap: 10 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: 'Montserrat', fontSize: isMobile ? 13 : 15, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{si.fullname || '—'}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {si.studentID && `ID: ${si.studentID} · `}{ci.companyName || ''}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {rating && !isMobile ? (
              <span className="badge" style={{ background: rs.bg, color: rs.c, fontSize: 12 }}>
                ★ {rating}/5 — {RATING_LABELS[rating] || ''}
              </span>
            ) : null}
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: 'rgba(255,255,255,.7)', display: 'flex' }}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '14px 16px 28px' : '18px 22px 32px' }}>

          {/* student + company basics */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {[
              ['Degree Program', si.degreeProgram],
              ['Year of Study', si.yearOfStudy],
              ['Start Date', fmtDate(si.internshipStartDate)],
              ['End Date', fmtDate(si.internshipEndDate)],
              ['Department', ci.department],
              ['Supervisor Contact', ci.supervisorContact],
            ].map(([label, val]) => (
              <div key={label} style={{ background: 'rgba(0,0,0,.03)', borderRadius: 9, padding: '10px 12px' }}>
                <div style={{ fontSize: 10.5, color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--t1)', fontWeight: 500 }}>{val || '—'}</div>
              </div>
            ))}
          </div>

          {/* internship overview */}
          <div style={{ fontFamily: 'Montserrat', fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 12 }}>Internship Overview</div>
          {OVERVIEW_FIELDS.map(({ key, label }) =>
            io[key] ? (
              <div key={key} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11.5, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.65, background: 'rgba(0,0,0,.025)', borderRadius: 8, padding: '8px 12px' }}>{io[key]}</div>
              </div>
            ) : null
          )}

          {/* reflection */}
          {Object.values(rl).some(Boolean) && (
            <>
              <div style={{ fontFamily: 'Montserrat', fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginTop: 20, marginBottom: 12 }}>Reflection on Learning</div>
              {REFLECTION_FIELDS.map(({ key, label }) =>
                rl[key] ? (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11.5, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.65, background: 'rgba(0,0,0,.025)', borderRadius: 8, padding: '8px 12px' }}>{rl[key]}</div>
                  </div>
                ) : null
              )}
            </>
          )}

          {/* feedback */}
          {FEEDBACK_FIELDS.some(({ key }) => fc[key]) && (
            <>
              <div style={{ fontFamily: 'Montserrat', fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginTop: 20, marginBottom: 12 }}>Company & University Feedback</div>
              {FEEDBACK_FIELDS.map(({ key, label }) =>
                fc[key] ? (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11.5, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.65, background: 'rgba(0,0,0,.025)', borderRadius: 8, padding: '8px 12px' }}>{fc[key]}</div>
                  </div>
                ) : null
              )}
            </>
          )}

          {/* final report */}
          {fc.finalReport && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: 'Montserrat', fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 10 }}>Final Report</div>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.75, background: 'rgba(99,91,255,.03)', borderRadius: 10, padding: '12px 16px', border: '1px solid rgba(99,91,255,.1)', whiteSpace: 'pre-wrap' }}>
                {fc.finalReport}
              </div>
            </div>
          )}

          {/* overall rating + declaration */}
          <div style={{ marginTop: 20, background: 'rgba(99,91,255,.04)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(99,91,255,.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>Overall Rating:</span>
              {rating && (
                <span className="badge" style={{ background: rs.bg, color: rs.c, fontSize: 13 }}>
                  ★ {rating}/5 — {RATING_LABELS[rating] || ''}
                </span>
              )}
            </div>
            {fc.finalComments && (
              <div style={{ fontSize: 12.5, color: 'var(--t2)', marginBottom: 8, fontStyle: 'italic' }}>"{fc.finalComments}"</div>
            )}
            {fc.studentDeclaration && (
              <div style={{ fontSize: 11.5, color: '#06c9a0', fontWeight: 600 }}>✓ Student declaration confirmed</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminStudentEvaluationsPage() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const LIMIT = 20;

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.set('search', search);
      if (filterRating) params.set('overallRating', filterRating);
      const res = await get(`/individual-student-evaluations?${params}`);
      const list = normList(res);
      setRecords(list);
      setTotal(normTotal(res, list));
    } catch (err) {
      setError(err.message || 'Failed to load evaluations');
      toast.error(err.message || 'Failed to load evaluations');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterRating]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const applySearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  if (loading && records.length === 0) return <div className="pp"><PageState variant="loading" title="Loading evaluations" /></div>;
  if (error && records.length === 0) return <div className="pp"><PageState variant="error" title="Failed to load" message={error} /></div>;

  return (
    <div className="pp">
      {/* header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: 'Montserrat', fontSize: 22, fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>Student Self-Evaluations</div>
        <div style={{ fontSize: 13, color: 'var(--t3)' }}>
          All submitted individual student evaluation forms · <strong style={{ color: 'var(--t2)' }}>{total}</strong> total
        </div>
      </div>

      {/* filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div className="sbox" style={{ width: 'auto', flex: '1 1 220px' }}>
          <Search size={14} color="var(--t3)" />
          <input
            placeholder="Search by name, ID, company…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
          />
          {searchInput && (
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}>
              <X size={13} color="var(--t3)" />
            </button>
          )}
        </div>
        <CustomSelect
          style={{ flex: '0 1 200px', minWidth: 140 }}
          value={filterRating}
          onChange={(v) => { setFilterRating(v); setPage(1); }}
          options={[
            { value: '', label: 'All ratings' },
            ...[5, 4, 3, 2, 1].map((r) => ({ value: String(r), label: `★ ${r} — ${RATING_LABELS[r]}` })),
          ]}
          placeholder="All ratings"
        />
        <button className="bp" onClick={applySearch} style={{ flexShrink: 0 }}>
          <Search size={13} /> Search
        </button>
      </div>

      {/* table */}
      {records.length === 0 && !loading ? (
        <PageState variant="empty" title="No evaluations found" message="No submissions match your current filters." />
      ) : (
        <div className="gc" style={{ overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(0,0,0,.07)' }}>
                  {['Student', 'Student ID', 'Company', 'Role', 'Overall Rating', 'Date', ''].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((rec, idx) => {
                  const si = rec.studentInformation || {};
                  const ci = rec.companyInformation || {};
                  const io = rec.internshipOverview || {};
                  const fc = rec.feedbackForCompany || {};
                  const rating = fc.overallRating;
                  const rs = rating ? ratingColor(rating) : { c: 'var(--t3)', bg: 'rgba(0,0,0,.05)' };
                  return (
                    <tr key={rec._id || rec.id || idx}
                      style={{ borderBottom: '1px solid rgba(0,0,0,.05)', transition: 'background .15s', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99,91,255,.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = ''}
                      onClick={() => setSelectedRecord(rec)}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--t1)' }}>{si.fullname || '—'}</div>
                        {si.degreeProgram && <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>{si.degreeProgram}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--t2)', fontFamily: 'monospace' }}>{si.studentID || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--t2)' }}>{ci.companyName || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--t2)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {io.internshipRole || '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {rating ? (
                          <span className="badge" style={{ background: rs.bg, color: rs.c, fontSize: 11 }}>
                            ★ {rating}/5
                          </span>
                        ) : <span style={{ color: 'var(--t3)', fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--t3)', whiteSpace: 'nowrap' }}>
                        {fmtDate(rec.createdAt || si.internshipEndDate)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button className="bi" onClick={(e) => { e.stopPropagation(); setSelectedRecord(rec); }} title="View details">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap', rowGap: 8 }}>
          <button className="bi" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} style={{ opacity: page <= 1 ? 0.35 : 1 }}>
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
            return (
              <button key={p} onClick={() => setPage(p)}
                style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${p === page ? 'var(--a1)' : 'rgba(0,0,0,.1)'}`, background: p === page ? 'var(--a1)' : '#fff', color: p === page ? '#fff' : 'var(--t2)', fontFamily: 'Montserrat', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all .18s' }}>
                {p}
              </button>
            );
          })}
          <button className="bi" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} style={{ opacity: page >= totalPages ? 0.35 : 1 }}>
            <ChevronRight size={15} />
          </button>
          <span style={{ fontSize: 12, color: 'var(--t3)', marginLeft: 4, whiteSpace: 'nowrap' }}>
            {page}/{totalPages} · {total}
          </span>
        </div>
      )}

      {selectedRecord && <DetailPanel record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
    </div>
  );
}
