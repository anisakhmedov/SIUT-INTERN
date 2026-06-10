import { useState, useEffect } from "react";
import { Save, Lock, Eye, EyeOff, Bell, User, Shield } from "lucide-react";
import Reveal from "../shared/Reveal";
import { get, patch, post } from "../../utils/apiClient";
import { toast } from "../../utils/toast";
import { getUserInitials } from "../../utils/internshipUtils";

const Spinner = ({ size = 14 }) => (
  <div style={{ width: size, height: size, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
);

const Toggle = ({ checked, onChange, disabled }) => (
  <div
    onClick={() => !disabled && onChange()}
    style={{
      width: 46, height: 26, borderRadius: 13,
      background: checked ? "linear-gradient(135deg,#635bff,#06c9a0)" : "rgba(0,0,0,.13)",
      cursor: disabled ? "wait" : "pointer",
      position: "relative", transition: "background .25s",
      flexShrink: 0, opacity: disabled ? 0.5 : 1,
    }}
  >
    <div style={{
      position: "absolute", top: 4,
      left: checked ? 24 : 4,
      width: 18, height: 18, borderRadius: "50%",
      background: "#fff", boxShadow: "0 1px 5px rgba(0,0,0,.28)",
      transition: "left .25s",
    }} />
  </div>
);

const SectionHeader = ({ icon, label, bg = "rgba(99,91,255,.1)" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
    <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {icon}
    </div>
    <span style={{ fontFamily: "Montserrat", fontSize: 14.5, fontWeight: 700, color: "var(--t1)" }}>{label}</span>
  </div>
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
      .then((data) => { if (data) setN({ email: !!data.email, push: !!data.push }); })
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
    if (!pwd.current || !pwd.next) { toast.error("Fill in all password fields."); return; }
    if (pwd.next.length < 8) { toast.error("New password must be at least 8 characters."); return; }
    if (pwd.next !== pwd.confirm) { toast.error("Passwords do not match."); return; }
    setPwdSaving(true);
    try {
      await post("/usersInternship/me/change-password", { currentPassword: pwd.current, newPassword: pwd.next });
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
    <div className="pp set-root">

      {/* Hero */}
      <Reveal>
        <div className="set-hero">
          <div className="set-hero-blob set-hero-blob-1" />
          <div className="set-hero-blob set-hero-blob-2" />
          <div className="set-hero-inner">
            <div className="set-avatar" style={{ background: user?.avatarBg || "linear-gradient(135deg,#635bff,#06c9a0)" }}>
              {initials}
            </div>
            <div className="set-hero-copy">
              <div className="set-hero-name">{displayName}</div>
              <div className="set-hero-role">{displayRole}</div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Profile */}
      <Reveal delay={50}>
        <div className="gc set-card">
          <SectionHeader icon={<User size={15} color="#635bff" />} label="Profile" />
          <div className="set-grid">
            <div>
              <label className="fl">Full Name</label>
              <input className="fi" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="fl">Login / Email</label>
              <input className="fi" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="set-grid-full">
              <label className="fl">Department</label>
              <input className="fi" value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} />
            </div>
          </div>
          <div className="set-actions">
            <button className="bp" onClick={handleSave} disabled={saving}>
              {saving ? <Spinner /> : <Save size={13} />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </Reveal>

      {/* Security */}
      <Reveal delay={90}>
        <div className="gc set-card">
          <SectionHeader icon={<Shield size={15} color="#635bff" />} label="Security" />
          {[
            { k: "current", label: "Current Password", placeholder: "" },
            { k: "next",    label: "New Password",     placeholder: "Min 8 characters" },
            { k: "confirm", label: "Confirm Password", placeholder: "" },
          ].map(({ k, label, placeholder }) => (
            <div key={k} style={{ marginBottom: 12 }}>
              <label className="fl">{label}</label>
              <div style={{ position: "relative" }}>
                <input
                  className="fi"
                  type={showPwd[k] ? "text" : "password"}
                  value={pwd[k]}
                  placeholder={placeholder}
                  onChange={(e) => setPwd((p) => ({ ...p, [k]: e.target.value }))}
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => ({ ...p, [k]: !p[k] }))}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--t3)", padding: 0, display: "flex" }}
                >
                  {showPwd[k] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}
          <div className="set-actions" style={{ marginTop: 4 }}>
            <button className="bp" onClick={handleChangePassword} disabled={pwdSaving}>
              {pwdSaving ? <Spinner /> : <Lock size={13} />}
              {pwdSaving ? "Changing…" : "Change Password"}
            </button>
          </div>
        </div>
      </Reveal>

      {/* Notifications */}
      <Reveal delay={130}>
        <div className="gc set-card" style={{ marginBottom: 0 }}>
          <SectionHeader icon={<Bell size={15} color="#06c9a0" />} label="Notifications" bg="rgba(6,201,160,.1)" />
          {[
            ["email", "Email Notifications",  "Receive summaries via email"],
            ["push",  "Push Notifications",   "Browser push notifications"],
          ].map(([k, l, d], i, arr) => (
            <div key={k} className="set-notif-row" style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,.055)" : "none" }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--t1)" }}>{l}</div>
                <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 3 }}>{d}</div>
              </div>
              <Toggle checked={n[k]} onChange={() => handleToggle(k)} disabled={nLoading || nSaving} />
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
