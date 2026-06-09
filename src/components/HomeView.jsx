import { useState } from "react";
import { LayoutDashboard, BarChart2 } from "lucide-react";
import Dashboard from "./Dashboard";
import DashView from "./views/DashView";

const VIEW_KEY = "siut_home_view";

function readView() {
  try {
    return localStorage.getItem(VIEW_KEY) || "list";
  } catch {
    return "list";
  }
}

function writeView(v) {
  try {
    localStorage.setItem(VIEW_KEY, v);
  } catch {}
}

export default function HomeView({ internships, feedbacks, user, students, search, onNewFaculty, onView }) {
  const [view, setView] = useState(readView);

  const switchView = (v) => {
    setView(v);
    writeView(v);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 6,
          padding: "12px 20px 0",
        }}
      >
        <button
          className={view === "list" ? "bp" : "bg"}
          onClick={() => switchView("list")}
          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "6px 12px" }}
        >
          <LayoutDashboard size={13} />
          Internships
        </button>
        <button
          className={view === "overview" ? "bp" : "bg"}
          onClick={() => switchView("overview")}
          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "6px 12px" }}
        >
          <BarChart2 size={13} />
          Overview
        </button>
      </div>

      {view === "list" ? (
        <Dashboard
          onNewFaculty={onNewFaculty}
          onView={onView}
          user={user}
          students={students}
          search={search}
        />
      ) : (
        <DashView
          internships={internships}
          feedbacks={feedbacks}
          onOpen={(intern) => onView(intern.id)}
          user={user}
        />
      )}
    </>
  );
}
