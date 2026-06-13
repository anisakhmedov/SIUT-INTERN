import{c as ae,r as f,g as oe,t as J,j as e,P as Q,u as G,d as ke,U as Se,M as ze,T as Ce,v as Me}from"./index-B9wUb5OY.js";import{h as he}from"./reportUtils-Cg4yPpzq.js";import{R as F}from"./Reveal-BJlAgjwV.js";import{U as Ie}from"./user-DEKpyUTW.js";import{C as De}from"./calendar-Dqt64F1I.js";import{C as Ae}from"./clock-Do7JXgpF.js";import{P as Le}from"./phone-BY8hJTe0.js";import{a as le,C as $e}from"./chevron-right-DhxuUGmZ.js";import{u as Pe}from"./useSEO-IGeWuCVr.js";const Te=[["path",{d:"M5 21v-6",key:"1hz6c0"}],["path",{d:"M12 21V3",key:"1lcnhd"}],["path",{d:"M19 21V9",key:"unv183"}]],Fe=ae("chart-no-axes-column",Te);const We=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],Re=ae("map-pin",We);const Be=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",key:"r04s7s"}]],Ee=ae("star",Be),ee=a=>Math.max(0,Math.min(100,Number.isFinite(a)?a:0)),Ue=a=>{const t=Array.isArray(a)?a:[];if(t.length===0)return null;const l=t.filter(d=>he(d)).length;return ee(Math.round(l/t.length*100))},_e=a=>{if(typeof a=="number"&&Number.isFinite(a))return ee(Math.round(a));if(typeof a=="string"){const t=Number.parseFloat(a.replace("%","").trim());if(Number.isFinite(t))return ee(Math.round(t))}return null},de=a=>{const t=a?.duration;if(t&&typeof t=="object")return{start:t.start||t.startDate||a?.startDate||"",end:t.end||t.endDate||a?.endDate||"",durationText:""};const l=typeof t=="string"?t.trim():"";if(a?.startDate||a?.endDate)return{start:a?.startDate||"",end:a?.endDate||"",durationText:l};if(l){const d=l.match(/\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\.\d{1,2}\.\d{4}\b/g);if(d&&d.length>=2)return{start:d[0],end:d[1],durationText:l}}return{start:"",end:"",durationText:l}},re=a=>{if(!a)return null;if(a instanceof Date)return Number.isNaN(a.getTime())?null:a;if(typeof a=="number"){const x=new Date(a);return Number.isNaN(x.getTime())?null:x}const t=String(a).trim();if(!t)return null;const l=t.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(l){const[,x,m,y]=l,w=new Date(Number(x),Number(m)-1,Number(y));return Number.isNaN(w.getTime())?null:w}const d=t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);if(d){const[,x,m,y]=d,w=new Date(Number(y),Number(m)-1,Number(x));return Number.isNaN(w.getTime())?null:w}const g=new Date(t);return Number.isNaN(g.getTime())?null:g},ce=a=>{const t=re(a);if(!t)return"";const l=String(t.getDate()).padStart(2,"0"),d=String(t.getMonth()+1).padStart(2,"0"),g=t.getFullYear();return`${l}.${d}.${g}`};function Ve({onNewFaculty:a,onView:t,search:l="",user:d=null}){const[g,x]=f.useState([]),[m,y]=f.useState({}),[w,j]=f.useState(!0),[N,u]=f.useState(""),[M,P]=f.useState("all"),z=6,[I,E]=f.useState({inProgress:1,completed:1,notStarted:1}),U=()=>E({inProgress:1,completed:1,notStarted:1}),W=r=>r?._id??r?.id??null,T=r=>String(r||"").trim().toLowerCase(),i=r=>Array.isArray(r)?r.flatMap(i):r?[r]:[],b=r=>{if(!r)return[];if(typeof r=="string"){const s=r.trim();return s?[s]:[]}return[r._id,r.id,r.userId,r.login,r.email].filter(Boolean)},S=r=>{if(!r)return"";if(typeof r=="string"){const n=m[r];if(n){const o=[n.name,n.surname,n.lastname].filter(Boolean).join(" ").trim();if(o)return o;if(n.login)return n.login}return r.trim()}const s=[r.name,r.surname,r.lastname].filter(Boolean).join(" ").trim();return s||(r.login?r.login:r.email?r.email:r._id?String(r._id):r.id?String(r.id):"")},D=r=>{const s=[],n=new Set;return[r?.tutorIDs,r?.tutors,r?.tutorID,r?.tutor,r?.supervisor].flatMap(i).forEach(o=>{const c=T(typeof o=="string"?o:o?._id||o?.id||o?.userId||o?.login||o?.email);!c||n.has(c)||(n.add(c),s.push(o))}),s},L=r=>{const s=new Set;return D(r).forEach(n=>{b(n).forEach(o=>{const c=T(o);c&&s.add(c)})}),Array.from(s)},C=r=>{const s=[],n=new Set;return D(r).forEach(o=>{const c=S(o).trim(),p=T(c);!c||n.has(p)||(n.add(p),s.push(c))}),s},_=r=>{const s=C(r);if(s.length>0)return s.join(", ");const n=[r?.tutorName,r?.supervisorName].filter(Boolean).join(" ").trim();return n||"Not assigned"},Z=r=>{const s=D(r)[0];return s&&typeof s=="object"?s:typeof s=="string"&&s.trim()&&m[s]||null},V=r=>{const s=Z(r);return s?s.phone||s.email||s.login||"N/A":r?.tutorContact||r?.supervisorContact||"N/A"},Y=r=>{const n=C(r)[0]||_(r);return!n||n==="Not assigned"?"U":n.split(" ").filter(Boolean).slice(0,2).map(o=>o[0]?.toUpperCase()).join("")||"U"},A=r=>{const{start:s,end:n,durationText:o}=de(r),c=ce(s),p=ce(n);return c&&p?`${c} - ${p}`:c||p?c||p:o||"N/A"},be=r=>{const{start:s,end:n,durationText:o}=de(r),c=re(s),p=re(n);if(!c||!p)return o||"N/A";const k=p.getTime()-c.getTime(),v=Math.max(0,Math.ceil(k/(1e3*60*60*24))+1);return`${v} day${v===1?"":"s"}`},se=r=>{const s=r?.locationYmaps,n=Array.isArray(s)?s:Array.isArray(s?.coords)?s.coords:null;if(Array.isArray(n)&&n.length===2){const c=Number(n[0]),p=Number(n[1]);if(!Number.isNaN(c)&&!Number.isNaN(p))return`https://yandex.com/maps/?pt=${p},${c}&z=15&l=map`}const o=(r?.location||"").trim();return o?`https://yandex.com/maps/?text=${encodeURIComponent(o)}`:null},R=r=>{const s=Ue(r?.days);if(s!=null)return s;const n=_e(r?.progressAll);return n??0},ne=N||l,O=g.filter((r,s)=>{if(String(d?.role||"").trim().toLowerCase()==="tutor"){const o=[d?._id,d?.id,d?.userId,d?.login,d?.email].map(p=>T(p)).filter(Boolean),c=L(r);if(s===0&&console.log("[Dashboard] Tutor filter debug:",{userIds:o,facultyTutorIds:c,hasMatch:o.some(p=>c.includes(p)),tutors:D(r)}),!o.some(p=>c.includes(p)))return!1}if(ne){const o=ne.toLowerCase();if(!(r.name?.toLowerCase().includes(o)||r.company?.toLowerCase().includes(o)||r.location?.toLowerCase().includes(o)||r.plan?.toLowerCase().includes(o)))return!1}if(M!=="all"){const o=R(r);if(M==="not-started"&&o!==0||M==="in-progress"&&(o<1||o>99)||M==="completed"&&o!==100)return!1}return!0}),we=O.filter(r=>R(r)===0),ve=O.filter(r=>{const s=R(r);return s>=1&&s<=99}),ye=O.filter(r=>R(r)===100),ie=f.useCallback(async()=>{try{j(!0);const r=String(d?.role||"").toLowerCase()==="admin",[s,n]=await Promise.allSettled([oe("/faculty"),r?oe("/usersInternship"):Promise.resolve([])]);if(s.status==="fulfilled")x(Array.isArray(s.value)?s.value:[]);else throw s.reason;if(n.status==="fulfilled"){const o=n.value,p=(Array.isArray(o)?o:o?.data||[]).reduce((k,v)=>{const $=String(v?._id??v?.id??"");return $&&(k[$]=v),k},{});y(p)}else y({})}catch(r){J.error(r?.message||"Failed to load internships."),console.error("Error fetching faculties:",r)}finally{j(!1)}},[d?.role]);f.useEffect(()=>{ie()},[ie]);const je=async r=>{if(window.confirm("Are you sure you want to delete this internship?"))try{await ke(`/faculty/${r}`),x(s=>s.filter(n=>String(W(n))!==String(r))),J.success("Internship deleted.")}catch(s){J.error("Failed to delete internship."),console.error("Delete error:",s)}},Ne=(r,s)=>{const n=W(r)??`row-${s}`,o=R(r),c=Math.round(o/100*120),p=G(r.status),k=C(r),v=k.length>1,$=v?`${k.length} tutors appended`:_(r),q=p==="Pending"?"dw-card-badge--pending":p==="In Progress"?"dw-card-badge--progress":"dw-card-badge--completed";return e.jsx("li",{children:e.jsxs("article",{className:"dw-card",children:[e.jsx("div",{role:"button",tabIndex:0,className:"dw-card-click",onClick:()=>{n&&t(n)},onKeyDown:h=>{(h.key==="Enter"||h.key===" ")&&(h.preventDefault(),n&&t(n))},children:e.jsxs("div",{className:"dw-card-body",children:[e.jsx("h3",{className:"dw-card-title",children:r.name}),p&&e.jsx("span",{className:`dw-card-badge ${q}`,children:p}),e.jsxs("div",{className:"dw-card-meta",children:[e.jsx("span",{children:r.company||"No company"}),p&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"dw-card-meta-divider"}),e.jsx("span",{children:p})]})]}),e.jsxs("div",{className:"dw-card-row",children:["Who:",v?e.jsx("strong",{style:{display:"block",marginTop:"4px"},children:$}):e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginTop:"4px"},children:[e.jsx("div",{style:{width:28,height:28,borderRadius:6,background:"linear-gradient(135deg,#635bff,#06c9a0)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne",fontWeight:700,color:"#fff",fontSize:11,flexShrink:0},children:Y(r)}),e.jsx("strong",{children:$})]})]}),e.jsxs("div",{className:"dw-card-row",children:["Where:",se(r)&&e.jsx("a",{href:se(r),target:"_blank",rel:"noreferrer",className:"dw-map-link",onClick:h=>h.stopPropagation(),children:"Link"})]}),e.jsxs("div",{className:"dw-card-row",children:[e.jsx("span",{children:"When:"})," ",e.jsx("strong",{children:A(r)})]}),e.jsxs("div",{className:"dw-card-row",children:[e.jsx("span",{children:"How long:"})," ",e.jsx("strong",{children:be(r)})]}),e.jsxs("div",{className:"dw-card-row",children:["Contact: ",e.jsx("strong",{children:V(r)})]}),e.jsxs("div",{className:"dw-progress","aria-label":`Progress ${o}%`,children:[e.jsxs("div",{className:"dw-progress-top",children:[e.jsx("span",{className:"dw-progress-label",children:"Progress:"}),e.jsxs("span",{className:"dw-progress-value",style:{color:`hsl(${c} 76% 30%)`,borderColor:`hsla(${c}, 75%, 45%, .35)`,background:`linear-gradient(135deg, hsla(${Math.max(0,c-25)}, 95%, 92%, .95), hsla(${Math.min(120,c+20)}, 95%, 88%, .95))`},children:[o,"%"]})]}),e.jsx("div",{className:"dw-progress-track",children:e.jsx("div",{className:"dw-progress-fill",style:{width:`${o}%`,background:`linear-gradient(90deg, hsl(${Math.max(0,c-24)} 82% 56%), hsl(${Math.min(120,c+12)} 80% 44%))`}})})]})]})}),e.jsxs("div",{className:"dw-card-footer",children:[e.jsx("button",{type:"button",className:"dw-card-open",onClick:()=>{n&&t(n)},children:"View Details"}),["admin","developer"].includes(String(d?.role||"").toLowerCase())&&e.jsx("button",{type:"button",className:"dw-btn-icon",onClick:h=>{h.preventDefault(),h.stopPropagation(),n&&je(n)},title:"Delete internship","aria-label":"Delete internship",children:"×"})]})]})},n)},K=(r,s,n,o,c)=>{if(s.length===0)return null;const p=I[c]||1,k=Math.max(1,Math.ceil(s.length/z)),v=Math.min(p,k),$=s.slice((v-1)*z,v*z),q=h=>E(H=>({...H,[c]:typeof h=="function"?h(H[c]||1):h}));return e.jsxs("section",{className:"dw-section",children:[e.jsxs("div",{className:"dw-section-header",style:{"--sec-color":n},children:[e.jsx("div",{className:"dw-section-icon-wrap",style:{background:`${n}18`},children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{d:o,fill:n})})}),e.jsx("span",{className:"dw-section-title",children:r}),e.jsx("span",{className:"dw-section-badge",style:{background:`${n}18`,color:n},children:s.length})]}),e.jsx("ul",{className:"dw-list","aria-label":`${r} internships`,children:$.map((h,H)=>Ne(h,H))}),k>1&&e.jsxs("div",{className:"dw-sec-pag",children:[e.jsx("button",{className:"dw-sec-pag-btn",onClick:()=>q(h=>Math.max(1,h-1)),disabled:v===1,children:"← Prev"}),e.jsxs("span",{className:"dw-sec-pag-info",children:[v," / ",k]}),e.jsx("button",{className:"dw-sec-pag-btn",onClick:()=>q(h=>Math.min(k,h+1)),disabled:v===k,children:"Next →"})]})]},r)};return e.jsxs("div",{className:"dw-page",children:[e.jsx("style",{children:`
        .dw-page {
          min-height: calc(100vh - 64px);
          padding: clamp(20px, 4vw, 48px);
          background:
            radial-gradient(1400px 700px at 5% -10%, rgba(99,91,255,.12), transparent 55%),
            radial-gradient(1000px 600px at 95% 5%, rgba(6,201,160,.12), transparent 65%),
            radial-gradient(800px 500px at 50% 100%, rgba(99,91,255,.08), transparent 70%),
            linear-gradient(180deg, rgba(240,241,247,.8), rgba(255,255,255,1));
          position: relative;
          overflow: hidden;
        }
        .dw-shell {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }
        .dw-head {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          justify-content: space-between;
          gap: clamp(12px,3vw,24px);
          margin-bottom: clamp(20px,4vw,32px);
          padding-bottom: clamp(16px,3vw,24px);
          border-bottom: 1px solid rgba(0,0,0,.06);
        }
        .dw-head-group { flex: 1; min-width: 0; }
        .dw-eyebrow {
          font-size: clamp(11px,1.8vw,12px);
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--a1, #635bff);
          margin: 0 0 clamp(4px,1vw,8px) 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dw-eyebrow::before {
          content: '';
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
          border-radius: 50%;
        }
        .dw-title {
          font-family: 'Syne', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          font-size: clamp(24px, 5vw, 42px);
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--t1, #0c0e18);
          margin: 0;
          font-weight: 700;
        }
        .dw-sub {
          margin-top: clamp(4px,1vw,6px);
          color: var(--t2, #5a6278);
          font-size: clamp(13px,2vw,15px);
          font-weight: 400;
        }
        .dw-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: clamp(10px,2vw,13px) clamp(16px,4vw,26px);
          border-radius: 13px;
          border: 1px solid rgba(99,91,255,.2);
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
          color: #fff;
          font-family: 'Syne', system-ui, sans-serif;
          font-size: clamp(13px,2vw,14px);
          font-weight: 700;
          cursor: pointer;
          transition: all .25s cubic-bezier(.22,1,.36,1);
          box-shadow: 0 12px 36px rgba(99,91,255,.28);
          position: relative;
          white-space: nowrap;
        }
        .dw-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 48px rgba(99,91,255,.35);
        }
        .dw-btn-primary:active { transform: translateY(0); }

        /* ── FILTER BAR ── */
        .dw-filters {
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 18px;
          padding: clamp(14px,2.5vw,20px) clamp(16px,3vw,24px);
          margin-bottom: clamp(20px,4vw,32px);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(99,91,255,.06);
        }
        .dw-filter-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .dw-search-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,.9);
          border: 1.5px solid rgba(0,0,0,.1);
          border-radius: 11px;
          padding: 8px 14px;
          flex: 1;
          min-width: 0;
          max-width: 280px;
          transition: border-color .2s, box-shadow .2s;
        }
        .dw-search-wrap:focus-within {
          border-color: var(--a1, #635bff);
          box-shadow: 0 0 0 3px rgba(99,91,255,.1);
        }
        .dw-search-icon {
          color: var(--t3, #9ba3bb);
          flex-shrink: 0;
          width: 15px;
          height: 15px;
        }
        .dw-search-input {
          border: none;
          outline: none;
          background: transparent;
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 13px;
          color: var(--t1, #0c0e18);
          flex: 1;
          min-width: 0;
        }
        .dw-search-input::placeholder { color: var(--t3, #9ba3bb); }
        .dw-search-clear {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: var(--t3, #9ba3bb);
          display: flex;
          align-items: center;
          transition: color .18s;
          flex-shrink: 0;
        }
        .dw-search-clear:hover { color: var(--t2, #5a6278); }
        .dw-status-pills {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }
        .dw-status-pill {
          padding: 7px 13px;
          border-radius: 999px;
          border: 1.5px solid rgba(0,0,0,.1);
          background: rgba(255,255,255,.85);
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: var(--t2, #5a6278);
          cursor: pointer;
          transition: all .2s;
          white-space: nowrap;
        }
        .dw-status-pill:hover {
          border-color: rgba(99,91,255,.3);
          color: var(--a1, #635bff);
          background: rgba(99,91,255,.06);
        }
        .dw-status-pill--active-all {
          background: linear-gradient(135deg, var(--a1,#635bff), var(--a2,#06c9a0));
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(99,91,255,.3);
        }
        .dw-status-pill--active-pending {
          background: linear-gradient(135deg, #f5a623, #e08800);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(245,166,35,.3);
        }
        .dw-status-pill--active-progress {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(59,130,246,.3);
        }
        .dw-status-pill--active-completed {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(34,197,94,.3);
        }
        .dw-advanced-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 11px;
          border: 1.5px solid rgba(0,0,0,.1);
          background: rgba(255,255,255,.85);
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: var(--t2, #5a6278);
          cursor: pointer;
          transition: all .2s;
          white-space: nowrap;
          position: relative;
        }
        .dw-advanced-btn:hover, .dw-advanced-btn--open {
          border-color: rgba(99,91,255,.3);
          color: var(--a1, #635bff);
          background: rgba(99,91,255,.07);
        }
        .dw-advanced-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--a1, #635bff);
          display: inline-block;
          flex-shrink: 0;
        }
        .dw-advanced-chevron {
          transition: transform .2s;
        }
        .dw-advanced-chevron--open {
          transform: rotate(180deg);
        }

        /* Advanced panel */
        .dw-advanced-panel {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(0,0,0,.07);
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: flex-end;
        }
        .dw-filter-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
          min-width: 140px;
          max-width: 220px;
        }
        .dw-filter-label {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .07em;
          text-transform: uppercase;
          color: var(--t3, #9ba3bb);
        }
        .dw-filter-select, .dw-filter-date {
          width: 100%;
          padding: 8px 12px;
          border: 1.5px solid rgba(0,0,0,.1);
          border-radius: 10px;
          background: rgba(255,255,255,.9);
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 13px;
          color: var(--t1, #0c0e18);
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          cursor: pointer;
          appearance: auto;
        }
        .dw-filter-select:focus, .dw-filter-date:focus {
          border-color: var(--a1, #635bff);
          box-shadow: 0 0 0 3px rgba(99,91,255,.1);
        }
        .dw-clear-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 16px;
          border-radius: 10px;
          border: 1.5px solid rgba(220,38,38,.25);
          background: rgba(254,242,242,.9);
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #c41e1e;
          cursor: pointer;
          transition: all .2s;
          white-space: nowrap;
          align-self: flex-end;
        }
        .dw-clear-btn:hover {
          background: rgba(239,68,68,.15);
          border-color: rgba(220,38,38,.4);
        }

        /* ── SECTIONS ── */
        .dw-sections {
          display: flex;
          flex-direction: column;
          gap: clamp(28px, 5vw, 44px);
        }
        .dw-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: clamp(14px,2.5vw,20px);
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(0,0,0,.06);
        }
        .dw-section-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dw-section-title {
          font-family: 'Syne', system-ui, -apple-system, sans-serif;
          font-size: clamp(16px,2.5vw,20px);
          font-weight: 700;
          color: var(--t1, #0c0e18);
          flex: 1;
          letter-spacing: -.01em;
        }
        .dw-section-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 26px;
          height: 26px;
          padding: 0 9px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 700;
        }

        /* ── CARDS ── */
        .dw-loading, .dw-empty {
          background: rgba(255,255,255,.65);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: clamp(16px,2vw,20px);
          padding: clamp(32px,5vw,64px) clamp(16px,4vw,32px);
          text-align: center;
          color: var(--t2, #5a6278);
          font-size: clamp(14px,2vw,16px);
          box-shadow: 0 16px 48px rgba(99,91,255,.12);
          backdrop-filter: blur(20px);
        }
        .dw-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(16px,3vw,24px);
          list-style: none;
          margin: 0;
          padding: 0;
        }
        @media (min-width: 640px) { .dw-list { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .dw-list { grid-template-columns: repeat(3, 1fr); } }
        .dw-list li { margin: 0; padding: 0; }
        .dw-card {
          display: flex;
          flex-direction: column;
          padding: 0;
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: clamp(12px,2vw,16px);
          box-shadow: 0 8px 32px rgba(99,91,255,.08);
          backdrop-filter: blur(20px);
          cursor: pointer;
          transition: all .3s cubic-bezier(.22,1,.36,1);
          overflow: hidden;
          position: relative;
        }
        .dw-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--a1, #635bff), var(--a2, #06c9a0));
          opacity: 0;
          transition: opacity .3s ease;
        }
        .dw-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 56px rgba(99,91,255,.16);
          border-color: rgba(99,91,255,.15);
          background: rgba(255,255,255,.88);
        }
        .dw-card:hover::before { opacity: 1; }
        .dw-card:hover .dw-card-open { opacity: 1; color: var(--a1, #635bff); gap: 12px; }
        .dw-card-click {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: clamp(16px,3vw,28px);
          text-align: left;
          border: none;
          background: none;
          cursor: pointer;
          font: inherit;
          color: inherit;
          gap: clamp(8px,2vw,12px);
        }
        .dw-card-body { flex: 1; min-width: 0; }
        .dw-card-title {
          font-family: 'Syne', system-ui, sans-serif;
          font-size: clamp(16px,3vw,18px);
          font-weight: 700;
          color: var(--t1, #0c0e18);
          margin: 0 0 8px 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .dw-card-meta {
          display: flex;
          align-items: center;
          gap: clamp(6px,2vw,8px);
          margin-bottom: clamp(8px,2vw,12px);
          font-size: clamp(12px,1.8vw,13px);
          color: var(--t2, #5a6278);
          flex-wrap: wrap;
        }
        .dw-card-meta-divider { width: 1px; height: 14px; background: rgba(0,0,0,.1); }
        .dw-card-row {
          font-size: clamp(12px,1.8vw,13px);
          color: var(--t2, #5a6278);
          margin: 0 0 4px 0;
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }
        .dw-card-row:last-of-type { margin-bottom: clamp(8px,2vw,12px); }
        .dw-progress { margin: 10px 0 12px; display: grid; gap: 7px; }
        .dw-progress-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .dw-progress-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: var(--t3, #9ba3bb);
        }
        .dw-progress-value {
          font-size: 11px;
          font-weight: 800;
          padding: 3px 9px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,.12);
        }
        .dw-progress-track {
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background: rgba(15,23,42,.08);
          border: 1px solid rgba(15,23,42,.08);
          overflow: hidden;
        }
        .dw-progress-fill {
          height: 100%;
          border-radius: 999px;
          min-width: 0;
          transition: width .3s ease, background .3s ease;
        }
        .dw-map-link {
          color: var(--a1, #635bff);
          font-weight: 700;
          text-decoration: underline;
          text-decoration-thickness: 1.5px;
          text-underline-offset: 2px;
        }
        .dw-map-link:hover { color: var(--a2, #06c9a0); }
        .dw-card-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 800;
          padding: 5px 11px;
          margin-bottom: 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: .05em;
          white-space: nowrap;
        }
        .dw-card-badge::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          display: inline-block;
        }
        .dw-card-badge--pending { background: rgba(245,166,35,.15); color: #92400e; }
        .dw-card-badge--pending::before { background: #f5a623; }
        .dw-card-badge--progress { background: rgba(59,130,246,.15); color: #1d4ed8; }
        .dw-card-badge--progress::before { background: #3b82f6; }
        .dw-card-badge--completed { background: rgba(34,197,94,.15); color: #166534; }
        .dw-card-badge--completed::before { background: #22c55e; }
        .dw-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: clamp(10px,3vw,18px) clamp(14px,4vw,28px);
          border-top: 1px solid rgba(0,0,0,.06);
          background: linear-gradient(135deg, rgba(99,91,255,.02), rgba(6,201,160,.02));
        }
        .dw-card-open {
          font-size: 12px;
          font-weight: 700;
          color: var(--t2, #5a6278);
          opacity: .75;
          transition: all .25s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: .04em;
          border: none;
          background: none;
          padding: 0;
          cursor: pointer;
        }
        .dw-card-actions { flex-shrink: 0; }
        .dw-btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1.5px solid rgba(220,38,38,.2);
          background: rgba(254,242,242,.8);
          color: #c41e1e;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background .2s ease, border-color .2s ease, color .2s ease;
          font-weight: 300;
        }
        .dw-btn-icon:hover {
          background: rgba(239,68,68,.15);
          border-color: rgba(220,38,38,.4);
        }
        .dw-sec-pag {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: clamp(16px, 3vw, 24px);
          padding-top: clamp(12px, 2vw, 18px);
          border-top: 1px solid rgba(0,0,0,.06);
        }
        .dw-sec-pag-btn {
          padding: 7px 16px;
          border-radius: 10px;
          border: 1.5px solid rgba(0,0,0,.1);
          background: rgba(255,255,255,.85);
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: var(--t2, #5a6278);
          cursor: pointer;
          transition: all .2s;
        }
        .dw-sec-pag-btn:hover:not(:disabled) {
          border-color: rgba(99,91,255,.3);
          color: var(--a1, #635bff);
          background: rgba(99,91,255,.06);
        }
        .dw-sec-pag-btn:disabled {
          opacity: 0.35;
          cursor: default;
        }
        .dw-sec-pag-info {
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: var(--t2, #5a6278);
          min-width: 50px;
          text-align: center;
        }
        @media (max-width: 768px) {
          .dw-head { flex-direction: column; align-items: flex-start; gap: 12px; }
          .dw-title { font-size: 28px; }
          .dw-btn-primary { width: 100%; justify-content: center; }
          .dw-list { grid-template-columns: 1fr; }
          .dw-filter-bar { flex-direction: column; align-items: stretch; gap: 8px; }
          .dw-search-wrap { max-width: 100%; width: 100%; }
          .dw-status-pills {
            overflow-x: auto;
            flex-wrap: nowrap;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 2px;
          }
          .dw-status-pills::-webkit-scrollbar { display: none; }
          .dw-status-pill { flex-shrink: 0; }
          .dw-advanced-btn { width: 100%; justify-content: center; }
          .dw-advanced-panel { gap: 8px; }
          .dw-filter-group { min-width: 0; max-width: 100%; flex: 1 1 calc(50% - 4px); }
          .dw-clear-btn { width: 100%; justify-content: center; }
        }
        @media (max-width: 480px) {
          .dw-filters { padding: 12px 14px; border-radius: 14px; }
          .dw-filter-group { flex: 1 1 100%; min-width: 0; }
        }
        @media (max-width: 400px) {
          .dw-page { padding: 10px; }
          .dw-title { font-size: 22px; }
          .dw-sub { font-size: 12px; }
          .dw-filters { padding: 10px 12px; border-radius: 12px; margin-bottom: 14px; }
          .dw-filter-bar { gap: 6px; }
          .dw-search-wrap { padding: 7px 10px; border-radius: 9px; }
          .dw-search-input { font-size: 12px; }
          .dw-status-pill { padding: 5px 10px; font-size: 11px; }
          .dw-advanced-btn { padding: 7px 12px; font-size: 11px; }
          .dw-advanced-panel { gap: 6px; margin-top: 10px; padding-top: 10px; }
          .dw-filter-group { flex: 1 1 100%; min-width: 0; }
          .dw-filter-select, .dw-filter-date { font-size: 12px; padding: 7px 10px; border-radius: 8px; }
          .dw-filter-label { font-size: 10px; }
          .dw-clear-btn { font-size: 11px; padding: 7px 12px; }
          .dw-section-header { gap: 7px; margin-bottom: 12px; }
          .dw-section-icon-wrap { width: 28px; height: 28px; border-radius: 8px; }
          .dw-section-title { font-size: 14px; }
          .dw-section-badge { font-size: 10px; min-width: 22px; height: 22px; padding: 0 6px; }
          .dw-card-click { padding: 14px; }
          .dw-card-title { font-size: 14px; }
          .dw-card-meta { font-size: 11px; }
          .dw-card-row { font-size: 11px; }
          .dw-card-footer { gap: 8px; }
          .dw-card-open { font-size: 10px; }
          .dw-btn-icon { width: 30px; height: 30px; font-size: 17px; border-radius: 8px; }
          .dw-sections { gap: 20px; }
          .dw-head { margin-bottom: 14px; padding-bottom: 14px; }
          .dw-btn-primary { font-size: 13px; padding: 10px 16px; border-radius: 10px; }
        }
      `}),e.jsxs("div",{className:"dw-shell",children:[e.jsxs("div",{className:"dw-head",children:[e.jsxs("div",{className:"dw-head-group",children:[e.jsx("div",{className:"dw-eyebrow",children:"Internship Overview"}),e.jsx("h1",{className:"dw-title",children:"Internships"}),e.jsx("p",{className:"dw-sub",children:"Manage and open internship records"})]}),String(d?.role||"").toLowerCase()==="admin"&&e.jsxs("button",{type:"button",className:"dw-btn-primary",onClick:a,children:[e.jsx("span",{"aria-hidden":"true",children:"+"}),"New Internship"]})]}),!w&&g.length>0&&e.jsx("div",{className:"dw-filters",children:e.jsxs("div",{className:"dw-filter-bar",children:[e.jsxs("div",{className:"dw-search-wrap",children:[e.jsxs("svg",{className:"dw-search-icon",viewBox:"0 0 20 20",fill:"none",children:[e.jsx("circle",{cx:"9",cy:"9",r:"6",stroke:"currentColor",strokeWidth:"1.8"}),e.jsx("path",{d:"M13.5 13.5L17 17",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round"})]}),e.jsx("input",{className:"dw-search-input",type:"text",placeholder:"Search internships...",value:N,onChange:r=>{u(r.target.value),U()}}),N&&e.jsx("button",{className:"dw-search-clear",onClick:()=>u(""),"aria-label":"Clear search",children:e.jsx("svg",{width:"13",height:"13",viewBox:"0 0 14 14",fill:"none",children:e.jsx("path",{d:"M2 2l10 10M12 2L2 12",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round"})})})]}),e.jsx("div",{className:"dw-status-pills",children:[{value:"all",label:"All",activeClass:"dw-status-pill--active-all"},{value:"in-progress",label:"In Progress",activeClass:"dw-status-pill--active-progress"},{value:"completed",label:"Completed",activeClass:"dw-status-pill--active-completed"},{value:"not-started",label:"Not Started",activeClass:"dw-status-pill--active-pending"}].map(({value:r,label:s,activeClass:n})=>e.jsx("button",{type:"button",className:`dw-status-pill${M===r?` ${n}`:""}`,onClick:()=>{P(r),U()},children:s},r))})]})}),w?e.jsx(Q,{variant:"loading",title:"Loading internships",message:"Fetching internship cards and progress data...",className:"dw-loading"}):g.length===0?e.jsx(Q,{variant:"empty",title:"No internships yet",message:"Create your first internship to get started.",className:"dw-empty"}):O.length===0?e.jsx(Q,{variant:"empty",title:"No matching internships",message:"Try another search query or clear the filters.",className:"dw-empty"}):e.jsxs("div",{className:"dw-sections",children:[K("In Progress",ve,"#3b82f6","M8 1a7 7 0 100 14A7 7 0 008 1zM2.5 8a5.5 5.5 0 015.5-5.5V8l3.889 3.889A5.5 5.5 0 012.5 8z","inProgress"),K("Completed",ye,"#22c55e","M8 1a7 7 0 100 14A7 7 0 008 1zm3.47 5.03a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06 0l-1.75-1.75a.75.75 0 011.06-1.06l1.22 1.22 3.47-3.47a.75.75 0 011.06 0z","completed"),K("Not Started",we,"#f5a623","M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM8 4a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 7.5a.875.875 0 110-1.75.875.875 0 010 1.75z","notStarted")]})]})]})}function Ye({target:a,sfx:t=""}){const[l,d]=f.useState(0),g=f.useRef(null),x=f.useRef(!1);return f.useEffect(()=>{const m=g.current;if(!m)return;const y=new IntersectionObserver(([w])=>{if(w.isIntersecting&&!x.current){x.current=!0;let j=0;const N=60,u=a/N,M=setInterval(()=>{j=Math.min(j+u,a),d(Math.round(j)),j>=a&&clearInterval(M)},2e3/N)}},{threshold:.1});return y.observe(m),()=>y.disconnect()},[a]),e.jsxs("span",{ref:g,children:[l,t]})}const X=12,pe=a=>Math.max(0,Math.min(100,Number.isFinite(a)?a:0));function Oe(a){const t=Array.isArray(a.days)?a.days:[];if(t.length){const d=t.filter(g=>he(g)).length;return pe(Math.round(d/t.length*100))}const l=Number.parseFloat(String(a.progressAll||"").replace("%",""));return Number.isFinite(l)?pe(Math.round(l)):0}function te(a){if(!a)return null;const t=String(a).match(/^(\d{4})-(\d{2})-(\d{2})$/);if(t)return new Date(+t[1],+t[2]-1,+t[3]);const l=String(a).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);if(l)return new Date(+l[3],+l[2]-1,+l[1]);const d=new Date(a);return Number.isNaN(d.getTime())?null:d}function ge(a){const t=te(a);return t?`${String(t.getDate()).padStart(2,"0")}.${String(t.getMonth()+1).padStart(2,"0")}.${t.getFullYear()}`:""}function qe(a){const t=te(a.start),l=te(a.end);if(!t||!l)return"N/A";const d=Math.max(0,Math.ceil((l-t)/864e5)+1);return`${d} day${d===1?"":"s"}`}function He(a){const t=ge(a.start),l=ge(a.end);return t&&l?`${t} – ${l}`:t||l||"N/A"}function me(a){const t=a.tutor;return t?typeof t=="string"?t.trim()||"Not assigned":[t.name,t.surname,t.lastname].filter(Boolean).join(" ").trim()||t.login||t.email||"Not assigned":"Not assigned"}function Ge(a){const t=a.tutor;return!t||typeof t=="string"?null:t.phone||t.email||t.login||null}function Ze(a){const t=me(a);return!t||t==="Not assigned"?"?":t.split(" ").filter(Boolean).slice(0,2).map(l=>l[0]?.toUpperCase()).join("")}function Ke(a){const t=a.locationYmaps,l=Array.isArray(t)?t:Array.isArray(t?.coords)?t.coords:null;if(l?.length===2){const g=Number(l[0]),x=Number(l[1]);if(!Number.isNaN(g)&&!Number.isNaN(x))return`https://yandex.com/maps/?pt=${x},${g}&z=15&l=map`}const d=(a.location||"").trim();return d?`https://yandex.com/maps/?text=${encodeURIComponent(d)}`:null}const xe={"In Progress":{dot:"#3b82f6",bg:"rgba(59,130,246,.1)",text:"#1d4ed8"},Completed:{dot:"#22c55e",bg:"rgba(34,197,94,.1)",text:"#166534"},Pending:{dot:"#f5a623",bg:"rgba(245,166,35,.12)",text:"#92400e"},"Not Started":{dot:"#94a3b8",bg:"rgba(148,163,184,.12)",text:"#475569"}},Je=[{value:"all",label:"All",activeClass:"dw-status-pill--active-all"},{value:"In Progress",label:"In Progress",activeClass:"dw-status-pill--active-progress"},{value:"Completed",label:"Completed",activeClass:"dw-status-pill--active-completed"},{value:"Pending",label:"Pending",activeClass:"dw-status-pill--active-pending"},{value:"Not Started",label:"Not Started",activeClass:"dw-status-pill--active-pending"}];function Qe({internships:a,feedbacks:t,onOpen:l,user:d}){const[g,x]=f.useState(""),[m,y]=f.useState("all"),[w,j]=f.useState(1),N=f.useMemo(()=>{const i=(t||[]).filter(b=>typeof b.rating=="number"&&b.rating>0);return i.length?parseFloat((i.reduce((b,S)=>b+S.rating,0)/i.length).toFixed(1)):null},[t]),u=a.length,M=f.useMemo(()=>a.filter(i=>G(i.status)==="Completed").length,[a]),P=f.useMemo(()=>{let i=a;if(m!=="all"&&(i=i.filter(b=>G(b.status)===m)),g.trim()){const b=g.toLowerCase();i=i.filter(S=>S.title?.toLowerCase().includes(b)||S.company?.toLowerCase().includes(b))}return i},[a,m,g]),z=Math.max(1,Math.ceil(P.length/X)),I=Math.min(w,z),E=P.slice((I-1)*X,I*X),U=i=>{y(i),j(1)},W=i=>{x(i),j(1)},T=[{label:"Total Interns",v:u,sfx:"",disp:null,I:Se,color:"#635bff"},{label:"Feedback",v:t.length,sfx:"",disp:null,I:ze,color:"#10b981"},{label:"Avg Rating",v:N?Math.round(N*10):0,sfx:"",disp:N??"—",I:Ee,color:"#f59e0b"},{label:"Completion",v:u?Math.round(M/u*100):0,sfx:"%",disp:null,I:Ce,color:"#635bff"}];return e.jsxs("div",{className:"pp",children:[e.jsx("style",{children:`
        .ov-filters {
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 20px;
          backdrop-filter: blur(20px);
          box-shadow: 0 4px 18px rgba(99,91,255,.05);
        }
        .ov-filter-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .ov-search-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,.9);
          border: 1.5px solid rgba(0,0,0,.1);
          border-radius: 11px;
          padding: 8px 14px;
          flex: 1;
          min-width: 180px;
          max-width: 280px;
          transition: border-color .2s, box-shadow .2s;
        }
        .ov-search-wrap:focus-within {
          border-color: var(--a1, #635bff);
          box-shadow: 0 0 0 3px rgba(99,91,255,.1);
        }
        .ov-search-icon { color: var(--t3, #9ba3bb); flex-shrink: 0; width: 15px; height: 15px; }
        .ov-search-input {
          border: none; outline: none; background: transparent;
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 13px; color: var(--t1, #0c0e18); flex: 1; min-width: 0;
        }
        .ov-search-input::placeholder { color: var(--t3, #9ba3bb); }
        .ov-search-clear {
          background: none; border: none; padding: 0; cursor: pointer;
          color: var(--t3, #9ba3bb); display: flex; align-items: center;
          transition: color .18s; flex-shrink: 0;
        }
        .ov-search-clear:hover { color: var(--t2, #5a6278); }
        .ov-pills { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
        .ov-pill {
          padding: 7px 13px; border-radius: 999px;
          border: 1.5px solid rgba(0,0,0,.1);
          background: rgba(255,255,255,.85);
          font-family: 'Montserrat', system-ui, sans-serif;
          font-size: 12px; font-weight: 600;
          color: var(--t2, #5a6278);
          cursor: pointer; transition: all .2s; white-space: nowrap;
        }
        .ov-pill:hover { border-color: rgba(99,91,255,.3); color: var(--a1,#635bff); background: rgba(99,91,255,.06); }
        .ov-pill--all       { background: linear-gradient(135deg,var(--a1,#635bff),var(--a2,#06c9a0)); color:#fff; border-color:transparent; box-shadow:0 4px 14px rgba(99,91,255,.3); }
        .ov-pill--progress  { background: linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; border-color:transparent; box-shadow:0 4px 14px rgba(59,130,246,.3); }
        .ov-pill--completed { background: linear-gradient(135deg,#22c55e,#16a34a); color:#fff; border-color:transparent; box-shadow:0 4px 14px rgba(34,197,94,.3);  }
        .ov-pill--pending   { background: linear-gradient(135deg,#f5a623,#e08800); color:#fff; border-color:transparent; box-shadow:0 4px 14px rgba(245,166,35,.3); }
      `}),e.jsx(F,{children:e.jsxs("div",{style:{marginBottom:18},children:[e.jsxs("div",{style:{fontFamily:"Montserrat",fontSize:20,fontWeight:800,color:"var(--t1)",marginBottom:3},children:["Work in progress, ",d?.name||"User"]}),e.jsx("div",{style:{fontSize:13,color:"var(--t3)"},children:new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})})]})}),e.jsx(F,{delay:50,children:e.jsx("div",{className:"gc",style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",marginBottom:20,padding:"14px 0"},children:T.map((i,b)=>e.jsxs("div",{style:{padding:"2px 20px",borderLeft:b>0?"1px solid var(--br)":"none"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:5,marginBottom:5},children:[e.jsx(i.I,{size:11,color:i.color}),e.jsx("span",{style:{fontSize:10,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"},children:i.label})]}),e.jsx("div",{style:{fontFamily:"Montserrat",fontSize:26,fontWeight:800,color:"var(--t1)",lineHeight:1},children:i.disp!=null?i.disp:e.jsx(Ye,{target:i.v,sfx:i.sfx})})]},i.label))})}),e.jsx(F,{delay:90,children:e.jsx("div",{className:"ov-filters",children:e.jsxs("div",{className:"ov-filter-bar",children:[e.jsxs("div",{className:"ov-search-wrap",children:[e.jsxs("svg",{className:"ov-search-icon",viewBox:"0 0 20 20",fill:"none",children:[e.jsx("circle",{cx:"9",cy:"9",r:"6",stroke:"currentColor",strokeWidth:"1.8"}),e.jsx("path",{d:"M13.5 13.5L17 17",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round"})]}),e.jsx("input",{className:"ov-search-input",type:"text",placeholder:"Search internships...",value:g,onChange:i=>W(i.target.value)}),g&&e.jsx("button",{className:"ov-search-clear",onClick:()=>W(""),"aria-label":"Clear search",children:e.jsx("svg",{width:"13",height:"13",viewBox:"0 0 14 14",fill:"none",children:e.jsx("path",{d:"M2 2l10 10M12 2L2 12",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round"})})})]}),e.jsx("div",{className:"ov-pills",children:Je.map(({value:i,label:b,activeClass:S})=>{const L=m===i?`ov-pill ov-pill--${S.replace("dw-status-pill--active-","")}`:"ov-pill";return e.jsx("button",{type:"button",className:L,onClick:()=>U(i),children:b},i)})})]})})}),e.jsx(F,{delay:120,children:e.jsxs("div",{style:{fontFamily:"Montserrat",fontSize:14,fontWeight:700,color:"var(--t1)",marginBottom:14},children:["Internships",e.jsx("span",{style:{marginLeft:8,fontSize:12,fontWeight:500,color:"var(--t3)"},children:P.length})]})}),P.length===0?e.jsx(F,{delay:130,children:e.jsx("div",{className:"gc",style:{padding:40,textAlign:"center",color:"var(--t3)",fontSize:13},children:u===0?"No internships yet.":"No internships match your filters."})}):e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:12},children:E.map((i,b)=>{const S=G(i.status),D=xe[S]||xe.Pending,L=Oe(i),C=Math.round(L/100*120),_=me(i),Z=Ze(i),V=Ge(i),Y=Ke(i);return e.jsx(F,{delay:130+b*25,children:e.jsxs("div",{className:"gc",onClick:()=>l(i),style:{padding:0,cursor:"pointer",overflow:"hidden",display:"flex",flexDirection:"column",transition:"transform .15s, box-shadow .15s"},onMouseEnter:A=>{A.currentTarget.style.transform="translateY(-2px)",A.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,.08)"},onMouseLeave:A=>{A.currentTarget.style.transform="",A.currentTarget.style.boxShadow=""},children:[e.jsxs("div",{style:{padding:"15px 16px 13px",flex:1},children:[e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:4},children:[e.jsx("div",{style:{fontFamily:"Montserrat",fontSize:13,fontWeight:700,color:"var(--t1)",lineHeight:1.35,flex:1,minWidth:0},children:i.title}),e.jsxs("span",{style:{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6,background:D.bg,color:D.text,display:"flex",alignItems:"center",gap:4,flexShrink:0},children:[e.jsx("span",{style:{width:5,height:5,borderRadius:"50%",background:D.dot,display:"inline-block"}}),S]})]}),e.jsx("div",{style:{fontSize:12,color:"var(--t2)",marginBottom:13},children:i.company||"No company"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:6,marginBottom:13},children:[e.jsx(B,{icon:e.jsx(Ie,{size:10,color:"var(--t3)"}),label:"Who",children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:5},children:[e.jsx("div",{style:{width:18,height:18,borderRadius:4,background:"var(--a1,#635bff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#fff",flexShrink:0},children:Z}),e.jsx("span",{style:{fontSize:11,color:"var(--t1)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:_})]})}),e.jsx(B,{icon:e.jsx(Re,{size:10,color:"var(--t3)"}),label:"Where",children:Y?e.jsx("a",{href:Y,target:"_blank",rel:"noreferrer",onClick:A=>A.stopPropagation(),style:{fontSize:11,color:"var(--a1,#635bff)",fontWeight:600,textDecoration:"none"},children:"Map link"}):e.jsx("span",{style:{fontSize:11,color:"var(--t3)"},children:"N/A"})}),e.jsx(B,{icon:e.jsx(De,{size:10,color:"var(--t3)"}),label:"When",children:e.jsx("span",{style:{fontSize:11,color:"var(--t1)",fontWeight:500},children:He(i)})}),e.jsx(B,{icon:e.jsx(Ae,{size:10,color:"var(--t3)"}),label:"Duration",children:e.jsx("span",{style:{fontSize:11,color:"var(--t1)",fontWeight:500},children:qe(i)})}),V&&e.jsx(B,{icon:e.jsx(Le,{size:10,color:"var(--t3)"}),label:"Contact",children:e.jsx("span",{style:{fontSize:11,color:"var(--t1)",fontWeight:500},children:V})})]}),e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:5},children:[e.jsx("span",{style:{fontSize:11,color:"var(--t3)"},children:"Progress"}),e.jsxs("span",{style:{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:6,color:`hsl(${C} 76% 30%)`,background:`linear-gradient(135deg,hsla(${Math.max(0,C-25)},95%,92%,.95),hsla(${Math.min(120,C+20)},95%,88%,.95))`,border:`1px solid hsla(${C},75%,45%,.2)`},children:[L,"%"]})]}),e.jsx("div",{style:{height:5,background:"var(--br)",borderRadius:999,overflow:"hidden"},children:e.jsx("div",{style:{width:`${L}%`,height:"100%",borderRadius:999,background:`linear-gradient(90deg,hsl(${Math.max(0,C-24)} 82% 56%),hsl(${Math.min(120,C+12)} 80% 44%))`,transition:"width 1s ease"}})})]})]}),e.jsx("div",{style:{padding:"9px 16px",borderTop:"1px solid var(--br)",display:"flex",justifyContent:"flex-end"},children:e.jsxs("span",{style:{fontSize:11,color:"var(--t3)",fontWeight:600,display:"flex",alignItems:"center",gap:3},children:["View Details ",e.jsx(le,{size:11})]})})]})},i.id)})}),z>1&&e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginTop:18},children:[e.jsxs("button",{className:"bg",onClick:()=>j(i=>Math.max(1,i-1)),disabled:I===1,style:{display:"flex",alignItems:"center",gap:4,opacity:I===1?.4:1},children:[e.jsx($e,{size:12})," Prev"]}),e.jsxs("span",{style:{fontSize:12,color:"var(--t2)",fontWeight:500},children:[I," / ",z]}),e.jsxs("button",{className:"bg",onClick:()=>j(i=>Math.min(z,i+1)),disabled:I===z,style:{display:"flex",alignItems:"center",gap:4,opacity:I===z?.4:1},children:["Next ",e.jsx(le,{size:12})]})]})]})]})}function B({icon:a,label:t,children:l}){return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[a,e.jsx("span",{style:{fontSize:10,color:"var(--t3)",width:44,flexShrink:0},children:t}),e.jsx("div",{style:{flex:1,minWidth:0},children:l})]})}const ue="siut_home_view";function Xe(){try{return localStorage.getItem(ue)||"list"}catch{return"list"}}function er(a){try{localStorage.setItem(ue,a)}catch{}}const fe=a=>["admin","developer"].includes(String(a?.role||"").toLowerCase());function cr({internships:a,feedbacks:t,user:l,students:d,search:g,onNewFaculty:x,onView:m}){Pe({title:"Dashboard",description:"Overview of internships, student feedback, and activity in your SIUT workspace.",noIndex:!0});const y=fe(l),[w,j]=f.useState(()=>{const u=Xe();return u==="overview"&&!fe(l)?"list":u}),N=u=>{j(u),er(u)};return e.jsxs(e.Fragment,{children:[y&&e.jsxs("div",{style:{display:"flex",justifyContent:"flex-end",gap:6,padding:"12px 20px 0"},children:[e.jsxs("button",{className:w==="list"?"bp":"bg",onClick:()=>N("list"),style:{display:"flex",alignItems:"center",gap:5,fontSize:12,padding:"6px 12px"},children:[e.jsx(Me,{size:13}),"Internships"]}),e.jsxs("button",{className:w==="overview"?"bp":"bg",onClick:()=>N("overview"),style:{display:"flex",alignItems:"center",gap:5,fontSize:12,padding:"6px 12px"},children:[e.jsx(Fe,{size:13}),"Overview"]})]}),w==="list"||!y?e.jsx(Ve,{onNewFaculty:x,onView:m,user:l,students:d,search:g}):e.jsx(Qe,{internships:a,feedbacks:t,onOpen:u=>m(u.id),user:l})]})}export{cr as default};
