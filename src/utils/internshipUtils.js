export const ROLES = {
  HR: { label: "HR Manager", c: "#635bff", bg: "rgba(99,91,255,.1)" },
  Mentor: { label: "Mentor", c: "#06c9a0", bg: "rgba(6,201,160,.1)" },
  Intern: { label: "Intern", c: "#ff5fa0", bg: "rgba(255,95,160,.1)" },
};

export const SC = {
  Pending: { c: "#b45309", bg: "rgba(245,166,35,.14)", dot: "#f5a623" },
  "In Progress": { c: "#1d4ed8", bg: "rgba(59,130,246,.14)", dot: "#3b82f6" },
  Completed: { c: "#166534", bg: "rgba(34,197,94,.14)", dot: "#22c55e" },
};

export function normalizeStatus(status) {
  const raw = String(status || "").trim().toLowerCase();
  if (raw === "completed") return "Completed";
  if (raw === "in progress" || raw === "active") return "In Progress";
  return "Pending";
}

export function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

export function getUserInitials(user) {
  const fullName = [user?.name, user?.surname, user?.lastname]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!fullName) return "U";

  return (
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

export const ALL_APP_ROLES = ["admin", "tutor", "professor", "rector", "student"];

export const NAV_PERMISSIONS = {
  Dashboard: ALL_APP_ROLES,
  Students: ["admin", "tutor", "professor", "rector"],
  Feedback: ["admin", "tutor", "professor", "rector"],
  "User Education": ALL_APP_ROLES,
  "All Internships": ["admin", "rector"],
  "Create Tutors": ["admin"],
  "Create Internship": ["admin"],
  Settings: ["admin"],
  "Supervisor Report": ALL_APP_ROLES,
  "Student Self-Evaluation": ["admin", "tutor"],
  "Supervisor Reports (Admin)": ["admin"],
  "Student Evaluations (Admin)": ["admin"],
  "Statistics (Admin)": ["admin"],
};

export function canAccessNav(role, label) {
  const allowedRoles = NAV_PERMISSIONS[label] || [];
  return allowedRoles.includes(normalizeRole(role));
}
