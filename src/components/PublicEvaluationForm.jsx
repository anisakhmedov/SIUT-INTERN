import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import InternshipEvaluationSchema from "../utils/evaluationSchema";
import { postEvaluation } from "../utils/evaluationApi";

const styles = {
  page: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "12px clamp(16px, 3vw, 32px) 32px",
  },
  hero: {
    marginBottom: 24,
    padding: "24px 24px 22px",
    borderRadius: 24,
    background:
      "linear-gradient(135deg, rgba(99,91,255,.10), rgba(6,201,160,.08))",
    border: "1px solid rgba(99,91,255,.14)",
    boxShadow: "0 14px 40px rgba(12,14,24,.06)",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,.72)",
    border: "1px solid rgba(0,0,0,.06)",
    color: "var(--t2)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: ".02em",
    marginBottom: 12,
  },
  title: {
    margin: 0,
    fontSize: "clamp(28px, 4vw, 42px)",
    lineHeight: 1.05,
    color: "var(--t1)",
  },
  subtitle: {
    margin: "12px 0 0",
    maxWidth: 760,
    color: "var(--t2)",
    fontSize: "clamp(14px, 1.7vw, 16px)",
    lineHeight: 1.6,
  },
  form: {
    display: "grid",
    gap: 22,
  },
  card: {
    padding: "20px 0 20px",
    borderRadius: 22,
    display: "grid",
    gap: 22,
  },
  successShell: {
    minHeight: "calc(100vh - 80px)",
    display: "grid",
    placeItems: "center",
    padding: "clamp(16px, 4vw, 40px) 0",
  },
  successCard: {
    width: "100%",
    maxWidth: 760,
    borderRadius: 32,
    padding: "clamp(28px, 5vw, 48px)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,.98), rgba(247,249,255,.98))",
    border: "1px solid rgba(99,91,255,.14)",
    boxShadow: "0 24px 70px rgba(12,14,24,.12)",
    position: "relative",
    overflow: "hidden",
  },
  successGlow: {
    position: "absolute",
    inset: "auto -120px -120px auto",
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(6,201,160,.16), transparent 70%)",
    pointerEvents: "none",
  },
  successBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "7px 14px",
    borderRadius: 999,
    background: "rgba(34,197,94,.10)",
    border: "1px solid rgba(34,197,94,.18)",
    color: "#166534",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: ".08em",
    textTransform: "uppercase",
    marginBottom: 18,
  },
  successMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #635bff, #06c9a0)",
    color: "#fff",
    fontSize: 30,
    boxShadow: "0 16px 32px rgba(99,91,255,.28)",
    marginBottom: 18,
  },
  successTitle: {
    margin: 0,
    fontSize: "clamp(30px, 5vw, 52px)",
    lineHeight: 1,
    color: "var(--t1)",
  },
  successText: {
    margin: "14px 0 0",
    maxWidth: 620,
    color: "var(--t2)",
    fontSize: "clamp(14px, 2vw, 17px)",
    lineHeight: 1.7,
  },
  successMeta: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginTop: 28,
  },
  successMetaItem: {
    padding: "14px 16px",
    borderRadius: 18,
    background: "rgba(99,91,255,.05)",
    border: "1px solid rgba(99,91,255,.10)",
  },
  successMetaLabel: {
    display: "block",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: ".12em",
    textTransform: "uppercase",
    color: "var(--t2)",
    marginBottom: 6,
  },
  successMetaValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--t1)",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: ".14em",
    textTransform: "uppercase",
    color: "var(--a1)",
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,.08)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,.98), rgba(248,250,252,.98))",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    minWidth: 820,
    tableLayout: "fixed",
  },
  headCell: {
    padding: "14px 14px",
    textAlign: "center",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: ".10em",
    textTransform: "uppercase",
    color: "var(--t2)",
    background: "rgba(0,0,0,.03)",
    borderBottom: "1px solid rgba(0,0,0,.06)",
    overflowWrap: "anywhere",
  },
  firstHeadCell: {
    textAlign: "left",
    width: "44%",
  },
  rowLabel: {
    padding: "16px 16px",
    fontWeight: 700,
    color: "var(--t1)",
    fontSize: 14,
    verticalAlign: "middle",
    borderBottom: "1px solid rgba(0,0,0,.06)",
    overflowWrap: "anywhere",
  },
  ratingCell: {
    padding: "14px 10px",
    textAlign: "center",
    verticalAlign: "middle",
    borderBottom: "1px solid rgba(0,0,0,.06)",
  },
  radio: {
    width: 22,
    height: 22,
    cursor: "pointer",
    accentColor: "#635bff",
    transform: "translateY(1px)",
  },
  commentLabel: {
    marginTop: -5,
    marginBottom: -10,
  },
  comment: {
    minHeight: 112,
    resize: "vertical",
  },
  fieldLast: {
    marginBottom: 0,
  },
  ratingStack: {
    display: "grid",
    gap: 14,
  },
  ratingBlock: {
    display: "grid",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,.08)",
    background: "rgba(255,255,255,.72)",
  },
  ratingBlockTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "var(--t1)",
    lineHeight: 1.4,
    overflowWrap: "anywhere",
  },
  ratingLegend: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 8,
  },
  ratingLegendCell: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: ".08em",
    textTransform: "uppercase",
    color: "var(--t2)",
    paddingBottom: 4,
  },
  ratingChoice: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minWidth: 0,
    padding: "10px 6px",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,.08)",
    background: "rgba(255,255,255,.9)",
    textAlign: "center",
  },
  ratingChoiceActive: {
    borderColor: "rgba(99,91,255,.32)",
    background: "rgba(99,91,255,.08)",
    boxShadow: "0 8px 18px rgba(99,91,255,.10)",
  },
  ratingChoiceNumber: {
    fontSize: 12,
    fontWeight: 800,
    color: "var(--t2)",
  },
  error: {
    color: "#b91c1c",
    marginTop: 10,
    fontSize: 13,
    fontWeight: 600,
  },
  statusError: {
    color: "#b91c1c",
    marginBottom: 12,
    padding: "12px 14px",
    borderRadius: 14,
    background: "rgba(239,68,68,.08)",
    border: "1px solid rgba(239,68,68,.18)",
  },
  statusSuccess: {
    color: "#166534",
    marginBottom: 12,
    padding: "12px 14px",
    borderRadius: 14,
    background: "rgba(34,197,94,.10)",
    border: "1px solid rgba(34,197,94,.18)",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  requiredStar: {
    color: "#dc2626",
    marginLeft: 4,
    fontWeight: 900,
  },
  fieldHint: {
    marginTop: 8,
    color: "var(--t2)",
    fontSize: 12,
    lineHeight: 1.45,
  },
  pickerField: {
    position: "relative",
    // marginBottom: 14,
  },
  pickerButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    padding: "11px 13px",
    borderRadius: 14,
    border: "1.5px solid rgba(0,0,0,.09)",
    background: "linear-gradient(180deg, #fff, rgba(248,250,252,.98))",
    boxShadow: "0 8px 18px rgba(12,14,24,.05)",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "Montserrat, sans-serif",
  },
  pickerButtonOpen: {
    borderColor: "rgba(99,91,255,.35)",
    boxShadow: "0 10px 24px rgba(99,91,255,.12)",
  },
  pickerTextWrap: {
    display: "grid",
    gap: 4,
    minWidth: 0,
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: ".12em",
    textTransform: "uppercase",
    color: "var(--t2)",
  },
  pickerValue: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--t1)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  pickerCaret: {
    width: 30,
    height: 30,
    borderRadius: 10,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(99,91,255,.08)",
    color: "var(--a1)",
    flexShrink: 0,
  },
  pickerMenu: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "calc(100% + 8px)",
    zIndex: 20,
    borderRadius: 16,
    overflow: "hidden",
    background: "rgba(255,255,255,.98)",
    border: "1px solid rgba(99,91,255,.16)",
    boxShadow: "0 24px 50px rgba(12,14,24,.18)",
  },
  pickerOption: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "11px 13px",
    border: "none",
    background: "#fff",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "Montserrat, sans-serif",
    borderTop: "1px solid rgba(0,0,0,.05)",
  },
  pickerOptionActive: {
    background:
      "linear-gradient(180deg, rgba(99,91,255,.09), rgba(6,201,160,.05))",
  },
  pickerOptionLeft: {
    display: "grid",
    gap: 4,
    minWidth: 0,
  },
  pickerOptionTitle: {
    fontSize: 13.5,
    fontWeight: 800,
    color: "var(--t1)",
  },
  pickerOptionDesc: {
    fontSize: 12,
    color: "var(--t2)",
    lineHeight: 1.45,
  },
  pickerTick: {
    width: 24,
    height: 24,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(6,201,160,.12)",
    color: "#0f766e",
    fontWeight: 900,
    flexShrink: 0,
  },
  dateShell: {
    position: "relative",
  },
  dateTrigger: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "11px 13px",
    borderRadius: 14,
    border: "1.5px solid rgba(0,0,0,.09)",
    background: "linear-gradient(180deg, #fff, rgba(248,250,252,.98))",
    boxShadow: "0 8px 18px rgba(12,14,24,.05)",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "Montserrat, sans-serif",
  },
  dateIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(245,158,11,.12)",
    color: "#b45309",
    fontSize: 16,
    flexShrink: 0,
  },
  dateInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    padding: 0,
    fontFamily: "Montserrat, sans-serif",
    fontSize: 14,
    color: "var(--t1)",
  },
  calendarPanel: {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    left: 0,
    zIndex: 25,
    width: "min(100%, 360px)",
    borderRadius: 18,
    overflow: "hidden",
    background: "rgba(255,255,255,.98)",
    border: "1px solid rgba(99,91,255,.16)",
    boxShadow: "0 30px 70px rgba(12,14,24,.18)",
  },
  calendarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "13px 13px 10px",
    borderBottom: "1px solid rgba(0,0,0,.06)",
    background:
      "linear-gradient(135deg, rgba(99,91,255,.08), rgba(6,201,160,.06))",
  },
  calendarMonth: {
    display: "grid",
    gap: 4,
  },
  calendarMonthTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: "var(--t1)",
  },
  calendarMonthSub: {
    fontSize: 12,
    color: "var(--t2)",
  },
  calendarNav: {
    display: "flex",
    gap: 8,
  },
  calendarNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,.08)",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    color: "var(--t1)",
  },
  calendarGrid: {
    padding: 12,
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    gap: 6,
  },
  calendarDow: {
    textAlign: "center",
    fontSize: 10.5,
    fontWeight: 800,
    letterSpacing: ".10em",
    textTransform: "uppercase",
    color: "var(--t2)",
    paddingBottom: 4,
  },
  calendarCell: {
    aspectRatio: "1 / 1",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,.06)",
    background: "rgba(0,0,0,.02)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontFamily: "Montserrat, sans-serif",
    fontWeight: 700,
    color: "var(--t1)",
    transition:
      "transform .16s ease, box-shadow .16s ease, background .16s ease",
  },
  calendarCellMuted: {
    color: "rgba(12,14,24,.35)",
    background: "rgba(0,0,0,.01)",
  },
  calendarCellActive: {
    background: "linear-gradient(135deg, #635bff, #06c9a0)",
    color: "#fff",
    boxShadow: "0 10px 18px rgba(99,91,255,.24)",
    borderColor: "transparent",
  },
  calendarFooter: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    padding: "0 12px 12px",
  },
  calendarAction: {
    flex: 1,
    padding: "9px 10px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,.08)",
    background: "#fff",
    cursor: "pointer",
    fontFamily: "Montserrat, sans-serif",
    fontWeight: 700,
    color: "var(--t1)",
  },
};

function createInitialForm() {
  return {
    studentInformation: {
      fullname: "",
      studentID: "",
      degreeProgram: "",
      yearOfStudy: "",
      internshipStartDate: "",
      internshipEndDate: "",
    },
    companyInformation: {
      companyName: "",
      department: "",
      supervisorContact: "",
    },
    professionalism: {
      punctualityAndAttendance: "",
      dressCodeAndAppearance: "",
      adherenceToCompanyPolicies: "",
      comments: "",
    },
    workEthic: {
      initiativeAndProactiveness: "",
      timeManagement: "",
      abilityToMeetDeadlines: "",
      comments: "",
    },
    technicalSkills: {
      applicationOfAcademicKnowledge: "",
      abilityToLearnNewSkillsTools: "",
      qualityOfWorkOutput: "",
      comments: "",
    },
    communicationSkills: {
      verbalCommunication: "",
      writtenCommunication: "",
      teamCollaboration: "",
      comments: "",
    },
    problemSolvingSkills: {
      analyticalThinking: "",
      creativityAndInnovation: "",
      abilityToHandleChallenges: "",
      comments: "",
    },
    overallPerformance: {
      contributionToTheTeam: "",
      alignmentWithCompanyGoals: "",
      potentialForFutureEmployment: "",
      comments: "",
    },
    openEndedQuestions: {
      strengths: "",
      areasOfImprovement: "",
      projectTaskFeedback: "",
      learningAndGrowth: "",
      teamDynamics: "",
      adaptability: "",
      feedbackForStudent: "",
      feedbackForUniversity: "",
    },
    finalRecommendation: {
      finalRating: "",
      supervisorRecommendation: "",
      declarationAccepted: false,
      supervisorFullName: "",
      date: "",
    },
  };
}

function RequiredLabel({ children }) {
  return (
    <label className="fl">
      {children}
      <span style={styles.requiredStar}>*</span>
    </label>
  );
}

function arePropsEqualIgnoringKeys(prevProps, nextProps, ignoredKeys = []) {
  const prevKeys = Object.keys(prevProps).filter(
    (key) => !ignoredKeys.includes(key),
  );
  const nextKeys = Object.keys(nextProps).filter(
    (key) => !ignoredKeys.includes(key),
  );

  if (prevKeys.length !== nextKeys.length) return false;

  for (const key of prevKeys) {
    if (!Object.is(prevProps[key], nextProps[key])) return false;
  }

  return true;
}

function DebouncedInput({ value, onChange, debounce = 250, ...props }) {
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const nextValue = value ?? "";
    if (inputRef.current && inputRef.current.value !== nextValue) {
      inputRef.current.value = nextValue;
    }
  }, [value]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleInput = (event) => {
    const nextValue = event.target.value;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onChange(nextValue), debounce);
  };

  return (
    <input
      {...props}
      ref={inputRef}
      defaultValue={value ?? ""}
      onInput={handleInput}
    />
  );
}

const MemoDebouncedInput = React.memo(
  DebouncedInput,
  (prevProps, nextProps) =>
    arePropsEqualIgnoringKeys(prevProps, nextProps, ["onChange"]),
);

function DebouncedTextarea({ value, onChange, debounce = 300, ...props }) {
  const textareaRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const nextValue = value ?? "";
    if (textareaRef.current && textareaRef.current.value !== nextValue) {
      textareaRef.current.value = nextValue;
    }
  }, [value]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleInput = (event) => {
    const nextValue = event.target.value;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onChange(nextValue), debounce);
  };

  return (
    <textarea
      {...props}
      ref={textareaRef}
      defaultValue={value ?? ""}
      onInput={handleInput}
    />
  );
}

const MemoDebouncedTextarea = React.memo(
  DebouncedTextarea,
  (prevProps, nextProps) =>
    arePropsEqualIgnoringKeys(prevProps, nextProps, ["onChange"]),
);

function updateNestedValue(source, pathParts, value) {
  const [head, ...rest] = pathParts;
  if (!head) return source;
  if (rest.length === 0) {
    return { ...source, [head]: value };
  }

  const currentChild = source?.[head] ?? {};
  return {
    ...source,
    [head]: updateNestedValue(currentChild, rest, value),
  };
}

function useDismissableLayer(onClose) {
  const ref = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return ref;
}

function useMediaQuery(query) {
  const getMatch = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQueryList = window.matchMedia(query);
    const handleChange = (event) => setMatches(event.matches);

    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

function FancySelect({
  label,
  value,
  options,
  placeholder,
  onChange,
  hint,
  error,
  required,
  errorKey,
}) {
  const [open, setOpen] = useState(false);
  const ref = useDismissableLayer(() => setOpen(false));
  const selectedOption =
    options.find((option) => option.value === value) || null;

  return (
    <div style={styles.pickerField} ref={ref} data-error-key={errorKey}>
      <button
        type="button"
        className="fi"
        onClick={() => setOpen((state) => !state)}
        style={{
          ...styles.pickerButton,
          ...(open ? styles.pickerButtonOpen : null),
        }}
      >
        <span style={styles.pickerTextWrap}>
          <span style={styles.pickerLabel}>
            {label}
            {required ? <span style={styles.requiredStar}>*</span> : null}
          </span>
          <span style={styles.pickerValue}>
            {selectedOption?.title || placeholder}
          </span>
        </span>
        <span style={styles.pickerCaret}>{open ? "▴" : "▾"}</span>
      </button>
      {hint && <div style={styles.fieldHint}>{hint}</div>}
      {open && (
        <div style={styles.pickerMenu}>
          {options.map((option, index) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={{
                  ...styles.pickerOption,
                  ...(active ? styles.pickerOptionActive : null),
                  borderTop: index === 0 ? "none" : "1px solid rgba(0,0,0,.05)",
                }}
              >
                <span style={styles.pickerOptionLeft}>
                  <span style={styles.pickerOptionTitle}>{option.title}</span>
                  <span style={styles.pickerOptionDesc}>
                    {option.description}
                  </span>
                </span>
                <span style={styles.pickerTick}>{active ? "✓" : "•"}</span>
              </button>
            );
          })}
        </div>
      )}
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}

const MemoFancySelect = React.memo(
  FancySelect,
  (prevProps, nextProps) =>
    arePropsEqualIgnoringKeys(prevProps, nextProps, ["onChange"]),
);

function formatDateLabel(date) {
  if (!date) return "Choose a date";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function createMonthGrid(currentMonth) {
  const start = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  );
  const startOffset = (start.getDay() + 6) % 7;
  const firstVisibleDay = new Date(start);
  firstVisibleDay.setDate(start.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstVisibleDay);
    day.setDate(firstVisibleDay.getDate() + index);
    return day;
  });
}

function FancyDateField({ label, value, onChange, hint, error, required, errorKey }) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const initial = value ? new Date(`${value}T00:00:00`) : new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });
  const ref = useDismissableLayer(() => setOpen(false));

  const currentMonth = useMemo(() => {
    if (value) {
      const selected = new Date(`${value}T00:00:00`);
      if (!Number.isNaN(selected.getTime())) {
        return new Date(selected.getFullYear(), selected.getMonth(), 1);
      }
    }
    return viewMonth;
  }, [value, viewMonth]);

  const calendarDays = useMemo(
    () => createMonthGrid(currentMonth),
    [currentMonth],
  );
  const selectedDate = value ? new Date(`${value}T00:00:00`) : null;
  const today = new Date();
  const monthTitle = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  const selectDay = (day) => {
    const formatted = day.toISOString().slice(0, 10);
    onChange(formatted);
    setOpen(false);
  };

  return (
    <div style={styles.pickerField} ref={ref} data-error-key={errorKey}>
      <label className="fl">
        {label}
        {required ? <span style={styles.requiredStar}>*</span> : null}
      </label>
      <button
        type="button"
        className="fi"
        onClick={() => setOpen((state) => !state)}
        style={styles.dateTrigger}
      >
        <span style={styles.dateIcon}>📅</span>
        <span style={{ display: "grid", gap: 4, minWidth: 0, flex: 1 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--t2)",
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: value ? "var(--t1)" : "rgba(12,14,24,.42)",
            }}
          >
            {formatDateLabel(selectedDate)}
          </span>
        </span>
        <span style={styles.pickerCaret}>{open ? "▴" : "▾"}</span>
      </button>
      {hint && <div style={styles.fieldHint}>{hint}</div>}
      {error && <div style={styles.error}>{error}</div>}
      {open && (
        <div style={styles.calendarPanel}>
          <div style={styles.calendarHeader}>
            <div style={styles.calendarMonth}>
              <span style={styles.calendarMonthTitle}>{monthTitle}</span>
              <span style={styles.calendarMonthSub}>
                Choose a date from the calendar
              </span>
            </div>
            <div style={styles.calendarNav}>
              <button
                type="button"
                style={styles.calendarNavBtn}
                onClick={() =>
                  setViewMonth(
                    (month) =>
                      new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  )
                }
              >
                ‹
              </button>
              <button
                type="button"
                style={styles.calendarNavBtn}
                onClick={() =>
                  setViewMonth(
                    (month) =>
                      new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  )
                }
              >
                ›
              </button>
            </div>
          </div>

          <div style={styles.calendarGrid}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (dayName) => (
                <div key={dayName} style={styles.calendarDow}>
                  {dayName}
                </div>
              ),
            )}
            {calendarDays.map((day) => {
              const isOtherMonth = day.getMonth() !== currentMonth.getMonth();
              const isSelected =
                selectedDate &&
                day.toDateString() === selectedDate.toDateString();
              const isToday = day.toDateString() === today.toDateString();
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => selectDay(day)}
                  style={{
                    ...styles.calendarCell,
                    ...(isOtherMonth ? styles.calendarCellMuted : null),
                    ...(isSelected ? styles.calendarCellActive : null),
                    outline:
                      isToday && !isSelected
                        ? "2px solid rgba(99,91,255,.18)"
                        : "none",
                  }}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div style={styles.calendarFooter}>
            <button
              type="button"
              style={styles.calendarAction}
              onClick={() => {
                const now = new Date();
                selectDay(now);
              }}
            >
              Today
            </button>
            <button
              type="button"
              style={styles.calendarAction}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const MemoFancyDateField = React.memo(
  FancyDateField,
  (prevProps, nextProps) =>
    arePropsEqualIgnoringKeys(prevProps, nextProps, ["onChange"]),
);

function RatingTable({
  title,
  rows,
  values,
  onChange,
  commentLabel,
  commentValue,
  onCommentChange,
  errorPrefix,
  required,
  errorKey,
}) {
  const isCompact = useMediaQuery("(max-width: 900px)");

  return (
    <section style={{ ...styles.card }} data-error-key={errorKey}>
      <h3 style={styles.sectionTitle}>
        {title}
        {required ? <span style={styles.requiredStar}>*</span> : null}
      </h3>
      {isCompact ? (
        <div style={styles.ratingStack}>
          {rows.map((row) => (
            <div key={row.key} style={styles.ratingBlock}>
              <div style={styles.ratingBlockTitle}>{row.label}</div>
              {/* <div style={styles.ratingLegend} aria-hidden="true">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} style={styles.ratingLegendCell}>{n}</div>
                ))}
              </div> */}
              <div style={styles.ratingLegend}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <label
                    key={n}
                    style={{
                      ...styles.ratingChoice,
                      ...(Number(values[row.key]) === n
                        ? styles.ratingChoiceActive
                        : null),
                    }}
                  >
                    <input
                      type="radio"
                      name={`${title}-${row.key}`}
                      value={n}
                      checked={Number(values[row.key]) === n}
                      onChange={() => onChange(row.key, n)}
                      style={styles.radio}
                    />
                    <span style={styles.ratingChoiceNumber}>{n}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,.03)" }}>
                <th style={{ ...styles.headCell, ...styles.firstHeadCell }}>
                  Criterion
                </th>
                {[1, 2, 3, 4, 5].map((n) => (
                  <th key={n} style={styles.headCell}>
                    {n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.key}
                  style={{
                    background: Number(values[row.key])
                      ? "rgba(99,91,255,.03)"
                      : "transparent",
                  }}
                >
                  <td style={styles.rowLabel}>{row.label}</td>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <td
                      key={n}
                      style={{
                        ...styles.ratingCell,
                        background:
                          Number(values[row.key]) === n
                            ? "rgba(99,91,255,.10)"
                            : "transparent",
                      }}
                    >
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name={`${title}-${row.key}`}
                          value={n}
                          checked={Number(values[row.key]) === n}
                          onChange={() => onChange(row.key, n)}
                          style={styles.radio}
                        />
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {errorPrefix &&
        rows.some((row) => row.errorKey && errorPrefix[row.errorKey]) && (
          <div style={styles.error}>
            {rows
              .map((row) => row.errorKey && errorPrefix[row.errorKey])
              .find(Boolean)}
          </div>
        )}
      <label className="fl" style={styles.commentLabel}>
        {commentLabel}
      </label>
      <MemoDebouncedTextarea
        className="fi"
        style={styles.comment}
        value={commentValue}
        onChange={(v) => onCommentChange(v)}
      />
    </section>
  );
}

const MemoRatingTable = React.memo(
  RatingTable,
  (prevProps, nextProps) =>
    arePropsEqualIgnoringKeys(prevProps, nextProps, ["onChange", "onCommentChange"]),
);

const ERROR_ANCHOR_ORDER = [
  "studentInformation.fullname",
  "studentInformation.studentID",
  "studentInformation.degreeProgram",
  "studentInformation.yearOfStudy",
  "studentInformation.internshipStartDate",
  "studentInformation.internshipEndDate",
  "companyInformation.companyName",
  "companyInformation.department",
  "companyInformation.supervisorContact",
  "__group.professionalism",
  "__group.workEthic",
  "__group.technicalSkills",
  "__group.communicationSkills",
  "__group.problemSolvingSkills",
  "__group.overallPerformance",
  "finalRecommendation.finalRating",
  "finalRecommendation.supervisorRecommendation",
  "finalRecommendation.declarationAccepted",
  "finalRecommendation.supervisorFullName",
  "finalRecommendation.date",
  "_form",
];

function getErrorAnchorKey(errorKey) {
  if (errorKey.startsWith("professionalism.")) return "__group.professionalism";
  if (errorKey.startsWith("workEthic.")) return "__group.workEthic";
  if (errorKey.startsWith("technicalSkills.")) return "__group.technicalSkills";
  if (errorKey.startsWith("communicationSkills.")) return "__group.communicationSkills";
  if (errorKey.startsWith("problemSolvingSkills.")) return "__group.problemSolvingSkills";
  if (errorKey.startsWith("overallPerformance.")) return "__group.overallPerformance";
  return errorKey;
}

function focusFirstError(errorMap) {
  const rawKeys = Object.keys(errorMap || {});
  if (!rawKeys.length) return;

  const anchorKeySet = new Set(rawKeys.map(getErrorAnchorKey));
  const firstAnchorKey =
    ERROR_ANCHOR_ORDER.find((key) => anchorKeySet.has(key)) ||
    getErrorAnchorKey(rawKeys[0]);

  const target = document.querySelector(`[data-error-key="${firstAnchorKey}"]`);
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "center" });
  const focusable =
    target.matches("input, textarea, select, button, [tabindex]")
      ? target
      : target.querySelector("input, textarea, select, button, [tabindex]");
  if (focusable && typeof focusable.focus === "function") {
    focusable.focus({ preventScroll: true });
  }
}

export default function PublicEvaluationForm() {
  const [form, setForm] = useState(() => createInitialForm());

  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const [serverError, setServerError] = useState(null);

  const handleAutoFill = useCallback(() => {
    setSuccess(null);
    setServerError(null);
    setErrors({});
    setForm({
      studentInformation: {
        fullname: "Amina Rahman",
        studentID: "SIUT-2026-0142",
        degreeProgram: "Software Engineering",
        yearOfStudy: 3,
        internshipStartDate: "2026-01-12",
        internshipEndDate: "2026-05-08",
      },
      companyInformation: {
        companyName: "FutureTech Labs",
        department: "Product Engineering",
        supervisorContact: "+92 300 1234567",
      },
      professionalism: {
        punctualityAndAttendance: 5,
        dressCodeAndAppearance: 4,
        adherenceToCompanyPolicies: 5,
        comments: "Consistently punctual, professional, and well prepared.",
      },
      workEthic: {
        initiativeAndProactiveness: 5,
        timeManagement: 4,
        abilityToMeetDeadlines: 5,
        comments: "Shows strong ownership and reliably meets deadlines.",
      },
      technicalSkills: {
        applicationOfAcademicKnowledge: 4,
        abilityToLearnNewSkillsTools: 5,
        qualityOfWorkOutput: 4,
        comments: "Quickly adapts to new tools and produces solid work.",
      },
      communicationSkills: {
        verbalCommunication: 4,
        writtenCommunication: 4,
        teamCollaboration: 5,
        comments: "Communicates clearly and works well with the team.",
      },
      problemSolvingSkills: {
        analyticalThinking: 4,
        creativityAndInnovation: 4,
        abilityToHandleChallenges: 5,
        comments: "Approaches blockers calmly and proposes useful solutions.",
      },
      overallPerformance: {
        contributionToTheTeam: 5,
        alignmentWithCompanyGoals: 4,
        potentialForFutureEmployment: 5,
        comments: "A strong candidate for future placement opportunities.",
      },
      openEndedQuestions: {
        strengths: "Reliable, proactive, and eager to learn.",
        areasOfImprovement: "Can continue building deeper domain expertise.",
        projectTaskFeedback: "Completed tasks thoughtfully and with good attention to detail.",
        learningAndGrowth: "Made clear progress throughout the internship.",
        teamDynamics: "Positive impact on team communication and collaboration.",
        adaptability: "Adjusted quickly to changing requirements and tools.",
        feedbackForStudent: "Keep challenging yourself with larger technical tasks.",
        feedbackForUniversity: "Great candidate with strong practical readiness.",
      },
      finalRecommendation: {
        finalRating: "3-4",
        supervisorRecommendation: "recommend-future-opportunities",
        declarationAccepted: true,
        supervisorFullName: "Muhammad Ali",
        date: "2026-05-29",
      },
    });
  }, []);

  const finalRatingOptions = useMemo(
    () => [
      {
        value: "1-2",
        title: "1–2",
        description: "Needs significant improvement",
      },
      { value: "3-4", title: "3–4", description: "Meets expectations" },
      { value: "5", title: "5", description: "Exceeds expectations" },
    ],
    [],
  );

  const recommendationOptions = useMemo(
    () => [
      {
        value: "recommend-future-opportunities",
        title: "Recommend for future opportunities",
        description: "Strong fit for future roles",
      },
      {
        value: "recommend-with-reservations",
        title: "Recommend with reservations",
        description: "Recommend, but with some caveats",
      },
      {
        value: "do-not-recommend",
        title: "Do not recommend",
        description: "Not suitable for future opportunities",
      },
    ],
    [],
  );

  const professionalismRows = useMemo(
    () => [
      {
        key: "punctualityAndAttendance",
        label: "Punctuality and attendance",
      },
      {
        key: "dressCodeAndAppearance",
        label: "Dress code and appearance",
      },
      {
        key: "adherenceToCompanyPolicies",
        label: "Adherence to company policies",
      },
    ],
    [],
  );

  const workEthicRows = useMemo(
    () => [
      {
        key: "initiativeAndProactiveness",
        label: "Initiative and proactiveness",
      },
      { key: "timeManagement", label: "Time management" },
      {
        key: "abilityToMeetDeadlines",
        label: "Ability to meet deadlines",
      },
    ],
    [],
  );

  const technicalSkillsRows = useMemo(
    () => [
      {
        key: "applicationOfAcademicKnowledge",
        label: "Application of academic knowledge",
      },
      {
        key: "abilityToLearnNewSkillsTools",
        label: "Ability to learn new skills/tools",
      },
      { key: "qualityOfWorkOutput", label: "Quality of work output" },
    ],
    [],
  );

  const communicationSkillsRows = useMemo(
    () => [
      { key: "verbalCommunication", label: "Verbal communication" },
      { key: "writtenCommunication", label: "Written communication" },
      { key: "teamCollaboration", label: "Team collaboration" },
    ],
    [],
  );

  const problemSolvingSkillsRows = useMemo(
    () => [
      { key: "analyticalThinking", label: "Analytical thinking" },
      {
        key: "creativityAndInnovation",
        label: "Creativity and innovation",
      },
      {
        key: "abilityToHandleChallenges",
        label: "Ability to handle challenges",
      },
    ],
    [],
  );

  const overallPerformanceRows = useMemo(
    () => [
      {
        key: "contributionToTheTeam",
        label: "Contribution to the team",
      },
      {
        key: "alignmentWithCompanyGoals",
        label: "Alignment with company goals",
      },
      {
        key: "potentialForFutureEmployment",
        label: "Potential for future employment",
      },
    ],
    [],
  );

  const professionalismErrors = useMemo(
    () => ({
      punctualityAndAttendance: errors["professionalism.punctualityAndAttendance"],
      dressCodeAndAppearance: errors["professionalism.dressCodeAndAppearance"],
      adherenceToCompanyPolicies:
        errors["professionalism.adherenceToCompanyPolicies"],
    }),
    [errors],
  );

  const workEthicErrors = useMemo(
    () => ({
      initiativeAndProactiveness:
        errors["workEthic.initiativeAndProactiveness"],
      timeManagement: errors["workEthic.timeManagement"],
      abilityToMeetDeadlines: errors["workEthic.abilityToMeetDeadlines"],
    }),
    [errors],
  );

  const technicalSkillsErrors = useMemo(
    () => ({
      applicationOfAcademicKnowledge:
        errors["technicalSkills.applicationOfAcademicKnowledge"],
      abilityToLearnNewSkillsTools:
        errors["technicalSkills.abilityToLearnNewSkillsTools"],
      qualityOfWorkOutput: errors["technicalSkills.qualityOfWorkOutput"],
    }),
    [errors],
  );

  const communicationSkillsErrors = useMemo(
    () => ({
      verbalCommunication: errors["communicationSkills.verbalCommunication"],
      writtenCommunication: errors["communicationSkills.writtenCommunication"],
      teamCollaboration: errors["communicationSkills.teamCollaboration"],
    }),
    [errors],
  );

  const problemSolvingSkillsErrors = useMemo(
    () => ({
      analyticalThinking: errors["problemSolvingSkills.analyticalThinking"],
      creativityAndInnovation:
        errors["problemSolvingSkills.creativityAndInnovation"],
      abilityToHandleChallenges:
        errors["problemSolvingSkills.abilityToHandleChallenges"],
    }),
    [errors],
  );

  const overallPerformanceErrors = useMemo(
    () => ({
      contributionToTheTeam: errors["overallPerformance.contributionToTheTeam"],
      alignmentWithCompanyGoals:
        errors["overallPerformance.alignmentWithCompanyGoals"],
      potentialForFutureEmployment:
        errors["overallPerformance.potentialForFutureEmployment"],
    }),
    [errors],
  );

  const setPath = useCallback((path, value) => {
    const parts = path.split(".");
    setForm((current) => updateNestedValue(current, parts, value));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setServerError(null);
    try {
      const parsed = InternshipEvaluationSchema.parse(form);
      setErrors({});
      setSending(true);
      await postEvaluation(parsed);
      setSuccess("Evaluation submitted successfully.");
    } catch (err) {
      if (err?.issues) {
        const map = {};
        err.issues.forEach((it) => {
          const key = it.path.join(".") || "_form";
          map[key] = it.message;
        });
        setErrors(map);
        setTimeout(() => focusFirstError(map), 0);
      } else {
        setServerError(err.message || String(err));
      }
    } finally {
      setSending(false);
    }
  }, [form]);

  if (success) {
    return (
      <div className="pp">
        <div style={styles.page}>
          <div style={styles.successShell}>
            <div style={styles.successCard}>
              <div style={styles.successGlow} />
              <div style={styles.successBadge}>Success</div>
              <div style={styles.successMark}>✓</div>
              <h1 style={styles.successTitle}>Your evaluation was submitted.</h1>
              <p style={styles.successText}>
                Thank you. The student internship evaluation has been received and saved successfully.
              </p>

              <div style={styles.successMeta}>
                <div style={styles.successMetaItem}>
                  <span style={styles.successMetaLabel}>Status</span>
                  <div style={styles.successMetaValue}>Completed</div>
                </div>
                <div style={styles.successMetaItem}>
                  <span style={styles.successMetaLabel}>Next step</span>
                  <div style={styles.successMetaValue}>You may close this page</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pp">
      <div style={styles.page}>
        <div style={styles.hero}>
          <div style={styles.badge}>Student evaluation form</div>
          <h1 style={styles.title}>Student Internship Evaluation</h1>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <section style={styles.card}>
            <h3 style={styles.sectionTitle}>Student Information</h3>
            <div style={styles.field} data-error-key="studentInformation.fullname">
              <RequiredLabel>Full Name</RequiredLabel>
              <MemoDebouncedInput
                className="fi"
                value={form.studentInformation.fullname}
                onChange={(v) => setPath("studentInformation.fullname", v)}
              />
              {errors["studentInformation.fullname"] && (
                <div style={{ color: "red" }}>
                  {errors["studentInformation.fullname"]}
                </div>
              )}
            </div>

            <div style={styles.field} data-error-key="studentInformation.studentID">
              <RequiredLabel>Student ID</RequiredLabel>
              <MemoDebouncedInput
                className="fi"
                value={form.studentInformation.studentID}
                onChange={(v) => setPath("studentInformation.studentID", v)}
              />
              {errors["studentInformation.studentID"] && (
                <div style={{ color: "red" }}>
                  {errors["studentInformation.studentID"]}
                </div>
              )}
            </div>

            <div style={styles.field} data-error-key="studentInformation.degreeProgram">
              <RequiredLabel>Degree Program</RequiredLabel>
              <MemoDebouncedInput
                className="fi"
                value={form.studentInformation.degreeProgram}
                onChange={(v) => setPath("studentInformation.degreeProgram", v)}
              />
              {errors["studentInformation.degreeProgram"] && (
                <div style={{ color: "red" }}>
                  {errors["studentInformation.degreeProgram"]}
                </div>
              )}
            </div>

            <div style={styles.field} data-error-key="studentInformation.yearOfStudy">
              <RequiredLabel>Year of Study</RequiredLabel>
              <MemoDebouncedInput
                type="number"
                className="fi"
                value={form.studentInformation.yearOfStudy}
                onChange={(v) =>
                  setPath("studentInformation.yearOfStudy", Number(v || 0))
                }
              />
              {errors["studentInformation.yearOfStudy"] && (
                <div style={{ color: "red" }}>
                  {errors["studentInformation.yearOfStudy"]}
                </div>
              )}
            </div>

            <MemoFancyDateField
              label="Internship Start Date"
              required
              errorKey="studentInformation.internshipStartDate"
              value={form.studentInformation.internshipStartDate}
              onChange={(nextValue) =>
                setPath("studentInformation.internshipStartDate", nextValue)
              }
              hint="Pick the first day of the internship period."
              error={errors["studentInformation.internshipStartDate"]}
            />

            <MemoFancyDateField
              label="Internship End Date"
              required
              errorKey="studentInformation.internshipEndDate"
              value={form.studentInformation.internshipEndDate}
              onChange={(nextValue) =>
                setPath("studentInformation.internshipEndDate", nextValue)
              }
              hint="Pick the last day of the internship period."
              error={errors["studentInformation.internshipEndDate"]}
            />
          </section>

          <section style={styles.card}>
            <h3 style={styles.sectionTitle}>Company Information</h3>
            <div style={styles.field} data-error-key="companyInformation.companyName">
              <RequiredLabel>Company Name</RequiredLabel>
              <MemoDebouncedInput
                className="fi"
                value={form.companyInformation.companyName}
                onChange={(v) => setPath("companyInformation.companyName", v)}
              />
              {errors["companyInformation.companyName"] && (
                <div style={{ color: "red" }}>
                  {errors["companyInformation.companyName"]}
                </div>
              )}
            </div>

            <div style={styles.field} data-error-key="companyInformation.department">
              <RequiredLabel>Department</RequiredLabel>
              <MemoDebouncedInput
                className="fi"
                value={form.companyInformation.department}
                onChange={(v) => setPath("companyInformation.department", v)}
              />
              {errors["companyInformation.department"] && (
                <div style={{ color: "red" }}>
                  {errors["companyInformation.department"]}
                </div>
              )}
            </div>

            <div style={styles.fieldLast} data-error-key="companyInformation.supervisorContact">
              <RequiredLabel>Supervisor Contact</RequiredLabel>
              <MemoDebouncedInput
                className="fi"
                value={form.companyInformation.supervisorContact}
                onChange={(v) =>
                  setPath("companyInformation.supervisorContact", v)
                }
              />
              {errors["companyInformation.supervisorContact"] && (
                <div style={{ color: "red" }}>
                  {errors["companyInformation.supervisorContact"]}
                </div>
              )}
            </div>
          </section>

          <section style={styles.card}>
            <h3 style={styles.sectionTitle}>Evaluation Criteria</h3>
            <p style={{ color: "var(--t2)" }}>
              1 = Poor, 2 = Below Average, 3 = Satisfactory, 4 = Good, 5 =
              Excellent
            </p>
            <MemoRatingTable
              title="Professionalism"
              required
              errorKey="__group.professionalism"
              rows={professionalismRows}
              values={form.professionalism}
              onChange={(key, value) =>
                setPath(`professionalism.${key}`, value)
              }
              commentLabel="Comments on professionalism"
              commentValue={form.professionalism.comments}
              onCommentChange={(value) =>
                setPath("professionalism.comments", value)
              }
              errorPrefix={professionalismErrors}
            />

            <MemoRatingTable
              title="Work Ethic"
              required
              errorKey="__group.workEthic"
              rows={workEthicRows}
              values={form.workEthic}
              onChange={(key, value) => setPath(`workEthic.${key}`, value)}
              commentLabel="Comment on work ethic"
              commentValue={form.workEthic.comments}
              onCommentChange={(value) => setPath("workEthic.comments", value)}
              errorPrefix={workEthicErrors}
            />

            <MemoRatingTable
              title="Technical Skills"
              required
              errorKey="__group.technicalSkills"
              rows={technicalSkillsRows}
              values={form.technicalSkills}
              onChange={(key, value) =>
                setPath(`technicalSkills.${key}`, value)
              }
              commentLabel="Comments on technical skills"
              commentValue={form.technicalSkills.comments}
              onCommentChange={(value) =>
                setPath("technicalSkills.comments", value)
              }
              errorPrefix={technicalSkillsErrors}
            />

            <MemoRatingTable
              title="Communication Skills"
              required
              errorKey="__group.communicationSkills"
              rows={communicationSkillsRows}
              values={form.communicationSkills}
              onChange={(key, value) =>
                setPath(`communicationSkills.${key}`, value)
              }
              commentLabel="Comments on communication skills"
              commentValue={form.communicationSkills.comments}
              onCommentChange={(value) =>
                setPath("communicationSkills.comments", value)
              }
              errorPrefix={communicationSkillsErrors}
            />

            <MemoRatingTable
              title="Problem-Solving Skills"
              required
              errorKey="__group.problemSolvingSkills"
              rows={problemSolvingSkillsRows}
              values={form.problemSolvingSkills}
              onChange={(key, value) =>
                setPath(`problemSolvingSkills.${key}`, value)
              }
              commentLabel="Comments on problem-solving skills"
              commentValue={form.problemSolvingSkills.comments}
              onCommentChange={(value) =>
                setPath("problemSolvingSkills.comments", value)
              }
              errorPrefix={problemSolvingSkillsErrors}
            />

            <MemoRatingTable
              title="Overall Performance"
              required
              errorKey="__group.overallPerformance"
              rows={overallPerformanceRows}
              values={form.overallPerformance}
              onChange={(key, value) =>
                setPath(`overallPerformance.${key}`, value)
              }
              commentLabel="Comments on overall performance"
              commentValue={form.overallPerformance.comments}
              onCommentChange={(value) =>
                setPath("overallPerformance.comments", value)
              }
              errorPrefix={overallPerformanceErrors}
            />
          </section>

          <section style={styles.card}>
            <h3 style={styles.sectionTitle}>Open-Ended Questions</h3>
            <p style={{ color: "var(--t2)" }}>
              Optional but helpful for additional context.
            </p>
            <div style={styles.field}>
              <label className="fl">Strengths</label>
              <MemoDebouncedTextarea
                className="fi"
                value={form.openEndedQuestions.strengths || ""}
                onChange={(v) => setPath("openEndedQuestions.strengths", v)}
              />
            </div>
            <div style={styles.fieldLast}>
              <label className="fl">Areas of improvement</label>
              <MemoDebouncedTextarea
                className="fi"
                value={form.openEndedQuestions.areasOfImprovement || ""}
                onChange={(v) =>
                  setPath("openEndedQuestions.areasOfImprovement", v)
                }
              />
            </div>
            <div style={styles.field}>
              <label className="fl">Project Task Feedback</label>
              <MemoDebouncedTextarea
                className="fi"
                value={form.openEndedQuestions.projectTaskFeedback || ""}
                onChange={(v) =>
                  setPath("openEndedQuestions.projectTaskFeedback", v)
                }
              />
            </div>
            <div style={styles.field}>
              <label className="fl">Learning and Growth</label>
              <MemoDebouncedTextarea
                className="fi"
                value={form.openEndedQuestions.learningAndGrowth || ""}
                onChange={(v) =>
                  setPath("openEndedQuestions.learningAndGrowth", v)
                }
              />
            </div>
            <div style={styles.field}>
              <label className="fl">Team Dynamics</label>
              <MemoDebouncedTextarea
                className="fi"
                value={form.openEndedQuestions.teamDynamics || ""}
                onChange={(v) => setPath("openEndedQuestions.teamDynamics", v)}
              />
            </div>
            <div style={styles.field}>
              <label className="fl">Adaptability</label>
              <MemoDebouncedTextarea
                className="fi"
                value={form.openEndedQuestions.adaptability || ""}
                onChange={(v) => setPath("openEndedQuestions.adaptability", v)}
              />
            </div>
            <div style={styles.field}>
              <label className="fl">Feedback for Student</label>
              <MemoDebouncedTextarea
                className="fi"
                value={form.openEndedQuestions.feedbackForStudent || ""}
                onChange={(v) =>
                  setPath("openEndedQuestions.feedbackForStudent", v)
                }
              />
            </div>
            <div style={styles.fieldLast}>
              <label className="fl">Feedback for University</label>
              <MemoDebouncedTextarea
                className="fi"
                value={form.openEndedQuestions.feedbackForUniversity || ""}
                onChange={(v) =>
                  setPath("openEndedQuestions.feedbackForUniversity", v)
                }
              />
            </div>
          </section>

          <section style={styles.card, { marginBottom: 0 }}>
            <h3 style={styles.sectionTitle}>Final Recommendation</h3>
            <MemoFancySelect
              label="Final Rating"
              required
              errorKey="finalRecommendation.finalRating"
              value={form.finalRecommendation.finalRating}
              onChange={(nextValue) =>
                setPath("finalRecommendation.finalRating", nextValue)
              }
              options={finalRatingOptions}
              placeholder="Choose a rating"
              hint="Select one of the three summary bands for the internship outcome."
              error={errors["finalRecommendation.finalRating"]}
            />

            <MemoFancySelect
              label="Supervisor’s Recommendation"
              required
              errorKey="finalRecommendation.supervisorRecommendation"
              value={form.finalRecommendation.supervisorRecommendation}
              onChange={(nextValue) =>
                setPath(
                  "finalRecommendation.supervisorRecommendation",
                  nextValue,
                )
              }
              options={recommendationOptions}
              placeholder="Choose a recommendation"
              hint="Pick the recommendation that best matches the student's performance."
              error={errors["finalRecommendation.supervisorRecommendation"]}
            />

            <div style={styles.field} data-error-key="finalRecommendation.declarationAccepted">
              <RequiredLabel>
                Declaration: By entering my name below and submitting this form,
                I confirm that this evaluation is accurate and complete.
              </RequiredLabel>
              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  paddingTop: 6,
                  fontWeight: 600,
                  color: "var(--t1)",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!form.finalRecommendation.declarationAccepted}
                  onChange={(e) =>
                    setPath(
                      "finalRecommendation.declarationAccepted",
                      e.target.checked,
                    )
                  }
                />
                I agree
              </label>
            </div>

            <div style={styles.field} data-error-key="finalRecommendation.supervisorFullName">
              <RequiredLabel>Supervisor's Full Name</RequiredLabel>
              <MemoDebouncedInput
                className="fi"
                value={form.finalRecommendation.supervisorFullName}
                onChange={(v) =>
                  setPath("finalRecommendation.supervisorFullName", v)
                }
              />
            </div>

            <div style={styles.fieldLast} data-error-key="finalRecommendation.date">
              <FancyDateField
                label="Date"
                required
                errorKey="finalRecommendation.date"
                value={form.finalRecommendation.date}
                onChange={(nextValue) =>
                  setPath("finalRecommendation.date", nextValue)
                }
                hint="Use the date when the evaluation was completed."
                error={errors["finalRecommendation.date"]}
              />
            </div>
          </section>

          {serverError && <div style={styles.statusError}>{serverError}</div>}
          {success && <div style={styles.statusSuccess}>{success}</div>}

          <div style={styles.actions}>
            <button className="bg" type="button" onClick={handleAutoFill}>
              Autofill
            </button>
            <button className="bp" type="submit" disabled={sending}>
              {sending ? "Submitting…" : "Submit Evaluation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
