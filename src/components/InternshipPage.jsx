import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { get, patch, post } from '../utils/apiClient';
import { toast } from '../utils/toast';
import { generateFinalReport } from '../utils/finalReportApi';
import { getAuthTokenFromStorage } from '../utils/storageUtils';
import PageState from './PageState';

const INTERNSHIP_STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];

const clampProgress = (value) => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

function hasReportContent(day) {
  if (!day?.shortReport) return false;

  const title = typeof day.shortReport.title === 'string' ? day.shortReport.title.trim() : '';
  const description = typeof day.shortReport.description === 'string' ? day.shortReport.description.trim() : '';
  const reportImages = Array.isArray(day.shortReport.images) ? day.shortReport.images : [];
  const dayImages = Array.isArray(day.images) ? day.images : [];

  return Boolean(title || description || reportImages.length || dayImages.length);
}

function calculateProgressPercent(days) {
  const dayList = Array.isArray(days) ? days : [];
  if (dayList.length === 0) return 0;

  const reportedDays = dayList.filter((day) => hasReportContent(day)).length;
  return clampProgress(Math.round((reportedDays / dayList.length) * 100));
}

function parseProgressPercent(value) {
  const numericValue = typeof value === 'number'
    ? value
    : typeof value === 'string'
      ? Number.parseFloat(value.replace('%', '').trim())
      : NaN;

  return Number.isFinite(numericValue) ? clampProgress(Math.round(numericValue)) : null;
}

function normalizeInternshipStatus(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'completed') return 'Completed';
  if (raw === 'in progress' || raw === 'active') return 'In Progress';
  return 'Pending';
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInlineMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

function renderSimpleMarkdown(text) {
  const source = String(text || '').trim();
  if (!source) return '<p>No plan provided.</p>';

  const lines = source.split(/\r?\n/);
  const chunks = [];
  let inList = false;

  lines.forEach((line) => {
    const escaped = escapeHtml(line.trim());
    if (!escaped) {
      if (inList) {
        chunks.push('</ul>');
        inList = false;
      }
      return;
    }

    if (escaped.startsWith('- ')) {
      if (!inList) {
        chunks.push('<ul>');
        inList = true;
      }
      chunks.push(`<li>${renderInlineMarkdown(escaped.slice(2))}</li>`);
      return;
    }

    if (inList) {
      chunks.push('</ul>');
      inList = false;
    }

    if (escaped.startsWith('## ')) {
      chunks.push(`<h3>${renderInlineMarkdown(escaped.slice(3))}</h3>`);
      return;
    }

    chunks.push(`<p>${renderInlineMarkdown(escaped)}</p>`);
  });

  if (inList) chunks.push('</ul>');

  return chunks.join('');
}

function CustomFilterSelect({ id, value, onChange, options = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) || options[0] || null,
    [options, value],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="ip-custom-select" ref={rootRef}>
      <button
        id={id}
        type="button"
        className={`ip-custom-trigger ${isOpen ? 'ip-custom-trigger--open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="ip-custom-trigger-text">{selectedOption?.label || 'Select option'}</span>
        <span className={`ip-custom-chevron ${isOpen ? 'ip-custom-chevron--open' : ''}`}></span>
      </button>

      {isOpen && (
        <div className="ip-custom-menu" role="listbox" aria-labelledby={id}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`ip-custom-option ${isSelected ? 'ip-custom-option--selected' : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span>{option.label}</span>
                {isSelected && <span className="ip-custom-option-mark">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function InternshipPage({ facultyId, onBack, user, initialDayIndex, focusCommentKey, students = [] }) {
  const [faculty, setFaculty] = useState(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportDayDate, setReportDayDate] = useState('');
  const [reportImages, setReportImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isInternshipEditMode, setIsInternshipEditMode] = useState(false);
  const [baseInfoName, setBaseInfoName] = useState('');
  const [baseInfoCompany, setBaseInfoCompany] = useState('');
  const [baseInfoLocation, setBaseInfoLocation] = useState('');
  const [baseInfoDuration, setBaseInfoDuration] = useState('');
  const [baseInfoStatus, setBaseInfoStatus] = useState('');
  const [baseInfoProgressAll, setBaseInfoProgressAll] = useState('');
  const [baseInfoPlan, setBaseInfoPlan] = useState('');
  const [activeImageSrc, setActiveImageSrc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showFeedbackView, setShowFeedbackView] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // 0-100 for progress tracking
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [newDayDate, setNewDayDate] = useState(new Date().toISOString().slice(0, 10));
  const [highlightedCommentKey, setHighlightedCommentKey] = useState('');
  const [showStudents, setShowStudents] = useState(false);
  const [showStudentManager, setShowStudentManager] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedStudentFaculty, setSelectedStudentFaculty] = useState('all');
  const [selectedStudentYear, setSelectedStudentYear] = useState('all');
  const [showPlan, setShowPlan] = useState(true);
  const [showFinalReportModal, setShowFinalReportModal] = useState(false);
  const [finalReportLoading, setFinalReportLoading] = useState(false);
  const [finalReportMarkdown, setFinalReportMarkdown] = useState('');
  const [finalReportError, setFinalReportError] = useState('');
  const [reportFormSnapshot, setReportFormSnapshot] = useState(null);
  const commentsSectionRef = useRef(null);
  const reportDescriptionRef = useRef(null);
  const planEditorRef = useRef(null);
  const dayCarouselRef = useRef(null);
  const dayItemRefs = useRef([]);

  const fetchFaculty = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get(`/faculty/${facultyId}`);
      setFaculty(data);
      setError('');
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching faculty:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [facultyId]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const getDayId = useCallback((day) => {
    if (!day) return null;
    return day._id ?? day.id ?? null;
  }, []);

  const getCommentKey = useCallback((comment, index) => {
    if (!comment) return `idx-${index}`;
    return String(comment._id || `${comment.date || ''}-${comment.text || ''}-${index}`);
  }, []);

  const getStudentId = useCallback((student) => {
    if (!student) return '';
    return String(student._id ?? student.id ?? student.studentId ?? '').trim();
  }, []);

  const getStudentName = useCallback((student) => {
    if (!student) return 'Unnamed student';
    return [student.name, student.surname, student.lastname].filter(Boolean).join(' ').trim() || 'Unnamed student';
  }, []);

  const getStudentFacultyName = useCallback((student) => {
    if (!student) return '';
    if (typeof student.nameFaculty === 'string' && student.nameFaculty.trim()) return student.nameFaculty.trim();
    if (typeof student?.faculty === 'object' && student.faculty) {
      return String(student.faculty.name || student.faculty.title || '').trim();
    }
    return '';
  }, []);

  const getStudentYear = useCallback((student) => {
    if (!student) return '';

    const rawYear = student.year ?? student.faculty?.year ?? student.facultyYear ?? student.courseYear;
    if (rawYear == null || rawYear === '') return '';

    return String(rawYear).trim();
  }, []);

  const normalizeStudentRecord = useCallback((student) => {
    if (!student) return null;

    if (typeof student === 'string' || typeof student === 'number') {
      const studentId = String(student).trim();
      return studentId ? { _id: studentId } : null;
    }

    const studentId = getStudentId(student);
    const normalized = {
      name: typeof student.name === 'string' ? student.name : '',
      surname: typeof student.surname === 'string' ? student.surname : '',
      lastname: typeof student.lastname === 'string' ? student.lastname : '',
      nameFaculty: getStudentFacultyName(student),
      year: getStudentYear(student),
    };

    if (studentId) {
      normalized._id = studentId;
    } else if (typeof student.id === 'string' && student.id.trim()) {
      normalized.id = student.id.trim();
    }

    return normalized;
  }, [getStudentFacultyName, getStudentId, getStudentYear]);

  const extractImageUrls = useCallback((day) => {
    if (!day) return [];

    const sourceImages = Array.isArray(day.images)
      ? day.images
      : (Array.isArray(day.shortReport?.images) ? day.shortReport.images : []);

    return sourceImages
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item.url === 'string') return item.url;
        return null;
      })
      .filter(Boolean);
  }, []);

  const createReportFormSnapshot = useCallback((day) => ({
    date: day?.date ? String(day.date).slice(0, 10) : '',
    title: day?.shortReport?.title || '',
    description: day?.shortReport?.description || '',
    imageUrls: extractImageUrls(day),
  }), [extractImageUrls]);

  const resetDayForm = useCallback(() => {
    setShowReportForm(false);
    setReportTitle('');
    setReportDescription('');
    setReportDayDate('');
    setReportImages([]);
    setImagePreviews([]);
    setUploadProgress(0);
  }, []);

  const initBaseInfoFields = useCallback((facultySnapshot) => {
    if (!facultySnapshot) return;
    const durationValue = facultySnapshot?.duration
      ? (typeof facultySnapshot.duration === 'string'
        ? facultySnapshot.duration
        : [facultySnapshot.duration?.start, facultySnapshot.duration?.end].filter(Boolean).join(' - '))
      : '';

    setBaseInfoName(facultySnapshot.name || '');
    setBaseInfoCompany(facultySnapshot.company || '');
    setBaseInfoLocation(facultySnapshot.location || '');
    setBaseInfoDuration(durationValue);
    setBaseInfoStatus(normalizeInternshipStatus(facultySnapshot.status));
    setBaseInfoProgressAll(facultySnapshot.progressAll != null ? String(facultySnapshot.progressAll) : '');
    setBaseInfoPlan(facultySnapshot.plan || '');
  }, []);

  const applyFormatting = useCallback((textareaRef, setter, before, after = '', placeholder = 'text') => {
    const el = textareaRef?.current;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const value = el.value ?? '';
    const selected = value.slice(start, end);
    const insert = `${before}${selected || placeholder}${after}`;
    const nextValue = `${value.slice(0, start)}${insert}${value.slice(end)}`;

    setter(nextValue);

    requestAnimationFrame(() => {
      el.focus();
      if (selected) {
        el.setSelectionRange(start + before.length, start + before.length + selected.length);
      } else {
        const cursorStart = start + before.length;
        el.setSelectionRange(cursorStart, cursorStart + placeholder.length);
      }
    });
  }, []);

  const days = useMemo(() => faculty?.days || [], [faculty]);
  const attachedStudents = useMemo(() => {
    if (Array.isArray(faculty?.numberOfStudents)) return faculty.numberOfStudents;
    if (Array.isArray(faculty?.students)) return faculty.students;
    return [];
  }, [faculty]);
  const attachedStudentIds = useMemo(() => {
    return new Set(attachedStudents.map((student) => getStudentId(student)).filter(Boolean));
  }, [attachedStudents, getStudentId]);
  const getOwnershipTokens = useCallback((value) => {
    const tokens = new Set();
    const pushValue = (item) => {
      if (item == null) return;
      const token = String(item).trim();
      if (token) tokens.add(token.toLowerCase());
    };

    if (Array.isArray(value)) {
      value.forEach(pushValue);
      return tokens;
    }

    if (value && typeof value === 'object') {
      [value._id, value.id, value.login, value.username, value.email].forEach(pushValue);
      return tokens;
    }

    pushValue(value);
    return tokens;
  }, []);
  const canManageStudents = useMemo(() => {
    const role = String(user?.role || '').trim().toLowerCase();
    if (role === 'admin') return true;
    if (role !== 'tutor') return false;

    const currentUserTokens = getOwnershipTokens([
      user?._id,
      user?.id,
      user?.login,
      user?.username,
      user?.email,
    ]);
    if (currentUserTokens.size === 0) return false;

    const facultyTutorTokens = getOwnershipTokens([
      faculty?.tutorID,
      faculty?.tutor,
      faculty?.supervisor,
      faculty?.tutorID?._id,
      faculty?.tutorID?.id,
      faculty?.tutorID?.login,
      faculty?.tutorID?.username,
      faculty?.tutorID?.email,
      faculty?.tutor?._id,
      faculty?.tutor?.id,
      faculty?.tutor?.login,
      faculty?.tutor?.username,
      faculty?.tutor?.email,
    ]);

    for (const token of facultyTutorTokens) {
      if (currentUserTokens.has(token)) return true;
    }

    return false;
  }, [faculty, getOwnershipTokens, user]);
  const openStudentManager = useCallback(() => {
    setStudentSearchTerm('');
    setSelectedStudentIds([]);
    setSelectedStudentFaculty('all');
    setSelectedStudentYear('all');
    setShowStudentManager(true);
  }, []);
  const studentDirectory = useMemo(() => {
    const term = studentSearchTerm.trim().toLowerCase();
    const sourceStudents = Array.isArray(students) ? students : [];
    const selectedFacultyValue = String(selectedStudentFaculty || 'all').trim().toLowerCase();
    const selectedYearValue = String(selectedStudentYear || 'all').trim().toLowerCase();

    return sourceStudents
      .filter((student) => {
        if (!term) return true;

        const searchable = [
          getStudentId(student),
          getStudentName(student),
          getStudentFacultyName(student),
        ].join(' ').toLowerCase();

        return searchable.includes(term);
      })
      .filter((student) => {
        if (selectedFacultyValue === 'all') return true;
        return String(getStudentFacultyName(student)).trim().toLowerCase() === selectedFacultyValue;
      })
      .filter((student) => {
        if (selectedYearValue === 'all') return true;
        return String(getStudentYear(student)).trim().toLowerCase() === selectedYearValue;
      })
      .map((student) => {
        const studentId = getStudentId(student);
        const studentYear = getStudentYear(student);
        return {
          student,
          studentId,
          studentName: getStudentName(student),
          studentFacultyName: getStudentFacultyName(student),
          studentYear,
          isAttached: studentId ? attachedStudentIds.has(studentId) : false,
        };
      })
      .sort((a, b) => {
        const facultyA = String(a.studentFacultyName || '').trim().toLowerCase();
        const facultyB = String(b.studentFacultyName || '').trim().toLowerCase();
        if (facultyA !== facultyB) {
          if (!facultyA) return 1;
          if (!facultyB) return -1;
          return facultyA.localeCompare(facultyB);
        }

        const yearA = Number.parseInt(a.studentYear, 10);
        const yearB = Number.parseInt(b.studentYear, 10);
        const hasYearA = Number.isFinite(yearA);
        const hasYearB = Number.isFinite(yearB);

        if (hasYearA && hasYearB && yearA !== yearB) return yearA - yearB;
        if (hasYearA !== hasYearB) return hasYearA ? -1 : 1;
        return a.studentName.localeCompare(b.studentName);
      });
  }, [attachedStudentIds, getStudentFacultyName, getStudentId, getStudentName, getStudentYear, selectedStudentFaculty, selectedStudentYear, studentSearchTerm, students]);
  const availableStudentFaculties = useMemo(() => {
    const faculties = new Set();
    (Array.isArray(students) ? students : []).forEach((student) => {
      const facultyName = getStudentFacultyName(student);
      if (facultyName) faculties.add(facultyName);
    });

    return Array.from(faculties).sort((a, b) => a.localeCompare(b));
  }, [getStudentFacultyName, students]);
  const availableStudentYears = useMemo(() => {
    const years = new Set();
    (Array.isArray(students) ? students : []).forEach((student) => {
      const year = getStudentYear(student);
      if (year) years.add(year);
    });

    return Array.from(years).sort((a, b) => {
      const yearA = Number.parseInt(a, 10);
      const yearB = Number.parseInt(b, 10);
      if (Number.isFinite(yearA) && Number.isFinite(yearB) && yearA !== yearB) return yearA - yearB;
      return a.localeCompare(b);
    });
  }, [getStudentYear, students]);
  const facultyFilterOptions = useMemo(
    () => [
      { value: 'all', label: 'All faculties' },
      ...availableStudentFaculties.map((facultyName) => ({ value: facultyName, label: facultyName })),
    ],
    [availableStudentFaculties],
  );
  const yearFilterOptions = useMemo(
    () => [
      { value: 'all', label: 'All years' },
      ...availableStudentYears.map((year) => ({ value: year, label: year })),
    ],
    [availableStudentYears],
  );
  const reportedDaysCount = useMemo(() => days.filter((day) => hasReportContent(day)).length, [days]);
  const progressPercent = useMemo(() => calculateProgressPercent(days), [days]);
  const computedProgressLabel = useMemo(() => `${progressPercent}%`, [progressPercent]);
  const progressHue = useMemo(() => Math.round((progressPercent / 100) * 120), [progressPercent]);
  const currentDay = days[dayIndex];
  const currentDayImageUrls = useMemo(() => extractImageUrls(currentDay), [extractImageUrls, currentDay]);
  const reportFormDirty = useMemo(() => {
    if (!showReportForm || !reportFormSnapshot) return false;

    return (
      reportDayDate !== reportFormSnapshot.date
      || reportTitle !== reportFormSnapshot.title
      || reportDescription !== reportFormSnapshot.description
      || reportImages.length > 0
    );
  }, [reportDayDate, reportDescription, reportFormSnapshot, reportImages.length, reportTitle, showReportForm]);
  const tutorInfo = useMemo(() => {
    const tutorSource = faculty?.tutorID || faculty?.tutor || faculty?.supervisor || null;

    const tutorName = [
      typeof tutorSource === 'object' ? tutorSource?.name : '',
      typeof tutorSource === 'object' ? tutorSource?.surname : '',
      typeof tutorSource === 'object' ? tutorSource?.lastname : '',
    ]
      .filter(Boolean)
      .join(' ')
      .trim()
      || faculty?.tutorName
      || faculty?.supervisorName
      || (typeof tutorSource === 'string' ? tutorSource.trim() : '');

    const tutorContact =
      (typeof tutorSource === 'object'
        ? tutorSource?.phone || tutorSource?.email || tutorSource?.login
        : '')
      || faculty?.tutorContact
      || faculty?.supervisorContact
      || '';

    return {
      name: tutorName,
      contact: tutorContact,
      hasInfo: Boolean(tutorName || tutorContact),
    };
  }, [faculty]);
 
  const canWriteReport = true; // Allow anyone to write comments
  const canEditInternship = user?.role === 'Tutor' || user?.role === 'Admin';
  const canApprove = user?.role === 'Admin';
  const canExport = user?.role === 'Admin';

  const confirmDiscardReportChanges = useCallback(() => {
    if (!reportFormDirty) return true;
    return window.confirm('You have unsaved report changes. Discard them?');
  }, [reportFormDirty]);

  const guardedResetDayForm = useCallback(() => {
    if (!confirmDiscardReportChanges()) return false;
    setReportFormSnapshot(null);
    resetDayForm();
    return true;
  }, [confirmDiscardReportChanges, resetDayForm]);

  const handleBackToDashboard = useCallback(() => {
    if (!confirmDiscardReportChanges()) return;
    setReportFormSnapshot(null);
    onBack();
  }, [confirmDiscardReportChanges, onBack]);

  const attemptDayChange = useCallback((nextIndex) => {
    const boundedNext = Math.max(0, Math.min(days.length - 1, nextIndex));
    if (boundedNext === dayIndex) return;

    if (showReportForm) {
      if (!confirmDiscardReportChanges()) return;
      setReportFormSnapshot(null);
      resetDayForm();
    }

    setDayIndex(boundedNext);
  }, [confirmDiscardReportChanges, dayIndex, days.length, resetDayForm, showReportForm]);

  const handleFinalReport = useCallback(async () => {
    if (!faculty) {
      toast.error('Internship data is not ready yet. Please try again.');
      return;
    }

    const normalizeImageUrls = (rawImages) => {
      if (!Array.isArray(rawImages)) return [];
      return rawImages
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item.url === 'string') return item.url;
          return null;
        })
        .filter(Boolean);
    };

    const reportDays = days.slice(0, 30).map((day, index) => {
      const shortReportImages = normalizeImageUrls(day?.shortReport?.images);
      const dayImages = normalizeImageUrls(day?.images);
      const photoUrls = Array.from(new Set([...shortReportImages, ...dayImages]));

      const comments = Array.isArray(day?.comments)
        ? day.comments.map((comment) => ({
          text: typeof comment?.text === 'string' ? comment.text : String(comment || ''),
          date: comment?.date || null,
          userID: typeof comment?.userID === 'object'
            ? (comment.userID?._id || comment.userID?.id || null)
            : (comment?.userID || null),
        }))
        : [];

      return {
        dayNumber: day?.dayNumber || index + 1,
        date: day?.date || null,
        approved: Boolean(day?.approved),
        shortReport: {
          title: typeof day?.shortReport?.title === 'string' ? day.shortReport.title : '',
          description: typeof day?.shortReport?.description === 'string' ? day.shortReport.description : '',
        },
        comments,
        photoUrls,
      };
    });

    const payload = {
      internship: {
        id: faculty?._id || faculty?.id || facultyId,
        name: faculty?.name || '',
        company: faculty?.company || '',
        location: faculty?.location || '',
        status: faculty?.status || '',
        duration: faculty?.duration || null,
        plan: faculty?.plan || '',
        progressAll: faculty?.progressAll || '',
        students: attachedStudents.map((student) => ({
          id: student?._id || student?.id || student?.studentId || null,
          name: [student?.name, student?.surname, student?.lastname].filter(Boolean).join(' ').trim(),
          faculty: student?.nameFaculty || null,
        })),
      },
      days: reportDays,
      reportType: 'final-30-day-report',
    };

    setFinalReportLoading(true);
    setFinalReportError('');
    setFinalReportMarkdown('');
    setShowFinalReportModal(true);

    try {
      const token = getAuthTokenFromStorage();
      const response = await generateFinalReport(payload, token);

      setFinalReportMarkdown(response.report);
      toast.success('Final report generated successfully.');
    } catch (error) {
      const message = error?.message || 'Failed to generate AI final report.';
      setFinalReportError(message);
      toast.error(message);
    } finally {
      setFinalReportLoading(false);
    }
  }, [attachedStudents, days, faculty, facultyId]);

  const updateStudentAssignments = useCallback(async (nextStudents, successMessage) => {
    if (!faculty) return false;
    if (!canManageStudents) {
      toast.error('You do not have permission to manage students for this internship.');
      return false;
    }

    const normalizedStudents = [];
    const seenStudentKeys = new Set();

    (Array.isArray(nextStudents) ? nextStudents : []).forEach((student) => {
      const normalizedStudent = normalizeStudentRecord(student);
      if (!normalizedStudent) return;

      const studentKey = normalizedStudent._id || normalizedStudent.id || [normalizedStudent.name, normalizedStudent.surname, normalizedStudent.lastname].filter(Boolean).join('|');
      if (!studentKey || seenStudentKeys.has(studentKey)) return;

      seenStudentKeys.add(studentKey);
      normalizedStudents.push(normalizedStudent);
    });

    setSubmitting(true);
    try {
      await patch(`/faculty/${facultyId}`, { numberOfStudents: normalizedStudents });
      await fetchFaculty();
      toast.success(successMessage);
      return true;
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [canManageStudents, faculty, facultyId, fetchFaculty, normalizeStudentRecord]);

  const handleAttachStudent = useCallback(async (student) => {
    const studentId = getStudentId(student);
    if (!studentId) {
      toast.error('Student could not be identified.');
      return;
    }

    const nextStudents = [...attachedStudents, student];
    await updateStudentAssignments(nextStudents, 'Student attached to the internship.');
  }, [attachedStudents, getStudentId, updateStudentAssignments]);

  const handleDetachStudent = useCallback(async (student) => {
    const studentId = getStudentId(student);
    if (!studentId) {
      toast.error('Student could not be identified.');
      return;
    }

    const nextStudents = attachedStudents.filter((item) => getStudentId(item) !== studentId);
    await updateStudentAssignments(nextStudents, 'Student detached from the internship.');
  }, [attachedStudents, getStudentId, updateStudentAssignments]);

  const handleToggleStudentSelection = useCallback((studentId) => {
    if (!studentId) return;
    setSelectedStudentIds((current) => {
      if (current.includes(studentId)) {
        return current.filter((id) => id !== studentId);
      }

      return [...current, studentId];
    });
  }, []);

  const handleAttachSelectedStudents = useCallback(async () => {
    if (selectedStudentIds.length === 0) {
      toast.warning('Select at least one student first.');
      return;
    }

    const selectedLookup = new Set(selectedStudentIds);
    const studentsToAttach = studentDirectory
      .filter(({ studentId, isAttached }) => studentId && selectedLookup.has(studentId) && !isAttached)
      .map(({ student }) => student);

    if (studentsToAttach.length === 0) {
      toast.warning('Selected students are already attached or could not be found.');
      return;
    }

    const nextStudents = [...attachedStudents, ...studentsToAttach];
    const didSave = await updateStudentAssignments(
      nextStudents,
      `Added ${studentsToAttach.length} student(s) to the internship.`,
    );

    if (didSave) {
      setSelectedStudentIds([]);
    }
  }, [attachedStudents, selectedStudentIds, studentDirectory, updateStudentAssignments]);

  useEffect(() => {
    if (!faculty || isInternshipEditMode) return;
    initBaseInfoFields(faculty);
  }, [faculty, isInternshipEditMode, initBaseInfoFields]);

  const syncFacultyProgress = useCallback(async (facultySnapshot) => {
    if (!facultySnapshot) return;

    const expectedPercent = calculateProgressPercent(facultySnapshot.days || []);
    const currentPercent = parseProgressPercent(facultySnapshot.progressAll);
    const expectedLabel = `${expectedPercent}%`;

    if (currentPercent === expectedPercent) {
      if (String(facultySnapshot.progressAll || '').trim() !== expectedLabel) {
        setFaculty((prev) => (prev ? { ...prev, progressAll: expectedLabel } : prev));
      }
      return;
    }

    try {
      await patch(`/faculty/${facultyId}`, {
        ...facultySnapshot,
        progressAll: expectedLabel,
      });
      setFaculty((prev) => (prev ? { ...prev, progressAll: expectedLabel } : prev));
    } catch (err) {
      console.error('Failed to sync internship progress:', err);
    }
  }, [facultyId]);

  const updateDay = useCallback(async (day, payload, index = null) => {
    const dayId = getDayId(day) ?? (index != null ? String(index) : null);
    if (dayId == null) {
      toast.error('Day could not be identified. Try refreshing.');
      return;
    }
    setSubmitting(true);
    try {
      await patch(`/faculty/${facultyId}/days/${dayId}`, payload);
      await fetchFaculty(); // Refresh the data
      toast.success('Saved.');
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }, [facultyId, getDayId, fetchFaculty]);

  const handleBaseInfoSubmit = useCallback(async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!faculty) return;

    setSubmitting(true);

    try {
      const nextName = baseInfoName.trim();
      const nextCompany = baseInfoCompany.trim();
      const nextLocation = baseInfoLocation.trim();
      const nextDuration = baseInfoDuration.trim();
      const nextStatus = normalizeInternshipStatus(baseInfoStatus);
      const nextProgressAll = baseInfoProgressAll.trim();
      const nextPlan = baseInfoPlan.trim();

      if (!nextName) throw new Error('Internship name is required.');
      if (!nextCompany) throw new Error('Company is required.');
      if (!nextLocation) throw new Error('Location is required.');

      const payload = {
        ...faculty,
        name: nextName,
        company: nextCompany,
        location: nextLocation,
        duration: nextDuration || faculty.duration,
        status: nextStatus,
        progressAll: nextProgressAll,
        plan: nextPlan,
        locationYmaps: nextLocation === (faculty.location || '') ? faculty.locationYmaps : null,
      };

      await patch(`/faculty/${facultyId}`, payload);
      const refreshedFaculty = await fetchFaculty();
      await syncFacultyProgress(refreshedFaculty);
      toast.success('Internship information saved.');
      setIsInternshipEditMode(false);
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }, [faculty, facultyId, baseInfoName, baseInfoCompany, baseInfoLocation, baseInfoDuration, baseInfoStatus, baseInfoProgressAll, baseInfoPlan, fetchFaculty, syncFacultyProgress]);

  const handleInternshipEditStart = useCallback(() => {
    if (!faculty) return;
    initBaseInfoFields(faculty);
    setIsInternshipEditMode(true);
  }, [faculty, initBaseInfoFields]);

  const handleInternshipEditCancel = useCallback(() => {
    if (faculty) initBaseInfoFields(faculty);
    setIsInternshipEditMode(false);
  }, [faculty, initBaseInfoFields]);

  const handleWriteReportOpen = useCallback(() => {
    const snapshot = createReportFormSnapshot(currentDay);
    setReportDayDate(snapshot.date);
    if (currentDay?.shortReport) {
      setReportTitle(currentDay.shortReport.title || '');
      setReportDescription(currentDay.shortReport.description || '');
    } else {
      setReportTitle('');
      setReportDescription('');
    }
    setReportImages([]);
    setImagePreviews([]);
    setReportFormSnapshot(snapshot);
    setShowReportForm(true);
  }, [createReportFormSnapshot, currentDay]);

  const handleReportSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!currentDay) return;
    
    setSubmitting(true);
    setUploadProgress(0);
    
    try {
      const dayId = getDayId(currentDay);
      if (!dayId) throw new Error('Day could not be identified. Try refreshing.');

      const existingImageUrls = extractImageUrls(currentDay);

      const extractShortReportImageUrls = (day) => {
        const shortReportImages = Array.isArray(day?.shortReport?.images) ? day.shortReport.images : [];
        return shortReportImages
          .map((item) => {
            if (typeof item === 'string') return item;
            if (item && typeof item.url === 'string') return item.url;
            return null;
          })
          .filter(Boolean);
      };

      let uploadedUrls = [];

      // Step 1: Upload images in one multipart/form-data request
      if (reportImages && reportImages.length > 0) {
        const imageFormData = new FormData();

        // Recommended field: append every file under "images"
        reportImages.forEach((file) => {
          imageFormData.append('images', file);
        });

        // Backward compatibility: also send first file under "image"
        imageFormData.append('image', reportImages[0]);

        const uploadedData = await post(`/faculty/${facultyId}/days/${dayId}/images`, imageFormData);
        const responseUrls = [];

        if (Array.isArray(uploadedData?.images)) {
          uploadedData.images.forEach((item) => {
            if (typeof item === 'string') responseUrls.push(item);
            else if (item?.url) responseUrls.push(item.url);
          });
        }

        if (uploadedData?.image?.url) responseUrls.push(uploadedData.image.url);

        uploadedUrls = Array.from(new Set(responseUrls.filter(Boolean)));
        if (uploadedUrls.length === 0) {
          throw new Error('Upload succeeded but image URL is missing in response.');
        }
        setUploadProgress(100);

        // Step 2: Immediate verification via GET /faculty/:id
        const verifyAfterUploadFaculty = await get(`/faculty/${facultyId}`);
        const verifyDay = (verifyAfterUploadFaculty?.days || []).find((d) => (d?._id ?? d?.id ?? null) === dayId);
        if (!verifyDay) throw new Error('Uploaded image verification failed: day not found.');

        const shortReportUrlsAfterUpload = extractShortReportImageUrls(verifyDay);
        const hasUploadedUrlsInShortReport = uploadedUrls.every((url) => shortReportUrlsAfterUpload.includes(url));
        if (!hasUploadedUrlsInShortReport) {
          throw new Error('Uploaded image URL was not found in shortReport.images after upload.');
        }
      }

      const finalImageUrls = uploadedUrls.length > 0
        ? Array.from(new Set([...existingImageUrls, ...uploadedUrls]))
        : existingImageUrls;
      
      // Step 2: Create/update report with image URLs
      
      const normalizedTitle = reportTitle.trim();
      const normalizedDescription = reportDescription.trim();
      const normalizedDayDate = reportDayDate || currentDay.date || '';

      const reportPayload = {
        ...currentDay,
        dayNumber: currentDay.dayNumber,
        date: normalizedDayDate,
        approved: currentDay.approved,
        images: finalImageUrls,
      };

      const shouldPersistReport = Boolean(currentDay?.shortReport || normalizedTitle || normalizedDescription || finalImageUrls.length > 0);
      if (shouldPersistReport) {
        reportPayload.shortReport = {
          title: normalizedTitle || currentDay.shortReport?.title || 'Report',
          description: normalizedDescription || currentDay.shortReport?.description || '',
          images: finalImageUrls,
          date: currentDay.shortReport?.date || new Date().toISOString(),
        };
      }

      await patch(`/faculty/${facultyId}/days/${dayId}`, reportPayload);

      // Step 3: Verify images remain after normal update flow
      if (uploadedUrls.length > 0) {
        const verifyAfterUpdateFaculty = await get(`/faculty/${facultyId}`);
        const verifyDayAfterUpdate = (verifyAfterUpdateFaculty?.days || []).find((d) => (d?._id ?? d?.id ?? null) === dayId);
        if (!verifyDayAfterUpdate) throw new Error('Post-update verification failed: day not found.');

        const urlsAfterUpdate = extractImageUrls(verifyDayAfterUpdate);
        const allUploadedUrlsRemain = uploadedUrls.every((url) => urlsAfterUpdate.includes(url));
        if (!allUploadedUrlsRemain) {
          throw new Error('Image was uploaded but did not remain after report update.');
        }
      }

      const refreshedFaculty = await fetchFaculty(); // Refresh the data
      await syncFacultyProgress(refreshedFaculty);
      toast.success(`Day saved with ${finalImageUrls.length} image(s).`);
      setReportFormSnapshot(null);
      resetDayForm();
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  }, [currentDay, reportTitle, reportDescription, reportDayDate, reportImages, facultyId, getDayId, fetchFaculty, extractImageUrls, resetDayForm, syncFacultyProgress]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    const newValidImages = files.filter(file => {
      if (!validImageTypes.includes(file.type)) {
        toast.warning(`${file.name} is not a valid image file. Only JPEG, PNG, WebP and GIF are allowed.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.warning(`${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });
    
    setReportImages(prev => [...prev, ...newValidImages]);
    
    // Create previews for the new images
    newValidImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews(prev => [...prev, { id: file.lastModified, src: reader.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId) => {
    setReportImages(prev => prev.filter(img => img.lastModified !== imageId));
    setImagePreviews(prev => prev.filter(img => img.id !== imageId));
  };

  const handleApprove = useCallback(async () => {
    if (!currentDay) return;
    await updateDay(currentDay, { ...currentDay, approved: true }, dayIndex);
  }, [currentDay, updateDay, dayIndex]);

  const handlePostComment = useCallback(async (e) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text || !currentDay) return;
    
    const newCommentObj = {
      text: text,
      date: new Date().toISOString(),
      userID: user?.id || user?._id || 'anonymous'
    };
    
    const comments = [...(currentDay.comments || []), newCommentObj];
    await updateDay(currentDay, { ...currentDay, comments }, dayIndex);
    setNewComment('');
  }, [currentDay, newComment, updateDay, dayIndex, user]);

  const handleAddDayClick = useCallback(() => {
    setNewDayDate(new Date().toISOString().slice(0, 10));
    setShowAddDayModal(true);
  }, []);

  const handleAddDayConfirm = useCallback(async () => {
    setSubmitting(true);
    try {
      const newDay = {
        dayNumber: String((days.length || 0) + 1),
        date: newDayDate,
        approved: false,
        shortReport: null,
        comments: [],
      };
      await post(`/faculty/${facultyId}/days`, newDay);
      const refreshedFaculty = await fetchFaculty(); // Refresh the data
      await syncFacultyProgress(refreshedFaculty);
      setDayIndex(days.length);
      toast.success('Day added.');
      setShowAddDayModal(false);
      setNewDayDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      toast.error(err.message || 'Failed to add day.');
    } finally {
      setSubmitting(false);
    }
  }, [facultyId, days.length, newDayDate, fetchFaculty, syncFacultyProgress]);

  const allComments = useMemo(() => {
    if (!faculty || !faculty.days) return [];
    return faculty.days.flatMap((day, index) => 
      (day.comments || []).map(comment => ({
        text: comment.text || comment,
        date: comment.date,
        userID: comment.userID,
        commentID: comment._id,
        dayIndex: index,
        dayNumber: day.dayNumber
      }))
    );
  }, [faculty]);

  const navigateToDay = useCallback((dayIndex) => {
    attemptDayChange(dayIndex);
    setShowFeedbackView(false);
  }, [attemptDayChange]);

  useEffect(() => {
    if (!Array.isArray(days) || days.length === 0) return;
    if (!Number.isInteger(initialDayIndex)) return;

    const safeDayIndex = Math.max(0, Math.min(days.length - 1, initialDayIndex));
    setDayIndex(safeDayIndex);
  }, [days, initialDayIndex]);

  useEffect(() => {
    if (!Array.isArray(days) || days.length === 0) {
      if (dayIndex !== 0) setDayIndex(0);
      return;
    }

    if (dayIndex > days.length - 1) {
      setDayIndex(days.length - 1);
    }
  }, [days, dayIndex]);

  useEffect(() => {
    setShowStudents(false);
    setShowStudentManager(false);
    setStudentSearchTerm('');
    setSelectedStudentIds([]);
    setSelectedStudentFaculty('all');
    setSelectedStudentYear('all');
    setShowPlan(true);
  }, [facultyId]);

  useEffect(() => {
    if (!activeImageSrc) return undefined;

    const { body } = document;
    const { scrollY } = window;
    const prevOverflow = body.style.overflow;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevWidth = body.style.width;

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    return () => {
      body.style.overflow = prevOverflow;
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, [activeImageSrc]);

  useEffect(() => {
    if (!reportFormDirty) return undefined;

    const beforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [reportFormDirty]);

  useEffect(() => {
    const item = dayItemRefs.current[dayIndex];
    if (!item) return;
    item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [dayIndex, days.length]);

  useEffect(() => {
    if (!focusCommentKey) return;
    if (!currentDay) return;

    const commentIndex = (currentDay.comments || []).findIndex(
      (comment, index) => getCommentKey(comment, index) === String(focusCommentKey),
    );

    if (commentIndex < 0) return;

    setHighlightedCommentKey(String(focusCommentKey));

    const timerId = setTimeout(() => {
      commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 140);

    const clearTimer = setTimeout(() => {
      setHighlightedCommentKey('');
    }, 2600);

    return () => {
      clearTimeout(timerId);
      clearTimeout(clearTimer);
    };
  }, [currentDay, focusCommentKey, getCommentKey]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="ip-page">
          <style>{ipStyles}</style>
          <div className="ip-shell">
            <button type="button" className="ip-back" onClick={handleBackToDashboard}>← Back to dashboard</button>
            <PageState variant="loading" title="Loading internship details" message="Preparing days, comments, and attachments..." className="ip-loading" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="ip-page">
          <style>{ipStyles}</style>
          <div className="ip-shell">
            <button type="button" className="ip-back" onClick={handleBackToDashboard}>← Back to dashboard</button>
            <PageState variant="error" title="Failed to load internship" message={error} className="ip-alert" />
          </div>
        </div>
      );
    }

    if (!faculty) {
      return (
        <div className="ip-page">
          <style>{ipStyles}</style>
          <div className="ip-shell">
            <button type="button" className="ip-back" onClick={handleBackToDashboard}>← Back to dashboard</button>
            <PageState variant="empty" title="Internship not found" message="This internship does not exist or is no longer accessible." className="ip-empty" />
          </div>
        </div>
      );
    }

    return (
      <div className="ip-page">
        <style>{ipStyles}</style>
        <div className="ip-shell">
          <button type="button" className="ip-back" onClick={handleBackToDashboard}>
            ← Back to dashboard
          </button>

          <header className="ip-hero">
            <div className="ip-hero-top">
              <div className="ip-hero-copyblock">
                <span className="ip-eyebrow">Internship workspace</span>
                <input
                  className="ip-input ip-inline-title"
                  value={baseInfoName}
                  onChange={(e) => setBaseInfoName(e.target.value)}
                  disabled={!isInternshipEditMode}
                  aria-label="Internship name"
                />
                <p className="ip-hero-copy">
                  Review daily progress, attach evidence, and keep the approval trail clear for everyone involved.
                </p>
              </div>
              <div className="ip-hero-statuslist" aria-label="Current internship status">
                <span className="ip-status-pill">{currentDay ? `Day ${currentDay.dayNumber}` : 'No day selected'}</span>
                <span className={`ip-status-pill ${currentDay?.approved ? 'ip-status-pill--ok' : 'ip-status-pill--warn'}`}>
                  {currentDay?.approved ? 'Approved' : 'Pending review'}
                </span>
                <span className={`ip-status-pill ip-status-pill--internship-${normalizeInternshipStatus(baseInfoStatus).toLowerCase().replace(/\s+/g, '-')}`}>
                  {normalizeInternshipStatus(baseInfoStatus)}
                </span>
                <span className="ip-status-pill">{canWriteReport ? 'Editable' : 'Read only'}</span>
                <span className="ip-status-pill">{faculty.plan ? 'Plan available' : 'No plan'}</span>
                {canEditInternship && !isInternshipEditMode && (
                  <button type="button" className="ip-status-action" onClick={handleInternshipEditStart}>
                    Edit
                  </button>
                )}
                {canEditInternship && isInternshipEditMode && (
                  <>
                    <button type="button" className="ip-status-action" onClick={handleBaseInfoSubmit} disabled={submitting}>
                      {submitting ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" className="ip-status-action ip-status-action--cancel" onClick={handleInternshipEditCancel} disabled={submitting}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="ip-hero-grid">
              <div className="ip-hero-item">
                <span className="ip-hero-label">Company</span>
                <input
                  className="ip-input ip-inline-field"
                  value={baseInfoCompany}
                  onChange={(e) => setBaseInfoCompany(e.target.value)}
                  disabled={!isInternshipEditMode}
                  aria-label="Company"
                />
              </div>
              <div className="ip-hero-item">
                <span className="ip-hero-label">Location</span>
                <input
                  className="ip-input ip-inline-field"
                  value={baseInfoLocation}
                  onChange={(e) => setBaseInfoLocation(e.target.value)}
                  disabled={!isInternshipEditMode}
                  aria-label="Location"
                />
              </div>
              <div className="ip-hero-item">
                <span className="ip-hero-label">Duration</span>
                <input
                  className="ip-input ip-inline-field"
                  value={baseInfoDuration}
                  onChange={(e) => setBaseInfoDuration(e.target.value)}
                  disabled={!isInternshipEditMode}
                  aria-label="Duration"
                />
              </div>
              <div className="ip-hero-item">
                <span className="ip-hero-label">Status</span>
                <select
                  className="ip-input ip-inline-field"
                  value={baseInfoStatus}
                  onChange={(e) => setBaseInfoStatus(e.target.value)}
                  disabled={!isInternshipEditMode}
                  aria-label="Status"
                >
                  {INTERNSHIP_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="ip-hero-item">
                <span className="ip-hero-label">Progress</span>
                <div className="ip-progress-stack">
                  <span
                    className="ip-progress-chip"
                    style={{
                      color: `hsl(${progressHue} 76% 30%)`,
                      borderColor: `hsla(${progressHue}, 75%, 45%, .35)`,
                      background: `linear-gradient(135deg, hsla(${Math.max(0, progressHue - 25)}, 95%, 92%, .95), hsla(${Math.min(120, progressHue + 20)}, 95%, 88%, .95))`,
                    }}
                  >
                    {computedProgressLabel}
                  </span>
                  <div className="ip-progress-track" aria-label={`Internship progress ${computedProgressLabel}`}>
                    <div
                      className="ip-progress-fill"
                      style={{
                        width: `${progressPercent}%`,
                        background: `linear-gradient(90deg, hsl(${Math.max(0, progressHue - 24)} 82% 56%), hsl(${Math.min(120, progressHue + 12)} 80% 44%))`,
                      }}
                    ></div>
                  </div>
                  <span className="ip-progress-meta">{reportedDaysCount}/{days.length || 0} days reported</span>
                </div>

              </div>
            </div>

            <div className="ip-plan-card" aria-label="Internship plan">
              <div className="ip-plan-header">
                <span className="ip-hero-label">Plan</span>
                <button
                  type="button"
                  className="ip-student-action-btn"
                  onClick={() => setShowPlan((prev) => !prev)}
                >
                  {showPlan ? 'Close plan' : 'Open plan'}
                </button>
              </div>
              {showPlan && (
                <>
                  <div className="ip-format-toolbar" role="toolbar" aria-label="Plan text formatting">
                    <button type="button" className="ip-format-btn" disabled={!isInternshipEditMode} onClick={() => applyFormatting(planEditorRef, setBaseInfoPlan, '**', '**', 'bold')}>Bold</button>
                    <button type="button" className="ip-format-btn" disabled={!isInternshipEditMode} onClick={() => applyFormatting(planEditorRef, setBaseInfoPlan, '_', '_', 'italic')}>Italic</button>
                    <button type="button" className="ip-format-btn" disabled={!isInternshipEditMode} onClick={() => applyFormatting(planEditorRef, setBaseInfoPlan, '## ', '', 'Heading')}>H2</button>
                    <button type="button" className="ip-format-btn" disabled={!isInternshipEditMode} onClick={() => applyFormatting(planEditorRef, setBaseInfoPlan, '- ', '', 'List item')}>List</button>
                  </div>
                  <div className="ip-plan-text">
                    {isInternshipEditMode ? (
                      <textarea
                        ref={planEditorRef}
                        className="ip-input ip-plan-editor"
                        value={baseInfoPlan}
                        onChange={(e) => setBaseInfoPlan(e.target.value)}
                        rows={10}
                        placeholder="Internship plan"
                      />
                    ) : (
                      <div
                        className="ip-plan-rendered"
                        dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(baseInfoPlan) }}
                      ></div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="ip-tutor-card" aria-label="Internship tutor">
              <div className="ip-tutor-head">
                <span className="ip-summary-label">Tutor</span>
                <span className="ip-tutor-badge">Assigned</span>
              </div>
              {tutorInfo.hasInfo ? (
                <div className="ip-tutor-body">
                  <strong className="ip-tutor-name">{tutorInfo.name || 'No information'}</strong>
                  <span className="ip-tutor-contact">{tutorInfo.contact || 'No contact information'}</span>
                </div>
              ) : (
                <p className="ip-tutor-empty">No information available.</p>
              )}
            </div>

            <div className="ip-students-card" aria-label="Attached students">
              <div className="ip-students-head">
                <div>
                  <span className="ip-summary-label">Students</span>
                  <strong className="ip-summary-value">{attachedStudents.length} attached</strong>
                </div>
                <div className="ip-students-head-actions">
                  {canManageStudents && (
                    <button
                      type="button"
                      className="ip-student-action-btn"
                      onClick={openStudentManager}
                      disabled={submitting || !Array.isArray(students) || students.length === 0}
                    >
                      Manage students
                    </button>
                  )}
                  <button
                    type="button"
                    className="ip-eye-btn"
                    onClick={() => setShowStudents((prev) => !prev)}
                    aria-label={showStudents ? 'Hide attached students' : 'Show attached students'}
                    aria-expanded={showStudents}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className={`ip-eye-chevron ${showStudents ? 'ip-eye-chevron--open' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
              </div>

              {showStudents && (
                <div className="ip-students-list-wrap">
                  {attachedStudents.length === 0 ? (
                    <div className="ip-students-empty-state">
                      <p className="ip-students-empty">No students attached to this internship.</p>
                      {canManageStudents && (
                        <button
                          type="button"
                          className="ip-student-action-btn"
                          onClick={openStudentManager}
                          disabled={submitting || !Array.isArray(students) || students.length === 0}
                        >
                          Attach students
                        </button>
                      )}
                    </div>
                  ) : (
                    <ul className="ip-students-list">
                      {attachedStudents.map((student, index) => {
                        const studentId = getStudentId(student) || `student-${index}`;
                        const studentName = getStudentName(student);
                        return (
                          <li key={studentId} className="ip-student-item">
                            <div className="ip-student-copy">
                              <span className="ip-student-name">{studentName}</span>
                              {getStudentFacultyName(student) && <span className="ip-student-faculty">{getStudentFacultyName(student)}</span>}
                            </div>
                            {canManageStudents && (
                              <button
                                type="button"
                                className="ip-student-action-btn ip-student-action-btn--ghost"
                                onClick={() => handleDetachStudent(student)}
                                disabled={submitting}
                              >
                                Detach
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </header>

          <div className="ip-actions">
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
            {canExport && (
              <button
                type="button"
                className="ip-btn ip-btn--primary"
                onClick={handleFinalReport}
                disabled={submitting || finalReportLoading}
                title="Generate final AI report"
              >
                {finalReportLoading ? 'Generating…' : 'Final report'}
              </button>
            )}
          </div>

          {showReportForm && currentDay && (
            <div className="ip-report-form-card">
              <div className="ip-report-form-header">
                <h4 className="ip-report-form-title">Edit day information — Day {currentDay.dayNumber}</h4>
                <button 
                  type="button" 
                  className="ip-close-btn"
                  onClick={() => {
                    guardedResetDayForm();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleReportSubmit} className="ip-report-form ip-report-form-wrapper">
                <div className="ip-form-section">
                  <div className="ip-field">
                    <label className="ip-label" htmlFor="ip-day-date">Date</label>
                    <input
                      id="ip-day-date"
                      type="date"
                      value={reportDayDate}
                      onChange={(e) => setReportDayDate(e.target.value)}
                      className="ip-input"
                    />
                  </div>
                </div>

                <div className="ip-form-divider"></div>

                <div className="ip-form-section">
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
                </div>

                <div className="ip-form-divider"></div>
                
                <div className="ip-form-section">
                  <div className="ip-field">
                    <label className="ip-label" htmlFor="ip-report-desc">Description</label>
                    <div className="ip-format-toolbar" role="toolbar" aria-label="Report text formatting">
                      <button type="button" className="ip-format-btn" onClick={() => applyFormatting(reportDescriptionRef, setReportDescription, '**', '**', 'bold')}>Bold</button>
                      <button type="button" className="ip-format-btn" onClick={() => applyFormatting(reportDescriptionRef, setReportDescription, '_', '_', 'italic')}>Italic</button>
                      <button type="button" className="ip-format-btn" onClick={() => applyFormatting(reportDescriptionRef, setReportDescription, '## ', '', 'Heading')}>H2</button>
                      <button type="button" className="ip-format-btn" onClick={() => applyFormatting(reportDescriptionRef, setReportDescription, '- ', '', 'List item')}>List</button>
                    </div>
                    <textarea
                      ref={reportDescriptionRef}
                      id="ip-report-desc"
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      className="ip-input ip-textarea"
                      placeholder="What was done today?"
                      rows={5}
                    />
                  </div>
                </div>

                <div className="ip-form-divider"></div>
                
                <div className="ip-form-section">
                  <label className="ip-label" htmlFor="ip-report-images">Attachments</label>
                  <div className="ip-image-upload-container">
                    <label htmlFor="ip-report-images" className="ip-image-upload-area">
                      <input
                        id="ip-report-images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="ip-image-input"
                      />
                      <div className="ip-upload-content">
                        <div className="ip-upload-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                        </div>
                        <p className="ip-upload-text">Click to upload or drag and drop</p>
                        <p className="ip-upload-hint">SVG, PNG, JPG, GIF (max. 5MB)</p>
                      </div>
                    </label>
                    
                    {/* Preview of selected images */}
                    {imagePreviews.length > 0 && (
                      <div className="ip-image-previews-grid">
                        {imagePreviews.map((preview) => (
                          <div key={preview.id} className="ip-image-preview-item">
                            <img src={preview.src} alt={preview.name} className="ip-image-preview" />
                            <button 
                              type="button" 
                              className="ip-remove-image-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(preview.id);
                              }}
                              aria-label="Remove image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ip-form-actions">
                  {submitting && reportImages.length > 0 && uploadProgress > 0 && (
                    <div className="ip-progress-bar">
                      <div className="ip-progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}
                  <button 
                    type="button" 
                    className="ip-btn ip-btn--secondary"
                    onClick={() => {
                      guardedResetDayForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="ip-btn ip-btn--primary" 
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="ip-spinner"></span>
                        {reportImages.length > 0 && uploadProgress > 0 && uploadProgress < 100 
                          ? `Uploading (${uploadProgress}%)`
                          : 'Saving…'
                        }
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {days.length > 0 ? (
            <div className="ip-days">
              <div className="ip-day-carousel-wrapper">
                <button
                  type="button"
                  className="ip-carousel-btn ip-carousel-btn--prev"
                  disabled={dayIndex === 0}
                  onClick={() => attemptDayChange(dayIndex - 1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                
                <div className="ip-carousel" ref={dayCarouselRef}>
                  <div className="ip-carousel-track">
                    {days.map((day, idx) => (
                      <button
                        key={idx}
                        type="button"
                        ref={(el) => { dayItemRefs.current[idx] = el; }}
                        className={`ip-carousel-item ${dayIndex === idx ? 'ip-carousel-item--active' : ''}`}
                        onClick={() => attemptDayChange(idx)}
                      >
                        <span className="ip-carousel-day-number">Day {day.dayNumber}</span>
                        <span className="ip-carousel-day-date">{day.date || 'No date'}</span>
                        {day.approved && (
                          <span className="ip-carousel-approved-badge">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Approved
                          </span>
                        )}
                      </button>
                    ))}
                    
                    {canWriteReport && (
                      <button
                        type="button"
                        ref={(el) => { dayItemRefs.current[days.length] = el; }}
                        className="ip-carousel-add-day"
                        onClick={handleAddDayClick}
                        disabled={submitting}
                        title="Add a new internship day"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span className="ip-carousel-add-day-text">Add day</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <button
                  type="button"
                  className="ip-carousel-btn ip-carousel-btn--next"
                  disabled={dayIndex >= days.length - 1}
                  onClick={() => attemptDayChange(dayIndex + 1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>

              {currentDay && (
                <div className="ip-day-card">
                  <div className="ip-day-header">
                    <div>
                      <span className="ip-day-title">Day {currentDay.dayNumber}</span>
                      <div className="ip-day-subtitle">{currentDay.date || 'No date'}</div>
                    </div>
                    <div className="ip-day-header-actions">
                      <span className={`ip-day-badge ${currentDay.approved ? 'ip-day-badge--ok' : 'ip-day-badge--pending'}`}>
                        {currentDay.approved ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            Approved
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="12" y1="8" x2="12" y2="12"/>
                              <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            Pending
                          </>
                        )}
                      </span>
                      {canWriteReport && (
                        <button
                          type="button"
                          className="ip-day-edit-btn"
                          onClick={handleWriteReportOpen}
                          disabled={submitting}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"/>
                            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                          </svg>
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {currentDay.shortReport && (
                    <div className="ip-report">
                      <h4 className="ip-report-title">{currentDay.shortReport.title || 'Untitled'}</h4>
                      <div
                        className="ip-report-desc"
                        dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(currentDay.shortReport.description || '') }}
                      ></div>
                      {currentDayImageUrls.length > 0 && (
                        <div className="ip-report-images">
                          {currentDayImageUrls.map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="ip-report-img-btn"
                              onClick={() => setActiveImageSrc(img)}
                            >
                              <img src={img} alt={`Report ${idx + 1}`} className="ip-report-img" />
                            </button>
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
                          {currentDay.comments.map((comment, idx) => {
                            const user = typeof comment.userID === 'object' ? comment.userID : null;
                            const userName = user ? `${user.name} ${user.surname}` : 'Unknown User';
                            const userRole = user ? user.role : '';
                            const commentKey = getCommentKey(comment, idx);
                            return (
                              <li
                                key={comment._id || idx}
                                className={`ip-comment ${highlightedCommentKey === commentKey ? 'ip-comment--focus' : ''}`}
                              >
                                <div className="ip-comment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', fontSize: '12px', color: 'var(--t3, #9ba3bb)' }}>
                                  <div>
                                    <div style={{ fontWeight: 600, color: 'var(--t1, #0c0e18)', marginBottom: '4px' }}>{userName} {userRole && <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--a1, #635bff)' }}>({userRole})</span>}</div>
                                    <div>{new Date(comment.date).toLocaleDateString()} {new Date(comment.date).toLocaleTimeString()}</div>
                                  </div>
                                </div>
                                <p style={{ margin: 0 }}>{comment.text}</p>
                              </li>
                            );
                          })}
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
                  onClick={handleAddDayClick}
                >
                  {submitting ? 'Adding…' : 'Add first day'}
                </button>
              )}
            </div>
          )}
          
          {showFeedbackView && (
            <div className="ip-feedback-view">
              <div className="ip-feedback-header">
                <h3 className="ip-feedback-title">All Comments</h3>
                <button 
                  type="button" 
                  className="ip-btn ip-btn--secondary"
                  onClick={() => setShowFeedbackView(false)}
                >
                  Back to Days
                </button>
              </div>
              
              {allComments.length > 0 ? (
                <ul className="ip-comments-list">
                  {allComments.map((comment, idx) => {
                    const user = typeof comment.userID === 'object' ? comment.userID : null;
                    const userName = user ? `${user.name} ${user.surname}` : 'Unknown User';
                    const userRole = user ? user.role : '';
                    return (
                      <li key={comment.commentID || idx} className="ip-comment">
                        <div className="ip-comment-header">
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: 'var(--t1, #0c0e18)', marginBottom: '4px' }}>{userName} {userRole && <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--a1, #635bff)' }}>({userRole})</span>}</div>
                            <span className="ip-comment-day">Day {comment.dayNumber} • {new Date(comment.date).toLocaleDateString()} {new Date(comment.date).toLocaleTimeString()}</span>
                          </div>
                          <button 
                            type="button" 
                            className="ip-comment-navigate-btn"
                            onClick={() => navigateToDay(comment.dayIndex)}
                          >
                            Go to day
                          </button>
                        </div>
                        <p className="ip-comment-text">{comment.text}</p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="ip-empty-state">No comments found</div>
              )}
            </div>
          )}

          {activeImageSrc && typeof document !== 'undefined' && createPortal(
            <div className="ip-image-modal" onClick={() => setActiveImageSrc('')}>
              <button
                type="button"
                className="ip-image-modal-close"
                onClick={() => setActiveImageSrc('')}
                aria-label="Close image preview"
              >
                ×
              </button>
              <img
                src={activeImageSrc}
                alt="Full size report"
                className="ip-image-modal-content"
                onClick={(e) => e.stopPropagation()}
              />
            </div>,
            document.body,
          )}

          {showAddDayModal && typeof document !== 'undefined' && createPortal(
            <div className="ip-modal-overlay" onClick={() => setShowAddDayModal(false)}>
              <div className="ip-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="ip-modal-header">
                  <h3 className="ip-modal-title">Add New Day</h3>
                  <button 
                    type="button" 
                    className="ip-close-btn"
                    onClick={() => setShowAddDayModal(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="ip-modal-body">
                  <label className="ip-label" htmlFor="new-day-date">Select date for the new day</label>
                  <input
                    id="new-day-date"
                    type="date"
                    value={newDayDate}
                    onChange={(e) => setNewDayDate(e.target.value)}
                    className="ip-input ip-date-input"
                  />
                </div>
                <div className="ip-modal-footer">
                  <button 
                    type="button" 
                    className="ip-btn ip-btn--secondary"
                    onClick={() => setShowAddDayModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="ip-btn ip-btn--primary"
                    onClick={handleAddDayConfirm}
                    disabled={submitting}
                  >
                    {submitting ? 'Adding…' : 'Add Day'}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}

          {showStudentManager && typeof document !== 'undefined' && createPortal(
            <div className="ip-modal-overlay" onClick={() => setShowStudentManager(false)}>
              <div className="ip-modal-content ip-modal-content--wide" onClick={(e) => e.stopPropagation()}>
                <div className="ip-modal-header">
                  <h3 className="ip-modal-title">Manage students</h3>
                  <button
                    type="button"
                    className="ip-close-btn"
                    onClick={() => setShowStudentManager(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                <div className="ip-modal-body">
                  <label className="ip-label" htmlFor="student-search">Search students</label>
                  <input
                    id="student-search"
                    type="text"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="ip-input"
                    placeholder="Search by name or faculty"
                  />

                  <div className="ip-student-filter-row">
                    <div className="ip-filter-card">
                      <label className="ip-label" htmlFor="student-faculty-filter">Faculty</label>
                      <CustomFilterSelect
                        id="student-faculty-filter"
                        value={selectedStudentFaculty}
                        onChange={setSelectedStudentFaculty}
                        options={facultyFilterOptions}
                      />
                    </div>

                    <div className="ip-filter-card">
                      <label className="ip-label" htmlFor="student-year-filter">Faculty year</label>
                      <CustomFilterSelect
                        id="student-year-filter"
                        value={selectedStudentYear}
                        onChange={setSelectedStudentYear}
                        options={yearFilterOptions}
                      />
                    </div>
                  </div>

                  <div className="ip-student-manager-meta">
                    <span>{attachedStudents.length} attached</span>
                    <span>{studentDirectory.length} matching students</span>
                    <span>{selectedStudentIds.length} selected</span>
                  </div>

                  {studentDirectory.length === 0 ? (
                    <div className="ip-student-manager-empty">No students found.</div>
                  ) : (
                    <div className="ip-student-manager-list">
                      {studentDirectory.map(({ student, studentId, studentName, studentFacultyName, studentYear, isAttached }) => (
                        <label key={studentId || studentName} className="ip-student-manager-row">
                          <input
                            type="checkbox"
                            className="ip-student-check"
                            checked={Boolean(studentId && selectedStudentIds.includes(studentId))}
                            onChange={() => handleToggleStudentSelection(studentId)}
                            disabled={submitting || isAttached || !studentId}
                            aria-label={`Select ${studentName}`}
                          />
                          <div className="ip-student-copy">
                            <strong className="ip-student-name">{studentName}</strong>
                            {studentFacultyName && <span className="ip-student-faculty">{studentFacultyName}</span>}
                            {studentYear && <span className="ip-student-faculty">Year {studentYear}</span>}
                          </div>
                          <div className="ip-student-manager-actions">
                            <span className={`ip-student-badge ${isAttached ? 'ip-student-badge--attached' : 'ip-student-badge--free'}`}>
                              {isAttached ? 'Attached' : 'Available'}
                            </span>
                            {isAttached && (
                              <button
                                type="button"
                                className="ip-student-action-btn"
                                onClick={(event) => {
                                  event.preventDefault();
                                  handleDetachStudent(student);
                                }}
                                disabled={submitting}
                              >
                                Detach
                              </button>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ip-modal-footer">
                  <button
                    type="button"
                    className="ip-btn ip-btn--secondary"
                    onClick={() => setShowStudentManager(false)}
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    className="ip-btn ip-btn--primary"
                    onClick={handleAttachSelectedStudents}
                    disabled={submitting || selectedStudentIds.length === 0}
                  >
                    {submitting ? 'Adding…' : `Add selected (${selectedStudentIds.length})`}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}

          {showFinalReportModal && typeof document !== 'undefined' && createPortal(
            <div className="ip-modal-overlay" onClick={() => setShowFinalReportModal(false)}>
              <div className="ip-modal-content ip-modal-content--wide" onClick={(e) => e.stopPropagation()}>
                <div className="ip-modal-header">
                  <h3 className="ip-modal-title">AI Final Report (30 Days)</h3>
                  <button
                    type="button"
                    className="ip-close-btn"
                    onClick={() => setShowFinalReportModal(false)}
                    aria-label="Close final report"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                <div className="ip-modal-body">
                  {finalReportLoading && (
                    <div className="ip-final-report-state">Generating report from internship data, daily texts, and photos…</div>
                  )}

                  {!finalReportLoading && finalReportError && (
                    <div className="ip-final-report-state ip-final-report-state--error">{finalReportError}</div>
                  )}

                  {!finalReportLoading && !finalReportError && finalReportMarkdown && (
                    <div
                      className="ip-final-report-body"
                      dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(finalReportMarkdown) }}
                    ></div>
                  )}
                </div>

                <div className="ip-modal-footer">
                  <button
                    type="button"
                    className="ip-btn ip-btn--secondary"
                    onClick={() => setShowFinalReportModal(false)}
                  >
                    Close
                  </button>
                  {finalReportError && (
                    <button
                      type="button"
                      className="ip-btn ip-btn--primary"
                      onClick={handleFinalReport}
                      disabled={finalReportLoading}
                    >
                      Retry
                    </button>
                  )}
                  <button
                    type="button"
                    className="ip-btn ip-btn--primary"
                    onClick={() => window.print()}
                    disabled={finalReportLoading || !finalReportMarkdown}
                  >
                    Print final report
                  </button>
                </div>
              </div>
            </div>,
            document.body,
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
      radial-gradient(1200px 600px at 10% 0%, rgba(99,91,255,.12), transparent 60%),
      radial-gradient(900px 520px at 90% 10%, rgba(6,201,160,.10), transparent 55%),
      linear-gradient(180deg, rgba(241,244,250,.92), rgba(255,255,255,1));
  }
  .ip-shell { width: 100%; max-width: 1240px; margin: 0 auto; }
  .ip-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(99,91,255,.08);
    color: var(--a1, #635bff);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
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
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 22px;
    padding: 56px 24px;
    text-align: center;
    color: var(--t2, #5a6278);
    font-size: 15px;
    box-shadow: 0 18px 50px rgba(99,91,255,.10);
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
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 22px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 18px 50px rgba(99,91,255,.10);
    backdrop-filter: blur(18px);
  }
  .ip-report-form-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0 0 16px 0;
  }
  .ip-field { margin-bottom: 14px; }
  .ip-form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(clamp(140px,30vw,180px), 1fr));
    gap: clamp(10px,2vw,14px);
  }
  @media(max-width:640px){
    .ip-form-grid {
      grid-template-columns: 1fr;
    }
  }
  .ip-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--t2, #5a6278);
    margin-bottom: 6px;
  }
  .ip-checkbox-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1.5px solid rgba(0,0,0,.08);
    background: linear-gradient(135deg, rgba(99,91,255,.02), rgba(255,255,255,.8));
    cursor: pointer;
    transition: all .2s ease;
  }
  .ip-checkbox-row:hover {
    border-color: rgba(99,91,255,.2);
    background: linear-gradient(135deg, rgba(99,91,255,.04), rgba(255,255,255,.9));
  }
  .ip-checkbox-row--disabled {
    cursor: not-allowed;
    opacity: .8;
  }
  .ip-checkbox {
    margin-top: 2px;
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    accent-color: var(--a1, #635bff);
  }
  .ip-helper-text {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    line-height: 1.4;
    color: var(--t3, #9ba3bb);
  }
  .ip-form-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(99,91,255,.1);
    justify-content: flex-end;
    flex-wrap: wrap;
    width: 100%;
  }
  .ip-form-actions .ip-progress-bar {
    width: 100%;
    flex-basis: 100%;
    margin: 0 0 12px 0;
  }
  .ip-hero {
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,255,255,.84));
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 24px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 18px 60px rgba(99,91,255,.10);
    backdrop-filter: blur(18px);
  }
  .ip-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(600px 220px at 10% 0%, rgba(99,91,255,.10), transparent 60%);
    pointer-events: none;
  }
  .ip-hero-top,
  .ip-hero-summary {
    position: relative;
    z-index: 1;
  }
  .ip-hero-top {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: clamp(12px,3vw,20px);
    align-items: flex-start;
    margin-bottom: clamp(12px,3vw,20px);
  }
  .ip-hero-copyblock { max-width: 560px; }
  .ip-hero-copy {
    margin: clamp(8px,2vw,12px) 0 0;
    color: var(--t2, #5a6278);
    font-size: clamp(13px,2vw,14px);
    line-height: 1.6;
  }
  .ip-hero-statuslist {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: clamp(6px,1vw,8px);
  }
  .ip-status-pill {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 0 clamp(8px,2vw,12px);
    border-radius: 999px;
    background: rgba(99,91,255,.08);
    color: var(--a1, #635bff);
    border: 1px solid rgba(99,91,255,.12);
    font-size: clamp(11px,1.8vw,12px);
    font-weight: 700;
    white-space: nowrap;
  }
  .ip-status-pill--ok { background: rgba(6,201,160,.10); color: #047857; border-color: rgba(6,201,160,.18); }
  .ip-status-pill--warn { background: rgba(245,166,35,.12); color: #b45309; border-color: rgba(245,166,35,.18); }
  .ip-status-pill--internship-pending {
    background: rgba(245,166,35,.14);
    color: #9a4f00;
    border-color: rgba(245,166,35,.35);
  }
  .ip-status-pill--internship-in-progress {
    background: rgba(59,130,246,.14);
    color: #1d4ed8;
    border-color: rgba(59,130,246,.35);
  }
  .ip-status-pill--internship-completed {
    background: rgba(34,197,94,.14);
    color: #166534;
    border-color: rgba(34,197,94,.35);
  }
  .ip-status-action {
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(99,91,255,.24);
    background: rgba(255,255,255,.82);
    color: var(--a1, #635bff);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s ease;
  }
  .ip-status-action:hover:not(:disabled) {
    background: #fff;
    border-color: rgba(99,91,255,.45);
  }
  .ip-status-action--cancel {
    color: var(--t2, #5a6278);
    border-color: rgba(0,0,0,.16);
  }
  .ip-hero-title {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: clamp(24px, 4vw, 36px);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--t1, #0c0e18);
    margin: 0;
  }
  .ip-inline-title {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: clamp(24px, 4vw, 36px);
    font-weight: 700;
    letter-spacing: -0.02em;
    padding: 8px 12px;
    margin: 0;
  }
  .ip-inline-field {
    padding: 8px 10px;
    font-size: 14px;
  }
  .ip-hero-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(clamp(120px,35vw,1fr), 1fr));
    gap: clamp(10px,2vw,18px);
    position: relative;
    z-index: 1;
  }
  @media(max-width:640px){
    .ip-hero-grid {
      grid-template-columns: 1fr;
    }
  }
  .ip-hero-item {
    min-height: clamp(64px,12vw,76px);
    padding: clamp(12px,2vw,16px);
    border-radius: clamp(12px,2vw,16px);
    background: rgba(248,250,255,.92);
    border: 1px solid rgba(99,91,255,.08);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
  }
  .ip-hero-item--full { grid-column: 1 / -1; }
  .ip-hero-label {
    display: block;
    font-size: clamp(10px,1.8vw,11px);
    font-weight: 700;
    letter-spacing: .05em;
    color: var(--t3, #9ba3bb);
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .ip-hero-value { font-size: clamp(12px,2vw,14px); color: var(--t1, #0c0e18); }
  .ip-progress-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .ip-progress-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    min-width: 64px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(0,0,0,.12);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .02em;
  }
  .ip-progress-track {
    width: 100%;
    height: 10px;
    border-radius: 999px;
    background: rgba(15, 23, 42, .08);
    overflow: hidden;
    border: 1px solid rgba(15, 23, 42, .08);
  }
  .ip-progress-fill {
    height: 100%;
    min-width: 0;
    border-radius: 999px;
    transition: width .35s ease, background .35s ease;
  }
  .ip-progress-meta {
    font-size: 11px;
    color: var(--t3, #9ba3bb);
    font-weight: 600;
  }
  .ip-plan-card {
    margin-top: 14px;
    padding: 18px;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(99,91,255,.08), rgba(6,201,160,.05));
    border: 1px solid rgba(99,91,255,.12);
    box-shadow: 0 10px 26px rgba(99,91,255,.08);
  }
  .ip-plan-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }
  .ip-plan-toggle {
    border: 1px solid rgba(99,91,255,.2);
    background: rgba(255,255,255,.75);
    color: var(--a1, #635bff);
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s ease;
    flex-shrink: 0;
  }
  .ip-plan-toggle:hover {
    background: rgba(255,255,255,.95);
    border-color: rgba(99,91,255,.35);
  }
  .ip-plan-text {
    color: var(--t1, #0c0e18);
    font-size: 15px;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
  .ip-plan-editor {
    min-height: 240px;
    width: 100%;
    resize: vertical;
    line-height: 1.7;
    font-size: 15px;
  }
  .ip-plan-rendered {
    min-height: 220px;
    padding: 14px;
    border-radius: 14px;
    border: 1.5px solid rgba(99,91,255,.08);
    background: rgba(255,255,255,.88);
    line-height: 1.75;
    font-size: 15px;
  }
  .ip-plan-rendered h3 {
    margin: 0 0 8px;
    font-size: 18px;
    line-height: 1.3;
    color: var(--t1, #0c0e18);
  }
  .ip-plan-rendered p {
    margin: 0 0 10px;
  }
  .ip-plan-rendered p:last-child {
    margin-bottom: 0;
  }
  .ip-plan-rendered ul {
    margin: 0 0 10px 18px;
    padding: 0;
  }
  .ip-plan-rendered li {
    margin-bottom: 6px;
  }
  .ip-plan-rendered code {
    background: rgba(15,23,42,.08);
    padding: 1px 6px;
    border-radius: 6px;
    font-size: 13px;
  }
  .ip-format-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0 0 10px;
  }
  .ip-format-btn {
    border: 1px solid rgba(99,91,255,.2);
    background: rgba(255,255,255,.84);
    color: var(--a1, #635bff);
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s ease;
  }
  .ip-format-btn:hover {
    background: #fff;
    border-color: rgba(99,91,255,.4);
  }
  .ip-format-btn:disabled {
    opacity: .45;
    cursor: not-allowed;
  }
  .ip-hero-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(clamp(100px,22vw,1fr), 1fr));
    gap: clamp(8px,2vw,12px);
    margin-top: clamp(12px,2vw,18px);
  }
  @media(max-width:768px){
    .ip-hero-summary {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media(max-width:640px){
    .ip-hero-summary {
      grid-template-columns: 1fr;
    }
  }
  .ip-summary-card {
    padding: clamp(10px,2vw,14px) clamp(12px,2vw,16px);
    border-radius: clamp(12px,2vw,16px);
    background: rgba(248,250,255,.95);
    border: 1px solid rgba(99,91,255,.08);
  }
  .ip-summary-card--wide { grid-column: span 2; }
  @media(max-width:768px){
    .ip-summary-card--wide { grid-column: span 1; }
  }
  .ip-summary-label {
    display: block;
    margin-bottom: clamp(4px,1vw,6px);
    font-size: clamp(10px,1.8vw,11px);
    font-weight: 800;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--t3, #9ba3bb);
  }
  .ip-summary-value {
    display: block;
    color: var(--t1, #0c0e18);
    font-size: clamp(12px,2vw,14px);
    line-height: 1.35;
  }
  .ip-students-card {
    margin-top: 14px;
    padding: 14px 16px;
    border-radius: 16px;
    background: rgba(248,250,255,.95);
    border: 1px solid rgba(99,91,255,.08);
  }
  .ip-tutor-card {
    margin-top: 14px;
    padding: 14px 16px;
    border-radius: 16px;
    background: rgba(248,250,255,.95);
    border: 1px solid rgba(99,91,255,.08);
  }
  .ip-tutor-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }
  .ip-tutor-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .04em;
    text-transform: uppercase;
    color: #116c52;
    background: rgba(6,201,160,.12);
  }
  .ip-tutor-body {
    display: grid;
    gap: 4px;
  }
  .ip-tutor-name {
    font-size: 14px;
    font-weight: 800;
    color: var(--t1, #0c0e18);
  }
  .ip-tutor-contact {
    font-size: 12px;
    color: var(--t2, #5a6278);
  }
  .ip-tutor-empty {
    margin: 0;
    font-size: 13px;
    color: var(--t2, #5a6278);
  }
  .ip-students-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .ip-students-head-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ip-eye-btn {
    min-width: 34px;
    height: 34px;
    padding: 0 8px;
    border-radius: 10px;
    border: 1px solid rgba(99,91,255,.22);
    background: rgba(99,91,255,.08);
    color: var(--a1, #635bff);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition: all .2s ease;
  }
  .ip-eye-btn:hover {
    background: rgba(99,91,255,.16);
    border-color: rgba(99,91,255,.35);
  }
  .ip-student-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid rgba(99,91,255,.18);
    background: rgba(99,91,255,.08);
    color: var(--a1, #635bff);
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: background .2s ease, border-color .2s ease, transform .15s ease;
  }
  .ip-student-action-btn svg {
    flex-shrink: 0;
  }
  .ip-eye-chevron {
    transition: transform .2s ease;
  }
  .ip-eye-chevron--open {
    transform: rotate(180deg);
  }
  .ip-student-action-btn:hover:not(:disabled) {
    background: rgba(99,91,255,.14);
    border-color: rgba(99,91,255,.34);
    transform: translateY(-1px);
  }
  .ip-student-action-btn:disabled {
    opacity: .55;
    cursor: not-allowed;
    transform: none;
  }
  .ip-student-action-btn--ghost {
    background: rgba(255,255,255,.84);
    color: var(--t1, #0c0e18);
    border-color: rgba(0,0,0,.12);
  }
  .ip-student-action-btn--ghost:hover:not(:disabled) {
    background: rgba(0,0,0,.03);
    border-color: rgba(0,0,0,.18);
  }
  .ip-students-list-wrap {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px dashed rgba(99,91,255,.2);
  }
  .ip-students-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }
  .ip-student-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(255,255,255,.82);
    border: 1px solid rgba(0,0,0,.06);
  }
  .ip-student-copy {
    min-width: 0;
    display: grid;
    gap: 3px;
  }
  .ip-student-name {
    font-size: 13px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
  }
  .ip-student-faculty {
    font-size: 12px;
    color: var(--t2, #5a6278);
  }
  .ip-students-empty {
    margin: 0;
    font-size: 13px;
    color: var(--t2, #5a6278);
  }
  .ip-students-empty-state {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .ip-modal-content--wide {
    width: min(920px, calc(100vw - 32px));
  }
  .ip-final-report-state {
    padding: 14px 12px;
    border-radius: 12px;
    border: 1px solid rgba(99,91,255,.16);
    background: rgba(99,91,255,.06);
    color: var(--t2, #5a6278);
    font-size: 14px;
    line-height: 1.55;
  }
  .ip-final-report-state--error {
    border-color: rgba(239,68,68,.22);
    background: rgba(239,68,68,.08);
    color: #991b1b;
  }
  .ip-final-report-body {
    max-height: min(64vh, 760px);
    overflow: auto;
    padding: 14px 12px;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,.08);
    background: rgba(255,255,255,.95);
    color: var(--t1, #0c0e18);
    line-height: 1.7;
    font-size: 14px;
  }
  .ip-final-report-body p {
    margin: 0 0 10px;
  }
  .ip-final-report-body p:last-child {
    margin-bottom: 0;
  }
  .ip-final-report-body h3 {
    margin: 0 0 8px;
    font-size: 18px;
    line-height: 1.35;
  }
  .ip-final-report-body ul {
    margin: 0 0 10px 18px;
    padding: 0;
  }
  .ip-final-report-body li {
    margin-bottom: 6px;
  }
  .ip-student-manager-meta {
    display: flex;
    flex-wrap: wrap;
    gap: clamp(6px,1vw,10px);
    margin: clamp(8px,2vw,12px) 0 clamp(4px,1vw,8px);
    font-size: clamp(11px,1.8vw,12px);
    color: var(--t3, #9ba3bb);
  }
  .ip-student-filter-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(clamp(140px,40vw,1fr), 1fr));
    gap: clamp(10px,2vw,12px);
    margin-top: clamp(8px,2vw,12px);
  }
  @media(max-width:820px){
    .ip-student-filter-row {
      grid-template-columns: 1fr;
    }
  }
  .ip-filter-card {
    display: grid;
    gap: clamp(6px,1vw,8px);
    padding: clamp(8px,1.5vw,10px);
    border-radius: 12px;
    border: 1px solid rgba(99,91,255,.14);
    background: linear-gradient(180deg, rgba(255,255,255,.92), rgba(248,250,255,.92));
  }
  .ip-custom-select {
    position: relative;
  }
  .ip-custom-trigger {
    width: 100%;
    min-height: 44px;
    border-radius: 12px;
    border: 1.5px solid rgba(99,91,255,.2);
    background: rgba(255,255,255,.95);
    color: var(--t1, #0c0e18);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 600;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    cursor: pointer;
    transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
  }
  .ip-custom-trigger:hover {
    border-color: rgba(99,91,255,.42);
    background: rgba(255,255,255,.98);
  }
  .ip-custom-trigger--open {
    border-color: rgba(99,91,255,.58);
    box-shadow: 0 0 0 4px rgba(99,91,255,.14);
  }
  .ip-custom-trigger-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ip-custom-chevron {
    width: 8px;
    height: 8px;
    border-right: 2px solid rgba(76,86,122,.85);
    border-bottom: 2px solid rgba(76,86,122,.85);
    transform: rotate(45deg);
    transition: transform .2s ease;
    flex-shrink: 0;
    margin-top: -2px;
  }
  .ip-custom-chevron--open {
    transform: rotate(-135deg);
    margin-top: 3px;
  }
  .ip-custom-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 20;
    border-radius: 12px;
    border: 1px solid rgba(99,91,255,.2);
    background: rgba(255,255,255,.98);
    box-shadow: 0 18px 40px rgba(12,14,24,.12);
    max-height: 240px;
    overflow: auto;
    padding: 6px;
  }
  .ip-custom-option {
    width: 100%;
    border: none;
    background: transparent;
    border-radius: 10px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: var(--t1, #0c0e18);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  .ip-custom-option:hover {
    background: rgba(99,91,255,.08);
  }
  .ip-custom-option--selected {
    background: linear-gradient(135deg, rgba(99,91,255,.12), rgba(6,201,160,.12));
    color: #4338ca;
  }
  .ip-custom-option-mark {
    font-size: 12px;
    font-weight: 800;
    color: #4338ca;
  }
  .ip-student-manager-list {
    display: grid;
    gap: 10px;
    margin-top: 14px;
    max-height: min(54vh, 520px);
    overflow: auto;
    padding-right: 4px;
  }
  .ip-student-manager-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid rgba(0,0,0,.08);
    background: rgba(248,250,255,.9);
  }
  .ip-student-manager-row:has(.ip-student-check:checked) {
    border-color: rgba(99,91,255,.34);
    box-shadow: 0 0 0 3px rgba(99,91,255,.08);
  }
  .ip-student-check {
    width: 18px;
    height: 18px;
    accent-color: var(--a1, #635bff);
    cursor: pointer;
    flex-shrink: 0;
  }
  .ip-student-manager-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .ip-student-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .04em;
    text-transform: uppercase;
  }
  .ip-student-badge--attached {
    color: #116c52;
    background: rgba(6,201,160,.12);
  }
  .ip-student-badge--free {
    color: #7a5417;
    background: rgba(255,193,7,.16);
  }
  .ip-student-manager-empty {
    margin-top: 14px;
    padding: 16px;
    border-radius: 14px;
    background: rgba(248,250,255,.9);
    border: 1px dashed rgba(99,91,255,.24);
    color: var(--t2, #5a6278);
    font-size: 13px;
  }
  .ip-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 24px;
    position: sticky;
    top: 12px;
    z-index: 5;
    padding: 12px;
    border-radius: 18px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(0,0,0,.06);
    backdrop-filter: blur(18px);
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
  .ip-days { margin-bottom: clamp(16px,3vw,24px); }
  .ip-day-nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: clamp(8px,2vw,12px);
    margin-bottom: clamp(12px,2vw,16px);
  }
  .ip-day-label {
    font-size: clamp(12px,1.8vw,13px);
    font-weight: 600;
    color: var(--t2, #5a6278);
  }
  .ip-select {
    padding: clamp(8px,1.5vw,10px) clamp(10px,2vw,14px);
    border-radius: 12px;
    border: 1.5px solid rgba(0,0,0,.10);
    background: rgba(0,0,0,.03);
    color: var(--t1, #0c0e18);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: clamp(12px,1.8vw,14px);
    outline: none;
    transition: border-color .2s ease, box-shadow .2s ease;
  }
  .ip-select:focus {
    border-color: rgba(99,91,255,.55);
    box-shadow: 0 0 0 4px rgba(99,91,255,.14);
  }
  .ip-day-btns { display: flex; gap: clamp(6px,1vw,8px); flex-wrap: wrap; }
  .ip-day-card {
    background: rgba(255,255,255,.94);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: clamp(16px,3vw,22px);
    padding: clamp(16px,3vw,24px);
    box-shadow: 0 18px 50px rgba(99,91,255,.10);
    backdrop-filter: blur(18px);
  }
  .ip-day-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: clamp(8px,2vw,12px);
    margin-bottom: clamp(12px,2vw,20px);
    padding-bottom: clamp(10px,2vw,16px);
    border-bottom: 1px solid rgba(0,0,0,.06);
  }
  .ip-day-title {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: clamp(16px,3vw,18px);
    font-weight: 700;
    color: var(--t1, #0c0e18);
  }
  .ip-day-subtitle {
    margin-top: clamp(2px,1vw,4px);
    font-size: clamp(11px,1.8vw,12px);
    color: var(--t3, #9ba3bb);
  }
  .ip-day-header-actions {
    display: inline-flex;
    align-items: center;
    gap: clamp(6px,1vw,8px);
  }
  .ip-day-badge {
    display: inline-flex;
    align-items: center;
    gap: clamp(4px,1vw,6px);
    font-size: clamp(11px,1.8vw,12px);
    font-weight: 600;
    padding: 7px 14px;
    border-radius: 10px;
    transition: all .2s cubic-bezier(0.34, 1.56, 0.64, 1);
    white-space: nowrap;
  }
  .ip-day-badge svg {
    flex-shrink: 0;
  }
  .ip-day-badge--ok {
    background: linear-gradient(135deg, rgba(6,201,160,.12), rgba(6,201,160,.06));
    color: #047857;
    border: 1px solid rgba(6,201,160,.3);
    box-shadow: inset 0 1px 2px rgba(6,201,160,.1), 0 2px 6px rgba(6,201,160,.08);
  }
  .ip-day-badge--ok:hover {
    background: linear-gradient(135deg, rgba(6,201,160,.15), rgba(6,201,160,.08));
    border-color: rgba(6,201,160,.5);
    box-shadow: inset 0 1px 2px rgba(6,201,160,.1), 0 4px 12px rgba(6,201,160,.12);
    transform: translateY(-1px);
  }
  .ip-day-badge--pending {
    background: linear-gradient(135deg, rgba(245,166,35,.12), rgba(245,166,35,.06));
    color: #b45309;
    border: 1px solid rgba(245,166,35,.3);
    box-shadow: inset 0 1px 2px rgba(245,166,35,.1), 0 2px 6px rgba(245,166,35,.08);
  }
  .ip-day-badge--pending:hover {
    background: linear-gradient(135deg, rgba(245,166,35,.15), rgba(245,166,35,.08));
    border-color: rgba(245,166,35,.5);
    box-shadow: inset 0 1px 2px rgba(245,166,35,.1), 0 4px 12px rgba(245,166,35,.12);
    transform: translateY(-1px);
  }
  .ip-day-badge--pending svg {
    animation: pulse-info 2s ease-in-out infinite;
  }
  .ip-day-edit-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 34px;
    padding: 0 12px;
    border-radius: 10px;
    border: 1px solid rgba(99,91,255,.24);
    background: rgba(99,91,255,.08);
    color: var(--a1, #635bff);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s ease;
    white-space: nowrap;
  }
  .ip-day-edit-btn:hover:not(:disabled) {
    background: rgba(99,91,255,.16);
    border-color: rgba(99,91,255,.36);
  }
  .ip-day-edit-btn:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
  @keyframes pulse-info {
    0%, 100% { opacity: 1; }
    50% { opacity: .6; }
  }
  .ip-report {
    margin-bottom: 20px;
    padding: 18px;
    background: linear-gradient(180deg, rgba(99,91,255,.05), rgba(6,201,160,.03));
    border-radius: 14px;
    border: 1px solid rgba(0,0,0,.06);
  }
  .ip-report-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0 0 8px 0;
  }
  .ip-report-desc {
    font-size: 14px;
    color: var(--t2, #5a6278);
    margin: 0;
    line-height: 1.6;
  }
  .ip-report-desc p {
    margin: 0 0 10px;
  }
  .ip-report-desc p:last-child {
    margin-bottom: 0;
  }
  .ip-report-desc h3 {
    margin: 0 0 8px;
    font-size: 17px;
    line-height: 1.3;
    color: var(--t1, #0c0e18);
  }
  .ip-report-desc ul {
    margin: 0 0 10px 18px;
    padding: 0;
  }
  .ip-report-desc li {
    margin-bottom: 6px;
  }
  .ip-report-desc code {
    background: rgba(15,23,42,.08);
    padding: 1px 6px;
    border-radius: 6px;
    font-size: 13px;
  }
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
  .ip-report-img-btn {
    border: none;
    padding: 0;
    background: transparent;
    border-radius: 10px;
    cursor: zoom-in;
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
    padding: 14px 16px;
    background: rgba(255,255,255,.95);
    border: 1px solid rgba(0,0,0,.06);
    border-radius: 16px;
    font-size: 13px;
    color: var(--t2, #5a6278);
  .ip-comment--focus {
    border-color: rgba(99,91,255,.4);
    background: linear-gradient(135deg, rgba(99,91,255,.14), rgba(6,201,160,.08));
    box-shadow: 0 0 0 3px rgba(99,91,255,.14);
    animation: ipCommentPulse 1.2s ease 1;
  }
  @keyframes ipCommentPulse {
    0% { transform: translateY(0); }
    35% { transform: translateY(-2px); }
    100% { transform: translateY(0); }
  }
    margin-bottom: 8px;
    box-shadow: 0 8px 24px rgba(15,23,42,.04);
  }
  .ip-comment-form {
    display: flex;
    gap: 10px;
    margin-top: 14px;
    align-items: stretch;
  }
  .ip-input {
    padding: 12px 14px;
    border-radius: 14px;
    border: 1.5px solid rgba(0,0,0,.08);
    background: linear-gradient(135deg, rgba(99,91,255,.02), rgba(255,255,255,.8));
    color: var(--t1, #0c0e18);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 14px;
    outline: none;
    transition: all .25s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-sizing: border-box;
    width: 100%;
  }
  .ip-comment-form .ip-input {
    flex: 1;
  }
  .ip-input::placeholder { color: rgba(90,98,120,.5); }
  .ip-input:focus {
    border-color: rgba(99,91,255,.45);
    box-shadow: 0 0 0 5px rgba(99,91,255,.08), inset 0 0 0 1px rgba(99,91,255,.1);
    background: linear-gradient(135deg, rgba(99,91,255,.04), rgba(255,255,255,.95));
  }
  .ip-input:hover:not(:focus) {
    border-color: rgba(99,91,255,.2);
  }
  .ip-empty-card {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 22px;
    padding: 44px 24px;
    text-align: center;
    color: var(--t2, #5a6278);
    font-size: 14px;
    box-shadow: 0 18px 50px rgba(99,91,255,.10);
  }
  .ip-image-upload-container { margin-top: 12px; }
  .ip-image-upload-area {
    display: block;
    position: relative;
    border: 2px dashed rgba(99,91,255,.25);
    border-radius: 14px;
    padding: 28px 24px;
    text-align: center;
    cursor: pointer;
    background: linear-gradient(135deg, rgba(99,91,255,.04), rgba(6,201,160,.02));
    transition: all .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
  }
  .ip-image-upload-area:hover {
    border-color: rgba(99,91,255,.4);
    background: linear-gradient(135deg, rgba(99,91,255,.08), rgba(6,201,160,.05));
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99,91,255,.12);
  }
  .ip-image-input { display: none; }
  .ip-upload-content {
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .ip-upload-icon {
    font-size: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, rgba(99,91,255,.15), rgba(6,201,160,.08));
    border-radius: 10px;
    margin: 0 auto 6px auto;
    color: var(--a1, #635bff);
  }
  .ip-upload-text {
    margin: 0;
    color: var(--a1, #635bff);
    font-weight: 600;
    font-size: 14px;
  }
  .ip-upload-hint {
    margin: 0;
    color: var(--t3, #9ba3bb);
    font-size: 12px;
  }
  .ip-image-previews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
    margin-top: 16px;
  }
  .ip-image-preview-item {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    background: rgba(0,0,0,.05);
    border: 1px solid rgba(0,0,0,.08);
    aspect-ratio: 1;
    transition: all .2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ip-image-preview-item:hover {
    box-shadow: 0 6px 18px rgba(99,91,255,.12);
    transform: translateY(-2px) scale(1.03);
  }
  .ip-image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .ip-remove-image-btn {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,.95);
    border: 1px solid rgba(0,0,0,.12);
    border-radius: 8px;
    cursor: pointer;
    color: #ef4444;
    padding: 0;
    transition: all .2s cubic-bezier(0.34, 1.56, 0.64, 1);
    opacity: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,.1);
  }
  .ip-image-preview-item:hover .ip-remove-image-btn {
    opacity: 1;
  }
  .ip-remove-image-btn:hover {
    background: #ef4444;
    color: #fff;
    transform: scale(1.15);
    box-shadow: 0 4px 12px rgba(239, 68, 68, .3);
  }
  .ip-image-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,.82);
    z-index: 1110;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(16px, 3vw, 36px);
    overflow: hidden;
    touch-action: none;
  }
  .ip-image-modal-content {
    max-width: calc(100vw - (2 * clamp(16px, 3vw, 36px)));
    max-height: calc(100vh - (2 * clamp(16px, 3vw, 36px)));
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: clamp(0px, 1.2vw, 12px);
    box-shadow: 0 24px 80px rgba(0,0,0,.45);
  }
  .ip-image-modal-close {
    position: absolute;
    top: 18px;
    right: 18px;
    width: 42px;
    height: 42px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.32);
    background: rgba(0,0,0,.42);
    color: #fff;
    font-size: 28px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ip-report-form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .ip-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--t2, #5a6278);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all .2s ease;
  }
  .ip-close-btn:hover {
    background: rgba(0,0,0,.05);
    color: var(--t1, #0c0e18);
  }
  .ip-report-form-wrapper {
    max-width: 560px;
    margin: 0 auto;
  }
  .ip-report-form {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .ip-form-section {
    padding: 20px 0;
  }
  .ip-form-section:first-child {
    padding-top: 0;
  }
  .ip-form-section:last-child {
    padding-bottom: 0;
  }
  .ip-form-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,91,255,.15), transparent);
    margin: 0;
  }
  .ip-textarea {
    resize: vertical;
    font-family: 'Epilogue', system-ui, sans-serif;
    min-height: 140px;
  }
  .ip-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin .8s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .ip-feedback-view {
    background: rgba(255,255,255,.86);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 18px;
    padding: 24px;
    box-shadow: 0 14px 44px rgba(99,91,255,.10);
  }
  .ip-feedback-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(0,0,0,.06);
  }
  .ip-feedback-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0;
  }
  .ip-comment-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }
  .ip-comment-day {
    font-size: 12px;
    font-weight: 600;
    color: var(--t3, #9ba3bb);
  }
  .ip-comment-navigate-btn {
    padding: 4px 10px;
    border-radius: 8px;
    border: 1px solid rgba(99,91,255,.2);
    background: rgba(99,91,255,.08);
    color: var(--a1, #635bff);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s ease;
  }
  .ip-comment-navigate-btn:hover {
    background: rgba(99,91,255,.15);
    border-color: rgba(99,91,255,.4);
  }
  .ip-comment-text { margin: 0; }
  .ip-empty-state {
    text-align: center;
    color: var(--t3, #9ba3bb);
    font-size: 14px;
    padding: 24px;
  }
  .ip-day-carousel-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    margin-bottom: 24px;
    min-width: 0;
  }
  .ip-carousel-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid rgba(99,91,255,.24);
    background: rgba(255,255,255,.95);
    border-radius: 10px;
    cursor: pointer;
    color: var(--a1, #635bff);
    transition: all .2s ease;
    padding: 0;
    flex-shrink: 0;
    z-index: 2;
    box-shadow: 0 8px 18px rgba(99,91,255,.12);
  }
  .ip-carousel-btn:hover:not(:disabled) {
    background: #fff;
    border-color: rgba(99,91,255,.5);
    transform: translateY(-1px) scale(1.03);
  }
  .ip-carousel-btn:disabled {
    opacity: .4;
    cursor: not-allowed;
  }
  .ip-carousel {
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    border-radius: 16px;
    background: rgba(255,255,255,.55);
    border: 1px solid rgba(0,0,0,.06);
    padding: 8px 6px;
    scrollbar-width: none;
  }
  .ip-carousel::-webkit-scrollbar { display: none; }
  .ip-carousel-track {
    display: flex;
    gap: 12px;
    width: max-content;
    min-width: 100%;
    transition: none;
  }
  .ip-carousel-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1.5px solid rgba(99,91,255,.1);
    background: rgba(255,255,255,.7);
    cursor: pointer;
    transition: all .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    min-width: clamp(150px, 28vw, 220px);
    max-width: clamp(150px, 28vw, 220px);
    text-align: center;
    position: relative;
    flex: 0 0 clamp(150px, 28vw, 220px);
  }
  .ip-carousel-item:hover {
    border-color: rgba(99,91,255,.3);
    background: rgba(255,255,255,.95);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99,91,255,.1);
  }
  .ip-carousel-item--active {
    border-color: rgba(99,91,255,.5);
    background: linear-gradient(135deg, rgba(99,91,255,.12), rgba(6,201,160,.08));
    box-shadow: 0 8px 24px rgba(99,91,255,.15);
  }
  .ip-carousel-day-number {
    font-size: 13px;
    font-weight: 700;
    color: var(--a1, #635bff);
  }
  .ip-carousel-day-date {
    font-size: 11px;
    color: var(--t3, #9ba3bb);
  }
  .ip-carousel-approved-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 700;
    background: linear-gradient(135deg, rgba(6,201,160,.15), rgba(6,201,160,.08));
    color: #047857;
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid rgba(6,201,160,.25);
    margin-top: 4px;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(6,201,160,.08);
    transition: all .2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ip-carousel-item:hover .ip-carousel-approved-badge {
    background: linear-gradient(135deg, rgba(6,201,160,.2), rgba(6,201,160,.12));
    border-color: rgba(6,201,160,.4);
    box-shadow: 0 4px 8px rgba(6,201,160,.12);
  }
  .ip-carousel-item--active .ip-carousel-approved-badge {
    background: linear-gradient(135deg, rgba(6,201,160,.25), rgba(6,201,160,.15));
    border-color: rgba(6,201,160,.5);
    box-shadow: 0 4px 12px rgba(6,201,160,.15);
  }
  .ip-carousel-add-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px dashed rgba(99,91,255,.25);
    background: linear-gradient(135deg, rgba(99,91,255,.06), rgba(6,201,160,.03));
    cursor: pointer;
    transition: all .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    min-width: clamp(150px, 28vw, 220px);
    max-width: clamp(150px, 28vw, 220px);
    text-align: center;
    position: relative;
    flex: 0 0 clamp(150px, 28vw, 220px);
    color: var(--a1, #635bff);
    font-size: 13px;
    font-weight: 600;
  }
  .ip-carousel-add-day:hover:not(:disabled) {
    border-color: rgba(99,91,255,.4);
    background: linear-gradient(135deg, rgba(99,91,255,.1), rgba(6,201,160,.06));
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99,91,255,.15);
  }
  .ip-carousel-add-day:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
  .ip-carousel-add-day svg {
    width: 20px;
    height: 20px;
    color: var(--a1, #635bff);
  }
  .ip-carousel-add-day-text {
    font-size: 12px;
    font-weight: 600;
    color: var(--a1, #635bff);
  }
  .ip-progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(0,0,0,.08);
    border-radius: 999px;
    overflow: hidden;
    margin-top: 12px;
  }
  .ip-progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--a1, #635bff), var(--a2, #06c9a0));
    border-radius: 999px;
    transition: width .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 0 10px rgba(99,91,255,.3);
  }
  .ip-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
    animation: fadeIn .2s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .ip-modal-content {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    max-width: 400px;
    width: 90%;
    animation: slideUp .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .ip-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  .ip-modal-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0;
  }
  .ip-modal-body {
    padding: 24px 20px;
  }
  .ip-modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }
  .ip-date-input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1.5px solid rgba(0, 0, 0, 0.08);
    background: linear-gradient(135deg, rgba(99, 91, 255, 0.02), rgba(255, 255, 255, 0.8));
    color: var(--t1, #0c0e18);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 14px;
    margin-top: 8px;
    box-sizing: border-box;
    outline: none;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ip-date-input:focus {
    border-color: rgba(99, 91, 255, 0.45);
    box-shadow: 0 0 0 5px rgba(99, 91, 255, 0.08), inset 0 0 0 1px rgba(99, 91, 255, 0.1);
    background: linear-gradient(135deg, rgba(99, 91, 255, 0.04), rgba(255, 255, 255, 0.95));
  }
  .ip-date-input:hover:not(:focus) {
    border-color: rgba(99, 91, 255, 0.2);
  }
  @media (min-width: 640px) {
    .ip-hero-title { font-size: 32px; }
    .ip-hero { padding: 28px; }
    .ip-hero-grid { grid-template-columns: repeat(3, 1fr); }
    .ip-hero-item--full { grid-column: 1 / -1; }
    .ip-image-previews-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
  }
  @media (max-width: 760px) {
    .ip-hero-top { flex-direction: column; }
    .ip-hero-statuslist { justify-content: flex-start; }
    .ip-hero-summary { grid-template-columns: 1fr 1fr; }
    .ip-summary-card--wide { grid-column: 1 / -1; }
    .ip-actions { position: static; }
    .ip-comment-form { flex-direction: column; }
    .ip-plan-card { padding: 16px; }
    .ip-plan-text { font-size: 14px; line-height: 1.7; }
  }
`;