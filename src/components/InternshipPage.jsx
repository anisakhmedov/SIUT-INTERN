import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { del, get, patch, post } from "../utils/apiClient";
import * as attendanceApi from "../utils/attendanceApi";
import { toast } from "../utils/toast";
import { generateFinalReport } from "../utils/finalReportApi";
import { getAuthTokenFromStorage } from "../utils/storageUtils";
import PageState from "./PageState";
import { TextAlignEnd } from "lucide-react";
import AttendanceMobile from "./AttendanceMobile";

const INTERNSHIP_STATUS_OPTIONS = ["Pending", "In Progress", "Completed"];

const clampProgress = (value) =>
  Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

function hasReportContent(day) {
  if (!day?.shortReport) return false;

  const title =
    typeof day.shortReport.title === "string"
      ? day.shortReport.title.trim()
      : "";
  const description =
    typeof day.shortReport.description === "string"
      ? day.shortReport.description.trim()
      : "";
  const reportImages = Array.isArray(day.shortReport.images)
    ? day.shortReport.images
    : [];
  const dayImages = Array.isArray(day.images) ? day.images : [];

  return Boolean(
    title || description || reportImages.length || dayImages.length,
  );
}

function normalizeApprovalCode(value) {
  if (value === true) return 2;
  if (value === false) return 3;

  const numericValue = Number(value);
  if (numericValue === 2) return 2;
  if (numericValue === 3) return 3;

  const rawValue = String(value ?? "").trim().toLowerCase();
  if (rawValue === "approved") return 2;
  if (rawValue === "rejected" || rawValue === "declined" || rawValue === "not approved") {
    return 3;
  }

  return 1;
}

function isApprovedDay(day) {
  return normalizeApprovalCode(day?.approved) === 2;
}

function isRejectedDay(day) {
  return normalizeApprovalCode(day?.approved) === 3;
}

function normalizeFacultyDays(faculty) {
  if (!faculty) return faculty;

  return {
    ...faculty,
    days: Array.isArray(faculty.days)
      ? faculty.days.map((day) => ({
          ...day,
          approved: normalizeApprovalCode(day?.approved),
        }))
      : faculty.days,
  };
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isMissedDay(day) {
  const dayDate = String(day?.date || "").slice(0, 10);
  if (!dayDate) return false;

  return dayDate < getLocalDateKey();
}

function getDayReportStatus(day) {
  if (isApprovedDay(day)) return "approved";
  if (isRejectedDay(day)) return "rejected";

  const rejectionFlags = [
    day?.rejected,
    day?.isRejected,
    day?.reportRejected,
    day?.shortReport?.rejected,
    day?.shortReport?.isRejected,
  ];
  const rejectionStatusValues = [
    day?.status,
    day?.reportStatus,
    day?.reviewStatus,
    day?.shortReport?.status,
    day?.shortReport?.approvalStatus,
  ]
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);

  if (
    rejectionFlags.some(Boolean) ||
    rejectionStatusValues.some(
      (value) => value === "rejected" || value === "declined",
    )
  ) {
    return "rejected";
  }

  if (hasReportContent(day)) return "submitted";
  if (isMissedDay(day)) return "missed";
  return "empty";
}

function calculateProgressPercent(days) {
  const dayList = Array.isArray(days) ? days : [];
  if (dayList.length === 0) return 0;

  const reportedDays = dayList.filter((day) => hasReportContent(day)).length;
  return clampProgress(Math.round((reportedDays / dayList.length) * 100));
}

function parseProgressPercent(value) {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value.replace("%", "").trim())
        : NaN;

  return Number.isFinite(numericValue)
    ? clampProgress(Math.round(numericValue))
    : null;
}

function normalizeInternshipStatus(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase();
  if (raw === "completed") return "Completed";
  if (raw === "in progress" || raw === "active") return "In Progress";
  return "Pending";
}

function formatDurationFromDays(days) {
  const dayList = Array.isArray(days) ? days : [];
  const count = dayList.length;
  if (count === 0) return "";

  const dateValues = dayList
    .map((day) => String(day?.date || "").slice(0, 10))
    .filter(Boolean);
  const dayLabel = count === 1 ? "day" : "days";

  if (dateValues.length >= 2) {
    return `${count} ${dayLabel} (${dateValues[0]} to ${dateValues[dateValues.length - 1]})`;
  }

  return `${count} ${dayLabel}`;
}

function normalizeDurationValue(value) {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    const start = value.start || value.startDate || "";
    const end = value.end || value.endDate || "";
    return [start, end].filter(Boolean).join(" - ").trim();
  }

  return "";
}

function getInitialsFromLabel(value) {
  if (!value) return "U";
  const parts = String(value).split(" ").filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "U";
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInlineMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function renderSimpleMarkdown(text) {
  const source = String(text || "").trim();
  if (!source) return "<p>No plan provided.</p>";

  const lines = source.split(/\r?\n/);
  const chunks = [];
  let inList = false;

  lines.forEach((line) => {
    const escaped = escapeHtml(line.trim());
    if (!escaped) {
      if (inList) {
        chunks.push("</ul>");
        inList = false;
      }
      return;
    }

    if (escaped.startsWith("- ")) {
      if (!inList) {
        chunks.push("<ul>");
        inList = true;
      }
      chunks.push(`<li>${renderInlineMarkdown(escaped.slice(2))}</li>`);
      return;
    }

    if (inList) {
      chunks.push("</ul>");
      inList = false;
    }

    if (escaped.startsWith("## ")) {
      chunks.push(`<h3>${renderInlineMarkdown(escaped.slice(3))}</h3>`);
      return;
    }

    chunks.push(`<p>${renderInlineMarkdown(escaped)}</p>`);
  });

  if (inList) chunks.push("</ul>");

  return chunks.join("");
}

function CustomFilterSelect({
  id,
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  menuClassName = "",
  optionClassName = "",
  renderOptionContent,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  const selectedOption = useMemo(() => {
    if (!value) return null;
    return options.find((option) => option.value === value) || null;
  }, [options, value]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="ip-custom-select" ref={rootRef}>
      <button
        id={id}
        type="button"
        className={`ip-custom-trigger ${isOpen ? "ip-custom-trigger--open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="ip-custom-trigger-text">
          {selectedOption?.label || placeholder}
        </span>
        <span
          className={`ip-custom-chevron ${isOpen ? "ip-custom-chevron--open" : ""}`}
        ></span>
      </button>

      {isOpen && (
        <div
          className={`ip-custom-menu ${menuClassName}`.trim()}
          role="listbox"
          aria-labelledby={id}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`ip-custom-option ${optionClassName} ${isSelected ? "ip-custom-option--selected" : ""}`.trim()}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {renderOptionContent ? (
                  renderOptionContent(option, isSelected)
                ) : (
                  <span>{option.label}</span>
                )}
                {isSelected && <span className="ip-custom-option-mark">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function InternshipPage({
  facultyId,
  onBack,
  user,
  initialDayIndex,
  focusCommentKey,
  students = [],
}) {
  const REPORT_DESCRIPTION_MIN_WORDS = 100;

  const [faculty, setFaculty] = useState(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportDayDate, setReportDayDate] = useState("");
  const [reportImages, setReportImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isInternshipEditMode, setIsInternshipEditMode] = useState(false);
  const [baseInfoName, setBaseInfoName] = useState("");
  const [baseInfoCompany, setBaseInfoCompany] = useState("");
  const [baseInfoLocation, setBaseInfoLocation] = useState("");
  const [baseInfoDuration, setBaseInfoDuration] = useState("");
  const [baseInfoStatus, setBaseInfoStatus] = useState("");
  const [baseInfoProgressAll, setBaseInfoProgressAll] = useState("");
  const [baseInfoPlan, setBaseInfoPlan] = useState("");
  const [baseInfoStartDate, setBaseInfoStartDate] = useState("");
  const [baseInfoEndDate, setBaseInfoEndDate] = useState("");
  const [activeImageSrc, setActiveImageSrc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showFeedbackView, setShowFeedbackView] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // 0-100 for progress tracking
  const [isDragActive, setIsDragActive] = useState(false);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [newDayDate, setNewDayDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [showEditDayDateModal, setShowEditDayDateModal] = useState(false);
  const [editDayDate, setEditDayDate] = useState("");
  const [showDeleteDayModal, setShowDeleteDayModal] = useState(false);
  const [attendance, setAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  const [attendanceDraft, setAttendanceDraft] = useState(null);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [showAttendanceEditor, setShowAttendanceEditor] = useState(false);
  const [highlightedCommentKey, setHighlightedCommentKey] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [showStudents, setShowStudents] = useState(false);
  const [showStudentManager, setShowStudentManager] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedStudentFaculty, setSelectedStudentFaculty] = useState("all");
  const attendanceScrollRef = useRef(null);
  const isInternshipEditModeRef = useRef(false);
  const submittingRef = useRef(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth <= 760);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const [selectedStudentYear, setSelectedStudentYear] = useState("all");
  const [showPlan, setShowPlan] = useState(true);
  const [showFinalReportModal, setShowFinalReportModal] = useState(false);
  const [finalReportLoading, setFinalReportLoading] = useState(false);
  const [finalReportMarkdown, setFinalReportMarkdown] = useState("");
  const [finalReportError, setFinalReportError] = useState("");
  const [reportFormSnapshot, setReportFormSnapshot] = useState(null);
  const commentsSectionRef = useRef(null);
  const reportDescriptionRef = useRef(null);
  const planEditorRef = useRef(null);
  const dayCarouselRef = useRef(null);
  const dayItemRefs = useRef([]);

  useEffect(() => { isInternshipEditModeRef.current = isInternshipEditMode; }, [isInternshipEditMode]);
  useEffect(() => { submittingRef.current = submitting; }, [submitting]);

  const fetchFaculty = useCallback(
    async (opts = {}) => {
      try {
        if (!opts || typeof opts !== "object") opts = {};
        if (!opts.silent) setLoading(true);
        const data = await get(`/faculty/${facultyId}`);
        if (
              opts.skipIfEditing &&
              (isInternshipEditModeRef.current || submittingRef.current)
            ) {
          setError("");
          return data;
        }

        setFaculty(normalizeFacultyDays(data));
        setError("");
        return data;
      } catch (err) {
        setError(err.message);
        console.error("Error fetching faculty:", err);
        return null;
      } finally {
        if (!opts.silent) setLoading(false);
      }
    },
    [facultyId],
  );

  const fetchAttendance = useCallback(async () => { 
    if (!facultyId) return;
    setAttendanceLoading(true);
    setAttendanceError("");
    try {
      const data = await attendanceApi.getAttendance(facultyId);
      setAttendance(data || null);
      setAttendanceDraft(data ? JSON.parse(JSON.stringify(data)) : null);
    } catch (err) {
      setAttendanceError(err?.message || String(err));
    } finally {
      setAttendanceLoading(false);
    }
  }, [facultyId]);

  useEffect(() => {
    if (!faculty) return;
    fetchAttendance();
  }, [faculty, fetchAttendance]);

  const attendanceHasChanges = useMemo(() => {
    const original = JSON.stringify(attendance?.attendance || []);
    const draft = JSON.stringify(attendanceDraft?.attendance || []);
    return original !== draft;
  }, [attendance, attendanceDraft]);

  const handleTogglePresent = useCallback(
    (dayId, studentKey, present) => {
      const targetDayId = String(dayId || "").trim();
      const targetStudentKey = String(studentKey || "").trim();
      if (!targetDayId || !targetStudentKey) return;

      setAttendanceDraft((current) => {
        const source = Array.isArray(current?.attendance)
          ? current
          : attendance
            ? JSON.parse(JSON.stringify(attendance))
            : null;
        if (!source || !Array.isArray(source.attendance)) return current;

        return {
          ...source,
          attendance: source.attendance.map((day) => {
            const resolvedDayId = String(
              day?.id ?? day?._id ?? day?.dayNumber ?? "",
            ).trim();
            if (resolvedDayId !== targetDayId) return day;

            const students = Array.isArray(day.students) ? day.students : [];
            let matched = false;
            const nextStudents = students.map((student) => {
              const resolvedStudentKey = String(
                student?.studentKey ?? student?.studentId ?? student?.id ?? "",
              ).trim();
              if (resolvedStudentKey !== targetStudentKey) return student;
              matched = true;
              return {
                ...student,
                studentKey: student?.studentKey || targetStudentKey,
                present,
              };
            });

            if (!matched) {
              nextStudents.push({ studentKey: targetStudentKey, present });
            }

            return {
              ...day,
              students: nextStudents,
            };
          }),
        };
      });
    },
    [attendance],
  );

  const handleSaveAttendanceChanges = useCallback(async () => {
    if (!facultyId) return;
    const draftDays = Array.isArray(attendanceDraft?.attendance)
      ? attendanceDraft.attendance
      : [];
    if (draftDays.length === 0) return;

    const originalDays = Array.isArray(attendance?.attendance)
      ? attendance.attendance
      : [];

    const changedDays = draftDays.filter((draftDay) => {
      const dayId = String(draftDay?.id ?? draftDay?._id ?? "");
      const originalDay = originalDays.find(
        (od) => String(od?.id ?? od?._id ?? "") === dayId,
      );
      return (
        JSON.stringify(draftDay?.students ?? []) !==
        JSON.stringify(originalDay?.students ?? [])
      );
    });

    if (changedDays.length === 0) {
      toast.success("No changes to save.");
      return;
    }

    setAttendanceSaving(true);
    try {
      for (const day of changedDays) {
        const dayId = day?.id ?? day?._id;
        if (!dayId) {
          throw new Error("Attendance day could not be identified.");
        }

        const students = Array.isArray(day.students) ? day.students : [];
        const payload = {
          id: dayId,
          date: day?.date,
          dayNumber: day?.dayNumber,
          students: students.map((student) => ({
            studentKey: String(
              student?.studentKey ?? student?.studentId ?? student?.id ?? "",
            ).trim(),
            present: Boolean(student?.present),
          })),
        };

        await attendanceApi.updateAttendanceDay(facultyId, dayId, payload);
      }

      await fetchAttendance();
      toast.success("Attendance saved.");
    } catch (err) {
      toast.error(err?.message || "Failed to save attendance.");
    } finally {
      setAttendanceSaving(false);
    }
  }, [attendance, attendanceDraft, facultyId, fetchAttendance]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  // Tutors modal state and helpers
  const [showTutorsModal, setShowTutorsModal] = useState(false);
  const [modalAvailableTutors, setModalAvailableTutors] = useState([]);

  const openTutorsModal = useCallback(async () => {
    setShowTutorsModal(true);
    if (modalAvailableTutors && modalAvailableTutors.length > 0) return;
    try {
      const list = await get("/usersInternship");
      const filteredTutors = (Array.isArray(list) ? list : []).filter(
        (member) => {
          const role = String(member?.role || "")
            .trim()
            .toLowerCase();
          return role === "tutor" || role === "professor";
        },
      );
      setModalAvailableTutors(filteredTutors);
    } catch (err) {
      console.error("Failed to load tutors:", err);
      toast.error("Failed to load tutors list.");
    }
  }, [modalAvailableTutors]);

  const getFacultyTutorIds = useCallback(() => {
    const ids = new Set();
    if (Array.isArray(faculty?.tutorIDs)) {
      faculty.tutorIDs.forEach((v) => ids.add(String(v)));
    }
    if (Array.isArray(faculty?.tutors)) {
      faculty.tutors.forEach((t) => {
        const id = String(
          t?._id || t?.id || t?.userId || t?.login || t?.email || t?.name || "",
        );
        if (id) ids.add(id);
      });
    }
    // also consider single tutor fields
    if (faculty?.tutorID) ids.add(String(faculty.tutorID));
    if (faculty?.tutor && typeof faculty.tutor === "string")
      ids.add(String(faculty.tutor));
    return Array.from(ids).filter(Boolean);
  }, [faculty]);

  const normalizeRoleLocal = (r) =>
    String(r || "")
      .trim()
      .toLowerCase();

  const canManageTutors = useMemo(() => {
    const role = normalizeRoleLocal(user?.role);
    return role === "admin" || role === "developer";
  }, [user]);

  const setTutorAssignment = useCallback(
    async (tutorId, shouldAssign) => {
      if (!canManageTutors) {
        toast.warning("Only admins and developers can append tutors.");
        return;
      }
      if (!faculty) return;
      const idStr = String(tutorId || "");
      if (!idStr) return;

      const existing = getFacultyTutorIds();
      const alreadyAssigned = existing.includes(idStr);
      if (shouldAssign && alreadyAssigned) {
        return;
      }
      if (!shouldAssign && !alreadyAssigned) {
        return;
      }

      setSubmitting(true);
      try {
        const next = shouldAssign
          ? [...existing, idStr]
          : existing.filter((id) => id !== idStr);
        await patch(`/faculty/${facultyId}`, {
          tutorIDs: next,
          tutorID: next[0] || "",
        });
        await fetchFaculty({ silent: true });
        toast.success(
          shouldAssign
            ? "Tutor added to internship."
            : "Tutor removed from internship.",
        );
      } catch (err) {
        toast.error(err?.message || "Failed to update tutor assignment.");
      } finally {
        setSubmitting(false);
      }
    },
    [canManageTutors, faculty, fetchFaculty, facultyId, getFacultyTutorIds],
  );

  const removeTutorFromFaculty = useCallback(
    async (removeId) => {
      if (!faculty) return;
      const existing = getFacultyTutorIds();
      const idStr = String(removeId || "");
      if (!existing.includes(idStr)) {
        toast.warning("Tutor not found on this internship.");
        return;
      }
      const next = existing.filter((id) => id !== idStr);
      setSubmitting(true);
      try {
        await patch(`/faculty/${facultyId}`, {
          tutorIDs: next,
          tutorID: next[0] || "",
        });
        await fetchFaculty({ silent: true });
        toast.success("Tutor removed from internship.");
      } catch (err) {
        toast.error(err?.message || "Failed to remove tutor.");
      } finally {
        setSubmitting(false);
      }
    },
    [faculty, fetchFaculty, facultyId, getFacultyTutorIds],
  );

  const getDayId = useCallback((day) => {
    if (!day) return null;
    return day._id ?? day.id ?? null;
  }, []);

  const isTutorRoleLocal = useCallback((role) => {
    const normalizedRole = String(role || "")
      .trim()
      .toLowerCase();
    return normalizedRole === "tutor" || normalizedRole === "professor";
  }, []);

  const getOwnershipTokensLocal = useCallback((value) => {
    if (!value) return [];
    if (Array.isArray(value))
      return value.flatMap((v) => getOwnershipTokensLocal(v));
    if (typeof value === "object") {
      return [
        value._id,
        value.id,
        value.userId,
        value.login,
        value.username,
        value.email,
        value.name,
        value.surname,
        value.lastname,
        [value.name, value.surname, value.lastname].filter(Boolean).join(" "),
      ]
        .map((t) =>
          String(t || "")
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean);
    }
    return [String(value).trim().toLowerCase()].filter(Boolean);
  }, []);

  const canViewComments = useMemo(() => {
    const role = normalizeRoleLocal(user?.role);
    if (!faculty) return false;
    // Admins and others keep full access
    if (role === "admin" || role === "developer" || role === "rector")
      return true;
    // Tutors and professors only if assigned to this internship
    if (role === "tutor" || role === "professor") {
      const userTokens = getOwnershipTokensLocal([
        user?.id,
        user?._id,
        user?.userId,
        user?.login,
        user?.username,
        user?.email,
        user?.name,
        user?.surname,
        user?.lastname,
        [user?.name, user?.surname, user?.lastname].filter(Boolean).join(" "),
      ]);
      const internTokens = getOwnershipTokensLocal([
        faculty?.tutorIDs,
        faculty?.tutorID,
        faculty?.tutor,
        faculty?.supervisor,
        faculty?.tutors,
        faculty?.supervisors,
      ]);
      return internTokens.some((t) => userTokens.includes(t));
    }
    // Other roles (students) can view comments for the internship page
    return true;
  }, [user, faculty, getOwnershipTokensLocal]);

  const getCommentKey = useCallback((comment, index) => {
    if (!comment) return `idx-${index}`;
    return String(
      comment._id || `${comment.date || ""}-${comment.text || ""}-${index}`,
    );
  }, []);

  const getStudentId = useCallback((student) => {
    if (!student) return "";
    return String(student._id ?? student.id ?? student.studentId ?? "").trim();
  }, []);

  const getStudentName = useCallback((student) => {
    if (!student) return "Unnamed student";
    return (
      [student.name, student.surname, student.lastname]
        .filter(Boolean)
        .join(" ")
        .trim() || "Unnamed student"
    );
  }, []);

  const getStudentFacultyName = useCallback((student) => {
    if (!student) return "";
    if (typeof student.nameFaculty === "string" && student.nameFaculty.trim())
      return student.nameFaculty.trim();
    if (typeof student?.faculty === "object" && student.faculty) {
      return String(student.faculty.name || student.faculty.title || "").trim();
    }
    return "";
  }, []);

  const getStudentYear = useCallback((student) => {
    if (!student) return "";

    const rawYear =
      student.year ??
      student.faculty?.year ??
      student.facultyYear ??
      student.courseYear;
    if (rawYear == null || rawYear === "") return "";

    return String(rawYear).trim();
  }, []);

  const normalizeStudentRecord = useCallback(
    (student) => {
      if (!student) return null;

      if (typeof student === "string" || typeof student === "number") {
        const studentId = String(student).trim();
        return studentId ? { _id: studentId } : null;
      }

      const studentId = getStudentId(student);
      const normalized = {
        name: typeof student.name === "string" ? student.name : "",
        surname: typeof student.surname === "string" ? student.surname : "",
        lastname: typeof student.lastname === "string" ? student.lastname : "",
        nameFaculty: getStudentFacultyName(student),
        year: getStudentYear(student),
      };

      if (studentId) {
        normalized._id = studentId;
      } else if (typeof student.id === "string" && student.id.trim()) {
        normalized.id = student.id.trim();
      }

      return normalized;
    },
    [getStudentFacultyName, getStudentId, getStudentYear],
  );

  const extractImageUrls = useCallback((day) => {
    if (!day) return [];

    const sourceImages = Array.isArray(day.images)
      ? day.images
      : Array.isArray(day.shortReport?.images)
        ? day.shortReport.images
        : [];

    return sourceImages
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item.url === "string") return item.url;
        return null;
      })
      .filter(Boolean);
  }, []);

  const createReportFormSnapshot = useCallback(
    (day) => ({
      date: day?.date ? String(day.date).slice(0, 10) : "",
      title: day?.shortReport?.title || "",
      description: day?.shortReport?.description || "",
      imageUrls: extractImageUrls(day),
    }),
    [extractImageUrls],
  );

  const resetDayForm = useCallback(() => {
    setShowReportForm(false);
    setReportTitle("");
    setReportDescription("");
    setReportDayDate("");
    setReportImages([]);
    setImagePreviews([]);
    setUploadProgress(0);
  }, []);

  const initBaseInfoFields = useCallback((facultySnapshot) => {
    if (!facultySnapshot) return;
    const durationValue = facultySnapshot?.duration
      ? typeof facultySnapshot.duration === "string"
        ? facultySnapshot.duration
        : [facultySnapshot.duration?.start, facultySnapshot.duration?.end]
            .filter(Boolean)
            .join(" - ")
      : "";
    const syncedDurationValue = formatDurationFromDays(facultySnapshot?.days);

    setBaseInfoName(facultySnapshot.name || "");
    setBaseInfoCompany(facultySnapshot.company || "");
    setBaseInfoLocation(facultySnapshot.location || "");
    setBaseInfoDuration(syncedDurationValue || durationValue);
    setBaseInfoStatus(normalizeInternshipStatus(facultySnapshot.status));
    setBaseInfoProgressAll(
      facultySnapshot.progressAll != null
        ? String(facultySnapshot.progressAll)
        : "",
    );
    setBaseInfoPlan(facultySnapshot.plan || "");
    const daysList = Array.isArray(facultySnapshot?.days) ? facultySnapshot.days : [];
    setBaseInfoStartDate(daysList[0]?.date ? String(daysList[0].date).slice(0, 10) : "");
    setBaseInfoEndDate(daysList.length > 0 && daysList[daysList.length - 1]?.date ? String(daysList[daysList.length - 1].date).slice(0, 10) : "");
  }, []);

  const applyFormatting = useCallback(
    (textareaRef, setter, before, after = "", placeholder = "text") => {
      const el = textareaRef?.current;
      if (!el) return;

      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const value = el.value ?? "";
      const selected = value.slice(start, end);
      const insert = `${before}${selected || placeholder}${after}`;
      const nextValue = `${value.slice(0, start)}${insert}${value.slice(end)}`;

      setter(nextValue);

      requestAnimationFrame(() => {
        el.focus();
        if (selected) {
          el.setSelectionRange(
            start + before.length,
            start + before.length + selected.length,
          );
        } else {
          const cursorStart = start + before.length;
          el.setSelectionRange(cursorStart, cursorStart + placeholder.length);
        }
      });
    },
    [],
  );

  const days = useMemo(() => faculty?.days || [], [faculty]);
  const attendanceDays = useMemo(() => {
    if (Array.isArray(attendanceDraft?.attendance)) return attendanceDraft.attendance;
    if (Array.isArray(attendance?.attendance)) return attendance.attendance;
    return [];
  }, [attendanceDraft?.attendance, attendance?.attendance]);
  const attendanceTableWidth = 700;
  const attendanceNameColumnWidth = 260;
  const attendanceDayColumnWidth = 132;
  const attachedStudents = useMemo(() => {
    if (Array.isArray(faculty?.numberOfStudents))
      return faculty.numberOfStudents;
    if (Array.isArray(faculty?.students)) return faculty.students;
    return [];
  }, [faculty]);
  const attachedStudentIds = useMemo(() => {
    return new Set(
      attachedStudents.map((student) => getStudentId(student)).filter(Boolean),
    );
  }, [attachedStudents, getStudentId]);

  const mobileStudents = useMemo(() => {
    return (attachedStudents || []).map((stu, sidx) => {
      const sk =
        (typeof getStudentId === "function" ? getStudentId(stu) : null) ||
        `key-${sidx}`;
      const studentName =
        typeof getStudentName === "function"
          ? getStudentName(stu)
          : stu?.name || `${stu?.surname || ""}`;
      return { key: sk, name: studentName };
    });
  }, [attachedStudents, getStudentId, getStudentName]);
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

    if (value && typeof value === "object") {
      [value._id, value.id, value.login, value.username, value.email].forEach(
        pushValue,
      );
      return tokens;
    }

    pushValue(value);
    return tokens;
  }, []);

  const canManageStudents = useMemo(() => {
    const role = String(user?.role || "")
      .trim()
      .toLowerCase();
    if (role === "admin") return true;
    if (role !== "tutor") return false;

    const currentUserTokens = getOwnershipTokens([
      user?._id,
      user?.id,
      user?.login,
      user?.username,
      user?.email,
    ]);
    if (currentUserTokens.size === 0) return false;

    const facultyTutorTokens = getOwnershipTokens([
      faculty?.tutorIDs,
      faculty?.tutorID,
      faculty?.tutor,
      faculty?.supervisor,
      faculty?.tutors,
      faculty?.supervisors,
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
    setStudentSearchTerm("");
    setSelectedStudentIds([]);
    setSelectedStudentFaculty("all");
    setSelectedStudentYear("all");
    setShowStudentManager(true);
  }, []);
  const studentDirectory = useMemo(() => {
    const term = studentSearchTerm.trim().toLowerCase();
    const sourceStudents = Array.isArray(students) ? students : [];
    const selectedFacultyValue = String(selectedStudentFaculty || "all")
      .trim()
      .toLowerCase();
    const selectedYearValue = String(selectedStudentYear || "all")
      .trim()
      .toLowerCase();

    return sourceStudents
      .filter((student) => {
        if (!term) return true;

        const searchable = [
          getStudentId(student),
          getStudentName(student),
          getStudentFacultyName(student),
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(term);
      })
      .filter((student) => {
        if (selectedFacultyValue === "all") return true;
        return (
          String(getStudentFacultyName(student)).trim().toLowerCase() ===
          selectedFacultyValue
        );
      })
      .filter((student) => {
        if (selectedYearValue === "all") return true;
        return (
          String(getStudentYear(student)).trim().toLowerCase() ===
          selectedYearValue
        );
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
        const facultyA = String(a.studentFacultyName || "")
          .trim()
          .toLowerCase();
        const facultyB = String(b.studentFacultyName || "")
          .trim()
          .toLowerCase();
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
  }, [
    attachedStudentIds,
    getStudentFacultyName,
    getStudentId,
    getStudentName,
    getStudentYear,
    selectedStudentFaculty,
    selectedStudentYear,
    studentSearchTerm,
    students,
  ]);
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
      if (Number.isFinite(yearA) && Number.isFinite(yearB) && yearA !== yearB)
        return yearA - yearB;
      return a.localeCompare(b);
    });
  }, [getStudentYear, students]);
  const facultyFilterOptions = useMemo(
    () => [
      { value: "all", label: "All faculties" },
      ...availableStudentFaculties.map((facultyName) => ({
        value: facultyName,
        label: facultyName,
      })),
    ],
    [availableStudentFaculties],
  );
  const yearFilterOptions = useMemo(
    () => [
      { value: "all", label: "All years" },
      ...availableStudentYears.map((year) => ({ value: year, label: year })),
    ],
    [availableStudentYears],
  );
  const reportedDaysCount = useMemo(
    () => days.filter((day) => hasReportContent(day)).length,
    [days],
  );
  const progressPercent = useMemo(() => calculateProgressPercent(days), [days]);
  const computedProgressLabel = useMemo(
    () => `${progressPercent}%`,
    [progressPercent],
  );
  const progressHue = useMemo(
    () => Math.round((progressPercent / 100) * 120),
    [progressPercent],
  );
  const currentDay = days[dayIndex];
  const currentDayApprovalCode = useMemo(
    () => normalizeApprovalCode(currentDay?.approved),
    [currentDay],
  );
  const currentDayImageUrls = useMemo(
    () => extractImageUrls(currentDay),
    [extractImageUrls, currentDay],
  );
  const reportDescriptionWordCount = useMemo(() => {
    const words = reportDescription.trim().match(/\S+/g);
    return words ? words.length : 0;
  }, [reportDescription]);
  const isReportDescriptionLongEnough =
    reportDescriptionWordCount >= REPORT_DESCRIPTION_MIN_WORDS;
  const reportFormDirty = useMemo(() => {
    if (!showReportForm || !reportFormSnapshot) return false;

    return (
      reportDayDate !== reportFormSnapshot.date ||
      reportTitle !== reportFormSnapshot.title ||
      reportDescription !== reportFormSnapshot.description ||
      reportImages.length > 0
    );
  }, [
    reportDayDate,
    reportDescription,
    reportFormSnapshot,
    reportImages.length,
    reportTitle,
    showReportForm,
  ]);
  const tutorInfo = useMemo(() => {
    const sources = [
      faculty?.tutorIDs,
      faculty?.tutorID,
      faculty?.tutor,
      faculty?.tutors,
    ];

    const items = [];
    const addItem = (value) => {
      if (!value) return;
      if (Array.isArray(value)) {
        value.forEach(addItem);
        return;
      }

      const isObject = typeof value === "object";
      if (isObject && !isTutorRoleLocal(value?.role)) {
        return;
      }
      const name = isObject
        ? [value?.name, value?.surname, value?.lastname]
            .filter(Boolean)
            .join(" ")
            .trim()
        : String(value).trim();
      const contact = isObject
        ? value?.phone || value?.email || value?.login || ""
        : "";
      const key = String(
        isObject
          ? value?._id || value?.id || value?.userId || name || contact
          : value,
      ).trim();

      if (!key) return;
      items.push({
        key,
        name: name || `Tutor ${items.length + 1}`,
        contact,
        initials: getInitialsFromLabel(name || key),
      });
    };

    sources.forEach(addItem);

    const uniqueItems = Array.from(
      new Map(items.map((item) => [item.key, item])).values(),
    );

    const primaryTutor = uniqueItems[0] || null;
    const tutorNames = uniqueItems.map((item) => item.name).filter(Boolean);

    return {
      primaryTutor,
      tutors: uniqueItems,
      name: tutorNames.join(", "),
      contact:
        primaryTutor?.contact ||
        faculty?.tutorContact ||
        faculty?.supervisorContact ||
        "",
      initials:
        primaryTutor?.initials || getInitialsFromLabel(tutorNames[0] || ""),
      hasInfo: uniqueItems.length > 0,
      count: uniqueItems.length,
    };
  }, [faculty, isTutorRoleLocal]);

  const internshipMapData = useMemo(() => {
    if (!faculty) return null;

    const coordsRaw = faculty?.locationYmaps;
    const coords = Array.isArray(coordsRaw)
      ? coordsRaw
      : Array.isArray(coordsRaw?.coords)
        ? coordsRaw.coords
        : null;

    if (Array.isArray(coords) && coords.length === 2) {
      const lat = Number(coords[0]);
      const lng = Number(coords[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return {
          label:
            faculty?.location?.trim() ||
            faculty?.company?.trim() ||
            "Internship location",
          embedUrl: `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`,
          linkUrl: `https://www.google.com/maps?q=${lat},${lng}`,
        };
      }
    }

    const locationText = String(faculty?.location || "").trim();
    if (!locationText) return null;

    return {
      label: locationText,
      embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(locationText)}&z=15&output=embed`,
      linkUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`,
    };
  }, [faculty]);

  // Check if current tutor is assigned to this faculty
  const isAssignedTutor = useMemo(() => {
    if (!faculty) return false;
    const role = String(user?.role || "")
      .trim()
      .toLowerCase();
    if (role !== "tutor" && role !== "professor") return false;

    const userTokens = getOwnershipTokensLocal([
      user?.id,
      user?._id,
      user?.userId,
      user?.login,
      user?.username,
      user?.email,
      user?.name,
      user?.surname,
      user?.lastname,
      [user?.name, user?.surname, user?.lastname].filter(Boolean).join(" "),
    ]);

    const facultyTutorTokens = getOwnershipTokensLocal([
      faculty?.tutorIDs,
      faculty?.tutorID,
      faculty?.tutor,
      faculty?.supervisor,
      faculty?.tutors,
      faculty?.supervisors,
    ]);

    return facultyTutorTokens.some((token) => userTokens.includes(token));
  }, [user, faculty, getOwnershipTokensLocal]);

  const canWriteReport = user?.role === "Admin" || isAssignedTutor; // Only Admin or assigned Tutor can write reports
  const canWriteComments = useMemo(() => {
    const role = normalizeRoleLocal(user?.role);
    if (!canViewComments) return false;
    // Explicitly disallow tutors from writing comments
    if (role === "tutor") return false;
    return true;
  }, [canViewComments, user]);
  const canEditInternship = user?.role === "Admin" || isAssignedTutor;
  const canApprove = user?.role === "Admin";
  const canExport = user?.role === "Admin";

  const confirmDiscardReportChanges = useCallback(() => {
    if (!reportFormDirty) return true;
    return window.confirm("You have unsaved report changes. Discard them?");
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

  const attemptDayChange = useCallback(
    (nextIndex) => {
      const boundedNext = Math.max(0, Math.min(days.length - 1, nextIndex));
      if (boundedNext === dayIndex) return;

      if (showReportForm) {
        if (!confirmDiscardReportChanges()) return;
        setReportFormSnapshot(null);
        resetDayForm();
      }

      setDayIndex(boundedNext);
    },
    [
      confirmDiscardReportChanges,
      dayIndex,
      days.length,
      resetDayForm,
      showReportForm,
    ],
  );

  const handleFinalReport = useCallback(async () => {
    if (!faculty) {
      toast.error("Internship data is not ready yet. Please try again.");
      return;
    }

    const normalizeImageUrls = (rawImages) => {
      if (!Array.isArray(rawImages)) return [];
      return rawImages
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item.url === "string") return item.url;
          return null;
        })
        .filter(Boolean);
    };

    const reportDays = days.slice(0, 30).map((day, index) => {
      const shortReportImages = normalizeImageUrls(day?.shortReport?.images);
      const dayImages = normalizeImageUrls(day?.images);
      const photoUrls = Array.from(
        new Set([...shortReportImages, ...dayImages]),
      );

      const comments = Array.isArray(day?.comments)
        ? day.comments.map((comment) => ({
            text:
              typeof comment?.text === "string"
                ? comment.text
                : String(comment || ""),
            date: comment?.date || null,
            userID:
              typeof comment?.userID === "object"
                ? comment.userID?._id || comment.userID?.id || null
                : comment?.userID || null,
          }))
        : [];

      return {
        dayNumber: day?.dayNumber || index + 1,
        date: day?.date || null,
        approved: normalizeApprovalCode(day?.approved),
        shortReport: {
          title:
            typeof day?.shortReport?.title === "string"
              ? day.shortReport.title
              : "",
          description:
            typeof day?.shortReport?.description === "string"
              ? day.shortReport.description
              : "",
        },
        comments,
        photoUrls,
      };
    });

    const payload = {
      internship: {
        id: faculty?._id || faculty?.id || facultyId,
        name: faculty?.name || "",
        company: faculty?.company || "",
        location: faculty?.location || "",
        status: faculty?.status || "",
        duration: faculty?.duration || null,
        plan: faculty?.plan || "",
        progressAll: faculty?.progressAll || "",
        students: attachedStudents.map((student) => ({
          id: student?._id || student?.id || student?.studentId || null,
          name: [student?.name, student?.surname, student?.lastname]
            .filter(Boolean)
            .join(" ")
            .trim(),
          faculty: student?.nameFaculty || null,
        })),
      },
      days: reportDays,
      reportType: "final-30-day-report",
    };

    setFinalReportLoading(true);
    setFinalReportError("");
    setFinalReportMarkdown("");
    setShowFinalReportModal(true);

    try {
      const token = getAuthTokenFromStorage();
      const response = await generateFinalReport(payload, token);

      setFinalReportMarkdown(response.report);
      toast.success("Final report generated successfully.");
    } catch (error) {
      const message = error?.message || "Failed to generate AI final report.";
      setFinalReportError(message);
      toast.error(message);
    } finally {
      setFinalReportLoading(false);
    }
  }, [attachedStudents, days, faculty, facultyId]);

  const updateStudentAssignments = useCallback(
    async (nextStudents, successMessage) => {
      if (!faculty) return false;
      if (!canManageStudents) {
        toast.error(
          "You do not have permission to manage students for this internship.",
        );
        return false;
      }

      const normalizedStudents = [];
      const seenStudentKeys = new Set();

      (Array.isArray(nextStudents) ? nextStudents : []).forEach((student) => {
        const normalizedStudent = normalizeStudentRecord(student);
        if (!normalizedStudent) return;

        const studentKey =
          normalizedStudent._id ||
          normalizedStudent.id ||
          [
            normalizedStudent.name,
            normalizedStudent.surname,
            normalizedStudent.lastname,
          ]
            .filter(Boolean)
            .join("|");
        if (!studentKey || seenStudentKeys.has(studentKey)) return;

        seenStudentKeys.add(studentKey);
        normalizedStudents.push(normalizedStudent);
      });

      setSubmitting(true);
      try {
        await patch(`/faculty/${facultyId}`, {
          numberOfStudents: normalizedStudents,
        });
        await fetchFaculty({ silent: true });
        toast.success(successMessage);
        return true;
      } catch (err) {
        toast.error(err.message || "Something went wrong.");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [
      canManageStudents,
      faculty,
      facultyId,
      fetchFaculty,
      normalizeStudentRecord,
    ],
  );

  const handleDetachStudent = useCallback(
    async (student) => {
      const studentId = getStudentId(student);
      if (!studentId) {
        toast.error("Student could not be identified.");
        return;
      }

      const nextStudents = attachedStudents.filter(
        (item) => getStudentId(item) !== studentId,
      );
      await updateStudentAssignments(
        nextStudents,
        "Student detached from the internship.",
      );
    },
    [attachedStudents, getStudentId, updateStudentAssignments],
  );

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
      toast.warning("Select at least one student first.");
      return;
    }

    const selectedLookup = new Set(selectedStudentIds);
    const studentsToAttach = studentDirectory
      .filter(
        ({ studentId, isAttached }) =>
          studentId && selectedLookup.has(studentId) && !isAttached,
      )
      .map(({ student }) => student);

    if (studentsToAttach.length === 0) {
      toast.warning(
        "Selected students are already attached or could not be found.",
      );
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
  }, [
    attachedStudents,
    selectedStudentIds,
    studentDirectory,
    updateStudentAssignments,
  ]);

  const syncFacultyProgress = useCallback(
    async (facultySnapshot) => {
      if (!facultySnapshot) return;

      const expectedPercent = calculateProgressPercent(
        facultySnapshot.days || [],
      );
      const currentPercent = parseProgressPercent(facultySnapshot.progressAll);
      const expectedLabel = `${expectedPercent}%`;

      if (currentPercent === expectedPercent) {
        if (
          String(facultySnapshot.progressAll || "").trim() !== expectedLabel
        ) {
          setFaculty((prev) =>
            prev ? { ...prev, progressAll: expectedLabel } : prev,
          );
        }
        return;
      }

      try {
        const normalizedFacultySnapshot = normalizeFacultyDays(facultySnapshot);
        await patch(`/faculty/${facultyId}`, {
          ...normalizedFacultySnapshot,
          progressAll: expectedLabel,
        });
        setFaculty((prev) =>
          prev ? { ...prev, progressAll: expectedLabel } : prev,
        );
      } catch (err) {
        console.error("Failed to sync internship progress:", err);
      }
    },
    [facultyId],
  );

  const syncFacultyDuration = useCallback(
    async (facultySnapshot) => {
      if (!facultySnapshot) return facultySnapshot;

      const expectedDuration = formatDurationFromDays(facultySnapshot.days);
      if (!expectedDuration) return facultySnapshot;

      if (!isInternshipEditMode) {
        setBaseInfoDuration(expectedDuration);
      }

      setFaculty((prev) =>
        prev && normalizeDurationValue(prev.duration) !== expectedDuration
          ? { ...prev, duration: expectedDuration }
          : prev,
      );

      return { ...facultySnapshot, duration: expectedDuration };
    },
    [isInternshipEditMode],
  );

  useEffect(() => {
    if (!faculty || isInternshipEditMode) return;
    initBaseInfoFields(faculty);
    syncFacultyDuration(faculty);
  }, [faculty, isInternshipEditMode, initBaseInfoFields, syncFacultyDuration]);

  const updateDay = useCallback(
    async (day, payload, index = null) => {
      const dayId = getDayId(day) ?? (index != null ? String(index) : null);
      if (dayId == null) {
        toast.error("Day could not be identified. Try refreshing.");
        return;
      }
      setSubmitting(true);
      try {
        await patch(`/faculty/${facultyId}/days/${dayId}`, payload);
        const refreshedFaculty = await fetchFaculty({ silent: true });
        await syncFacultyDuration(refreshedFaculty);
        await attendanceApi.syncAttendance(facultyId);
        toast.success("Saved.");
      } catch (err) {
        toast.error(err.message || "Something went wrong.");
      } finally {
        setSubmitting(false);
      }
    },
    [facultyId, fetchFaculty, getDayId, syncFacultyDuration],
  );

  const handleBaseInfoSubmit = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault();
      if (!faculty) return;

      setSubmitting(true);

      try {
        const nextName = baseInfoName.trim();
        const nextCompany = baseInfoCompany.trim();
        const nextLocation = baseInfoLocation.trim();
        const nextDuration =
          formatDurationFromDays(faculty?.days) || baseInfoDuration.trim();
        const nextStatus = normalizeInternshipStatus(baseInfoStatus);
        const nextProgressAll = baseInfoProgressAll.trim();
        const nextPlan = baseInfoPlan.trim();

        if (!nextName) throw new Error("Internship name is required.");
        if (!nextCompany) throw new Error("Company is required.");
        if (!nextLocation) throw new Error("Location is required.");

        // Create new days for dates in [start, end] that don't already exist; leave existing days untouched
        if (baseInfoStartDate && baseInfoEndDate) {
          const daysList = Array.isArray(faculty.days) ? faculty.days : [];
          const existingDates = new Set(
            daysList.map((d) => String(d.date || "").slice(0, 10)).filter(Boolean),
          );

          const rangeStart = new Date(baseInfoStartDate + "T00:00:00Z");
          const rangeEnd = new Date(baseInfoEndDate + "T00:00:00Z");

          const datesToCreate = [];
          const cur = new Date(rangeStart);
          while (cur <= rangeEnd) {
            const dateStr = cur.toISOString().slice(0, 10);
            if (!existingDates.has(dateStr)) datesToCreate.push(dateStr);
            cur.setUTCDate(cur.getUTCDate() + 1);
          }

          if (datesToCreate.length > 0) {
            for (let i = 0; i < datesToCreate.length; i++) {
              await post(`/faculty/${facultyId}/days`, {
                dayNumber: String(daysList.length + i + 1),
                date: datesToCreate[i],
                approved: 1,
                shortReport: null,
                comments: [],
              });
            }
          }
        }

        const { days: _days, ...facultyMeta } = normalizeFacultyDays(faculty);
        const payload = {
          ...facultyMeta,
          name: nextName,
          company: nextCompany,
          location: nextLocation,
          duration: nextDuration || faculty.duration,
          status: nextStatus,
          progressAll: nextProgressAll,
          plan: nextPlan,
          locationYmaps:
            nextLocation === (faculty.location || "")
              ? faculty.locationYmaps
              : null,
        };

        await patch(`/faculty/${facultyId}`, payload);
        const refreshedFaculty = await fetchFaculty({ silent: true });
        await syncFacultyProgress(refreshedFaculty);
        await syncFacultyDuration(refreshedFaculty);
        await attendanceApi.syncAttendance(facultyId);
        toast.success("Internship information saved.");
        setIsInternshipEditMode(false);
      } catch (err) {
        toast.error(err.message || "Something went wrong.");
      } finally {
        setSubmitting(false);
      }
    },
    [
      faculty,
      facultyId,
      baseInfoName,
      baseInfoCompany,
      baseInfoLocation,
      baseInfoDuration,
      baseInfoStartDate,
      baseInfoEndDate,
      baseInfoStatus,
      baseInfoProgressAll,
      baseInfoPlan,
      fetchFaculty,
      syncFacultyProgress,
      syncFacultyDuration,
    ],
  );

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
      setReportTitle(currentDay.shortReport.title || "");
      setReportDescription(currentDay.shortReport.description || "");
    } else {
      setReportTitle("");
      setReportDescription("");
    }
    setReportImages([]);
    setImagePreviews([]);
    setReportFormSnapshot(snapshot);
    setShowReportForm(true);
  }, [createReportFormSnapshot, currentDay]);

  // Safe click handler to prevent default navigation or form submit
  const handleWriteReportOpenClick = useCallback((e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();
    handleWriteReportOpen();
  }, [handleWriteReportOpen]);

  const handleReportSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!currentDay) return;

      if (!isReportDescriptionLongEnough) {
        toast.error(
          `Description must be at least ${REPORT_DESCRIPTION_MIN_WORDS} words.`,
        );
        return;
      }

      setSubmitting(true);
      setUploadProgress(0);

      try {
        const dayId = getDayId(currentDay);
        if (!dayId)
          throw new Error("Day could not be identified. Try refreshing.");

        const existingImageUrls = extractImageUrls(currentDay);

        const extractShortReportImageUrls = (day) => {
          const shortReportImages = Array.isArray(day?.shortReport?.images)
            ? day.shortReport.images
            : [];
          return shortReportImages
            .map((item) => {
              if (typeof item === "string") return item;
              if (item && typeof item.url === "string") return item.url;
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
            imageFormData.append("images", file);
          });

          // Backward compatibility: also send first file under "image"
          imageFormData.append("image", reportImages[0]);

          const uploadedData = await post(
            `/faculty/${facultyId}/days/${dayId}/images`,
            imageFormData,
          );
          const responseUrls = [];

          if (Array.isArray(uploadedData?.images)) {
            uploadedData.images.forEach((item) => {
              if (typeof item === "string") responseUrls.push(item);
              else if (item?.url) responseUrls.push(item.url);
            });
          }

          if (uploadedData?.image?.url)
            responseUrls.push(uploadedData.image.url);

          uploadedUrls = Array.from(new Set(responseUrls.filter(Boolean)));
          if (uploadedUrls.length === 0) {
            throw new Error(
              "Upload succeeded but image URL is missing in response.",
            );
          }
          setUploadProgress(100);

          // Step 2: Immediate verification via GET /faculty/:id
          const verifyAfterUploadFaculty = await get(`/faculty/${facultyId}`);
          const verifyDay = (verifyAfterUploadFaculty?.days || []).find(
            (d) => (d?._id ?? d?.id ?? null) === dayId,
          );
          if (!verifyDay)
            throw new Error(
              "Uploaded image verification failed: day not found.",
            );

          const shortReportUrlsAfterUpload =
            extractShortReportImageUrls(verifyDay);
          const hasUploadedUrlsInShortReport = uploadedUrls.every((url) =>
            shortReportUrlsAfterUpload.includes(url),
          );
          if (!hasUploadedUrlsInShortReport) {
            throw new Error(
              "Uploaded image URL was not found in shortReport.images after upload.",
            );
          }
        }

        const finalImageUrls =
          uploadedUrls.length > 0
            ? Array.from(new Set([...existingImageUrls, ...uploadedUrls]))
            : existingImageUrls;

        // Step 2: Create/update report with image URLs

        const normalizedTitle = reportTitle.trim();
        const normalizedDescription = reportDescription.trim();
        const normalizedDayDate = reportDayDate || currentDay.date || "";

        const reportPayload = {
          ...currentDay,
          dayNumber: currentDay.dayNumber,
          date: normalizedDayDate,
          approved: 1,
          images: finalImageUrls,
        };

        const shouldPersistReport = Boolean(
          currentDay?.shortReport ||
          normalizedTitle ||
          normalizedDescription ||
          finalImageUrls.length > 0,
        );
        if (shouldPersistReport) {
          reportPayload.shortReport = {
            title: normalizedTitle || currentDay.shortReport?.title || "Report",
            description:
              normalizedDescription ||
              currentDay.shortReport?.description ||
              "",
            images: finalImageUrls,
            date: currentDay.shortReport?.date || new Date().toISOString(),
          };
        }

        await patch(`/faculty/${facultyId}/days/${dayId}`, reportPayload);
        // Step 3: Update local state optimistically to avoid full refresh
        // If uploadedUrls were present, we already verified them after upload.
        // Apply the patched day to local `faculty.days` to keep UI stable.
        try {
          const updatedFaculty = faculty
            ? {
                ...faculty,
                days: Array.isArray(faculty.days)
                  ? faculty.days.map((d) => {
                      const existingId = d?._id ?? d?.id ?? null;
                      if (existingId === dayId) return { ...d, ...reportPayload };
                      return d;
                    })
                  : [reportPayload],
              }
            : null;

          if (updatedFaculty) {
            setFaculty(updatedFaculty);
            // Sync progress field if needed (may patch progressAll on server)
            await syncFacultyProgress(updatedFaculty);
          }

          toast.success(`Day saved with ${finalImageUrls.length} image(s).`);
          setReportFormSnapshot(null);
          resetDayForm();
        } catch (stateErr) {
          // Fallback: still succeed but log the issue
          console.error("Failed to update local faculty state:", stateErr);
          toast.success(`Day saved with ${finalImageUrls.length} image(s).`);
          setReportFormSnapshot(null);
          resetDayForm();
        }
      } catch (err) {
        toast.error(err.message || "Something went wrong.");
      } finally {
        setSubmitting(false);
        setUploadProgress(0);
      }
    },
    [
      currentDay,
      reportTitle,
      reportDescription,
      reportDayDate,
      reportImages,
      facultyId,
      faculty,
      getDayId,
      extractImageUrls,
      resetDayForm,
      syncFacultyProgress,
      isReportDescriptionLongEnough,
    ],
  );

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    const newValidImages = files.filter((file) => {
      if (!validImageTypes.includes(file.type)) {
        toast.warning(
          `${file.name} is not a valid image file. Only JPEG, PNG, WebP and GIF are allowed.`,
        );
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.warning(`${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    setReportImages((prev) => [...prev, ...newValidImages]);

    // Create previews for the new images
    newValidImages.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews((prev) => [
          ...prev,
          { id: file.lastModified, src: reader.result, name: file.name },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId) => {
    setReportImages((prev) =>
      prev.filter((img) => img.lastModified !== imageId),
    );
    setImagePreviews((prev) => prev.filter((img) => img.id !== imageId));
  };

  const processDroppedFiles = (files) => {
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const newValidImages = files.filter((file) => {
      if (!validImageTypes.includes(file.type)) {
        toast.warning(
          `${file.name} is not a valid image file. Only JPEG, PNG, WebP and GIF are allowed.`,
        );
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.warning(`${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });
    setReportImages((prev) => [...prev, ...newValidImages]);
    newValidImages.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews((prev) => [
          ...prev,
          { id: file.lastModified, src: reader.result, name: file.name },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processDroppedFiles(files);
    }
  };

  const handleApprove = useCallback(async () => {
    if (!currentDay) return;
    const dayId = getDayId(currentDay) ?? (dayIndex != null ? String(dayIndex) : null);
    if (!dayId) { toast.error("Day could not be identified."); return; }
    setSubmitting(true);
    try {
      await patch(`/faculty/${facultyId}/days/${dayId}/approve`, { approved: 2 });
      const refreshed = await fetchFaculty({ silent: true });
      await syncFacultyDuration(refreshed);
      toast.success("Saved.");
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }, [currentDay, dayIndex, facultyId, fetchFaculty, getDayId, syncFacultyDuration]);

  const handleUnapprove = useCallback(async () => {
    if (!currentDay) return;
    const dayId = getDayId(currentDay) ?? (dayIndex != null ? String(dayIndex) : null);
    if (!dayId) { toast.error("Day could not be identified."); return; }
    setSubmitting(true);
    try {
      await patch(`/faculty/${facultyId}/days/${dayId}/approve`, { approved: 3 });
      const refreshed = await fetchFaculty({ silent: true });
      await syncFacultyDuration(refreshed);
      toast.success("Saved.");
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }, [currentDay, dayIndex, facultyId, fetchFaculty, getDayId, syncFacultyDuration]);

  const handlePostComment = useCallback(
    async (e) => {
      e.preventDefault();
      if (!canWriteComments) {
        toast.error("You are not allowed to post comments.");
        return;
      }

      const text = newComment.trim();
      if (!text || !currentDay) return;

      setSubmitting(true);
      try {
        const dayId =
          getDayId(currentDay) ?? (dayIndex != null ? String(dayIndex) : null);
        if (!dayId) throw new Error("Day could not be identified.");

        // Try to post comment via POST endpoint
        const newCommentObj = {
          text: text,
          date: new Date().toISOString(),
          userID: user?.id || user?._id || "anonymous",
        };

        await post(
          `/faculty/${facultyId}/days/${dayId}/comments`,
          newCommentObj,
        );
        await fetchFaculty({ silent: true });
        setNewComment("");
        toast.success("Comment added.");
      } catch {
        // Fallback: try PATCH approach
        try {
          const newCommentObj = {
            text: text,
            date: new Date().toISOString(),
            userID: user?.id || user?._id || "anonymous",
          };

          const comments = [...(currentDay.comments || []), newCommentObj];
          await updateDay(currentDay, { ...currentDay, comments }, dayIndex);
          setNewComment("");
        } catch (fallbackErr) {
          toast.error(fallbackErr.message || "Failed to add comment.");
        }
      } finally {
        setSubmitting(false);
      }
    },
    [
      canWriteComments,
      currentDay,
      newComment,
      updateDay,
      dayIndex,
      user,
      facultyId,
      fetchFaculty,
      getDayId,
    ],
  );

  const handleUpdateComment = useCallback(
    async (commentId, newText) => {
      const trimmed = newText.trim();
      if (!trimmed || !currentDay) return;

      const dayId =
        getDayId(currentDay) ?? (dayIndex != null ? String(dayIndex) : null);
      if (!dayId) {
        toast.error("Day could not be identified.");
        return;
      }

      setSubmitting(true);
      try {
        await patch(
          `/faculty/${facultyId}/days/${dayId}/comments/${commentId}`,
          { text: trimmed },
        );
        setEditingCommentId(null);
        setEditingCommentText("");
        await fetchFaculty({ silent: true });
        toast.success("Comment updated.");
      } catch (err) {
        toast.error(err.message || "Failed to update comment.");
      } finally {
        setSubmitting(false);
      }
    },
    [currentDay, dayIndex, facultyId, fetchFaculty, getDayId],
  );

  const handleDeleteComment = useCallback(
    async (commentId) => {
      if (!currentDay) return;
      if (!window.confirm("Delete this comment?")) return;

      const dayId =
        getDayId(currentDay) ?? (dayIndex != null ? String(dayIndex) : null);
      if (!dayId) {
        toast.error("Day could not be identified.");
        return;
      }

      setSubmitting(true);
      try {
        await del(
          `/faculty/${facultyId}/days/${dayId}/comments/${commentId}`,
        );
        await fetchFaculty({ silent: true });
        toast.success("Comment deleted.");
      } catch (err) {
        toast.error(err.message || "Failed to delete comment.");
      } finally {
        setSubmitting(false);
      }
    },
    [currentDay, dayIndex, facultyId, fetchFaculty, getDayId],
  );

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
        approved: 1,
        shortReport: null,
        comments: [],
      };
      await post(`/faculty/${facultyId}/days`, newDay);
      const refreshedFaculty = await fetchFaculty({ silent: true });
      await syncFacultyProgress(refreshedFaculty);
      await syncFacultyDuration(refreshedFaculty);
      await attendanceApi.syncAttendance(facultyId);
      setDayIndex(
        Math.max(0, (refreshedFaculty?.days?.length || days.length || 1) - 1),
      );
      toast.success("Day added.");
      setShowAddDayModal(false);
      setNewDayDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      toast.error(err.message || "Failed to add day.");
    } finally {
      setSubmitting(false);
    }
  }, [
    facultyId,
    days.length,
    newDayDate,
    fetchFaculty,
    syncFacultyDuration,
    syncFacultyProgress,
  ]);

  const handleDeleteDayClick = useCallback(() => {
    setShowDeleteDayModal(true);
  }, []);

  const handleDeleteDayConfirm = useCallback(async () => {
    if (!currentDay) return;
    const dayId = getDayId(currentDay) ?? (dayIndex != null ? String(dayIndex) : null);
    if (!dayId) {
      toast.error("Day could not be identified.");
      return;
    }
    setSubmitting(true);
    try {
      await del(`/faculty/${facultyId}/days/${dayId}`);
      const refreshedFaculty = await fetchFaculty({ silent: true });
      await syncFacultyProgress(refreshedFaculty);
      await syncFacultyDuration(refreshedFaculty);
      await attendanceApi.syncAttendance(facultyId);
      setDayIndex((prev) => Math.max(0, prev - 1));
      toast.success("Day deleted.");
      setShowDeleteDayModal(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete day.");
    } finally {
      setSubmitting(false);
    }
  }, [
    currentDay,
    dayIndex,
    facultyId,
    fetchFaculty,
    getDayId,
    syncFacultyDuration,
    syncFacultyProgress,
  ]);

  const handleEditDayDateClick = useCallback(() => {
    if (!currentDay) return;
    setEditDayDate(String(currentDay.date || "").slice(0, 10));
    setShowEditDayDateModal(true);
  }, [currentDay]);

  const handleEditDayDateConfirm = useCallback(async () => {
    if (!currentDay || !editDayDate) return;
    const dayId = getDayId(currentDay);
    if (!dayId) {
      toast.error("Day could not be identified.");
      return;
    }
    setSubmitting(true);
    try {
      await patch(`/faculty/${facultyId}/days/${dayId}`, {
        ...currentDay,
        date: editDayDate,
      });
      const refreshedFaculty = await fetchFaculty({ silent: true });
      await syncFacultyDuration(refreshedFaculty);
      await attendanceApi.syncAttendance(facultyId);
      toast.success("Date updated.");
      setShowEditDayDateModal(false);
    } catch (err) {
      toast.error(err.message || "Failed to update date.");
    } finally {
      setSubmitting(false);
    }
  }, [
    currentDay,
    editDayDate,
    facultyId,
    fetchAttendance,
    fetchFaculty,
    getDayId,
    syncFacultyDuration,
  ]);

  const allComments = useMemo(() => {
    if (!faculty || !faculty.days) return [];
    if (!canViewComments) return [];
    return faculty.days.flatMap((day, index) =>
      (day.comments || []).map((comment) => ({
        text: comment.text || comment,
        date: comment.date,
        userID: comment.userID,
        commentID: comment._id,
        dayIndex: index,
        dayNumber: day.dayNumber,
      })),
    );
  }, [faculty, canViewComments]);

  const visibleCurrentDayComments = useMemo(
    () => (canViewComments ? currentDay?.comments || [] : []),
    [currentDay, canViewComments],
  );

  const navigateToDay = useCallback(
    (dayIndex) => {
      attemptDayChange(dayIndex);
      setShowFeedbackView(false);
    },
    [attemptDayChange],
  );

  useEffect(() => {
    if (!Array.isArray(days) || days.length === 0) return;
    if (!Number.isInteger(initialDayIndex)) return;

    const safeDayIndex = Math.max(
      0,
      Math.min(days.length - 1, initialDayIndex),
    );
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
    setStudentSearchTerm("");
    setSelectedStudentIds([]);
    setSelectedStudentFaculty("all");
    setSelectedStudentYear("all");
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

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

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
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [reportFormDirty]);

  useEffect(() => {
    const item = dayItemRefs.current[dayIndex];
    if (!item) return;
    item.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [dayIndex, days.length]);

  useEffect(() => {
    if (!focusCommentKey) return;
    if (!currentDay) return;

    const commentIndex = (currentDay.comments || []).findIndex(
      (comment, index) =>
        getCommentKey(comment, index) === String(focusCommentKey),
    );

    if (commentIndex < 0) return;

    setHighlightedCommentKey(String(focusCommentKey));

    const timerId = setTimeout(() => {
      commentsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 140);

    const clearTimer = setTimeout(() => {
      setHighlightedCommentKey("");
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
            <button
              type="button"
              className="ip-back"
              onClick={handleBackToDashboard}
            >
              ← Back to dashboard
            </button>
            <PageState
              variant="loading"
              title="Loading internship details"
              message="Preparing days, comments, and attachments..."
              className="ip-loading"
            />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="ip-page">
          <style>{ipStyles}</style>
          <div className="ip-shell">
            <button
              type="button"
              className="ip-back"
              onClick={handleBackToDashboard}
            >
              ← Back to dashboard
            </button>
            <PageState
              variant="error"
              title="Failed to load internship"
              message={error}
              className="ip-alert"
            />
          </div>
        </div>
      );
    }

    if (!faculty) {
      return (
        <div className="ip-page">
          <style>{ipStyles}</style>
          <div className="ip-shell">
            <button
              type="button"
              className="ip-back"
              onClick={handleBackToDashboard}
            >
              ← Back to dashboard
            </button>
            <PageState
              variant="empty"
              title="Internship not found"
              message="This internship does not exist or is no longer accessible."
              className="ip-empty"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="ip-page">
        <style>{ipStyles}</style>
        <div className="ip-shell">
          <button
            type="button"
            className="ip-back"
            onClick={handleBackToDashboard}
          >
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
                  Review daily progress, attach evidence, and keep the approval
                  trail clear for everyone involved.
                </p>
              </div>
              <div
                className="ip-hero-statuslist"
                aria-label="Current internship status"
              >
                <span className="ip-status-pill">
                  {currentDay
                    ? `Day ${currentDay.dayNumber}`
                    : "No day selected"}
                </span>
                <span
                  className={`ip-status-pill ${currentDayApprovalCode === 2 ? "ip-status-pill--ok" : currentDayApprovalCode === 3 ? "ip-status-pill--warn" : "ip-status-pill--neutral"}`}
                >
                  {currentDayApprovalCode === 2
                    ? "Approved"
                    : currentDayApprovalCode === 3
                      ? "Not approved"
                      : "No decision"}
                </span>
                <span
                  className={`ip-status-pill ip-status-pill--internship-${normalizeInternshipStatus(baseInfoStatus).toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {normalizeInternshipStatus(baseInfoStatus)}
                </span>
                <span className="ip-status-pill">
                  {canWriteReport ? "Editable" : "Read only"}
                </span>
                <span className="ip-status-pill">
                  {faculty.plan ? "Plan available" : "No plan"}
                </span>
                {canEditInternship && !isInternshipEditMode && (
                  <button
                    type="button"
                    className="ip-status-action"
                    onClick={handleInternshipEditStart}
                  >
                    Edit
                  </button>
                )}
                {canEditInternship && isInternshipEditMode && (
                  <>
                    <button
                      type="button"
                      className="ip-status-action"
                      onClick={handleBaseInfoSubmit}
                      disabled={submitting}
                    >
                      {submitting ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      className="ip-status-action ip-status-action--cancel"
                      onClick={handleInternshipEditCancel}
                      disabled={submitting}
                    >
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
                {isInternshipEditMode ? (
                  <div className="ip-duration-pickers">
                    <input
                      type="date"
                      className="ip-input ip-date-input ip-duration-date"
                      value={baseInfoStartDate}
                      onChange={(e) => setBaseInfoStartDate(e.target.value)}
                      aria-label="Start date"
                    />
                    <span className="ip-duration-sep">—</span>
                    <input
                      type="date"
                      className="ip-input ip-date-input ip-duration-date"
                      value={baseInfoEndDate}
                      onChange={(e) => setBaseInfoEndDate(e.target.value)}
                      aria-label="End date"
                    />
                  </div>
                ) : (
                  <span className="ip-inline-field ip-inline-field--display">
                    {baseInfoDuration || "—"}
                  </span>
                )}
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
                    <option key={status} value={status}>
                      {status}
                    </option>
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
                  <div
                    className="ip-progress-track"
                    aria-label={`Internship progress ${computedProgressLabel}`}
                  >
                    <div
                      className="ip-progress-fill"
                      style={{
                        width: `${progressPercent}%`,
                        background: `linear-gradient(90deg, hsl(${Math.max(0, progressHue - 24)} 82% 56%), hsl(${Math.min(120, progressHue + 12)} 80% 44%))`,
                      }}
                    ></div>
                  </div>
                  <span className="ip-progress-meta">
                    {reportedDaysCount}/{days.length || 0} days reported
                  </span>
                </div>
              </div>
              <div className="ip-hero-item" aria-label="Internship tutor">
                <div className="ip-tutor-head">
                  <span className="ip-summary-label">
                    {tutorInfo.count > 1 ? "Tutors" : "Tutor"}
                  </span>
                  <span className="ip-tutor-badge">
                    {tutorInfo.count > 1
                      ? `${tutorInfo.count} tutors appended`
                      : "Assigned"}
                  </span>
                </div>
                {tutorInfo.hasInfo ? (
                  <div className="ip-tutor-body">
                    {/* When more than one tutor, show a compact typographic summary */}
                    {tutorInfo.count > 1 ? (
                      <div
                        className="ip-tutor-compact"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div className="ip-tutor-compact-text">
                            <div className="ip-tutor-name-compact">
                              {tutorInfo.count} tutors appended
                            </div>
                          </div>
                        </div>
                        <div>
                          <button
                            type="button"
                            className="ip-eye-btn"
                            onClick={openTutorsModal}
                            aria-label="View tutors"
                          >
                            👁
                          </button>
                        </div>
                      </div>
                    ) : (
                      (() => {
                        const t = (tutorInfo.tutors && tutorInfo.tutors[0]) || {
                          initials: tutorInfo.initials,
                          name: tutorInfo.name,
                          contact: tutorInfo.contact,
                        };
                        return (
                          <div
                            className="ip-tutor-list"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: 12,
                                alignItems: "center",
                                minWidth: 0,
                              }}
                            >
                              <div className="ip-tutor-avatar">
                                {t.initials}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <strong
                                    className="ip-tutor-name"
                                    style={{
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {t.name || "No information"}
                                  </strong>
                                  <span
                                    style={{
                                      color: "var(--t2, #5a6278)",
                                      fontSize: 13,
                                    }}
                                  >
                                    {t.contact || ""}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <button
                                type="button"
                                className="ip-eye-btn"
                                onClick={openTutorsModal}
                                aria-label="View tutors"
                              >
                                👁
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                ) : canManageTutors ? (
                  <button
                    type="button"
                    className="ip-student-action-btn"
                    onClick={openTutorsModal}
                  >
                    Append tutor +
                  </button>
                ) : (
                  <p className="ip-tutor-empty">No tutor assigned.</p>
                )}
                {showTutorsModal &&
                  createPortal(
                    <div
                      role="dialog"
                      aria-modal="true"
                      style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2200,
                      }}
                      onMouseDown={(e) => {
                        if (e.target === e.currentTarget)
                          setShowTutorsModal(false);
                      }}
                    >
                      <div
                        className="ip-modal-content ip-modal-content--wide"
                        style={{
                          background: "#fff",
                          borderRadius: 12,
                          padding: 18,
                          boxShadow: "0 24px 60px rgba(3,7,18,.32)",
                          maxHeight: "86vh",
                          overflow: "auto",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            marginBottom: 12,
                          }}
                        >
                          <h3 style={{ margin: 0 }}>
                            Assigned tutors ({tutorInfo.count})
                          </h3>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              type="button"
                              className="ip-student-action-btn ip-student-action-btn--ghost"
                              onClick={() => setShowTutorsModal(false)}
                            >
                              Close
                            </button>
                          </div>
                        </div>

                        <div style={{ display: "grid", gap: 8 }}>
                          {(tutorInfo.tutors || []).map((tutor) => (
                            <div
                              key={tutor.key}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 12,
                                padding: 8,
                                borderRadius: 10,
                                background: "#fafafa",
                                border: "1px solid rgba(0,0,0,.06)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: 12,
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background:
                                      "linear-gradient(135deg,#635bff,#06c9a0)",
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                  }}
                                >
                                  {tutor.initials}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontWeight: 800 }}>
                                    {tutor.name}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 13,
                                      color: "var(--t2, #5a6278)",
                                    }}
                                  >
                                    {tutor.contact || "No contact information"}
                                  </div>
                                </div>
                              </div>
                              {canManageTutors && (
                                <div>
                                  <button
                                    type="button"
                                    className="ip-student-action-btn"
                                    onClick={() =>
                                      removeTutorFromFaculty(tutor.key)
                                    }
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div style={{ marginTop: 14 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 12,
                              marginBottom: 10,
                            }}
                          >
                            <label
                              style={{
                                display: "block",
                                fontSize: 13,
                                color: "var(--t3, #9ba3bb)",
                              }}
                            >
                              Available tutors
                            </label>
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--t3, #9ba3bb)",
                              }}
                            >
                              {modalAvailableTutors.length} total
                            </span>
                          </div>

                          <div
                            className="ip-student-manager-list"
                            style={{ maxHeight: 280 }}
                          >
                            {(modalAvailableTutors || []).length === 0 ? (
                              <div className="ip-student-manager-empty">
                                No tutors available.
                              </div>
                            ) : (
                              modalAvailableTutors.map((tutor) => {
                                const tutorId = String(
                                  tutor._id ||
                                    tutor.id ||
                                    tutor.userId ||
                                    tutor.login ||
                                    tutor.email ||
                                    "",
                                );
                                const isAssigned =
                                  getFacultyTutorIds().includes(tutorId);
                                const tutorName = String(
                                  tutor.name ||
                                    tutor.login ||
                                    tutor.email ||
                                    tutorId ||
                                    "Unnamed tutor",
                                );
                                const tutorSub = String(
                                  tutor.phone ||
                                    tutor.login ||
                                    tutor.email ||
                                    tutor.role ||
                                    "",
                                ).trim();

                                return (
                                  <label
                                    key={tutorId || tutorName}
                                    className={`ip-student-manager-row ${isAssigned ? "" : ""}`.trim()}
                                    style={{
                                      cursor: tutorId ? "pointer" : "default",
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      className="ip-student-check"
                                      checked={isAssigned}
                                      disabled={
                                        !tutorId ||
                                        submitting ||
                                        !canManageTutors
                                      }
                                      onChange={(e) =>
                                        setTutorAssignment(
                                          tutorId,
                                          e.target.checked,
                                        )
                                      }
                                    />
                                    <span
                                      className={`ip-student-check-box ${isAssigned ? "ip-student-check-box--checked" : ""}`.trim()}
                                      aria-hidden="true"
                                    >
                                      {isAssigned && (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="12"
                                          height="12"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="3"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                      )}
                                    </span>
                                    <div className="ip-student-copy ip-student-copy--tutor">
                                      <div className="ip-student-avatar">
                                        {getInitialsFromLabel(tutorName)}
                                      </div>
                                      <div className="ip-student-copy-text">
                                        <div className="ip-student-name">
                                          {tutorName}
                                        </div>
                                        <div className="ip-student-faculty">
                                          {tutorSub || "No contact information"}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="ip-student-manager-actions">
                                      <span
                                        className={`ip-student-badge ${isAssigned ? "ip-student-badge--attached" : "ip-student-badge--free"}`}
                                      >
                                        {isAssigned ? "Assigned" : "Available"}
                                      </span>
                                    </div>
                                  </label>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    </div>,
                    document.body,
                  )}
              {showStudents &&
                createPortal(
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Attached students"
                    style={{
                      position: "fixed",
                      inset: 0,
                      background: "rgba(0,0,0,.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2200,
                    }}
                    onMouseDown={(e) => {
                      if (e.target === e.currentTarget)
                        setShowStudents(false);
                    }}
                  >
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: 18,
                        boxShadow: "0 24px 60px rgba(3,7,18,.32)",
                        maxHeight: "80vh",
                        width: "min(480px, 92vw)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <h3 style={{ margin: 0, fontSize: 16 }}>
                          Students ({attachedStudents.length} attached)
                        </h3>
                        <button
                          type="button"
                          className="ip-student-action-btn ip-student-action-btn--ghost"
                          onClick={() => setShowStudents(false)}
                        >
                          Close
                        </button>
                      </div>
                      <div style={{ overflowY: "auto", flex: 1 }}>
                        {attachedStudents.length === 0 ? (
                          <div className="ip-students-empty-state">
                            <p className="ip-students-empty">
                              No students attached to this internship.
                            </p>
                            {canManageStudents && (
                              <button
                                type="button"
                                className="ip-student-action-btn"
                                onClick={() => {
                                  setShowStudents(false);
                                  openStudentManager();
                                }}
                                disabled={
                                  submitting ||
                                  !Array.isArray(students) ||
                                  students.length === 0
                                }
                              >
                                Attach students
                              </button>
                            )}
                          </div>
                        ) : (
                          <ul className="ip-students-list" style={{ margin: 0, padding: 0 }}>
                            {attachedStudents.map((student, index) => {
                              const studentId =
                                getStudentId(student) || `student-${index}`;
                              const studentName = getStudentName(student);
                              return (
                                <li key={studentId} className="ip-student-item">
                                  <div className="ip-student-copy">
                                    <span className="ip-student-name">
                                      {studentName}
                                    </span>
                                    {getStudentFacultyName(student) && (
                                      <span className="ip-student-faculty">
                                        {getStudentFacultyName(student)}
                                      </span>
                                    )}
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
                    </div>
                  </div>,
                  document.body,
                )}
              </div>
              {internshipMapData && (
                <div className="ip-hero-item" style={{ gridColumn: "1 / -1" }}>
                  <span className="ip-hero-label">Location map</span>
                  <div
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      border: "1px solid rgba(0,0,0,.08)",
                      background: "rgba(0,0,0,.03)",
                      boxShadow: "0 10px 30px rgba(99,91,255,.08)",
                    }}
                  >
                    <iframe
                      title={`Map for ${internshipMapData.label}`}
                      src={internshipMapData.embedUrl}
                      style={{
                        width: "100%",
                        height: 320,
                        border: 0,
                        display: "block",
                      }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <a
                    href={internshipMapData.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      marginTop: 10,
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--a1)",
                      textDecoration: "none",
                    }}
                  >
                    Open in maps
                  </a>
                </div>
              )}
            </div>

            <div className="ip-plan-card" aria-label="Internship plan">
              <div className="ip-plan-header">
                <span className="ip-hero-label">Plan</span>
                <button
                  type="button"
                  className="ip-student-action-btn"
                  onClick={() => setShowPlan((prev) => !prev)}
                >
                  {showPlan ? "Close plan" : "Open plan"}
                </button>
              </div>
              {showPlan && (
                <>
                  <div
                    className="ip-format-toolbar"
                    role="toolbar"
                    aria-label="Plan text formatting"
                  >
                    <button
                      type="button"
                      className="ip-format-btn"
                      disabled={!isInternshipEditMode}
                      onClick={() =>
                        applyFormatting(
                          planEditorRef,
                          setBaseInfoPlan,
                          "**",
                          "**",
                          "bold",
                        )
                      }
                    >
                      Bold
                    </button>
                    <button
                      type="button"
                      className="ip-format-btn"
                      disabled={!isInternshipEditMode}
                      onClick={() =>
                        applyFormatting(
                          planEditorRef,
                          setBaseInfoPlan,
                          "_",
                          "_",
                          "italic",
                        )
                      }
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      className="ip-format-btn"
                      disabled={!isInternshipEditMode}
                      onClick={() =>
                        applyFormatting(
                          planEditorRef,
                          setBaseInfoPlan,
                          "- ",
                          "",
                          "List item",
                        )
                      }
                    >
                      List
                    </button>
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
                        dangerouslySetInnerHTML={{
                          __html: renderSimpleMarkdown(baseInfoPlan),
                        }}
                      ></div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="ip-hero-duo">
              <div className="ip-students-card" aria-label="Attached students">
                <div className="ip-students-head">
                  <div>
                    <span className="ip-summary-label">Students</span>
                    <strong className="ip-summary-value">
                      {attachedStudents.length} attached
                    </strong>
                  </div>
                  <div className="ip-students-head-actions">
                    {canManageStudents && (
                      <button
                        type="button"
                        className="ip-student-action-btn"
                        onClick={openStudentManager}
                        disabled={
                          submitting ||
                          !Array.isArray(students) ||
                          students.length === 0
                        }
                      >
                        Manage students
                      </button>
                    )}
                    <button
                      type="button"
                      className="ip-eye-btn"
                      onClick={() => setShowStudents(true)}
                      aria-label="Show attached students"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="ip-attendance-card" aria-label="Attendance">
                <div className="ip-attendance-head">
                  <div>
                    <strong className="ip-summary-value">Attendance</strong>
                  </div>
                  <button
                    type="button"
                    className="ip-eye-btn"
                    onClick={() => setShowAttendanceEditor(true)}
                    aria-label="Open attendance manager"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {(canApprove || canExport) && (
            <div className="ip-actions">
              {canApprove && (
                <>
                  <button
                    type="button"
                    className="ip-btn ip-btn--primary"
                    disabled={!currentDay || submitting || currentDayApprovalCode === 2}
                    onClick={handleApprove}
                  >
                    Approve report
                  </button>
                  <button
                    type="button"
                    className="ip-btn ip-btn--danger"
                    disabled={!currentDay || submitting || !(currentDayApprovalCode === 2 || (currentDayApprovalCode === 1 && hasReportContent(currentDay)))}
                    onClick={handleUnapprove}
                  >
                    Not approved
                  </button>
                </>
              )}
              {canExport && (
                <button
                  type="button"
                  className="ip-btn ip-btn--primary"
                  onClick={() => window.print()}
                >
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
                  {finalReportLoading ? "Generating…" : "Final report"}
                </button>
              )}
            </div>
          )}

          {showReportForm && currentDay && (
            <div className="ip-report-form-card">
              <div className="ip-report-form-header">
                <h4 className="ip-report-form-title">
                  Edit day information — Day {currentDay.dayNumber}
                </h4>
                <button
                  type="button"
                  className="ip-close-btn"
                  onClick={() => {
                    guardedResetDayForm();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <form
                onSubmit={handleReportSubmit}
                className="ip-report-form ip-report-form-wrapper"
              >
                <div className="ip-form-section">
                  <div className="ip-field">
                    <label className="ip-label" htmlFor="ip-day-date">
                      Date
                    </label>
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
                    <label className="ip-label" htmlFor="ip-report-title">
                      Title
                    </label>
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
                    <label className="ip-label" htmlFor="ip-report-desc">
                      Description
                    </label>
                    <div
                      className="ip-format-toolbar"
                      role="toolbar"
                      aria-label="Report text formatting"
                    >
                      <button
                        type="button"
                        className="ip-format-btn"
                        onClick={() =>
                          applyFormatting(
                            reportDescriptionRef,
                            setReportDescription,
                            "**",
                            "**",
                            "bold",
                          )
                        }
                      >
                        Bold
                      </button>
                      <button
                        type="button"
                        className="ip-format-btn"
                        onClick={() =>
                          applyFormatting(
                            reportDescriptionRef,
                            setReportDescription,
                            "_",
                            "_",
                            "italic",
                          )
                        }
                      >
                        Italic
                      </button>
                      <button
                        type="button"
                        className="ip-format-btn"
                        onClick={() =>
                          applyFormatting(
                            reportDescriptionRef,
                            setReportDescription,
                            "## ",
                            "",
                            "Heading",
                          )
                        }
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        className="ip-format-btn"
                        onClick={() =>
                          applyFormatting(
                            reportDescriptionRef,
                            setReportDescription,
                            "- ",
                            "",
                            "List item",
                          )
                        }
                      >
                        List
                      </button>
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
                    <div
                      className="ip-report-counter"
                      style={{ textAlign: "end" }}
                      aria-live="polite"
                    >
                      {reportDescriptionWordCount}/
                      {REPORT_DESCRIPTION_MIN_WORDS} words
                    </div>
                  </div>
                </div>

                <div className="ip-form-divider"></div>

                <div className="ip-form-section">
                  <label className="ip-label" htmlFor="ip-report-images">
                    Attachments
                  </label>
                  <div className="ip-image-upload-container">
                    <label
                      htmlFor="ip-report-images"
                      className={`ip-image-upload-area${isDragActive ? " drag-active" : ""}`}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <p className="ip-upload-text">
                          Click to upload or drag and drop
                        </p>
                        <p className="ip-upload-hint">
                          SVG, PNG, JPG, GIF (max. 5MB)
                        </p>
                      </div>
                    </label>

                    {/* Preview of selected images */}
                    {imagePreviews.length > 0 && (
                      <div className="ip-image-previews-grid">
                        {imagePreviews.map((preview) => (
                          <div
                            key={preview.id}
                            className="ip-image-preview-item"
                          >
                            <img
                              src={preview.src}
                              alt={preview.name}
                              className="ip-image-preview"
                            />
                            <button
                              type="button"
                              className="ip-remove-image-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(preview.id);
                              }}
                              aria-label="Remove image"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
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
                  {submitting &&
                    reportImages.length > 0 &&
                    uploadProgress > 0 && (
                      <div className="ip-progress-bar">
                        <div
                          className="ip-progress-bar-fill"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
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
                    disabled={submitting || !isReportDescriptionLongEnough}
                  >
                    {submitting ? (
                      <>
                        <span className="ip-spinner"></span>
                        {reportImages.length > 0 &&
                        uploadProgress > 0 &&
                        uploadProgress < 100
                          ? `Uploading (${uploadProgress}%)`
                          : "Saving…"}
                      </>
                    ) : (
                      "Save Changes"
                    )}
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>

                <div className="ip-carousel" ref={dayCarouselRef}>
                  <div className="ip-carousel-track">
                    {days.map((day, idx) => {
                      const dayStatus = getDayReportStatus(day);
                      const dayStatusLabel = {
                        empty: "Empty",
                        submitted: "Sent",
                        missed: "Missed",
                        rejected: "Rejected",
                        approved: "Approved",
                      }[dayStatus];

                      return (
                        <button
                          key={idx}
                          type="button"
                          ref={(el) => {
                            dayItemRefs.current[idx] = el;
                          }}
                          className={`ip-carousel-item ip-carousel-item--${dayStatus} ${dayIndex === idx ? "ip-carousel-item--active" : ""}`}
                          title={`Day ${day.dayNumber}: ${dayStatusLabel}`}
                          onClick={() => attemptDayChange(idx)}
                        >
                          <span className="ip-carousel-day-number">
                            Day {day.dayNumber}
                          </span>
                          <span className="ip-carousel-day-date">
                            {day.date || "No date"}
                          </span>
                          <span className={`ip-carousel-status-badge ip-carousel-status-badge--${dayStatus}`}>
                            {dayStatus === "approved" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                            {dayStatusLabel}
                          </span>
                        </button>
                      );
                      })}

                    {canWriteReport && (
                      <button
                        type="button"
                        ref={(el) => {
                          dayItemRefs.current[days.length] = el;
                        }}
                        className="ip-carousel-add-day"
                        onClick={handleAddDayClick}
                        disabled={submitting}
                        title="Add a new internship day"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span className="ip-carousel-add-day-text">
                          Add day
                        </span>
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>

              {currentDay && (
                <div className="ip-day-card">
                  <div className="ip-day-header">
                    <div>
                      <span className="ip-day-title">
                        Day {currentDay.dayNumber}
                      </span>
                      <div className="ip-day-subtitle">
                        {currentDay.date || "No date"}
                        {canWriteReport && (
                          <button
                            type="button"
                            className="ip-day-date-edit-btn"
                            onClick={handleEditDayDateClick}
                            disabled={submitting}
                            title="Change date"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="ip-day-header-actions">
                      <span
                        className={`ip-day-badge ${currentDayApprovalCode === 2 ? "ip-day-badge--ok" : currentDayApprovalCode === 3 ? "ip-day-badge--danger" : "ip-day-badge--neutral"}`}
                      >
                        {currentDayApprovalCode === 2 ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              stroke="none"
                            >
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            Approved
                          </>
                        ) : currentDayApprovalCode === 3 ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="15" y1="9" x2="9" y2="15"></line>
                              <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                            Not approved
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            No decision
                          </>
                        )}
                      </span>
                      {canWriteReport && (
                        <button
                          type="button"
                          className="ip-day-edit-btn"
                          onClick={handleWriteReportOpenClick}
                          disabled={submitting}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                          Edit
                        </button>
                      )}
                      {canWriteReport && (
                        <button
                          type="button"
                          className="ip-day-delete-btn"
                          onClick={handleDeleteDayClick}
                          disabled={submitting}
                          title="Delete this day"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {currentDay.shortReport && (
                    <div className="ip-report">
                      <h4 className="ip-report-title">
                        {currentDay.shortReport.title || "Untitled"}
                      </h4>
                      <div
                        className="ip-report-desc"
                        dangerouslySetInnerHTML={{
                          __html: renderSimpleMarkdown(
                            currentDay.shortReport.description || "",
                          ),
                        }}
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
                              <img
                                src={img}
                                alt={`Report ${idx + 1}`}
                                className="ip-report-img"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {(visibleCurrentDayComments.length > 0 ||
                    canWriteComments) && (
                    <div className="ip-comments" ref={commentsSectionRef}>
                      <h4 className="ip-comments-title">
                        Comments ({visibleCurrentDayComments.length || 0})
                      </h4>
                      {visibleCurrentDayComments &&
                        visibleCurrentDayComments.length > 0 && (
                          <ul className="ip-comments-list">
                            {visibleCurrentDayComments.map((comment, idx) => {
                              const canEditThisComment =
                                Boolean(comment._id) &&
                                (normalizeRoleLocal(user?.role) === "admin" ||
                                  normalizeRoleLocal(user?.role) ===
                                    "developer" ||
                                  String(user?.id || user?._id || "") ===
                                    String(
                                      typeof comment.userID === "object"
                                        ? comment.userID?._id ||
                                          comment.userID?.id ||
                                          ""
                                        : comment.userID || "",
                                    ));
                              const commentUser =
                                typeof comment.userID === "object"
                                  ? comment.userID
                                  : null;
                              const userName = commentUser
                                ? `${commentUser.name} ${commentUser.surname}`
                                : "Unknown User";
                              const userRole = commentUser
                                ? commentUser.role
                                : "";
                              const commentKey = getCommentKey(comment, idx);
                              const isEditingThis =
                                editingCommentId === comment._id;
                              return (
                                <li
                                  key={comment._id || idx}
                                  className={`ip-comment ${highlightedCommentKey === commentKey ? "ip-comment--focus" : ""}`}
                                >
                                  <div
                                    className="ip-comment-header"
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                      marginBottom: "8px",
                                      fontSize: "12px",
                                      color: "var(--t3, #9ba3bb)",
                                    }}
                                  >
                                    <div>
                                      <div
                                        style={{
                                          fontWeight: 600,
                                          color: "var(--t1, #0c0e18)",
                                          marginBottom: "4px",
                                        }}
                                      >
                                        {userName}{" "}
                                        {userRole && (
                                          <span
                                            style={{
                                              fontSize: "11px",
                                              fontWeight: 500,
                                              color: "var(--a1, #635bff)",
                                            }}
                                          >
                                            ({userRole})
                                          </span>
                                        )}
                                      </div>
                                      <div>
                                        {new Date(
                                          comment.date,
                                        ).toLocaleDateString()}{" "}
                                        {new Date(
                                          comment.date,
                                        ).toLocaleTimeString()}
                                      </div>
                                    </div>
                                    {canEditThisComment && !isEditingThis && (
                                      <div style={{ display: "flex", gap: "4px" }}>
                                        <button
                                          type="button"
                                          style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            color: "var(--a1, #635bff)",
                                            padding: "2px 6px",
                                          }}
                                          onClick={() => {
                                            setEditingCommentId(comment._id);
                                            setEditingCommentText(comment.text);
                                          }}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            color: "var(--error, #e53e3e)",
                                            padding: "2px 6px",
                                          }}
                                          disabled={submitting}
                                          onClick={() =>
                                            handleDeleteComment(comment._id)
                                          }
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  {isEditingThis ? (
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "8px",
                                        alignItems: "center",
                                      }}
                                    >
                                      <input
                                        type="text"
                                        value={editingCommentText}
                                        onChange={(e) =>
                                          setEditingCommentText(e.target.value)
                                        }
                                        className="ip-input"
                                        style={{ flex: 1 }}
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter")
                                            handleUpdateComment(
                                              comment._id,
                                              editingCommentText,
                                            );
                                          if (e.key === "Escape") {
                                            setEditingCommentId(null);
                                            setEditingCommentText("");
                                          }
                                        }}
                                      />
                                      <button
                                        type="button"
                                        className="ip-btn ip-btn--primary"
                                        disabled={
                                          submitting ||
                                          !editingCommentText.trim()
                                        }
                                        onClick={() =>
                                          handleUpdateComment(
                                            comment._id,
                                            editingCommentText,
                                          )
                                        }
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        className="ip-btn ip-btn--secondary"
                                        disabled={submitting}
                                        onClick={() => {
                                          setEditingCommentId(null);
                                          setEditingCommentText("");
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <p style={{ margin: 0 }}>{comment.text}</p>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      {canWriteComments && (
                        <form
                          className="ip-comment-form"
                          onSubmit={handlePostComment}
                        >
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment…"
                            className="ip-input"
                          />
                          <button
                            type="submit"
                            className="ip-btn ip-btn--primary"
                            disabled={submitting || !newComment.trim()}
                          >
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
              <p style={{ margin: "0 0 16px 0" }}>
                No days recorded for this internship yet.
              </p>
              {canWriteReport && (
                <button
                  type="button"
                  className="ip-btn ip-btn--primary"
                  disabled={submitting}
                  onClick={handleAddDayClick}
                >
                  {submitting ? "Adding…" : "Add first day"}
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
                    const user =
                      typeof comment.userID === "object"
                        ? comment.userID
                        : null;
                    const userName = user
                      ? `${user.name} ${user.surname}`
                      : "Unknown User";
                    const userRole = user ? user.role : "";
                    return (
                      <li key={comment.commentID || idx} className="ip-comment">
                        <div className="ip-comment-header">
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                color: "var(--t1, #0c0e18)",
                                marginBottom: "4px",
                              }}
                            >
                              {userName}{" "}
                              {userRole && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 500,
                                    color: "var(--a1, #635bff)",
                                  }}
                                >
                                  ({userRole})
                                </span>
                              )}
                            </div>
                            <span className="ip-comment-day">
                              Day {comment.dayNumber} •{" "}
                              {new Date(comment.date).toLocaleDateString()}{" "}
                              {new Date(comment.date).toLocaleTimeString()}
                            </span>
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

          {activeImageSrc &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="ip-image-modal"
                onClick={() => setActiveImageSrc("")}
              >
                <button
                  type="button"
                  className="ip-image-modal-close"
                  onClick={() => setActiveImageSrc("")}
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

          {showAddDayModal &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="ip-modal-overlay"
                onClick={() => setShowAddDayModal(false)}
              >
                <div
                  className="ip-modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="ip-modal-header">
                    <h3 className="ip-modal-title">Add New Day</h3>
                    <button
                      type="button"
                      className="ip-close-btn"
                      onClick={() => setShowAddDayModal(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div className="ip-modal-body">
                    <label className="ip-label" htmlFor="new-day-date">
                      Select date for the new day
                    </label>
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
                      {submitting ? "Adding…" : "Add Day"}
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )}

          {showEditDayDateModal &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="ip-modal-overlay"
                onClick={() => setShowEditDayDateModal(false)}
              >
                <div
                  className="ip-modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="ip-modal-header">
                    <h3 className="ip-modal-title">Change Day Date</h3>
                    <button
                      type="button"
                      className="ip-close-btn"
                      onClick={() => setShowEditDayDateModal(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div className="ip-modal-body">
                    <label className="ip-label" htmlFor="edit-day-date">
                      Select new date for Day {currentDay?.dayNumber}
                    </label>
                    <input
                      id="edit-day-date"
                      type="date"
                      value={editDayDate}
                      onChange={(e) => setEditDayDate(e.target.value)}
                      className="ip-input ip-date-input"
                    />
                  </div>
                  <div className="ip-modal-footer">
                    <button
                      type="button"
                      className="ip-btn ip-btn--secondary"
                      onClick={() => setShowEditDayDateModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="ip-btn ip-btn--primary"
                      onClick={handleEditDayDateConfirm}
                      disabled={submitting || !editDayDate}
                    >
                      {submitting ? "Saving…" : "Save Date"}
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )}

          {showDeleteDayModal &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="ip-modal-overlay"
                onClick={() => setShowDeleteDayModal(false)}
              >
                <div
                  className="ip-modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="ip-modal-header">
                    <h3 className="ip-modal-title">Delete Day</h3>
                    <button
                      type="button"
                      className="ip-close-btn"
                      onClick={() => setShowDeleteDayModal(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div className="ip-modal-body">
                    <p style={{ margin: 0, color: "var(--t2, #5a6278)", fontSize: 14 }}>
                      Are you sure you want to delete <strong>Day {currentDay?.dayNumber}</strong>
                      {currentDay?.date ? ` (${currentDay.date})` : ""}? This action cannot be undone.
                    </p>
                  </div>
                  <div className="ip-modal-footer">
                    <button
                      type="button"
                      className="ip-btn ip-btn--secondary"
                      onClick={() => setShowDeleteDayModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="ip-btn ip-btn--danger"
                      onClick={handleDeleteDayConfirm}
                      disabled={submitting}
                    >
                      {submitting ? "Deleting…" : "Delete Day"}
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )}

          {showAttendanceEditor &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="ip-modal-overlay"
                onClick={() => setShowAttendanceEditor(false)}
                style={{ alignItems: "stretch", justifyContent: "stretch" }}
              >
                <div
                  className="ip-modal-content ip-modal-content--wide ip-attendance-modal"
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: "100vw", height: "100vh", maxWidth: "none", maxHeight: "none", borderRadius: 0 }}
                >
                  <div className="ip-modal-header">
                    <div style={{ display: "grid", gap: 4 }}>
                      <h3 className="ip-modal-title">Attendance</h3>
                      <div style={{ fontSize: 12, color: "var(--t2, #5a6278)" }}>
                        Manage daily presence across all students and days.
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ip-close-btn"
                      onClick={() => setShowAttendanceEditor(false)}
                    >
                      ×
                    </button>
                  </div>
                  <div
                    className="ip-modal-body"
                    style={{ display: "grid", gap: 14, overflow: "hidden", padding: 20 }}
                  >
                    {attendanceLoading ? (
                      <div className="ip-empty-state">Loading attendance…</div>
                    ) : attendanceError ? (
                      <div className="ip-empty-state">Error: {attendanceError}</div>
                    ) : !attendance ||
                      !Array.isArray(attendance.attendance) ||
                      attendance.attendance.length === 0 ? (
                      <div className="ip-empty-state">
                        No attendance recorded yet.
                      </div>
                    ) : isMobile ? (
                      <div style={{ maxHeight: "calc(100vh - 240px)", overflow: "auto" }}>
                        <AttendanceMobile
                          students={mobileStudents}
                          days={attendanceDays}
                          onTogglePresent={handleTogglePresent}
                          onSave={handleSaveAttendanceChanges}
                          saving={attendanceSaving}
                          hasChanges={attendanceHasChanges}
                        />
                      </div>
                    ) : (
                      <div
                        className="ip-attendance-table-wrap"
                        style={{
                          maxHeight: "calc(100vh)",
                          overflowX: "scroll",
                          overflowY: "scroll",
                          scrollbarGutter: "stable both-edges",
                          borderRadius: 16,
                          border: "1px solid rgba(0,0,0,.08)",
                          background: "rgba(255,255,255,.92)",
                        }}
                      >
                        <div className="ip-attendance-day">
                          <div
                            ref={attendanceScrollRef}
                            className="ip-attendance-scroll"
                            style={{
                              minHeight: "420px",
                              userSelect: "none",
                              touchAction: "auto",
                              WebkitOverflowScrolling: "touch",
                            }}
                          >
                            <div
                              className="ip-attendance-table-frame"
                              style={{
                                width: `${attendanceTableWidth}px`,
                                minWidth: `${attendanceTableWidth}px`,
                              }}
                            >
                              <table className="ip-attendance-table">
                                <thead>
                                  <tr>
                                    <th
                                      style={{
                                        minWidth: `${attendanceNameColumnWidth}px`,
                                        width: `${attendanceNameColumnWidth}px`,
                                      }}
                                    ></th>
                                    {attendanceDays.map((day) => (
                                      <th
                                        key={day.id || day.date}
                                        style={{
                                          whiteSpace: "nowrap",
                                          minWidth: `${attendanceDayColumnWidth}px`,
                                          width: `${attendanceDayColumnWidth}px`,
                                          textAlign: "center",
                                        }}
                                      >
                                        <div style={{ textAlign: "center" }}>
                                          <div>
                                            <div style={{ fontWeight: 700 }}>
                                              {day.date
                                                ? new Date(day.date).toLocaleDateString()
                                                : `Day ${day.dayNumber}`}
                                            </div>
                                          </div>
                                        </div>
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {(Array.isArray(attachedStudents)
                                    ? attachedStudents
                                    : []
                                  ).map((stu, sidx) => {
                                    const sk = getStudentId(stu) || `key-${sidx}`;
                                    const studentName = getStudentName(stu);
                                    return (
                                      <tr key={sk}>
                                        <td
                                          style={{
                                            minWidth: `${attendanceNameColumnWidth}px`,
                                            width: `${attendanceNameColumnWidth}px`,
                                          }}
                                        >
                                          {studentName}
                                        </td>
                                        {attendanceDays.map((day) => {
                                          const studentRecord = (
                                            Array.isArray(day.students)
                                              ? day.students
                                              : []
                                          ).find(
                                            (s) =>
                                              String(
                                                s.studentKey ||
                                                  s.studentId ||
                                                  `${s.name}-${s.surname}`,
                                              ).trim() === String(sk).trim(),
                                          );
                                          const present = Boolean(
                                            studentRecord
                                              ? studentRecord.present
                                              : false,
                                          );
                                          return (
                                            <td
                                              key={`${day.id || day.date}-${sk}`}
                                              style={{
                                                textAlign: "center",
                                                minWidth: `${attendanceDayColumnWidth}px`,
                                                width: `${attendanceDayColumnWidth}px`,
                                              }}
                                            >
                                              <input
                                                type="checkbox"
                                                className="ip-attendance-radio"
                                                checked={present}
                                                onChange={(e) =>
                                                  handleTogglePresent(
                                                    day.id,
                                                    sk,
                                                    e.target.checked,
                                                  )
                                                }
                                                title="Toggle presence"
                                              />
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ip-modal-footer">
                    <button
                      type="button"
                      className="ip-btn ip-btn--secondary"
                      onClick={() => setShowAttendanceEditor(false)}
                    >
                      Close
                    </button>
                    {!isMobile && attendance && Array.isArray(attendance.attendance) && attendance.attendance.length > 0 && (
                      <button
                        type="button"
                        className="ip-btn ip-btn--primary"
                        onClick={handleSaveAttendanceChanges}
                        disabled={
                          !attendanceHasChanges ||
                          attendanceSaving ||
                          attendanceLoading
                        }
                      >
                        {attendanceSaving ? "Saving…" : "Save attendance"}
                      </button>
                    )}
                  </div>
                </div>
              </div>,
              document.body,
            )}

          {showStudentManager &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="ip-modal-overlay"
                onClick={() => setShowStudentManager(false)}
              >
                <div
                  className="ip-modal-content ip-modal-content--wide"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="ip-modal-header">
                    <h3 className="ip-modal-title">Manage students</h3>
                    <button
                      type="button"
                      className="ip-close-btn"
                      onClick={() => setShowStudentManager(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  <div className="ip-modal-body">
                    <label className="ip-label" htmlFor="student-search">
                      Search students
                    </label>
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
                        <label
                          className="ip-label"
                          htmlFor="student-faculty-filter"
                        >
                          Faculty
                        </label>
                        <CustomFilterSelect
                          id="student-faculty-filter"
                          value={selectedStudentFaculty}
                          onChange={setSelectedStudentFaculty}
                          options={facultyFilterOptions}
                        />
                      </div>

                      <div className="ip-filter-card">
                        <label
                          className="ip-label"
                          htmlFor="student-year-filter"
                        >
                          Faculty year
                        </label>
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
                      <div className="ip-student-manager-empty">
                        No students found.
                      </div>
                    ) : (
                      <div className="ip-student-manager-list">
                        {studentDirectory.map(
                          ({
                            student,
                            studentId,
                            studentName,
                            studentFacultyName,
                            studentYear,
                            isAttached,
                          }) => {
                            const isStudentSelected =
                              Boolean(studentId) &&
                              selectedStudentIds.includes(studentId);

                            return (
                              <label
                                key={studentId || studentName}
                                className="ip-student-manager-row"
                              >
                                <input
                                  type="checkbox"
                                  className="ip-student-check"
                                  checked={isStudentSelected}
                                  onChange={() =>
                                    handleToggleStudentSelection(studentId)
                                  }
                                  disabled={
                                    submitting || isAttached || !studentId
                                  }
                                  aria-label={`Select ${studentName}`}
                                />
                                <span
                                  className={`ip-student-check-box ${isStudentSelected ? "ip-student-check-box--checked" : ""}`.trim()}
                                  aria-hidden="true"
                                >
                                  {isStudentSelected && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                  )}
                                </span>
                                <div className="ip-student-copy ip-student-copy--student">
                                  <strong className="ip-student-name">
                                    {studentName}
                                  </strong>
                                  {studentFacultyName && (
                                    <span className="ip-student-faculty">
                                      {studentFacultyName}
                                    </span>
                                  )}
                                  {studentYear && (
                                    <span className="ip-student-faculty">
                                      Year {studentYear}
                                    </span>
                                  )}
                                </div>
                                <div className="ip-student-manager-actions">
                                  <span
                                    className={`ip-student-badge ${isAttached ? "ip-student-badge--attached" : "ip-student-badge--free"}`}
                                  >
                                    {isAttached ? "Attached" : "Available"}
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
                            );
                          },
                        )}
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
                      {submitting
                        ? "Adding…"
                        : `Add selected (${selectedStudentIds.length})`}
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )}

          {showFinalReportModal &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="ip-modal-overlay"
                onClick={() => setShowFinalReportModal(false)}
              >
                <div
                  className="ip-modal-content ip-modal-content--wide"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="ip-modal-header">
                    <h3 className="ip-modal-title">
                      AI Final Report (30 Days)
                    </h3>
                    <button
                      type="button"
                      className="ip-close-btn"
                      onClick={() => setShowFinalReportModal(false)}
                      aria-label="Close final report"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  <div className="ip-modal-body">
                    {finalReportLoading && (
                      <div className="ip-final-report-state">
                        Generating report from internship data, daily texts, and
                        photos…
                      </div>
                    )}

                    {!finalReportLoading && finalReportError && (
                      <div className="ip-final-report-state ip-final-report-state--error">
                        {finalReportError}
                      </div>
                    )}

                    {!finalReportLoading &&
                      !finalReportError &&
                      finalReportMarkdown && (
                        <div
                          className="ip-final-report-body"
                          dangerouslySetInnerHTML={{
                            __html: renderSimpleMarkdown(finalReportMarkdown),
                          }}
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
  .ip-status-pill--neutral { background: rgba(255,255,255,.88); color: var(--t2, #5a6278); border-color: rgba(0,0,0,.10); }
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
  .ip-inline-field--display {
    display: block;
    padding: 8px 10px;
    font-size: 14px;
    color: var(--t1, #0c0e18);
  }
  .ip-duration-pickers {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .ip-duration-date {
    flex: 1 1 130px;
    min-width: 130px;
    padding: 8px 10px;
    font-size: 14px;
  }
  .ip-duration-sep {
    font-size: 14px;
    color: var(--t3, #9ba3bb);
    flex-shrink: 0;
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
  .ip-hero-duo {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
    align-items: start;
  }
  .ip-hero-duo > * {
    min-width: 0;
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
  .ip-tutor-list {
    display: grid;
    gap: 10px;
  }
  .ip-tutor-compact {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 10px;
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(248,250,255,.98));
    border: 1px solid rgba(99,91,255,.06);
  }
  .ip-tutor-compact-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ip-tutor-avatar--compact { width: 44px; height: 44px; border-radius: 12px; font-size: 14px; }
  .ip-tutor-compact-text { min-width: 0; }
  .ip-tutor-name-compact { font-weight: 900; font-size: 15px; color: var(--t1, #0c0e18); }
  .ip-tutor-sub { font-size: 13px; color: var(--t2, #5a6278); margin-top: 2px; }
  .ip-tutor-badge { font-size: 12px; padding: 6px 12px; }
  .ip-tutor-empty { font-style: italic; }
  .ip-tutor-entry {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(255,255,255,.82);
    border: 1px solid rgba(0,0,0,.06);
  }
  .ip-tutor-avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg,#635bff,#06c9a0);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', system-ui, sans-serif;
    font-weight: 700;
    color: #fff;
    font-size: 13px;
    flex-shrink: 0;
  }
  .ip-tutor-entry-body {
    min-width: 0;
    display: flex;
    flex-direction: column;
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
  .ip-custom-menu--tutor {
    max-height: 300px;
    padding: 8px;
    border-color: rgba(6,201,160,.2);
    background: linear-gradient(180deg, rgba(255,255,255,.99), rgba(248,250,255,.96));
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
  .ip-custom-option--tutor {
    padding: 10px 12px;
    border-radius: 14px;
    align-items: center;
  }
  .ip-custom-option:hover {
    background: rgba(99,91,255,.08);
  }
  .ip-custom-option--selected {
    background: linear-gradient(135deg, rgba(99,91,255,.12), rgba(6,201,160,.12));
    color: #4338ca;
  }
  .ip-custom-option--tutor.ip-custom-option--selected {
    background: linear-gradient(135deg, rgba(99,91,255,.16), rgba(6,201,160,.14));
    color: #312e81;
  }
  .ip-custom-option-tutor {
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ip-custom-option-avatar {
    width: 38px;
    height: 38px;
    flex: 0 0 auto;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .04em;
    box-shadow: 0 8px 18px rgba(99,91,255,.16);
  }
  .ip-custom-option-copy {
    min-width: 0;
    display: grid;
    gap: 2px;
  }
  .ip-custom-option-title {
    min-width: 0;
    text-align: left;
    font-size: 13px;
    font-weight: 800;
    color: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    }
    .ip-custom-option-subtitle {
      text-align: left;
    min-width: 0;
    font-size: 11px;
    font-weight: 600;
    color: var(--t3, #9ba3bb);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    justify-content: flex-start;
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
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }
  .ip-student-check-box {
    width: 18px;
    height: 18px;
    border-radius: 6px;
    border: 1.5px solid rgba(99,91,255,.32);
    background: rgba(255,255,255,.94);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: inset 0 1px 2px rgba(255,255,255,.9);
    transition: all .2s ease;
    cursor: pointer;
  }
  .ip-student-check-box--checked {
    border-color: rgba(6,201,160,.45);
    background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
    box-shadow: 0 8px 18px rgba(99,91,255,.18);
  }
  .ip-student-check:focus-visible + .ip-student-check-box {
    box-shadow: 0 0 0 4px rgba(99,91,255,.18), inset 0 1px 2px rgba(255,255,255,.9);
  }
  .ip-student-check:disabled + .ip-student-check-box {
    opacity: .5;
    cursor: not-allowed;
  }
  .ip-student-check-box svg {
    width: 12px;
    height: 12px;
  }
  .ip-student-copy {
    display: grid;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }
  .ip-student-copy--tutor {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ip-student-copy--student {
    gap: 3px;
  }
  .ip-student-avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg,#635bff,#06c9a0);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }
  .ip-student-copy-text {
    min-width: 0;
    display: grid;
    gap: 2px;
  }
  .ip-student-manager-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    margin-left: auto;
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
  .ip-btn--danger {
    border: 1px solid rgba(239,68,68,.2);
    background: linear-gradient(135deg, rgba(239,68,68,.14), rgba(255,255,255,.95));
    color: #b91c1c;
    box-shadow: 0 10px 24px rgba(239,68,68,.10);
  }
  .ip-btn--danger:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(239,68,68,.18), rgba(255,255,255,.98));
    box-shadow: 0 14px 28px rgba(239,68,68,.14);
    transform: translateY(-1px);
  }
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
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .ip-day-date-edit-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--t3, #9ba3bb);
    cursor: pointer;
    border-radius: 4px;
    transition: color .15s, background .15s;
    flex-shrink: 0;
  }
  .ip-day-date-edit-btn:hover:not(:disabled) {
    color: var(--a1, #635bff);
    background: rgba(99,91,255,.1);
  }
  .ip-day-date-edit-btn:disabled {
    opacity: .4;
    cursor: not-allowed;
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
  .ip-day-badge--neutral {
    background: linear-gradient(135deg, rgba(255,255,255,.96), rgba(246,248,252,.96));
    color: var(--t2, #5a6278);
    border: 1px solid rgba(0,0,0,.10);
    box-shadow: inset 0 1px 2px rgba(255,255,255,.7), 0 2px 6px rgba(15,23,42,.06);
  }
  .ip-day-badge--neutral:hover {
    background: linear-gradient(135deg, rgba(255,255,255,.99), rgba(246,248,252,.99));
    transform: translateY(-1px);
  }
  .ip-day-badge--danger {
    background: linear-gradient(135deg, rgba(239,68,68,.14), rgba(239,68,68,.06));
    color: #b91c1c;
    border: 1px solid rgba(239,68,68,.28);
    box-shadow: inset 0 1px 2px rgba(239,68,68,.08), 0 2px 6px rgba(239,68,68,.10);
  }
  .ip-day-badge--danger:hover {
    background: linear-gradient(135deg, rgba(239,68,68,.18), rgba(239,68,68,.08));
    border-color: rgba(239,68,68,.38);
    transform: translateY(-1px);
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
  .ip-day-delete-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 34px;
    padding: 0 12px;
    border-radius: 10px;
    border: 1px solid rgba(239,68,68,.24);
    background: rgba(239,68,68,.08);
    color: #b91c1c;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s ease;
    white-space: nowrap;
  }
  .ip-day-delete-btn:hover:not(:disabled) {
    background: rgba(239,68,68,.16);
    border-color: rgba(239,68,68,.36);
  }
  .ip-day-delete-btn:disabled {
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
  /* Attendance styles */
  .ip-attendance-card {
    margin-top: 16px;
    background: rgba(255,255,255,.94);
    border: 1px solid rgba(0,0,0,.06);
    border-radius: 14px;
    padding: 16px;
  }
  .ip-attendance-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .ip-attendance-actions { display:flex; gap:8px; align-items:center; }
  .ip-attendance-body { }
  .ip-attendance-table-wrap { display: grid; gap: 12px; min-height: 0; }
  .ip-attendance-scroll {
    cursor: grab;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .ip-attendance-scroll::-webkit-scrollbar {
    display: none;
  }
  .ip-attendance-scroll--dragging {
    cursor: grabbing !important;
  }
  .ip-attendance-table-frame {
    width: 700px;
    min-width: 700px;
  }
  .ip-attendance-day {
    border-radius: 12px;
  }
  .ip-attendance-day-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:8px; }
  .ip-attendance-table {
    width: 100%;
    min-width: 700px;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 0;
    margin-top: 8px;
  }
  .ip-attendance-table thead th {
    position: sticky;
    top: 0;
    z-index: 4;
    text-align: left;
    padding: 10px 12px;
    font-size: 12px;
    text-transform: uppercase;
    color: var(--t2,#5a6278);
    background: rgba(246,248,252,.98);
    border-bottom: 1px solid rgba(0,0,0,.08);
    box-shadow: 0 1px 0 rgba(255,255,255,.8) inset;
  }
  .ip-attendance-table thead th:first-child {
    position: sticky;
    left: 0;
    z-index: 6;
    min-width: 260px;
    width: 260px;
    background: rgba(246,248,252,.98);
  }
  .ip-attendance-table thead th:not(:first-child),
  .ip-attendance-table tbody td:not(:first-child) {
    min-width: 132px;
    width: 132px;
  }
  .ip-attendance-table tbody td {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(0,0,0,.06);
    font-size: 14px;
    color: var(--t1,#0c0e18);
    background: #fff;
  }
  .ip-attendance-table tbody tr:nth-child(even) td {
    background: rgba(0,0,0,.02);
  }
  .ip-attendance-table tbody td:first-child {
    position: sticky;
    left: 0;
    z-index: 3;
    min-width: 260px;
    width: 260px;
    box-shadow: 10px 0 16px -14px rgba(12,14,24,.45);
  }
  .ip-attendance-table tbody tr:nth-child(even) td:first-child {
    background: rgba(250, 250, 250);
  }
  .ip-attendance-radio {
    width:18px;
    height:18px;
    appearance:none;
    -webkit-appearance:none;
    border:2px solid rgba(99,91,255,.45);
    border-radius:999px;
    background:#fff;
    display:inline-grid;
    place-content:center;
    cursor:pointer;
    transition:all .18s ease;
  }
  .ip-attendance-radio::before {
    content:'';
    width:8px;
    height:8px;
    border-radius:999px;
    transform:scale(0);
    transition:transform .14s ease;
    background:var(--a1,#635bff);
  }
  .ip-attendance-radio:checked {
    border-color: var(--a1,#635bff);
    box-shadow: 0 0 0 4px rgba(99,91,255,.10);
  }
  .ip-attendance-radio:checked::before { transform:scale(1); }
  .ip-attendance-radio:disabled {
    opacity:.45;
    cursor:not-allowed;
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
  .ip-image-upload-area.drag-active {
    border-color: rgba(99,91,255,.7);
    background: linear-gradient(135deg, rgba(99,91,255,.14), rgba(6,201,160,.08));
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 10px 30px rgba(99,91,255,.2);
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
  .ip-carousel-item--empty {
    border-color: rgba(99,91,255,.1);
    background: rgba(255,255,255,.7);
    box-shadow: none;
  }
  .ip-carousel-item--submitted {
    border-color: rgba(249, 115, 22, .36);
    background: linear-gradient(135deg, rgba(249, 115, 22, .14), rgba(255, 255, 255, .96));
    box-shadow: 0 10px 24px rgba(249, 115, 22, .14);
  }
  .ip-carousel-item--missed {
    border-color: rgba(239, 68, 68, .42);
    background: linear-gradient(135deg, rgba(239, 68, 68, .16), rgba(255, 255, 255, .96));
    box-shadow: 0 10px 24px rgba(239, 68, 68, .16);
  }
  .ip-carousel-item--rejected {
    border-color: rgba(239, 68, 68, .34);
    background: linear-gradient(135deg, rgba(239, 68, 68, .14), rgba(255, 255, 255, .96));
    box-shadow: 0 10px 24px rgba(239, 68, 68, .14);
  }
  .ip-carousel-item--approved {
    border-color: rgba(34, 197, 94, .34);
    background: linear-gradient(135deg, rgba(34, 197, 94, .14), rgba(255, 255, 255, .96));
    box-shadow: 0 10px 24px rgba(34, 197, 94, .14);
  }
  .ip-carousel-item:hover {
    border-color: rgba(99,91,255,.3);
    background: rgba(255,255,255,.98);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99,91,255,.1);
  }
  .ip-carousel-item--active {
    border-color: rgba(99,91,255,.5);
    background: linear-gradient(135deg, rgba(99,91,255,.12), rgba(6,201,160,.08));
    box-shadow: 0 8px 24px rgba(99,91,255,.15);
  }
  .ip-carousel-item--active.ip-carousel-item--empty {
    box-shadow: 0 12px 28px rgba(245, 158, 11, .18);
  }
  .ip-carousel-item--active.ip-carousel-item--submitted {
    box-shadow: 0 12px 28px rgba(249, 115, 22, .2);
  }
  .ip-carousel-item--active.ip-carousel-item--missed {
    box-shadow: 0 12px 28px rgba(239, 68, 68, .2);
  }
  .ip-carousel-item--active.ip-carousel-item--rejected {
    box-shadow: 0 12px 28px rgba(239, 68, 68, .2);
  }
  .ip-carousel-item--active.ip-carousel-item--approved {
    box-shadow: 0 12px 28px rgba(34, 197, 94, .2);
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
  .ip-carousel-status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 22px;
    font-size: 10px;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 6px;
    margin-top: 4px;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(15,23,42,.08);
    transition: all .2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ip-carousel-status-badge--empty {
    background: rgba(255,255,255,.9);
    color: var(--t3, #9ba3bb);
    border: 1px solid rgba(99,91,255,.12);
  }
  .ip-carousel-status-badge--submitted {
    background: linear-gradient(135deg, rgba(249, 115, 22, .18), rgba(249, 115, 22, .08));
    color: #c2410c;
    border: 1px solid rgba(249, 115, 22, .24);
  }
  .ip-carousel-status-badge--missed {
    background: linear-gradient(135deg, rgba(239, 68, 68, .18), rgba(239, 68, 68, .08));
    color: #b91c1c;
    border: 1px solid rgba(239, 68, 68, .24);
  }
  .ip-carousel-status-badge--rejected {
    background: linear-gradient(135deg, rgba(239, 68, 68, .18), rgba(239, 68, 68, .08));
    color: #b91c1c;
    border: 1px solid rgba(239, 68, 68, .24);
  }
  .ip-carousel-status-badge--approved {
    background: linear-gradient(135deg, rgba(6,201,160,.15), rgba(6,201,160,.08));
    color: #047857;
    border: 1px solid rgba(6,201,160,.25);
    box-shadow: 0 2px 4px rgba(6,201,160,.08);
  }
  .ip-carousel-item:hover .ip-carousel-status-badge--empty {
    box-shadow: 0 4px 8px rgba(245, 158, 11, .12);
  }
  .ip-carousel-item:hover .ip-carousel-status-badge--submitted {
    box-shadow: 0 4px 8px rgba(249, 115, 22, .14);
  }
  .ip-carousel-item:hover .ip-carousel-status-badge--missed {
    box-shadow: 0 4px 8px rgba(239, 68, 68, .14);
  }
  .ip-carousel-item:hover .ip-carousel-status-badge--rejected {
    box-shadow: 0 4px 8px rgba(239, 68, 68, .14);
  }
  .ip-carousel-item:hover .ip-carousel-status-badge--approved {
    background: linear-gradient(135deg, rgba(6,201,160,.2), rgba(6,201,160,.12));
    border-color: rgba(6,201,160,.4);
    box-shadow: 0 4px 8px rgba(6,201,160,.12);
  }
  .ip-carousel-item--active .ip-carousel-status-badge--approved {
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
    max-width: 600px;
    width: 90%;
    max-height: min(90vh, 820px);
    display: flex;
    flex-direction: column;
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
    overflow: auto;
    flex: 1 1 auto;
  }
  .ip-modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
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
    .ip-hero-duo { grid-template-columns: 1fr; gap: 16px; }
    .ip-actions { position: static; }
    .ip-comment-form { flex-direction: column; }
    .ip-plan-card { padding: 16px; }
    .ip-plan-text { font-size: 14px; line-height: 1.7; }
  }
  /* Extra small screen tuning */
  @media (max-width: 480px) {
    .ip-page { padding: 12px; }
    .ip-shell { padding: 0 6px; }
    .ip-hero { padding: 16px; border-radius: 14px; }
    .ip-hero-title { font-size: 20px; }
    .ip-hero-copy { font-size: 13px; }

    .ip-carousel { padding: 6px; }
    .ip-carousel-item { min-width: 120px; max-width: 140px; flex: 0 0 120px; padding: 10px; }
    .ip-carousel-track { gap: 8px; }

    .ip-actions { position: static; padding: 8px; border-radius: 12px; gap: 8px; box-shadow: none; }
    .ip-btn { padding: 10px; font-size: 14px; }

    /* Make attendance table collapse gracefully and allow mobile component to be used */
    .ip-attendance-table-frame, .ip-attendance-table { min-width: 100% !important; width: 100% !important; }
    .ip-attendance-table thead th:first-child, .ip-attendance-table tbody td:first-child { min-width: 140px !important; width: 140px !important; }
    .ip-attendance-table thead th:not(:first-child), .ip-attendance-table tbody td:not(:first-child) { min-width: 80px !important; width: 80px !important; }

    .ip-modal-content { width: 100%; height: 100%; border-radius: 0; max-height: 100vh; }
    .ip-modal-body { padding: 16px; }
    .ip-modal-footer { padding: 12px; }

    .ip-image-preview-item { aspect-ratio: 1 / 1; }
    .ip-report-form-wrapper { max-width: 100%; padding: 0 6px; }
    .ip-report-form-card { padding: 14px; border-radius: 12px; }
    .ip-plan-editor { min-height: 160px; }
    .ip-day-card { padding: 12px; border-radius: 12px; }
    .ip-comment-form { flex-direction: column; gap: 8px; }

    /* Make image modal adapt to screen and allow pinch/zoom gestures */
    .ip-image-modal { padding: 12px; }
    .ip-image-modal-content { max-width: 100%; max-height: 100%; width: auto; height: auto; }

    /* Make buttons block on very small screens to improve tap targets */
    .ip-modal-footer { flex-direction: column-reverse; gap: 10px; align-items: stretch; }
    .ip-modal-footer .ip-btn, .ip-actions .ip-btn { width: 100%; }

    /* Attendance mobile list cards */
    .attendance-mobile-root { padding: 6px 0; }
    .attendance-mobile-card { margin-bottom: 12px; padding: 10px; border-radius: 12px; }
  }
  /* AttendanceMobile component styles (mobile-first) */
  .attendance-mobile-root {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .attendance-mobile-list { display: flex; flex-direction: column; gap: 12px; }
  .attendance-mobile-card {
    background: rgba(255,255,255,.95);
    border: 1px solid rgba(0,0,0,.06);
    border-radius: 12px;
    padding: 12px;
  }
  .attendance-mobile-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .attendance-mobile-initials {
    width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg,#635bff,#06c9a0);
    color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800;
  }
  .attendance-mobile-name { font-weight: 800; color: var(--t1,#0c0e18); font-size: 14px; }
  .attendance-mobile-days { display: flex; gap: 8px; overflow: auto; padding-bottom: 6px; }
  .attendance-mobile-day-badge {
    min-width: 72px; padding: 8px; border-radius: 10px; border: 1px solid rgba(0,0,0,.06);
    background: #fff; display: flex; flex-direction: column; gap: 4px; align-items: center; justify-content: center; cursor: pointer;
  }
  .attendance-mobile-day-badge.present {
    border-color: var(--a1,#635bff); background: linear-gradient(135deg, rgba(99,91,255,.06), rgba(6,201,160,.03)); color: var(--a1,#635bff);
  }
  .attendance-mobile-day-label { font-size: 11px; color: var(--t3,#9ba3bb); white-space: nowrap; }
  .attendance-mobile-day-state { font-size: 16px; font-weight: 800; }
  .attendance-mobile-footer { display: flex; gap: 8px; }

/* Mobile clean theme overrides: remove heavy backgrounds, reduce paddings */
@media (max-width: 760px) {
  .ip-page { background: #fff !important; padding: 8px !important; }
  .ip-shell { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }

  .ip-hero,
  .ip-report-form-card,
  .ip-day-card,
  .ip-summary-card,
  .ip-students-card,
  .ip-tutor-card,
  .ip-attendance-card,
  .ip-plan-card,
  .ip-image-upload-area,
  .ip-student-manager-row,
  .ip-modal-content {
    background: #fff !important;
    border-radius: 8px !important;
    padding: 8px !important;
    box-shadow: none !important;
    border: 1px solid rgba(0,0,0,.06) !important;
    backdrop-filter: none !important;
  }

  .ip-hero::before { display: none !important; }
  .ip-actions { background: transparent !important; box-shadow: none !important; padding: 6px !important; gap: 6px !important; }
  .ip-btn { padding: 10px 12px !important; }
  .ip-form-actions { padding-top: 10px !important; margin-top: 10px !important; }
  .ip-hero-title { font-size: 20px !important; }
  .ip-hero-copy { font-size: 13px !important; }
  .ip-hero-grid, .ip-hero-item { gap: 8px !important; }
  .ip-report-form-wrapper { padding: 0 6px !important; }
  .ip-carousel-item { padding: 6px 8px !important; min-width: 100px !important; max-width: 120px !important; }
  .ip-modal-content { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
}

@media (max-width: 480px) {
  .ip-page { background: #fff !important; padding: 6px !important; }
  .ip-shell { padding: 0 !important; }
  .ip-hero, .ip-day-card, .ip-report-form-card { padding: 6px !important; border-radius: 8px !important; box-shadow: none !important; }
  .ip-hero::before { display: none !important; }
  .ip-hero-title { font-size: 18px !important; }
  .ip-hero-copy { font-size: 12px !important; }
  .ip-plan-editor { min-height: 120px !important; }
  .ip-actions { padding: 6px !important; gap: 6px !important; background: transparent !important; box-shadow: none !important; border: none !important; }
  .ip-modal-content { border-radius: 0 !important; }
  .ip-report-form-card { margin-bottom: 10px !important; }
  .ip-report-form-wrapper { padding: 0 !important; }
  .ip-student-manager-list { max-height: 46vh !important; }
  .attendance-mobile-day-badge { min-width: 64px !important; padding: 6px !important; }
}
`;
