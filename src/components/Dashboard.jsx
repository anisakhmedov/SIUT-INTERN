import React, { useState, useEffect, useCallback } from "react";
import { del, get } from "../utils/apiClient";
import { toast } from "../utils/toast";
import PageState from './PageState';

const clampProgress = (value) =>
  Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

const hasReportContent = (day) => {
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
};

const calculateProgressFromDays = (days) => {
  const dayList = Array.isArray(days) ? days : [];
  if (dayList.length === 0) return null;

  const reported = dayList.filter((day) => hasReportContent(day)).length;
  return clampProgress(Math.round((reported / dayList.length) * 100));
};

const parseProgressValue = (value) => {
  if (typeof value === "number" && Number.isFinite(value))
    return clampProgress(Math.round(value));
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace("%", "").trim());
    if (Number.isFinite(parsed)) return clampProgress(Math.round(parsed));
  }
  return null;
};

const normalizeStatus = (status) => {
  const raw = String(status || "").trim().toLowerCase();
  if (raw === "completed") return "Completed";
  if (raw === "in progress" || raw === "active") return "In Progress";
  return "Pending";
};

const extractDateRange = (faculty) => {
  const duration = faculty?.duration;

  if (duration && typeof duration === "object") {
    return {
      start: duration.start || duration.startDate || faculty?.startDate || "",
      end: duration.end || duration.endDate || faculty?.endDate || "",
      durationText: "",
    };
  }

  const durationText = typeof duration === "string" ? duration.trim() : "";

  if (faculty?.startDate || faculty?.endDate) {
    return {
      start: faculty?.startDate || "",
      end: faculty?.endDate || "",
      durationText,
    };
  }

  if (durationText) {
    const matches = durationText.match(
      /\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\.\d{1,2}\.\d{4}\b/g,
    );

    if (matches && matches.length >= 2) {
      return {
        start: matches[0],
        end: matches[1],
        durationText,
      };
    }
  }

  return { start: "", end: "", durationText };
};

const parseDateValue = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const numericDate = new Date(value);
    return Number.isNaN(numericDate.getTime()) ? null : numericDate;
  }

  const raw = String(value).trim();
  if (!raw) return null;

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const localMatch = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (localMatch) {
    const [, day, month, year] = localMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateValue = (value) => {
  const parsed = parseDateValue(value);
  if (!parsed) return "";

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}.${month}.${year}`;
};

const SORT_LABELS = {
  "default": "Default",
  "name-asc": "Name A→Z",
  "name-desc": "Name Z→A",
  "progress-asc": "Progress ↑",
  "progress-desc": "Progress ↓",
  "date-newest": "Date (Newest)",
  "date-oldest": "Date (Oldest)",
};

export default function Dashboard({ onNewFaculty, onView, search = "", user = null }) {
  const [faculties, setFaculties] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [loading, setLoading] = useState(true);

  // Filter state
  const [localSearch, setLocalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getFacultyId = (faculty) => faculty?._id ?? faculty?.id ?? null;

  const normalizeIdentityValue = (value) => String(value || "").trim().toLowerCase();

  const collectTutorEntries = (value) => {
    if (Array.isArray(value)) {
      return value.flatMap(collectTutorEntries);
    }

    if (!value) return [];

    return [value];
  };

  const getTutorIdentityValues = (tutor) => {
    if (!tutor) return [];

    if (typeof tutor === "string") {
      const trimmed = tutor.trim();
      return trimmed ? [trimmed] : [];
    }

    return [
      tutor._id,
      tutor.id,
      tutor.userId,
      tutor.login,
      tutor.email,
    ].filter(Boolean);
  };

  const getTutorDisplayLabel = (tutor) => {
    if (!tutor) return "";

    if (typeof tutor === "string") {
      const linkedUser = usersById[tutor];
      if (linkedUser) {
        const linkedName = [
          linkedUser.name,
          linkedUser.surname,
          linkedUser.lastname,
        ]
          .filter(Boolean)
          .join(" ")
          .trim();
        if (linkedName) return linkedName;
        if (linkedUser.login) return linkedUser.login;
      }

      return tutor.trim();
    }

    const fullName = [tutor.name, tutor.surname, tutor.lastname]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (fullName) return fullName;
    if (tutor.login) return tutor.login;
    if (tutor.email) return tutor.email;
    if (tutor._id) return String(tutor._id);
    if (tutor.id) return String(tutor.id);

    return "";
  };

  const getFacultyTutors = (faculty) => {
    const tutors = [];
    const seen = new Set();

    [
      faculty?.tutorIDs,
      faculty?.tutors,
      faculty?.tutorID,
      faculty?.tutor,
      faculty?.supervisor,
    ]
      .flatMap(collectTutorEntries)
      .forEach((tutor) => {
        const identityKey = normalizeIdentityValue(
          typeof tutor === "string"
            ? tutor
            : tutor?._id || tutor?.id || tutor?.userId || tutor?.login || tutor?.email,
        );

        if (!identityKey || seen.has(identityKey)) return;
        seen.add(identityKey);
        tutors.push(tutor);
      });

    return tutors;
  };

  const getFacultyTutorIds = (faculty) => {
    const ids = new Set();

    getFacultyTutors(faculty).forEach((tutor) => {
      getTutorIdentityValues(tutor).forEach((identityValue) => {
        const normalized = normalizeIdentityValue(identityValue);
        if (normalized) ids.add(normalized);
      });
    });

    return Array.from(ids);
  };

  const getFacultyTutorLabels = (faculty) => {
    const labels = [];
    const seen = new Set();

    getFacultyTutors(faculty).forEach((tutor) => {
      const label = getTutorDisplayLabel(tutor).trim();
      const normalized = normalizeIdentityValue(label);
      if (!label || seen.has(normalized)) return;
      seen.add(normalized);
      labels.push(label);
    });

    return labels;
  };

  const getSupervisorLabel = (faculty) => {
    const tutorLabels = getFacultyTutorLabels(faculty);
    if (tutorLabels.length > 0) return tutorLabels.join(", ");

    const tutorName = [faculty?.tutorName, faculty?.supervisorName]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (tutorName) return tutorName;

    return "Not assigned";
  };

  const getSupervisorRecord = (faculty) => {
    const tutor = getFacultyTutors(faculty)[0];

    if (tutor && typeof tutor === "object") return tutor;

    if (typeof tutor === "string" && tutor.trim()) {
      return usersById[tutor] || null;
    }

    return null;
  };

  const getSupervisorContact = (faculty) => {
    const supervisorRecord = getSupervisorRecord(faculty);

    if (supervisorRecord) {
      return (
        supervisorRecord.phone ||
        supervisorRecord.email ||
        supervisorRecord.login ||
        "N/A"
      );
    }

    return faculty?.tutorContact || faculty?.supervisorContact || "N/A";
  };

  const getSupervisorInitials = (faculty) => {
    const tutorLabels = getFacultyTutorLabels(faculty);
    const supervisorLabel = tutorLabels[0] || getSupervisorLabel(faculty);
    if (!supervisorLabel || supervisorLabel === "Not assigned") return "U";

    return supervisorLabel
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";
  };

  const getWhenLabel = (faculty) => {
    const { start, end, durationText } = extractDateRange(faculty);
    const formattedStart = formatDateValue(start);
    const formattedEnd = formatDateValue(end);

    if (formattedStart && formattedEnd) return `${formattedStart} - ${formattedEnd}`;
    if (formattedStart || formattedEnd) return formattedStart || formattedEnd;
    return durationText || "N/A";
  };

  const getDurationLabel = (faculty) => {
    const { start, end, durationText } = extractDateRange(faculty);
    const startDate = parseDateValue(start);
    const endDate = parseDateValue(end);

    if (!startDate || !endDate) return durationText || "N/A";

    const diffMs = endDate.getTime() - startDate.getTime();
    const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);
    return `${days} day${days === 1 ? "" : "s"}`;
  };

  const getYandexMapUrl = (faculty) => {
    const coordsRaw = faculty?.locationYmaps;
    const coords = Array.isArray(coordsRaw)
      ? coordsRaw
      : Array.isArray(coordsRaw?.coords)
        ? coordsRaw.coords
        : null;

    if (Array.isArray(coords) && coords.length === 2) {
      const lat = Number(coords[0]);
      const lng = Number(coords[1]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return `https://yandex.com/maps/?pt=${lng},${lat}&z=15&l=map`;
      }
    }

    const locationText = (faculty?.location || "").trim();
    if (!locationText) return null;
    return `https://yandex.com/maps/?text=${encodeURIComponent(locationText)}`;
  };

  const getShortProgress = (faculty) => {
    const fromDays = calculateProgressFromDays(faculty?.days);
    if (fromDays != null) return fromDays;

    const fromStored = parseProgressValue(faculty?.progressAll);
    if (fromStored != null) return fromStored;

    return 0;
  };

  // Unique companies for filter dropdown
  const uniqueCompanies = [...new Set(faculties.map(f => f.company).filter(Boolean))].sort();

  const hasActiveFilters = Boolean(
    localSearch || statusFilter !== "all" || companyFilter !== "all" ||
    sortBy !== "default" || dateFrom || dateTo
  );

  const clearAllFilters = () => {
    setLocalSearch("");
    setStatusFilter("all");
    setCompanyFilter("all");
    setSortBy("default");
    setDateFrom("");
    setDateTo("");
  };

  // Combined search: local takes precedence, falls back to external prop
  const activeSearch = localSearch || search;

  // Filter + sort faculties
  let filteredFaculties = faculties.filter((faculty, index) => {
    const userRole = String(user?.role || '').trim().toLowerCase();

    if (userRole === 'tutor') {
        const userIds = [
          user?._id,
          user?.id,
          user?.userId,
          user?.login,
          user?.email,
        ].map((id) => normalizeIdentityValue(id)).filter(Boolean);

        const facultyTutorIds = getFacultyTutorIds(faculty);

        if (index === 0) {
          console.log('[Dashboard] Tutor filter debug:', {
            userIds,
            facultyTutorIds,
            hasMatch: userIds.some(uid => facultyTutorIds.includes(uid)),
            tutors: getFacultyTutors(faculty),
          });
        }

        if (!userIds.some(uid => facultyTutorIds.includes(uid))) return false;
    }

    // Text search
    if (activeSearch) {
      const searchLower = activeSearch.toLowerCase();
      if (!(
        faculty.name?.toLowerCase().includes(searchLower) ||
        faculty.company?.toLowerCase().includes(searchLower) ||
        faculty.location?.toLowerCase().includes(searchLower) ||
        faculty.plan?.toLowerCase().includes(searchLower)
      )) return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      if (normalizeStatus(faculty.status) !== statusFilter) return false;
    }

    // Company filter
    if (companyFilter !== "all") {
      if ((faculty.company || "") !== companyFilter) return false;
    }

    // Date range filter (by start date)
    if (dateFrom || dateTo) {
      const { start } = extractDateRange(faculty);
      const startDate = parseDateValue(start);
      if (dateFrom) {
        const fromDate = parseDateValue(dateFrom);
        if (!startDate || !fromDate || startDate < fromDate) return false;
      }
      if (dateTo) {
        const toDate = parseDateValue(dateTo);
        if (!startDate || !toDate || startDate > toDate) return false;
      }
    }

    return true;
  });

  // Sorting
  if (sortBy !== "default") {
    filteredFaculties = [...filteredFaculties].sort((a, b) => {
      if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "name-desc") return (b.name || "").localeCompare(a.name || "");
      if (sortBy === "progress-asc") return getShortProgress(a) - getShortProgress(b);
      if (sortBy === "progress-desc") return getShortProgress(b) - getShortProgress(a);
      if (sortBy === "date-newest") {
        const aDate = parseDateValue(extractDateRange(a).start);
        const bDate = parseDateValue(extractDateRange(b).start);
        return (bDate?.getTime() || 0) - (aDate?.getTime() || 0);
      }
      if (sortBy === "date-oldest") {
        const aDate = parseDateValue(extractDateRange(a).start);
        const bDate = parseDateValue(extractDateRange(b).start);
        return (aDate?.getTime() || 0) - (bDate?.getTime() || 0);
      }
      return 0;
    });
  }

  // Completed = 100% OR status "Completed"; others don't overlap
  const completedFaculties = filteredFaculties.filter(f =>
    getShortProgress(f) === 100 || normalizeStatus(f.status) === "Completed"
  );
  const inProgressFaculties = filteredFaculties.filter(f => {
    if (getShortProgress(f) === 100 || normalizeStatus(f.status) === "Completed") return false;
    const p = getShortProgress(f);
    return (p > 0 && p < 100) || normalizeStatus(f.status) === "In Progress";
  });
  const notStartedFaculties = filteredFaculties.filter(f => {
    const s = normalizeStatus(f.status);
    const p = getShortProgress(f);
    return p === 0 && s !== "Completed" && s !== "In Progress";
  });

  const fetchFaculties = useCallback(async () => {
    try {
      setLoading(true);
      const canReadUsers = String(user?.role || '').toLowerCase() === 'admin';

      const [facultyResponse, usersResponse] = await Promise.allSettled([
        get("/faculty"),
        canReadUsers ? get("/usersInternship") : Promise.resolve([]),
      ]);

      if (facultyResponse.status === "fulfilled") {
        setFaculties(
          Array.isArray(facultyResponse.value) ? facultyResponse.value : [],
        );
      } else {
        throw facultyResponse.reason;
      }

      if (usersResponse.status === "fulfilled") {
        const usersRaw = usersResponse.value;
        const users = Array.isArray(usersRaw) ? usersRaw : usersRaw?.data || [];
        const mappedUsers = users.reduce((acc, user) => {
          const userId = String(user?._id ?? user?.id ?? "");
          if (userId) acc[userId] = user;
          return acc;
        }, {});
        setUsersById(mappedUsers);
      } else {
        setUsersById({});
      }
    } catch (err) {
      toast.error(err?.message || "Failed to load internships.");
      console.error("Error fetching faculties:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchFaculties();
  }, [fetchFaculties]);

  const removeFaculty = async (id) => {
    if (!window.confirm("Are you sure you want to delete this internship?"))
      return;
    try {
      await del(`/faculty/${id}`);
      setFaculties((prevFaculties) =>
        prevFaculties.filter((f) => String(getFacultyId(f)) !== String(id)),
      );
      toast.success("Internship deleted.");
    } catch (err) {
      toast.error("Failed to delete internship.");
      console.error("Delete error:", err);
    }
  };

  const renderCard = (faculty, index) => {
    const facultyId = getFacultyId(faculty) ?? `row-${index}`;
    const shortProgress = getShortProgress(faculty);
    const progressHue = Math.round((shortProgress / 100) * 120);
    const normalizedStatus = normalizeStatus(faculty.status);
    const tutorLabels = getFacultyTutorLabels(faculty);
    const hasMultipleTutors = tutorLabels.length > 1;
    const tutorLabelText = hasMultipleTutors
      ? `${tutorLabels.length} tutors appended`
      : getSupervisorLabel(faculty);
    const statusClass =
      normalizedStatus === "Pending"
        ? "dw-card-badge--pending"
        : normalizedStatus === "In Progress"
          ? "dw-card-badge--progress"
          : "dw-card-badge--completed";

    return (
      <li key={facultyId}>
        <article className="dw-card">
          <div
            role="button"
            tabIndex={0}
            className="dw-card-click"
            onClick={() => { if (facultyId) onView(facultyId); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (facultyId) onView(facultyId);
              }
            }}
          >
            <div className="dw-card-body">
              <h3 className="dw-card-title">{faculty.name}</h3>
              {normalizedStatus && (
                <span className={`dw-card-badge ${statusClass}`}>
                  {normalizedStatus}
                </span>
              )}
              <div className="dw-card-meta">
                <span>{faculty.company || "No company"}</span>
                {normalizedStatus && (
                  <>
                    <div className="dw-card-meta-divider"></div>
                    <span>{normalizedStatus}</span>
                  </>
                )}
              </div>
              <div className="dw-card-row">
                Who:
                {hasMultipleTutors ? (
                  <strong style={{ display: 'block', marginTop: '4px' }}>
                    {tutorLabelText}
                  </strong>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: 'linear-gradient(135deg,#635bff,#06c9a0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Syne',
                        fontWeight: 700,
                        color: '#fff',
                        fontSize: 11,
                        flexShrink: 0,
                      }}
                    >
                      {getSupervisorInitials(faculty)}
                    </div>
                    <strong>{tutorLabelText}</strong>
                  </div>
                )}
              </div>
              <div className="dw-card-row">
                Where:
                {getYandexMapUrl(faculty) && (
                  <a
                    href={getYandexMapUrl(faculty)}
                    target="_blank"
                    rel="noreferrer"
                    className="dw-map-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Link
                  </a>
                )}
              </div>
              <div className="dw-card-row">
                <span>When:</span> <strong>{getWhenLabel(faculty)}</strong>
              </div>
              <div className="dw-card-row">
                <span>How long:</span> <strong>{getDurationLabel(faculty)}</strong>
              </div>
              <div className="dw-card-row">
                Contact: <strong>{getSupervisorContact(faculty)}</strong>
              </div>
              <div
                className="dw-progress"
                aria-label={`Progress ${shortProgress}%`}
              >
                <div className="dw-progress-top">
                  <span className="dw-progress-label">Progress:</span>
                  <span
                    className="dw-progress-value"
                    style={{
                      color: `hsl(${progressHue} 76% 30%)`,
                      borderColor: `hsla(${progressHue}, 75%, 45%, .35)`,
                      background: `linear-gradient(135deg, hsla(${Math.max(0, progressHue - 25)}, 95%, 92%, .95), hsla(${Math.min(120, progressHue + 20)}, 95%, 88%, .95))`,
                    }}
                  >
                    {shortProgress}%
                  </span>
                </div>
                <div className="dw-progress-track">
                  <div
                    className="dw-progress-fill"
                    style={{
                      width: `${shortProgress}%`,
                      background: `linear-gradient(90deg, hsl(${Math.max(0, progressHue - 24)} 82% 56%), hsl(${Math.min(120, progressHue + 12)} 80% 44%))`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="dw-card-footer">
            <button
              type="button"
              className="dw-card-open"
              onClick={() => { if (facultyId) onView(facultyId); }}
            >
              View Details
            </button>
            {(['admin', 'developer'].includes(String(user?.role || '').toLowerCase())) && (
              <button
                type="button"
                className="dw-btn-icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (facultyId) removeFaculty(facultyId);
                }}
                title="Delete internship"
                aria-label="Delete internship"
              >
                ×
              </button>
            )}
          </div>
        </article>
      </li>
    );
  };

  const renderSection = (title, sectionFaculties, accentColor, iconPath) => {
    if (sectionFaculties.length === 0) return null;
    return (
      <section className="dw-section" key={title}>
        <div className="dw-section-header" style={{ '--sec-color': accentColor }}>
          <div className="dw-section-icon-wrap" style={{ background: `${accentColor}18` }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d={iconPath} fill={accentColor} />
            </svg>
          </div>
          <span className="dw-section-title">{title}</span>
          <span className="dw-section-badge" style={{ background: `${accentColor}18`, color: accentColor }}>
            {sectionFaculties.length}
          </span>
        </div>
        <ul className="dw-list" aria-label={`${title} internships`}>
          {sectionFaculties.map((f, i) => renderCard(f, i))}
        </ul>
      </section>
    );
  };

  return (
    <div className="dw-page">
      <style>{`
        .dw-page {
          min-height: calc(100vh - 64px);
          padding: clamp(20px, 4vw, 48px);
          background:
            radial-gradient(1400px 700px at 5% -10%, rgba(99,91,255,.12), transparent 55%),
            radial-gradient(1000px 600px at 95% 5%, rgba(6,201,160,.12), transparent 65%),
            radial-gradient(800px 500px at 50% 100%, rgba(99,91,255,.08), transparent 70%),
            linear-gradient(180deg, rgba(240,241,247,.8), rgba(255,255,255,1));
          position: relative;
          overflow: hidden;
        }
        .dw-shell {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }
        .dw-head {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          justify-content: space-between;
          gap: clamp(12px,3vw,24px);
          margin-bottom: clamp(20px,4vw,32px);
          padding-bottom: clamp(16px,3vw,24px);
          border-bottom: 1px solid rgba(0,0,0,.06);
        }
        .dw-head-group { flex: 1; min-width: 0; }
        .dw-eyebrow {
          font-size: clamp(11px,1.8vw,12px);
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--a1, #635bff);
          margin: 0 0 clamp(4px,1vw,8px) 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dw-eyebrow::before {
          content: '';
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
          border-radius: 50%;
        }
        .dw-title {
          font-family: 'Syne', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          font-size: clamp(24px, 5vw, 42px);
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--t1, #0c0e18);
          margin: 0;
          font-weight: 700;
        }
        .dw-sub {
          margin-top: clamp(4px,1vw,6px);
          color: var(--t2, #5a6278);
          font-size: clamp(13px,2vw,15px);
          font-weight: 400;
        }
        .dw-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: clamp(10px,2vw,13px) clamp(16px,4vw,26px);
          border-radius: 13px;
          border: 1px solid rgba(99,91,255,.2);
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
          color: #fff;
          font-family: 'Syne', system-ui, sans-serif;
          font-size: clamp(13px,2vw,14px);
          font-weight: 700;
          cursor: pointer;
          transition: all .25s cubic-bezier(.22,1,.36,1);
          box-shadow: 0 12px 36px rgba(99,91,255,.28);
          position: relative;
          white-space: nowrap;
        }
        .dw-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 48px rgba(99,91,255,.35);
        }
        .dw-btn-primary:active { transform: translateY(0); }

        /* ── FILTER BAR ── */
        .dw-filters {
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 18px;
          padding: clamp(14px,2.5vw,20px) clamp(16px,3vw,24px);
          margin-bottom: clamp(20px,4vw,32px);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(99,91,255,.06);
        }
        .dw-filter-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .dw-search-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,.9);
          border: 1.5px solid rgba(0,0,0,.1);
          border-radius: 11px;
          padding: 8px 14px;
          flex: 1;
          min-width: 0;
          max-width: 280px;
          transition: border-color .2s, box-shadow .2s;
        }
        .dw-search-wrap:focus-within {
          border-color: var(--a1, #635bff);
          box-shadow: 0 0 0 3px rgba(99,91,255,.1);
        }
        .dw-search-icon {
          color: var(--t3, #9ba3bb);
          flex-shrink: 0;
          width: 15px;
          height: 15px;
        }
        .dw-search-input {
          border: none;
          outline: none;
          background: transparent;
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 13px;
          color: var(--t1, #0c0e18);
          flex: 1;
          min-width: 0;
        }
        .dw-search-input::placeholder { color: var(--t3, #9ba3bb); }
        .dw-search-clear {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: var(--t3, #9ba3bb);
          display: flex;
          align-items: center;
          transition: color .18s;
          flex-shrink: 0;
        }
        .dw-search-clear:hover { color: var(--t2, #5a6278); }
        .dw-status-pills {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }
        .dw-status-pill {
          padding: 7px 13px;
          border-radius: 999px;
          border: 1.5px solid rgba(0,0,0,.1);
          background: rgba(255,255,255,.85);
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: var(--t2, #5a6278);
          cursor: pointer;
          transition: all .2s;
          white-space: nowrap;
        }
        .dw-status-pill:hover {
          border-color: rgba(99,91,255,.3);
          color: var(--a1, #635bff);
          background: rgba(99,91,255,.06);
        }
        .dw-status-pill--active-all {
          background: linear-gradient(135deg, var(--a1,#635bff), var(--a2,#06c9a0));
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(99,91,255,.3);
        }
        .dw-status-pill--active-pending {
          background: linear-gradient(135deg, #f5a623, #e08800);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(245,166,35,.3);
        }
        .dw-status-pill--active-progress {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(59,130,246,.3);
        }
        .dw-status-pill--active-completed {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(34,197,94,.3);
        }
        .dw-advanced-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 11px;
          border: 1.5px solid rgba(0,0,0,.1);
          background: rgba(255,255,255,.85);
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: var(--t2, #5a6278);
          cursor: pointer;
          transition: all .2s;
          white-space: nowrap;
          position: relative;
        }
        .dw-advanced-btn:hover, .dw-advanced-btn--open {
          border-color: rgba(99,91,255,.3);
          color: var(--a1, #635bff);
          background: rgba(99,91,255,.07);
        }
        .dw-advanced-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--a1, #635bff);
          display: inline-block;
          flex-shrink: 0;
        }
        .dw-advanced-chevron {
          transition: transform .2s;
        }
        .dw-advanced-chevron--open {
          transform: rotate(180deg);
        }

        /* Advanced panel */
        .dw-advanced-panel {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(0,0,0,.07);
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: flex-end;
        }
        .dw-filter-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
          min-width: 140px;
          max-width: 220px;
        }
        .dw-filter-label {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .07em;
          text-transform: uppercase;
          color: var(--t3, #9ba3bb);
        }
        .dw-filter-select, .dw-filter-date {
          width: 100%;
          padding: 8px 12px;
          border: 1.5px solid rgba(0,0,0,.1);
          border-radius: 10px;
          background: rgba(255,255,255,.9);
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 13px;
          color: var(--t1, #0c0e18);
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          cursor: pointer;
          appearance: auto;
        }
        .dw-filter-select:focus, .dw-filter-date:focus {
          border-color: var(--a1, #635bff);
          box-shadow: 0 0 0 3px rgba(99,91,255,.1);
        }
        .dw-clear-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 16px;
          border-radius: 10px;
          border: 1.5px solid rgba(220,38,38,.25);
          background: rgba(254,242,242,.9);
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #c41e1e;
          cursor: pointer;
          transition: all .2s;
          white-space: nowrap;
          align-self: flex-end;
        }
        .dw-clear-btn:hover {
          background: rgba(239,68,68,.15);
          border-color: rgba(220,38,38,.4);
        }

        /* Filter chips */
        .dw-filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(0,0,0,.06);
        }
        .dw-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(99,91,255,.1);
          border: 1px solid rgba(99,91,255,.2);
          color: var(--a1, #635bff);
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all .18s;
        }
        .dw-chip:hover { background: rgba(99,91,255,.18); }
        .dw-chip--clear {
          background: rgba(220,38,38,.08);
          border-color: rgba(220,38,38,.2);
          color: #c41e1e;
        }
        .dw-chip--clear:hover { background: rgba(220,38,38,.15); }
        .dw-results-count {
          font-size: 12px;
          color: var(--t3, #9ba3bb);
          font-weight: 500;
          margin-top: 10px;
          display: block;
        }

        /* ── SECTIONS ── */
        .dw-sections {
          display: flex;
          flex-direction: column;
          gap: clamp(28px, 5vw, 44px);
        }
        .dw-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: clamp(14px,2.5vw,20px);
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(0,0,0,.06);
        }
        .dw-section-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dw-section-title {
          font-family: 'Syne', system-ui, -apple-system, sans-serif;
          font-size: clamp(16px,2.5vw,20px);
          font-weight: 700;
          color: var(--t1, #0c0e18);
          flex: 1;
          letter-spacing: -.01em;
        }
        .dw-section-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 26px;
          height: 26px;
          padding: 0 9px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 700;
        }

        /* ── CARDS ── */
        .dw-loading, .dw-empty {
          background: rgba(255,255,255,.65);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: clamp(16px,2vw,20px);
          padding: clamp(32px,5vw,64px) clamp(16px,4vw,32px);
          text-align: center;
          color: var(--t2, #5a6278);
          font-size: clamp(14px,2vw,16px);
          box-shadow: 0 16px 48px rgba(99,91,255,.12);
          backdrop-filter: blur(20px);
        }
        .dw-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(16px,3vw,24px);
          list-style: none;
          margin: 0;
          padding: 0;
        }
        @media (min-width: 640px) { .dw-list { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .dw-list { grid-template-columns: repeat(3, 1fr); } }
        .dw-list li { margin: 0; padding: 0; }
        .dw-card {
          display: flex;
          flex-direction: column;
          padding: 0;
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: clamp(12px,2vw,16px);
          box-shadow: 0 8px 32px rgba(99,91,255,.08);
          backdrop-filter: blur(20px);
          cursor: pointer;
          transition: all .3s cubic-bezier(.22,1,.36,1);
          overflow: hidden;
          position: relative;
        }
        .dw-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--a1, #635bff), var(--a2, #06c9a0));
          opacity: 0;
          transition: opacity .3s ease;
        }
        .dw-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 56px rgba(99,91,255,.16);
          border-color: rgba(99,91,255,.15);
          background: rgba(255,255,255,.88);
        }
        .dw-card:hover::before { opacity: 1; }
        .dw-card:hover .dw-card-open { opacity: 1; color: var(--a1, #635bff); gap: 12px; }
        .dw-card-click {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: clamp(16px,3vw,28px);
          text-align: left;
          border: none;
          background: none;
          cursor: pointer;
          font: inherit;
          color: inherit;
          gap: clamp(8px,2vw,12px);
        }
        .dw-card-body { flex: 1; min-width: 0; }
        .dw-card-title {
          font-family: 'Syne', system-ui, sans-serif;
          font-size: clamp(16px,3vw,18px);
          font-weight: 700;
          color: var(--t1, #0c0e18);
          margin: 0 0 8px 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .dw-card-meta {
          display: flex;
          align-items: center;
          gap: clamp(6px,2vw,8px);
          margin-bottom: clamp(8px,2vw,12px);
          font-size: clamp(12px,1.8vw,13px);
          color: var(--t2, #5a6278);
          flex-wrap: wrap;
        }
        .dw-card-meta-divider { width: 1px; height: 14px; background: rgba(0,0,0,.1); }
        .dw-card-row {
          font-size: clamp(12px,1.8vw,13px);
          color: var(--t2, #5a6278);
          margin: 0 0 4px 0;
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }
        .dw-card-row:last-of-type { margin-bottom: clamp(8px,2vw,12px); }
        .dw-progress { margin: 10px 0 12px; display: grid; gap: 7px; }
        .dw-progress-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .dw-progress-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: var(--t3, #9ba3bb);
        }
        .dw-progress-value {
          font-size: 11px;
          font-weight: 800;
          padding: 3px 9px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,.12);
        }
        .dw-progress-track {
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background: rgba(15,23,42,.08);
          border: 1px solid rgba(15,23,42,.08);
          overflow: hidden;
        }
        .dw-progress-fill {
          height: 100%;
          border-radius: 999px;
          min-width: 0;
          transition: width .3s ease, background .3s ease;
        }
        .dw-map-link {
          color: var(--a1, #635bff);
          font-weight: 700;
          text-decoration: underline;
          text-decoration-thickness: 1.5px;
          text-underline-offset: 2px;
        }
        .dw-map-link:hover { color: var(--a2, #06c9a0); }
        .dw-card-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 800;
          padding: 5px 11px;
          margin-bottom: 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: .05em;
          white-space: nowrap;
        }
        .dw-card-badge::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          display: inline-block;
        }
        .dw-card-badge--pending { background: rgba(245,166,35,.15); color: #92400e; }
        .dw-card-badge--pending::before { background: #f5a623; }
        .dw-card-badge--progress { background: rgba(59,130,246,.15); color: #1d4ed8; }
        .dw-card-badge--progress::before { background: #3b82f6; }
        .dw-card-badge--completed { background: rgba(34,197,94,.15); color: #166534; }
        .dw-card-badge--completed::before { background: #22c55e; }
        .dw-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: clamp(10px,3vw,18px) clamp(14px,4vw,28px);
          border-top: 1px solid rgba(0,0,0,.06);
          background: linear-gradient(135deg, rgba(99,91,255,.02), rgba(6,201,160,.02));
        }
        .dw-card-open {
          font-size: 12px;
          font-weight: 700;
          color: var(--t2, #5a6278);
          opacity: .75;
          transition: all .25s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: .04em;
          border: none;
          background: none;
          padding: 0;
          cursor: pointer;
        }
        .dw-card-actions { flex-shrink: 0; }
        .dw-btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1.5px solid rgba(220,38,38,.2);
          background: rgba(254,242,242,.8);
          color: #c41e1e;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background .2s ease, border-color .2s ease, color .2s ease;
          font-weight: 300;
        }
        .dw-btn-icon:hover {
          background: rgba(239,68,68,.15);
          border-color: rgba(220,38,38,.4);
        }
        @media (max-width: 768px) {
          .dw-head { flex-direction: column; align-items: flex-start; gap: 12px; }
          .dw-title { font-size: 28px; }
          .dw-btn-primary { width: 100%; justify-content: center; }
          .dw-list { grid-template-columns: 1fr; }
          .dw-filter-bar { flex-direction: column; align-items: stretch; gap: 8px; }
          .dw-search-wrap { max-width: 100%; width: 100%; }
          .dw-status-pills {
            overflow-x: auto;
            flex-wrap: nowrap;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 2px;
          }
          .dw-status-pills::-webkit-scrollbar { display: none; }
          .dw-status-pill { flex-shrink: 0; }
          .dw-advanced-btn { width: 100%; justify-content: center; }
          .dw-advanced-panel { gap: 8px; }
          .dw-filter-group { min-width: 0; max-width: 100%; flex: 1 1 calc(50% - 4px); }
          .dw-clear-btn { width: 100%; justify-content: center; }
        }
        @media (max-width: 480px) {
          .dw-filters { padding: 12px 14px; border-radius: 14px; }
          .dw-filter-group { flex: 1 1 100%; min-width: 0; }
          .dw-filter-chips { gap: 5px; }
          .dw-chip { font-size: 11px; padding: 4px 10px; }
        }
        @media (max-width: 400px) {
          .dw-page { padding: 10px; }
          .dw-title { font-size: 22px; }
          .dw-sub { font-size: 12px; }
          .dw-filters { padding: 10px 12px; border-radius: 12px; margin-bottom: 14px; }
          .dw-filter-bar { gap: 6px; }
          .dw-search-wrap { padding: 7px 10px; border-radius: 9px; }
          .dw-search-input { font-size: 12px; }
          .dw-status-pill { padding: 5px 10px; font-size: 11px; }
          .dw-advanced-btn { padding: 7px 12px; font-size: 11px; }
          .dw-advanced-panel { gap: 6px; margin-top: 10px; padding-top: 10px; }
          .dw-filter-group { flex: 1 1 100%; min-width: 0; }
          .dw-filter-select, .dw-filter-date { font-size: 12px; padding: 7px 10px; border-radius: 8px; }
          .dw-filter-label { font-size: 10px; }
          .dw-clear-btn { font-size: 11px; padding: 7px 12px; }
          .dw-chip { font-size: 10px; padding: 3px 8px; }
          .dw-filter-chips { gap: 4px; margin-top: 8px; padding-top: 8px; }
          .dw-section-header { gap: 7px; margin-bottom: 12px; }
          .dw-section-icon-wrap { width: 28px; height: 28px; border-radius: 8px; }
          .dw-section-title { font-size: 14px; }
          .dw-section-badge { font-size: 10px; min-width: 22px; height: 22px; padding: 0 6px; }
          .dw-card-click { padding: 14px; }
          .dw-card-title { font-size: 14px; }
          .dw-card-meta { font-size: 11px; }
          .dw-card-row { font-size: 11px; }
          .dw-card-footer { gap: 8px; }
          .dw-card-open { font-size: 10px; }
          .dw-btn-icon { width: 30px; height: 30px; font-size: 17px; border-radius: 8px; }
          .dw-sections { gap: 20px; }
          .dw-head { margin-bottom: 14px; padding-bottom: 14px; }
          .dw-btn-primary { font-size: 13px; padding: 10px 16px; border-radius: 10px; }
        }
      `}</style>

      <div className="dw-shell">
        {/* Header */}
        <div className="dw-head">
          <div className="dw-head-group">
            <div className="dw-eyebrow">Internship Overview</div>
            <h1 className="dw-title">Internships</h1>
            <p className="dw-sub">Manage and open internship records</p>
          </div>
          {String(user?.role || '').toLowerCase() === 'admin' && (
            <button
              type="button"
              className="dw-btn-primary"
              onClick={onNewFaculty}
            >
              <span aria-hidden="true">+</span>
              New Internship
            </button>
          )}
        </div>

        {/* Filter bar — shown only when there are internships */}
        {!loading && faculties.length > 0 && (
          <div className="dw-filters">
            <div className="dw-filter-bar">
              {/* Search */}
              <div className="dw-search-wrap">
                <svg className="dw-search-icon" viewBox="0 0 20 20" fill="none">
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <input
                  className="dw-search-input"
                  type="text"
                  placeholder="Search internships..."
                  value={localSearch}
                  onChange={e => setLocalSearch(e.target.value)}
                />
                {localSearch && (
                  <button className="dw-search-clear" onClick={() => setLocalSearch("")} aria-label="Clear search">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Status pills */}
              <div className="dw-status-pills">
                {[
                  { value: "all", label: "All" },
                  { value: "Pending", label: "Not Started" },
                  { value: "In Progress", label: "In Progress" },
                  { value: "Completed", label: "Completed" },
                ].map(({ value, label }) => {
                  const isActive = statusFilter === value;
                  let activeClass = "";
                  if (isActive) {
                    activeClass = value === "all" ? "dw-status-pill--active-all"
                      : value === "Pending" ? "dw-status-pill--active-pending"
                      : value === "In Progress" ? "dw-status-pill--active-progress"
                      : "dw-status-pill--active-completed";
                  }
                  return (
                    <button
                      key={value}
                      className={`dw-status-pill ${activeClass}`}
                      onClick={() => setStatusFilter(value)}
                      type="button"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Advanced filters toggle */}
              <button
                type="button"
                className={`dw-advanced-btn${showAdvanced ? " dw-advanced-btn--open" : ""}`}
                onClick={() => setShowAdvanced(v => !v)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                Filters
                {hasActiveFilters && !showAdvanced && <span className="dw-advanced-dot" />}
                <svg
                  className={`dw-advanced-chevron${showAdvanced ? " dw-advanced-chevron--open" : ""}`}
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Advanced filters panel */}
            {showAdvanced && (
              <div className="dw-advanced-panel">
                {/* Company */}
                <div className="dw-filter-group">
                  <label className="dw-filter-label">Company</label>
                  <select
                    className="dw-filter-select"
                    value={companyFilter}
                    onChange={e => setCompanyFilter(e.target.value)}
                  >
                    <option value="all">All companies</option>
                    {uniqueCompanies.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Sort by */}
                <div className="dw-filter-group">
                  <label className="dw-filter-label">Sort by</label>
                  <select
                    className="dw-filter-select"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    {Object.entries(SORT_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Date from */}
                <div className="dw-filter-group">
                  <label className="dw-filter-label">Start date from</label>
                  <input
                    type="date"
                    className="dw-filter-date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                  />
                </div>

                {/* Date to */}
                <div className="dw-filter-group">
                  <label className="dw-filter-label">Start date to</label>
                  <input
                    type="date"
                    className="dw-filter-date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                  />
                </div>

                {hasActiveFilters && (
                  <button type="button" className="dw-clear-btn" onClick={clearAllFilters}>
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    Clear all
                  </button>
                )}
              </div>
            )}

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="dw-filter-chips">
                {localSearch && (
                  <button className="dw-chip" type="button" onClick={() => setLocalSearch("")}>
                    Search: "{localSearch}" ×
                  </button>
                )}
                {statusFilter !== "all" && (
                  <button className="dw-chip" type="button" onClick={() => setStatusFilter("all")}>
                    {statusFilter} ×
                  </button>
                )}
                {companyFilter !== "all" && (
                  <button className="dw-chip" type="button" onClick={() => setCompanyFilter("all")}>
                    {companyFilter} ×
                  </button>
                )}
                {dateFrom && (
                  <button className="dw-chip" type="button" onClick={() => setDateFrom("")}>
                    From: {formatDateValue(dateFrom)} ×
                  </button>
                )}
                {dateTo && (
                  <button className="dw-chip" type="button" onClick={() => setDateTo("")}>
                    To: {formatDateValue(dateTo)} ×
                  </button>
                )}
                {sortBy !== "default" && (
                  <button className="dw-chip" type="button" onClick={() => setSortBy("default")}>
                    {SORT_LABELS[sortBy]} ×
                  </button>
                )}
                <button className="dw-chip dw-chip--clear" type="button" onClick={clearAllFilters}>
                  Clear all
                </button>
              </div>
            )}

            {/* Results count */}
            {!loading && faculties.length > 0 && (
              <span className="dw-results-count">
                Showing {filteredFaculties.length} of {faculties.length} internship{faculties.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <PageState
            variant="loading"
            title="Loading internships"
            message="Fetching internship cards and progress data..."
            className="dw-loading"
          />
        ) : faculties.length === 0 ? (
          <PageState
            variant="empty"
            title="No internships yet"
            message="Create your first internship to get started."
            className="dw-empty"
          />
        ) : filteredFaculties.length === 0 ? (
          <PageState
            variant="empty"
            title="No matching internships"
            message="Try another search query or clear the filters."
            className="dw-empty"
          />
        ) : (
          <div className="dw-sections">
            {/* In Progress — 1–99% or status In Progress */}
            {renderSection(
              "In Progress",
              inProgressFaculties,
              "#3b82f6",
              "M8 1a7 7 0 100 14A7 7 0 008 1zM2.5 8a5.5 5.5 0 015.5-5.5V8l3.889 3.889A5.5 5.5 0 012.5 8z"
            )}

            {/* Completed — 100% or status Completed */}
            {renderSection(
              "Completed",
              completedFaculties,
              "#22c55e",
              "M8 1a7 7 0 100 14A7 7 0 008 1zm3.47 5.03a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06 0l-1.75-1.75a.75.75 0 011.06-1.06l1.22 1.22 3.47-3.47a.75.75 0 011.06 0z"
            )}

            {/* Not Started — 0% and not marked active/completed */}
            {renderSection(
              "Not Started",
              notStartedFaculties,
              "#f5a623",
              "M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM8 4a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 7.5a.875.875 0 110-1.75.875.875 0 010 1.75z"
            )}
          </div>
        )}
      </div>
    </div>
  );
}
