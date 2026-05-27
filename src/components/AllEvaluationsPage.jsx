import React, { useEffect, useMemo, useState } from 'react';
import { getEvaluations } from '../utils/evaluationApi';

const styles = {
  page: {
    maxWidth: 1320,
    margin: '0 auto',
    padding: 'clamp(16px, 3vw, 32px)',
  },
  hero: {
    padding: '24px 24px 20px',
    borderRadius: 24,
    background: 'linear-gradient(135deg, rgba(99,91,255,.10), rgba(6,201,160,.08))',
    border: '1px solid rgba(99,91,255,.14)',
    boxShadow: '0 14px 40px rgba(12,14,24,.06)',
    marginBottom: 20,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    borderRadius: 999,
    background: 'rgba(255,255,255,.72)',
    border: '1px solid rgba(0,0,0,.06)',
    color: 'var(--t2)',
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 12,
  },
  title: {
    margin: 0,
    fontSize: 'clamp(28px, 4vw, 40px)',
    lineHeight: 1.05,
    color: 'var(--t1)',
  },
  subtitle: {
    margin: '10px 0 0',
    color: 'var(--t2)',
    fontSize: 'clamp(14px, 1.7vw, 16px)',
    lineHeight: 1.6,
    maxWidth: 860,
  },
  card: {
    borderRadius: 22,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,.86)',
    background: 'rgba(255,255,255,.9)',
    boxShadow: '0 10px 24px rgba(12,14,24,.06)',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    minWidth: 920,
  },
  th: {
    textAlign: 'left',
    fontSize: 12,
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    color: 'var(--t2)',
    background: 'rgba(0,0,0,.03)',
    padding: '14px 16px',
    borderBottom: '1px solid rgba(0,0,0,.06)',
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid rgba(0,0,0,.06)',
    verticalAlign: 'middle',
    color: 'var(--t1)',
    fontSize: 14,
  },
  muted: { color: 'var(--t2)' },
  stack: { display: 'grid', gap: 4 },
  name: { fontWeight: 800, color: 'var(--t1)' },
  pills: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  btn: {
    border: 'none',
    borderRadius: 12,
    padding: '10px 14px',
    cursor: 'pointer',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    transition: 'transform .18s ease, box-shadow .18s ease',
    background: 'linear-gradient(135deg, #635bff, #06c9a0)',
    color: '#fff',
  },
  empty: {
    padding: '18px 20px',
    borderRadius: 18,
    background: 'rgba(255,255,255,.88)',
    border: '1px solid rgba(255,255,255,.9)',
    boxShadow: '0 10px 24px rgba(12,14,24,.06)',
  },
  detailHero: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    padding: '22px 24px',
    borderRadius: 24,
    background: 'linear-gradient(135deg, rgba(255,255,255,.94), rgba(248,250,252,.98))',
    border: '1px solid rgba(255,255,255,.92)',
    boxShadow: '0 16px 42px rgba(12,14,24,.08)',
    marginBottom: 18,
  },
  detailActions: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  detailBody: {
    display: 'grid',
    gap: 16,
  },
  section: {
    padding: 18,
    borderRadius: 18,
    border: '1px solid rgba(0,0,0,.06)',
    background: '#fff',
  },
  sectionTitle: {
    margin: '0 0 12px',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '.12em',
    color: 'var(--a1)',
    fontWeight: 800,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 12,
  },
  detailItem: {
    padding: '12px 14px',
    borderRadius: 14,
    background: 'rgba(0,0,0,.03)',
  },
  detailLabel: {
    display: 'block',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '.10em',
    color: 'var(--t2)',
    marginBottom: 4,
    fontWeight: 800,
  },
  detailValue: {
    fontSize: 14,
    color: 'var(--t1)',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  closeBtn: {
    border: '1px solid rgba(0,0,0,.08)',
    background: '#fff',
    color: 'var(--t1)',
    borderRadius: 12,
    padding: '10px 14px',
    cursor: 'pointer',
    fontWeight: 700,
  },
  backBtn: {
    border: '1px solid rgba(0,0,0,.08)',
    background: '#fff',
    color: 'var(--t1)',
    borderRadius: 12,
    padding: '10px 14px',
    cursor: 'pointer',
    fontWeight: 700,
    boxShadow: '0 6px 16px rgba(12,14,24,.06)',
  },
};

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function normalizeEvaluation(item) {
  return item || {};
}

function StatPill({ label, value, bg, color }) {
  return (
    <span style={{ ...styles.pill, background: bg, color }}>
      {label}: {value}
    </span>
  );
}

function SectionDetail({ title, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

export default function AllEvaluationsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getEvaluations();
        if (!mounted) return;
        setList(Array.isArray(data) ? data : (data?.data || []));
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const stats = useMemo(() => ({
    total: list.length,
  }), [list.length]);

  const selectedItem = normalizeEvaluation(selected);

  if (loading) return <div className="pp"><div className="mc">Loading evaluations…</div></div>;
  if (error) return <div className="pp"><div className="mc" style={{ color: 'red' }}>Error: {error}</div></div>;

  const openDetails = (row) => setSelected(row);
  const closeDetails = () => setSelected(null);

  const detailView = selected ? (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={styles.detailHero}>
        <div>
          <div style={styles.badge}>Full submission</div>
          <h2 style={{ margin: 0, fontSize: 'clamp(22px, 3vw, 34px)', color: 'var(--t1)' }}>
            {selected.studentInformation?.fullname || 'Unnamed student'}
          </h2>
          <p style={{ margin: '8px 0 0', color: 'var(--t2)' }}>
            {selected.companyInformation?.companyName || 'Unknown company'}
          </p>
        </div>
        <button type="button" style={styles.backBtn} onClick={closeDetails}>
          Back to list
        </button>
      </div>

      <div style={styles.detailBody}>
        <SectionDetail title="Student Information">
          <div style={styles.grid2}>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Full name</span><span style={styles.detailValue}>{formatValue(selected.studentInformation?.fullname)}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Student ID</span><span style={styles.detailValue}>{formatValue(selected.studentInformation?.studentID)}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Degree program</span><span style={styles.detailValue}>{formatValue(selected.studentInformation?.degreeProgram)}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Year of study</span><span style={styles.detailValue}>{formatValue(selected.studentInformation?.yearOfStudy)}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Internship start</span><span style={styles.detailValue}>{formatValue(selected.studentInformation?.internshipStartDate)}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Internship end</span><span style={styles.detailValue}>{formatValue(selected.studentInformation?.internshipEndDate)}</span></div>
          </div>
        </SectionDetail>

        <SectionDetail title="Company Information">
          <div style={styles.grid3}>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Company name</span><span style={styles.detailValue}>{formatValue(selected.companyInformation?.companyName)}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Department</span><span style={styles.detailValue}>{formatValue(selected.companyInformation?.department)}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Supervisor contact</span><span style={styles.detailValue}>{formatValue(selected.companyInformation?.supervisorContact)}</span></div>
          </div>
        </SectionDetail>

        <SectionDetail title="Evaluation Criteria">
          <div style={styles.grid2}>
            {[
              ['Professionalism', selected.professionalism],
              ['Work Ethic', selected.workEthic],
              ['Technical Skills', selected.technicalSkills],
              ['Communication Skills', selected.communicationSkills],
              ['Problem-Solving Skills', selected.problemSolvingSkills],
              ['Overall Performance', selected.overallPerformance],
            ].map(([label, group]) => (
              <div key={label} style={styles.detailItem}>
                <span style={styles.detailLabel}>{label}</span>
                <div style={{ display: 'grid', gap: 6 }}>
                  {group && Object.entries(group)
                    .filter(([key]) => key !== 'comments')
                    .map(([key, value]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <span style={{ color: 'var(--t2)', fontSize: 13 }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                        <strong style={{ color: 'var(--t1)' }}>{formatValue(value)}</strong>
                      </div>
                    ))}
                </div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,.06)' }}>
                  <span style={styles.detailLabel}>Comments</span>
                  <div style={styles.detailValue}>{formatValue(group?.comments)}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionDetail>

        <SectionDetail title="Open-Ended Questions">
          {Object.keys(selected.openEndedQuestions || {}).length === 0 ? (
            <div style={styles.detailValue}>No open-ended answers provided.</div>
          ) : (
            <div style={styles.grid2}>
              {Object.entries(selected.openEndedQuestions || {}).map(([key, value]) => (
                <div key={key} style={styles.detailItem}>
                  <span style={styles.detailLabel}>{key.replace(/([A-Z])/g, ' $1')}</span>
                  <div style={styles.detailValue}>{formatValue(value)}</div>
                </div>
              ))}
            </div>
          )}
        </SectionDetail>

        <SectionDetail title="Final Recommendation">
          <div style={styles.grid2}>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Final rating</span><span style={styles.detailValue}>{formatValue(selected.finalRecommendation?.finalRating)}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Supervisor recommendation</span><span style={styles.detailValue}>{formatValue(selected.finalRecommendation?.supervisorRecommendation).replace(/-/g, ' ')}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Declaration accepted</span><span style={styles.detailValue}>{formatValue(selected.finalRecommendation?.declarationAccepted)}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Supervisor full name</span><span style={styles.detailValue}>{formatValue(selected.finalRecommendation?.supervisorFullName)}</span></div>
            <div style={styles.detailItem}><span style={styles.detailLabel}>Date</span><span style={styles.detailValue}>{formatValue(selected.finalRecommendation?.date)}</span></div>
          </div>
        </SectionDetail>
      </div>
    </div>
  ) : null;

  return (
    <div className="pp">
      <div style={styles.page}>
        <div style={styles.hero}>
          <div style={styles.badge}>Admin / Developer review</div>
          <h1 style={styles.title}>All Evaluations</h1>
          <p style={styles.subtitle}>
            Review submitted internship evaluations in a compact summary table, then open any row to see the full response details.
          </p>
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <StatPill label="Total submissions" value={stats.total} bg="rgba(99,91,255,.10)" color="var(--a1)" />
          </div>
        </div>

        {selected ? (
          detailView
        ) : list.length === 0 ? (
          <div style={styles.empty}>No submissions found.</div>
        ) : (
          <div style={styles.card}>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Student</th>
                    <th style={styles.th}>Company</th>
                    <th style={styles.th}>Final Rating</th>
                    <th style={styles.th}>Recommendation</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((row, i) => {
                    const studentName = row.studentInformation?.fullname || '—';
                    const studentId = row.studentInformation?.studentID || '—';
                    const company = row.companyInformation?.companyName || '—';
                    const rating = row.finalRecommendation?.finalRating || '—';
                    const recommendation = row.finalRecommendation?.supervisorRecommendation || '—';
                    const date = row.finalRecommendation?.date || '—';

                    return (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(0,0,0,.01)' : 'transparent' }}>
                        <td style={styles.td}>
                          <div style={styles.stack}>
                            <span style={styles.name}>{studentName}</span>
                            <span style={styles.muted}>ID: {studentId}</span>
                          </div>
                        </td>
                        <td style={styles.td}>{company}</td>
                        <td style={styles.td}>
                          <StatPill label="Rating" value={rating} bg="rgba(245,158,11,.12)" color="#b45309" />
                        </td>
                        <td style={styles.td}>
                          <StatPill
                            label="Status"
                            value={recommendation.replace(/-/g, ' ')}
                            bg="rgba(6,201,160,.12)"
                            color="#0f766e"
                          />
                        </td>
                        <td style={styles.td}>{date}</td>
                        <td style={styles.td}>
                          <button type="button" style={styles.btn} onClick={() => openDetails(row)}>
                            Show more
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
      </div>

    </div>
  );
}
