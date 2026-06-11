import{r as h,j as e,P as j,g as R,t as k,d as V}from"./index-ulkMmI0r.js";const S=a=>Math.max(0,Math.min(100,Number.isFinite(a)?a:0)),H=a=>{if(!a?.shortReport)return!1;const s=typeof a.shortReport.title=="string"?a.shortReport.title.trim():"",l=typeof a.shortReport.description=="string"?a.shortReport.description.trim():"",c=Array.isArray(a.shortReport.images)?a.shortReport.images:[],m=Array.isArray(a.images)?a.images:[];return!!(s||l||c.length||m.length)},q=a=>{const s=Array.isArray(a)?a:[];if(s.length===0)return null;const l=s.filter(c=>H(c)).length;return S(Math.round(l/s.length*100))},G=a=>{if(typeof a=="number"&&Number.isFinite(a))return S(Math.round(a));if(typeof a=="string"){const s=Number.parseFloat(a.replace("%","").trim());if(Number.isFinite(s))return S(Math.round(s))}return null},M=a=>{const s=a?.duration;if(s&&typeof s=="object")return{start:s.start||s.startDate||a?.startDate||"",end:s.end||s.endDate||a?.endDate||"",durationText:""};const l=typeof s=="string"?s.trim():"";if(a?.startDate||a?.endDate)return{start:a?.startDate||"",end:a?.endDate||"",durationText:l};if(l){const c=l.match(/\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\.\d{1,2}\.\d{4}\b/g);if(c&&c.length>=2)return{start:c[0],end:c[1],durationText:l}}return{start:"",end:"",durationText:l}},D=a=>{if(!a)return null;if(a instanceof Date)return Number.isNaN(a.getTime())?null:a;if(typeof a=="number"){const x=new Date(a);return Number.isNaN(x.getTime())?null:x}const s=String(a).trim();if(!s)return null;const l=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(l){const[,x,f,b]=l,u=new Date(Number(x),Number(f)-1,Number(b));return Number.isNaN(u.getTime())?null:u}const c=s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);if(c){const[,x,f,b]=c,u=new Date(Number(b),Number(f)-1,Number(x));return Number.isNaN(u.getTime())?null:u}const m=new Date(s);return Number.isNaN(m.getTime())?null:m},F=a=>{const s=D(a);if(!s)return"";const l=String(s.getDate()).padStart(2,"0"),c=String(s.getMonth()+1).padStart(2,"0"),m=s.getFullYear();return`${l}.${c}.${m}`},K=a=>{const s=String(a||"").trim().toLowerCase();return s==="completed"?"Completed":s==="in progress"||s==="active"?"In Progress":"Pending"},Z=20;function O({onView:a,search:s="",user:l=null}){const[c,m]=h.useState([]),[x,f]=h.useState({}),[b,u]=h.useState(!0),[w,y]=h.useState(1),[v,A]=h.useState(1),P=r=>r?._id??r?.id??null,I=r=>{const t=r?.tutorID||r?.tutor||r?.supervisor;if(typeof t=="string"&&t.trim()){const i=x[t];if(i){const o=[i.name,i.surname,i.lastname].filter(Boolean).join(" ").trim();if(o)return o;if(i.login)return i.login}return t}if(t&&typeof t=="object"){const i=[t.name,t.surname,t.lastname].filter(Boolean).join(" ").trim();if(i)return i;if(t.login)return t.login;if(t.email)return t.email}const n=[r?.tutorName,r?.supervisorName].filter(Boolean).join(" ").trim();return n||"Not assigned"},T=r=>{const t=r?.tutorID||r?.tutor||r?.supervisor;return t&&typeof t=="object"?t:typeof t=="string"&&t.trim()&&x[t]||null},L=r=>{const t=T(r);return t?t.phone||t.email||t.login||"N/A":r?.tutorContact||r?.supervisorContact||"N/A"},U=r=>{const t=I(r);return!t||t==="Not assigned"?"U":t.split(" ").filter(Boolean).slice(0,2).map(n=>n[0]?.toUpperCase()).join("")||"U"},E=r=>{const{start:t,end:n,durationText:i}=M(r),o=F(t),d=F(n);return o&&d?`${o} - ${d}`:o||d?o||d:i||"N/A"},B=r=>{const{start:t,end:n,durationText:i}=M(r),o=D(t),d=D(n);if(!o||!d)return i||"N/A";const p=d.getTime()-o.getTime(),g=Math.max(0,Math.ceil(p/(1e3*60*60*24))+1);return`${g} day${g===1?"":"s"}`},$=r=>{const t=r?.locationYmaps,n=Array.isArray(t)?t:Array.isArray(t?.coords)?t.coords:null;if(Array.isArray(n)&&n.length===2){const o=Number(n[0]),d=Number(n[1]);if(!Number.isNaN(o)&&!Number.isNaN(d))return`https://yandex.com/maps/?pt=${d},${o}&z=15&l=map`}const i=(r?.location||"").trim();return i?`https://yandex.com/maps/?text=${encodeURIComponent(i)}`:null},W=r=>{const t=q(r?.days);if(t!=null)return t;const n=G(r?.progressAll);return n??0};h.useEffect(()=>{y(1)},[s]),h.useEffect(()=>{let r=!1;return(async()=>{try{u(!0);const n=String(l?.role||"").toLowerCase()==="admin",i=new URLSearchParams({page:w,limit:Z});s&&i.set("search",s);const[o,d]=await Promise.allSettled([R(`/faculty?${i}`),n?R("/usersInternship"):Promise.resolve([])]);if(r)return;if(o.status==="fulfilled"){const p=o.value;Array.isArray(p)?(m(p),A(1)):(m(Array.isArray(p?.data)?p.data:[]),A(p?.totalPages||1))}else throw o.reason;if(d.status==="fulfilled"){const p=d.value,_=(Array.isArray(p)?p:p?.data||[]).reduce((z,N)=>{const C=String(N?._id??N?.id??"");return C&&(z[C]=N),z},{});f(_)}else f({})}catch(n){r||(k.error(n?.message||"Failed to load internships."),console.error("Error fetching faculties:",n))}finally{r||u(!1)}})(),()=>{r=!0}},[s,w,l?.role]);const Y=async r=>{if(window.confirm("Are you sure you want to delete this internship?"))try{await V(`/faculty/${r}`),m(t=>t.filter(n=>String(P(n))!==String(r))),k.success("Internship deleted.")}catch(t){k.error("Failed to delete internship."),console.error("Delete error:",t)}};return e.jsxs("div",{className:"dw-page",children:[e.jsx("style",{children:`
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
          margin-bottom: clamp(24px,5vw,44px);
          padding-bottom: clamp(16px,3vw,24px);
          border-bottom: 1px solid rgba(0,0,0,.06);
        }
        .dw-head-group {
          flex: 1;
          min-width: 0;
        }
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
          gap: clamp(16px,3vw,32px);
          list-style: none;
          margin: 0;
          padding: 0;
        }
        @media (min-width: 640px) { .dw-list { grid-template-columns: repeat(2, 1fr); gap: clamp(20px,3vw,28px); } }
        @media (min-width: 1024px) { .dw-list { grid-template-columns: repeat(3, 1fr); gap: clamp(20px,2.5vw,28px); } }
        .dw-list li {
          margin: 0;
          padding: 0;
        }
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
          top: 0;
          left: 0;
          right: 0;
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
        .dw-card:hover::before {
          opacity: 1;
        }
        .dw-card:hover .dw-card-open {
          opacity: 1;
          color: var(--a1, #635bff);
          gap: 12px;
        }
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
        .dw-card-meta-divider {
          width: 1px;
          height: 14px;
          background: rgba(0,0,0,.1);
        }
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
        .dw-progress {
          margin: 10px 0 12px;
          display: grid;
          gap: 7px;
        }
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
        .dw-map-link:hover {
          color: var(--a2, #06c9a0);
        }
        .dw-card-plan {
          font-size: 12px;
          color: var(--t3, #9ba3bb);
          margin: 12px 0 0 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
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
        .dw-card-badge--pending {
          background: rgba(245,166,35,.15);
          color: #92400e;
        }
        .dw-card-badge--pending::before {
          background: #f5a623;
        }
        .dw-card-badge--progress {
          background: rgba(59,130,246,.15);
          color: #1d4ed8;
        }
        .dw-card-badge--progress::before {
          background: #3b82f6;
        }
        .dw-card-badge--completed {
          background: rgba(34,197,94,.15);
          color: #166534;
        }
        .dw-card-badge--completed::before {
          background: #22c55e;
        }
        .dw-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 28px;
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
        @media (max-width: 768px) {
          .dw-list { grid-template-columns: 1fr; }
          .dw-title { font-size: 32px; }
          .dw-head { flex-direction: column; align-items: flex-start; }
        }
      `}),e.jsxs("div",{className:"dw-shell",children:[e.jsx("div",{className:"dw-head",children:e.jsxs("div",{className:"dw-head-group",children:[e.jsx("div",{className:"dw-eyebrow",children:"All Internships"}),e.jsx("h1",{className:"dw-title",children:"All Internships"}),e.jsx("p",{className:"dw-sub",children:"View and manage all internship records"})]})}),b?e.jsx(j,{variant:"loading",title:"Loading internships",message:"Fetching internship cards and progress data...",className:"dw-loading"}):c.length===0?e.jsx(j,{variant:"empty",title:"No internships yet",message:"There are no internship records to display.",className:"dw-empty"}):filteredFaculties.length===0?e.jsx(j,{variant:"empty",title:"No matching internships",message:"Try another search query or clear the filters.",className:"dw-empty"}):e.jsx("ul",{className:"dw-list","aria-label":"Internship list",children:c.map((r,t)=>{const n=P(r)??`row-${t}`,i=W(r),o=Math.round(i/100*120),d=K(r.status),p=d==="Pending"?"dw-card-badge--pending":d==="In Progress"?"dw-card-badge--progress":"dw-card-badge--completed";return e.jsx("li",{children:e.jsxs("article",{className:"dw-card",children:[e.jsx("div",{role:"button",tabIndex:0,className:"dw-card-click",onClick:()=>{n&&a(n)},onKeyDown:g=>{(g.key==="Enter"||g.key===" ")&&(g.preventDefault(),n&&a(n))},children:e.jsxs("div",{className:"dw-card-body",children:[e.jsx("h3",{className:"dw-card-title",children:r.name}),d&&e.jsx("span",{className:`dw-card-badge ${p}`,children:d}),e.jsxs("div",{className:"dw-card-meta",children:[e.jsx("span",{children:r.company||"No company"}),d&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"dw-card-meta-divider"}),e.jsx("span",{children:d})]})]}),e.jsxs("div",{className:"dw-card-row",children:[e.jsx("span",{children:"Who:"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginTop:"4px"},children:[e.jsx("div",{style:{width:28,height:28,borderRadius:6,background:"linear-gradient(135deg,#635bff,#06c9a0)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne",fontWeight:700,color:"#fff",fontSize:11,flexShrink:0},children:U(r)}),e.jsx("strong",{children:I(r)})]})]}),e.jsxs("div",{className:"dw-card-row",children:[e.jsx("span",{children:"Where:"}),$(r)&&e.jsx("a",{href:$(r),target:"_blank",rel:"noreferrer",className:"dw-map-link",onClick:g=>g.stopPropagation(),children:"Link"})]}),e.jsxs("div",{className:"dw-card-row",children:[e.jsx("span",{children:"When:"})," ",e.jsx("strong",{children:E(r)})]}),e.jsxs("div",{className:"dw-card-row",children:[e.jsx("span",{children:"How long:"})," ",e.jsx("strong",{children:B(r)})]}),e.jsxs("div",{className:"dw-card-row",children:[e.jsx("span",{children:"Contact:"})," "," ",e.jsx("strong",{children:L(r)})]}),e.jsxs("div",{className:"dw-progress","aria-label":`Progress ${i}%`,children:[e.jsxs("div",{className:"dw-progress-top",children:[e.jsx("span",{className:"dw-progress-label",children:"Progress:"}),e.jsxs("span",{className:"dw-progress-value",style:{color:`hsl(${o} 76% 30%)`,borderColor:`hsla(${o}, 75%, 45%, .35)`,background:`linear-gradient(135deg, hsla(${Math.max(0,o-25)}, 95%, 92%, .95), hsla(${Math.min(120,o+20)}, 95%, 88%, .95))`},children:[i,"%"]})]}),e.jsx("div",{className:"dw-progress-track",children:e.jsx("div",{className:"dw-progress-fill",style:{width:`${i}%`,background:`linear-gradient(90deg, hsl(${Math.max(0,o-24)} 82% 56%), hsl(${Math.min(120,o+12)} 80% 44%))`}})})]})]})}),e.jsxs("div",{className:"dw-card-footer",children:[e.jsx("button",{type:"button",className:"dw-card-open",onClick:()=>{n&&a(n)},children:"View Details"}),e.jsx("button",{type:"button",className:"dw-btn-icon",onClick:g=>{g.preventDefault(),g.stopPropagation(),n&&Y(n)},title:"Delete internship","aria-label":"Delete internship",children:"×"})]})]})},n)})}),!b&&v>1&&e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"20px 0 4px"},children:[e.jsx("button",{className:"bg",disabled:w<=1,onClick:()=>y(r=>Math.max(1,r-1)),children:"← Prev"}),e.jsxs("span",{style:{fontSize:13,color:"var(--t2)",fontWeight:600},children:["Page ",w," of ",v]}),e.jsx("button",{className:"bg",disabled:w>=v,onClick:()=>y(r=>Math.min(v,r+1)),children:"Next →"})]})]})]})}export{O as default};
