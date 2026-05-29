import React from "react";

function initials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((p) => p[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AttendanceMobile({
  students = [],
  days = [],
  onTogglePresent = () => {},
  onSave = () => {},
  saving = false,
  hasChanges = false,
}) {
  return (
    <div className="attendance-mobile-root">
      <div className="attendance-mobile-list">
        {students.map((s) => (
          <div className="attendance-mobile-card" key={s.key}>
            <div className="attendance-mobile-header">
              <div className="attendance-mobile-initials">{initials(s.name)}</div>
              <div className="attendance-mobile-name">{s.name}</div>
            </div>

            <div className="attendance-mobile-days" role="list">
              {days.map((day) => {
                const studentRecord = (Array.isArray(day.students) ? day.students : []).find((sd) => {
                  const id = sd.studentKey || sd.studentId || `${sd.name || ""}-${sd.surname || ""}`;
                  return String(id).trim() === String(s.key).trim();
                });
                const present = Boolean(studentRecord ? studentRecord.present : false);
                const label = day.date ? new Date(day.date).toLocaleDateString() : `Day ${day.dayNumber}`;
                return (
                  <button
                    key={`${day.id || day.date}-${s.key}`}
                    type="button"
                    className={`attendance-mobile-day-badge ${present ? "present" : "absent"}`}
                    onClick={() => onTogglePresent(day.id, s.key, !present)}
                    aria-pressed={present}
                    title={label}
                  >
                    <div className="attendance-mobile-day-label">{label}</div>
                    <div className="attendance-mobile-day-state">{present ? "✓" : "—"}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="attendance-mobile-footer">
        <button
          type="button"
          className="ip-btn ip-btn--primary"
          onClick={onSave}
          disabled={!hasChanges || saving}
        >
          {saving ? "Saving…" : "Save attendance"}
        </button>
      </div>
    </div>
  );
}
