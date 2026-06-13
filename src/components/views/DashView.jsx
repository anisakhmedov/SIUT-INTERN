import { useState, useMemo } from "react";
import {
  Users, MessageSquare, Star, TrendingUp,
  MapPin, Calendar, Clock, User, Phone, ChevronRight, ChevronLeft,
} from "lucide-react";
import AnimNum from "../shared/AnimNum";
import Reveal from "../shared/Reveal";
import { normalizeStatus } from "../../utils/internshipUtils";
import { hasReportContent } from "../../utils/reportUtils";

const PAGE_SIZE = 12;

const clamp = (v) => Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0));

function getProgress(intern) {
  const days = Array.isArray(intern.days) ? intern.days : [];
  if (days.length) {
    const reported = days.filter((d) => hasReportContent(d)).length;
    return clamp(Math.round((reported / days.length) * 100));
  }
  const stored = Number.parseFloat(String(intern.progressAll || "").replace("%", ""));
  return Number.isFinite(stored) ? clamp(Math.round(stored)) : 0;
}

function parseDateStr(v) {
  if (!v) return null;
  const iso = String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
  const loc = String(v).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (loc) return new Date(+loc[3], +loc[2] - 1, +loc[1]);
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function fmtDate(v) {
  const d = parseDateStr(v);
  if (!d) return "";
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function getDuration(intern) {
  const s = parseDateStr(intern.start);
  const e = parseDateStr(intern.end);
  if (!s || !e) return "N/A";
  const days = Math.max(0, Math.ceil((e - s) / 86400000) + 1);
  return `${days} day${days === 1 ? "" : "s"}`;
}

function getWhen(intern) {
  const s = fmtDate(intern.start);
  const e = fmtDate(intern.end);
  if (s && e) return `${s} – ${e}`;
  return s || e || "N/A";
}

function getTutorLabel(intern) {
  const t = intern.tutor;
  if (!t) return "Not assigned";
  if (typeof t === "string") return t.trim() || "Not assigned";
  const name = [t.name, t.surname, t.lastname].filter(Boolean).join(" ").trim();
  return name || t.login || t.email || "Not assigned";
}

function getTutorContact(intern) {
  const t = intern.tutor;
  if (!t || typeof t === "string") return null;
  return t.phone || t.email || t.login || null;
}

function getTutorInitials(intern) {
  const label = getTutorLabel(intern);
  if (!label || label === "Not assigned") return "?";
  return label.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}

function getMapUrl(intern) {
  const raw = intern.locationYmaps;
  const coords = Array.isArray(raw) ? raw : Array.isArray(raw?.coords) ? raw.coords : null;
  if (coords?.length === 2) {
    const lat = Number(coords[0]), lng = Number(coords[1]);
    if (!Number.isNaN(lat) && !Number.isNaN(lng))
      return `https://yandex.com/maps/?pt=${lng},${lat}&z=15&l=map`;
  }
  const loc = (intern.location || "").trim();
  return loc ? `https://yandex.com/maps/?text=${encodeURIComponent(loc)}` : null;
}

const STATUS_STYLE = {
  "In Progress": { dot: "#3b82f6", bg: "rgba(59,130,246,.1)",  text: "#1d4ed8" },
  "Completed":   { dot: "#22c55e", bg: "rgba(34,197,94,.1)",   text: "#166534" },
  "Pending":     { dot: "#f5a623", bg: "rgba(245,166,35,.12)", text: "#92400e" },
  "Not Started": { dot: "#94a3b8", bg: "rgba(148,163,184,.12)",text: "#475569" },
};

const PILLS = [
  { value: "all",          label: "All",          activeClass: "dw-status-pill--active-all"       },
  { value: "In Progress",  label: "In Progress",  activeClass: "dw-status-pill--active-progress"  },
  { value: "Completed",    label: "Completed",    activeClass: "dw-status-pill--active-completed" },
  { value: "Pending",      label: "Pending",      activeClass: "dw-status-pill--active-pending"   },
  { value: "Not Started",  label: "Not Started",  activeClass: "dw-status-pill--active-pending"   },
];

export default function DashView({ internships, feedbacks, onOpen, user }) {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("all");
  const [page, setPage]           = useState(1);

  const avgRating = useMemo(() => {
    const rated = (feedbacks || []).filter((f) => typeof f.rating === "number" && f.rating > 0);
    if (!rated.length) return null;
    return parseFloat((rated.reduce((s, f) => s + f.rating, 0) / rated.length).toFixed(1));
  }, [feedbacks]);

  const total     = internships.length;
  const completed = useMemo(() => internships.filter((i) => normalizeStatus(i.status) === "Completed").length, [internships]);

  const filtered = useMemo(() => {
    let list = internships;
    if (statusFilter !== "all") {
      list = list.filter((i) => normalizeStatus(i.status) === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) =>
        i.title?.toLowerCase().includes(q) ||
        i.company?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [internships, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleFilter = (val) => { setStatus(val); setPage(1); };
  const handleSearch = (val) => { setSearch(val);  setPage(1); };

  const kpis = [
    { label: "Total Interns", v: total,                sfx: "",  disp: null,        I: Users,         color: "#635bff" },
    { label: "Feedback",      v: feedbacks.length,     sfx: "",  disp: null,        I: MessageSquare, color: "#10b981" },
    { label: "Avg Rating",    v: avgRating ? Math.round(avgRating * 10) : 0, sfx: "", disp: avgRating ?? "—", I: Star, color: "#f59e0b" },
    { label: "Completion",    v: total ? Math.round((completed / total) * 100) : 0, sfx: "%", disp: null, I: TrendingUp, color: "#635bff" },
  ];

  return (
    <div className="pp">
      <style>{`
        .ov-filters {
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 20px;
          backdrop-filter: blur(20px);
          box-shadow: 0 4px 18px rgba(99,91,255,.05);
        }
        .ov-filter-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .ov-search-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,.9);
          border: 1.5px solid rgba(0,0,0,.1);
          border-radius: 11px;
          padding: 8px 14px;
          flex: 1;
          min-width: 180px;
          max-width: 280px;
          transition: border-color .2s, box-shadow .2s;
        }
        .ov-search-wrap:focus-within {
          border-color: var(--a1, #635bff);
          box-shadow: 0 0 0 3px rgba(99,91,255,.1);
        }
        .ov-search-icon { color: var(--t3, #9ba3bb); flex-shrink: 0; width: 15px; height: 15px; }
        .ov-search-input {
          border: none; outline: none; background: transparent;
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 13px; color: var(--t1, #0c0e18); flex: 1; min-width: 0;
        }
        .ov-search-input::placeholder { color: var(--t3, #9ba3bb); }
        .ov-search-clear {
          background: none; border: none; padding: 0; cursor: pointer;
          color: var(--t3, #9ba3bb); display: flex; align-items: center;
          transition: color .18s; flex-shrink: 0;
        }
        .ov-search-clear:hover { color: var(--t2, #5a6278); }
        .ov-pills { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
        .ov-pill {
          padding: 7px 13px; border-radius: 999px;
          border: 1.5px solid rgba(0,0,0,.1);
          background: rgba(255,255,255,.85);
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 12px; font-weight: 600;
          color: var(--t2, #5a6278);
          cursor: pointer; transition: all .2s; white-space: nowrap;
        }
        .ov-pill:hover { border-color: rgba(99,91,255,.3); color: var(--a1,#635bff); background: rgba(99,91,255,.06); }
        .ov-pill--all       { background: linear-gradient(135deg,var(--a1,#635bff),var(--a2,#06c9a0)); color:#fff; border-color:transparent; box-shadow:0 4px 14px rgba(99,91,255,.3); }
        .ov-pill--progress  { background: linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; border-color:transparent; box-shadow:0 4px 14px rgba(59,130,246,.3); }
        .ov-pill--completed { background: linear-gradient(135deg,#22c55e,#16a34a); color:#fff; border-color:transparent; box-shadow:0 4px 14px rgba(34,197,94,.3);  }
        .ov-pill--pending   { background: linear-gradient(135deg,#f5a623,#e08800); color:#fff; border-color:transparent; box-shadow:0 4px 14px rgba(245,166,35,.3); }
      `}</style>

      {/* Header */}
      <Reveal>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "Montserrat", fontSize: 20, fontWeight: 800, color: "var(--t1)", marginBottom: 3 }}>
            Work in progress, {user?.name || "User"}
          </div>
          <div style={{ fontSize: 13, color: "var(--t3)" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>
      </Reveal>

      {/* KPI strip */}
      <Reveal delay={50}>
        <div className="gc" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", marginBottom: 20, padding: "14px 0" }}>
          {kpis.map((m, i) => (
            <div key={m.label} style={{ padding: "2px 20px", borderLeft: i > 0 ? "1px solid var(--br)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                <m.I size={11} color={m.color} />
                <span style={{ fontSize: 10, color: "var(--t3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</span>
              </div>
              <div style={{ fontFamily: "Montserrat", fontSize: 26, fontWeight: 800, color: "var(--t1)", lineHeight: 1 }}>
                {m.disp != null ? m.disp : <AnimNum target={m.v} sfx={m.sfx} />}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Filter bar */}
      <Reveal delay={90}>
        <div className="ov-filters">
          <div className="ov-filter-bar">
            <div className="ov-search-wrap">
              <svg className="ov-search-icon" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
                <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                className="ov-search-input"
                type="text"
                placeholder="Search internships..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {search && (
                <button className="ov-search-clear" onClick={() => handleSearch("")} aria-label="Clear search">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>

            <div className="ov-pills">
              {PILLS.map(({ value, label, activeClass }) => {
                const isActive = statusFilter === value;
                const cls = isActive
                  ? `ov-pill ov-pill--${activeClass.replace("dw-status-pill--active-", "")}`
                  : "ov-pill";
                return (
                  <button key={value} type="button" className={cls} onClick={() => handleFilter(value)}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Cards */}
      <Reveal delay={120}>
        <div style={{ fontFamily: "Montserrat", fontSize: 14, fontWeight: 700, color: "var(--t1)", marginBottom: 14 }}>
          Internships
          <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 500, color: "var(--t3)" }}>{filtered.length}</span>
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <Reveal delay={130}>
          <div className="gc" style={{ padding: 40, textAlign: "center", color: "var(--t3)", fontSize: 13 }}>
            {total === 0 ? "No internships yet." : "No internships match your filters."}
          </div>
        </Reveal>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 12 }}>
            {paged.map((intern, idx) => {
              const status   = normalizeStatus(intern.status);
              const st       = STATUS_STYLE[status] || STATUS_STYLE["Pending"];
              const progress = getProgress(intern);
              const hue      = Math.round((progress / 100) * 120);
              const tutor    = getTutorLabel(intern);
              const initials = getTutorInitials(intern);
              const contact  = getTutorContact(intern);
              const mapUrl   = getMapUrl(intern);

              return (
                <Reveal key={intern.id} delay={130 + idx * 25}>
                  <div
                    className="gc"
                    onClick={() => onOpen(intern)}
                    style={{ padding: 0, cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column", transition: "transform .15s, box-shadow .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    <div style={{ padding: "15px 16px 13px", flex: 1 }}>

                      {/* Title + badge */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                        <div style={{ fontFamily: "Montserrat", fontSize: 13, fontWeight: 700, color: "var(--t1)", lineHeight: 1.35, flex: 1, minWidth: 0 }}>
                          {intern.title}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: st.bg, color: st.text, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.dot, display: "inline-block" }} />
                          {status}
                        </span>
                      </div>

                      {/* Company */}
                      <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 13 }}>{intern.company || "No company"}</div>

                      {/* Info rows */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 13 }}>
                        <InfoRow icon={<User size={10} color="var(--t3)" />} label="Who">
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <div style={{ width: 18, height: 18, borderRadius: 4, background: "var(--a1,#635bff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                              {initials}
                            </div>
                            <span style={{ fontSize: 11, color: "var(--t1)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tutor}</span>
                          </div>
                        </InfoRow>

                        <InfoRow icon={<MapPin size={10} color="var(--t3)" />} label="Where">
                          {mapUrl ? (
                            <a href={mapUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: 11, color: "var(--a1,#635bff)", fontWeight: 600, textDecoration: "none" }}>
                              Map link
                            </a>
                          ) : <span style={{ fontSize: 11, color: "var(--t3)" }}>N/A</span>}
                        </InfoRow>

                        <InfoRow icon={<Calendar size={10} color="var(--t3)" />} label="When">
                          <span style={{ fontSize: 11, color: "var(--t1)", fontWeight: 500 }}>{getWhen(intern)}</span>
                        </InfoRow>

                        <InfoRow icon={<Clock size={10} color="var(--t3)" />} label="Duration">
                          <span style={{ fontSize: 11, color: "var(--t1)", fontWeight: 500 }}>{getDuration(intern)}</span>
                        </InfoRow>

                        {contact && (
                          <InfoRow icon={<Phone size={10} color="var(--t3)" />} label="Contact">
                            <span style={{ fontSize: 11, color: "var(--t1)", fontWeight: 500 }}>{contact}</span>
                          </InfoRow>
                        )}
                      </div>

                      {/* Progress */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontSize: 11, color: "var(--t3)" }}>Progress</span>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6,
                            color: `hsl(${hue} 76% 30%)`,
                            background: `linear-gradient(135deg,hsla(${Math.max(0,hue-25)},95%,92%,.95),hsla(${Math.min(120,hue+20)},95%,88%,.95))`,
                            border: `1px solid hsla(${hue},75%,45%,.2)`,
                          }}>
                            {progress}%
                          </span>
                        </div>
                        <div style={{ height: 5, background: "var(--br)", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{
                            width: `${progress}%`, height: "100%", borderRadius: 999,
                            background: `linear-gradient(90deg,hsl(${Math.max(0,hue-24)} 82% 56%),hsl(${Math.min(120,hue+12)} 80% 44%))`,
                            transition: "width 1s ease",
                          }} />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ padding: "9px 16px", borderTop: "1px solid var(--br)", display: "flex", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 11, color: "var(--t3)", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                        View Details <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 18 }}>
              <button className="bg" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} style={{ display: "flex", alignItems: "center", gap: 4, opacity: safePage === 1 ? 0.4 : 1 }}>
                <ChevronLeft size={12} /> Prev
              </button>
              <span style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}>{safePage} / {totalPages}</span>
              <button className="bg" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} style={{ display: "flex", alignItems: "center", gap: 4, opacity: safePage === totalPages ? 0.4 : 1 }}>
                Next <ChevronRight size={12} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InfoRow({ icon, label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {icon}
      <span style={{ fontSize: 10, color: "var(--t3)", width: 44, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}
