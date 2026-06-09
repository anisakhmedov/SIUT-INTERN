import { useState, useEffect } from "react";
import { Check, Minus, Save, Lock, Eye, EyeOff } from "lucide-react";
import Reveal from "../shared/Reveal";
import { get, patch, post } from "../../utils/apiClient";
import { toast } from "../../utils/toast";
import { getUserInitials } from "../../utils/internshipUtils";

const Spinner = ({ size = 14 }) => (
  <div style={{ width: size, height: size, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
);

export default function SetView({ user }) {
  const [n, setN] = useState({ email: true, push: false });
  const [nLoading, setNLoading] = useState(true);
  const [nSaving, setNSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.login || user?.email || "",
    department: user?.department || "",
  });
  const [saving, setSaving] = useState(false);

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });

  useEffect(() => {
    get("/usersInternship/me/notifications")
      .then((data) => {
        if (data) setN({ email: !!data.email, push: !!data.push });
      })
      .catch(() => {})
      .finally(() => setNLoading(false));
  }, []);

  const handleToggle = async (key) => {
    if (nSaving || nLoading) return;
    const next = { ...n, [key]: !n[key] };
    setN(next);
    setNSaving(true);
    try {
      await patch("/usersInternship/me/notifications", next);
    } catch (err) {
      setN(n);
      toast.error(err?.message || "Failed to save notification settings.");
    } finally {
      setNSaving(false);
    }
  };

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

  const handleChangePassword = async () => {
    if (!pwd.current || !pwd.next) {
      toast.error("Fill in all password fields.");
      return;
    }
    if (pwd.next.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setPwdSaving(true);
    try {
      await post("/usersInternship/me/change-password", {
        currentPassword: pwd.current,
        newPassword: pwd.next,
      });
      toast.success("Password changed successfully.");
      setPwd({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast.error(err?.message || "Failed to change password.");
    } finally {
      setPwdSaving(false);
    }
  };

  const initials = getUserInitials(user) || "U";
  const displayName = [user?.name, user?.surname, user?.lastname].filter(Boolean).join(" ") || "User";
  const displayRole = user?.role || "—";

  return (
    <div className="pp" style={{ maxWidth: 570 }}>
      {/* Profile */}
      <Reveal>
        <div className="gc" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ fontFamily: "Montserrat", fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 16 }}>
            Profile
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 20 }}>
            <div style={{ width: 58, height: 58, borderRadius: 15, background: user?.avatarBg || "linear-gradient(135deg,#635bff,#06c9a0)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Montserrat", fontSize: 19, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontFamily: "Montserrat", fontSize: 14.5, fontWeight: 700 }}>{displayName}</div>
              <div style={{ fontSize: 12, color: "var(--t3)", textTransform: "capitalize" }}>{displayRole}</div>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="fl">Full Name</label>
            <input className="fi" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="fl">Login / Email</label>
            <input className="fi" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="fl">Department</label>
            <input className="fi" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} />
          </div>
          <button className="bp" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner /> : <Save size={13} />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </Reveal>

      {/* Security / Change Password */}
      <Reveal delay={60}>
        <div className="gc" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Lock size={15} color="#635bff" />
            <div style={{ fontFamily: "Montserrat", fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>Security</div>
          </div>
          {[
            { k: "current", label: "Current Password" },
            { k: "next",    label: "New Password (min 8 chars)" },
            { k: "confirm", label: "Confirm New Password" },
          ].map(({ k, label }) => (
            <div key={k} style={{ marginBottom: 12 }}>
              <label className="fl">{label}</label>
              <div style={{ position: "relative" }}>
                <input
                  className="fi"
                  type={showPwd[k] ? "text" : "password"}
                  value={pwd[k]}
                  onChange={(e) => setPwd((p) => ({ ...p, [k]: e.target.value }))}
                  style={{ paddingRight: 38 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => ({ ...p, [k]: !p[k] }))}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--t3)", padding: 0, display: "flex" }}
                >
                  {showPwd[k] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
          <button className="bp" onClick={handleChangePassword} disabled={pwdSaving} style={{ marginTop: 4 }}>
            {pwdSaving ? <Spinner /> : <Lock size={13} />}
            {pwdSaving ? "Changing…" : "Change Password"}
          </button>
        </div>
      </Reveal>

      {/* Notifications */}
      <Reveal delay={120}>
        <div className="gc" style={{ padding: 24 }}>
          <div style={{ fontFamily: "Montserrat", fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 16 }}>
            Notifications
          </div>
          {[
            ["email", "Email Notifications", "Receive summaries via email"],
            ["push",  "Push Notifications",  "Browser push notifications"],
          ].map(([k, l, d]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,.055)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{l}</div>
                <div style={{ fontSize: 11.5, color: "var(--t3)", marginTop: 2 }}>{d}</div>
              </div>
              <div
                onClick={() => handleToggle(k)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  cursor: nLoading ? "wait" : "pointer",
                  background: n[k] ? "linear-gradient(135deg,#635bff,#06c9a0)" : "rgba(0,0,0,.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background .2s", opacity: nLoading ? 0.5 : 1,
                }}
              >
                {nSaving ? (
                  <Spinner size={10} />
                ) : n[k] ? (
                  <Check size={12} color="white" />
                ) : (
                  <Minus size={10} color="rgba(0,0,0,.3)" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
