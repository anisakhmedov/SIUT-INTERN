import { useState, useEffect, useRef, useCallback, useMemo } from "react";

import {
  LayoutDashboard,
  MessageSquare,
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
  UserCircle,
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



// login page component lives in its own file now
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import AllInternships from "./components/AllInternships";
import CreatePage from "./components/CreatePage";
import InternshipPage from "./components/InternshipPage";
import CreateTutorPage from "./components/CreateTutorPage";
import StudentDocumentsPage from "./components/StudentDocumentsPage";
import UserEducationPage from "./components/UserEducationPage";
import ToastViewport from "./components/ToastViewport";
import PageState from "./components/PageState";
import ErrorPage from "./components/ErrorPage";
import MaintenancePage from "./components/MaintenancePage";
import SupervisorEvaluationFormPage from "./components/SupervisorEvaluationFormPage";
import StudentEvaluationFormPage from "./components/StudentEvaluationFormPage";
import AdminSupervisorReportsPage from "./components/AdminSupervisorReportsPage";
import AdminStudentEvaluationsPage from "./components/AdminStudentEvaluationsPage";
import AdminStatisticsPage from "./components/AdminStatisticsPage";

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#f0f1f7; --sidebar:#0c0e18; --card:rgba(255,255,255,.84);
  --a1:#635bff; --a2:#06c9a0; --a3:#ff5fa0; --a4:#f5a623;
  --t1:#0c0e18; --t2:#5a6278; --t3:#9ba3bb;
  --sh:0 4px 24px rgba(99,91,255,.1); --sh2:0 16px 48px rgba(99,91,255,.18);
  --r:20px; --rs:12px;
}
html,body{height:100%;font-family:'Montserrat',sans-serif;background:var(--bg);}
@keyframes fadeUp{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideR{from{opacity:0;transform:translateX(42px)}to{opacity:1;transform:translateX(0)}}
@keyframes panelIn{from{transform:translateX(110%)}to{transform:translateX(0)}}
@keyframes modalIn{from{opacity:0;transform:translate(-50%,-50%) scale(.94)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.72;transform:scale(1.07)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-13px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes dotP{0%,100%{transform:scale(1)}50%{transform:scale(1.5);opacity:.6}}
@keyframes logoF{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.page-stage{position:relative;min-height:100%;}
.page-transition{animation:pageIn .34s cubic-bezier(.22,1,.36,1) both;will-change:transform,opacity;}
@keyframes pageIn{from{opacity:0;transform:translateY(10px) scale(.995)}to{opacity:1;transform:translateY(0) scale(1)}}
.reveal{opacity:0;transform:translateY(20px);transition:opacity .55s ease,transform .55s ease;}
.reveal.in{opacity:1;transform:translateY(0);}

/* LOGIN */
.lw{min-height:100vh;width:100vw;background:linear-gradient(140deg,#090b14 0%,#131728 60%,#090b14 100%);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
.lblob{position:absolute;border-radius:50%;filter:blur(88px);pointer-events:none;}
.lcard{position:relative;z-index:2;width:100%;max-width:clamp(280px,90vw,438px);background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:clamp(20px,3vw,28px);padding:clamp(28px,6vw,46px) clamp(20px,5vw,42px);backdrop-filter:blur(28px);animation:fadeUp .68s cubic-bezier(.22,1,.36,1) both;}
.linput{width:100%;padding:13px 16px;margin-bottom:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:11px;color:#fff;font-family:'Montserrat',sans-serif;font-size:14px;outline:none;transition:all .24s;}
.linput::placeholder{color:rgba(255,255,255,.3);}
.linput:focus{border-color:var(--a1);box-shadow:0 0 0 3px rgba(99,91,255,.18);background:rgba(99,91,255,.08);}
.lbtn{width:100%;padding:14px;border:none;border-radius:11px;background:linear-gradient(135deg,var(--a1),var(--a2));color:#fff;font-family:'Montserrat',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .24s;display:flex;align-items:center;justify-content:center;gap:8px;}
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
.sb-group{margin:6px 0 2px;}
.sb-group-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 9px;border:1px solid transparent;border-radius:10px;background:transparent;color:rgba(255,255,255,.48);cursor:pointer;transition:all .2s;font-family:'Montserrat',sans-serif;text-align:left;}
.sb-group-btn:hover{background:rgba(255,255,255,.045);color:rgba(255,255,255,.82);}
.sb-group-btn.open{background:rgba(255,255,255,.045);color:#fff;border-color:rgba(255,255,255,.06);}
.sb-group-head{display:flex;align-items:center;gap:10px;min-width:0;}
.sb-group-copy{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:0;}
.sb-group-title{font-size:13px;font-weight:600;line-height:1.15;}
.sb-group-meta{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.24);}
.sb-group-toggle{flex-shrink:0;transition:transform .2s ease;color:rgba(255,255,255,.38);}
.sb-group-btn.open .sb-group-toggle{transform:rotate(180deg);color:#fff;}
.sb-group-body{margin:4px 0 0 11px;padding-left:10px;border-left:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;gap:2px;}
.nv.sub{padding:8px 9px 8px 10px;font-size:12.5px;opacity:.95;}
.sb-stat{margin:0 12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.055);border-radius:12px;padding:12px;}
.ii{padding:8px 9px;border-radius:8px;transition:all .18s;cursor:pointer;margin-bottom:2px;}
.ii:hover{background:rgba(255,255,255,.054);}
.ii.sel{background:rgba(99,91,255,.16);}
.spf{margin:auto 12px 12px;padding:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.055);border-radius:12px;display:flex;align-items:center;gap:8px;cursor:pointer;transition:all .18s;position:relative;}
.spf:hover{background:rgba(255,255,255,.07);}
.av{width:35px;height:35px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Montserrat',sans-serif;font-weight:700;font-size:12px;flex-shrink:0;}
.sdd{position:absolute;bottom:67px;left:0;right:0;background:#171b2e;border:1px solid rgba(255,255,255,.085);border-radius:10px;overflow:hidden;animation:scaleIn .17s ease;z-index:100;}
.sddi{display:flex;align-items:center;gap:9px;padding:10px 13px;color:rgba(255,255,255,.58);font-size:12.5px;cursor:pointer;transition:all .17s;}
.sddi:hover{background:rgba(255,255,255,.06);color:#fff;}
.sb-maintenance{margin:0 12px 12px;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.065);background:linear-gradient(135deg,rgba(99,91,255,.14),rgba(6,201,160,.08));display:flex;align-items:center;justify-content:space-between;gap:12px;color:#fff;cursor:pointer;transition:transform .18s ease,background .18s ease,border-color .18s ease;}
.sb-maintenance:hover{transform:translateY(-1px);border-color:rgba(255,255,255,.14);background:linear-gradient(135deg,rgba(99,91,255,.18),rgba(6,201,160,.12));}
.sb-maintenance-copy{display:flex;flex-direction:column;gap:2px;min-width:0;}
.sb-maintenance-label{font-size:12px;font-weight:700;letter-spacing:.01em;}
.sb-maintenance-hint{font-size:10.5px;color:rgba(255,255,255,.54);text-transform:uppercase;letter-spacing:.1em;}
.sb-maintenance-switch{display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.86);flex-shrink:0;}
.sb-maintenance.on{box-shadow:0 10px 28px rgba(99,91,255,.18);}

/* MAIN */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.tbar{position:sticky;top:0;z-index:9;background:rgba(240,241,247,.88);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.06);padding:12px 26px;display:flex;align-items:center;justify-content:space-between;gap:10px;}
.sbox{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:10px;padding:8px 14px;width:clamp(140px,25vw,252px);transition:all .24s;font-size:clamp(12px,2vw,13px);}
.sbox input{border:none;outline:none;background:transparent;font-family:'Montserrat',sans-serif;font-size:inherit;flex:1;color:var(--t1);}
.sbox:focus-within{border-color:var(--a1);box-shadow:0 0 0 3px rgba(99,91,255,.1);}
.sa{flex:1;overflow-y:auto;overflow-x:hidden;}
.pp{padding:clamp(12px,3vw,26px) clamp(12px,3vw,26px) clamp(24px,4vw,40px);}

/* CARDS */
.mc{background:var(--card);border:1px solid rgba(255,255,255,.88);border-radius:var(--r);padding:21px;backdrop-filter:blur(20px);box-shadow:var(--sh);transition:all .27s;cursor:pointer;position:relative;overflow:hidden;}
.mc:hover{transform:translateY(-4px) scale(1.018);box-shadow:var(--sh2);}
.gc{background:rgba(255,255,255,.72);border:1px solid rgba(255,255,255,.88);border-radius:var(--r);backdrop-filter:blur(20px);box-shadow:var(--sh);transition:box-shadow .27s;overflow:hidden;}
.gc:hover{box-shadow:var(--sh2);}
.ic{background:var(--card);border:1px solid rgba(255,255,255,.88);border-radius:16px;padding:17px;backdrop-filter:blur(20px);box-shadow:0 4px 12px rgba(0,0,0,.06);transition:all .26s;cursor:pointer;}
.ic:hover{transform:translateY(-3px);box-shadow:var(--sh);}

/* BUTTONS */
.bp{background:linear-gradient(135deg,var(--a1),var(--a2));border:none;border-radius:10px;color:#fff;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;padding:9px 17px;cursor:pointer;transition:all .24s;display:inline-flex;align-items:center;gap:7px;}
.bp:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(99,91,255,.38);}
.bp:active{transform:scale(.97);}
.bg{background:transparent;border:1px solid rgba(0,0,0,.1);border-radius:9px;color:var(--t2);font-family:'Montserrat',sans-serif;font-size:12px;font-weight:500;padding:7px 12px;cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;gap:5px;}
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
.fa{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Montserrat',sans-serif;font-weight:700;font-size:12px;flex-shrink:0;}
.fi{width:100%;padding:11px 14px;background:rgba(0,0,0,.03);border:1.5px solid rgba(0,0,0,.09);border-radius:10px;color:var(--t1);font-family:'Montserrat',sans-serif;font-size:13px;outline:none;transition:all .24s;}
.fi:focus{border-color:var(--a1);background:rgba(99,91,255,.04);box-shadow:0 0 0 3px rgba(99,91,255,.1);}
.fl{font-size:11.5px;font-weight:600;color:var(--t2);margin-bottom:4px;display:block;}
textarea.fi{resize:vertical;min-height:80px;}
.mo{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:50;animation:fadeIn .18s ease;padding:clamp(16px,3vw,32px);}
.mb{background:#fff;border-radius:clamp(16px,3vw,22px);padding:clamp(18px,4vw,28px);width:100%;max-width:clamp(300px,85vw,498px);animation:scaleIn .26s cubic-bezier(.22,1,.36,1);max-height:90vh;overflow-y:auto;}
.route-fab{position:fixed;right:22px;bottom:22px;width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--a1),var(--a2));color:#fff;box-shadow:0 8px 30px rgba(99,91,255,.24);cursor:pointer;z-index:120;font-size:18px}
.route-fab:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(99,91,255,.28)}
.route-modal-list{display:flex;flex-direction:column;gap:8px;margin-top:8px}
.ndot{width:7px;height:7px;background:var(--a3);border-radius:50%;position:absolute;top:-2px;right:-2px;animation:dotP 2s ease infinite;}
.hmb{display:none;}

/* ════════════════════════════════
   MOBILE & TABLET BREAKPOINTS
════════════════════════════════ */
@media(max-width:640px){
  /* SIDEBAR: мобиль — скрыто */
  .sb{position:fixed;top:0;left:0;bottom:0;width:75vw;max-width:280px;transform:translateX(-100%);z-index:100;}
  .sb.open{transform:translateX(0);}
  .hmb{display:flex;}
  .tbar{padding:10px 12px;gap:8px;}
  .sbox{width:100%;max-width:140px;font-size:12px;}
  .pp{padding:10px 12px 20px;}
  /* Make tables and rating grids responsive on small screens */
  .pp table {
    min-width: 0 !important;
    width: 100% !important;
    table-layout: auto !important;
  }
  .pp .tableWrap {
    overflow-x: auto;
    border-radius: 12px !important;
    padding: 6px !important;
  }
  .pp .headCell, .pp .rowLabel, .pp .ratingCell {
    padding: 10px 8px !important;
    font-size: 12px !important;
  }
  .pp .fi { padding: 10px 12px !important; }
  .lcard{padding:32px 20px;border-radius:20px;max-width:calc(100vw - 24px);}
  .linput{font-size:13px;padding:11px 14px;}
  .lbtn{padding:12px;font-size:14px;}
  .mb{padding:20px;border-radius:18px;max-width:calc(100vw - 20px);}
  .mo{padding:16px;}
}
@media(min-width:641px) and (max-width:1024px){
  /* TABLET: средний вид */
  .sbox{width:180px;font-size:12px;}
  .pp{padding:18px 16px 32px;}
  .tbar{padding:10px 16px;}
}
@media(max-width:1024px){
  /* до 1024px */
  .sb{position:fixed;top:0;left:0;bottom:0;transform:translateX(-100%);z-index:100;}
  .sb.open{transform:translateX(0);}
  .hmb{display:flex;}
  .da{font-size:11px;padding:7px 12px;gap:5px;}
}

/* ════════════════════════════════
   INTERNSHIP DETAIL PAGE
════════════════════════════════ */
.dp{display:flex;flex-direction:column;height:100%;animation:slideR .42s cubic-bezier(.22,1,.36,1) both;}

/* hero header */
.dh{background:linear-gradient(135deg,#0c0e18 0%,#1a1d30 100%);padding:clamp(16px,3vw,30px) clamp(14px,4vw,30px) clamp(14px,3vw,22px);position:relative;overflow:hidden;flex-shrink:0;}
.dhb{position:absolute;border-radius:50%;filter:blur(72px);pointer-events:none;}

/* breadcrumb back btn */
.bk{display:flex;align-items:center;gap:5px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.13);border-radius:9px;padding:6px 12px;cursor:pointer;color:rgba(255,255,255,.68);font-family:'Montserrat',sans-serif;font-size:clamp(11px,2vw,12px);font-weight:600;transition:all .2s;}
.bk:hover{background:rgba(255,255,255,.16);}

/* action buttons in hero */
.da{display:inline-flex;align-items:center;gap:7px;padding:8px 15px;border-radius:10px;border:none;font-family:'Montserrat',sans-serif;font-size:clamp(11px,2vw,12px);font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap;}
.da:hover{transform:translateY(-1px);}

/* day rail */
.dr{display:flex;gap:6px;overflow-x:auto;padding:clamp(8px,2vw,13px) clamp(12px,3vw,26px);background:#fff;border-bottom:1px solid rgba(0,0,0,.07);flex-shrink:0;scrollbar-width:none;}
.dr::-webkit-scrollbar{display:none;}
.dp-pill{padding:5px 14px;border-radius:999px;font-size:clamp(11px,2vw,12px);font-weight:600;cursor:pointer;transition:all .19s;white-space:nowrap;border:none;font-family:'Montserrat',sans-serif;}
.dp-pill.on{background:linear-gradient(135deg,var(--a1),var(--a2));color:#fff;box-shadow:0 4px 12px rgba(99,91,255,.34);}
.dp-pill:not(.on){background:rgba(0,0,0,.06);color:var(--t2);}
.dp-pill:not(.on):hover{background:rgba(99,91,255,.1);color:var(--a1);}

/* detail body scroll */
.db{flex:1;overflow-y:auto;overflow-x:hidden;padding:clamp(12px,3vw,30px) clamp(12px,3vw,30px) clamp(24px,4vw,48px);scroll-behavior:smooth;}
@media(max-width:640px){
  .db{padding:12px 12px 32px;}
  .dh{padding:14px 12px 12px;}
  .dr{padding:8px 12px;}
  .da{padding:6px 10px;font-size:10px;}
}

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
.cp{position:fixed;top:0;right:0;bottom:0;width:clamp(280px,75vw,388px);background:#fff;box-shadow:-6px 0 38px rgba(0,0,0,.13);z-index:200;display:flex;flex-direction:column;animation:panelIn .33s cubic-bezier(.22,1,.36,1) both;}
@media(max-width:640px){.cp{width:100%;}}
.cph{padding:clamp(12px,2vw,17px) clamp(14px,3vw,19px) clamp(10px,2vw,14px);border-bottom:1px solid rgba(0,0,0,.07);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;font-size:clamp(13px,2vw,15px);}
.cpl{flex:1;overflow-y:auto;padding:4px clamp(12px,3vw,19px);}
.cpf{padding:clamp(10px,2vw,13px) clamp(12px,3vw,17px) clamp(12px,2vw,17px);border-top:1px solid rgba(0,0,0,.07);flex-shrink:0;}
.ci{display:flex;gap:clamp(6px,2vw,10px);padding:clamp(10px,2vw,13px) 0;border-bottom:1px solid rgba(0,0,0,.05);animation:fadeUp .3s ease both;font-size:clamp(12px,2vw,13px);}
.ci:last-child{border-bottom:none;}
.ca{width:clamp(28px,6vw,33px);height:clamp(28px,6vw,33px);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Montserrat',sans-serif;font-weight:700;color:#fff;font-size:clamp(9px,1.8vw,10.5px);flex-shrink:0;}

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
  "Pending": { c: "#b45309", bg: "rgba(245,166,35,.14)", dot: "#f5a623" },
  "In Progress": { c: "#1d4ed8", bg: "rgba(59,130,246,.14)", dot: "#3b82f6" },
  "Completed": { c: "#166534", bg: "rgba(34,197,94,.14)", dot: "#22c55e" },
};

const normalizeStatus = (status) => {
  const raw = String(status || "").trim().toLowerCase();
  if (raw === "completed") return "Completed";
  if (raw === "in progress" || raw === "active") return "In Progress";
  return "Pending";
};

const getUserInitials = (user) => {
  const fullName = [user?.name, user?.surname, user?.lastname]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!fullName) return "U";

  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
};

const ALL_APP_ROLES = ["admin", "tutor", "professor", "rector", "student"];
const MAINTENANCE_STORAGE_KEY = "siut_maintenance_mode";
const NAV_PERMISSIONS = {
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

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

function canAccessNav(role, label) {
  const allowedRoles = NAV_PERMISSIONS[label] || [];
  return allowedRoles.includes(normalizeRole(role));
}

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

const DAY_TEXTS = [];
const PALETTES = [
  ["#635bff", "#06c9a0"],
  ["#ff5fa0", "#635bff"],
  ["#06c9a0", "#f5a623"],
  ["#f5a623", "#ff5fa0"],
  ["#635bff", "#ff5fa0"],
  ["#06c9a0", "#635bff"],
];

// Add the missing CHART data
const CHART = [
  { v: 42, l: "Jan" },
  { v: 58, l: "Feb" },
  { v: 48, l: "Mar" },
  { v: 62, l: "Apr" },
  { v: 55, l: "May" },
  { v: 70, l: "Jun" },
  { v: 65, l: "Jul" },
  { v: 75, l: "Aug" },
  { v: 80, l: "Sep" },
  { v: 72, l: "Oct" },
  { v: 85, l: "Nov" },
  { v: 90, l: "Dec" },
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
            fontFamily: "Montserrat",
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
   INPUT FIELD COMPONENT
═══════════════════════════════════════════════ */
function FormField({ label, type = "text", ta, value, onChange, error }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <label className="fl">{label}</label>
      {ta ? (
        <textarea
          className="fi"
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
        />
      ) : (
        <input
          type={type}
          className="fi"
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
        />
      )}
      {error && (
        <span
          style={{
            fontSize: 11,
            color: "#ef4444",
            marginTop: 3,
            display: "block",
          }}
        >
          {error}
        </span>
      )}
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
      status: "Pending",
      ti: Math.floor(Math.random() * 4),
      students: [],
    });
    onClose();
  };
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
          <div style={{ fontFamily: "Montserrat", fontSize: 17, fontWeight: 800 }}>
            New Internship
          </div>
          <button className="bi" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <FormField
          label="Position Title"
          value={f.title}
          onChange={(val) => setF((p) => ({ ...p, title: val }))}
          error={e.title}
        />
        <FormField
          label="Company Name"
          value={f.company}
          onChange={(val) => setF((p) => ({ ...p, company: val }))}
          error={e.company}
        />
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
        <FormField
          label="Description"
          ta
          value={f.desc}
          onChange={(val) => setF((p) => ({ ...p, desc: val }))}
          error={e.desc}
        />
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

const TUTORS = [
  {
    name: "John Doe",
    av: "JD",
    avB: "linear-gradient(135deg,#635bff,#06c9a0)",
  },
  {
    name: "Jane Doe",
    av: "JD",
    avB: "linear-gradient(135deg,#635bff,#06c9a0)",
  },
]

/* ═══════════════════════════════════════════════
   DETAIL PAGE
═══════════════════════════════════════════════ */
function DetailPage({ intern, onBack }) {
  // Derive days from intern using useMemo - no state needed for the base calculation
  const days = useMemo(
    () => makeDays(intern.start, intern.ti),
    [intern.start, intern.ti]
  );

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

  // Days are memoized, no need to reset day in effect
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
    // open lightbox to show the uploaded image
    setLb(newPhoto);
  };

  // simple named handlers for button clarity
  const openComments = () => setPanel(true);
  const closeComments = () => setPanel(false);
  const toggleApproval = () => setApproved((p) => !p);
  const clearApproval = () => setApproved(false);
  const printReport = () => window.print();
  const prevDay = () => goDay(day - 1);
  const nextDay = () => goDay(day + 1);

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
                fontFamily: "Montserrat",
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
              onClick={openComments}
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
              onClick={toggleApproval}
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
              onClick={printReport}
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
              onClick={openComments}
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
                fontFamily: "Montserrat",
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
            onClick={clearApproval}
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
                    fontFamily: "Montserrat",
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
                onClick={prevDay}
                style={{ opacity: day === 1 ? 0.35 : 1 }}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                className="bi"
                disabled={day === 14}
                onClick={nextDay}
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
                  fontFamily: "Montserrat",
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
                fontFamily: "Montserrat",
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
                  fontFamily: "Montserrat",
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
                  fontFamily: "Montserrat",
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
                cur.short,
                `Day ${cur.day} / 14`,
                intern.company,
                `${intern.company} HQ`,
              ].map((tx, idx) => (
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
                  {tx}
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
                  fontFamily: "Montserrat",
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
                  fontFamily: "Montserrat",
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
            onClick={closeComments}
          />
          <div className="cp">
            <div className="cph">
              <div>
                <div
                  style={{
                    fontFamily: "Montserrat",
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
              <button className="bi" onClick={closeComments}>
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
                fontFamily: "Montserrat",
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
function DashView({ internships, feedbacks, setNav, onOpen, user }) {
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
                fontFamily: "Montserrat",
                fontSize: 19,
                fontWeight: 800,
                marginBottom: 3,
              }}
            >
              Good morning, {user ? user.name : "User"} 👋
            </div>
            <div style={{ fontSize: 13, opacity: 0.82 }}>
              {internships.filter((i) => normalizeStatus(i.status) === "In Progress").length} in progress
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
                  fontFamily: "Montserrat",
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
                  fontFamily: "Montserrat",
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
                  fontFamily: "Montserrat",
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
                fontFamily: "Montserrat",
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
              style={{ animationDelay: `${i * 65}ms`, cursor: "pointer" }}
              onClick={() => setNav("Dashboard")}
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
              fontFamily: "Montserrat",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--t1)",
            }}
          >
            Internships
          </div>
          <span
            className="badge"
            style={{ background: "rgba(245,166,35,.14)", color: "#b45309" }}
          >
            {internships.filter((i) => normalizeStatus(i.status) === "Pending").length} pending
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
            const s = SC[normalizeStatus(intern.status)] || SC["Pending"];
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
                      fontFamily: "Montserrat",
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
function FeedView({ feedbacks, onOpenFeedback }) {
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
    () => roleOptions.filter((role) => role !== "All").map((role) => ({
      role,
      count: feedbacks.filter((item) => item.role === role).length,
    })),
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
                  style={{
                    background: "rgba(255,255,255,.72)",
                    color: "var(--t2)",
                    border: "1px solid rgba(0,0,0,.08)",
                  }}
                >
                  {item.role}: {item.count}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
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
          <div style={{ color: "var(--t3)", fontSize: 13, padding: 8 }}>No comments found.</div>
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
                      color: ROLES[f.role]?.c || "var(--t2)",
                    }}
                  >
                    {f.role}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>
                    {f.company} {f.dayNumber ? `· Day ${f.dayNumber}` : ""}
                  </span>
                </div>
                <div
                  style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.55 }}
                >
                  {f.text}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, minWidth: 76 }}>
                <div
                  style={{ fontSize: 11, color: "var(--t3)", marginTop: 2, fontWeight: 600 }}
                >
                  {f.time}
                </div>
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
              fontFamily: "Montserrat",
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
                fontFamily: "Montserrat",
                fontSize: 19,
                fontWeight: 800,
                color: "#fff",
              }}
            >
              JD
            </div>
            <div>
              <div
                style={{ fontFamily: "Montserrat", fontSize: 14.5, fontWeight: 700 }}
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
              fontFamily: "Montserrat",
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
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {n[k] ? (
                    <Check size={12} color="white" />
                  ) : (
                    <Minus size={10} color="rgba(255,255,255,.6)" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════ */
export default function App() {
  // Move all state declarations here
  const [TUTORS, setTutors] = useState([]);
  const [INTERNSHIPS, setInternships] = useState([]);
  const [FEEDBACKS, setFeedbacks] = useState([]);

  const [page, setPage] = useState("login");
  const [nav, setNav] = useState("Dashboard");
  const [openIntern, setOpenIntern] = useState(null);
  const [user, setUser] = useState(null);
  // Remove redundant internships, feedbacks, tutors states since they're already declared above
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [dd, setDd] = useState(false);
  const [sbOpen, setSbOpen] = useState(false);
  const [sidebarGroupsOpen, setSidebarGroupsOpen] = useState({
    administration: false,
  });
  const [search] = useState("");
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [systemError, setSystemError] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(() => readMaintenanceMode());
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [openCommentTarget, setOpenCommentTarget] = useState(null);
  const [sessionMessage, setSessionMessage] = useState("");
  const userInitials = useMemo(() => user?.initials || getUserInitials(user), [user]);
  const isPrivilegedUser = useMemo(
    () => ["admin", "developer"].includes(normalizeRole(user?.role)),
    [user?.role],
  );
  const maintenanceLocked = maintenanceMode && !isPrivilegedUser;

  const openSystemError = useCallback((status, overrides = {}) => {
    setSystemError({
      status,
      title: overrides.title,
      message: overrides.message,
      details: overrides.details,
      causes: overrides.causes,
    });
    setLoading(false);
    setShowCreatePage(false);
    setOpenIntern(null);
    setRouteModalOpen(false);
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

  // Convenience wrapper functions for state updates
  const handleCloseSidebar = () => setSbOpen(false);

  const handleNavigate = (label) => {
    // Allow NAV_ALWAYS items regardless of role
    const isAlways = Array.isArray(NAV_ALWAYS) && NAV_ALWAYS.some((i) => i.label === label);
    if (!canAccessNav(user?.role, label) && !isAlways) return;
    // If navigation requested is the Create Internship action, open the create page
    if (label === "Create Internship") {
      setShowCreatePage(true);
      setOpenIntern(null);
      setSbOpen(false);
      return;
    }

    setNav(label);
    setOpenIntern(null);
    setShowCreatePage(false);
    setSbOpen(false);
  };

  const handleToggleDd = () => setDd((p) => !p);

  const handleOpenSidebar = () => setSbOpen(true);

  const handleToggleSidebarGroup = useCallback((groupKey) => {
    setSidebarGroupsOpen((current) => ({
      ...current,
      [groupKey]: !current[groupKey],
    }));
  }, []);

  const STATUS_ID = "6a1a906ace7c3808500ab41c";

  const handleToggleMaintenance = useCallback(async () => {
    if (!isPrivilegedUser) return;
    setMaintenanceSaving(true);
    try {
      // send current maintenanceMode as `live` to flip state on the server
      const payload = await patch(`/status/${STATUS_ID}`, { live: maintenanceMode, message: '' });
      const live = !!payload?.live;
      // server.live === true => site is live => maintenanceMode should be false
      setMaintenanceMode(!live);
      writeMaintenanceMode(!live);
      toast.success(!live ? 'Maintenance enabled (global).' : 'Maintenance disabled (global).');
    } catch (err) {
      toast.error(err?.message || 'Failed to update site status.');
    } finally {
      setMaintenanceSaving(false);
    }
  }, [isPrivilegedUser, maintenanceMode]);

  useEffect(() => {
    let mounted = true;
    const STATUS_POLL_ID = "6a1a906ace7c3808500ab41c";
    const fetchStatus = async () => {
      try {
        const payload = await get(`/status/${STATUS_POLL_ID}`);
        if (!mounted) return;
        if (payload && typeof payload.live === 'boolean') {
          const live = !!payload.live;
          setMaintenanceMode(!live);
          writeMaintenanceMode(!live);
        }
      } catch (err) {
        // ignore polling errors
      }
    };

    // initial check
    fetchStatus();
    const iv = setInterval(fetchStatus, 30000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);


  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const hasValidToken = handleStoredTokenExpiry();
        if (!hasValidToken) {
          return;
        }

        try {
          const currentUser = await getCurrentUser();
          const savedUser = getUserFromStorage();
          const resolvedUser = currentUser?.user || currentUser || savedUser || null;
          setUser(resolvedUser);

          const studentData = await get('/student');
          if (studentData) {
            // normalize shapes: API might return array or { data: [...] }
            const studentsArray = Array.isArray(studentData)
              ? studentData
              : Array.isArray(studentData?.data)
                ? studentData.data
                : Array.isArray(studentData?.students)
                  ? studentData.students
                  : [];
            setStudents(studentsArray);
          }

          const canReadUsers = String(resolvedUser?.role || '').trim().toLowerCase() === 'admin';
          if (canReadUsers) {
            const tutorData = await get('/usersInternship');
            if (tutorData) {
              const tutorList = Array.isArray(tutorData)
                ? tutorData
                : Array.isArray(tutorData?.data)
                  ? tutorData.data
                  : Array.isArray(tutorData?.users)
                    ? tutorData.users
                    : [];

              const normalizedTutors = tutorList
                .map((member) => ({
                  _id: member?._id || member?.id || member?.userId || '',
                  name: member?.name || '',
                  surname: member?.surname || '',
                  lastname: member?.lastname || '',
                  role: member?.role || '',
                  login: member?.login || member?.email || '',
                  phone: member?.phone || '',
                }))
                .filter((member) => {
                  const role = String(member.role || '').trim().toLowerCase();
                  return role === 'tutor' || role === 'professor';
                });

              setTutors(normalizedTutors);
            }
          } else {
            setTutors([]);
          }

          const data = await get('/faculty');
          if (data) {
            const transformedInternships = data.map((intern) => ({
              id: intern._id,
              title: intern.name,
              company: intern.company,
              location: intern.location || '',
              locationYmaps: Array.isArray(intern.locationYmaps) ? intern.locationYmaps : intern.locationYmaps || null,
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
            }));
            setInternships(transformedInternships);
          }

          setPage("dashboard");
        } catch (error) {
          if (error?.status === 401) {
            setSessionMessage('Session expired. Please login again.');
            setUser(null);
            setPage('login');
          } else if ([404, 500, 502, 503, 504].includes(error?.status) || error?.status >= 500) {
            openSystemError(error?.status || 500, {
              title: error?.status === 404 ? 'Requested resource was not found' : undefined,
              message: error?.message,
              details: error?.status ? `HTTP ${error.status}` : 'Unexpected server response',
            });
          } else {
            console.error('Session restore error:', error);
          }
        }

        // For now, using mock feedback data since it's not in the API
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

        // Tutor list is loaded from /usersInternship above.
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [openSystemError]);

  useEffect(() => onAuthSessionExpired(() => {
    setSessionMessage('Session expired. Please login again.');
    setUser(null);
    setPage('login');
  }), []);

  useEffect(() => {
    writeMaintenanceMode(maintenanceMode);
  }, [maintenanceMode]);

  // Fuzzy search algorithm for internships by name (marketplace style)
  useEffect(() => {
    // Search effect removed - searchResults not used in rendering
  }, [search, INTERNSHIPS]);

  const addIntern = (i) => {
    setInternships((prev) => [i, ...prev]);
  };



  // These convenience wrappers are now defined in the state declarations section

  const navItems = [
    { I: LayoutDashboard, label: "Dashboard" },
    { I: Users, label: "Students" },
    { I: MessageSquare, label: "Feedback" },
    { I: BookOpen, label: "User Education" },
    { I: FileText, label: "Supervisor Report" },
    { I: Award, label: "Student Self-Evaluation" },
  ].filter((item) => canAccessNav(user?.role, item.label));

  const NAV_ALWAYS = useMemo(() => [], []);

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
        items: group.items.filter(
          (item) => canAccessNav(user?.role, item.label) || NAV_ALWAYS.some((navItem) => navItem.label === item.label),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [NAV_ALWAYS, user?.role]);

  const fallbackNav = navItems[0]?.label || "Dashboard";

  useEffect(() => {
    if (openIntern) return;
    const isAlwaysRoute = NAV_ALWAYS.some((item) => item.label === nav);
    if (canAccessNav(user?.role, nav) || isAlwaysRoute) return;
    setNav(fallbackNav);
  }, [fallbackNav, nav, openIntern, user?.role, NAV_ALWAYS]);

  useEffect(() => {
    if (!showCreatePage) return;
    // allow opening create page only for roles allowed by NAV_PERMISSIONS
    if (canAccessNav(user?.role, "Create Internship")) return;
    setShowCreatePage(false);
  }, [showCreatePage, user?.role]);

  const handleStudentUpdated = useCallback((updatedStudent) => {
    if (!updatedStudent) return;

    const updatedId = updatedStudent._id || updatedStudent.id || updatedStudent.studentId;
    setStudents((current) => current.map((student, index) => {
      const currentId = student._id || student.id || student.studentId || `${student?.name || 'student'}-${index}`;
      return currentId === updatedId ? { ...student, ...updatedStudent } : student;
    }));
  }, []);

  const currentUserRole = normalizeRole(user?.role);

  const getOwnershipTokens = useCallback((value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value.flatMap((item) => getOwnershipTokens(item));
    }

    if (typeof value === 'object') {
      return [
        value._id,
        value.id,
        value.userId,
        value.login,
        value.username,
        value.email,
        value.name,
        value.surname,
        value.lastname,
        [value.name, value.surname, value.lastname].filter(Boolean).join(' '),
      ]
        .map((token) => String(token || '').trim().toLowerCase())
        .filter(Boolean);
    }

    return [String(value).trim().toLowerCase()].filter(Boolean);
  }, []);

  const isProfessorAssignedToInternship = useCallback((intern) => {
    if (!intern) return true;
    if (currentUserRole !== 'professor' && currentUserRole !== 'tutor') return true;

    const currentUserTokens = getOwnershipTokens([
      user?.id,
      user?._id,
      user?.userId,
      user?.login,
      user?.username,
      user?.email,
      user?.name,
      user?.surname,
      user?.lastname,
      [user?.name, user?.surname, user?.lastname].filter(Boolean).join(' '),
    ]);

    const internshipTokens = getOwnershipTokens([
      intern?.tutorID,
      intern?.tutor,
      intern?.supervisor,
    ]);

    return internshipTokens.some((token) => currentUserTokens.includes(token));
  }, [currentUserRole, getOwnershipTokens, user]);

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
      const diffD = Math.floor(diffH / 24);
      return `${diffD}d ago`;
    };

    const buildCommentKey = (comment, idx) => {
      if (!comment) return `idx-${idx}`;
      return String(comment._id || `${comment.date || ""}-${comment.text || ""}-${idx}`);
    };

    const rows = [];
    INTERNSHIPS.forEach((intern) => {
      if (!isProfessorAssignedToInternship(intern)) return;

      const days = Array.isArray(intern.days) ? intern.days : [];
      days.forEach((day, dayIndex) => {
        const comments = Array.isArray(day?.comments) ? day.comments : [];
        comments.forEach((comment, commentIndex) => {
          const userObj = typeof comment?.userID === "object" && comment?.userID ? comment.userID : null;
          const name = userObj
            ? [userObj.name, userObj.surname].filter(Boolean).join(" ") || userObj.name
            : "Unknown User";
          const role = userObj?.role || "Intern";
          const initials = name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "US";

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

  const handleOpenCommentFromFeedback = useCallback((feedbackItem) => {
    if (!feedbackItem?.internshipId) return;
    setOpenCommentTarget({
      internshipId: feedbackItem.internshipId,
      dayIndex: feedbackItem.dayIndex,
      commentKey: feedbackItem.commentKey,
    });
    setOpenIntern(feedbackItem.internshipId);
    setNav("Dashboard");
  }, []);

  const pageTransitionKey = useMemo(() => {
    if (loading) return "loading";
    if (systemError) return `error-${systemError.status || 'unknown'}`;
    if (showCreatePage) return "create-page";
    if (openIntern) return `internship-${openIntern}`;
    return `nav-${nav}`;
  }, [loading, nav, openIntern, showCreatePage, systemError]);

  const contentNode = useMemo(() => {
    if (systemError) {
      return (
        <ErrorPage
          status={systemError.status || 500}
          title={systemError.title}
          message={systemError.message}
          details={systemError.details}
          causes={systemError.causes}
          onPrimaryAction={retryFromError}
          onSecondaryAction={() => setPage(user ? 'dashboard' : 'login')}
          primaryActionLabel="Retry"
          secondaryActionLabel={user ? 'Open dashboard' : 'Go to login'}
        />
      );
    }

    if (loading) {
      return (
        <div className="pp">
          <PageState variant="loading" title="Loading workspace" message="Fetching internships, students, and your session..." />
        </div>
      );
    }

    if (showCreatePage) {
      if (!canAccessNav(user?.role, "Create Internship")) {
        return (
          <div className="pp">
            <PageState
              variant="forbidden"
              title="You cannot create internships"
              message="Your role does not have permission to open this page."
            />
          </div>
        );
      }

      return (
        <CreatePage
          students={students}
          tutors={TUTORS}
          user={user}
          onSubmit={(newFaculty) => {
            const transformedFaculty = {
              id: newFaculty._id,
              title: newFaculty.name,
              company: newFaculty.company,
              location: newFaculty.location || '',
              locationYmaps: Array.isArray(newFaculty.locationYmaps) ? newFaculty.locationYmaps : newFaculty.locationYmaps || null,
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

            setInternships((prev) => [transformedFaculty, ...prev]);
            setShowCreatePage(false);
            setNav("Dashboard");
          }}
          onCancel={() => setShowCreatePage(false)}
        />
      );
    }

    if (openIntern) {
      return (
        <InternshipPage
          facultyId={openIntern}
          onBack={() => {
            setOpenIntern(null);
            setOpenCommentTarget(null);
          }}
          user={user}
          initialDayIndex={
            openCommentTarget?.internshipId === openIntern ? openCommentTarget.dayIndex : undefined
          }
          focusCommentKey={
            openCommentTarget?.internshipId === openIntern ? openCommentTarget.commentKey : undefined
          }
          students={students}
        />
      );
    }

    if (nav === "Dashboard") {
      return (
        <Dashboard
          onNewFaculty={() => setShowCreatePage(true)}
          onView={(id) => setOpenIntern(id)}
          user={user}
          students={students}
          search={search}
        />
      );
    }

    if (nav === "Students") {
      if (!canAccessNav(user?.role, "Students")) {
        return (
          <div className="pp">
            <PageState variant="forbidden" title="Students page is restricted" message="Only permitted roles can access student documents." />
          </div>
        );
      }

      return (
        <StudentDocumentsPage
          students={students}
          search={search}
          onStudentUpdated={handleStudentUpdated}
        />
      );
    }

    if (nav === "Create Tutors") {
      if (!canAccessNav(user?.role, "Create Tutors")) {
        return (
          <div className="pp">
            <PageState variant="forbidden" title="Admin access required" message="Only administrators can manage staff accounts." />
          </div>
        );
      }

      return <CreateTutorPage />;
    }

    if (nav === "All Internships") {
      if (!canAccessNav(user?.role, "All Internships")) {
        return (
          <div className="pp">
            <PageState variant="forbidden" title="Access denied" message="Only admins and rectors can access all internships." />
          </div>
        );
      }

      return (
        <AllInternships
          onView={(id) => setOpenIntern(id)}
          user={user}
          search={search}
        />
      );
    }

    if (nav === "Feedback") {
      if (!canAccessNav(user?.role, "Feedback")) {
        return (
          <div className="pp">
            <PageState variant="forbidden" title="Feedback page is restricted" message="Your role cannot access centralized feedback." />
          </div>
        );
      }

      return <FeedView feedbacks={commentFeedbacks} onOpenFeedback={handleOpenCommentFromFeedback} />;
    }

    if (nav === "User Education") {
      return <UserEducationPage user={user} />;
    }

    if (nav === "Supervisor Report") {
      return <SupervisorEvaluationFormPage />;
    }

    if (nav === "Student Self-Evaluation") {
      return <StudentEvaluationFormPage />;
    }

    if (nav === "Supervisor Reports (Admin)") {
      if (!canAccessNav(user?.role, "Supervisor Reports (Admin)")) {
        return (
          <div className="pp">
            <PageState variant="forbidden" title="Admin access required" message="Only administrators can view all supervisor reports." />
          </div>
        );
      }
      return <AdminSupervisorReportsPage />;
    }

    if (nav === "Student Evaluations (Admin)") {
      if (!canAccessNav(user?.role, "Student Evaluations (Admin)")) {
        return (
          <div className="pp">
            <PageState variant="forbidden" title="Admin access required" message="Only administrators can view all student evaluations." />
          </div>
        );
      }
      return <AdminStudentEvaluationsPage />;
    }

    if (nav === "Statistics (Admin)") {
      if (!canAccessNav(user?.role, "Statistics (Admin)")) {
        return (
          <div className="pp">
            <PageState variant="forbidden" title="Admin access required" message="Only administrators can view statistics." />
          </div>
        );
      }
      return (
        <AdminStatisticsPage
          onNavigate={(facultyId, dayIndex) => {
            setOpenCommentTarget({ internshipId: facultyId, dayIndex });
            setOpenIntern(facultyId);
          }}
        />
      );
    }

    if (nav === "Settings") {
      if (!canAccessNav(user?.role, "Settings")) {
        return (
          <div className="pp">
            <PageState variant="forbidden" title="Settings are restricted" message="Your role cannot access this section." />
          </div>
        );
      }
      return <SetView />;
    }

    return (
      <div className="pp">
        <ErrorPage
          status={404}
          message="This section is unavailable for your account or does not exist in the current workspace."
          onPrimaryAction={() => setNav(fallbackNav)}
          onSecondaryAction={() => setPage(user ? 'dashboard' : 'login')}
          primaryActionLabel="Go to dashboard"
          secondaryActionLabel={user ? 'Back to login' : 'Open login'}
        />
      </div>
    );
  }, [
    systemError,
    loading,
    showCreatePage,
    students,
    openIntern,
    user,
    openCommentTarget,
    nav,
    search,
    handleStudentUpdated,
    commentFeedbacks,
    handleOpenCommentFromFeedback,
    TUTORS,
    retryFromError,
    fallbackNav,
    
  ]);

  if (maintenanceLocked) {
    return (
      <>
        <style>{CSS}</style>
        <MaintenancePage />
        <ToastViewport />
      </>
    );
  }

  if (page === "error")
    return (
      <>
        <style>{CSS}</style>
        {contentNode}
        <ToastViewport />
      </>
    );

  if (page === "public-form")
    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Montserrat',sans-serif" }}>
          <div style={{
            background: '#0c0e18', padding: '13px 24px',
            display: 'flex', alignItems: 'center', gap: 14,
            borderBottom: '1px solid rgba(255,255,255,.07)',
          }}>
            <button
              type="button"
              onClick={() => setPage('login')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
                borderRadius: 9, padding: '7px 13px',
                color: 'rgba(255,255,255,.7)', fontFamily: 'Montserrat', fontSize: 12, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ← Back to Login
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#635bff,#06c9a0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={16} color="#fff" />
              </div>
              <span style={{ color: '#fff', fontFamily: 'Montserrat', fontSize: 14, fontWeight: 700, letterSpacing: '-.2px' }}>
                SIUT · Individual Student Internship Evaluation Form
              </span>
            </div>
          </div>
          <StudentEvaluationFormPage publicMode />
        </div>
        <ToastViewport />
      </>
    );

  if (page === "login")
    return (
      <>
        <style>{CSS}</style>
        <LoginPage
          onLogin={() => {
            setSessionMessage('');
            setPage("dashboard");
          }}
          onUserSet={setUser}
          onPublicForm={() => setPage('public-form')}
          sessionMessage={sessionMessage}
        />
        <ToastViewport />
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
          }}
          onClick={handleCloseSidebar}
        ></div>
      )}
      <div className="shell">
        <div className={`sb ${sbOpen ? 'open' : ''}`}>
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
                className={`nv ${nav === item.label ? "on" : ""}`}
                onClick={() => handleNavigate(item.label)}
              >
                <item.I size={16} color={nav === item.label ? "var(--a1)" : "rgba(255,255,255,.4)"} />
                <span style={{ color: nav === item.label ? "#fff" : "rgba(255,255,255,.4)" }}>{item.label}</span>
              </div>
            ))}

            {sidebarGroups.map((group) => {
              const isOpen = sidebarGroupsOpen[group.key] || group.items.some((item) => nav === item.label);

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
                          className={`nv sub ${nav === item.label ? "on" : ""}`}
                          onClick={() => handleNavigate(item.label)}
                        >
                          <item.I size={15} color={nav === item.label ? "var(--a1)" : "rgba(255,255,255,.42)"} />
                          <span style={{ color: nav === item.label ? "#fff" : "rgba(255,255,255,.44)" }}>{item.label}</span>
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
                title={maintenanceMode ? "Disable site maintenance mode" : "Enable site maintenance mode"}
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
                    <span style={{ display: 'inline-block', width: 26, textAlign: 'center' }}>…</span>
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
            onMouseEnter={e => e.currentTarget.style.background = "rgba(99,91,255,.22)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(99,91,255,.12)"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#635bff">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.67l-2.967-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.834.889z"/>
            </svg>
            <span style={{ color: "rgba(255,255,255,.75)", fontSize: 13, fontWeight: 500 }}>Help | Support</span>
          </a>
          <div className="spf" onClick={handleToggleDd}>
            <div className="av" style={{ background: user?.avatarBg || "linear-gradient(135deg,#635bff,#06c9a0)" }}>
              {userInitials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
                {user?.name || "User"}
              </div>
              <div style={{ color: "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 500 }}>
                {user?.role || "Role"}
              </div>
            </div>
            {dd && (
              <div className="sdd">
                <div className="sddi" onClick={() => {
                  setPage("login");
                  setUser(null);
                  clearUserFromStorage();
                }}>
                  <LogOut size={14} />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="main">
          <div className="tbar">
            <div className="av" style={{ background: "linear-gradient(135deg,#635bff,#06c9a0)" }}>
                {userInitials}
              </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="hmb bi" onClick={handleOpenSidebar}>
                <Menu size={16} />
              </button>

            </div>
          </div>
          
          <div className="sa">
            <div className="page-stage">
              <div key={pageTransitionKey} className="page-transition">
                {contentNode}
              </div>
            </div>
          </div>
        </div>
      </div>
      {user && String(user.role || '').toLowerCase() === 'admin' && (
        <>
          <div className="route-fab" onClick={() => setRouteModalOpen((p) => !p)} title="Quick routes">⤴</div>

          {routeModalOpen && (
            <div className="mo" onClick={() => setRouteModalOpen(false)}>
              <div className="mb" onClick={(e) => e.stopPropagation()} style={{ width: 360, maxWidth: 'calc(100vw - 32px)' }}>
                <h3 style={{ margin: 0, marginBottom: 8 }}>Quick Routes</h3>
                <p style={{ marginTop: 0, marginBottom: 12, color: 'var(--t2)' }}>Jump to any main page</p>
                            <div className="route-modal-list">
                              {[...navItems, ...NAV_ALWAYS].map((item) => (
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

