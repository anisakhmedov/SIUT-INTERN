import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { get, post } from '../utils/apiClient';
import { toast } from '../utils/toast';
import {
  ChevronDown, AlertCircle, CheckCircle2, Briefcase,
} from 'lucide-react';

/* ── helpers ── */
const getStudentId = (s) => String(s?._id || s?.id || s?.studentId || '').trim();
const getStudentName = (s) =>
  [s?.name, s?.surname, s?.lastname].filter(Boolean).join(' ').trim() || 'Unnamed';
const getStudentFaculty = (s) => {
  if (typeof s?.nameFaculty === 'string' && s.nameFaculty.trim()) return s.nameFaculty.trim();
  if (s?.faculty && typeof s.faculty === 'object') return String(s.faculty.name || '').trim();
  return '';
};
const parseYearFromDegree = (deg) => {
  const parts = String(deg || '').split('-');
  if (parts.length >= 2) {
    const n = parseInt(parts[1], 10);
    if (!isNaN(n) && n >= 1 && n <= 10) return String(n);
  }
  return '';
};
const getDates = (internship) => {
  const days = Array.isArray(internship?.days) ? internship.days : [];
  const start = days[0]?.date ? String(days[0].date).slice(0, 10) : '';
  const end = days.length > 0 && days[days.length - 1]?.date ? String(days[days.length - 1].date).slice(0, 10) : '';
  return { start, end };
};
const normList = (r) => (Array.isArray(r) ? r : Array.isArray(r?.data) ? r.data : []);

const defaultForm = () => ({
  studentInformation: { fullname: '', studentID: '', degreeProgram: '', yearOfStudy: '', internshipStartDate: '', internshipEndDate: '' },
  companyInformation: { companyName: '', department: '', supervisorContact: '' },
  evaluation: {
    professionalism: { punctualityAndAttendance: 0, dresscodeAndAppearance: 0, adherenceToCompanyPolicies: 0, comments: '' },
    workEthic: { initiativeAndProactiveness: 0, timeManagement: 0, abilityToMeetDeadlines: 0, comments: '' },
    technicalSkills: { applicationOfAcademicKnowledge: 0, abilityToLearnNewSkillsTools: 0, qualityOfWorkOutput: 0, comments: '' },
    communicationSkills: { verbalCommunication: 0, writtenCommunication: 0, teamCollaboration: 0, comments: '' },
    problemSolvingSkills: { analyticalThinking: 0, creativityAndInnovation: 0, abilityToHandleChallenges: 0, comments: '' },
    overallPerformance: { contributionToTheTeam: 0, alignmentWithCompanyGoals: 0, potentialForFutureEmployment: 0, comments: '' },
  },
  openEndedQuestions: { strengths: '', areasOfImprovement: '', projectTaskFeedback: '', learningAndGrowth: '', teamDynamics: '', adaptability: '', feedbackForStudent: '', feedbackForUniversity: '' },
  finalRecommendation: { finalRating: '', supervisorRecommendation: '', declaration: false, supervisorFullName: '', date: '' },
});

const FINAL_RATINGS = ['Needs significant improvement', 'Meets expectations', 'Exceeds expectations'];
const SUPER_RECS = ['Recommend for future opportunities', 'Recommend with reservations', 'Do not recommend'];
const RATING_LABELS = { 1: 'Poor', 2: 'Below avg', 3: 'Satisfactory', 4: 'Good', 5: 'Excellent' };

function useIsMobile() {
  const [mob, setMob] = useState(() => window.innerWidth < 680);
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 680);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mob;
}

/* ── CustomSelect ── */
function CustomSelect({ value, onChange, options, placeholder, hasError, disabled }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const handleToggle = () => {
    if (disabled) return;
    if (open) { setOpen(false); return; }
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) {
      const left = Math.min(r.left, window.innerWidth - r.width - 8);
      setPos({ top: r.bottom + 6, left: Math.max(left, 8), width: r.width });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onClose = (e) => {
      if (!triggerRef.current?.contains(e.target) && !panelRef.current?.contains(e.target))
        setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onClose);
    document.addEventListener('touchstart', onClose);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onClose);
      document.removeEventListener('touchstart', onClose);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const hasErr = hasError && !value;

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', borderRadius: 10, gap: 8,
          border: `1.5px solid ${open ? 'var(--a1)' : hasErr ? '#ef4444' : 'rgba(0,0,0,.12)'}`,
          background: disabled ? 'rgba(0,0,0,.04)' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', fontSize: 14,
          color: selected ? 'var(--t1)' : 'var(--t3)',
          textAlign: 'left',
          boxShadow: open ? '0 0 0 3px rgba(99,91,255,.12)' : 'none',
          transition: 'border-color .18s, box-shadow .18s',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s', flexShrink: 0, color: 'var(--t3)' }}
        />
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: pos.top, left: pos.left, width: pos.width,
            zIndex: 99999,
            background: '#fff', borderRadius: 12,
            border: '1.5px solid rgba(99,91,255,.18)',
            boxShadow: '0 8px 32px rgba(0,0,0,.18)',
            maxHeight: 260, overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {options.map((o) => {
            const isSel = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onMouseEnter={() => setHovered(o.value)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => { onChange(o.value); setOpen(false); setHovered(null); }}
                style={{
                  width: '100%', padding: '11px 16px', border: 'none',
                  background: isSel ? 'rgba(99,91,255,.1)' : hovered === o.value ? 'rgba(99,91,255,.04)' : 'transparent',
                  textAlign: 'left', cursor: 'pointer', fontSize: 14,
                  color: isSel ? 'var(--a1)' : 'var(--t1)',
                  fontWeight: isSel ? 600 : 400,
                  transition: 'background .1s',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>{o.label}</span>
                {o.badge && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, flexShrink: 0,
                    background: 'rgba(6,201,160,.12)', color: '#06c9a0',
                    borderRadius: 999, padding: '2px 8px',
                  }}>{o.badge}</span>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── RatingField (custom radio) ── */
function RatingField({ value, onChange, hasError, name, compact }) {
  const w = compact ? 56 : 72;
  const h = compact ? 48 : 56;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const isSelected = value === n;
        return (
          <label key={n} style={{ cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="radio" name={name} value={n} checked={isSelected} onChange={() => onChange(n)}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
            />
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              width: w, height: h, borderRadius: 11,
              border: `2px solid ${isSelected ? 'transparent' : hasError && !value ? '#ef4444' : 'rgba(0,0,0,.1)'}`,
              background: isSelected ? 'linear-gradient(135deg,var(--a1),var(--a2))' : 'rgba(0,0,0,.02)',
              color: isSelected ? '#fff' : 'var(--t2)',
              transition: 'all .18s',
              boxShadow: isSelected ? '0 4px 14px rgba(99,91,255,.35)' : 'none',
            }}>
              <span style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: compact ? 15 : 17, lineHeight: 1 }}>{n}</span>
              <span style={{ fontSize: 9, fontWeight: 600, marginTop: 3, opacity: isSelected ? 0.85 : 0.55, letterSpacing: 0.2 }}>
                {RATING_LABELS[n]}
              </span>
            </div>
          </label>
        );
      })}
      {hasError && !value && (
        <span style={{ fontSize: 11, color: '#ef4444', marginLeft: 4 }}>Required</span>
      )}
    </div>
  );
}

function SectionHeader({ number, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, paddingBottom: 14, borderBottom: '2px solid rgba(99,91,255,.1)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,var(--a1),var(--a2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, flexShrink: 0, boxShadow: '0 4px 12px rgba(99,91,255,.28)' }}>
        {number}
      </div>
      <div>
        <div style={{ fontFamily: 'Montserrat', fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

const EVAL_SECTIONS = [
  { key: 'professionalism', label: 'Professionalism', fields: [{ key: 'punctualityAndAttendance', label: '1. Punctuality and Attendance' }, { key: 'dresscodeAndAppearance', label: '2. Dress Code and Appearance' }, { key: 'adherenceToCompanyPolicies', label: '3. Adherence to Company Policies' }] },
  { key: 'workEthic', label: 'Work Ethic', fields: [{ key: 'initiativeAndProactiveness', label: '1. Initiative and Proactiveness' }, { key: 'timeManagement', label: '2. Time Management' }, { key: 'abilityToMeetDeadlines', label: '3. Ability to Meet Deadlines' }] },
  { key: 'technicalSkills', label: 'Technical Skills', fields: [{ key: 'applicationOfAcademicKnowledge', label: '1. Application of Academic Knowledge' }, { key: 'abilityToLearnNewSkillsTools', label: '2. Ability to Learn New Skills/Tools' }, { key: 'qualityOfWorkOutput', label: '3. Quality of Work Output' }] },
  { key: 'communicationSkills', label: 'Communication Skills', fields: [{ key: 'verbalCommunication', label: '1. Verbal Communication' }, { key: 'writtenCommunication', label: '2. Written Communication' }, { key: 'teamCollaboration', label: '3. Team Collaboration' }] },
  { key: 'problemSolvingSkills', label: 'Problem-Solving Skills', fields: [{ key: 'analyticalThinking', label: '1. Analytical Thinking' }, { key: 'creativityAndInnovation', label: '2. Creativity and Innovation' }, { key: 'abilityToHandleChallenges', label: '3. Ability to Handle Challenges' }] },
  { key: 'overallPerformance', label: 'Overall Performance', fields: [{ key: 'contributionToTheTeam', label: '1. Contribution to the Team' }, { key: 'alignmentWithCompanyGoals', label: '2. Alignment with Company Goals' }, { key: 'potentialForFutureEmployment', label: '3. Potential for Future Employment' }] },
];

const OPEN_ENDED = [
  { key: 'strengths', label: 'Strengths', placeholder: "What are the student's key strengths and positive contributions during their internship?" },
  { key: 'areasOfImprovement', label: 'Areas of Improvement', placeholder: 'What areas could the student focus on to improve their performance or skills?' },
  { key: 'projectTaskFeedback', label: 'Project/Task Feedback', placeholder: 'How well did the student handle their assigned tasks or projects? Were there any standout achievements?' },
  { key: 'learningAndGrowth', label: 'Learning and Growth', placeholder: 'Did the student demonstrate a willingness to learn and grow? Provide examples.' },
  { key: 'teamDynamics', label: 'Team Dynamics', placeholder: 'How did the student interact with team members and contribute to the team environment?' },
  { key: 'adaptability', label: 'Adaptability', placeholder: 'How well did the student adapt to new challenges, tools, or changes in the environment?' },
  { key: 'feedbackForStudent', label: 'Feedback for the Student', placeholder: 'What advice or feedback would you give the student to help them succeed in their future career?' },
  { key: 'feedbackForUniversity', label: 'Feedback for the University', placeholder: 'Do you have any suggestions for Samarkand International University of Technology to better prepare students for internships?' },
];

/* ── main component ── */
export default function SupervisorEvaluationFormPage({ publicMode = false }) {
  const isMobile = useIsMobile();
  const apiOpts = useMemo(
    () => publicMode
      ? { auth: false, handleUnauthorized: false, headers: { Authorization: 'Bearer student' } }
      : {},
    [publicMode]
  );
  const [internships, setInternships] = useState([]);
  const [loadingInternships, setLoadingInternships] = useState(true);
  const [selectedInternshipId, setSelectedInternshipId] = useState('');
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [loadingInternship, setLoadingInternship] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [submittedIds, setSubmittedIds] = useState(new Set());
  const [form, setForm] = useState(defaultForm());
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    get('/faculty', apiOpts)
      .then((data) => setInternships(normList(data)))
      .catch((err) => toast.error(err.message || 'Failed to load internships'))
      .finally(() => setLoadingInternships(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedInternshipId) { setSelectedInternship(null); setSelectedStudentId(''); setSubmittedIds(new Set()); return; }
    setLoadingInternship(true);
    setSelectedStudentId('');
    setIsDuplicate(false);
    setSubmittedIds(new Set());
    get(`/faculty/${selectedInternshipId}`, apiOpts)
      .then((data) => setSelectedInternship(data))
      .catch((err) => toast.error(err.message || 'Failed to load internship details'))
      .finally(() => setLoadingInternship(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInternshipId]);

  useEffect(() => {
    if (!selectedInternship) { setSubmittedIds(new Set()); return; }
    const students = selectedInternship.numberOfStudents || selectedInternship.students || [];
    const ids = students.map(getStudentId).filter(Boolean);
    if (ids.length === 0) return;
    Promise.all(
      ids.map((id) =>
        get(`/student-internship-reports?studentID=${encodeURIComponent(id)}&limit=1`, apiOpts)
          .then((r) => (normList(r).length > 0 ? id : null))
          .catch(() => null)
      )
    ).then((results) => setSubmittedIds(new Set(results.filter(Boolean))));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInternship]);

  const attachedStudents = selectedInternship
    ? (selectedInternship.numberOfStudents || selectedInternship.students || [])
    : [];

  const handleStudentSelect = useCallback(async (studentId) => {
    setSelectedStudentId(studentId);
    setIsDuplicate(false);
    if (!studentId || !selectedInternship) return;

    const student = attachedStudents.find((s) => getStudentId(s) === studentId);
    if (!student) return;

    const { start, end } = getDates(selectedInternship);
    const degreeProg = getStudentFaculty(student);
    setForm((prev) => ({
      ...prev,
      studentInformation: {
        ...prev.studentInformation,
        fullname: getStudentName(student),
        studentID: getStudentId(student),
        degreeProgram: degreeProg,
        yearOfStudy: student.year || parseYearFromDegree(degreeProg),
        internshipStartDate: start,
        internshipEndDate: end,
      },
      companyInformation: { ...prev.companyInformation, companyName: selectedInternship.company || '' },
    }));

    setCheckingDuplicate(true);
    try {
      const res = await get(`/student-internship-reports?studentID=${encodeURIComponent(studentId)}&limit=1`, apiOpts);
      if (normList(res).length > 0) { setIsDuplicate(true); toast.warning('A report has already been submitted for this student.'); }
    } catch { /* silently continue */ } finally { setCheckingDuplicate(false); }
  }, [selectedInternship, attachedStudents, apiOpts]);

  const setInfo = (section, field, value) => setForm((p) => ({ ...p, [section]: { ...p[section], [field]: value } }));
  const setEval = (section, field, value) => setForm((p) => ({ ...p, evaluation: { ...p.evaluation, [section]: { ...p.evaluation[section], [field]: value } } }));
  const setOEQ = (field, value) => setForm((p) => ({ ...p, openEndedQuestions: { ...p.openEndedQuestions, [field]: value } }));
  const setFinal = (field, value) => setForm((p) => ({ ...p, finalRecommendation: { ...p.finalRecommendation, [field]: value } }));

  const validate = () => {
    const { studentInformation: si, companyInformation: ci, evaluation: ev, finalRecommendation: fr } = form;
    if (!si.fullname.trim() || !si.studentID.trim()) return false;
    if (!ci.companyName.trim()) return false;
    for (const sec of EVAL_SECTIONS) for (const { key } of sec.fields) if (!ev[sec.key][key] || ev[sec.key][key] < 1) return false;
    if (!fr.finalRating || !fr.supervisorRecommendation || !fr.declaration || !fr.supervisorFullName.trim() || !fr.date) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrors(true);
    if (!validate()) {
      toast.error('Please fill in all required fields.');
      setTimeout(() => {
        const el = document.querySelector('[data-has-error="true"]');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    setSubmitting(true);
    try {
      await post('/student-internship-reports', form, apiOpts);
      setSubmitted(true);
      toast.success('Report submitted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit report.');
    } finally { setSubmitting(false); }
  };

  const resetForm = () => {
    setForm(defaultForm()); setSelectedStudentId(''); setSelectedInternshipId('');
    setSelectedInternship(null); setShowErrors(false); setIsDuplicate(false); setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="pp" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(6,201,160,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={36} color="#06c9a0" />
          </div>
          <div style={{ fontFamily: 'Montserrat', fontSize: 22, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>Report Submitted!</div>
          <div style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 28 }}>The student internship report has been successfully submitted.</div>
          <button className="bp" onClick={resetForm}>Submit Another Report</button>
        </div>
      </div>
    );
  }

  const showForm = selectedStudentId && !checkingDuplicate && !isDuplicate;
  const cols = isMobile ? '1fr' : '1fr 1fr';

  const internshipOptions = internships.map((i) => ({ value: i._id || i.id, label: `${i.name || i.title}${i.company ? ` · ${i.company}` : ''}` }));
  const studentOptions = attachedStudents.map((s) => { const sid = getStudentId(s); return { value: sid, label: `${getStudentName(s)}${getStudentFaculty(s) ? ` · ${getStudentFaculty(s)}` : ''}`, badge: submittedIds.has(sid) ? 'Submitted' : null }; });

  return (
    <div className="pp" style={{ maxWidth: 820, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Montserrat', fontSize: isMobile ? 18 : 22, fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>
          Student Internship Report Form
        </div>
        <div style={{ fontSize: 13, color: 'var(--t3)' }}>Supervisor evaluation of student performance during internship</div>
      </div>

      {/* selection block */}
      <div className="gc" style={{ padding: isMobile ? 16 : 24, marginBottom: 20 }}>
        <SectionHeader number={<Briefcase size={18} />} title="Select Internship & Student" subtitle="Choose the internship and the student to evaluate" />
        <div style={{ marginBottom: 16 }}>
          <label className="fl">Internship *</label>
          {loadingInternships
            ? <div style={{ fontSize: 13, color: 'var(--t3)', padding: '10px 0' }}>Loading internships…</div>
            : <CustomSelect value={selectedInternshipId} onChange={setSelectedInternshipId} options={internshipOptions} placeholder="— Select an internship —" hasError={showErrors} />}
        </div>
        {selectedInternshipId && (
          <div>
            <label className="fl">Student *</label>
            {loadingInternship
              ? <div style={{ fontSize: 13, color: 'var(--t3)', padding: '10px 0' }}>Loading students…</div>
              : attachedStudents.length === 0
              ? <div style={{ fontSize: 13, color: 'var(--t3)', padding: '10px 0', display: 'flex', alignItems: 'center', gap: 6 }}><AlertCircle size={14} color="var(--t3)" /> No students attached.</div>
              : <CustomSelect value={selectedStudentId} onChange={handleStudentSelect} options={studentOptions} placeholder="— Select a student —" hasError={showErrors} />}
          </div>
        )}
        {checkingDuplicate && <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 10 }}>Checking for existing submissions…</div>}
      </div>

      {isDuplicate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
          <AlertCircle size={18} color="#ef4444" />
          <div>
            <div style={{ fontWeight: 700, color: '#ef4444', fontSize: 13 }}>Duplicate Submission</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>A report has already been submitted for this student. Each student can only be evaluated once.</div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit}>

          {/* section 1 — student info */}
          <div className="gc" style={{ padding: isMobile ? 16 : 24, marginBottom: 16 }}>
            <SectionHeader number="1" title="Student Information" />
            <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }} data-has-error={showErrors && !form.studentInformation.fullname.trim() ? "true" : undefined}>
                <label className="fl">Full Name *</label>
                <input className="fi" value={form.studentInformation.fullname}
                  onChange={(e) => setInfo('studentInformation', 'fullname', e.target.value)}
                  style={{ borderColor: showErrors && !form.studentInformation.fullname.trim() ? '#ef4444' : undefined }} />
              </div>
              <div data-has-error={showErrors && !form.studentInformation.studentID.trim() ? "true" : undefined}>
                <label className="fl">Student ID *</label>
                <input className="fi" value={form.studentInformation.studentID}
                  onChange={(e) => setInfo('studentInformation', 'studentID', e.target.value)}
                  style={{ borderColor: showErrors && !form.studentInformation.studentID.trim() ? '#ef4444' : undefined }} />
              </div>
              <div>
                <label className="fl">Degree Program</label>
                <input className="fi" value={form.studentInformation.degreeProgram}
                  onChange={(e) => setInfo('studentInformation', 'degreeProgram', e.target.value)} />
              </div>
              <div>
                <label className="fl">Year of Study</label>
                <input className="fi" type="number" min="1" max="6" value={form.studentInformation.yearOfStudy}
                  onChange={(e) => setInfo('studentInformation', 'yearOfStudy', e.target.value)} />
              </div>
              <div>
                <label className="fl">Internship Start Date</label>
                <input className="fi" type="date" value={form.studentInformation.internshipStartDate}
                  onChange={(e) => setInfo('studentInformation', 'internshipStartDate', e.target.value)} />
              </div>
              <div>
                <label className="fl">Internship End Date</label>
                <input className="fi" type="date" value={form.studentInformation.internshipEndDate}
                  onChange={(e) => setInfo('studentInformation', 'internshipEndDate', e.target.value)} />
              </div>
            </div>
          </div>

          {/* section 2 — company info */}
          <div className="gc" style={{ padding: isMobile ? 16 : 24, marginBottom: 16 }}>
            <SectionHeader number="2" title="Company Information" />
            <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }} data-has-error={showErrors && !form.companyInformation.companyName.trim() ? "true" : undefined}>
                <label className="fl">Company Name *</label>
                <input className="fi" value={form.companyInformation.companyName}
                  onChange={(e) => setInfo('companyInformation', 'companyName', e.target.value)}
                  style={{ borderColor: showErrors && !form.companyInformation.companyName.trim() ? '#ef4444' : undefined }} />
              </div>
              <div>
                <label className="fl">Department</label>
                <input className="fi" value={form.companyInformation.department}
                  onChange={(e) => setInfo('companyInformation', 'department', e.target.value)} />
              </div>
              <div>
                <label className="fl">Supervisor Contact</label>
                <input className="fi" value={form.companyInformation.supervisorContact}
                  onChange={(e) => setInfo('companyInformation', 'supervisorContact', e.target.value)} />
              </div>
            </div>
          </div>

          {/* section 3 — evaluation criteria */}
          <div className="gc" style={{ padding: isMobile ? 16 : 24, marginBottom: 16 }}>
            <SectionHeader number="3" title="Evaluation Criteria" subtitle="1 = Poor · 2 = Below Average · 3 = Satisfactory · 4 = Good · 5 = Excellent" />
            <div style={{ background: 'rgba(99,91,255,.05)', border: '1px solid rgba(99,91,255,.12)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12.5, color: 'var(--t2)' }}>
              Rate each criterion from 1 (Poor) to 5 (Excellent). All ratings are required.
            </div>
            {EVAL_SECTIONS.map((sec) => (
              <div key={sec.key} style={{ background: 'rgba(0,0,0,.025)', borderRadius: 12, padding: isMobile ? '14px' : '16px 18px', marginBottom: 14, border: '1px solid rgba(0,0,0,.06)' }}>
                <div style={{ fontFamily: 'Montserrat', fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 16 }}>{sec.label}</div>
                {sec.fields.map(({ key, label }) => (
                  <div key={key} style={{ marginBottom: 18 }} data-has-error={showErrors && !form.evaluation[sec.key][key] ? "true" : undefined}>
                    <div style={{ fontSize: 12.5, color: 'var(--t2)', fontWeight: 600, marginBottom: 10 }}>{label}</div>
                    <RatingField
                      name={`${sec.key}-${key}`}
                      value={form.evaluation[sec.key][key]}
                      onChange={(v) => setEval(sec.key, key, v)}
                      hasError={showErrors}
                      compact={isMobile}
                    />
                  </div>
                ))}
                <div style={{ marginTop: 10 }}>
                  <label className="fl">Comments on {sec.label} (optional)</label>
                  <textarea className="fi" placeholder="Add comments…"
                    value={form.evaluation[sec.key].comments}
                    onChange={(e) => setEval(sec.key, 'comments', e.target.value)}
                    style={{ minHeight: 68 }} />
                </div>
              </div>
            ))}
          </div>

          {/* section 4 — open-ended questions */}
          <div className="gc" style={{ padding: isMobile ? 16 : 24, marginBottom: 16 }}>
            <SectionHeader number="4" title="Open-Ended Questions" subtitle="All fields in this section are optional" />
            {OPEN_ENDED.map(({ key, label, placeholder }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label className="fl">{label}</label>
                <textarea className="fi" placeholder={placeholder}
                  value={form.openEndedQuestions[key]}
                  onChange={(e) => setOEQ(key, e.target.value)}
                  style={{ minHeight: 80 }} />
              </div>
            ))}
          </div>

          {/* section 5 — final recommendation */}
          <div className="gc" style={{ padding: isMobile ? 16 : 24, marginBottom: 24 }}>
            <SectionHeader number="5" title="Final Recommendation" />

            <div style={{ marginBottom: 16 }} data-has-error={showErrors && !form.finalRecommendation.finalRating ? "true" : undefined}>
              <label className="fl">Final Rating *</label>
              <CustomSelect
                value={form.finalRecommendation.finalRating}
                onChange={(v) => setFinal('finalRating', v)}
                options={FINAL_RATINGS.map((r) => ({ value: r, label: r }))}
                placeholder="— Select final rating —"
                hasError={showErrors}
              />
              {showErrors && !form.finalRecommendation.finalRating && (
                <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>Required</span>
              )}
            </div>

            <div style={{ marginBottom: 16 }} data-has-error={showErrors && !form.finalRecommendation.supervisorRecommendation ? "true" : undefined}>
              <label className="fl">Supervisor's Recommendation *</label>
              <CustomSelect
                value={form.finalRecommendation.supervisorRecommendation}
                onChange={(v) => setFinal('supervisorRecommendation', v)}
                options={SUPER_RECS.map((r) => ({ value: r, label: r }))}
                placeholder="— Select recommendation —"
                hasError={showErrors}
              />
              {showErrors && !form.finalRecommendation.supervisorRecommendation && (
                <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block' }}>Required</span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, marginBottom: 20 }}>
              <div data-has-error={showErrors && !form.finalRecommendation.supervisorFullName.trim() ? "true" : undefined}>
                <label className="fl">Supervisor's Full Name *</label>
                <input className="fi" value={form.finalRecommendation.supervisorFullName}
                  onChange={(e) => setFinal('supervisorFullName', e.target.value)}
                  style={{ borderColor: showErrors && !form.finalRecommendation.supervisorFullName.trim() ? '#ef4444' : undefined }} />
              </div>
              <div data-has-error={showErrors && !form.finalRecommendation.date ? "true" : undefined}>
                <label className="fl">Date *</label>
                <input className="fi" type="date" value={form.finalRecommendation.date}
                  onChange={(e) => setFinal('date', e.target.value)}
                  style={{ borderColor: showErrors && !form.finalRecommendation.date ? '#ef4444' : undefined }} />
              </div>
            </div>

            <div style={{ background: 'rgba(99,91,255,.04)', border: '1px solid rgba(99,91,255,.12)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }} data-has-error={showErrors && !form.finalRecommendation.declaration ? "true" : undefined}>
              <div style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 12 }}>
                <strong>Declaration:</strong> By checking the box below and submitting this form, I confirm that this evaluation is accurate and complete.
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.finalRecommendation.declaration}
                  onChange={(e) => setFinal('declaration', e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: showErrors && !form.finalRecommendation.declaration ? '#ef4444' : 'var(--t1)' }}>
                  I agree — this evaluation is accurate and complete *
                </span>
              </label>
            </div>

            <button className="bp" type="submit" disabled={submitting || isDuplicate}
              style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
