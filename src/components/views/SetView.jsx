import { useState, useEffect } from "react";
import { Save, Lock, Eye, EyeOff, Bell, User, Shield, Phone, AtSign, MessageCircle } from "lucide-react";
import Reveal from "../shared/Reveal";
import { get, post, patch, del } from "../../utils/apiClient";
import { toast } from "../../utils/toast";
import { getUserInitials } from "../../utils/internshipUtils";

const Spinner = ({ size = 14 }) => (
  <div style={{ width: size, height: size, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
);

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function subscribeToPush() {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    throw new Error("Push notifications are not supported in this browser.");
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Push notification permission denied.");
  }
  const reg = await navigator.serviceWorker.ready;
  const { publicKey } = await get("/usersInternship/push-vapid-key");
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
  await post("/usersInternship/me/push-subscription", subscription.toJSON());
}

async function unsubscribeFromPush() {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await sub.unsubscribe();
    await del("/usersInternship/me/push-subscription").catch(() => {});
  }
}

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

const Field = ({ label, value, onChange, placeholder, icon, readOnly }) => (
  <div>
    <label className="fl">{label}</label>
    <div style={{ position: "relative" }}>
      {icon && (
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--t3)", display: "flex", pointerEvents: "none" }}>
          {icon}
        </div>
      )}
      <input
        className={icon ? "fi has-icon" : "fi"}
        value={value}
        placeholder={placeholder || ""}
        onChange={onChange}
        readOnly={readOnly}
        style={{
          paddingLeft: icon ? 38 : 14,
          opacity: readOnly ? 0.5 : 1,
          cursor: readOnly ? "default" : undefined,
        }}
      />
    </div>
  </div>
);

export default function SetView({ user }) {
  const [n, setN] = useState({ email: true, push: false });
  const [nLoading, setNLoading] = useState(true);
  const [nSaving, setNSaving] = useState(false);

  const c = user?.contact || {};
  const [form, setForm] = useState({
    name:      user?.name      || "",
    surname:   user?.surname   || "",
    login:     user?.login     || "",
    email:     c.email         || user?.email    || "",
    phone:     c.phone         || user?.phone    || "",
    telegram:  c.telegram      || user?.telegram || "",
    whatsapp:  c.whatsapp      || user?.whatsapp || "",
  });
  const [saving, setSaving] = useState(false);

  const [pwd, setPwd] = useState({ next: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [showPwd, setShowPwd] = useState({ next: false, confirm: false });

  useEffect(() => {
    get("/usersInternship/me/notifications")
      .then((data) => { if (data) setN({ email: !!data.email, push: !!data.push }); })
      .catch(() => {})
      .finally(() => setNLoading(false));
  }, []);

  const handleToggle = async (key) => {
    if (nSaving || nLoading) return;
    const enabling = !n[key];

    if (key === "push") {
      if (enabling) {
        try {
          await subscribeToPush();
        } catch (err) {
          toast.error(err?.message || "Failed to enable push notifications.");
          return;
        }
      } else {
        await unsubscribeFromPush();
      }
    }

    const next = { ...n, [key]: enabling };
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

  const f = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {};
      if (form.name)     body.name     = form.name;
      if (form.surname)  body.surname  = form.surname;
      if (form.login)    body.login    = form.login;
      if (form.email)    body.email    = form.email;
      if (form.phone)    body.phone    = form.phone;
      if (form.telegram) body.telegram = form.telegram;
      if (form.whatsapp) body.whatsapp = form.whatsapp;
      await patch("/usersInternship/me", body);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwd.next) { toast.error("Enter a new password."); return; }
    if (pwd.next.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (pwd.next !== pwd.confirm) { toast.error("Passwords do not match."); return; }
    setPwdSaving(true);
    try {
      await patch("/usersInternship/me", { password: pwd.next });
      toast.success("Password changed successfully.");
      setPwd({ next: "", confirm: "" });
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
            <Field label="First Name"  value={form.name}     onChange={f("name")}     placeholder="Имя" />
            <Field label="Last Name"   value={form.surname}  onChange={f("surname")}  placeholder="Фамилия" />
            <Field label="Login"       value={form.login}    onChange={f("login")}    placeholder="login" />
            <Field label="Email"       value={form.email}    onChange={f("email")}    placeholder="email@example.com" icon={<AtSign size={14} />} />
            <Field label="Phone"       value={form.phone}    onChange={f("phone")}    placeholder="+7 999 000 00 00"  icon={<Phone size={14} />} />
            <Field label="Telegram"    value={form.telegram} onChange={f("telegram")} placeholder="@username"         icon={<AtSign size={14} />} />
            <div className="set-grid-full">
              <Field label="WhatsApp"  value={form.whatsapp} onChange={f("whatsapp")} placeholder="+7 999 000 00 00"  icon={<MessageCircle size={14} />} />
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
