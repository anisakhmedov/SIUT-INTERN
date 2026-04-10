import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ChevronDown,
  Eye,
  FileImage,
  Filter,
  LoaderCircle,
  Search,
  Upload,
  Users,
} from 'lucide-react';
import {
  uploadStudentMedicineImage,
  uploadStudentPassportImage,
  validateStudentImageFile,
} from '../utils/studentApi';

function getStudentId(student, fallbackIndex = 0) {
  return student?._id || student?.id || student?.studentId || `${student?.name || 'student'}-${fallbackIndex}`;
}

function getStudentImageValue(student, field) {
  const source = student?.[field] || student?.[`${field}Image`] || student?.[`${field}Url`];

  if (!source) return null;
  if (typeof source === 'string') return source;
  if (source?.url) return source.url;

  return null;
}

export default function StudentDocumentsPage({ students = [], search = '', onStudentUpdated }) {
  const [localStudents, setLocalStudents] = useState(students);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [passportFilter, setPassportFilter] = useState('all');
  const [medicineFilter, setMedicineFilter] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState(() => getStudentId(students[0]));
  const [toasts, setToasts] = useState([]);
  const [uploadState, setUploadState] = useState({
    passport: { loading: false, progress: 0 },
    medicine: { loading: false, progress: 0 },
  });
  const toastTimerRef = useRef(new Map());

  useEffect(() => {
    setLocalStudents(students);
    if (students.length === 0) {
      setSelectedStudentId('');
      return;
    }

    const stillExists = students.some((student, index) => getStudentId(student, index) === selectedStudentId);
    if (!stillExists) {
      setSelectedStudentId(getStudentId(students[0]));
    }
  }, [students, selectedStudentId]);

  useEffect(() => () => {
    toastTimerRef.current.forEach((timerId) => clearTimeout(timerId));
    toastTimerRef.current.clear();
  }, []);

  const pushToast = useCallback((type, title, message) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, type, title, message }]);

    const timerId = setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
      toastTimerRef.current.delete(id);
    }, 3500);

    toastTimerRef.current.set(id, timerId);
  }, []);

  const hasImage = useCallback((student, field) => Boolean(getStudentImageValue(student, field)), []);

  const getStudentFullName = useCallback((student) => [student?.name, student?.surname, student?.lastname].filter(Boolean).join(' ').trim(), []);

  const facultyOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        localStudents
          .map((student) => student?.nameFaculty || student?.faculty?.name)
          .filter(Boolean),
      ),
    );

    return values.sort((a, b) => a.localeCompare(b));
  }, [localStudents]);

  const documentStats = useMemo(() => {
    const stats = {
      total: localStudents.length,
      withPassport: 0,
      withMedicine: 0,
      complete: 0,
      missingAny: 0,
    };

    localStudents.forEach((student) => {
      const passportReady = hasImage(student, 'passport');
      const medicineReady = hasImage(student, 'medicine');

      if (passportReady) stats.withPassport += 1;
      if (medicineReady) stats.withMedicine += 1;
      if (passportReady && medicineReady) stats.complete += 1;
      if (!passportReady || !medicineReady) stats.missingAny += 1;
    });

    return stats;
  }, [hasImage, localStudents]);

  const filteredStudents = useMemo(() => {
    const externalSearch = search.trim().toLowerCase();
    const internalSearch = localSearch.trim().toLowerCase();
    const term = `${externalSearch} ${internalSearch}`.trim();

    const filtered = localStudents.filter((student) => {
      const facultyName = student?.nameFaculty || student?.faculty?.name || '';
      const passportReady = hasImage(student, 'passport');
      const medicineReady = hasImage(student, 'medicine');

      if (selectedFaculty !== 'all' && facultyName !== selectedFaculty) {
        return false;
      }

      if (passportFilter === 'has' && !passportReady) {
        return false;
      }

      if (passportFilter === 'missing' && passportReady) {
        return false;
      }

      if (medicineFilter === 'has' && !medicineReady) {
        return false;
      }

      if (medicineFilter === 'missing' && medicineReady) {
        return false;
      }

      if (!term) return true;

      const fullText = [
        student?.name,
        student?.surname,
        student?.lastname,
        student?.nameFaculty,
        student?.faculty?.name,
        student?.gender,
        student?.year,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return fullText.includes(term);
    });

    return filtered.sort((a, b) => getStudentFullName(a).localeCompare(getStudentFullName(b)));
  }, [getStudentFullName, hasImage, localSearch, localStudents, medicineFilter, passportFilter, search, selectedFaculty]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (localSearch.trim()) count += 1;
    if (selectedFaculty !== 'all') count += 1;
    if (passportFilter !== 'all') count += 1;
    if (medicineFilter !== 'all') count += 1;
    return count;
  }, [localSearch, medicineFilter, passportFilter, selectedFaculty]);

  const clearLocalFilters = useCallback(() => {
    setLocalSearch('');
    setSelectedFaculty('all');
    setPassportFilter('all');
    setMedicineFilter('all');
  }, []);

  const selectedStudent = useMemo(() => {
    if (!filteredStudents.length) return null;
    return filteredStudents.find((student, index) => getStudentId(student, index) === selectedStudentId) || filteredStudents[0];
  }, [filteredStudents, selectedStudentId]);

  useEffect(() => {
    if (!filteredStudents.length) {
      if (selectedStudentId) setSelectedStudentId('');
      return;
    }

    const exists = filteredStudents.some((student, index) => getStudentId(student, index) === selectedStudentId);
    if (!exists) {
      setSelectedStudentId(getStudentId(filteredStudents[0]));
    }
  }, [filteredStudents, selectedStudentId]);

  const updateStudent = useCallback((studentId, patch) => {
    setLocalStudents((current) => {
      const next = current.map((student, index) => {
        const currentId = getStudentId(student, index);
        if (currentId !== studentId) return student;
        return { ...student, ...patch };
      });

      if (onStudentUpdated) {
        const updatedStudent = next.find((student, index) => getStudentId(student, index) === studentId) || null;
        if (updatedStudent) onStudentUpdated(updatedStudent);
      }

      return next;
    });
  }, [onStudentUpdated]);

  const handleUpload = useCallback(async (field, file) => {
    const student = selectedStudent;
    if (!student) return;

    const validationError = validateStudentImageFile(file);
    if (validationError) {
      pushToast('error', 'Validation error', validationError);
      return;
    }

    const studentId = getStudentId(student);
    const isPassport = field === 'passport';

    setUploadState((current) => ({
      ...current,
      [field]: { loading: true, progress: 0 },
    }));

    try {
      const uploadFn = isPassport ? uploadStudentPassportImage : uploadStudentMedicineImage;
      const response = await uploadFn(studentId, file, (progress) => {
        setUploadState((current) => ({
          ...current,
          [field]: { loading: true, progress },
        }));
      });

      const image = response?.image || null;
      if (!image) {
        throw new Error('Upload failed');
      }

      const patch = isPassport ? { passport: image, passportImage: image } : { medicine: image, medicineImage: image };
      updateStudent(studentId, patch);

      setUploadState((current) => ({
        ...current,
        [field]: { loading: false, progress: 100 },
      }));

      pushToast('success', 'Upload complete', response?.message || `${isPassport ? 'Passport' : 'Medicine'} image uploaded successfully.`);
    } catch (error) {
      pushToast('error', 'Upload failed', error?.message || 'Upload failed');
    } finally {
      setTimeout(() => {
        setUploadState((current) => ({
          ...current,
          [field]: { loading: false, progress: 0 },
        }));
      }, 120);
    }
  }, [pushToast, selectedStudent, updateStudent]);

  const selectedPassportUrl = getStudentImageValue(selectedStudent, 'passport');
  const selectedMedicineUrl = getStudentImageValue(selectedStudent, 'medicine');

  const openImage = useCallback((url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div className="student-docs-page">
      <style>{`
        .student-docs-page {
          min-height: calc(100vh - 64px);
          padding: clamp(18px, 3vw, 40px);
          background:
            radial-gradient(1200px 520px at 8% 0%, rgba(99,91,255,.12), transparent 55%),
            radial-gradient(900px 520px at 94% 8%, rgba(6,201,160,.12), transparent 52%),
            linear-gradient(180deg, rgba(240,241,247,.72), rgba(255,255,255,1));
        }
        .student-docs-shell {
          max-width: 1420px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(300px, 410px) minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }
        .student-docs-aside,
        .student-docs-main,
        .student-docs-panel {
          background: rgba(255,255,255,.82);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 22px;
          box-shadow: 0 18px 56px rgba(99,91,255,.10);
          backdrop-filter: blur(20px);
        }
        .student-docs-aside {
          overflow: hidden;
        }
        .student-docs-main {
          padding: 24px;
        }
        .student-docs-head {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(0,0,0,.06);
        }
        .student-docs-eyebrow {
          margin: 0 0 8px 0;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--a1, #635bff);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .student-docs-eyebrow::before {
          content: '';
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
        }
        .student-docs-title {
          margin: 0;
          font-family: 'Syne', system-ui, sans-serif;
          font-size: clamp(28px, 4vw, 40px);
          line-height: 1.08;
          color: var(--t1, #0c0e18);
          letter-spacing: -0.03em;
        }
        .student-docs-subtitle {
          margin: 8px 0 0 0;
          color: var(--t2, #5a6278);
          font-size: 14px;
          line-height: 1.55;
          max-width: 720px;
        }
        .student-docs-count {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          padding: 10px 14px;
          background: rgba(99,91,255,.10);
          color: var(--a1, #635bff);
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }
        .student-docs-count svg {
          flex-shrink: 0;
        }
        .student-docs-head-right {
          display: grid;
          gap: 10px;
          justify-items: end;
        }
        .student-docs-quickstats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          width: min(500px, 100%);
        }
        .student-docs-quickstat {
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,.08);
          background: rgba(255,255,255,.76);
          padding: 8px 10px;
          text-align: center;
        }
        .student-docs-quickstat strong {
          display: block;
          font-size: 16px;
          color: var(--t1, #0c0e18);
          font-family: 'Syne', system-ui, sans-serif;
          line-height: 1.1;
        }
        .student-docs-quickstat span {
          display: block;
          margin-top: 3px;
          color: var(--t2, #5a6278);
          font-size: 11px;
          font-weight: 700;
        }
        .student-list-wrap {
          display: flex;
          flex-direction: column;
          min-height: 74vh;
        }
        .student-list-head {
          padding: 20px 20px 16px;
          border-bottom: 1px solid rgba(0,0,0,.06);
        }
        .student-list-head-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .student-filter-toggle {
          min-width: 68px;
          height: 34px;
          border: 1px solid rgba(99,91,255,.24);
          background: linear-gradient(135deg, rgba(99,91,255,.12), rgba(6,201,160,.08));
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 9px;
          cursor: pointer;
          transition: transform .26s cubic-bezier(.22,1,.36,1), box-shadow .26s ease, border-color .2s ease;
        }
        .student-filter-toggle:hover {
          border-color: rgba(99,91,255,.5);
          box-shadow: 0 10px 22px rgba(99,91,255,.18);
          transform: translateY(-1px);
        }
        .student-filter-toggle-main {
          color: var(--a1, #635bff);
          opacity: .95;
        }
        .student-filter-toggle-arrow {
          color: var(--a1, #635bff);
          transition: transform .36s cubic-bezier(.22,1,.36,1);
        }
        .student-filter-toggle.open .student-filter-toggle-arrow {
          transform: rotate(180deg);
        }
        .student-filter-collapse {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transform: translateY(-8px);
          transition: grid-template-rows .42s cubic-bezier(.22,1,.36,1), opacity .28s ease, transform .28s ease;
        }
        .student-filter-collapse.open {
          grid-template-rows: 1fr;
          opacity: 1;
          transform: translateY(0);
        }
        .student-filter-collapse-inner {
          overflow: hidden;
          padding-top: 0;
          transition: padding-top .28s ease;
        }
        .student-filter-collapse.open .student-filter-collapse-inner {
          padding-top: 12px;
        }
        .student-filter-block {
          margin-top: 14px;
          display: grid;
          gap: 12px;
          padding: 12px;
          border-radius: 16px;
          border: 1px solid rgba(99,91,255,.14);
          background:
            linear-gradient(135deg, rgba(99,91,255,.06), rgba(6,201,160,.04));
          box-shadow: inset 0 1px 0 rgba(255,255,255,.72);
        }
        .student-filter-top {
          display: grid;
          gap: 10px;
        }
        .student-filter-search {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 14px;
          border: 1px solid rgba(99,91,255,.2);
          background: rgba(255,255,255,.96);
          padding: 11px 13px;
          box-shadow: 0 10px 20px rgba(99,91,255,.08);
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .student-filter-search:focus-within {
          border-color: rgba(99,91,255,.5);
          box-shadow: 0 0 0 4px rgba(99,91,255,.13);
        }
        .student-filter-search input {
          border: 0;
          background: transparent;
          width: 100%;
          outline: none;
          color: var(--t1, #0c0e18);
          font-size: 13px;
          font-weight: 600;
          font-family: 'Epilogue', system-ui, sans-serif;
        }
        .student-filter-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .student-filter-active {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 800;
          background: rgba(99,91,255,.12);
          color: var(--a1, #635bff);
        }
        .student-filter-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        .student-filter-card {
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,.09);
          background: rgba(255,255,255,.9);
          padding: 10px;
          display: grid;
          gap: 8px;
        }
        .student-filter-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .student-filter-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--t2, #5a6278);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          letter-spacing: .05em;
          text-transform: uppercase;
        }
        .student-filter-card small {
          font-size: 10px;
          color: #8c93a8;
          font-weight: 700;
        }
        .student-filter-select {
          border-radius: 10px;
          border: 1px solid rgba(99,91,255,.18);
          background: rgba(255,255,255,.95);
          color: var(--t1, #0c0e18);
          padding: 9px 10px;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Epilogue', system-ui, sans-serif;
          outline: none;
        }
        .student-filter-segment {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
        }
        .student-filter-chip {
          border: 1px solid rgba(0,0,0,.12);
          background: rgba(255,255,255,.92);
          color: var(--t2, #5a6278);
          border-radius: 10px;
          padding: 8px 6px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all .18s ease;
          text-align: center;
        }
        .student-filter-chip:hover {
          border-color: rgba(99,91,255,.45);
          color: var(--a1, #635bff);
          transform: translateY(-1px);
        }
        .student-filter-chip.active {
          border-color: transparent;
          color: #fff;
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
          box-shadow: 0 10px 24px rgba(99,91,255,.25);
        }
        .student-filter-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .student-filter-result {
          font-size: 11px;
          color: var(--t2, #5a6278);
          font-weight: 700;
        }
        .student-filter-reset {
          border: 1px solid rgba(0,0,0,.10);
          background: rgba(255,255,255,.95);
          color: var(--t1, #0c0e18);
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all .18s ease;
        }
        .student-filter-reset:hover:not(:disabled) {
          border-color: rgba(99,91,255,.35);
          color: var(--a1, #635bff);
        }
        .student-filter-reset:disabled {
          opacity: .45;
          cursor: not-allowed;
        }
        .student-list-title {
          margin: 0;
          font-family: 'Syne', system-ui, sans-serif;
          font-size: 18px;
          color: var(--t1, #0c0e18);
        }
        .student-list-subtitle {
          margin-top: 6px;
          color: var(--t2, #5a6278);
          font-size: 13px;
        }
        .student-list {
          padding: 10px;
          overflow: auto;
          max-height: calc(100vh - 190px);
        }
        .student-list-empty {
          padding: 26px 18px;
          text-align: center;
          color: var(--t2, #5a6278);
          font-size: 14px;
        }
        .student-item {
          width: 100%;
          text-align: left;
          border: 1px solid transparent;
          background: transparent;
          border-radius: 18px;
          padding: 14px;
          cursor: pointer;
          transition: all .22s ease;
          display: grid;
          gap: 10px;
          margin-bottom: 8px;
        }
        .student-item:hover {
          background: rgba(99,91,255,.05);
          border-color: rgba(99,91,255,.10);
        }
        .student-item:focus-visible {
          outline: 2px solid rgba(99,91,255,.55);
          outline-offset: 2px;
        }
        .student-item.active {
          background: linear-gradient(135deg, rgba(99,91,255,.12), rgba(6,201,160,.08));
          border-color: rgba(99,91,255,.18);
          box-shadow: 0 12px 28px rgba(99,91,255,.08);
        }
        .student-item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .student-item-name {
          margin: 0;
          font-weight: 800;
          font-size: 15px;
          color: var(--t1, #0c0e18);
          line-height: 1.3;
        }
        .student-item-meta {
          margin-top: 5px;
          color: var(--t2, #5a6278);
          font-size: 12px;
          line-height: 1.5;
          display: grid;
          gap: 2px;
        }
        .student-item-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .student-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          color: var(--t2, #5a6278);
          background: rgba(0,0,0,.04);
        }
        .student-chip.ready {
          background: rgba(6,201,160,.12);
          color: #0d7a5c;
        }
        .student-chip.missing {
          background: rgba(245,166,35,.12);
          color: #92400e;
        }
        .student-docs-panel {
          padding: 24px;
        }
        .student-summary {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          align-items: start;
          padding: 20px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(99,91,255,.08), rgba(6,201,160,.06));
          border: 1px solid rgba(99,91,255,.12);
          margin-bottom: 20px;
        }
        .student-summary-name {
          margin: 0;
          font-family: 'Syne', system-ui, sans-serif;
          font-size: 22px;
          color: var(--t1, #0c0e18);
        }
        .student-summary-text {
          margin-top: 6px;
          color: var(--t2, #5a6278);
          font-size: 14px;
          line-height: 1.55;
          display: grid;
          gap: 3px;
        }
        .student-summary-stats {
          display: grid;
          gap: 8px;
          min-width: 170px;
        }
        .student-summary-stat {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 14px;
          background: rgba(255,255,255,.65);
          border: 1px solid rgba(0,0,0,.06);
          font-size: 12px;
          color: var(--t2, #5a6278);
        }
        .student-summary-stat strong {
          color: var(--t1, #0c0e18);
          font-size: 13px;
        }
        .upload-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .upload-card {
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,.08);
          background: rgba(255,255,255,.84);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-height: 320px;
        }
        .upload-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .upload-card-title {
          margin: 0;
          font-family: 'Syne', system-ui, sans-serif;
          font-size: 18px;
          color: var(--t1, #0c0e18);
        }
        .upload-card-subtitle {
          margin-top: 4px;
          color: var(--t2, #5a6278);
          font-size: 12px;
        }
        .upload-preview {
          flex: 1;
          border-radius: 16px;
          border: 1.5px dashed rgba(99,91,255,.22);
          background:
            linear-gradient(180deg, rgba(99,91,255,.03), rgba(6,201,160,.03));
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 170px;
          overflow: hidden;
          position: relative;
        }
        .upload-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .upload-preview-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-align: center;
          color: var(--t2, #5a6278);
          padding: 24px;
        }
        .upload-preview-empty svg {
          color: var(--a1, #635bff);
        }
        .upload-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .upload-btn,
        .upload-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-family: 'Epilogue', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 800;
          transition: transform .18s ease, box-shadow .2s ease, background .2s ease;
        }
        .upload-btn {
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
          color: #fff;
          box-shadow: 0 12px 28px rgba(99,91,255,.22);
        }
        .upload-btn-secondary {
          background: rgba(255,255,255,.9);
          border: 1px solid rgba(0,0,0,.09);
          color: var(--t1, #0c0e18);
        }
        .upload-btn:hover:not(:disabled),
        .upload-btn-secondary:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .upload-btn:disabled,
        .upload-btn-secondary:disabled {
          opacity: .55;
          cursor: not-allowed;
          transform: none;
        }
        .upload-progress {
          height: 10px;
          border-radius: 999px;
          background: rgba(0,0,0,.06);
          overflow: hidden;
        }
        .upload-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--a1, #635bff), var(--a2, #06c9a0));
          border-radius: inherit;
          transition: width .18s ease;
        }
        .upload-progress-text {
          font-size: 12px;
          color: var(--t2, #5a6278);
        }
        .toast-stack {
          position: fixed;
          top: 18px;
          right: 18px;
          z-index: 300;
          display: grid;
          gap: 10px;
          width: min(360px, calc(100vw - 24px));
        }
        .toast {
          display: grid;
          grid-template-columns: 18px 1fr;
          gap: 12px;
          align-items: start;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,.08);
          box-shadow: 0 18px 50px rgba(0,0,0,.10);
          background: rgba(255,255,255,.94);
          backdrop-filter: blur(16px);
          animation: toastIn .2s ease;
        }
        .toast.success { border-color: rgba(6,201,160,.18); }
        .toast.error { border-color: rgba(220,38,38,.18); }
        .toast-icon {
          margin-top: 2px;
        }
        .toast-title {
          margin: 0;
          font-size: 13px;
          font-weight: 800;
          color: var(--t1, #0c0e18);
        }
        .toast-message {
          margin: 4px 0 0 0;
          font-size: 12px;
          line-height: 1.5;
          color: var(--t2, #5a6278);
        }
        .docs-empty {
          padding: 32px 20px;
          border-radius: 18px;
          border: 1px dashed rgba(99,91,255,.22);
          background: rgba(99,91,255,.03);
          color: var(--t2, #5a6278);
          text-align: center;
        }
        .student-mini {
          margin-top: 12px;
          display: grid;
          gap: 6px;
          font-size: 12px;
          color: var(--t2, #5a6278);
        }
        .student-mini strong {
          color: var(--t1, #0c0e18);
        }
        .spin {
          animation: spin .8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-8px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 1100px) {
          .student-docs-shell {
            grid-template-columns: 1fr;
          }
          .student-docs-head-right,
          .student-docs-quickstats {
            width: 100%;
            justify-items: start;
          }
          .student-list {
            max-height: 420px;
          }
        }
        @media (max-width: 760px) {
          .student-docs-main,
          .student-docs-panel {
            padding: 18px;
          }
          .student-filter-meta {
            flex-direction: column;
            align-items: flex-start;
          }
          .student-docs-quickstats {
            grid-template-columns: 1fr;
          }
          .student-summary,
          .upload-grid {
            grid-template-columns: 1fr;
          }
          .student-summary-stats {
            min-width: 0;
          }
          .upload-card {
            min-height: 0;
          }
        }
      `}</style>

      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' ? <Eye size={16} color="#06c9a0" /> : <AlertCircle size={16} color="#dc2626" />}
            </div>
            <div>
              <p className="toast-title">{toast.title}</p>
              <p className="toast-message">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="student-docs-shell">
        <aside className="student-docs-aside student-list-wrap">
          <div className="student-list-head">
            <div className="student-list-head-top">
              <div>
                <p className="student-docs-eyebrow"><Users size={13} /> Students</p>
                <h2 className="student-list-title">All students</h2>
              </div>
              <button
                type="button"
                className={`student-filter-toggle ${filtersOpen ? 'open' : ''}`}
                onClick={() => setFiltersOpen((current) => !current)}
                aria-expanded={filtersOpen}
                aria-label={filtersOpen ? 'Close filters' : 'Open filters'}
                title={filtersOpen ? 'Hide filters' : 'Show filters'}
              >
                <Filter size={14} className="student-filter-toggle-main" />
                <ChevronDown size={16} className="student-filter-toggle-arrow" />
              </button>
            </div>

            <div className={`student-filter-collapse ${filtersOpen ? 'open' : ''}`}>
              <div className="student-filter-collapse-inner">
                <div className="student-filter-block">
              <div className="student-filter-top">
                <div className="student-filter-search">
                  <Search size={14} color="#5a6278" />
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(event) => setLocalSearch(event.target.value)}
                    placeholder="Search by name, faculty, gender, year"
                    aria-label="Search students"
                  />
                </div>
                <div className="student-filter-meta">
                  <div className="student-filter-active">
                    <Filter size={12} /> {activeFilterCount} active filters
                  </div>
                  <div className="student-filter-result">
                    Showing {filteredStudents.length} of {localStudents.length}
                  </div>
                </div>
              </div>

              <div className="student-filter-grid">
                <div className="student-filter-card">
                  <div className="student-filter-card-head">
                    <span className="student-filter-label"><Filter size={12} /> Faculty</span>
                    <small>{facultyOptions.length} options</small>
                  </div>
                  <select
                    className="student-filter-select"
                    value={selectedFaculty}
                    onChange={(event) => setSelectedFaculty(event.target.value)}
                  >
                    <option value="all">All faculties</option>
                    {facultyOptions.map((faculty) => (
                      <option key={faculty} value={faculty}>{faculty}</option>
                    ))}
                  </select>
                </div>

                <div className="student-filter-card">
                  <div className="student-filter-card-head">
                    <span className="student-filter-label"><Filter size={12} /> Passport status</span>
                    <small>Document</small>
                  </div>
                  <div className="student-filter-segment" role="group" aria-label="Passport filter">
                    <button type="button" className={`student-filter-chip ${passportFilter === 'all' ? 'active' : ''}`} onClick={() => setPassportFilter('all')}>All</button>
                    <button type="button" className={`student-filter-chip ${passportFilter === 'has' ? 'active' : ''}`} onClick={() => setPassportFilter('has')}>Has</button>
                    <button type="button" className={`student-filter-chip ${passportFilter === 'missing' ? 'active' : ''}`} onClick={() => setPassportFilter('missing')}>Missing</button>
                  </div>
                </div>

                <div className="student-filter-card">
                  <div className="student-filter-card-head">
                    <span className="student-filter-label"><Filter size={12} /> Medicine status</span>
                    <small>Document</small>
                  </div>
                  <div className="student-filter-segment" role="group" aria-label="Medicine filter">
                    <button type="button" className={`student-filter-chip ${medicineFilter === 'all' ? 'active' : ''}`} onClick={() => setMedicineFilter('all')}>All</button>
                    <button type="button" className={`student-filter-chip ${medicineFilter === 'has' ? 'active' : ''}`} onClick={() => setMedicineFilter('has')}>Has</button>
                    <button type="button" className={`student-filter-chip ${medicineFilter === 'missing' ? 'active' : ''}`} onClick={() => setMedicineFilter('missing')}>Missing</button>
                  </div>
                </div>

              </div>

              <div className="student-filter-actions">
                <div className="student-filter-result">
                  Fine-tune students fast using smart filters
                </div>
                <button
                  type="button"
                  className="student-filter-reset"
                  onClick={clearLocalFilters}
                  disabled={activeFilterCount === 0}
                >
                  Clear filters ({activeFilterCount})
                </button>
              </div>
                </div>
              </div>
            </div>
          </div>

          <div className="student-list">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => {
                const studentId = getStudentId(student, index);
                const isSelected = studentId === getStudentId(selectedStudent);
                const passportUrl = getStudentImageValue(student, 'passport');
                const medicineUrl = getStudentImageValue(student, 'medicine');

                return (
                  <button
                    key={studentId}
                    type="button"
                    className={`student-item ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedStudentId(studentId)}
                  >
                    <div className="student-item-top">
                      <div>
                        <p className="student-item-name">
                          {student?.name || 'Unknown'} {student?.surname || ''} {student?.lastname || ''}
                        </p>
                        <div className="student-item-meta">
                          <span>Faculty: {student?.nameFaculty || student?.faculty?.name || 'Not specified'}</span>
                          <span>Gender: {student?.gender || 'Not specified'}</span>
                          <span>Year: {student?.year ?? 'Not specified'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="student-item-badges">
                      <span className={`student-chip ${passportUrl ? 'ready' : 'missing'}`}>
                        {passportUrl ? <Eye size={12} /> : <Upload size={12} />}
                        Passport {passportUrl ? 'ready' : 'missing'}
                      </span>
                      <span className={`student-chip ${medicineUrl ? 'ready' : 'missing'}`}>
                        {medicineUrl ? <FileImage size={12} /> : <Upload size={12} />}
                        Medicine {medicineUrl ? 'ready' : 'missing'}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="student-list-empty">
                No students match the current filters. Try clearing filters or changing search.
              </div>
            )}
          </div>
        </aside>

        <main className="student-docs-main">
          <div className="student-docs-head">
            <div>
              <p className="student-docs-eyebrow"><FileImage size={13} /> Document upload</p>
              <h1 className="student-docs-title">Student passport and medicine images</h1>
              <p className="student-docs-subtitle">
                Select a student from the list, then upload one image at a time. Validation is enforced before the request is sent.
              </p>
            </div>
            <div className="student-docs-head-right">
              <div className="student-docs-count">
                <Users size={14} /> {documentStats.total} total students
              </div>
              <div className="student-docs-quickstats" aria-label="Document completion summary">
                <div className="student-docs-quickstat">
                  <strong>{documentStats.withPassport}</strong>
                  <span>Passport uploaded</span>
                </div>
                <div className="student-docs-quickstat">
                  <strong>{documentStats.withMedicine}</strong>
                  <span>Medicine uploaded</span>
                </div>
                <div className="student-docs-quickstat">
                  <strong>{documentStats.complete}</strong>
                  <span>Fully complete</span>
                </div>
              </div>
            </div>
          </div>

          {selectedStudent ? (
            <>
              <section className="student-docs-panel" style={{ marginBottom: 18 }}>
                <div className="student-summary">
                  <div>
                    <p className="student-docs-eyebrow"><Users size={13} /> Selected student</p>
                    <h2 className="student-summary-name">
                      {selectedStudent?.name || 'Unknown'} {selectedStudent?.surname || ''} {selectedStudent?.lastname || ''}
                    </h2>
                    <div className="student-summary-text">
                      <span>Faculty: {selectedStudent?.nameFaculty || selectedStudent?.faculty?.name || 'Not specified'}</span>
                      <span>Gender: {selectedStudent?.gender || 'Not specified'}</span>
                      <span>Year: {selectedStudent?.year ?? 'Not specified'}</span>
                    </div>
                  </div>
                  <div className="student-summary-stats">
                    <div className="student-summary-stat">
                      <span>Passport</span>
                      <strong>{selectedPassportUrl ? 'Uploaded' : 'Missing'}</strong>
                    </div>
                    <div className="student-summary-stat">
                      <span>Medicine</span>
                      <strong>{selectedMedicineUrl ? 'Uploaded' : 'Missing'}</strong>
                    </div>
                  </div>
                </div>
              </section>

              <section className="upload-grid">
                <article className="upload-card">
                  <div className="upload-card-head">
                    <div>
                      <h3 className="upload-card-title">Passport photo</h3>
                      <p className="upload-card-subtitle">Upload a single passport image in JPEG, PNG, GIF, or WebP format.</p>
                    </div>
                    <div>
                      {selectedPassportUrl ? <Eye size={22} color="var(--a1, #635bff)" /> : <Upload size={22} color="var(--a1, #635bff)" />}
                    </div>
                  </div>

                  <div className="upload-preview">
                    {selectedPassportUrl ? (
                      <img src={selectedPassportUrl} alt="Passport preview" />
                    ) : (
                      <div className="upload-preview-empty">
                        <Upload size={38} strokeWidth={1.8} />
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--t1, #0c0e18)' }}>No passport image yet</div>
                          <div style={{ marginTop: 4, fontSize: 12 }}>Choose one image to upload</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="upload-actions">
                    <input
                      id="passport-image-input"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      style={{ display: 'none' }}
                      disabled={uploadState.passport.loading}
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        event.target.value = '';
                        if (file) handleUpload('passport', file);
                      }}
                    />
                    <label className="upload-btn" htmlFor="passport-image-input" style={{ pointerEvents: uploadState.passport.loading ? 'none' : 'auto' }}>
                      {uploadState.passport.loading ? <LoaderCircle size={16} className="spin" /> : selectedPassportUrl ? <Eye size={16} /> : <Upload size={16} />}
                      {uploadState.passport.loading ? 'Uploading...' : selectedPassportUrl ? 'Replace passport' : 'Upload passport'}
                    </label>
                    {selectedPassportUrl && (
                      <button type="button" className="upload-btn-secondary" onClick={() => openImage(selectedPassportUrl)} disabled={uploadState.passport.loading}>
                        <Eye size={16} /> View passport
                      </button>
                    )}
                  </div>

                  {uploadState.passport.loading && (
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div className="upload-progress">
                        <div className="upload-progress-fill" style={{ width: `${uploadState.passport.progress}%` }} />
                      </div>
                      <div className="upload-progress-text">Uploading passport image: {uploadState.passport.progress}%</div>
                    </div>
                  )}
                </article>

                <article className="upload-card">
                  <div className="upload-card-head">
                    <div>
                      <h3 className="upload-card-title">Medicine photo</h3>
                      <p className="upload-card-subtitle">Upload a single medicine image in JPEG, PNG, GIF, or WebP format.</p>
                    </div>
                    <div>
                      {selectedMedicineUrl ? <FileImage size={22} color="var(--a1, #635bff)" /> : <Upload size={22} color="var(--a1, #635bff)" />}
                    </div>
                  </div>

                  <div className="upload-preview">
                    {selectedMedicineUrl ? (
                      <img src={selectedMedicineUrl} alt="Medicine preview" />
                    ) : (
                      <div className="upload-preview-empty">
                        <FileImage size={38} strokeWidth={1.8} />
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--t1, #0c0e18)' }}>No medicine image yet</div>
                          <div style={{ marginTop: 4, fontSize: 12 }}>Choose one image to upload</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="upload-actions">
                    <input
                      id="medicine-image-input"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      style={{ display: 'none' }}
                      disabled={uploadState.medicine.loading}
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        event.target.value = '';
                        if (file) handleUpload('medicine', file);
                      }}
                    />
                    <label className="upload-btn" htmlFor="medicine-image-input" style={{ pointerEvents: uploadState.medicine.loading ? 'none' : 'auto' }}>
                      {uploadState.medicine.loading ? <LoaderCircle size={16} className="spin" /> : selectedMedicineUrl ? <FileImage size={16} /> : <Upload size={16} />}
                      {uploadState.medicine.loading ? 'Uploading...' : selectedMedicineUrl ? 'Replace medicine' : 'Upload medicine'}
                    </label>
                    {selectedMedicineUrl && (
                      <button type="button" className="upload-btn-secondary" onClick={() => openImage(selectedMedicineUrl)} disabled={uploadState.medicine.loading}>
                        <FileImage size={16} /> View medicine
                      </button>
                    )}
                  </div>

                  {uploadState.medicine.loading && (
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div className="upload-progress">
                        <div className="upload-progress-fill" style={{ width: `${uploadState.medicine.progress}%` }} />
                      </div>
                      <div className="upload-progress-text">Uploading medicine image: {uploadState.medicine.progress}%</div>
                    </div>
                  )}
                </article>
              </section>

              <section className="student-docs-panel" style={{ marginTop: 18 }}>
                <div className="student-docs-eyebrow"><AlertCircle size={13} /> Upload rules</div>
                <div className="student-mini">
                  <span><strong>Allowed types:</strong> image/jpeg, image/png, image/gif, image/webp</span>
                  <span><strong>Max size:</strong> 15MB</span>
                  <span><strong>Request field:</strong> image</span>
                  <span><strong>Method:</strong> PATCH</span>
                </div>
              </section>
            </>
          ) : (
            <div className="docs-empty">
              No student is selected. Add students in the API first, then return here to upload documents.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}