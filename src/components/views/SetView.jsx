import { useState } from "react";
import { Edit2, Check, Minus, Save } from "lucide-react";
import Reveal from "../shared/Reveal";
import { patch } from "../../utils/apiClient";
import { toast } from "../../utils/toast";
import { getUserInitials } from "../../utils/internshipUtils";

export default function SetView({ user }) {
  const [n, setN] = useState({ email: true, push: false, weekly: true });
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.login || user?.email || "",
    department: user?.department || "",
  });
  const [saving, setSaving] = useState(false);

  const initials = getUserInitials(user) || "U";
  const displayName = [user?.name, user?.surname, user?.lastname].filter(Boolean).join(" ") || "User";
  const displayRole = user?.role || "—";

  const handleSave = async () => {
    setSaving(true);
    try {
      await patch("/usersInternship/me", { name: form.name, email: form.email });
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pp" style={{ maxWidth: 570 }}>
      <Reveal>
        <div className="gc" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ fontFamily: "Montserrat", fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 16 }}>
            Profile
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 20 }}>
            <div
              style={{
                width: 58, height: 58, borderRadius: 15,
                background: user?.avatarBg || "linear-gradient(135deg,#635bff,#06c9a0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Montserrat", fontSize: 19, fontWeight: 800, color: "#fff",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ fontFamily: "Montserrat", fontSize: 14.5, fontWeight: 700 }}>{displayName}</div>
              <div style={{ fontSize: 12, color: "var(--t3)", textTransform: "capitalize" }}>{displayRole}</div>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="fl">Full Name</label>
            <input
              className="fi"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="fl">Login / Email</label>
            <input
              className="fi"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="fl">Department</label>
            <input
              className="fi"
              value={form.department}
              onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
            />
          </div>
          <button className="bp" onClick={handleSave} disabled={saving}>
            {saving ? (
              <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
            ) : (
              <Save size={13} />
            )}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </Reveal>
      <Reveal delay={70}>
        <div className="gc" style={{ padding: 24 }}>
          <div style={{ fontFamily: "Montserrat", fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 16 }}>
            Notifications
          </div>
          {[
            ["email", "Email Notifications", "Receive summaries via email"],
            ["push", "Push Notifications", "Browser push notifications"],
            ["weekly", "Weekly Report", "Monday digest"],
          ].map(([k, l, d]) => (
            <div
              key={k}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,.055)" }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{l}</div>
                <div style={{ fontSize: 11.5, color: "var(--t3)", marginTop: 2 }}>{d}</div>
              </div>
              <div
                onClick={() => setN((p) => ({ ...p, [k]: !p[k] }))}
                style={{
                  width: 36, height: 36, borderRadius: 10, cursor: "pointer",
                  background: n[k] ? "linear-gradient(135deg,#635bff,#06c9a0)" : "rgba(0,0,0,.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background .2s",
                }}
              >
                {n[k] ? <Check size={12} color="white" /> : <Minus size={10} color="rgba(255,255,255,.6)" />}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
