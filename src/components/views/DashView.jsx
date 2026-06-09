import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  MessageSquare,
  Star,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Building2,
  Calendar,
} from "lucide-react";
import Stars from "../shared/Stars";
import AnimNum from "../shared/AnimNum";
import Reveal from "../shared/Reveal";
import BarChart from "../shared/BarChart";
import Donut from "../shared/Donut";
import { ROLES, SC, normalizeStatus } from "../../utils/internshipUtils";

const PAGE_SIZE = 12;
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function DashView({ internships, feedbacks, onOpen, user }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const avgRating = useMemo(() => {
    const rated = (feedbacks || []).filter((f) => typeof f.rating === "number" && f.rating > 0);
    if (!rated.length) return null;
    return parseFloat((rated.reduce((s, f) => s + f.rating, 0) / rated.length).toFixed(1));
  }, [feedbacks]);

  const chart = useMemo(() => {
    const counts = new Array(12).fill(0);
    (feedbacks || []).forEach((f) => {
      if (f.date) {
        const m = new Date(f.date).getMonth();
        if (m >= 0 && m < 12) counts[m]++;
      }
    });
    return MONTH_LABELS.map((l, i) => ({ v: counts[i], l }));
  }, [feedbacks]);

  const metrics = [
    {
      I: Users, label: "Total Interns", v: internships.length, sfx: "", disp: null,
      c: "#635bff", bg: "rgba(99,91,255,.1)",
      gr: "linear-gradient(135deg,rgba(99,91,255,.12),rgba(6,201,160,.07))",
    },
    {
      I: MessageSquare, label: "Feedback Received", v: feedbacks.length, sfx: "", disp: null,
      c: "#06c9a0", bg: "rgba(6,201,160,.1)",
      gr: "linear-gradient(135deg,rgba(6,201,160,.12),rgba(99,91,255,.07))",
    },
    {
      I: Star, label: "Average Rating",
      v: avgRating ? Math.round(avgRating * 10) : 0,
      sfx: "", disp: avgRating ?? "—",
      c: "#f5a623", bg: "rgba(245,166,35,.1)",
      gr: "linear-gradient(135deg,rgba(245,166,35,.12),rgba(255,95,160,.07))",
    },
    {
      I: TrendingUp,
      label: "Completion Rate",
      v: internships.length
        ? Math.round((internships.filter((i) => normalizeStatus(i.status) === "Completed").length / internships.length) * 100)
        : 0,
      sfx: "%",
      disp: null,
      c: "#ff5fa0", bg: "rgba(255,95,160,.1)",
      gr: "linear-gradient(135deg,rgba(255,95,160,.12),rgba(99,91,255,.07))",
    },
  ];

  const totalPages = Math.max(1, Math.ceil(internships.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedInternships = internships.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="pp">
      {/* Banner */}
      <Reveal>
        <div
          style={{
            marginBottom: 24,
            background: "linear-gradient(135deg,#635bff,#06c9a0)",
            borderRadius: 19,
            padding: "20px 24px",
            position: "relative",
            overflow: "hidden",
            color: "#fff",
          }}
        >
          <div style={{ position: "absolute", right: -18, top: -18, width: 130, height: 130, background: "rgba(255,255,255,.08)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", right: 44, bottom: -28, width: 84, height: 84, background: "rgba(255,255,255,.06)", borderRadius: "50%" }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontFamily: "Montserrat", fontSize: 19, fontWeight: 800, marginBottom: 3 }}>
              Good morning, {user ? user.name : "User"} 👋
            </div>
            <div style={{ fontSize: 13, opacity: 0.82 }}>
              {internships.filter((i) => normalizeStatus(i.status) === "In Progress").length} in progress internships · {feedbacks.length} feedback items to review today.
            </div>
          </div>
        </div>
      </Reveal>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(195px,1fr))", gap: 16, marginBottom: 24 }}>
        {metrics.map((m, i) => (
          <Reveal key={m.label} delay={i * 65}>
            <div className="mc" style={{ background: m.gr }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <m.I size={18} color={m.c} />
                </div>
                <TrendingUp size={12} color="#10b981" />
              </div>
              <div style={{ fontFamily: "Montserrat", fontSize: 27, fontWeight: 800, color: "var(--t1)", marginBottom: 2 }}>
                {m.disp || <AnimNum target={m.v} sfx={m.sfx} />}
              </div>
              <div style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}>{m.label}</div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Reveal delay={160}>
          <div className="gc" style={{ padding: 21 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontFamily: "Montserrat", fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>Feedback Trend</div>
              <button className="bg" style={{ fontSize: 11 }}>Monthly <ChevronDown size={11} /></button>
            </div>
            <BarChart data={chart} />
          </div>
        </Reveal>
        <Reveal delay={210}>
          <div className="gc" style={{ padding: 21 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontFamily: "Montserrat", fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>Avg. Rating</div>
              {avgRating && (
                <span className="badge" style={{ background: "rgba(16,185,129,.1)", color: "#10b981" }}>
                  {avgRating} / 5.0
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Donut v={avgRating ?? 0} />
              <div style={{ flex: 1 }}>
                {[5, 4, 3, 2, 1].map((r) => {
                  const n = (feedbacks || []).filter((f) => f.rating === r).length;
                  const p = feedbacks.length ? (n / feedbacks.length) * 100 : 0;
                  return (
                    <div key={r} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, color: "var(--t3)", width: 7 }}>{r}</span>
                      <div style={{ flex: 1, height: 5, background: "rgba(0,0,0,.07)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ width: `${p}%`, height: "100%", background: "linear-gradient(90deg,#635bff,#06c9a0)", borderRadius: 999, transition: "width 1.1s ease" }} />
                      </div>
                      <span style={{ fontSize: 10, color: "var(--t3)", width: 10 }}>{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Recent Feedback */}
      <Reveal delay={280}>
        <div className="gc" style={{ padding: 21, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ fontFamily: "Montserrat", fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>Recent Feedback</div>
            <button className="bg" onClick={() => navigate("/feedback")}>View all <ArrowRight size={11} /></button>
          </div>
          <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 13 }}>Latest comments from internship days</p>
          {feedbacks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--t3)", fontSize: 13 }}>
              No feedback yet. Feedback appears when interns leave comments on their days.
            </div>
          ) : (
            feedbacks.slice(0, 4).map((f, i) => (
              <div key={f.id} className="fr" style={{ animationDelay: `${i * 65}ms`, cursor: "pointer" }}>
                <div className="fa" style={{ background: f.avB, color: "#fff" }}>{f.av}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{f.name}</span>
                    <span className="badge" style={{ background: ROLES[f.role]?.bg, color: ROLES[f.role]?.c }}>{f.role}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--t2)" }}>{f.text}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <Stars n={f.rating} />
                  <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 2 }}>{f.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </Reveal>

      {/* Internship cards */}
      <Reveal delay={360}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontFamily: "Montserrat", fontSize: 16, fontWeight: 700, color: "var(--t1)" }}>Internships</div>
          <span className="badge" style={{ background: "rgba(245,166,35,.14)", color: "#b45309" }}>
            {internships.filter((i) => normalizeStatus(i.status) === "Pending").length} pending
          </span>
        </div>

        {internships.length === 0 ? (
          <div className="gc" style={{ padding: 32, textAlign: "center", color: "var(--t3)", fontSize: 13 }}>
            No internships yet.
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(235px,1fr))", gap: 14 }}>
              {pagedInternships.map((intern, idx) => {
                const s = SC[normalizeStatus(intern.status)] || SC["Pending"];
                const r = ROLES[intern.role] || ROLES.Intern;
                return (
                  <Reveal key={intern.id} delay={idx * 55}>
                    <div className="ic" onClick={() => onOpen(intern)}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 11 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,rgba(99,91,255,.14),rgba(6,201,160,.09))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Briefcase size={17} color="#635bff" />
                        </div>
                        <span className="badge" style={{ background: s.bg, color: s.c }}>{intern.status}</span>
                      </div>
                      <div style={{ fontFamily: "Montserrat", fontSize: 14, fontWeight: 700, color: "var(--t1)", marginBottom: 3 }}>{intern.title}</div>
                      <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                        <Building2 size={11} /> {intern.company}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--t3)", display: "flex", alignItems: "center", gap: 3, marginBottom: 12 }}>
                        <Calendar size={10} /> {intern.start} → {intern.end}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span className="badge" style={{ background: r.bg, color: r.c }}>{r.label}</span>
                        <span style={{ fontSize: 11, color: "#635bff", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                          Open <ChevronRight size={11} />
                        </span>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 20 }}>
                <button
                  className="bg"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  style={{ display: "flex", alignItems: "center", gap: 4, opacity: safePage === 1 ? 0.4 : 1 }}
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <span style={{ fontSize: 13, color: "var(--t2)", fontWeight: 500 }}>
                  {safePage} / {totalPages}
                </span>
                <button
                  className="bg"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  style={{ display: "flex", alignItems: "center", gap: 4, opacity: safePage === totalPages ? 0.4 : 1 }}
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            )}
          </>
        )}
      </Reveal>
    </div>
  );
}
