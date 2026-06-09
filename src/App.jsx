import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useNavigate, useLocation, Routes, Route, useParams } from "react-router-dom";

import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  Search,
  ChevronDown,
  TrendingUp,
  Users,
  Plus,
  Briefcase,
  Award,
  LogOut,
  Menu,
  GraduationCap,
  FileText,
  UserCheck,
  BookOpen,
  Shield,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import { getUserFromStorage, clearUserFromStorage } from "./utils/storageUtils";
import {
  get,
  patch,
  getCurrentUser,
  handleStoredTokenExpiry,
  onAuthSessionExpired,
} from "./utils/apiClient";
import { toast } from "./utils/toast";
import {
  normalizeStatus,
  normalizeRole,
  getUserInitials,
  canAccessNav,
} from "./utils/internshipUtils";

import ToastViewport from "./components/ToastViewport";
import PageState from "./components/PageState";
import ErrorPage from "./components/ErrorPage";
import ErrorBoundary from "./components/ErrorBoundary";

const LoginPage = lazy(() => import("./components/LoginPage"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const AllInternships = lazy(() => import("./components/AllInternships"));
const CreatePage = lazy(() => import("./components/CreatePage"));
const InternshipPage = lazy(() => import("./components/InternshipPage"));
const CreateTutorPage = lazy(() => import("./components/CreateTutorPage"));
const StudentDocumentsPage = lazy(() => import("./components/StudentDocumentsPage"));
const UserEducationPage = lazy(() => import("./components/UserEducationPage"));
const MaintenancePage = lazy(() => import("./components/MaintenancePage"));
const SupervisorEvaluationFormPage = lazy(() => import("./components/SupervisorEvaluationFormPage"));
const StudentEvaluationFormPage = lazy(() => import("./components/StudentEvaluationFormPage"));
const AdminSupervisorReportsPage = lazy(() => import("./components/AdminSupervisorReportsPage"));
const AdminStudentEvaluationsPage = lazy(() => import("./components/AdminStudentEvaluationsPage"));
const AdminStatisticsPage = lazy(() => import("./components/AdminStatisticsPage"));
const DashView = lazy(() => import("./components/views/DashView"));
const FeedView = lazy(() => import("./components/views/FeedView"));
const SetView = lazy(() => import("./components/views/SetView"));

const MAINTENANCE_STORAGE_KEY = "siut_maintenance_mode";
const STATUS_ID = "6a1a906ace7c3808500ab41c";

const NAV_PATH_MAP = {
  Dashboard: "/",
  Students: "/students",
  Feedback: "/feedback",
  "User Education": "/education",
  "Supervisor Report": "/supervisor-report",
  "Student Self-Evaluation": "/self-evaluation",
  "All Internships": "/internships",
  "Create Tutors": "/create-tutor",
  "Create Internship": "/create",
  "Supervisor Reports (Admin)": "/admin/reports",
  "Student Evaluations (Admin)": "/admin/evaluations",
  "Statistics (Admin)": "/admin/statistics",
  Settings: "/settings",
};

const NAV_LABEL_MAP = Object.fromEntries(
  Object.entries(NAV_PATH_MAP).map(([label, path]) => [path, label])
);

const NAV_PERMISSIONS = {
  Dashboard: ["admin", "tutor", "professor", "rector", "student"],
  Students: ["admin", "tutor", "professor", "rector"],
  Feedback: ["admin", "tutor", "professor", "rector"],
  "User Education": ["admin", "tutor", "professor", "rector", "student"],
  "All Internships": ["admin", "rector"],
  "Create Tutors": ["admin"],
  "Create Internship": ["admin"],
  Settings: ["admin"],
  "Supervisor Report": ["admin", "tutor", "professor", "rector", "student"],
  "Student Self-Evaluation": ["admin", "tutor"],
  "Supervisor Reports (Admin)": ["admin"],
  "Student Evaluations (Admin)": ["admin"],
  "Statistics (Admin)": ["admin"],
};

function readMaintenanceMode() {
  try {
    return window.localStorage.getItem(MAINTENANCE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeMaintenanceMode(enabled) {
  try {
    window.localStorage.setItem(MAINTENANCE_STORAGE_KEY, enabled ? "1" : "0");
  } catch (error) {
    console.error("Error saving maintenance mode:", error);
  }
}

function InternshipPageWrapper({ user, students }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { openCommentTarget } = location.state || {};

  return (
    <InternshipPage
      facultyId={id}
      onBack={() => navigate(-1)}
      user={user}
      initialDayIndex={
        openCommentTarget?.internshipId === id ? openCommentTarget.dayIndex : undefined
      }
      focusCommentKey={
        openCommentTarget?.internshipId === id ? openCommentTarget.commentKey : undefined
      }
      students={students}
    />
  );
}

function CreatePageWrapper({ students, tutors, user, onNewInternship }) {
  const navigate = useNavigate();

  const handleSubmit = (newFaculty) => {
    const transformed = {
      id: newFaculty._id,
      title: newFaculty.name,
      company: newFaculty.company,
      location: newFaculty.location || "",
      locationYmaps: Array.isArray(newFaculty.locationYmaps)
        ? newFaculty.locationYmaps
        : newFaculty.locationYmaps || null,
      status: normalizeStatus(newFaculty.status),
      start: newFaculty.duration?.start || newFaculty.startDate || "2024-01-01",
      end: newFaculty.duration?.end || newFaculty.endDate || "2024-06-01",
      role: newFaculty.role || "Intern",
      students: newFaculty.students || [],
      days: Array.isArray(newFaculty.days) ? newFaculty.days : [],
      desc: newFaculty.description || newFaculty.plan,
      tutorID: newFaculty.tutorID,
      tutorIDs: Array.isArray(newFaculty.tutorIDs)
        ? newFaculty.tutorIDs
        : newFaculty.tutorID
        ? [newFaculty.tutorID]
        : [],
      tutor: newFaculty.tutor,
      ti: Number.isFinite(Number.parseInt(newFaculty.tutorID || newFaculty.tutorIDs?.[0], 10))
        ? Number.parseInt(newFaculty.tutorID || newFaculty.tutorIDs?.[0], 10) % 4
        : 0,
    };
    onNewInternship(transformed);
    navigate("/");
  };

  return (
    <CreatePage
      students={students}
      tutors={tutors}
      user={user}
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
    />
  );
}

function AdminStatisticsWrapper() {
  const navigate = useNavigate();
  return (
    <AdminStatisticsPage
      onNavigate={(facultyId, dayIndex) => {
        navigate(`/internship/${facultyId}`, {
          state: { openCommentTarget: { internshipId: facultyId, dayIndex } },
        });
      }}
    />
  );
}

function Forbidden({ title, message }) {
  return (
    <div className="pp">
      <PageState variant="forbidden" title={title} message={message} />
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [TUTORS, setTutors] = useState([]);
  const [INTERNSHIPS, setInternships] = useState([]);
  const [FEEDBACKS, setFeedbacks] = useState([]);

  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [dd, setDd] = useState(false);
  const [sbOpen, setSbOpen] = useState(false);
  const [sidebarGroupsOpen, setSidebarGroupsOpen] = useState({ administration: false });
  const [search, setSearch] = useState("");
  const [systemError, setSystemError] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(() => readMaintenanceMode());
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [sessionMessage, setSessionMessage] = useState("");

  const userInitials = useMemo(() => user?.initials || getUserInitials(user), [user]);
  const isPrivilegedUser = useMemo(
    () => ["admin", "developer"].includes(normalizeRole(user?.role)),
    [user?.role],
  );
  const maintenanceLocked = maintenanceMode && !isPrivilegedUser;

  const openSystemError = useCallback((status, overrides = {}) => {
    setSystemError({ status, ...overrides });
    setLoading(false);
    setSbOpen(false);
    setDd(false);
    setPage("error");
  }, []);

  const retryFromError = useCallback(() => {
    setSystemError(null);
    setLoading(true);
    setPage(user ? "dashboard" : "login");
    window.location.reload();
  }, [user]);

  const handleToggleSidebarGroup = useCallback((groupKey) => {
    setSidebarGroupsOpen((current) => ({ ...current, [groupKey]: !current[groupKey] }));
  }, []);

  const handleToggleMaintenance = useCallback(async () => {
    if (!isPrivilegedUser) return;
    setMaintenanceSaving(true);
    try {
      const payload = await patch(`/status/${STATUS_ID}`, { live: maintenanceMode, message: "" });
      const live = !!payload?.live;
      setMaintenanceMode(!live);
      writeMaintenanceMode(!live);
      toast.success(!live ? "Maintenance enabled (global)." : "Maintenance disabled (global).");
    } catch (err) {
      toast.error(err?.message || "Failed to update site status.");
    } finally {
      setMaintenanceSaving(false);
    }
  }, [isPrivilegedUser, maintenanceMode]);

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      try {
        const payload = await get(`/status/${STATUS_ID}`);
        if (!mounted || typeof payload?.live !== "boolean") return;
        setMaintenanceMode(!payload.live);
        writeMaintenanceMode(!payload.live);
      } catch {
        // ignore polling errors
      }
    };
    fetchStatus();
    const iv = setInterval(fetchStatus, 30000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hasValidToken = handleStoredTokenExpiry();
        if (!hasValidToken) return;

        try {
          const currentUser = await getCurrentUser();
          const savedUser = getUserFromStorage();
          const resolvedUser = currentUser?.user || currentUser || savedUser || null;
          setUser(resolvedUser);

          const studentData = await get("/student");
          if (studentData) {
            const studentsArray = Array.isArray(studentData)
              ? studentData
              : Array.isArray(studentData?.data)
              ? studentData.data
              : Array.isArray(studentData?.students)
              ? studentData.students
              : [];
            setStudents(studentsArray);
          }

          const canReadUsers = normalizeRole(resolvedUser?.role) === "admin";
          if (canReadUsers) {
            const tutorData = await get("/usersInternship");
            if (tutorData) {
              const tutorList = Array.isArray(tutorData)
                ? tutorData
                : Array.isArray(tutorData?.data)
                ? tutorData.data
                : Array.isArray(tutorData?.users)
                ? tutorData.users
                : [];
              setTutors(
                tutorList
                  .map((m) => ({
                    _id: m?._id || m?.id || m?.userId || "",
                    name: m?.name || "",
                    surname: m?.surname || "",
                    lastname: m?.lastname || "",
                    role: m?.role || "",
                    login: m?.login || m?.email || "",
                    phone: m?.phone || "",
                  }))
                  .filter((m) => {
                    const r = normalizeRole(m.role);
                    return r === "tutor" || r === "professor";
                  }),
              );
            }
          } else {
            setTutors([]);
          }

          const data = await get("/faculty");
          if (data) {
            setInternships(
              data.map((intern) => ({
                id: intern._id,
                title: intern.name,
                company: intern.company,
                location: intern.location || "",
                locationYmaps: Array.isArray(intern.locationYmaps)
                  ? intern.locationYmaps
                  : intern.locationYmaps || null,
                status: normalizeStatus(intern.status),
                start: intern.duration?.start || intern.startDate || "2024-01-01",
                end: intern.duration?.end || intern.endDate || "2024-06-01",
                role: intern.role || "Intern",
                students: intern.students || [],
                days: Array.isArray(intern.days) ? intern.days : [],
                desc: intern.description || intern.plan,
                tutorID: intern.tutorID,
                tutor: intern.tutor,
                ti: Number.isFinite(Number.parseInt(intern.tutorID, 10))
                  ? Number.parseInt(intern.tutorID, 10) % 4
                  : 0,
              })),
            );
          }

          setPage("dashboard");
        } catch (error) {
          if (error?.status === 401) {
            setSessionMessage("Session expired. Please login again.");
            setUser(null);
            setPage("login");
          } else if ([404, 500, 502, 503, 504].includes(error?.status) || error?.status >= 500) {
            openSystemError(error?.status || 500, {
              title: error?.status === 404 ? "Requested resource was not found" : undefined,
              message: error?.message,
              details: error?.status ? `HTTP ${error.status}` : "Unexpected server response",
            });
          } else {
            console.error("Session restore error:", error);
          }
        }

        setFeedbacks([
          {
            id: 1,
            name: "John Smith",
            role: "Intern",
            company: "Tech Corp",
            text: "Great learning experience during my internship",
            rating: 4,
            time: "2 days ago",
            avB: "linear-gradient(135deg,#635bff,#06c9a0)",
            av: "JS",
          },
          {
            id: 2,
            name: "Emma Johnson",
            role: "Mentor",
            company: "Innovate Inc",
            text: "Impressive work from the students this semester",
            rating: 5,
            time: "1 week ago",
            avB: "linear-gradient(135deg,#06c9a0,#ff5fa0)",
            av: "EJ",
          },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [openSystemError]);

  useEffect(
    () =>
      onAuthSessionExpired(() => {
        setSessionMessage("Session expired. Please login again.");
        setUser(null);
        setPage("login");
      }),
    [],
  );

  useEffect(() => { writeMaintenanceMode(maintenanceMode); }, [maintenanceMode]);

  const addIntern = useCallback((i) => setInternships((prev) => [i, ...prev]), []);

  const handleStudentUpdated = useCallback((updatedStudent) => {
    if (!updatedStudent) return;
    const updatedId = updatedStudent._id || updatedStudent.id || updatedStudent.studentId;
    setStudents((current) =>
      current.map((student, index) => {
        const currentId =
          student._id || student.id || student.studentId || `${student?.name || "student"}-${index}`;
        return currentId === updatedId ? { ...student, ...updatedStudent } : student;
      }),
    );
  }, []);

  const currentUserRole = normalizeRole(user?.role);

  const getOwnershipTokens = useCallback((value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.flatMap((item) => getOwnershipTokens(item));
    if (typeof value === "object") {
      return [
        value._id, value.id, value.userId, value.login, value.username, value.email,
        value.name, value.surname, value.lastname,
        [value.name, value.surname, value.lastname].filter(Boolean).join(" "),
      ]
        .map((token) => String(token || "").trim().toLowerCase())
        .filter(Boolean);
    }
    return [String(value).trim().toLowerCase()].filter(Boolean);
  }, []);

  const isProfessorAssignedToInternship = useCallback(
    (intern) => {
      if (!intern) return true;
      if (currentUserRole !== "professor" && currentUserRole !== "tutor") return true;
      const currentUserTokens = getOwnershipTokens([
        user?.id, user?._id, user?.userId, user?.login, user?.username, user?.email,
        user?.name, user?.surname, user?.lastname,
        [user?.name, user?.surname, user?.lastname].filter(Boolean).join(" "),
      ]);
      const internshipTokens = getOwnershipTokens([intern?.tutorID, intern?.tutor, intern?.supervisor]);
      return internshipTokens.some((token) => currentUserTokens.includes(token));
    },
    [currentUserRole, getOwnershipTokens, user],
  );

  const commentFeedbacks = useMemo(() => {
    const now = Date.now();
    const toTimeLabel = (dateValue) => {
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return "Unknown time";
      const diffMs = Math.max(0, now - date.getTime());
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffH = Math.floor(diffMin / 60);
      if (diffH < 24) return `${diffH}h ago`;
      return `${Math.floor(diffH / 24)}d ago`;
    };
    const buildCommentKey = (comment, idx) => {
      if (!comment) return `idx-${idx}`;
      return String(comment._id || `${comment.date || ""}-${comment.text || ""}-${idx}`);
    };
    const rows = [];
    INTERNSHIPS.forEach((intern) => {
      if (!isProfessorAssignedToInternship(intern)) return;
      (intern.days || []).forEach((day, dayIndex) => {
        (day?.comments || []).forEach((comment, commentIndex) => {
          const userObj = typeof comment?.userID === "object" && comment?.userID ? comment.userID : null;
          const name = userObj
            ? [userObj.name, userObj.surname].filter(Boolean).join(" ") || userObj.name
            : "Unknown User";
          const role = userObj?.role || "Intern";
          const initials =
            name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "US";
          rows.push({
            id: `${intern.id}-d${dayIndex}-c${commentIndex}`,
            internshipId: intern.id,
            internshipTitle: intern.title,
            dayIndex,
            dayNumber: day?.dayNumber || dayIndex + 1,
            commentKey: buildCommentKey(comment, commentIndex),
            name,
            role,
            company: intern.company,
            text: comment?.text || String(comment || ""),
            time: toTimeLabel(comment?.date),
            date: comment?.date || null,
            av: initials,
            avB: "linear-gradient(135deg,#635bff,#06c9a0)",
            rating: 5,
          });
        });
      });
    });
    return rows.sort((a, b) => {
      const ta = a.date ? new Date(a.date).getTime() : 0;
      const tb = b.date ? new Date(b.date).getTime() : 0;
      return tb - ta;
    });
  }, [INTERNSHIPS, isProfessorAssignedToInternship]);

  const handleOpenCommentFromFeedback = useCallback(
    (feedbackItem) => {
      if (!feedbackItem?.internshipId) return;
      navigate(`/internship/${feedbackItem.internshipId}`, {
        state: {
          openCommentTarget: {
            internshipId: feedbackItem.internshipId,
            dayIndex: feedbackItem.dayIndex,
            commentKey: feedbackItem.commentKey,
          },
        },
      });
    },
    [navigate],
  );

  const navItems = [
    { I: LayoutDashboard, label: "Dashboard" },
    { I: Users, label: "Students" },
    { I: MessageSquare, label: "Feedback" },
    { I: BookOpen, label: "User Education" },
    { I: FileText, label: "Supervisor Report" },
    { I: Award, label: "Student Self-Evaluation" },
    { I: Settings, label: "Settings" },
  ].filter((item) => canAccessNav(user?.role, item.label));

  const sidebarGroups = useMemo(() => {
    const groups = [
      {
        key: "administration",
        label: "Administration",
        icon: Shield,
        items: [
          { I: Briefcase, label: "All Internships" },
          { I: UserCheck, label: "Create Tutors" },
          { I: Plus, label: "Create Internship" },
          { I: FileText, label: "Supervisor Reports (Admin)" },
          { I: Award, label: "Student Evaluations (Admin)" },
          { I: TrendingUp, label: "Statistics (Admin)" },
        ],
      },
    ];
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => canAccessNav(user?.role, item.label)),
      }))
      .filter((group) => group.items.length > 0);
  }, [user?.role]);

  const handleNavigate = (label) => {
    if (!canAccessNav(user?.role, label)) return;
    navigate(NAV_PATH_MAP[label] || "/");
    setSbOpen(false);
  };

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/internship/")) return "Internship Details";
    return NAV_LABEL_MAP[path] || "Dashboard";
  }, [location.pathname]);

  const isNavActive = (label) => {
    const path = NAV_PATH_MAP[label];
    if (!path) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  if (maintenanceLocked) {
    return (
      <>
        <Suspense fallback={null}>
          <MaintenancePage />
        </Suspense>
        <ToastViewport />
      </>
    );
  }

  if (page === "error") {
    return (
      <>
        <ErrorPage
          status={systemError?.status || 500}
          title={systemError?.title}
          message={systemError?.message}
          details={systemError?.details}
          causes={systemError?.causes}
          onPrimaryAction={retryFromError}
          onSecondaryAction={() => setPage(user ? "dashboard" : "login")}
          primaryActionLabel="Retry"
          secondaryActionLabel={user ? "Open dashboard" : "Go to login"}
        />
        <ToastViewport />
      </>
    );
  }

  if (page === "public-form") {
    return (
      <>
        <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'Montserrat',sans-serif" }}>
          <div
            style={{
              background: "#0c0e18",
              padding: "13px 24px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              borderBottom: "1px solid rgba(255,255,255,.07)",
            }}
          >
            <button
              type="button"
              onClick={() => setPage("login")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: 9,
                padding: "7px 13px",
                color: "rgba(255,255,255,.7)",
                fontFamily: "Montserrat",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ← Back to Login
            </button>
          </div>
          <Suspense fallback={null}>
            <StudentEvaluationFormPage publicMode />
          </Suspense>
        </div>
        <ToastViewport />
      </>
    );
  }

  if (page === "login") {
    return (
      <>
        <Suspense fallback={null}>
          <LoginPage
            onLogin={() => {
              setSessionMessage("");
              setPage("dashboard");
            }}
            onUserSet={setUser}
            onPublicForm={() => setPage("public-form")}
            sessionMessage={sessionMessage}
          />
        </Suspense>
        <ToastViewport />
      </>
    );
  }

  const suspenseFallback = (
    <div className="pp">
      <PageState variant="loading" title="Loading" message="Loading page..." />
    </div>
  );

  const dashboardContent = loading ? (
    <div className="pp">
      <PageState variant="loading" title="Loading workspace" message="Fetching internships, students, and your session..." />
    </div>
  ) : (
    <Suspense fallback={suspenseFallback}>
    <Routes>
      <Route
        path="/"
        element={
          <Dashboard
            onNewFaculty={() => navigate("/create")}
            onView={(id) => navigate(`/internship/${id}`)}
            user={user}
            students={students}
            search={search}
          />
        }
      />
      <Route
        path="/students"
        element={
          canAccessNav(user?.role, "Students") ? (
            <StudentDocumentsPage
              students={students}
              search={search}
              onStudentUpdated={handleStudentUpdated}
            />
          ) : (
            <Forbidden
              title="Students page is restricted"
              message="Only permitted roles can access student documents."
            />
          )
        }
      />
      <Route
        path="/feedback"
        element={
          canAccessNav(user?.role, "Feedback") ? (
            <FeedView feedbacks={commentFeedbacks} onOpenFeedback={handleOpenCommentFromFeedback} />
          ) : (
            <Forbidden
              title="Feedback page is restricted"
              message="Your role cannot access centralized feedback."
            />
          )
        }
      />
      <Route path="/education" element={<UserEducationPage user={user} />} />
      <Route path="/supervisor-report" element={<SupervisorEvaluationFormPage />} />
      <Route
        path="/self-evaluation"
        element={
          canAccessNav(user?.role, "Student Self-Evaluation") ? (
            <StudentEvaluationFormPage />
          ) : (
            <Forbidden
              title="Access denied"
              message="Your role cannot access this evaluation form."
            />
          )
        }
      />
      <Route
        path="/internships"
        element={
          canAccessNav(user?.role, "All Internships") ? (
            <AllInternships
              onView={(id) => navigate(`/internship/${id}`)}
              user={user}
              search={search}
            />
          ) : (
            <Forbidden
              title="Access denied"
              message="Only admins and rectors can access all internships."
            />
          )
        }
      />
      <Route
        path="/create"
        element={
          canAccessNav(user?.role, "Create Internship") ? (
            <CreatePageWrapper
              students={students}
              tutors={TUTORS}
              user={user}
              onNewInternship={addIntern}
            />
          ) : (
            <Forbidden
              title="You cannot create internships"
              message="Your role does not have permission to open this page."
            />
          )
        }
      />
      <Route
        path="/create-tutor"
        element={
          canAccessNav(user?.role, "Create Tutors") ? (
            <CreateTutorPage />
          ) : (
            <Forbidden
              title="Admin access required"
              message="Only administrators can manage staff accounts."
            />
          )
        }
      />
      <Route
        path="/admin/reports"
        element={
          canAccessNav(user?.role, "Supervisor Reports (Admin)") ? (
            <AdminSupervisorReportsPage />
          ) : (
            <Forbidden
              title="Admin access required"
              message="Only administrators can view all supervisor reports."
            />
          )
        }
      />
      <Route
        path="/admin/evaluations"
        element={
          canAccessNav(user?.role, "Student Evaluations (Admin)") ? (
            <AdminStudentEvaluationsPage />
          ) : (
            <Forbidden
              title="Admin access required"
              message="Only administrators can view all student evaluations."
            />
          )
        }
      />
      <Route
        path="/admin/statistics"
        element={
          canAccessNav(user?.role, "Statistics (Admin)") ? (
            <AdminStatisticsWrapper />
          ) : (
            <Forbidden
              title="Admin access required"
              message="Only administrators can view statistics."
            />
          )
        }
      />
      <Route path="/settings" element={<SetView user={user} />} />
      <Route path="/internship/:id" element={<InternshipPageWrapper user={user} students={students} />} />
      <Route
        path="*"
        element={
          <div className="pp">
            <ErrorPage
              status={404}
              message="This section is unavailable for your account or does not exist in the current workspace."
              onPrimaryAction={() => navigate("/")}
              primaryActionLabel="Go to dashboard"
            />
          </div>
        }
      />
    </Routes>
    </Suspense>
  );

  return (
    <>
      {sbOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.44)", zIndex: 99 }}
          onClick={() => setSbOpen(false)}
        />
      )}
      <div className="shell">
        <div className={`sb ${sbOpen ? "open" : ""}`}>
          <div className="sb-top">
            <div className="sb-icon">
              <GraduationCap size={20} color="white" />
            </div>
            <h1 style={{ color: "#fff", fontFamily: "Montserrat", fontSize: 18, fontWeight: 800 }}>
              SIUT
            </h1>
          </div>

          <div className="sb-sec">
            <div className="sb-lbl">Main</div>
            {navItems.map((item) => (
              <div
                key={item.label}
                className={`nv ${isNavActive(item.label) ? "on" : ""}`}
                onClick={() => handleNavigate(item.label)}
              >
                <item.I
                  size={16}
                  color={isNavActive(item.label) ? "var(--a1)" : "rgba(255,255,255,.4)"}
                />
                <span style={{ color: isNavActive(item.label) ? "#fff" : "rgba(255,255,255,.4)" }}>
                  {item.label}
                </span>
              </div>
            ))}

            {sidebarGroups.map((group) => {
              const isOpen =
                sidebarGroupsOpen[group.key] || group.items.some((item) => isNavActive(item.label));
              return (
                <div className="sb-group" key={group.key}>
                  <button
                    type="button"
                    className={`sb-group-btn ${isOpen ? "open" : ""}`}
                    onClick={() => handleToggleSidebarGroup(group.key)}
                  >
                    <div className="sb-group-head">
                      <group.icon size={15} color={isOpen ? "#fff" : "rgba(255,255,255,.42)"} />
                      <div className="sb-group-copy">
                        <span className="sb-group-title">{group.label}</span>
                        <span className="sb-group-meta">{group.items.length} pages</span>
                      </div>
                    </div>
                    <ChevronDown size={13} className="sb-group-toggle" />
                  </button>
                  {isOpen && (
                    <div className="sb-group-body">
                      {group.items.map((item) => (
                        <div
                          key={item.label}
                          className={`nv sub ${isNavActive(item.label) ? "on" : ""}`}
                          onClick={() => handleNavigate(item.label)}
                        >
                          <item.I
                            size={15}
                            color={isNavActive(item.label) ? "var(--a1)" : "rgba(255,255,255,.42)"}
                          />
                          <span
                            style={{
                              color: isNavActive(item.label) ? "#fff" : "rgba(255,255,255,.44)",
                            }}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isPrivilegedUser && (
              <button
                type="button"
                className={`sb-maintenance ${maintenanceMode ? "on" : ""}`}
                onClick={handleToggleMaintenance}
                aria-pressed={maintenanceMode}
                title={maintenanceMode ? "Disable maintenance mode" : "Enable maintenance mode"}
                disabled={maintenanceSaving}
              >
                <div className="sb-maintenance-copy">
                  <span className="sb-maintenance-label">Site under development</span>
                  <span className="sb-maintenance-hint">
                    {maintenanceMode ? "Access blocked for regular users" : "Portal is open"}
                  </span>
                </div>
                <div className="sb-maintenance-switch">
                  {maintenanceSaving ? (
                    <span style={{ display: "inline-block", width: 26, textAlign: "center" }}>…</span>
                  ) : maintenanceMode ? (
                    <ToggleRight size={26} />
                  ) : (
                    <ToggleLeft size={26} />
                  )}
                </div>
              </button>
            )}
          </div>

          <a
            href="https://t.me/akhmedov_anis"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "0 12px 10px",
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(99,91,255,.12)",
              textDecoration: "none",
              transition: "background .18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,91,255,.22)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(99,91,255,.12)")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#635bff">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.67l-2.967-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.834.889z" />
            </svg>
            <span style={{ color: "rgba(255,255,255,.75)", fontSize: 13, fontWeight: 500 }}>
              Help | Support
            </span>
          </a>

          <div className="spf" onClick={() => setDd((p) => !p)}>
            <div
              className="av"
              style={{ background: user?.avatarBg || "linear-gradient(135deg,#635bff,#06c9a0)" }}
            >
              {userInitials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{user?.name || "User"}</div>
              <div style={{ color: "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 500 }}>
                {user?.role || "Role"}
              </div>
            </div>
            {dd && (
              <div className="sdd">
                <div
                  className="sddi"
                  onClick={() => {
                    setPage("login");
                    setUser(null);
                    clearUserFromStorage();
                  }}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="main">
          <div className="tbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="hmb bi" onClick={() => setSbOpen(true)}>
                <Menu size={16} />
              </button>
              <span
                style={{
                  fontFamily: "Montserrat",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--t1)",
                  whiteSpace: "nowrap",
                }}
              >
                {pageTitle}
              </span>
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search
                size={15}
                style={{ position: "absolute", left: 10, color: "var(--t3)", pointerEvents: "none" }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                style={{
                  paddingLeft: 32,
                  paddingRight: 12,
                  paddingTop: 7,
                  paddingBottom: 7,
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,.1)",
                  background: "rgba(255,255,255,.8)",
                  fontSize: 13,
                  outline: "none",
                  color: "var(--t1)",
                  width: 220,
                }}
              />
            </div>
          </div>

          <div className="sa">
            <div className="page-stage">
              <div key={location.pathname} className="page-transition">
                <ErrorBoundary>{dashboardContent}</ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </div>

      {user && normalizeRole(user.role) === "admin" && (
        <>
          <div
            className="route-fab"
            onClick={() => setRouteModalOpen((p) => !p)}
            title="Quick routes"
          >
            ⤴
          </div>
          {routeModalOpen && (
            <div className="mo" onClick={() => setRouteModalOpen(false)}>
              <div
                className="mb"
                onClick={(e) => e.stopPropagation()}
                style={{ width: 360, maxWidth: "calc(100vw - 32px)" }}
              >
                <h3 style={{ margin: 0, marginBottom: 8 }}>Quick Routes</h3>
                <p style={{ marginTop: 0, marginBottom: 12, color: "var(--t2)" }}>
                  Jump to any main page
                </p>
                <div className="route-modal-list">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      className="bp"
                      onClick={() => {
                        handleNavigate(item.label);
                        setRouteModalOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <ToastViewport />
    </>
  );
}
