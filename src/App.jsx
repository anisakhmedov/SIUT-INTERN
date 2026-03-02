import { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  BarChart2,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Star,
  TrendingUp,
  Users,
  Plus,
  Briefcase,
  Calendar,
  Award,
  LogOut,
  Edit2,
  X,
  Menu,
  Building2,
  GraduationCap,
  ArrowRight,
  Eye,
  ChevronRight,
  Zap,
  Target,
  Shield,
  Activity,
  UserCheck,
  BookOpen,
  AlertCircle,
  ChevronLeft,
  Download,
  MessageCircle,
  ThumbsUp,
  Send,
  FileText,
  Hash,
  MapPin,
  CheckCircle2,
  Image as ImgIcon,
  Camera,
  AtSign,
  Filter,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Epilogue:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#f0f1f7; --sidebar:#0c0e18; --card:rgba(255,255,255,.84);
  --a1:#635bff; --a2:#06c9a0; --a3:#ff5fa0; --a4:#f5a623;
  --t1:#0c0e18; --t2:#5a6278; --t3:#9ba3bb;
  --sh:0 4px 24px rgba(99,91,255,.1); --sh2:0 16px 48px rgba(99,91,255,.18);
  --r:20px; --rs:12px;
}
html,body{height:100%;font-family:'Epilogue',sans-serif;background:var(--bg);}
@keyframes fadeUp{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideR{from{opacity:0;transform:translateX(42px)}to{opacity:1;transform:translateX(0)}}
@keyframes panelIn{from{transform:translateX(110%)}to{transform:translateX(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.72;transform:scale(1.07)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-13px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes dotP{0%,100%{transform:scale(1)}50%{transform:scale(1.5);opacity:.6}}
@keyframes logoF{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.reveal{opacity:0;transform:translateY(20px);transition:opacity .55s ease,transform .55s ease;}
.reveal.in{opacity:1;transform:translateY(0);}

/* LOGIN */
.lw{min-height:100vh;width:100vw;background:linear-gradient(140deg,#090b14 0%,#131728 60%,#090b14 100%);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
.lblob{position:absolute;border-radius:50%;filter:blur(88px);pointer-events:none;}
.lcard{position:relative;z-index:2;width:100%;max-width:438px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:28px;padding:46px 42px;backdrop-filter:blur(28px);animation:fadeUp .68s cubic-bezier(.22,1,.36,1) both;}
.linput{width:100%;padding:13px 16px;margin-bottom:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:11px;color:#fff;font-family:'Epilogue',sans-serif;font-size:14px;outline:none;transition:all .24s;}
.linput::placeholder{color:rgba(255,255,255,.3);}
.linput:focus{border-color:var(--a1);box-shadow:0 0 0 3px rgba(99,91,255,.18);background:rgba(99,91,255,.08);}
.lbtn{width:100%;padding:14px;border:none;border-radius:11px;background:linear-gradient(135deg,var(--a1),var(--a2));color:#fff;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .24s;display:flex;align-items:center;justify-content:center;gap:8px;}
.lbtn:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(99,91,255,.44);}

/* SHELL */
.shell{display:flex;height:100vh;width:100vw;overflow:hidden;}

/* SIDEBAR */
.sb{width:270px;min-width:270px;background:var(--sidebar);display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;position:relative;z-index:10;scrollbar-width:none;transition:transform .3s;}
.sb::-webkit-scrollbar{display:none;}
.sb-top{padding:21px 18px 19px;border-bottom:1px solid rgba(255,255,255,.055);display:flex;align-items:center;gap:10px;}
.sb-icon{width:37px;height:37px;border-radius:10px;background:linear-gradient(135deg,var(--a1),var(--a2));display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(99,91,255,.44);flex-shrink:0;}
.sb-sec{padding:16px 12px 5px;}
.sb-lbl{font-size:9.5px;font-weight:700;letter-spacing:1.7px;color:rgba(255,255,255,.2);text-transform:uppercase;padding:0 5px;margin-bottom:6px;}
.nv{display:flex;align-items:center;gap:10px;padding:9px 9px;border-radius:10px;cursor:pointer;transition:all .2s;color:rgba(255,255,255,.4);font-size:13px;font-weight:500;margin-bottom:1px;}
.nv:hover{background:rgba(255,255,255,.054);color:rgba(255,255,255,.78);}
.nv.on{background:linear-gradient(135deg,rgba(99,91,255,.27),rgba(6,201,160,.13));color:#fff;border:1px solid rgba(99,91,255,.27);}
.nv.on svg{color:var(--a1);}
.sb-stat{margin:0 12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.055);border-radius:12px;padding:12px;}
.ii{padding:8px 9px;border-radius:8px;transition:all .18s;cursor:pointer;margin-bottom:2px;}
.ii:hover{background:rgba(255,255,255,.054);}
.ii.sel{background:rgba(99,91,255,.16);}
.spf{margin:auto 12px 0;padding:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.055);border-radius:12px;display:flex;align-items:center;gap:8px;cursor:pointer;transition:all .18s;position:relative;}
.spf:hover{background:rgba(255,255,255,.07);}
.av{width:35px;height:35px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;flex-shrink:0;}
.sdd{position:absolute;bottom:50px;left:0;right:0;background:#171b2e;border:1px solid rgba(255,255,255,.085);border-radius:10px;overflow:hidden;animation:scaleIn .17s ease;z-index:100;}
.sddi{display:flex;align-items:center;gap:9px;padding:10px 13px;color:rgba(255,255,255,.58);font-size:12.5px;cursor:pointer;transition:all .17s;}
.sddi:hover{background:rgba(255,255,255,.06);color:#fff;}

/* MAIN */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.tbar{position:sticky;top:0;z-index:9;background:rgba(240,241,247,.88);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.06);padding:12px 26px;display:flex;align-items:center;justify-content:space-between;gap:10px;}
.sbox{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:10px;padding:8px 14px;width:252px;transition:all .24s;}
.sbox input{border:none;outline:none;background:transparent;font-family:'Epilogue',sans-serif;font-size:13px;flex:1;color:var(--t1);}
.sbox:focus-within{border-color:var(--a1);box-shadow:0 0 0 3px rgba(99,91,255,.1);}
.sa{flex:1;overflow-y:auto;overflow-x:hidden;}
.pp{padding:26px 26px 40px;}

/* CARDS */
.mc{background:var(--card);border:1px solid rgba(255,255,255,.88);border-radius:var(--r);padding:21px;backdrop-filter:blur(20px);box-shadow:var(--sh);transition:all .27s;cursor:pointer;position:relative;overflow:hidden;}
.mc:hover{transform:translateY(-4px) scale(1.018);box-shadow:var(--sh2);}
.gc{background:rgba(255,255,255,.72);border:1px solid rgba(255,255,255,.88);border-radius:var(--r);backdrop-filter:blur(20px);box-shadow:var(--sh);transition:box-shadow .27s;overflow:hidden;}
.gc:hover{box-shadow:var(--sh2);}
.ic{background:var(--card);border:1px solid rgba(255,255,255,.88);border-radius:16px;padding:17px;backdrop-filter:blur(20px);box-shadow:0 4px 12px rgba(0,0,0,.06);transition:all .26s;cursor:pointer;}
.ic:hover{transform:translateY(-3px);box-shadow:var(--sh);}

/* BUTTONS */
.bp{background:linear-gradient(135deg,var(--a1),var(--a2));border:none;border-radius:10px;color:#fff;font-family:'Epilogue',sans-serif;font-size:13px;font-weight:600;padding:9px 17px;cursor:pointer;transition:all .24s;display:inline-flex;align-items:center;gap:7px;}
.bp:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(99,91,255,.38);}
.bp:active{transform:scale(.97);}
.bg{background:transparent;border:1px solid rgba(0,0,0,.1);border-radius:9px;color:var(--t2);font-family:'Epilogue',sans-serif;font-size:12px;font-weight:500;padding:7px 12px;cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;gap:5px;}
.bg:hover{background:rgba(0,0,0,.05);color:var(--t1);}
.bi{background:#fff;border:1px solid rgba(0,0,0,.09);border-radius:9px;padding:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .18s;color:var(--t2);}
.bi:hover{background:rgba(0,0,0,.04);color:var(--t1);}

/* MISC */
.badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-size:10.5px;font-weight:600;}
.tag{display:inline-block;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:600;}
.stars{display:flex;gap:2px;}
.fr{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(0,0,0,.05);transition:padding .17s;}
.fr:last-child{border-bottom:none;}
.fr:hover{padding-left:5px;}
.fa{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;flex-shrink:0;}
.fi{width:100%;padding:11px 14px;background:rgba(0,0,0,.03);border:1.5px solid rgba(0,0,0,.09);border-radius:10px;color:var(--t1);font-family:'Epilogue',sans-serif;font-size:13px;outline:none;transition:all .24s;}
.fi:focus{border-color:var(--a1);background:rgba(99,91,255,.04);box-shadow:0 0 0 3px rgba(99,91,255,.1);}
.fl{font-size:11.5px;font-weight:600;color:var(--t2);margin-bottom:4px;display:block;}
textarea.fi{resize:vertical;min-height:80px;}
.mo{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:50;animation:fadeIn .18s ease;}
.mb{background:#fff;border-radius:22px;padding:28px;width:100%;max-width:498px;animation:scaleIn .26s cubic-bezier(.22,1,.36,1);max-height:90vh;overflow-y:auto;}
.ndot{width:7px;height:7px;background:var(--a3);border-radius:50%;position:absolute;top:-2px;right:-2px;animation:dotP 2s ease infinite;}
.hmb{display:none;}
@media(max-width:900px){
  .sb{position:fixed;top:0;left:0;bottom:0;transform:translateX(-100%);z-index:100;}
  .sb.open{transform:translateX(0);}
  .hmb{display:flex;}
  .sbox{width:170px;}
  .pp{padding:14px 12px 30px;}
  .tbar{padding:9px 13px;}
}

/* ════════════════════════════════
   INTERNSHIP DETAIL PAGE
════════════════════════════════ */
.dp{display:flex;flex-direction:column;height:100%;animation:slideR .42s cubic-bezier(.22,1,.36,1) both;}

/* hero header */
.dh{background:linear-gradient(135deg,#0c0e18 0%,#1a1d30 100%);padding:26px 30px 22px;position:relative;overflow:hidden;flex-shrink:0;}
.dhb{position:absolute;border-radius:50%;filter:blur(72px);pointer-events:none;}

/* breadcrumb back btn */
.bk{display:flex;align-items:center;gap:5px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.13);border-radius:9px;padding:6px 12px;cursor:pointer;color:rgba(255,255,255,.68);font-family:'Epilogue',sans-serif;font-size:12px;font-weight:600;transition:all .2s;}
.bk:hover{background:rgba(255,255,255,.16);}

/* action buttons in hero */
.da{display:inline-flex;align-items:center;gap:7px;padding:8px 15px;border-radius:10px;border:none;font-family:'Epilogue',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap;}
.da:hover{transform:translateY(-1px);}

/* day rail */
.dr{display:flex;gap:6px;overflow-x:auto;padding:13px 26px;background:#fff;border-bottom:1px solid rgba(0,0,0,.07);flex-shrink:0;scrollbar-width:none;}
.dr::-webkit-scrollbar{display:none;}
.dp-pill{padding:5px 14px;border-radius:999px;font-size:12px;font-weight:600;cursor:pointer;transition:all .19s;white-space:nowrap;border:none;font-family:'Epilogue',sans-serif;}
.dp-pill.on{background:linear-gradient(135deg,var(--a1),var(--a2));color:#fff;box-shadow:0 4px 12px rgba(99,91,255,.34);}
.dp-pill:not(.on){background:rgba(0,0,0,.06);color:var(--t2);}
.dp-pill:not(.on):hover{background:rgba(99,91,255,.1);color:var(--a1);}

/* detail body scroll */
.db{flex:1;overflow-y:auto;overflow-x:hidden;padding:26px 30px 48px;scroll-behavior:smooth;}
@media(max-width:900px){.db{padding:14px 13px 32px;}.dh{padding:18px 14px 16px;}.dr{padding:10px 13px;}}

/* tutor card */
.tc{display:flex;align-items:center;gap:15px;background:rgba(255,255,255,.72);border:1px solid rgba(255,255,255,.9);border-radius:15px;padding:17px 19px;backdrop-filter:blur(20px);box-shadow:var(--sh);margin-bottom:20px;}

/* photo grid */
.pg{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:10px;}
.pc{border-radius:12px;aspect-ratio:4/3;overflow:hidden;cursor:pointer;transition:all .26s;position:relative;}
.pc:hover{transform:scale(1.04);box-shadow:0 10px 26px rgba(0,0,0,.18);}
.pi{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;}
.pu{border:2px dashed rgba(99,91,255,.27);border-radius:12px;aspect-ratio:4/3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;cursor:pointer;transition:all .26s;background:rgba(99,91,255,.03);}
.pu:hover{border-color:var(--a1);background:rgba(99,91,255,.07);}

/* progress dot */
.pd{width:25px;height:25px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;cursor:pointer;transition:all .18s;flex-shrink:0;}

/* approve banner */
.ab{display:flex;align-items:center;gap:11px;padding:11px 18px;background:rgba(6,201,160,.08);border-bottom:1px solid rgba(6,201,160,.15);animation:fadeUp .28s ease;flex-shrink:0;}

/* comments panel */
.cp{position:fixed;top:0;right:0;bottom:0;width:388px;background:#fff;box-shadow:-6px 0 38px rgba(0,0,0,.13);z-index:200;display:flex;flex-direction:column;animation:panelIn .33s cubic-bezier(.22,1,.36,1) both;}
@media(max-width:600px){.cp{width:100%;}}
.cph{padding:17px 19px 14px;border-bottom:1px solid rgba(0,0,0,.07);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.cpl{flex:1;overflow-y:auto;padding:4px 19px;}
.cpf{padding:13px 17px 17px;border-top:1px solid rgba(0,0,0,.07);flex-shrink:0;}
.ci{display:flex;gap:10px;padding:13px 0;border-bottom:1px solid rgba(0,0,0,.05);animation:fadeUp .3s ease both;}
.ci:last-child{border-bottom:none;}
.ca{width:33px;height:33px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:700;color:#fff;font-size:10.5px;flex-shrink:0;}

/* lightbox */
.lb{position:fixed;inset:0;background:rgba(0,0,0,.93);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;z-index:300;animation:fadeIn .18s ease;cursor:zoom-out;}
.lbc{display:flex;flex-direction:column;align-items:center;gap:13px;cursor:default;}
.lbi{border-radius:16px;box-shadow:0 32px 72px rgba(0,0,0,.6);animation:scaleIn .26s cubic-bezier(.22,1,.36,1);}
`;

/* ═══════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════ */
const ROLES = {
  HR: { label: "HR Manager", c: "#635bff", bg: "rgba(99,91,255,.1)" },
  Mentor: { label: "Mentor", c: "#06c9a0", bg: "rgba(6,201,160,.1)" },
  Intern: { label: "Intern", c: "#ff5fa0", bg: "rgba(255,95,160,.1)" },
};
const SC = {
  Active: { c: "#10b981", bg: "rgba(16,185,129,.1)", dot: "#10b981" },
  Completed: { c: "#635bff", bg: "rgba(99,91,255,.1)", dot: "#635bff" },
  Upcoming: { c: "#f5a623", bg: "rgba(245,166,35,.1)", dot: "#f5a623" },
};
const TUTORS = [
  {
    name: "Dr. James Carter",
    i: "JC",
    g: "linear-gradient(135deg,#635bff,#06c9a0)",
    r: "Senior Mentor",
  },
  {
    name: "Prof. Lena Müller",
    i: "LM",
    g: "linear-gradient(135deg,#06c9a0,#f5a623)",
    r: "Lead Researcher",
  },
  {
    name: "Alex Kim",
    i: "AK",
    g: "linear-gradient(135deg,#ff5fa0,#635bff)",
    r: "Engineering Lead",
  },
  {
    name: "Sara Osei",
    i: "SO",
    g: "linear-gradient(135deg,#f5a623,#ff5fa0)",
    r: "Design Director",
  },
];
const DAY_TEXTS = [
  "Attended onboarding and configured the development environment. Met the full team across three departments, reviewed the engineering handbook, and explored the monorepo structure. Got access to Figma, Jira, and internal wikis.",
  "First real task: building a reusable button component library. Pair-programmed with a senior dev for 90 minutes. Discussed atomic design principles and the team's naming conventions in depth.",
  "Completed the button system with 8 variants and full accessibility support. Submitted first PR — three review rounds. Learned a lot about the team's high code-quality bar. PR merged at EOD.",
  "Attended sprint planning. Picked up an API integration task for the analytics dashboard. Spent the afternoon studying the OpenAPI spec and existing data-fetching patterns across the codebase.",
  "Implemented API calls using React Query. Handled loading, error, and empty states. Wrote unit tests for the custom hooks. Great 1:1 with mentor about caching strategies and query invalidation.",
  "Design review session: presented the analytics module prototype to the product team. Incorporated feedback on data hierarchy. Decided on Recharts over D3 for faster delivery this sprint.",
  "Week one retrospective. Filled out the self-assessment form. Strong feedback on communication clarity from mentor. One area to improve: asking questions earlier instead of staying stuck too long.",
  "Started a complex task: refactoring the legacy auth flow. Studied JWT and refresh-token patterns. Mapped the full component dependency tree before writing a single line of code.",
  "Deep in the auth refactor. Hit a tricky race condition during concurrent token refresh. Debugged with mentor for 2.5 hours. Root cause: missing request deduplication during the token renewal window.",
  "Fixed the race condition with a queuing pattern. Senior engineers called the solution elegant. Wrote detailed inline documentation. Real confidence boost after solving that one.",
  "Attended company all-hands — H2 roadmap reveal. Presented the auth improvements to the eng org afterward. Handled Q&A confidently. Director of Engineering gave a shout-out in Slack.",
  "Started the internship feedback module (very meta!). Built form components, validation logic, and file upload. Used the internal design system throughout — it is genuinely well documented.",
  "Integrated the feedback form with the backend. Implemented optimistic UI updates and graceful error recovery. PR merged same day — fastest yet. Mentor called the code quality the cleanest so far.",
  "Final day. Completed the internship report, updated all documentation, ensured zero open PRs. Exit 1:1 with mentor and HR — overwhelmingly positive. Invited to return full-time next year.",
];
const PALETTES = [
  ["#635bff", "#06c9a0"],
  ["#ff5fa0", "#635bff"],
  ["#06c9a0", "#f5a623"],
  ["#f5a623", "#ff5fa0"],
  ["#635bff", "#ff5fa0"],
  ["#06c9a0", "#635bff"],
];
function makeDays(startStr, tutorIdx) {
  const t = TUTORS[tutorIdx % 4];
  const base = new Date(startStr || "2024-02-01");
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const pc = 1 + (i % 3) + (i % 2);
    return {
      day: i + 1,
      date: d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      short: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      tutor: t,
      desc: DAY_TEXTS[i],
      photos: Array.from({ length: pc }, (_, pi) => ({
        id: `${i}-${pi}`,
        p: PALETTES[(i + pi) % 6],
        l: `Photo ${pi + 1}`,
      })),
    };
  });
}

const INTERNSHIPS0 = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "TechNova Labs",
    start: "2024-02-01",
    end: "2024-05-01",
    status: "Active",
    role: "Intern",
    desc: "React & TypeScript development",
    ti: 0,
    students: [
      {
        name: "Alice Chen",
        email: "alice@technova.example",
        studentId: "S001",
      },
      { name: "Bob Tran", email: "bob@technova.example", studentId: "S002" },
    ],
  },
  {
    id: 2,
    title: "UX Research Intern",
    company: "Studio Pixel",
    start: "2024-01-10",
    end: "2024-04-10",
    status: "Completed",
    role: "Mentor",
    desc: "Product design & user research",
    ti: 1,
    students: [
      {
        name: "Marco Rivera",
        email: "marco@studiopixel.example",
        studentId: "S010",
      },
    ],
  },
  {
    id: 3,
    title: "Data Science Intern",
    company: "DeepMetrics AI",
    start: "2024-03-15",
    end: "2024-06-15",
    status: "Upcoming",
    role: "HR",
    desc: "ML model development",
    ti: 2,
    students: [],
  },
  {
    id: 4,
    title: "Backend Engineer Intern",
    company: "CloudStack Inc",
    start: "2024-04-01",
    end: "2024-07-01",
    status: "Active",
    role: "Intern",
    desc: "Node.js & PostgreSQL",
    ti: 3,
    students: [
      {
        name: "Sofia Nakamura",
        email: "sofia@cloudstack.example",
        studentId: "S021",
      },
    ],
  },
];
const FEEDBACKS0 = [
  {
    id: 1,
    name: "Alice Chen",
    role: "Intern",
    company: "TechNova Labs",
    rating: 5,
    text: "Outstanding communication and rapid skill growth throughout the internship.",
    time: "2h ago",
    av: "AC",
    avB: "linear-gradient(135deg,#635bff,#06c9a0)",
  },
  {
    id: 2,
    name: "Marco Rivera",
    role: "Mentor",
    company: "Studio Pixel",
    rating: 4,
    text: "Very proactive intern who took initiative on multiple projects consistently.",
    time: "5h ago",
    av: "MR",
    avB: "linear-gradient(135deg,#ff5fa0,#635bff)",
  },
  {
    id: 3,
    name: "Priya Singh",
    role: "HR",
    company: "DeepMetrics AI",
    rating: 5,
    text: "Exceeded expectations. Strong technical and interpersonal skills on display.",
    time: "1d ago",
    av: "PS",
    avB: "linear-gradient(135deg,#06c9a0,#635bff)",
  },
  {
    id: 4,
    name: "Liam Walsh",
    role: "Intern",
    company: "CloudStack Inc",
    rating: 3,
    text: "Good technical foundation, needs more confidence when presenting decisions.",
    time: "2d ago",
    av: "LW",
    avB: "linear-gradient(135deg,#f5a623,#ff5fa0)",
  },
  {
    id: 5,
    name: "Sofia Nakamura",
    role: "Mentor",
    company: "TechNova Labs",
    rating: 5,
    text: "One of the best interns we have ever had. Highly recommend for full-time.",
    time: "3d ago",
    av: "SN",
    avB: "linear-gradient(135deg,#06c9a0,#ff5fa0)",
  },
];
const CHART = [
  { l: "Jan", v: 12 },
  { l: "Feb", v: 19 },
  { l: "Mar", v: 15 },
  { l: "Apr", v: 24 },
  { l: "May", v: 21 },
  { l: "Jun", v: 28 },
  { l: "Jul", v: 32 },
];

/* ═══════════════════════════════════════════════
   SHARED COMPONENTS
═══════════════════════════════════════════════ */
function Stars({ n }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          fill={i <= n ? "#f5a623" : "none"}
          color={i <= n ? "#f5a623" : "#d1d5db"}
        />
      ))}
    </div>
  );
}
function AnimNum({ target, sfx = "" }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !done.current) {
          done.current = true;
          let c = 0;
          const s = 60;
          const inc = target / s;
          const t = setInterval(() => {
            c = Math.min(c + inc, target);
            setV(Math.round(c));
            if (c >= target) clearInterval(t);
          }, 2000 / s);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return (
    <span ref={ref}>
      {v}
      {sfx}
    </span>
  );
}
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("in");
          obs.disconnect();
        }
      },
      { threshold: 0.07 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 9,
        height: 108,
        paddingTop: 6,
      }}
    >
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 9.5, color: "var(--t3)", fontWeight: 600 }}>
            {d.v}
          </span>
          <div
            style={{
              width: "100%",
              height: `${(d.v / max) * 86}px`,
              background:
                i % 2 === 0
                  ? "linear-gradient(180deg,#635bff,rgba(99,91,255,.25))"
                  : "linear-gradient(180deg,#06c9a0,rgba(6,201,160,.25))",
              borderRadius: "5px 5px 0 0",
              transition: "height 1.1s ease",
            }}
          />
          <span style={{ fontSize: 9, color: "var(--t3)" }}>{d.l}</span>
        </div>
      ))}
    </div>
  );
}
function Donut({ v = 4.6 }) {
  const r = 42,
    c = 2 * Math.PI * r,
    pct = (v / 5) * 100;
  return (
    <div
      style={{
        position: "relative",
        width: 108,
        height: 108,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="108" height="108" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="54"
          cy="54"
          r={r}
          fill="none"
          stroke="rgba(0,0,0,.07)"
          strokeWidth="9"
        />
        <circle
          cx="54"
          cy="54"
          r={r}
          fill="none"
          stroke="url(#dg)"
          strokeWidth="9"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="dg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#635bff" />
            <stop offset="100%" stopColor="#06c9a0" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <div
          style={{
            fontFamily: "Syne",
            fontSize: 19,
            fontWeight: 800,
            color: "var(--t1)",
          }}
        >
          {v}
        </div>
        <div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 600 }}>
          /5.0
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ADD MODAL
═══════════════════════════════════════════════ */
function AddModal({ onClose, onAdd }) {
  const [f, setF] = useState({
    title: "",
    company: "",
    start: "",
    end: "",
    desc: "",
    role: "Intern",
  });
  const [e, setE] = useState({});
  const validate = () => {
    const v = {};
    if (!f.title.trim()) v.title = "Required";
    if (!f.company.trim()) v.company = "Required";
    if (!f.start) v.start = "Required";
    if (!f.end) v.end = "Required";
    if (f.start && f.end && f.end < f.start) v.end = "End must be after start";
    if (!f.desc.trim()) v.desc = "Required";
    return v;
  };
  const sub = () => {
    const v = validate();
    if (Object.keys(v).length) {
      setE(v);
      return;
    }
    onAdd({
      ...f,
      id: Date.now(),
      status: new Date(f.start) > new Date() ? "Upcoming" : "Active",
      ti: Math.floor(Math.random() * 4),
      students: [],
    });
    onClose();
  };
  const F = ({ name, label, type = "text", ta }) => (
    <div style={{ marginBottom: 13 }}>
      <label className="fl">{label}</label>
      {ta ? (
        <textarea
          className="fi"
          value={f[name]}
          onChange={(ev) => setF((p) => ({ ...p, [name]: ev.target.value }))}
        />
      ) : (
        <input
          type={type}
          className="fi"
          value={f[name]}
          onChange={(ev) => setF((p) => ({ ...p, [name]: ev.target.value }))}
        />
      )}
      {e[name] && (
        <span
          style={{
            fontSize: 11,
            color: "#ef4444",
            marginTop: 3,
            display: "block",
          }}
        >
          {e[name]}
        </span>
      )}
    </div>
  );
  return (
    <div
      className="mo"
      onClick={(ev) => ev.target === ev.currentTarget && onClose()}
    >
      <div className="mb">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div style={{ fontFamily: "Syne", fontSize: 17, fontWeight: 800 }}>
            New Internship
          </div>
          <button className="bi" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <F name="title" label="Position Title" />
        <F name="company" label="Company Name" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 13,
          }}
        >
          <div>
            <label className="fl">Start Date</label>
            <input
              type="date"
              className="fi"
              value={f.start}
              onChange={(ev) => setF((p) => ({ ...p, start: ev.target.value }))}
            />
            {e.start && (
              <span style={{ fontSize: 11, color: "#ef4444" }}>{e.start}</span>
            )}
          </div>
          <div>
            <label className="fl">End Date</label>
            <input
              type="date"
              className="fi"
              value={f.end}
              onChange={(ev) => setF((p) => ({ ...p, end: ev.target.value }))}
            />
            {e.end && (
              <span style={{ fontSize: 11, color: "#ef4444" }}>{e.end}</span>
            )}
          </div>
        </div>
        <div style={{ marginBottom: 13 }}>
          <label className="fl">Role</label>
          <select
            className="fi"
            value={f.role}
            onChange={(ev) => setF((p) => ({ ...p, role: ev.target.value }))}
          >
            <option>Intern</option>
            <option>Mentor</option>
            <option>HR</option>
          </select>
        </div>
        <F name="desc" label="Description" ta />
        <button
          className="bp"
          onClick={sub}
          style={{ width: "100%", justifyContent: "center", padding: "12px" }}
        >
          <Plus size={14} /> Create Internship
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DETAIL PAGE
═══════════════════════════════════════════════ */
function DetailPage({ intern, onBack }) {
  const initialDays = makeDays(intern.start, intern.ti);
  const [days, setDays] = useState(initialDays);
  const [day, setDay] = useState(1);
  const [approved, setApproved] = useState(false);
  const [panel, setPanel] = useState(false);
  const [lb, setLb] = useState(null);
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Jane Doe",
      role: "HR",
      av: "JD",
      avB: "linear-gradient(135deg,#635bff,#06c9a0)",
      text: "Great progress on Day 3! PR quality was exceptional — very clean abstractions.",
      time: "2h ago",
    },
    {
      id: 2,
      author: TUTORS[intern.ti % 4].name,
      role: "Mentor",
      av: TUTORS[intern.ti % 4].i,
      avB: TUTORS[intern.ti % 4].g,
      text: "The debugging approach on Day 9 showed real engineering maturity. Keep it up.",
      time: "1d ago",
    },
  ]);
  const [msg, setMsg] = useState("");
  const railRef = useRef(null);
  const bodyRef = useRef(null);
  // keep days in sync if intern changes
  useEffect(() => {
    setDays(makeDays(intern.start, intern.ti));
    setDay(1);
  }, [intern.start, intern.ti]);
  const cur = days[day - 1];
  const role = ROLES[intern.role] || ROLES.Intern;
  const st = SC[intern.status] || SC.Active;

  const goDay = useCallback((d) => {
    setDay(d);
    const chip = railRef.current?.querySelector(`[data-d="${d}"]`);
    chip?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const send = () => {
    if (!msg.trim()) return;
    setComments((p) => [
      ...p,
      {
        id: Date.now(),
        author: "Jane Doe",
        role: "HR",
        av: "JD",
        avB: "linear-gradient(135deg,#635bff,#06c9a0)",
        text: msg,
        time: "just now",
      },
    ]);
    setMsg("");
  };

  // add a new dummy photo to the current day (simulates upload)
  const uploadPhoto = () => {
    const newPhoto = {
      id: `${day}-${Date.now()}`,
      p: PALETTES[(day + Date.now()) % PALETTES.length],
      l: `Uploaded ${new Date().toLocaleTimeString()}`,
    };
    setDays((d) =>
      d.map((dd, idx) =>
        idx === day - 1 ? { ...dd, photos: [...dd.photos, newPhoto] } : dd,
      ),
    );
    // open lightbox to show the uploaded image
    setLb(newPhoto);
  };

  return (
    <div className="dp">
      {/* ── HERO ── */}
      <div className="dh">
        <div
          className="dhb"
          style={{
            width: 300,
            height: 300,
            background:
              "radial-gradient(circle,rgba(99,91,255,.35),transparent)",
            top: -80,
            left: -50,
            animation: "pulse 7s ease infinite",
          }}
        />
        <div
          className="dhb"
          style={{
            width: 220,
            height: 220,
            background:
              "radial-gradient(circle,rgba(6,201,160,.28),transparent)",
            bottom: -55,
            right: 55,
            animation: "pulse 9s ease infinite 2s",
          }}
        />

        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 17,
            position: "relative",
            zIndex: 2,
          }}
        >
          <button className="bk" onClick={onBack}>
            <ChevronLeft size={13} /> Dashboard
          </button>
          <ChevronRight size={12} color="rgba(255,255,255,.28)" />
          <span style={{ color: "rgba(255,255,255,.42)", fontSize: 12 }}>
            Internships
          </span>
          <ChevronRight size={12} color="rgba(255,255,255,.28)" />
          <span
            style={{
              color: "rgba(255,255,255,.78)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {intern.title}
          </span>
        </div>

        {/* Title + Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 18,
            position: "relative",
            zIndex: 2,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span
                className="badge"
                style={{
                  background: st.bg,
                  color: st.c,
                  border: `1px solid ${st.c}35`,
                }}
              >
                {intern.status}
              </span>
              <span
                className="badge"
                style={{
                  background: role.bg,
                  color: role.c,
                  border: `1px solid ${role.c}35`,
                }}
              >
                {role.label}
              </span>
            </div>
            <h1
              style={{
                fontFamily: "Syne",
                fontSize: 21,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-.4px",
                marginBottom: 5,
              }}
            >
              {intern.title}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                color: "rgba(255,255,255,.46)",
                fontSize: 12,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Building2 size={11} />
                {intern.company}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={11} />
                {intern.start} → {intern.end}
              </span>
            </div>
          </div>

          {/* ─── TOP SECTION ACTIONS ─── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              flexWrap: "wrap",
            }}
          >
            {/* Write Comment */}
            <button
              className="da"
              onClick={() => setPanel(true)}
              style={{
                background: "rgba(99,91,255,.2)",
                color: "#b8b4ff",
                border: "1px solid rgba(99,91,255,.3)",
              }}
            >
              <MessageCircle size={13} />
              Write Comment
              {comments.length > 0 && (
                <span
                  style={{
                    background: "#635bff",
                    color: "#fff",
                    borderRadius: 999,
                    padding: "1px 7px",
                    fontSize: 9.5,
                    fontWeight: 700,
                  }}
                >
                  {comments.length}
                </span>
              )}
            </button>

            {/* Approve Report */}
            <button
              className="da"
              onClick={() => setApproved((p) => !p)}
              style={{
                background: approved
                  ? "rgba(6,201,160,.22)"
                  : "rgba(255,255,255,.09)",
                color: approved ? "#06c9a0" : "rgba(255,255,255,.62)",
                border: approved
                  ? "1px solid rgba(6,201,160,.32)"
                  : "1px solid rgba(255,255,255,.12)",
              }}
            >
              <ThumbsUp size={13} />
              {approved ? "Approved ✓" : "Approve Report"}
            </button>

            {/* Export PDF */}
            <button
              className="da"
              onClick={() => window.print()}
              style={{
                background: "rgba(255,255,255,.09)",
                color: "rgba(255,255,255,.62)",
                border: "1px solid rgba(255,255,255,.12)",
              }}
            >
              <Download size={13} />
              Export PDF
            </button>

            {/* Check Comments */}
            <button
              className="da"
              onClick={() => setPanel(true)}
              style={{
                background: "rgba(245,166,35,.16)",
                color: "#f5a623",
                border: "1px solid rgba(245,166,35,.26)",
              }}
            >
              <Eye size={13} />
              Comments ({comments.length})
            </button>
          </div>
        </div>
      </div>

      {/* ── APPROVE BANNER ── */}
      {approved && (
        <div className="ab">
          <div
            style={{
              width: 31,
              height: 31,
              borderRadius: 8,
              background: "rgba(6,201,160,.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={16} color="#06c9a0" />
          </div>
          <div>
            <div
              style={{
                fontFamily: "Syne",
                fontSize: 13,
                fontWeight: 700,
                color: "#06c9a0",
              }}
            >
              Report Approved
            </div>
            <div style={{ fontSize: 11.5, color: "var(--t2)" }}>
              Approved by Jane Doe (HR Manager) · just now
            </div>
          </div>
          <button
            onClick={() => setApproved(false)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--t3)",
              display: "flex",
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── DAY RAIL ── */}
      <div className="dr" ref={railRef}>
        {days.map((d) => (
          <button
            key={d.day}
            data-d={d.day}
            className={`dp-pill${day === d.day ? " on" : ""}`}
            onClick={() => goDay(d.day)}
          >
            Day {d.day}
          </button>
        ))}
      </div>

      {/* ── BODY ── */}
      <div className="db" ref={bodyRef} key={day}>
        {/* Day header */}
        <Reveal delay={0}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: "linear-gradient(135deg,#635bff,#06c9a0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 18px rgba(99,91,255,.34)",
                  flexShrink: 0,
                }}
              >
                <Hash size={21} color="#fff" />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "Syne",
                    fontSize: 24,
                    fontWeight: 800,
                    color: "var(--t1)",
                    letterSpacing: "-.45px",
                    lineHeight: 1.1,
                  }}
                >
                  Day {cur.day}{" "}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--t3)",
                    }}
                  >
                    of 14
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--t2)",
                    marginTop: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Calendar size={11} /> {cur.date}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="bi"
                disabled={day === 1}
                onClick={() => goDay(day - 1)}
                style={{ opacity: day === 1 ? 0.35 : 1 }}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                className="bi"
                disabled={day === 14}
                onClick={() => goDay(day + 1)}
                style={{ opacity: day === 14 ? 0.35 : 1 }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </Reveal>

        {/* ── STUDENTS ── */}
        <Reveal delay={95}>
          <div className="gc" style={{ padding: 22, marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontFamily: "Syne",
                  fontSize: 15.5,
                  fontWeight: 700,
                  color: "var(--t1)",
                }}
              >
                Students
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {intern.students && intern.students.length > 0 ? (
                intern.students.map((s, si) => (
                  <div
                    key={si}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: "linear-gradient(135deg,#635bff,#06c9a0)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      >
                        {(s.name || "")
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--t1)" }}>
                          {s.name}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--t3)" }}>
                          {s.email || s.studentId || ""}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "var(--t3)" }}>No students assigned</div>
              )}
            </div>
          </div>
        </Reveal>

        {/* ── TUTOR CARD ── */}
        <Reveal delay={65}>
          <div className="tc">
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: cur.tutor.g,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Syne",
                fontWeight: 800,
                color: "#fff",
                fontSize: 16,
                flexShrink: 0,
                boxShadow: "0 5px 16px rgba(99,91,255,.3)",
              }}
            >
              {cur.tutor.i}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "Syne",
                  fontSize: 15.5,
                  fontWeight: 700,
                  color: "var(--t1)",
                  marginBottom: 3,
                }}
              >
                {cur.tutor.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--t2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <UserCheck size={11} color="var(--a1)" /> {cur.tutor.r} ·{" "}
                {intern.company}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 5,
              }}
            >
              <span
                className="badge"
                style={{ background: role.bg, color: role.c }}
              >
                {role.label}
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  color: "var(--t3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <MapPin size={10} /> {intern.company} HQ
              </span>
            </div>
          </div>
        </Reveal>

        {/* ── DAILY REPORT ── */}
        <Reveal delay={130}>
          <div className="gc" style={{ padding: 22, marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 15,
              }}
            >
              <div
                style={{
                  width: 33,
                  height: 33,
                  borderRadius: 9,
                  background: "rgba(99,91,255,.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={15} color="#635bff" />
              </div>
              <div
                style={{
                  fontFamily: "Syne",
                  fontSize: 15.5,
                  fontWeight: 700,
                  color: "var(--t1)",
                }}
              >
                Daily Report
              </div>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10.5,
                  color: "var(--t3)",
                  background: "rgba(0,0,0,.055)",
                  padding: "3px 10px",
                  borderRadius: 999,
                }}
              >
                {intern.title}
              </span>
            </div>
            <p
              style={{
                fontSize: 14.5,
                color: "var(--t2)",
                lineHeight: 1.77,
                fontWeight: 400,
              }}
            >
              {cur.desc}
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                marginTop: 16,
                paddingTop: 14,
                borderTop: "1px solid rgba(0,0,0,.06)",
              }}
            >
              {[
                [Calendar, cur.short],
                [Hash, `Day ${cur.day} / 14`],
                [Building2, intern.company],
                [MapPin, `${intern.company} HQ`],
              ].map(([Ic, tx], idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: 11.5,
                    color: "var(--t3)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Ic size={11} /> {tx}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── PHOTOS ── */}
        <Reveal delay={200}>
          <div className="gc" style={{ padding: 22, marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 33,
                  height: 33,
                  borderRadius: 9,
                  background: "rgba(6,201,160,.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Camera size={15} color="#06c9a0" />
              </div>
              <div
                style={{
                  fontFamily: "Syne",
                  fontSize: 15.5,
                  fontWeight: 700,
                  color: "var(--t1)",
                }}
              >
                Photos
              </div>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11.5,
                  color: "var(--t3)",
                }}
              >
                {cur.photos.length} uploaded
              </span>
            </div>
            <div className="pg">
              {cur.photos.map((ph, pi) => (
                <div
                  key={ph.id}
                  className="pc"
                  onClick={() => setLb(ph)}
                  style={{ animation: `fadeUp .38s ease ${pi * 55}ms both` }}
                >
                  <div
                    className="pi"
                    style={{
                      background: `linear-gradient(135deg,${ph.p[0]}22,${ph.p[1]}22)`,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: `linear-gradient(135deg,${ph.p[0]},${ph.p[1]})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 6px 18px ${ph.p[0]}55`,
                      }}
                    >
                      <ImgIcon size={20} color="#fff" />
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--t2)",
                        fontWeight: 500,
                      }}
                    >
                      Day {day} · {ph.l}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--t3)" }}>
                      {intern.company}
                    </span>
                  </div>
                </div>
              ))}
              <div className="pu" onClick={() => uploadPhoto()}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "rgba(99,91,255,.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus size={18} color="#635bff" />
                </div>
                <span
                  style={{ fontSize: 11.5, color: "#635bff", fontWeight: 600 }}
                >
                  Upload Photo
                </span>
                <span style={{ fontSize: 10.5, color: "var(--t3)" }}>
                  PNG, JPG, HEIC
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── PROGRESS ── */}
        <Reveal delay={270}>
          <div className="gc" style={{ padding: 22 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 33,
                  height: 33,
                  borderRadius: 9,
                  background: "rgba(245,166,35,.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Activity size={15} color="#f5a623" />
              </div>
              <div
                style={{
                  fontFamily: "Syne",
                  fontSize: 15.5,
                  fontWeight: 700,
                  color: "var(--t1)",
                }}
              >
                14-Day Timeline
              </div>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11.5,
                  color: "#635bff",
                  fontWeight: 600,
                }}
              >
                {Math.round((day / 14) * 100)}% complete
              </span>
            </div>
            <div
              style={{
                height: 7,
                background: "rgba(0,0,0,.07)",
                borderRadius: 999,
                overflow: "hidden",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: `${(day / 14) * 100}%`,
                  height: "100%",
                  background: "linear-gradient(90deg,#635bff,#06c9a0)",
                  borderRadius: 999,
                  transition: "width .6s ease",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "var(--t3)",
                marginBottom: 16,
              }}
            >
              <span>Day 1 · {days[0].short}</span>
              <span style={{ color: "#635bff", fontWeight: 600 }}>
                Day {day}
              </span>
              <span>Day 14 · {days[13].short}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {days.map((d) => (
                <div
                  key={d.day}
                  className="pd"
                  onClick={() => goDay(d.day)}
                  style={{
                    background:
                      d.day < day
                        ? "linear-gradient(135deg,#635bff,#06c9a0)"
                        : d.day === day
                          ? "#635bff"
                          : "rgba(0,0,0,.08)",
                    color: d.day <= day ? "#fff" : "var(--t3)",
                    boxShadow:
                      d.day === day ? "0 3px 11px rgba(99,91,255,.44)" : "none",
                    transform: d.day === day ? "scale(1.18)" : "scale(1)",
                  }}
                >
                  {d.day}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* ── COMMENTS PANEL ── */}
      {panel && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.32)",
              zIndex: 199,
              backdropFilter: "blur(5px)",
              animation: "fadeIn .18s ease",
            }}
            onClick={() => setPanel(false)}
          />
          <div className="cp">
            <div className="cph">
              <div>
                <div
                  style={{
                    fontFamily: "Syne",
                    fontSize: 15.5,
                    fontWeight: 800,
                    color: "var(--t1)",
                  }}
                >
                  Comments
                </div>
                <div style={{ fontSize: 11.5, color: "var(--t3)" }}>
                  {comments.length} total · {intern.title}
                </div>
              </div>
              <button className="bi" onClick={() => setPanel(false)}>
                <X size={15} />
              </button>
            </div>
            <div className="cpl">
              {comments.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "38px 0",
                    color: "var(--t3)",
                    fontSize: 13,
                  }}
                >
                  No comments yet
                </div>
              )}
              {comments.map((c, i) => (
                <div
                  key={c.id}
                  className="ci"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="ca" style={{ background: c.avB }}>
                    {c.av}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "var(--t1)",
                        }}
                      >
                        {c.author}
                      </span>
                      <span
                        className="badge"
                        style={{
                          background: ROLES[c.role]?.bg || "rgba(99,91,255,.1)",
                          color: ROLES[c.role]?.c || "#635bff",
                          fontSize: 9.5,
                          padding: "1px 7px",
                        }}
                      >
                        {c.role}
                      </span>
                      <span
                        style={{
                          fontSize: 10.5,
                          color: "var(--t3)",
                          marginLeft: "auto",
                        }}
                      >
                        {c.time}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--t2)",
                        lineHeight: 1.58,
                      }}
                    >
                      {c.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="cpf">
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <textarea
                    className="fi"
                    style={{
                      minHeight: 68,
                      resize: "none",
                      fontSize: 12.5,
                      paddingRight: 34,
                    }}
                    placeholder="Write a comment… (Enter to send)"
                    value={msg}
                    onChange={(ev) => setMsg(ev.target.value)}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" && !ev.shiftKey) {
                        ev.preventDefault();
                        send();
                      }
                    }}
                  />
                  <AtSign
                    size={13}
                    color="var(--t3)"
                    style={{ position: "absolute", top: 10, right: 11 }}
                  />
                </div>
                <button
                  className="bp"
                  style={{ padding: "9px 13px", alignSelf: "flex-end" }}
                  onClick={send}
                >
                  <Send size={13} />
                </button>
              </div>
              <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 5 }}>
                Enter to send · Shift+Enter for new line
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── LIGHTBOX ── */}
      {lb && (
        <div className="lb" onClick={() => setLb(null)}>
          <div className="lbc" onClick={(ev) => ev.stopPropagation()}>
            <div
              className="lbi"
              style={{
                width: Math.min(580, window.innerWidth * 0.86),
                height: Math.min(380, window.innerHeight * 0.58),
                background: `linear-gradient(135deg,${lb.p[0]},${lb.p[1]})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 28px 70px ${lb.p[0]}60`,
              }}
            >
              <ImgIcon size={52} color="rgba(255,255,255,.52)" />
            </div>
            <div style={{ color: "rgba(255,255,255,.52)", fontSize: 12.5 }}>
              {intern.title} · Day {day} · {lb.l}
            </div>
            <button
              onClick={() => setLb(null)}
              style={{
                color: "rgba(255,255,255,.52)",
                background: "rgba(255,255,255,.1)",
                border: "1px solid rgba(255,255,255,.14)",
                borderRadius: 9,
                padding: "7px 17px",
                cursor: "pointer",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontFamily: "Epilogue",
              }}
            >
              <X size={12} /> Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DASHBOARD VIEW
═══════════════════════════════════════════════ */
function DashView({ internships, feedbacks, setNav, onOpen }) {
  const metrics = [
    {
      I: Users,
      label: "Total Interns",
      v: 48,
      sfx: "",
      disp: null,
      c: "#635bff",
      bg: "rgba(99,91,255,.1)",
      gr: "linear-gradient(135deg,rgba(99,91,255,.12),rgba(6,201,160,.07))",
    },
    {
      I: MessageSquare,
      label: "Feedback Received",
      v: 127,
      sfx: "",
      disp: null,
      c: "#06c9a0",
      bg: "rgba(6,201,160,.1)",
      gr: "linear-gradient(135deg,rgba(6,201,160,.12),rgba(99,91,255,.07))",
    },
    {
      I: Star,
      label: "Average Rating",
      v: 46,
      sfx: "",
      disp: "4.6",
      c: "#f5a623",
      bg: "rgba(245,166,35,.1)",
      gr: "linear-gradient(135deg,rgba(245,166,35,.12),rgba(255,95,160,.07))",
    },
    {
      I: TrendingUp,
      label: "Completion Rate",
      v: 89,
      sfx: "%",
      disp: null,
      c: "#ff5fa0",
      bg: "rgba(255,95,160,.1)",
      gr: "linear-gradient(135deg,rgba(255,95,160,.12),rgba(99,91,255,.07))",
    },
  ];
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
          <div
            style={{
              position: "absolute",
              right: -18,
              top: -18,
              width: 130,
              height: 130,
              background: "rgba(255,255,255,.08)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 44,
              bottom: -28,
              width: 84,
              height: 84,
              background: "rgba(255,255,255,.06)",
              borderRadius: "50%",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                fontFamily: "Syne",
                fontSize: 19,
                fontWeight: 800,
                marginBottom: 3,
              }}
            >
              Good morning, Jane 👋
            </div>
            <div style={{ fontSize: 13, opacity: 0.82 }}>
              {internships.filter((i) => i.status === "Active").length} active
              internships · {feedbacks.length} feedback items to review today.
            </div>
          </div>
        </div>
      </Reveal>

      {/* Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(195px,1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {metrics.map((m, i) => (
          <Reveal key={m.label} delay={i * 65}>
            <div className="mc" style={{ background: m.gr }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 15,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: m.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <m.I size={18} color={m.c} />
                </div>
                <TrendingUp size={12} color="#10b981" />
              </div>
              <div
                style={{
                  fontFamily: "Syne",
                  fontSize: 27,
                  fontWeight: 800,
                  color: "var(--t1)",
                  marginBottom: 2,
                }}
              >
                {m.disp || <AnimNum target={m.v} sfx={m.sfx} />}
              </div>
              <div
                style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}
              >
                {m.label}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Reveal delay={160}>
          <div className="gc" style={{ padding: 21 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontFamily: "Syne",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--t1)",
                }}
              >
                Feedback Trend
              </div>
              <button className="bg" style={{ fontSize: 11 }}>
                Monthly <ChevronDown size={11} />
              </button>
            </div>
            <BarChart data={CHART} />
          </div>
        </Reveal>
        <Reveal delay={210}>
          <div className="gc" style={{ padding: 21 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontFamily: "Syne",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--t1)",
                }}
              >
                Avg. Rating
              </div>
              <span
                className="badge"
                style={{ background: "rgba(16,185,129,.1)", color: "#10b981" }}
              >
                ↑ 0.3 mo
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Donut />
              <div style={{ flex: 1 }}>
                {[5, 4, 3, 2, 1].map((r) => {
                  const n = feedbacks.filter((f) => f.rating === r).length;
                  const p = (n / feedbacks.length) * 100;
                  return (
                    <div
                      key={r}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{ fontSize: 10, color: "var(--t3)", width: 7 }}
                      >
                        {r}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: 5,
                          background: "rgba(0,0,0,.07)",
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${p}%`,
                            height: "100%",
                            background:
                              "linear-gradient(90deg,#635bff,#06c9a0)",
                            borderRadius: 999,
                            transition: "width 1.1s ease",
                          }}
                        />
                      </div>
                      <span
                        style={{ fontSize: 10, color: "var(--t3)", width: 10 }}
                      >
                        {n}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Feedback list */}
      <Reveal delay={280}>
        <div className="gc" style={{ padding: 21, marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <div
              style={{
                fontFamily: "Syne",
                fontSize: 15,
                fontWeight: 700,
                color: "var(--t1)",
              }}
            >
              Recent Feedback
            </div>
            <button className="bg" onClick={() => setNav("Feedback")}>
              View all <ArrowRight size={11} />
            </button>
          </div>
          <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 13 }}>
            Latest from interns & mentors
          </p>
          {feedbacks.slice(0, 4).map((f, i) => (
            <div
              key={f.id}
              className="fr"
              style={{ animationDelay: `${i * 65}ms` }}
            >
              <div className="fa" style={{ background: f.avB, color: "#fff" }}>
                {f.av}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 2,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--t1)",
                    }}
                  >
                    {f.name}
                  </span>
                  <span
                    className="badge"
                    style={{
                      background: ROLES[f.role]?.bg,
                      color: ROLES[f.role]?.c,
                    }}
                  >
                    {f.role}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--t2)" }}>
                  {f.text}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <Stars n={f.rating} />
                <div
                  style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 2 }}
                >
                  {f.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Internship cards */}
      <Reveal delay={360}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontFamily: "Syne",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--t1)",
            }}
          >
            Internships
          </div>
          <span
            className="badge"
            style={{ background: "rgba(245,166,35,.1)", color: "#f5a623" }}
          >
            {internships.filter((i) => i.status === "Upcoming").length} upcoming
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(235px,1fr))",
            gap: 14,
          }}
        >
          {internships.map((intern, idx) => {
            const s = SC[intern.status];
            const r = ROLES[intern.role] || ROLES.Intern;
            return (
              <Reveal key={intern.id} delay={idx * 55}>
                <div className="ic" onClick={() => onOpen(intern)}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 11,
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background:
                          "linear-gradient(135deg,rgba(99,91,255,.14),rgba(6,201,160,.09))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Briefcase size={17} color="#635bff" />
                    </div>
                    <span
                      className="badge"
                      style={{ background: s.bg, color: s.c }}
                    >
                      {intern.status}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "Syne",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--t1)",
                      marginBottom: 3,
                    }}
                  >
                    {intern.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--t2)",
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Building2 size={11} /> {intern.company}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--t3)",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      marginBottom: 12,
                    }}
                  >
                    <Calendar size={10} /> {intern.start} → {intern.end}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      className="badge"
                      style={{ background: r.bg, color: r.c }}
                    >
                      {r.label}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#635bff",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      Open <ChevronRight size={11} />
                    </span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FEEDBACK VIEW
═══════════════════════════════════════════════ */
function FeedView({ feedbacks }) {
  const [filter, setFilter] = useState("All");
  const list =
    filter === "All" ? feedbacks : feedbacks.filter((f) => f.role === filter);
  return (
    <div className="pp">
      <Reveal>
        <div
          style={{
            display: "flex",
            gap: 7,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          {["All", "Intern", "Mentor", "HR"].map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={filter === r ? "bp" : "bg"}
              style={{ fontSize: 12 }}
            >
              {r === "All" ? "All Feedback" : ROLES[r]?.label || r}
            </button>
          ))}
        </div>
      </Reveal>
      <div className="gc" style={{ padding: 21 }}>
        {list.map((f, i) => (
          <Reveal key={f.id} delay={i * 50}>
            <div className="fr">
              <div
                className="fa"
                style={{
                  background: f.avB,
                  color: "#fff",
                  width: 42,
                  height: 42,
                }}
              >
                {f.av}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 3,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "var(--t1)",
                    }}
                  >
                    {f.name}
                  </span>
                  <span
                    className="badge"
                    style={{
                      background: ROLES[f.role]?.bg,
                      color: ROLES[f.role]?.c,
                    }}
                  >
                    {f.role}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>
                    {f.company}
                  </span>
                </div>
                <div
                  style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.55 }}
                >
                  {f.text}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, minWidth: 76 }}>
                <Stars n={f.rating} />
                <div
                  style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 2 }}
                >
                  {f.time}
                </div>
                <button
                  className="bg"
                  style={{ marginTop: 6, padding: "3px 9px", fontSize: 10.5 }}
                >
                  <Eye size={11} /> View
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ANALYTICS VIEW
═══════════════════════════════════════════════ */
function AnalView({ internships }) {
  const rd = Object.entries(ROLES).map(([k]) => ({
    label: k,
    val: internships.filter((i) => i.role === k).length,
    c: ROLES[k].c,
  }));
  const kpis = [
    {
      I: Activity,
      label: "Response Rate",
      val: "94%",
      sub: "Above target",
      c: "#10b981",
    },
    {
      I: Target,
      label: "Goal Completion",
      val: "78%",
      sub: "3 pending",
      c: "#635bff",
    },
    {
      I: Award,
      label: "Top Performers",
      val: "12",
      sub: "This quarter",
      c: "#f5a623",
    },
    {
      I: Zap,
      label: "Avg Duration",
      val: "3.2 mo",
      sub: "Per internship",
      c: "#06c9a0",
    },
    {
      I: BookOpen,
      label: "Mentors Active",
      val: "8",
      sub: "Of 10 total",
      c: "#ff5fa0",
    },
    {
      I: CheckCircle2,
      label: "Satisfaction",
      val: "91%",
      sub: "Intern happiness",
      c: "#10b981",
    },
  ];
  return (
    <div className="pp">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <Reveal>
          <div className="gc" style={{ padding: 21 }}>
            <div
              style={{
                fontFamily: "Syne",
                fontSize: 15,
                fontWeight: 700,
                color: "var(--t1)",
                marginBottom: 16,
              }}
            >
              Monthly Volume
            </div>
            <BarChart data={CHART} />
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="gc" style={{ padding: 21 }}>
            <div
              style={{
                fontFamily: "Syne",
                fontSize: 15,
                fontWeight: 700,
                color: "var(--t1)",
                marginBottom: 16,
              }}
            >
              By Role
            </div>
            {rd.map((d) => (
              <div key={d.label} style={{ marginBottom: 13 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "var(--t1)",
                    }}
                  >
                    {d.label}
                  </span>
                  <span style={{ fontSize: 12.5, color: d.c, fontWeight: 700 }}>
                    {d.val}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "rgba(0,0,0,.07)",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(d.val / internships.length) * 100}%`,
                      height: "100%",
                      background: d.c,
                      borderRadius: 999,
                      transition: "width 1.2s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
      <Reveal delay={160}>
        <div className="gc" style={{ padding: 21 }}>
          <div
            style={{
              fontFamily: "Syne",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--t1)",
              marginBottom: 16,
            }}
          >
            Key Performance Indicators
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))",
              gap: 14,
            }}
          >
            {kpis.map((k) => (
              <div key={k.label} className="mc" style={{ cursor: "default" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: `${k.c}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <k.I size={16} color={k.c} />
                </div>
                <div
                  style={{
                    fontFamily: "Syne",
                    fontSize: 21,
                    fontWeight: 800,
                    color: "var(--t1)",
                    marginBottom: 1,
                  }}
                >
                  {k.val}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--t1)",
                    marginBottom: 1,
                  }}
                >
                  {k.label}
                </div>
                <div style={{ fontSize: 11, color: k.c }}>{k.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SETTINGS VIEW
═══════════════════════════════════════════════ */
function SetView() {
  const [n, setN] = useState({ email: true, push: false, weekly: true });
  return (
    <div className="pp" style={{ maxWidth: 570 }}>
      <Reveal>
        <div className="gc" style={{ padding: 24, marginBottom: 16 }}>
          <div
            style={{
              fontFamily: "Syne",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--t1)",
              marginBottom: 16,
            }}
          >
            Profile
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 15,
                background: "linear-gradient(135deg,#635bff,#06c9a0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Syne",
                fontSize: 19,
                fontWeight: 800,
                color: "#fff",
              }}
            >
              JD
            </div>
            <div>
              <div
                style={{ fontFamily: "Syne", fontSize: 14.5, fontWeight: 700 }}
              >
                Jane Doe
              </div>
              <div style={{ fontSize: 12, color: "var(--t3)" }}>
                HR Manager · Institute of Technology
              </div>
            </div>
            <button className="bg" style={{ marginLeft: "auto" }}>
              <Edit2 size={12} /> Edit
            </button>
          </div>
          {[
            ["Full Name", "Jane Doe"],
            ["Email", "jane.doe@institute.edu"],
            ["Department", "Human Resources"],
          ].map(([l, v]) => (
            <div key={l} style={{ marginBottom: 12 }}>
              <label className="fl">{l}</label>
              <input className="fi" defaultValue={v} />
            </div>
          ))}
          <button className="bp">Save Changes</button>
        </div>
      </Reveal>
      <Reveal delay={70}>
        <div className="gc" style={{ padding: 24 }}>
          <div
            style={{
              fontFamily: "Syne",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--t1)",
              marginBottom: 16,
            }}
          >
            Notifications
          </div>
          {[
            ["email", "Email Notifications", "Receive summaries via email"],
            ["push", "Push Notifications", "Browser push notifications"],
            ["weekly", "Weekly Report", "Monday digest"],
          ].map(([k, l, d]) => (
            <div
              key={k}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid rgba(0,0,0,.055)",
              }}
            >
              <div>
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}
                >
                  {l}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--t3)" }}>{d}</div>
              </div>
              <div
                onClick={() => setN((p) => ({ ...p, [k]: !p[k] }))}
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 999,
                  background: n[k]
                    ? "linear-gradient(135deg,#635bff,#06c9a0)"
                    : "rgba(0,0,0,.13)",
                  cursor: "pointer",
                  transition: "all .28s",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 2.5,
                    left: n[k] ? 20 : 2.5,
                    width: 17,
                    height: 17,
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left .26s",
                    boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════════ */
function LoginPage({ onLogin }) {
  const [f, setF] = useState({ username: "", pw: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const go = () => {
    if (!f.username || !f.pw) {
      setErr("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 750);
  };
  return (
    <div className="lw">
      {[
        {
          w: 460,
          h: 460,
          bg: "radial-gradient(circle,rgba(99,91,255,.38),transparent)",
          top: "-95px",
          left: "-95px",
          anim: "pulse 7s ease infinite",
        },
        {
          w: 360,
          h: 360,
          bg: "radial-gradient(circle,rgba(6,201,160,.30),transparent)",
          bottom: "-75px",
          right: "-75px",
          anim: "pulse 9s ease infinite 2s",
        },
        {
          w: 270,
          h: 270,
          bg: "radial-gradient(circle,rgba(255,95,160,.24),transparent)",
          top: "42%",
          right: "16%",
          anim: "float 11s ease infinite",
        },
      ].map((b, i) => (
        <div
          key={i}
          className="lblob"
          style={{
            width: b.w,
            height: b.h,
            background: b.bg,
            top: b.top,
            left: b.left,
            bottom: b.bottom,
            right: b.right,
            animation: b.anim,
          }}
        />
      ))}
      <div className="lcard">
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 30,
            animation: "logoF 3s ease-in-out infinite",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 13,
              background: "linear-gradient(135deg,#635bff,#06c9a0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 22px rgba(99,91,255,.5)",
            }}
          >
            <GraduationCap size={24} color="#fff" />
          </div>
          <div>
            <div
              style={{
                fontFamily: "Syne",
                fontSize: 18,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-.35px",
              }}
            >
              InternTrack
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,.34)",
                fontWeight: 500,
              }}
            >
              Institute of Technology · Portal
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontFamily: "Syne",
              fontSize: 23,
              fontWeight: 800,
              color: "#fff",
              marginBottom: 6,
              letterSpacing: "-.4px",
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: "rgba(255,255,255,.36)", fontSize: 13 }}>
            Sign in to your internship management portal
          </p>
        </div>
        <input
          type="text"
          placeholder="Username"
          className="linput"
          value={f.username}
          onChange={(ev) => setF((p) => ({ ...p, username: ev.target.value }))}
          onKeyDown={(ev) => ev.key === "Enter" && go()}
        />
        <input
          type="password"
          placeholder="Password"
          className="linput"
          value={f.pw}
          onChange={(ev) => setF((p) => ({ ...p, pw: ev.target.value }))}
          onKeyDown={(ev) => ev.key === "Enter" && go()}
        />
        {err && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
              color: "#f87171",
              fontSize: 12,
            }}
          >
            <AlertCircle size={12} />
            {err}
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginBottom: 16,
          }}
        >
          <button
            className="bg"
            onClick={() =>
              setF((p) => ({
                ...p,
                username: "Demo User",
                pw: "password123",
              }))
            }
            style={{ fontSize: 12 }}
          >
            Autofill
          </button>
        </div>
        <button className="lbtn" onClick={go}>
          {loading && (
            <div
              style={{
                width: 17,
                height: 17,
                border: "2px solid rgba(255,255,255,.3)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "spin .7s linear infinite",
              }}
            ></div>
          )}
          {loading ? "Signing in…" : "Sign In to Dashboard"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("login");
  const [nav, setNav] = useState("Dashboard");
  const [openIntern, setOpenIntern] = useState(null);
  const [internships, setInternships] = useState(INTERNSHIPS0);
  const feedbacks = FEEDBACKS0;
  const [modal, setModal] = useState(false);
  const [dd, setDd] = useState(false);
  const [sbOpen, setSbOpen] = useState(false);
  const [newId, setNewId] = useState(null);

  const addIntern = (i) => {
    setInternships((p) => [i, ...p]);
    setNewId(i.id);
    setTimeout(() => setNewId(null), 900);
  };
  const navigate = (label) => {
    setNav(label);
    setOpenIntern(null);
    setSbOpen(false);
  };
  const openDetail = (intern) => {
    setOpenIntern(intern);
    setSbOpen(false);
  };

  const navItems = [
    { I: LayoutDashboard, label: "Dashboard" },
    { I: MessageSquare, label: "Feedback" },
    { I: BarChart2, label: "Analytics" },
    { I: Settings, label: "Settings" },
  ];

  const renderContent = () => {
    if (openIntern)
      return (
        <DetailPage intern={openIntern} onBack={() => setOpenIntern(null)} />
      );
    if (nav === "Dashboard")
      return (
        <DashView
          internships={internships}
          feedbacks={feedbacks}
          setNav={setNav}
          onOpen={openDetail}
        />
      );
    if (nav === "Feedback") return <FeedView feedbacks={feedbacks} />;
    if (nav === "Analytics") return <AnalView internships={internships} />;
    if (nav === "Settings") return <SetView />;
    return null;
  };

  if (page === "login")
    return (
      <>
        <style>{CSS}</style>
        <LoginPage onLogin={() => setPage("dashboard")} />
      </>
    );

  return (
    <>
      <style>{CSS}</style>
      {modal && <AddModal onClose={() => setModal(false)} onAdd={addIntern} />}
      {sbOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.44)",
            zIndex: 99,
            backdropFilter: "blur(4px)",
            animation: "fadeIn .18s ease",
          }}
          onClick={() => setSbOpen(false)}
        />
      )}

      <div className="shell">
        {/* ── SIDEBAR ── */}
        <aside className={`sb${sbOpen ? " open" : ""}`}>
          <div className="sb-top">
            <div className="sb-icon">
              <GraduationCap size={18} color="#fff" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "Syne",
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                InternTrack
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,.26)",
                  fontWeight: 500,
                }}
              >
                Management Portal
              </div>
            </div>
          </div>

          {/* Nav */}
          <div className="sb-sec">
            <div className="sb-lbl">Menu</div>
            {navItems.map(({ I, label }) => (
              <div
                key={label}
                className={`nv${nav === label && !openIntern ? " on" : ""}`}
                onClick={() => navigate(label)}
              >
                <I size={15} />
                <span>{label}</span>
                {nav === label && !openIntern && (
                  <ChevronRight
                    size={12}
                    style={{ marginLeft: "auto", opacity: 0.5 }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="sb-sec">
            <div className="sb-lbl">Status</div>
            <div className="sb-stat">
              {Object.entries(SC).map(([k, v]) => {
                const cnt = internships.filter((i) => i.status === k).length;
                return (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "5px 0",
                      borderBottom:
                        k !== "Upcoming"
                          ? "1px solid rgba(255,255,255,.04)"
                          : "none",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: v.dot,
                          boxShadow: `0 0 6px ${v.dot}`,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,.42)",
                          fontWeight: 500,
                        }}
                      >
                        {k}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: v.c, fontWeight: 700 }}>
                      {cnt}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Internship list */}
          <div className="sb-sec" style={{ flex: 1, overflowY: "auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <div className="sb-lbl" style={{ marginBottom: 0 }}>
                Internships
              </div>
              <button
                className="bp"
                style={{ padding: "3px 8px", fontSize: 10, borderRadius: 7 }}
                onClick={() => setModal(true)}
              >
                <Plus size={9} /> New
              </button>
            </div>
            {internships.slice(0, 6).map((i) => (
              <div
                key={i.id}
                className={`ii${openIntern?.id === i.id ? " sel" : ""}`}
                onClick={() => openDetail(i)}
                style={{
                  animation: i.id === newId ? "fadeUp .42s ease" : undefined,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,.7)",
                    fontWeight: 600,
                    marginBottom: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {i.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span
                    style={{ fontSize: 9.5, color: "rgba(255,255,255,.3)" }}
                  >
                    {i.company}
                  </span>
                  <span
                    className="badge"
                    style={{
                      background: SC[i.status].bg,
                      color: SC[i.status].c,
                      fontSize: 8.5,
                      padding: "1px 5px",
                    }}
                  >
                    {i.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Profile */}
          <div style={{ padding: "12px 12px 17px" }}>
            <div className="spf" onClick={() => setDd((p) => !p)}>
              <div
                className="av"
                style={{
                  background: "linear-gradient(135deg,#635bff,#06c9a0)",
                  color: "#fff",
                }}
              >
                JD
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(255,255,255,.8)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  Jane Doe
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>
                  HR Manager
                </div>
              </div>
              <ChevronDown
                size={12}
                color="rgba(255,255,255,.35)"
                style={{
                  transform: dd ? "rotate(180deg)" : "none",
                  transition: ".18s",
                }}
              />
              {dd && (
                <div className="sdd">
                  {[
                    { I: UserCheck, l: "My Profile" },
                    { I: Settings, l: "Preferences" },
                    { I: Shield, l: "Security" },
                    { I: LogOut, l: "Sign Out", a: () => setPage("login") },
                  ].map(({ I, l, a }) => (
                    <div
                      key={l}
                      className="sddi"
                      onClick={() => {
                        setDd(false);
                        a?.();
                      }}
                    >
                      <I size={12} />
                      {l}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">
          <div className="tbar">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="bi hmb" onClick={() => setSbOpen(true)}>
                <Menu size={16} />
              </button>
              {openIntern ? (
                <div>
                  <div
                    style={{
                      fontFamily: "Syne",
                      fontSize: 16,
                      fontWeight: 800,
                      color: "var(--t1)",
                    }}
                  >
                    {openIntern.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--t3)",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Building2 size={10} />
                    {openIntern.company}
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      fontFamily: "Syne",
                      fontSize: 17,
                      fontWeight: 800,
                      color: "var(--t1)",
                    }}
                  >
                    {nav}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--t3)" }}>
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="sbox">
                <Search size={13} color="var(--t3)" />
                <input placeholder="Search…" />
              </div>
              <div style={{ position: "relative" }}>
                <button className="bi">
                  <Bell size={15} />
                </button>
                <div className="ndot" />
              </div>
              {!openIntern && (
                <button className="bp" onClick={() => setModal(true)}>
                  <Plus size={13} /> Add
                </button>
              )}
            </div>
          </div>
          <div className="sa">{renderContent()}</div>
        </div>
      </div>
    </>
  );
}
