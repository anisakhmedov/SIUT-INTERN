import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { get } from "../utils/apiClient";
import { toast } from "../utils/toast";
import PageState from "./PageState";
import {
  Activity, LogIn, LogOut, RefreshCw, Plus, Edit2, Trash2,
  User, UserPlus, UserCheck, UserX, FileText, Send, CheckCircle2,
  XCircle, Award, MessageSquare, ToggleLeft, ToggleRight, Shield,
  Search, Filter, ChevronLeft, ChevronRight, X, Globe,
  ChevronDown,
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */
const ACTION_CFG = {
  login:                { label: "Login",               Icon: LogIn,        color: "#3b82f6", bg: "rgba(59,130,246,.12)"  },
  login_failed:         { label: "Login Failed",        Icon: XCircle,      color: "#ef4444", bg: "rgba(239,68,68,.11)"   },
  logout:               { label: "Logout",              Icon: LogOut,       color: "#9ba3bb", bg: "rgba(155,163,187,.11)" },
  session_refresh:      { label: "Session Refresh",     Icon: RefreshCw,    color: "#6366f1", bg: "rgba(99,102,241,.11)"  },
  internship_created:   { label: "Internship Created",  Icon: Plus,         color: "#635bff", bg: "rgba(99,91,255,.12)"   },
  internship_updated:   { label: "Internship Updated",  Icon: Edit2,        color: "#635bff", bg: "rgba(99,91,255,.12)"   },
  internship_deleted:   { label: "Internship Deleted",  Icon: Trash2,       color: "#ef4444", bg: "rgba(239,68,68,.11)"   },
  student_updated:      { label: "Student Updated",     Icon: User,         color: "#06c9a0", bg: "rgba(6,201,160,.12)"   },
  passport_uploaded:    { label: "Passport Uploaded",   Icon: FileText,     color: "#06c9a0", bg: "rgba(6,201,160,.12)"   },
  medicine_uploaded:    { label: "Medicine Uploaded",   Icon: FileText,     color: "#06c9a0", bg: "rgba(6,201,160,.12)"   },
  report_submitted:     { label: "Report Submitted",    Icon: Send,         color: "#f5a623", bg: "rgba(245,166,35,.12)"  },
  report_approved:      { label: "Report Approved",     Icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,.12)"   },
  report_rejected:      { label: "Report Rejected",     Icon: XCircle,      color: "#ef4444", bg: "rgba(239,68,68,.11)"   },
  evaluation_submitted: { label: "Evaluation Submitted",Icon: Award,        color: "#f5a623", bg: "rgba(245,166,35,.12)"  },
  user_created:         { label: "User Created",        Icon: UserPlus,     color: "#ff5fa0", bg: "rgba(255,95,160,.12)"  },
  user_updated:         { label: "User Updated",        Icon: UserCheck,    color: "#ff5fa0", bg: "rgba(255,95,160,.12)"  },
  user_deleted:         { label: "User Deleted",        Icon: UserX,        color: "#ef4444", bg: "rgba(239,68,68,.11)"   },
  comment_added:        { label: "Comment Added",       Icon: MessageSquare,color: "#9ba3bb", bg: "rgba(155,163,187,.11)" },
  comment_deleted:      { label: "Comment Deleted",     Icon: MessageSquare,color: "#ef4444", bg: "rgba(239,68,68,.11)"   },
  maintenance_enabled:  { label: "Maintenance ON",      Icon: ToggleRight,  color: "#f59e0b", bg: "rgba(245,158,11,.12)"  },
  maintenance_disabled: { label: "Maintenance OFF",     Icon: ToggleLeft,   color: "#22c55e", bg: "rgba(34,197,94,.12)"   },
  day_approved:         { label: "Day Approved",        Icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,.12)"   },
  day_rejected:         { label: "Day Rejected",        Icon: XCircle,      color: "#ef4444", bg: "rgba(239,68,68,.11)"   },
  day_pending:          { label: "Day Pending",         Icon: RefreshCw,    color: "#f5a623", bg: "rgba(245,166,35,.12)"  },
};

const ENTITY_CFG = {
  auth:       { label: "Auth",       color: "#3b82f6" },
  user:       { label: "User",       color: "#ff5fa0" },
  internship: { label: "Internship", color: "#635bff" },
  student:    { label: "Student",    color: "#06c9a0" },
  report:     { label: "Report",     color: "#f5a623" },
  evaluation: { label: "Evaluation", color: "#f5a623" },
  system:     { label: "System",     color: "#f59e0b" },
  comment:    { label: "Comment",    color: "#9ba3bb" },
};

const ROLE_CFG = {
  admin:     { color: "#635bff", bg: "rgba(99,91,255,.1)"   },
  developer: { color: "#06c9a0", bg: "rgba(6,201,160,.1)"   },
  tutor:     { color: "#3b82f6", bg: "rgba(59,130,246,.1)"  },
  professor: { color: "#f5a623", bg: "rgba(245,166,35,.1)"  },
  rector:    { color: "#ff5fa0", bg: "rgba(255,95,160,.1)"  },
  student:   { color: "#9ba3bb", bg: "rgba(155,163,187,.1)" },
};

const UNKNOWN_ACTION = { label: "Unknown", Icon: Activity, color: "#9ba3bb", bg: "rgba(155,163,187,.11)" };

const ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  { value: "login",                label: "Login" },
  { value: "login_failed",         label: "Login Failed" },
  { value: "logout",               label: "Logout" },
  { value: "session_refresh",      label: "Session Refresh" },
  { value: "internship_created",   label: "Internship Created" },
  { value: "internship_updated",   label: "Internship Updated" },
  { value: "internship_deleted",   label: "Internship Deleted" },
  { value: "student_updated",      label: "Student Updated" },
  { value: "passport_uploaded",    label: "Passport Uploaded" },
  { value: "medicine_uploaded",    label: "Medicine Uploaded" },
  { value: "report_submitted",     label: "Report Submitted" },
  { value: "report_approved",      label: "Report Approved" },
  { value: "report_rejected",      label: "Report Rejected" },
  { value: "evaluation_submitted", label: "Evaluation Submitted" },
  { value: "user_created",         label: "User Created" },
  { value: "user_updated",         label: "User Updated" },
  { value: "user_deleted",         label: "User Deleted" },
  { value: "comment_added",        label: "Comment Added" },
  { value: "comment_deleted",      label: "Comment Deleted" },
  { value: "maintenance_enabled",  label: "Maintenance ON"  },
  { value: "maintenance_disabled", label: "Maintenance OFF" },
  { value: "day_approved",         label: "Day Approved"    },
  { value: "day_rejected",         label: "Day Rejected"    },
  { value: "day_pending",          label: "Day Pending"     },
];

const ENTITY_OPTIONS = [
  { value: "",           label: "All entities"  },
  { value: "auth",       label: "Auth"          },
  { value: "user",       label: "Users"         },
  { value: "internship", label: "Internships"   },
  { value: "student",    label: "Students"      },
  { value: "report",     label: "Reports"       },
  { value: "evaluation", label: "Evaluations"   },
  { value: "system",     label: "System"        },
  { value: "comment",    label: "Comments"      },
];

const LIMIT = 50;

const APPROVED_LABEL = { 1: "Pending", 2: "Approved", 3: "Rejected" };

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function fmt(ts) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString("ru-RU", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  } catch { return String(ts); }
}

function ago(ts) {
  if (!ts) return "";
  try {
    const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (s < 60)  return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60)  return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)  return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch { return ""; }
}

/* ─────────────────────────────────────────────
   ATOM COMPONENTS
───────────────────────────────────────────── */
function ActionBadge({ action, large }) {
  const { label, Icon, color, bg } = ACTION_CFG[action] || UNKNOWN_ACTION;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: large ? 8 : 5, padding: large ? "5px 10px" : "3px 8px", borderRadius: large ? 10 : 999, background: bg }}>
      <Icon size={large ? 13 : 11} color={color} />
      <span style={{ fontSize: large ? 12 : 10.5, fontWeight: 700, color }}>{label}</span>
    </div>
  );
}

function RoleBadge({ role }) {
  const r = String(role || "").toLowerCase();
  const { color, bg } = ROLE_CFG[r] || { color: "#9ba3bb", bg: "rgba(155,163,187,.1)" };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: bg, color, textTransform: "capitalize" }}>
      {role || "—"}
    </span>
  );
}

function EntityBadge({ entity }) {
  const { label, color } = ENTITY_CFG[entity] || { label: entity, color: "#9ba3bb" };
  return <span style={{ fontSize: 10.5, fontWeight: 700, color }}>{label || "—"}</span>;
}

function NativeSelect({ value, onChange, options, style }) {
  return (
    <div style={{ position: "relative", ...style }}>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ appearance: "none", WebkitAppearance: "none", width: "100%", padding: "7px 28px 7px 10px", background: "rgba(255,255,255,.9)", border: "1px solid rgba(0,0,0,.1)", borderRadius: 9, fontFamily: "Montserrat", fontSize: 12.5, fontWeight: 600, color: "var(--t1)", cursor: "pointer", outline: "none" }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={12} color="var(--t3)" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
    </div>
  );
}

function FilterPill({ label, onRemove }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px 3px 10px", borderRadius: 999, background: "rgba(99,91,255,.1)", border: "1px solid rgba(99,91,255,.2)" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#635bff" }}>{label}</span>
      <button onClick={onRemove} style={{ display: "flex", alignItems: "center", padding: 0, border: "none", background: "none", cursor: "pointer", color: "#635bff" }}>
        <X size={10} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOG DETAIL MODAL
───────────────────────────────────────────── */
function LogDetailModal({ log, onClose }) {
  const { label, Icon, color, bg } = ACTION_CFG[log.action] || UNKNOWN_ACTION;

  const detailRows = log.details
    ? Object.entries(log.details).map(([k, v]) => {
        if (k === "approved" && APPROVED_LABEL[v]) return { k, v: `${APPROVED_LABEL[v]} (${v})` };
        if (k === "dayNumber") return { k, v: `Day ${v}` };
        return { k, v: Array.isArray(v) ? v.join(", ") : String(v ?? "—") };
      })
    : [];

  const Row = ({ k, v }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <span style={{ fontSize: 11.5, color: "var(--t3)", minWidth: 60, flexShrink: 0 }}>{k}</span>
      <span style={{ fontSize: 12.5, color: "var(--t1)", fontWeight: 600, wordBreak: "break-all" }}>{v}</span>
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>{title}</div>
      <div style={{ background: "rgba(0,0,0,.03)", borderRadius: 12, padding: "13px 14px", display: "flex", flexDirection: "column", gap: 9 }}>
        {children}
      </div>
    </div>
  );

  return createPortal(
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.48)", backdropFilter: "blur(6px)", zIndex: 1000, animation: "fadeIn .18s ease" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "clamp(340px,90vw,560px)", maxHeight: "85vh", background: "#fff", borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,.22)", zIndex: 1001, display: "flex", flexDirection: "column", overflow: "hidden", animation: "modalIn .25s cubic-bezier(.22,1,.36,1)" }}>

        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(0,0,0,.07)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ fontFamily: "Montserrat", fontSize: 15, fontWeight: 800, color: "var(--t1)" }}>{label}</div>
                <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{fmt(log.timestamp)}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, border: "1px solid rgba(0,0,0,.1)", borderRadius: 8, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--t2)", flexShrink: 0 }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          <Section title="Who">
            <Row k="Name"  v={log.userName  || "—"} />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 11.5, color: "var(--t3)", minWidth: 60 }}>Role</span>
              <RoleBadge role={log.userRole} />
            </div>
            <Row k="Login" v={log.userLogin || "—"} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 11.5, color: "var(--t3)", minWidth: 60, flexShrink: 0 }}>ID</span>
              <span style={{ fontSize: 11, color: "var(--t3)", fontFamily: "monospace", wordBreak: "break-all" }}>{log.userId || "—"}</span>
            </div>
          </Section>

          {(log.entity || log.entityId || log.entityName) && (
            <Section title="Object">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11.5, color: "var(--t3)", minWidth: 60 }}>Type</span>
                <EntityBadge entity={log.entity} />
              </div>
              <Row k="Name" v={log.entityName || "—"} />
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 11.5, color: "var(--t3)", minWidth: 60, flexShrink: 0 }}>ID</span>
                <span style={{ fontSize: 11, color: "var(--t3)", fontFamily: "monospace", wordBreak: "break-all" }}>{log.entityId || "—"}</span>
              </div>
            </Section>
          )}

          {detailRows.length > 0 && (
            <Section title="Details">
              {detailRows.map(({ k, v }) => <Row key={k} k={k} v={v} />)}
            </Section>
          )}

          <Section title="Technical">
            <Row k="IP"     v={log.ip || "—"} />
            <Row k="Device" v={log.userAgent ? log.userAgent.slice(0, 100) + (log.userAgent.length > 100 ? "…" : "") : "—"} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 11.5, color: "var(--t3)", minWidth: 60, flexShrink: 0 }}>Log ID</span>
              <span style={{ fontSize: 10.5, color: "var(--t3)", fontFamily: "monospace", wordBreak: "break-all" }}>{log.id || log._id || "—"}</span>
            </div>
          </Section>
        </div>
      </div>
    </>,
    document.body,
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function ActivityLogsPage() {
  const [logs,    setLogs]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [selected, setSelected] = useState(null);

  const [filters, setFilters] = useState({
    action: "", entity: "", userId: "", startDate: "", endDate: "",
  });

  const buildQS = useCallback((f, p) => {
    const q = new URLSearchParams();
    if (f.action)    q.set("action",    f.action);
    if (f.entity)    q.set("entity",    f.entity);
    if (f.userId)    q.set("userId",    f.userId);
    if (f.startDate) q.set("startDate", f.startDate);
    if (f.endDate)   q.set("endDate",   f.endDate);
    q.set("page",  String(p));
    q.set("limit", String(LIMIT));
    return q.toString();
  }, []);

  const fetchLogs = useCallback(async (f, p) => {
    setLoading(true);
    try {
      const data = await get(`/activity-logs?${buildQS(f, p)}`);
      setLogs(Array.isArray(data?.logs) ? data.logs : []);
      setTotal(data?.total ?? 0);
      setPages(data?.pages ?? 1);
    } catch (err) {
      toast.error(err?.message || "Failed to load activity logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [buildQS]);

  useEffect(() => { fetchLogs(filters, page); }, [fetchLogs, filters, page]);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ action: "", entity: "", userId: "", startDate: "", endDate: "" });
    setPage(1);
  };

  const activeFilters = Object.entries(filters).filter(([, v]) => v);

  const visible = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter((l) =>
      String(l.userName   || "").toLowerCase().includes(q) ||
      String(l.userLogin  || "").toLowerCase().includes(q) ||
      String(l.entityName || "").toLowerCase().includes(q) ||
      String(l.ip         || "").includes(q),
    );
  }, [logs, search]);

  const topAction = useMemo(() => {
    const counts = {};
    for (const l of logs) counts[l.action] = (counts[l.action] || 0) + 1;
    const entries = Object.entries(counts);
    if (!entries.length) return null;
    const key = entries.sort((a, b) => b[1] - a[1])[0][0];
    return ACTION_CFG[key]?.label || key;
  }, [logs]);

  /* ── Pagination helpers ── */
  const pageNumbers = useMemo(() => {
    if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= pages - 2) return [pages - 4, pages - 3, pages - 2, pages - 1, pages];
    return [page - 2, page - 1, page, page + 1, page + 2];
  }, [page, pages]);

  return (
    <div className="pp" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#635bff,#06c9a0)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(99,91,255,.3)", flexShrink: 0 }}>
            <Activity size={19} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: "Montserrat", fontSize: 20, fontWeight: 800, color: "var(--t1)", margin: 0, lineHeight: 1 }}>Activity Logs</h2>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--t2)" }}>
              {total > 0 ? `${total.toLocaleString()} records total` : "Who did what and when"}
            </p>
          </div>
        </div>
        <button className="bg" onClick={() => fetchLogs(filters, page)} disabled={loading}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <RefreshCw size={13} style={{ animation: loading ? "spin .7s linear infinite" : "none" }} />
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* ── KPI ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          { label: "Total records", value: total.toLocaleString(), color: "#635bff", bg: "rgba(99,91,255,.1)",  Icon: Activity     },
          { label: "This page",     value: logs.length,            color: "#06c9a0", bg: "rgba(6,201,160,.1)",  Icon: FileText     },
          { label: "Pages",         value: pages,                  color: "#f5a623", bg: "rgba(245,166,35,.1)", Icon: ChevronRight },
          { label: "Top action",    value: topAction || "—",       color: "#ff5fa0", bg: "rgba(255,95,160,.1)", Icon: Shield       },
        ].map(({ label, value, color, bg, Icon: I }) => (
          <div key={label} style={{ flex: 1, minWidth: 130, padding: "13px 16px", background: `linear-gradient(135deg,${bg},rgba(255,255,255,.5))`, border: `1px solid ${color}22`, borderRadius: 14, boxShadow: "0 4px 16px rgba(99,91,255,.07)" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <I size={14} color={color} />
            </div>
            <div style={{ fontFamily: "Montserrat", fontSize: 22, fontWeight: 800, color: "var(--t1)", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
            <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ background: "rgba(255,255,255,.84)", border: "1px solid rgba(255,255,255,.88)", borderRadius: 16, boxShadow: "0 4px 16px rgba(99,91,255,.07)", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: activeFilters.length ? "1px solid rgba(0,0,0,.06)" : "none", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Filter size={13} color="var(--t2)" />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--t1)" }}>Filters</span>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,.04)", border: "1px solid rgba(0,0,0,.08)", borderRadius: 8, padding: "6px 10px", flex: 1, maxWidth: 220, minWidth: 120 }}>
            <Search size={12} color="var(--t3)" />
            <input placeholder="Search user, entity…" value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", background: "transparent", fontFamily: "Montserrat", fontSize: 12, color: "var(--t1)", flex: 1, minWidth: 0 }} />
          </div>

          <NativeSelect value={filters.action} onChange={(v) => setFilter("action", v)} options={ACTION_OPTIONS} style={{ minWidth: 162 }} />
          <NativeSelect value={filters.entity} onChange={(v) => setFilter("entity", v)} options={ENTITY_OPTIONS} style={{ minWidth: 132 }} />

          <input type="date" value={filters.startDate} onChange={(e) => setFilter("startDate", e.target.value)}
            style={{ padding: "7px 10px", border: "1px solid rgba(0,0,0,.1)", borderRadius: 9, fontFamily: "Montserrat", fontSize: 12, color: "var(--t1)", background: "rgba(255,255,255,.9)", outline: "none" }} />
          <span style={{ fontSize: 11, color: "var(--t3)" }}>—</span>
          <input type="date" value={filters.endDate} onChange={(e) => setFilter("endDate", e.target.value)}
            style={{ padding: "7px 10px", border: "1px solid rgba(0,0,0,.1)", borderRadius: 9, fontFamily: "Montserrat", fontSize: 12, color: "var(--t1)", background: "rgba(255,255,255,.9)", outline: "none" }} />

          {activeFilters.length > 0 && (
            <button onClick={clearFilters}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, background: "rgba(239,68,68,.07)", color: "#ef4444", fontFamily: "Montserrat", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              <X size={11} /> Clear
            </button>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div style={{ padding: "8px 16px", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {activeFilters.map(([key, value]) => (
              <FilterPill key={key} label={`${key}: ${value}`} onRemove={() => setFilter(key, "")} />
            ))}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{ background: "rgba(255,255,255,.84)", border: "1px solid rgba(255,255,255,.88)", borderRadius: 16, boxShadow: "0 4px 16px rgba(99,91,255,.07)", overflow: "hidden" }}>
        {loading ? (
          <div className="pp"><PageState variant="loading" title="Loading logs…" /></div>
        ) : visible.length === 0 ? (
          <div className="pp"><PageState variant="empty" title="No logs found" message="Try adjusting filters or date range." /></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,.025)" }}>
                  {[
                    { label: "Action", pl: 18, minW: 170 },
                    { label: "User",           minW: 180 },
                    { label: "Object",         minW: 170 },
                    { label: "IP",             minW: 120 },
                    { label: "Time",   pr: 18, minW: 140 },
                  ].map(({ label, pl, pr, minW }) => (
                    <th key={label} style={{ padding: `10px ${pr ?? 12}px 10px ${pl ?? 12}px`, fontSize: 11, fontWeight: 700, color: "var(--t2)", textAlign: "left", whiteSpace: "nowrap", minWidth: minW }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((log, i) => (
                  <tr key={log.id || log._id || i}
                    onClick={() => setSelected(log)}
                    style={{ borderTop: "1px solid rgba(0,0,0,.05)", cursor: "pointer", background: i % 2 ? "rgba(0,0,0,.012)" : "transparent", transition: "background .12s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,91,255,.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 ? "rgba(0,0,0,.012)" : "transparent"; }}
                  >
                    {/* Action */}
                    <td style={{ padding: "10px 12px 10px 18px" }}>
                      <ActionBadge action={log.action} />
                    </td>

                    {/* User */}
                    <td style={{ padding: "10px 12px", maxWidth: 200 }}>
                      {log.userName || log.userLogin ? (
                        <>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {log.userName || "—"}
                          </div>
                          <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                            {log.userLogin && <span style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: 110 }}>{log.userLogin}</span>}
                            {log.userRole  && <RoleBadge role={log.userRole} />}
                          </div>
                        </>
                      ) : (
                        <span style={{ fontSize: 11.5, color: "var(--t3)", fontStyle: "italic" }}>anonymous</span>
                      )}
                    </td>

                    {/* Object */}
                    <td style={{ padding: "10px 12px", maxWidth: 200 }}>
                      {log.entityName || log.entity ? (
                        <>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {log.entityName || "—"}
                          </div>
                          <div style={{ marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
                            <EntityBadge entity={log.entity} />
                            {log.details?.dayNumber != null && (
                              <span style={{ fontSize: 10.5, color: "var(--t3)" }}>· Day {log.details.dayNumber}</span>
                            )}
                          </div>
                        </>
                      ) : (
                        <span style={{ fontSize: 11.5, color: "var(--t3)" }}>—</span>
                      )}
                    </td>

                    {/* IP */}
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Globe size={10} color="var(--t3)" />
                        <span style={{ fontSize: 11, color: "var(--t2)", fontFamily: "monospace" }}>{log.ip || "—"}</span>
                      </div>
                    </td>

                    {/* Time */}
                    <td style={{ padding: "10px 18px 10px 12px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--t2)" }}>{ago(log.timestamp)}</div>
                      <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 2 }}>{fmt(log.timestamp)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(0,0,0,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontSize: 11.5, color: "var(--t2)" }}>
              Page <strong>{page}</strong> of <strong>{pages}</strong> · {total.toLocaleString()} records
            </span>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", border: "1px solid rgba(0,0,0,.1)", borderRadius: 8, background: page <= 1 ? "rgba(0,0,0,.04)" : "#fff", color: page <= 1 ? "var(--t3)" : "var(--t1)", fontFamily: "Montserrat", fontSize: 12, fontWeight: 600, cursor: page <= 1 ? "default" : "pointer" }}>
                <ChevronLeft size={13} /> Prev
              </button>
              {pageNumbers.map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 32, height: 32, border: "1px solid", borderColor: page === p ? "#635bff" : "rgba(0,0,0,.1)", borderRadius: 8, background: page === p ? "rgba(99,91,255,.12)" : "#fff", color: page === p ? "#635bff" : "var(--t1)", fontFamily: "Montserrat", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages || loading}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", border: "1px solid rgba(0,0,0,.1)", borderRadius: 8, background: page >= pages ? "rgba(0,0,0,.04)" : "#fff", color: page >= pages ? "var(--t3)" : "var(--t1)", fontFamily: "Montserrat", fontSize: 12, fontWeight: 600, cursor: page >= pages ? "default" : "pointer" }}>
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {!loading && visible.length > 0 && (
          <div style={{ padding: "8px 18px", borderTop: "1px solid rgba(0,0,0,.05)", background: "rgba(0,0,0,.018)", display: "flex", gap: 14, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--t3)" }}>Click any row to see full details</span>
            <span style={{ fontSize: 11, color: "var(--t2)" }}>{visible.length} entries shown</span>
          </div>
        )}
      </div>

      {selected && <LogDetailModal log={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
