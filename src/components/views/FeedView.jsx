import { useState, useMemo } from "react";
import { Eye, MessageCircle } from "lucide-react";
import Reveal from "../shared/Reveal";
import { ROLES } from "../../utils/internshipUtils";
import { useSEO } from "../../utils/useSEO";

export default function FeedView({ feedbacks, onOpenFeedback }) {
  useSEO({
    title: 'Feedback',
    description: 'View and process student comments across all SIUT internships.',
    noIndex: true,
  });

  const [filter, setFilter] = useState("All");

  const roleOptions = useMemo(() => {
    const roles = Array.from(new Set((feedbacks || []).map((item) => item?.role).filter(Boolean)));
    return ["All", ...roles];
  }, [feedbacks]);

  const activeFilter = roleOptions.includes(filter) ? filter : "All";

  const list = useMemo(
    () => (activeFilter === "All" ? feedbacks : feedbacks.filter((f) => f.role === activeFilter)),
    [activeFilter, feedbacks],
  );

  const roleSummary = useMemo(
    () =>
      roleOptions
        .filter((role) => role !== "All")
        .map((role) => ({ role, count: feedbacks.filter((item) => item.role === role).length })),
    [feedbacks, roleOptions],
  );

  return (
    <div className="pp">
      <Reveal>
        <div
          className="gc"
          style={{
            padding: 20,
            marginBottom: 14,
            background: "linear-gradient(135deg, rgba(99,91,255,.10), rgba(6,201,160,.07))",
            border: "1px solid rgba(99,91,255,.16)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "Montserrat", fontSize: 22, fontWeight: 800, color: "var(--t1)", lineHeight: 1.1 }}>
                Internship Comments Feed
              </div>
              <div style={{ marginTop: 6, fontSize: 12.5, color: "var(--t2)" }}>
                Live comments from internship days. Click any item to open it in its internship page.
              </div>
            </div>
            <div className="badge" style={{ background: "rgba(99,91,255,.14)", color: "#4f46e5", fontWeight: 700 }}>
              <MessageCircle size={12} style={{ marginRight: 5 }} /> {feedbacks.length} total
            </div>
          </div>

          {roleSummary.length > 0 && (
            <div style={{ marginTop: 14, display: "flex", gap: 7, flexWrap: "wrap" }}>
              {roleSummary.map((item) => (
                <span
                  key={item.role}
                  className="badge"
                  style={{ background: "rgba(255,255,255,.72)", color: "var(--t2)", border: "1px solid rgba(0,0,0,.08)" }}
                >
                  {item.role}: {item.count}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {roleOptions.map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={activeFilter === r ? "bp" : "bg"}
              style={{ fontSize: 12, borderRadius: 999, padding: "7px 12px" }}
            >
              {r === "All" ? "All Roles" : r}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="gc" style={{ padding: 16 }}>
        {list.length === 0 && (
          <div style={{ textAlign: "center", padding: "38px 0", color: "var(--t3)", fontSize: 13 }}>
            No comments found.
          </div>
        )}
        {list.map((f, i) => (
          <Reveal key={f.id} delay={i * 50}>
            <div
              className="fr"
              style={{
                padding: "14px 12px",
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,.08)",
                background: "rgba(255,255,255,.84)",
                marginBottom: 8,
              }}
            >
              <div className="fa" style={{ background: f.avB, color: "#fff", width: 42, height: 42 }}>{f.av}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--t1)" }}>{f.name}</span>
                  <span className="badge" style={{ background: ROLES[f.role]?.bg, color: ROLES[f.role]?.c || "var(--t2)" }}>
                    {f.role}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>
                    {f.company} {f.dayNumber ? `· Day ${f.dayNumber}` : ""}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.55 }}>{f.text}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, minWidth: 76 }}>
                <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2, fontWeight: 600 }}>{f.time}</div>
                <button
                  className="bp"
                  style={{ marginTop: 8, padding: "6px 11px", fontSize: 11 }}
                  onClick={() => onOpenFeedback(f)}
                >
                  <Eye size={11} /> Open
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
