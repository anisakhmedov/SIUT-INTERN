import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { get, post } from '../utils/apiClient';
import { toast } from '../utils/toast';
import { AlertCircle, CheckCircle2, Briefcase } from 'lucide-react';
import { CustomSelect, CustomDatePicker, RatingField } from './ui';
import { useSEO } from '../utils/useSEO';

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

const SUBMITTED_KEY = 'siut_student_evals_submitted';
const getSubmittedSet = () => {
  try { return new Set(JSON.parse(sessionStorage.getItem(SUBMITTED_KEY) || '[]')); }
  catch { return new Set(); }
};
const markSubmitted = (studentId) => {
  try { const s = getSubmittedSet(); s.add(studentId); sessionStorage.setItem(SUBMITTED_KEY, JSON.stringify([...s])); }
  catch {}
};

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

function useIsMobile() {
  const [mob, setMob] = useState(() => window.innerWidth < 680);
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 680);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mob;
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
  { key: 'alignmentWithAcademicKnowledge', label: '6. Alignment with Academic Knowledge *', placeholder: 'How did your academic studies at Samarkand International University of Technology prepare you for this internship?', required: true },
  { key: 'newKnowledgeGained', label: '7. New Knowledge Gained *', placeholder: 'What new knowledge or insights did you gain during the internship that was not covered in your academic program?', required: true },
  { key: 'careerGoals', label: '8. Career Goals *', placeholder: 'How has this internship influenced your career goals or aspirations?', required: true },
];

const FEEDBACK_TEXT_FIELDS = [
  { key: 'companySupport', label: '9. Company Support *', placeholder: 'How supportive was the company in terms of guidance, resources, and mentorship?', required: true },
  { key: 'workEnvironment', label: '10. Work Environment *', placeholder: 'Describe the work environment and culture of the company.', required: true },
  { key: 'suggestionsForCompany', label: '11. Suggestions for the Company *', placeholder: 'Do you have any suggestions for the company to improve their internship program?', required: true },
  { key: 'universityPreparation', label: '12. University Preparation *', placeholder: 'How well did the university prepare you for the internship? Are there any areas where the university could improve?', required: true },
  { key: 'internshipCoordination', label: '13. Internship Coordination *', placeholder: "How effective was the university's coordination with the company during the internship program?", required: true },
  { key: 'suggestionsForUniversity', label: '14. Suggestions for the University *', placeholder: 'Do you have any suggestions for the university to improve the internship program or support for students?', required: true },
];

/* ── main component ── */
export default function StudentEvaluationFormPage({ publicMode = false }) {
  useSEO({
    title: 'Student Self-Evaluation',
    description: 'Complete the student self-evaluation form for your SIUT practical training internship.',
    noIndex: !publicMode,
  });

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
  const [submittedMeta, setSubmittedMeta] = useState({ studentName: '', internshipName: '' });

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
        get(`/individual-student-evaluations?studentID=${encodeURIComponent(id)}&limit=1`, apiOpts)
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
      const res = await get(`/individual-student-evaluations?studentID=${encodeURIComponent(studentId)}&limit=1`, apiOpts);
      if (normList(res).length > 0) { setIsDuplicate(true); toast.warning('An evaluation has already been submitted for this student.'); }
    } catch { /* silently continue */ } finally { setCheckingDuplicate(false); }
  }, [selectedInternship, attachedStudents, apiOpts]);

  const setInfo = (section, field, value) => setForm((p) => ({ ...p, [section]: { ...p[section], [field]: value } }));
  const setFeedback = (field, value) => setForm((p) => ({ ...p, feedbackForCompany: { ...p.feedbackForCompany, [field]: value } }));
  const wordCount = (text) => { const w = String(text || '').trim().match(/\S+/g); return w ? w.length : 0; };

  const validate = () => {
    const { studentInformation: si, companyInformation: ci, internshipOverview: io, reflectionOnLearning: rl, feedbackForCompany: fc } = form;
    if (!si.fullname.trim() || !si.studentID.trim()) return false;
    if (!si.degreeProgram.trim() || !String(si.yearOfStudy).trim()) return false;
    if (!si.internshipStartDate.trim() || !si.internshipEndDate.trim()) return false;
    if (!ci.companyName.trim() || !ci.department.trim() || !ci.supervisorContact.trim()) return false;
    for (const { key, required } of OVERVIEW_FIELDS) if (required && !io[key].trim()) return false;
    for (const { key, required } of REFLECTION_FIELDS) if (required && !rl[key].trim()) return false;
    for (const { key, required } of FEEDBACK_TEXT_FIELDS) if (required && !fc[key].trim()) return false;
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
      const dupCheck = await get(
        `/individual-student-evaluations?studentID=${encodeURIComponent(selectedStudentId)}&limit=1`,
        apiOpts
      ).catch(() => null);
      if (normList(dupCheck).length > 0) {
        setIsDuplicate(true);
        setSubmittedIds((prev) => new Set([...prev, selectedStudentId]));
        toast.warning('An evaluation has already been submitted for this student.');
        setSubmitting(false);
        return;
      }
      await post('/individual-student-evaluations', form, apiOpts);
      setSubmittedMeta({
        studentName: form.studentInformation.fullname,
        internshipName: selectedInternship?.name || selectedInternship?.title || '',
      });
      setSubmitted(true);
      toast.success('Evaluation submitted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit evaluation.');
    } finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="pp" style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', minHeight: '70vh' }}>
        <div style={{ width: '100%', textAlign: 'center', padding: isMobile ? '40px 16px' : '60px 32px' }}>
          {/* animated ring + icon */}
          <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 32px' }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'conic-gradient(#06c9a0, #635bff, #06c9a0)',
              animation: 'spin 3s linear infinite',
              padding: 3,
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg)' }} />
            </div>
            <div style={{
              position: 'absolute', inset: 6, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(6,201,160,.18), rgba(99,91,255,.18))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle2 size={42} color="#06c9a0" strokeWidth={1.8} />
            </div>
          </div>

          {/* title */}
          <div style={{ fontFamily: 'Montserrat', fontSize: isMobile ? 24 : 28, fontWeight: 800, color: 'var(--t1)', marginBottom: 10, letterSpacing: '-.4px' }}>
            Successfully Submitted!
          </div>
          <div style={{ fontSize: 14, color: 'var(--t3)', marginBottom: 32, lineHeight: 1.6 }}>
            Your internship evaluation has been recorded.
          </div>

          {/* info card */}
          <div style={{
            background: 'rgba(99,91,255,.06)', border: '1px solid rgba(99,91,255,.14)',
            borderRadius: 16, padding: '20px 24px', marginBottom: 32, textAlign: 'left',
          }}>
            {submittedMeta.studentName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: submittedMeta.internshipName ? 12 : 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#635bff,#06c9a0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>
                    {submittedMeta.studentName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 500, marginBottom: 1 }}>Student</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{submittedMeta.studentName}</div>
                </div>
              </div>
            )}
            {submittedMeta.internshipName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: submittedMeta.studentName ? 12 : 0, borderTop: submittedMeta.studentName ? '1px solid rgba(99,91,255,.1)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(6,201,160,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Briefcase size={16} color="#06c9a0" />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 500, marginBottom: 1 }}>Internship</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{submittedMeta.internshipName}</div>
                </div>
              </div>
            )}
          </div>

          {/* notice */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: 'rgba(6,201,160,.07)', border: '1px solid rgba(6,201,160,.2)',
            borderRadius: 12, padding: '12px 16px',
            fontSize: 13, color: 'var(--t2)', lineHeight: 1.55, textAlign: 'left',
          }}>
            <CheckCircle2 size={15} color="#06c9a0" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>This evaluation has been saved and cannot be re-submitted. Each student may only submit once per internship.</span>
          </div>
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
            {/* hidden studentID — auto-filled on student select, sent in payload */}
            <input type="hidden" value={form.studentInformation.studentID} readOnly />
            <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }} data-has-error={showErrors && !form.studentInformation.fullname.trim() ? "true" : undefined}>
                <label className="fl">Full Name *</label>
                <input className="fi" value={form.studentInformation.fullname}
                  onChange={(e) => setInfo('studentInformation', 'fullname', e.target.value)}
                  style={{ borderColor: showErrors && !form.studentInformation.fullname.trim() ? '#ef4444' : undefined }} />
                {showErrors && !form.studentInformation.fullname.trim() && (
                  <span style={{ fontSize: 11, color: '#ef4444' }}>This field is required</span>
                )}
              </div>
              <div data-has-error={showErrors && !form.studentInformation.degreeProgram.trim() ? "true" : undefined}>
                <label className="fl">Degree Program *</label>
                <input className="fi" value={form.studentInformation.degreeProgram}
                  onChange={(e) => setInfo('studentInformation', 'degreeProgram', e.target.value)}
                  style={{ borderColor: showErrors && !form.studentInformation.degreeProgram.trim() ? '#ef4444' : undefined }} />
                {showErrors && !form.studentInformation.degreeProgram.trim() && (
                  <span style={{ fontSize: 11, color: '#ef4444' }}>This field is required</span>
                )}
              </div>
              <div data-has-error={showErrors && !String(form.studentInformation.yearOfStudy).trim() ? "true" : undefined}>
                <label className="fl">Year of Study *</label>
                <input className="fi" type="number" min="1" max="6" value={form.studentInformation.yearOfStudy}
                  onChange={(e) => setInfo('studentInformation', 'yearOfStudy', e.target.value)}
                  style={{ borderColor: showErrors && !String(form.studentInformation.yearOfStudy).trim() ? '#ef4444' : undefined }} />
                {showErrors && !String(form.studentInformation.yearOfStudy).trim() && (
                  <span style={{ fontSize: 11, color: '#ef4444' }}>This field is required</span>
                )}
              </div>
              <div data-has-error={showErrors && !form.studentInformation.internshipStartDate.trim() ? "true" : undefined}>
                <label className="fl">Internship Start Date *</label>
                <CustomDatePicker value={form.studentInformation.internshipStartDate}
                  onChange={(v) => setInfo('studentInformation', 'internshipStartDate', v)}
                  hasError={showErrors} />
                {showErrors && !form.studentInformation.internshipStartDate.trim() && (
                  <span style={{ fontSize: 11, color: '#ef4444' }}>This field is required</span>
                )}
              </div>
              <div data-has-error={showErrors && !form.studentInformation.internshipEndDate.trim() ? "true" : undefined}>
                <label className="fl">Internship End Date *</label>
                <CustomDatePicker value={form.studentInformation.internshipEndDate}
                  onChange={(v) => setInfo('studentInformation', 'internshipEndDate', v)}
                  hasError={showErrors} />
                {showErrors && !form.studentInformation.internshipEndDate.trim() && (
                  <span style={{ fontSize: 11, color: '#ef4444' }}>This field is required</span>
                )}
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
                {showErrors && !form.companyInformation.companyName.trim() && (
                  <span style={{ fontSize: 11, color: '#ef4444' }}>This field is required</span>
                )}
              </div>
              <div data-has-error={showErrors && !form.companyInformation.department.trim() ? "true" : undefined}>
                <label className="fl">Department *</label>
                <input className="fi" value={form.companyInformation.department}
                  onChange={(e) => setInfo('companyInformation', 'department', e.target.value)}
                  style={{ borderColor: showErrors && !form.companyInformation.department.trim() ? '#ef4444' : undefined }} />
                {showErrors && !form.companyInformation.department.trim() && (
                  <span style={{ fontSize: 11, color: '#ef4444' }}>This field is required</span>
                )}
              </div>
              <div data-has-error={showErrors && !form.companyInformation.supervisorContact.trim() ? "true" : undefined}>
                <label className="fl">Supervisor Contact *</label>
                <input className="fi" value={form.companyInformation.supervisorContact}
                  onChange={(e) => setInfo('companyInformation', 'supervisorContact', e.target.value)}
                  style={{ borderColor: showErrors && !form.companyInformation.supervisorContact.trim() ? '#ef4444' : undefined }} />
                {showErrors && !form.companyInformation.supervisorContact.trim() && (
                  <span style={{ fontSize: 11, color: '#ef4444' }}>This field is required</span>
                )}
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
            <SectionHeader number="4" title="Reflection on Learning Experience" subtitle="Share your academic reflection on the internship" />
            {REFLECTION_FIELDS.map(({ key, label, placeholder, required }) => (
              <div key={key} style={{ marginBottom: 16 }} data-has-error={showErrors && required && !form.reflectionOnLearning[key].trim() ? "true" : undefined}>
                <label className="fl">{label}</label>
                <textarea className="fi" placeholder={placeholder}
                  value={form.reflectionOnLearning[key]}
                  onChange={(e) => setInfo('reflectionOnLearning', key, e.target.value)}
                  style={{ minHeight: 80, borderColor: showErrors && required && !form.reflectionOnLearning[key].trim() ? '#ef4444' : undefined }} />
                {showErrors && required && !form.reflectionOnLearning[key].trim() && (
                  <span style={{ fontSize: 11, color: '#ef4444' }}>This field is required</span>
                )}
              </div>
            ))}
          </div>

          {/* section 5 — feedback + final */}
          <div className="gc" style={{ padding: isMobile ? 16 : 24, marginBottom: 24 }}>
            <SectionHeader number="5" title="Feedback & Final Report" subtitle="Company feedback, overall rating, and your final report" />

            {FEEDBACK_TEXT_FIELDS.map(({ key, label, placeholder, required }) => (
              <div key={key} style={{ marginBottom: 16 }} data-has-error={showErrors && required && !form.feedbackForCompany[key].trim() ? "true" : undefined}>
                <label className="fl">{label}</label>
                <textarea className="fi" placeholder={placeholder}
                  value={form.feedbackForCompany[key]}
                  onChange={(e) => setFeedback(key, e.target.value)}
                  style={{ minHeight: 80, borderColor: showErrors && required && !form.feedbackForCompany[key].trim() ? '#ef4444' : undefined }} />
                {showErrors && required && !form.feedbackForCompany[key].trim() && (
                  <span style={{ fontSize: 11, color: '#ef4444' }}>This field is required</span>
                )}
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
