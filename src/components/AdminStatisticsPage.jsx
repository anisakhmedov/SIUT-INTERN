import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { get } from "../utils/apiClient";
import { toast } from "../utils/toast";
import PageState from "./PageState";
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Circle,
  Calendar,
  Briefcase,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  X,
  ArrowRight,
  Award,
  AlertCircle,
  FileText,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";

/* ─────────────────────────────────────────────
   DAY STATUS HELPERS  (mirrors InternshipPage)
───────────────────────────────────────────── */
function normalizeApprovalCode(value) {
  if (value === true) return 2;
  if (value === false) return 3;
  const n = Number(value);
  if (n === 2) return 2;
  if (n === 3) return 3;
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "approved") return 2;
  if (raw === "rejected" || raw === "declined" || raw === "not approved") return 3;
  return 1;
}

function hasReportContent(day) {
  if (!day?.shortReport) return false;
  const title = typeof day.shortReport.title === "string" ? day.shortReport.title.trim() : "";
  const desc = typeof day.shortReport.description === "string" ? day.shortReport.description.trim() : "";
  const rImgs = Array.isArray(day.shortReport.images) ? day.shortReport.images : [];
  const dImgs = Array.isArray(day.images) ? day.images : [];
  return Boolean(title || desc || rImgs.length || dImgs.length);
}

function getLocalDateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isMissedDay(day) {
  const dk = String(day?.date || "").slice(0, 10);
  return dk ? dk < getLocalDateKey() : false;
}

function getDayStatus(day) {
  const code = normalizeApprovalCode(day?.approved);
  if (code === 2) return "approved";
  if (code === 3) return "rejected";
  const rejFlags = [
    day?.rejected, day?.isRejected, day?.reportRejected,
    day?.shortReport?.rejected, day?.shortReport?.isRejected,
  ];
  const rejVals = [
    day?.status, day?.reportStatus, day?.reviewStatus,
    day?.shortReport?.status, day?.shortReport?.approvalStatus,
  ].map((v) => String(v || "").trim().toLowerCase()).filter(Boolean);
  if (rejFlags.some(Boolean) || rejVals.some((v) => v === "rejected" || v === "declined")) return "rejected";
  if (hasReportContent(day)) return "submitted";
  if (isMissedDay(day)) return "missed";
  return "empty";
}

/* ─────────────────────────────────────────────
   RESPONSIVE HOOK
───────────────────────────────────────────── */
function useIsMobile(bp = 640) {
  const [mob, setMob] = useState(() => typeof window !== "undefined" && window.innerWidth < bp);
  useEffect(() => {
    const fn = () => setMob(window.innerWidth < bp);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return mob;
}

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */
const STATUS_META = {
  approved:  { label: "Approved",    color: "#22c55e", bg: "rgba(34,197,94,.12)",   Icon: CheckCircle2 },
  submitted: { label: "Under Review", color: "#3b82f6", bg: "rgba(59,130,246,.12)",  Icon: Clock },
  rejected:  { label: "Rejected",    color: "#ef4444", bg: "rgba(239,68,68,.11)",   Icon: XCircle },
  missed:    { label: "Missed",      color: "#f59e0b", bg: "rgba(245,158,11,.12)",  Icon: AlertTriangle },
  empty:     { label: "Empty",       color: "#9ca3af", bg: "rgba(156,163,175,.11)", Icon: Circle },
};

/* ─────────────────────────────────────────────
   STATS
───────────────────────────────────────────── */
function computeStats(faculty) {
  const days = Array.isArray(faculty?.days) ? faculty.days : [];
  const counts = { approved: 0, rejected: 0, submitted: 0, missed: 0, empty: 0 };
  for (const day of days) counts[getDayStatus(day)]++;
  const total = days.length;
  const reported = counts.approved + counts.rejected + counts.submitted;
  const reviewed = counts.approved + counts.submitted;
  const approvalRate = reviewed > 0 ? Math.round((counts.approved / reviewed) * 100) : 0;
  const progress = total > 0 ? Math.round((reported / total) * 100) : 0;
  return { ...counts, total, progress, approvalRate };
}

/* ─────────────────────────────────────────────
   KPI CARD (clickable)
───────────────────────────────────────────── */
function KpiCard({ status, value, total, onClick, isActive }) {
  const m = STATUS_META[status];
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <button onClick={onClick} style={{
      flex: 1, minWidth: 120, padding: "16px 18px",
      background: isActive ? m.bg : "rgba(255,255,255,.84)",
      border: `1.5px solid ${isActive ? m.color + "66" : "rgba(255,255,255,.88)"}`,
      borderRadius: 16, cursor: "pointer",
      boxShadow: isActive ? `0 6px 24px ${m.color}28` : "0 4px 16px rgba(99,91,255,.07)",
      display: "flex", flexDirection: "column", gap: 10,
      transition: "all .2s", textAlign: "left",
      transform: isActive ? "translateY(-2px)" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <m.Icon size={16} color={m.color} />
        </div>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: m.color, background: m.bg, borderRadius: 999, padding: "2px 7px" }}>
          {pct}%
        </span>
      </div>
      <div>
        <div style={{ fontFamily: "Montserrat", fontSize: 24, fontWeight: 800, color: "var(--t1)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: "var(--t2)", fontWeight: 500, marginTop: 3 }}>{m.label} days</div>
      </div>
      <div style={{ height: 3, background: "rgba(0,0,0,.06)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: m.color, borderRadius: 999, transition: "width .5s" }} />
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────
   MINI STATUS BAR
───────────────────────────────────────────── */
function MiniStatusBar({ stats }) {
  const total = stats.total || 1;
  return (
    <div style={{ display: "flex", height: 6, borderRadius: 999, overflow: "hidden", background: "#f3f4f6", width: "100%" }}>
      {[
        ["approved",  "#22c55e"],
        ["submitted", "#3b82f6"],
        ["rejected",  "#ef4444"],
        ["missed",    "#f59e0b"],
        ["empty",     "#e5e7eb"],
      ].map(([key, color]) => {
        const w = (stats[key] / total) * 100;
        return w > 0 ? (
          <div key={key} title={`${STATUS_META[key].label}: ${stats[key]}`}
            style={{ width: `${w}%`, background: color, transition: "width .5s" }} />
        ) : null;
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DONUT CHART  (fixed: no mutation of offset)
───────────────────────────────────────────── */
function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ textAlign: "center", color: "var(--t3)", fontSize: 12, padding: "20px 0" }}>No data</div>;

  const r = 52, cx = 64, cy = 64, sw = 20, circ = 2 * Math.PI * r;

  const slices = data.reduce((acc, d) => {
    const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
    const dash = (d.value / total) * circ;
    acc.push({ ...d, dash, gap: circ - dash, offset });
    return acc;
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <div style={{ position: "relative", width: 128, height: 128, flexShrink: 0 }}>
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,.06)" strokeWidth={sw} />
          {slices.filter((s) => s.value > 0).map((s, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color}
              strokeWidth={sw} strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={-s.offset + circ / 4}
              style={{ transform: "rotate(-90deg)", transformOrigin: "64px 64px" }} />
          ))}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "Montserrat", fontSize: 20, fontWeight: 800, color: "var(--t1)", lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: 9, color: "var(--t3)", fontWeight: 600 }}>days</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "var(--t2)", flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t1)", minWidth: 28, textAlign: "right" }}>{s.value}</span>
            <span style={{ fontSize: 10.5, color: "var(--t3)", minWidth: 30, textAlign: "right" }}>{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROGRESS HISTOGRAM
───────────────────────────────────────────── */
function ProgressHistogram({ rows }) {
  const buckets = [
    { label: "0%",     range: [0,   0],   color: "#e5e7eb" },
    { label: "1-25%",  range: [1,  25],   color: "#fde68a" },
    { label: "26-50%", range: [26, 50],   color: "#93c5fd" },
    { label: "51-75%", range: [51, 75],   color: "#6ee7b7" },
    { label: "76-99%", range: [76, 99],   color: "#86efac" },
    { label: "100%",   range: [100, 100], color: "#22c55e" },
  ];
  const counts = buckets.map(({ range }) =>
    rows.filter((r) => r.progress >= range[0] && r.progress <= range[1]).length,
  );
  const max = Math.max(...counts, 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {buckets.map((b, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "var(--t3)", width: 52, flexShrink: 0 }}>{b.label}</span>
          <div style={{ flex: 1, height: 18, background: "rgba(0,0,0,.05)", borderRadius: 5, overflow: "hidden" }}>
            <div style={{
              width: `${(counts[i] / max) * 100}%`, height: "100%", background: b.color,
              borderRadius: 5, transition: "width .6s ease",
              display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 5,
              minWidth: counts[i] > 0 ? 18 : 0,
            }}>
              {counts[i] > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "#374151" }}>{counts[i]}</span>}
            </div>
          </div>
          <span style={{ fontSize: 11, color: "var(--t2)", fontWeight: 600, width: 18, textAlign: "right" }}>{counts[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SPOTLIGHT CARD
───────────────────────────────────────────── */
function SpotlightCard({ title, IconComp, iconColor, iconBg, items, emptyText }) {
  return (
    <div style={{ background: "rgba(255,255,255,.84)", border: "1px solid rgba(255,255,255,.88)", borderRadius: 18, padding: "18px 20px", boxShadow: "0 4px 16px rgba(99,91,255,.07)", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconComp size={15} color={iconColor} />
        </div>
        <span style={{ fontFamily: "Montserrat", fontSize: 13.5, fontWeight: 700, color: "var(--t1)" }}>{title}</span>
      </div>
      {items.length === 0
        ? <div style={{ fontSize: 12, color: "var(--t3)", textAlign: "center", padding: "12px 0" }}>{emptyText}</div>
        : items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < items.length - 1 ? "1px solid rgba(0,0,0,.05)" : "none" }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#635bff,#06c9a0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 9.5, fontWeight: 800, color: "#fff" }}>#{i + 1}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
              <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 1 }}>{item.sub}</div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: item.valueColor || "var(--t1)" }}>{item.value}</span>
          </div>
        ))
      }
    </div>
  );
}

/* ─────────────────────────────────────────────
   STATUS PANEL (slide-in drawer)
───────────────────────────────────────────── */
function StatusPanel({ status, allDays, onClose, onOpenDay, panelTitle }) {
  const m = STATUS_META[status];
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const sa = document.querySelector(".sa");
    if (sa) sa.style.overflow = "hidden";
    return () => { if (sa) sa.style.overflow = ""; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allDays.filter((d) =>
      !q || d.internshipName.toLowerCase().includes(q) || d.dateLabel.toLowerCase().includes(q),
    );
  }, [allDays, search]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const d of filtered) {
      if (!map.has(d.facultyId)) map.set(d.facultyId, { name: d.internshipName, days: [] });
      map.get(d.facultyId).days.push(d);
    }
    return [...map.entries()].map(([id, g]) => ({ id, ...g }));
  }, [filtered]);

  return createPortal(
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", backdropFilter: "blur(6px)", zIndex: 1000, animation: "fadeIn .18s ease" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: isMobile ? "calc(100vw - 24px)" : "clamp(380px, 50vw, 620px)",
        maxHeight: "80vh",
        background: "#fff", borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,.22)",
        zIndex: 1001, display: "flex", flexDirection: "column", overflow: "hidden",
        animation: "modalIn .25s cubic-bezier(.22,1,.36,1)",
      }}>

        {/* Header */}
        <div style={{ padding: "18px 18px 12px", borderBottom: "1px solid rgba(0,0,0,.07)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <m.Icon size={17} color={m.color} />
              </div>
              <div>
                <div style={{ fontFamily: "Montserrat", fontSize: 15, fontWeight: 800, color: "var(--t1)" }}>
                  {panelTitle ? panelTitle : m.label}
                </div>
                <div style={{ fontSize: 11, color: "var(--t3)" }}>
                  {panelTitle ? `${m.label} · ` : ""}{allDays.length} days · {grouped.length} internships
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, border: "1px solid rgba(0,0,0,.1)", borderRadius: 8, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--t2)" }}>
              <X size={14} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(0,0,0,.04)", border: "1px solid rgba(0,0,0,.08)", borderRadius: 9, padding: "7px 11px" }}>
            <Search size={13} color="var(--t3)" />
            <input placeholder="Search internship…" value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", background: "transparent", fontFamily: "Montserrat", fontSize: 12.5, color: "var(--t1)", flex: 1 }} />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {grouped.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--t3)", fontSize: 13 }}>Nothing found</div>
          )}
          {grouped.map((group, gi) => (
            <div key={group.id}>
              <div style={{ padding: "10px 18px 5px", fontSize: 10.5, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".09em", borderTop: gi > 0 ? "1px solid rgba(0,0,0,.04)" : "none", background: "rgba(0,0,0,.018)" }}>
                {group.name} · {group.days.length} {group.days.length === 1 ? "day" : "days"}
              </div>
              {group.days.map((d, di) => (
                <div key={di} onClick={() => onOpenDay(d.facultyId, d.dayIndex)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", cursor: "pointer", transition: "background .14s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,91,255,.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: m.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 8.5, fontWeight: 700, color: m.color, lineHeight: 1 }}>DAY</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: m.color, lineHeight: 1 }}>{d.dayNumber}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>Day {d.dayNumber}</div>
                    <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 1 }}>{d.dateLabel}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "#635bff", fontWeight: 700, flexShrink: 0 }}>
                    Open <ArrowRight size={12} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: "10px 18px", borderTop: "1px solid rgba(0,0,0,.06)", fontSize: 11, color: "var(--t3)", textAlign: "center", flexShrink: 0 }}>
          Click a day to open the internship at that day
        </div>
      </div>
    </>,
    document.body
  );
}

/* ─────────────────────────────────────────────
   STUDENTS PANEL
───────────────────────────────────────────── */
function StudentsPanel({ students, title, subtitle, onClose }) {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const sa = document.querySelector(".sa");
    if (sa) sa.style.overflow = "hidden";
    return () => { if (sa) sa.style.overflow = ""; };
  }, []);

  const getName = (s) => [s?.name, s?.surname, s?.lastname].filter(Boolean).join(" ").trim() || "Unnamed";
  const getId   = (s) => String(s?.studentId || s?._id || s?.id || "").trim();
  const getFac  = (s) => {
    if (typeof s?.nameFaculty === "string" && s.nameFaculty.trim()) return s.nameFaculty.trim();
    if (s?.faculty && typeof s.faculty === "object") return String(s.faculty.name || "").trim();
    return "";
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return students;
    return students.filter((s) => getName(s).toLowerCase().includes(q) || getId(s).toLowerCase().includes(q));
  }, [students, search]);

  return createPortal(
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", backdropFilter: "blur(6px)", zIndex: 1000, animation: "fadeIn .18s ease" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: isMobile ? "calc(100vw - 24px)" : "clamp(380px, 50vw, 620px)",
        maxHeight: "80vh",
        background: "#fff", borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,.22)",
        zIndex: 1001, display: "flex", flexDirection: "column", overflow: "hidden",
        animation: "modalIn .25s cubic-bezier(.22,1,.36,1)",
      }}>

        {/* Header */}
        <div style={{ padding: "18px 18px 12px", borderBottom: "1px solid rgba(0,0,0,.07)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,.11)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserX size={17} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontFamily: "Montserrat", fontSize: 14, fontWeight: 800, color: "var(--t1)", lineHeight: 1.2 }}>{title}</div>
                <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{subtitle || `${students.length} students`}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, border: "1px solid rgba(0,0,0,.1)", borderRadius: 8, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--t2)" }}>
              <X size={14} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(0,0,0,.04)", border: "1px solid rgba(0,0,0,.08)", borderRadius: 9, padding: "7px 11px" }}>
            <Search size={13} color="var(--t3)" />
            <input placeholder="Search student…" value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", background: "transparent", fontFamily: "Montserrat", fontSize: 12.5, color: "var(--t1)", flex: 1 }} />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--t3)", fontSize: 13 }}>Nothing found</div>
          )}
          {filtered.map((s, i) => {
            const name = getName(s);
            const sid  = getId(s);
            const fac  = getFac(s);
            const internship = s._internship || "";
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: "1px solid rgba(0,0,0,.05)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,.09)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#ef4444" }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                  <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fac ? `${fac}` : ""}{internship ? ` · ${internship}` : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: "10px 18px", borderTop: "1px solid rgba(0,0,0,.06)", fontSize: 11, color: "var(--t3)", textAlign: "center", flexShrink: 0 }}>
          {filtered.length} of {students.length} students shown
        </div>
      </div>
    </>,
    document.body
  );
}

/* ─────────────────────────────────────────────
   FORM STATS SECTION
───────────────────────────────────────────── */
const FORM_TABS = [
  { key: "student",    label: "Student Self-Evaluation", endpoint: "/individual-student-evaluations", color: "#635bff", bg: "rgba(99,91,255,.1)" },
  { key: "supervisor", label: "Supervisor Form",          endpoint: "/student-internship-reports",    color: "#06c9a0", bg: "rgba(6,201,160,.12)" },
];

function getFacultyStudents(f) {
  if (Array.isArray(f?.numberOfStudents) && f.numberOfStudents.length > 0) return f.numberOfStudents;
  if (Array.isArray(f?.students) && f.students.length > 0) return f.students;
  return [];
}

function FormStatsSection({ faculties }) {
  const [tab, setTab] = useState("student");
  const [data, setData] = useState({ student: [], supervisor: [] });
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const toList = (r) => Array.isArray(r) ? r : Array.isArray(r?.data) ? r.data : [];
        const [sRes, rRes] = await Promise.all([
          get("/individual-student-evaluations").catch(() => []),
          get("/student-internship-reports").catch(() => []),
        ]);
        setData({ student: toList(sRes), supervisor: toList(rRes) });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeTab = FORM_TABS.find((t) => t.key === tab);

  const evals = useMemo(() => data[tab] || [], [data, tab]);

  const submittedIds = useMemo(() => {
    const ids = new Set();
    for (const e of evals) {
      const sid = String(e?.studentInformation?.studentID || e?.studentId || e?.student_id || "").trim();
      if (sid) ids.add(sid);
    }
    return ids;
  }, [evals]);

  const rows = useMemo(() => faculties.map((f) => {
    const name = f?.name || f?.title || f?.company || "Untitled";
    const company = String(f?.company || "").trim();
    const students = getFacultyStudents(f);
    const totalStudents = students.length;
    const submitted = students.filter((s) => {
      const sid = String(s?.studentId || s?._id || s?.id || "").trim();
      return sid && submittedIds.has(sid);
    });
    const notSubmitted = students
      .filter((s) => {
        const sid = String(s?.studentId || s?._id || s?.id || "").trim();
        return !sid || !submittedIds.has(sid);
      })
      .map((s) => ({ ...s, _internship: name }));
    const total = totalStudents > 0 ? totalStudents : null;
    const evalCount = totalStudents > 0 ? submitted.length : 0;
    const pct = total != null && total > 0 ? Math.round((evalCount / total) * 100) : null;
    return { id: f?._id ?? f?.id ?? name, name, company, evalCount, total, pct, notSubmittedStudents: notSubmitted };
  }), [faculties, submittedIds]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const res = rows.filter((r) => r.name.toLowerCase().includes(q) || r.company.toLowerCase().includes(q));
    res.sort((a, b) => {
      if (sortKey === "name") return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (sortKey === "evalCount") return sortAsc ? a.evalCount - b.evalCount : b.evalCount - a.evalCount;
      if (sortKey === "pct") { const ap = a.pct ?? -1, bp = b.pct ?? -1; return sortAsc ? ap - bp : bp - ap; }
      return 0;
    });
    return res;
  }, [rows, search, sortKey, sortAsc]);

  const totalComplete = rows.filter((r) => r.pct === 100).length;
  const totalWithStudents = rows.filter((r) => r.total != null && r.total > 0).length;
  const totalNotSent = filtered.filter((r) => r.total != null).reduce((s, r) => s + Math.max(0, r.total - r.evalCount), 0);
  const totalSent = filtered.reduce((s, r) => s + r.evalCount, 0);
  const allNotSubmitted = useMemo(() => rows.flatMap((r) => r.notSubmittedStudents), [rows]);

  const [studentsPanel, setStudentsPanel] = useState(null);

  const toggleSort = (k) => {
    if (sortKey === k) setSortAsc((p) => !p);
    else { setSortKey(k); setSortAsc(k === "name"); }
  };

  return (
    <div style={{ background: "rgba(255,255,255,.84)", border: "1px solid rgba(255,255,255,.88)", borderRadius: 18, boxShadow: "0 4px 16px rgba(99,91,255,.07)", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "18px 20px 0", borderBottom: "1px solid rgba(0,0,0,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: activeTab.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={17} color={activeTab.color} />
          </div>
          <div>
            <div style={{ fontFamily: "Montserrat", fontSize: 14.5, fontWeight: 700, color: "var(--t1)" }}>Form Statistics</div>
            <div style={{ fontSize: 11.5, color: "var(--t3)" }}>who submitted the form and who didn't</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {FORM_TABS.map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); setSortKey("name"); setSortAsc(true); }}
              style={{
                padding: "8px 16px", borderRadius: "10px 10px 0 0", border: "none", cursor: "pointer",
                fontFamily: "Montserrat", fontSize: 12.5, fontWeight: 700,
                background: tab === t.key ? "#fff" : "transparent",
                color: tab === t.key ? t.color : "var(--t3)",
                borderBottom: tab === t.key ? `2px solid ${t.color}` : "2px solid transparent",
                transition: "all .15s",
              }}>
              {t.label}
              <span style={{ marginLeft: 6, fontSize: 10.5, fontWeight: 800, padding: "1px 6px", borderRadius: 999, background: t.bg, color: t.color }}>
                {data[t.key]?.length ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary row */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(0,0,0,.06)", display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { IconComp: FileText,  label: "Forms submitted",            value: evals.length,     color: activeTab.color, bg: activeTab.bg,           onClick: null },
          { IconComp: UserCheck, label: "Internships 100% complete",  value: totalComplete,    color: "#22c55e",       bg: "rgba(34,197,94,.12)",   onClick: null },
          { IconComp: UserX,     label: "Students haven't submitted", value: totalNotSent,     color: "#ef4444",       bg: "rgba(239,68,68,.11)",   onClick: allNotSubmitted.length > 0 ? () => setStudentsPanel({ students: allNotSubmitted, title: "Students haven't submitted", subtitle: `${allNotSubmitted.length} students across all internships` }) : null },
          { IconComp: Users,     label: "Internships with students",  value: totalWithStudents, color: "#3b82f6",      bg: "rgba(59,130,246,.12)",  onClick: null },
        ].map(({ IconComp, label, value, color, bg, onClick }) => (
          <div key={label} onClick={onClick || undefined}
            style={{ flex: 1, minWidth: 130, padding: "10px 13px", background: bg, borderRadius: 12, display: "flex", alignItems: "center", gap: 10, cursor: onClick ? "pointer" : "default", transition: "opacity .15s" }}
            onMouseEnter={(e) => { if (onClick) e.currentTarget.style.opacity = ".82"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,.6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <IconComp size={13} color={color} />
            </div>
            <div>
              <div style={{ fontFamily: "Montserrat", fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 10, color, opacity: .8, marginTop: 2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ padding: "10px 18px", borderBottom: "1px solid rgba(0,0,0,.06)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(0,0,0,.04)", border: "1px solid rgba(0,0,0,.08)", borderRadius: 9, padding: "6px 11px", flex: 1, maxWidth: 240 }}>
          <Search size={12} color="var(--t3)" />
          <input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: "Montserrat", fontSize: 12, color: "var(--t1)", flex: 1 }} />
        </div>
        <span style={{ fontSize: 11, color: "var(--t3)" }}>{filtered.length} internships</span>
      </div>

      {/* Table */}
      {loading
        ? <div style={{ padding: "24px", textAlign: "center", color: "var(--t3)", fontSize: 13 }}>Loading…</div>
        : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,.025)" }}>
                  <th onClick={() => toggleSort("name")} style={{ padding: "10px 12px 10px 18px", fontSize: 11, fontWeight: 700, color: "var(--t2)", textAlign: "left", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", minWidth: 180 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>Internship {sortKey === "name" ? (sortAsc ? <ChevronUp size={11} color="var(--a1)" /> : <ChevronDown size={11} color="var(--a1)" />) : <ChevronDown size={11} color="var(--t3)" />}</span>
                  </th>
                  <th onClick={() => toggleSort("evalCount")} style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "var(--t2)", textAlign: "center", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>Submitted {sortKey === "evalCount" ? (sortAsc ? <ChevronUp size={11} color="var(--a1)" /> : <ChevronDown size={11} color="var(--a1)" />) : <ChevronDown size={11} color="var(--t3)" />}</span>
                  </th>
                  <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "var(--t2)", textAlign: "center", whiteSpace: "nowrap" }}>Not submitted</th>
                  <th onClick={() => toggleSort("pct")} style={{ padding: "10px 18px 10px 12px", fontSize: 11, fontWeight: 700, color: "var(--t2)", textAlign: "left", cursor: "pointer", userSelect: "none", minWidth: 160, whiteSpace: "nowrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>Coverage {sortKey === "pct" ? (sortAsc ? <ChevronUp size={11} color="var(--a1)" /> : <ChevronDown size={11} color="var(--a1)" />) : <ChevronDown size={11} color="var(--t3)" />}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "28px 0", color: "var(--t3)", fontSize: 13 }}>Nothing found</td></tr>
                )}
                {filtered.map((r, i) => {
                  const notSent = r.total != null ? r.total - r.evalCount : null;
                  return (
                    <tr key={r.id}
                      style={{ borderTop: "1px solid rgba(0,0,0,.05)", background: i % 2 ? "rgba(0,0,0,.012)" : "transparent" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,91,255,.04)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 ? "rgba(0,0,0,.012)" : "transparent"; }}
                    >
                      <td style={{ padding: "11px 12px 11px 18px", maxWidth: 200 }}>
                        <div style={{ fontWeight: 700, fontSize: 12.5, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                        {r.company && r.company !== r.name && (
                          <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 1 }}>{r.company}</div>
                        )}
                      </td>
                      <td style={{ padding: "11px 12px", textAlign: "center" }}>
                        {r.evalCount > 0
                          ? <span style={{ fontWeight: 700, fontSize: 13, color: "#22c55e" }}>{r.evalCount}</span>
                          : <span style={{ fontSize: 12, color: "var(--t3)" }}>0</span>}
                        {r.total != null && <span style={{ fontSize: 10.5, color: "var(--t3)" }}> / {r.total}</span>}
                      </td>
                      <td
                        style={{ padding: "11px 12px", textAlign: "center", cursor: notSent > 0 ? "pointer" : "default" }}
                        onClick={notSent > 0 ? () => setStudentsPanel({ students: r.notSubmittedStudents, title: r.name, subtitle: `${notSent} student${notSent !== 1 ? "s" : ""} haven't submitted` }) : undefined}
                      >
                        {notSent != null
                          ? notSent > 0
                            ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700, fontSize: 13, color: "#ef4444", borderBottom: "1.5px dashed #ef4444" }}><UserX size={13} />{notSent}</span>
                            : <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 700 }}>✓ all</span>
                          : <span style={{ fontSize: 11, color: "var(--t3)" }}>no data</span>}
                      </td>
                      <td style={{ padding: "11px 18px 11px 12px" }}>
                        {r.pct != null ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: "rgba(0,0,0,.07)", borderRadius: 999, overflow: "hidden" }}>
                              <div style={{ width: `${r.pct}%`, height: "100%", background: r.pct === 100 ? "#22c55e" : r.pct >= 50 ? "#3b82f6" : "#f59e0b", borderRadius: 999, transition: "width .5s" }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", minWidth: 30, textAlign: "right" }}>{r.pct}%</span>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ flex: 1, height: 6, background: "rgba(0,0,0,.07)", borderRadius: 999 }} />
                            <span style={{ fontSize: 10.5, color: "var(--t3)", minWidth: 50, textAlign: "right" }}>no data</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      }

      {!loading && filtered.length > 0 && (
        <div style={{ padding: "9px 18px", borderTop: "1px solid rgba(0,0,0,.06)", display: "flex", gap: 18, flexWrap: "wrap", background: "rgba(0,0,0,.018)" }}>
          <span style={{ fontSize: 11.5, color: "#22c55e", fontWeight: 700 }}>✓ {totalSent} submitted</span>
          {filtered.some((r) => r.total != null) && (
            <span style={{ fontSize: 11.5, color: "#ef4444", fontWeight: 700 }}>✗ {totalNotSent} not submitted</span>
          )}
        </div>
      )}

      {studentsPanel && (
        <StudentsPanel
          students={studentsPanel.students}
          title={studentsPanel.title}
          subtitle={studentsPanel.subtitle}
          onClose={() => setStudentsPanel(null)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   NUMBER CELL
───────────────────────────────────────────── */
function Num({ v, c, onClick }) {
  return (
    <td
      style={{ padding: "11px 12px", textAlign: "center", cursor: onClick && v > 0 ? "pointer" : "default" }}
      onClick={onClick && v > 0 ? onClick : undefined}
    >
      {v > 0
        ? <span style={{ fontWeight: 700, fontSize: 13, color: c, borderBottom: onClick ? `1.5px dashed ${c}` : "none" }}>{v}</span>
        : <span style={{ fontSize: 12, color: "var(--t3)" }}>—</span>}
    </td>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function AdminStatisticsPage({ onNavigate }) {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("missed");
  const [sortAsc, setSortAsc] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [activePanel, setActivePanel] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await get("/faculty");
      setFaculties(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => faculties.map((f) => {
    const stats = computeStats(f);
    return {
      id: f?._id ?? f?.id ?? String(Math.random()),
      facultyId: f?._id ?? f?.id,
      name: f?.name || f?.title || f?.company || "Untitled",
      company: f?.company || "",
      ...stats,
    };
  }), [faculties]);

  const global = useMemo(() => rows.reduce(
    (a, r) => ({
      total: a.total + r.total, approved: a.approved + r.approved,
      submitted: a.submitted + r.submitted, rejected: a.rejected + r.rejected,
      missed: a.missed + r.missed, empty: a.empty + r.empty,
    }),
    { total: 0, approved: 0, submitted: 0, rejected: 0, missed: 0, empty: 0 },
  ), [rows]);

  const daysByStatus = useMemo(() => {
    const map = { approved: [], submitted: [], rejected: [], missed: [], empty: [] };
    for (const f of faculties) {
      const days = Array.isArray(f?.days) ? f.days : [];
      const fId = f?._id ?? f?.id;
      const fName = f?.name || f?.title || f?.company || "Untitled";
      days.forEach((day, idx) => {
        const status = getDayStatus(day);
        const dateRaw = String(day?.date || "").slice(0, 10);
        let dateLabel = "Date not set";
        try {
          if (dateRaw) dateLabel = new Date(dateRaw + "T00:00:00").toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
        } catch { /* noop */ }
        map[status].push({ facultyId: fId, internshipName: fName, dayIndex: idx, dayNumber: idx + 1, dateLabel });
      });
    }
    return map;
  }, [faculties]);

  const tableRows = useMemo(() => {
    const q = search.toLowerCase();
    let res = rows.filter((r) => r.name.toLowerCase().includes(q) || r.company.toLowerCase().includes(q));
    if (statusFilter === "has_approved") res = res.filter((r) => r.approved > 0);
    else if (statusFilter === "has_rejected") res = res.filter((r) => r.rejected > 0);
    else if (statusFilter === "has_missed") res = res.filter((r) => r.missed > 0);
    else if (statusFilter === "complete") res = res.filter((r) => r.progress === 100);
    else if (statusFilter === "incomplete") res = res.filter((r) => r.progress < 100 && r.total > 0);
    res.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "string") return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortAsc ? av - bv : bv - av;
    });
    return res;
  }, [rows, search, sortKey, sortAsc, statusFilter]);

  const topApproved = useMemo(() =>
    [...rows].filter((r) => r.total > 0)
      .sort((a, b) => b.approvalRate - a.approvalRate)
      .slice(0, 5)
      .map((r) => ({ name: r.name, sub: `${r.approved} approved of ${r.total} days`, value: `${r.approvalRate}%`, valueColor: "#22c55e" })),
    [rows]);

  const topMissed = useMemo(() =>
    [...rows].filter((r) => r.missed > 0)
      .sort((a, b) => b.missed - a.missed)
      .slice(0, 5)
      .map((r) => ({ name: r.name, sub: `${r.missed} missed, ${r.rejected} rejected`, value: String(r.missed), valueColor: "#f59e0b" })),
    [rows]);

  const handleOpenDay = useCallback((facultyId, dayIndex) => {
    if (onNavigate) onNavigate(facultyId, dayIndex);
    setActivePanel(null);
  }, [onNavigate]);

  const isMobile = useIsMobile();

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc((p) => !p);
    else { setSortKey(key); setSortAsc(key === "name"); }
  };

  const SortIco = ({ k }) => sortKey === k
    ? (sortAsc ? <ChevronUp size={11} color="var(--a1)" /> : <ChevronDown size={11} color="var(--a1)" />)
    : <ChevronDown size={11} color="var(--t3)" />;

  const ThCell = ({ k, label, align = "left", style: s }) => (
    <th onClick={() => toggleSort(k)} style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "var(--t2)", textAlign: align, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", ...s }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>{label} <SortIco k={k} /></span>
    </th>
  );

  if (loading) return <div className="pp"><PageState variant="loading" title="Loading statistics…" /></div>;
  if (faculties.length === 0) return <div className="pp"><PageState variant="empty" title="No internships" message="No data available for analysis." /></div>;

  const STATUS_FILTERS = [
    { value: "all",          label: "All internships" },
    { value: "has_approved", label: "Has approved" },
    { value: "has_rejected", label: "Has rejected" },
    { value: "has_missed",   label: "Has missed" },
    { value: "complete",     label: "100% complete" },
    { value: "incomplete",   label: "Incomplete" },
  ];

  return (
    <div className="pp" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#635bff,#06c9a0)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(99,91,255,.3)" }}>
            <TrendingUp size={19} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: "Montserrat", fontSize: 20, fontWeight: 800, color: "var(--t1)", margin: 0, lineHeight: 1 }}>Statistics</h2>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--t2)" }}>{faculties.length} internships · {global.total} days total</p>
          </div>
        </div>
        <button className="bg" onClick={fetchData} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Summary KPI */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { IconComp: Briefcase, label: "Internships", value: faculties.length, color: "#635bff", bg: "rgba(99,91,255,.12)" },
          { IconComp: Calendar,  label: "Total days",  value: global.total,    color: "#06c9a0", bg: "rgba(6,201,160,.12)" },
        ].map(({ IconComp, label, value, color, bg }) => (
          <div key={label} style={{ flex: 1, minWidth: 130, padding: "16px 18px", background: `linear-gradient(135deg,${bg},rgba(255,255,255,.5))`, border: `1px solid ${color}22`, borderRadius: 16, boxShadow: "0 4px 16px rgba(99,91,255,.07)" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
              <IconComp size={16} color={color} />
            </div>
            <div style={{ fontFamily: "Montserrat", fontSize: 26, fontWeight: 800, color: "var(--t1)", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Clickable status cards */}
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--t3)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 10 }}>
          Click a card to see all days with that status
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["approved", "submitted", "rejected", "missed", "empty"].map((s) => (
            <KpiCard key={s} status={s} value={global[s]} total={global.total}
              isActive={activePanel === s} onClick={() => setActivePanel(activePanel === s ? null : s)} />
          ))}
        </div>
      </div>

      {/* Insights */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
        <div style={{ background: "rgba(255,255,255,.84)", border: "1px solid rgba(255,255,255,.88)", borderRadius: 18, padding: "20px 22px", boxShadow: "0 4px 16px rgba(99,91,255,.07)" }}>
          <div style={{ fontFamily: "Montserrat", fontSize: 13.5, fontWeight: 700, color: "var(--t1)", marginBottom: 16 }}>Status distribution</div>
          <DonutChart data={[
            { label: "Approved",     value: global.approved,  color: "#22c55e" },
            { label: "Under Review", value: global.submitted, color: "#3b82f6" },
            { label: "Rejected",     value: global.rejected,  color: "#ef4444" },
            { label: "Missed",       value: global.missed,    color: "#f59e0b" },
            { label: "Empty",        value: global.empty,     color: "#e5e7eb" },
          ]} />
        </div>
        <div style={{ background: "rgba(255,255,255,.84)", border: "1px solid rgba(255,255,255,.88)", borderRadius: 18, padding: "20px 22px", boxShadow: "0 4px 16px rgba(99,91,255,.07)" }}>
          <div style={{ fontFamily: "Montserrat", fontSize: 13.5, fontWeight: 700, color: "var(--t1)", marginBottom: 2 }}>Internship progress</div>
          <div style={{ fontSize: 11.5, color: "var(--t3)", marginBottom: 14 }}>how many internships are at each completion %</div>
          <ProgressHistogram rows={rows} />
        </div>
      </div>

      {/* Spotlight */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
        <SpotlightCard title="Top by approval rate" IconComp={Award} iconColor="#22c55e" iconBg="rgba(34,197,94,.12)"
          items={topApproved} emptyText="No approved days" />
        <SpotlightCard title="Most missed days" IconComp={AlertCircle} iconColor="#f59e0b" iconBg="rgba(245,158,11,.12)"
          items={topMissed} emptyText="No missed days" />
      </div>

      {/* Per-internship table */}
      <div style={{ background: "rgba(255,255,255,.84)", border: "1px solid rgba(255,255,255,.88)", borderRadius: 18, boxShadow: "0 4px 16px rgba(99,91,255,.07)", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(0,0,0,.06)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "Montserrat", fontSize: 13.5, fontWeight: 700, color: "var(--t1)", flex: 1, minWidth: 140 }}>Per internship</span>
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(0,0,0,.04)", border: "1px solid rgba(0,0,0,.08)", borderRadius: 9, padding: "6px 11px" }}>
            <Search size={12} color="var(--t3)" />
            <input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", background: "transparent", fontFamily: "Montserrat", fontSize: 12, color: "var(--t1)", width: 130 }} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 9, border: "1px solid rgba(0,0,0,.09)", background: "#fff", fontFamily: "Montserrat", fontSize: 12, color: "var(--t2)", outline: "none", cursor: "pointer" }}>
            {STATUS_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <span style={{ fontSize: 11, color: "var(--t3)" }}>{tableRows.length} / {rows.length}</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,.025)" }}>
                <ThCell k="name"      label="Internship"  style={{ paddingLeft: 18, minWidth: 180 }} />
                <ThCell k="total"     label="Days"        align="center" />
                <ThCell k="approved"  label="Approved"    align="center" />
                <ThCell k="submitted" label="In review"   align="center" />
                <ThCell k="rejected"  label="Rejected"    align="center" />
                <ThCell k="missed"    label="Missed"      align="center" />
                <ThCell k="empty"     label="Empty"       align="center" />
                <ThCell k="progress"  label="Progress"    style={{ minWidth: 160, paddingRight: 18 }} />
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px 0", color: "var(--t3)", fontSize: 13 }}>No internships match the filter</td></tr>
              )}
              {tableRows.map((r, i) => (
                <tr key={r.id}
                  style={{ borderTop: "1px solid rgba(0,0,0,.05)", background: i % 2 ? "rgba(0,0,0,.012)" : "transparent" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,91,255,.04)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 ? "rgba(0,0,0,.012)" : "transparent"; }}
                >
                  <td style={{ padding: "11px 12px 11px 18px", maxWidth: 200 }}>
                    <div style={{ fontWeight: 700, fontSize: 12.5, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                    {r.company && r.company !== r.name && (
                      <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.company}</div>
                    )}
                    <div style={{ marginTop: 5 }}><MiniStatusBar stats={r} /></div>
                  </td>
                  <td style={{ padding: "11px 12px", textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{r.total}</td>
                  <Num v={r.approved}  c="#22c55e" />
                  <Num v={r.submitted} c="#3b82f6" />
                  <Num v={r.rejected}  c="#ef4444" />
                  <Num v={r.missed}    c="#f59e0b" />
                  <Num v={r.empty}     c="#9ca3af" />
                  <td style={{ padding: "11px 18px 11px 12px", minWidth: 160 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "rgba(0,0,0,.07)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ width: `${r.progress}%`, height: "100%", background: "linear-gradient(90deg,#635bff,#06c9a0)", borderRadius: 999, transition: "width .5s" }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)", minWidth: 30, textAlign: "right" }}>{r.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tableRows.length > 0 && (
          <div style={{ padding: "9px 18px", borderTop: "1px solid rgba(0,0,0,.06)", display: "flex", gap: 18, flexWrap: "wrap", background: "rgba(0,0,0,.018)" }}>
            {[
              { label: "total days",   v: tableRows.reduce((s, r) => s + r.total, 0),     c: "var(--t2)" },
              { label: "✓ approved",   v: tableRows.reduce((s, r) => s + r.approved, 0),  c: "#22c55e" },
              { label: "● in review",  v: tableRows.reduce((s, r) => s + r.submitted, 0), c: "#3b82f6" },
              { label: "✗ rejected",   v: tableRows.reduce((s, r) => s + r.rejected, 0),  c: "#ef4444" },
              { label: "! missed",     v: tableRows.reduce((s, r) => s + r.missed, 0),    c: "#f59e0b" },
            ].map(({ label, v, c }) => (
              <span key={label} style={{ fontSize: 11.5, fontWeight: 700, color: c }}>{v} {label}</span>
            ))}
          </div>
        )}
      </div>

      {/* Form stats */}
      <FormStatsSection faculties={faculties} />

      {/* Status panel */}
      {activePanel && (
        <StatusPanel
          status={activePanel}
          allDays={daysByStatus[activePanel] || []}
          onClose={() => setActivePanel(null)}
          onOpenDay={handleOpenDay}
        />
      )}
    </div>
  );
}
