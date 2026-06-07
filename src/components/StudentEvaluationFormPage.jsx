import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { get, post } from '../utils/apiClient';
import { toast } from '../utils/toast';
import { ChevronDown, AlertCircle, CheckCircle2, Briefcase } from 'lucide-react';

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
  internshipOverview: { internshipRole: '', keyProjectsTasks: '', skillsDeveloped: '', challengesFaced: '', achievements: '' },
  reflectionOnLearning: { alignmentWithAcademicKnowledge: '', newKnowledgeGained: '', careerGoals: '' },
  feedbackForCompany: {
    companySupport: '', workEnvironment: '', suggestionsForCompany: '',
    universityPreparation: '', internshipCoordination: '', suggestionsForUniversity: '',
    finalReport: '', overallRating: 0, finalComments: '', studentDeclaration: false,
  },
});

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

const OVERVIEW_FIELDS = [
  { key: 'internshipRole', label: '1. Internship Role / Position *', placeholder: 'Briefly describe your role and responsibilities during the internship.', required: true },
  { key: 'keyProjectsTasks', label: '2. Key Projects / Tasks *', placeholder: 'List the main projects or tasks you worked on during the internship.', required: true },
  { key: 'skillsDeveloped', label: '3. Skills Developed *', placeholder: 'What technical, professional, or soft skills did you gain or improve during the internship?', required: true },
  { key: 'challengesFaced', label: '4. Challenges Faced *', placeholder: 'What challenges did you encounter, how did you overcome them?', required: true },
  { key: 'achievements', label: '5. Achievements *', placeholder: 'What were your key achievements or accomplishments during the internship?', required: true },
];

const REFLECTION_FIELDS = [
  { key: 'alignmentWithAcademicKnowledge', label: '6. Alignment with Academic Knowledge', placeholder: 'How did your academic studies at Samarkand International University of Technology prepare you for this internship?' },
  { key: 'newKnowledgeGained', label: '7. New Knowledge Gained', placeholder: 'What new knowledge or insights did you gain during the internship that was not covered in your academic program?' },
  { key: 'careerGoals', label: '8. Career Goals', placeholder: 'How has this internship influenced your career goals or aspirations?' },
];

const FEEDBACK_TEXT_FIELDS = [
  { key: 'companySupport', label: '9. Company Support', placeholder: 'How supportive was the company in terms of guidance, resources, and mentorship?' },
  { key: 'workEnvironment', label: '10. Work Environment', placeholder: 'Describe the work environment and culture of the company.' },
  { key: 'suggestionsForCompany', label: '11. Suggestions for the Company', placeholder: 'Do you have any suggestions for the company to improve their internship program?' },
  { key: 'universityPreparation', label: '12. University Preparation', placeholder: 'How well did the university prepare you for the internship? Are there any areas where the university could improve?' },
  { key: 'internshipCoordination', label: '13. Internship Coordination', placeholder: "How effective was the university's coordination with the company during the internship program?" },
  { key: 'suggestionsForUniversity', label: '14. Suggestions for the University', placeholder: 'Do you have any suggestions for the university to improve the internship program or support for students?' },
];

/* ── main component ── */
export default function StudentEvaluationFormPage() {
  const isMobile = useIsMobile();
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
    get('/faculty')
      .then((data) => setInternships(normList(data)))
      .catch((err) => toast.error(err.message || 'Failed to load internships'))
      .finally(() => setLoadingInternships(false));
  }, []);

  useEffect(() => {
    if (!selectedInternshipId) { setSelectedInternship(null); setSelectedStudentId(''); setSubmittedIds(new Set()); return; }
    setLoadingInternship(true);
    setSelectedStudentId('');
    setIsDuplicate(false);
    setSubmittedIds(new Set());
    get(`/faculty/${selectedInternshipId}`)
      .then((data) => setSelectedInternship(data))
      .catch((err) => toast.error(err.message || 'Failed to load internship details'))
      .finally(() => setLoadingInternship(false));
  }, [selectedInternshipId]);

  useEffect(() => {
    if (!selectedInternship) { setSubmittedIds(new Set()); return; }
    const students = selectedInternship.numberOfStudents || selectedInternship.students || [];
    const ids = students.map(getStudentId).filter(Boolean);
    if (ids.length === 0) return;
    Promise.all(
      ids.map((id) =>
        get(`/individual-student-evaluations?studentID=${encodeURIComponent(id)}&limit=1`)
          .then((r) => (normList(r).length > 0 ? id : null))
          .catch(() => null)
      )
    ).then((results) => setSubmittedIds(new Set(results.filter(Boolean))));
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
      const res = await get(`/individual-student-evaluations?studentID=${encodeURIComponent(studentId)}&limit=1`);
      if (normList(res).length > 0) { setIsDuplicate(true); toast.warning('An evaluation has already been submitted for this student.'); }
    } catch { /* silently continue */ } finally { setCheckingDuplicate(false); }
  }, [selectedInternship, attachedStudents]);

  const setInfo = (section, field, value) => setForm((p) => ({ ...p, [section]: { ...p[section], [field]: value } }));
  const setFeedback = (field, value) => setForm((p) => ({ ...p, feedbackForCompany: { ...p.feedbackForCompany, [field]: value } }));
  const wordCount = (text) => { const w = String(text || '').trim().match(/\S+/g); return w ? w.length : 0; };

  const validate = () => {
    const { studentInformation: si, companyInformation: ci, internshipOverview: io, feedbackForCompany: fc } = form;
    if (!si.fullname.trim() || !si.studentID.trim()) return false;
    if (!ci.companyName.trim()) return false;
    for (const { key, required } of OVERVIEW_FIELDS) if (required && !io[key].trim()) return false;
    if (!fc.finalReport.trim()) return false;
    if (!fc.overallRating || fc.overallRating < 1 || fc.overallRating > 5) return false;
    if (!fc.studentDeclaration) return false;
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
      await post('/individual-student-evaluations', form);
      setSubmitted(true);
      toast.success('Evaluation submitted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit evaluation.');
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
          <div style={{ fontFamily: 'Montserrat', fontSize: 22, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>Evaluation Submitted!</div>
          <div style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 28 }}>Your individual student evaluation has been successfully submitted.</div>
          <button className="bp" onClick={resetForm}>Submit Another Evaluation</button>
        </div>
      </div>
    );
  }

  const showForm = selectedStudentId && !checkingDuplicate && !isDuplicate;
  const finalReportWords = wordCount(form.feedbackForCompany.finalReport);
  const cols = isMobile ? '1fr' : '1fr 1fr';

  const internshipOptions = internships.map((i) => ({ value: i._id || i.id, label: `${i.name || i.title}${i.company ? ` · ${i.company}` : ''}` }));
  const studentOptions = attachedStudents.map((s) => { const sid = getStudentId(s); return { value: sid, label: `${getStudentName(s)}${getStudentFaculty(s) ? ` · ${getStudentFaculty(s)}` : ''}`, badge: submittedIds.has(sid) ? 'Submitted' : null }; });

  return (
    <div className="pp" style={{ maxWidth: 820, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Montserrat', fontSize: isMobile ? 18 : 22, fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>
          Individual Student Internship Evaluation Form
        </div>
        <div style={{ fontSize: 13, color: 'var(--t3)' }}>Student self-evaluation of their internship experience</div>
      </div>

      {/* selection block */}
      <div className="gc" style={{ padding: isMobile ? 16 : 24, marginBottom: 20 }}>
        <SectionHeader number={<Briefcase size={18} />} title="Select Internship & Student" subtitle="Choose the internship and your student record" />
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
              : <CustomSelect value={selectedStudentId} onChange={handleStudentSelect} options={studentOptions} placeholder="— Select your name —" hasError={showErrors} />}
          </div>
        )}
        {checkingDuplicate && <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 10 }}>Checking for existing submissions…</div>}
      </div>

      {isDuplicate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
          <AlertCircle size={18} color="#ef4444" />
          <div>
            <div style={{ fontWeight: 700, color: '#ef4444', fontSize: 13 }}>Duplicate Submission</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>An evaluation has already been submitted for this student. Each student can only submit once.</div>
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

          {/* section 3 — internship overview */}
          <div className="gc" style={{ padding: isMobile ? 16 : 24, marginBottom: 16 }}>
            <SectionHeader number="3" title="Internship Overview" subtitle="Describe your internship experience" />
            {OVERVIEW_FIELDS.map(({ key, label, placeholder, required }) => (
              <div key={key} style={{ marginBottom: 16 }} data-has-error={showErrors && required && !form.internshipOverview[key].trim() ? "true" : undefined}>
                <label className="fl">{label}</label>
                <textarea className="fi" placeholder={placeholder}
                  value={form.internshipOverview[key]}
                  onChange={(e) => setInfo('internshipOverview', key, e.target.value)}
                  style={{ minHeight: 88, borderColor: showErrors && required && !form.internshipOverview[key].trim() ? '#ef4444' : undefined }} />
                {showErrors && required && !form.internshipOverview[key].trim() && (
                  <span style={{ fontSize: 11, color: '#ef4444' }}>This field is required</span>
                )}
              </div>
            ))}
          </div>

          {/* section 4 — reflection on learning */}
          <div className="gc" style={{ padding: isMobile ? 16 : 24, marginBottom: 16 }}>
            <SectionHeader number="4" title="Reflection on Learning Experience" subtitle="Optional — share your academic reflection" />
            {REFLECTION_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label className="fl">{label}</label>
                <textarea className="fi" placeholder={placeholder}
                  value={form.reflectionOnLearning[key]}
                  onChange={(e) => setInfo('reflectionOnLearning', key, e.target.value)}
                  style={{ minHeight: 80 }} />
              </div>
            ))}
          </div>

          {/* section 5 — feedback + final */}
          <div className="gc" style={{ padding: isMobile ? 16 : 24, marginBottom: 24 }}>
            <SectionHeader number="5" title="Feedback & Final Report" subtitle="Company feedback, overall rating, and your final report" />

            {FEEDBACK_TEXT_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label className="fl">{label}</label>
                <textarea className="fi" placeholder={placeholder}
                  value={form.feedbackForCompany[key]}
                  onChange={(e) => setFeedback(key, e.target.value)}
                  style={{ minHeight: 80 }} />
              </div>
            ))}

            {/* final report */}
            <div style={{ marginBottom: 16 }} data-has-error={showErrors && !form.feedbackForCompany.finalReport.trim() ? "true" : undefined}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label className="fl" style={{ marginBottom: 0 }}>Final Report * (300–400 words recommended)</label>
                <span style={{ fontSize: 11, color: finalReportWords >= 300 ? '#06c9a0' : 'var(--t3)', fontWeight: 600 }}>
                  {finalReportWords} words
                </span>
              </div>
              <textarea className="fi" placeholder="Write a detailed report describing what you did at the company, including specific tasks you performed and the projects you worked on during your internship period."
                value={form.feedbackForCompany.finalReport}
                onChange={(e) => setFeedback('finalReport', e.target.value)}
                style={{ minHeight: 160, borderColor: showErrors && !form.feedbackForCompany.finalReport.trim() ? '#ef4444' : undefined }} />
              {showErrors && !form.feedbackForCompany.finalReport.trim() && (
                <span style={{ fontSize: 11, color: '#ef4444' }}>Final report is required</span>
              )}
            </div>

            {/* overall rating */}
            <div style={{ marginBottom: 20 }} data-has-error={showErrors && !form.feedbackForCompany.overallRating ? "true" : undefined}>
              <label className="fl">Overall Rating * (1 = Poor · 2 = Below Average · 3 = Satisfactory · 4 = Good · 5 = Excellent)</label>
              <RatingField
                name="overall-rating"
                value={form.feedbackForCompany.overallRating}
                onChange={(v) => setFeedback('overallRating', v)}
                hasError={showErrors}
                compact={isMobile}
              />
            </div>

            {/* final comments */}
            <div style={{ marginBottom: 20 }}>
              <label className="fl">Final Comments (optional)</label>
              <textarea className="fi" placeholder="Any additional comments or reflections on your internship experience you would like to share?"
                value={form.feedbackForCompany.finalComments}
                onChange={(e) => setFeedback('finalComments', e.target.value)}
                style={{ minHeight: 80 }} />
            </div>

            {/* declaration */}
            <div style={{ background: 'rgba(99,91,255,.04)', border: '1px solid rgba(99,91,255,.12)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }} data-has-error={showErrors && !form.feedbackForCompany.studentDeclaration ? "true" : undefined}>
              <div style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 12 }}>
                <strong>Student Declaration:</strong> I confirm that the information provided in this report is accurate and reflects my true experience during the internship program.
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.feedbackForCompany.studentDeclaration}
                  onChange={(e) => setFeedback('studentDeclaration', e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: showErrors && !form.feedbackForCompany.studentDeclaration ? '#ef4444' : 'var(--t1)' }}>
                  I agree — the information provided is accurate *
                </span>
              </label>
            </div>

            <button className="bp" type="submit" disabled={submitting || isDuplicate}
              style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Submitting…' : 'Submit Evaluation'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
