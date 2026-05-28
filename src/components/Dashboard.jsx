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

export default function Dashboard({ onNewFaculty, onView, search = "", user = null }) {
  const [faculties, setFaculties] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [loading, setLoading] = useState(true);

  const getFacultyId = (faculty) => faculty?._id ?? faculty?.id ?? null;

  const getSupervisorLabel = (faculty) => {
    const supervisor =
      faculty?.tutorID || faculty?.tutor || faculty?.supervisor;

    if (typeof supervisor === "string" && supervisor.trim()) {
      const linkedUser = usersById[supervisor];
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
      return supervisor;
    }

    if (supervisor && typeof supervisor === "object") {
      const fullName = [
        supervisor.name,
        supervisor.surname,
        supervisor.lastname,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      if (fullName) return fullName;
      if (supervisor.login) return supervisor.login;
      if (supervisor.email) return supervisor.email;
    }

    const tutorName = [faculty?.tutorName, faculty?.supervisorName]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (tutorName) return tutorName;

    return "Not assigned";
  };

  const getSupervisorRecord = (faculty) => {
    const supervisor =
      faculty?.tutorID || faculty?.tutor || faculty?.supervisor;

    if (supervisor && typeof supervisor === "object") return supervisor;

    if (typeof supervisor === "string" && supervisor.trim()) {
      return usersById[supervisor] || null;
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
    const supervisorLabel = getSupervisorLabel(faculty);
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

  // Filter faculties based on role and search term
  const filteredFaculties = faculties.filter((faculty, index) => {
    // Role-based filtering
    const userRole = String(user?.role || '').trim().toLowerCase();
    
    // Admin and rector can see all internships
    if (userRole === 'admin' || userRole === 'rector') {
      // Continue to search filtering
    } 
    // Tutors can only see internships they are assigned to
    else if (userRole === 'tutor') {
      // Get all possible user IDs
      const userIds = [
        user?._id,
        user?.id,
        user?.userId,
      ].filter(Boolean).map(id => String(id).trim().toLowerCase());
      
      // Get tutor ID from faculty (could be string, object, or ID)
      let facultyTutorIds = [];
      const tutorId = faculty?.tutorID;
      
      if (tutorId) {
        if (typeof tutorId === 'object' && tutorId._id) {
          facultyTutorIds.push(String(tutorId._id).trim().toLowerCase());
        } else if (typeof tutorId === 'object' && tutorId.id) {
          facultyTutorIds.push(String(tutorId.id).trim().toLowerCase());
        } else {
          facultyTutorIds.push(String(tutorId).trim().toLowerCase());
        }
      }
      
      // Also check tutor field
      const tutor = faculty?.tutor;
      if (tutor) {
        if (typeof tutor === 'object' && tutor._id) {
          facultyTutorIds.push(String(tutor._id).trim().toLowerCase());
        } else if (typeof tutor === 'object' && tutor.id) {
          facultyTutorIds.push(String(tutor.id).trim().toLowerCase());
        } else {
          facultyTutorIds.push(String(tutor).trim().toLowerCase());
        }
      }
      
      // Check if any user ID matches any faculty tutor ID
      const hasMatch = userIds.some(userId => facultyTutorIds.includes(userId));
      
      // Debug log
      if (index === 0) {
        console.log('[Dashboard] Tutor filter debug:', {
          userIds,
          facultyTutorIds,
          hasMatch,
          tutorId,
          tutor,
        });
      }
      
      if (!hasMatch) {
        return false;
      }
    }
    // Other roles (student, professor) see all
    
    // Apply search filter
    const searchLower = search.toLowerCase();
    return (
      faculty.name?.toLowerCase().includes(searchLower) ||
      faculty.company?.toLowerCase().includes(searchLower) ||
      faculty.location?.toLowerCase().includes(searchLower) ||
      faculty.plan?.toLowerCase().includes(searchLower)
    );
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
          margin-bottom: clamp(24px,5vw,44px);
          padding-bottom: clamp(16px,3vw,24px);
          border-bottom: 1px solid rgba(0,0,0,.06);
        }
        .dw-head-group {
          flex: 1;
          min-width: 0;
        }
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
        .dw-btn-primary:active {
          transform: translateY(0);
        }
        .dw-alert {
          border-radius: 14px;
          border: 1px solid rgba(220,38,38,.2);
          background: linear-gradient(135deg, rgba(254,226,226,.6), rgba(254,242,242,.8));
          color: #7f1d1d;
          padding: 14px 16px;
          margin-bottom: 24px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
          backdrop-filter: blur(10px);
        }
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
          gap: clamp(16px,3vw,32px);
          list-style: none;
          margin: 0;
          padding: 0;
        }
        @media (min-width: 640px) { .dw-list { grid-template-columns: repeat(2, 1fr); gap: clamp(20px,3vw,28px); } }
        @media (min-width: 1024px) { .dw-list { grid-template-columns: repeat(3, 1fr); gap: clamp(20px,2.5vw,28px); } }
        .dw-list li {
          margin: 0;
          padding: 0;
        }
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
          top: 0;
          left: 0;
          right: 0;
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
        .dw-card:hover::before {
          opacity: 1;
        }
        .dw-card:hover .dw-card-open {
          opacity: 1;
          color: var(--a1, #635bff);
          gap: 12px;
        }
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
        .dw-card-meta-divider {
          width: 1px;
          height: 14px;
          background: rgba(0,0,0,.1);
        }
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
        .dw-progress {
          margin: 10px 0 12px;
          display: grid;
          gap: 7px;
        }
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
        .dw-map-link:hover {
          color: var(--a2, #06c9a0);
        }
        .dw-card-plan {
          font-size: 12px;
          color: var(--t3, #9ba3bb);
          margin: 12px 0 0 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
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
        .dw-card-badge--pending {
          background: rgba(245,166,35,.15);
          color: #92400e;
        }
        .dw-card-badge--pending::before {
          background: #f5a623;
        }
        .dw-card-badge--progress {
          background: rgba(59,130,246,.15);
          color: #1d4ed8;
        }
        .dw-card-badge--progress::before {
          background: #3b82f6;
        }
        .dw-card-badge--completed {
          background: rgba(34,197,94,.15);
          color: #166534;
        }
        .dw-card-badge--completed::before {
          background: #22c55e;
        }
        .dw-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 28px;
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
          .dw-list { grid-template-columns: 1fr; }
          .dw-title { font-size: 32px; }
          .dw-head { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="dw-shell">
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
          <ul className="dw-list" aria-label="Internship list">
            {filteredFaculties.map((faculty, index) => {
              const facultyId = getFacultyId(faculty) ?? `row-${index}`;
              const shortProgress = getShortProgress(faculty);
              const progressHue = Math.round((shortProgress / 100) * 120);
              const normalizedStatus = normalizeStatus(faculty.status);
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
                      onClick={() => {
                        if (facultyId) onView(facultyId);
                      }}
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
                            <strong>{getSupervisorLabel(faculty)}</strong>
                          </div>
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
                          Contact:{" "}
                          <strong>{getSupervisorContact(faculty)}</strong>
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
                        onClick={() => {
                          if (facultyId) onView(facultyId);
                        }}
                      >
                        View Details
                      </button>
                      {(['admin', 'developer'].includes(String(user?.role || '').toLowerCase()) ) && (
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
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
