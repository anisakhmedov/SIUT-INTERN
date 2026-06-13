import{g as ht,b as O,p as Ve,A as Zr,j as e,r,t as u,e as Xr,d as Qa,P as Ht,f as K}from"./index-B9wUb5OY.js";import{u as Qr}from"./useSEO-IGeWuCVr.js";import{a as We,C as ei}from"./ui-DPolIwNU.js";import{h as ft}from"./reportUtils-Cg4yPpzq.js";import"./calendar-Dqt64F1I.js";const Xt=(o,m="")=>`/faculty/${o}/attendance${m}`;async function ti(o){return await ht(Xt(o))}async function Ye(o){return await Ve(Xt(o,"/sync"))}async function ai(o,m,d){return await O(Xt(o,`/days/${m}`),d)}const ri=35e3;async function ii(o,m,d="/ai/final-report",f=ri){if(!m)throw new Error("Authentication token is missing. Please log in again.");const k=new AbortController,N=setTimeout(()=>k.abort(),f);try{const D=await fetch(`${Zr}${d}`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${m}`},body:JSON.stringify({...o,days:Array.isArray(o?.days)?o.days.slice(0,30):[]}),signal:k.signal}),l=await D.json().catch(()=>({}));if(!D.ok){const $=typeof l?.message=="string"?l.message:"Failed to generate final report";throw new Error($)}if(typeof l?.report!="string"||!l.report.trim())throw new Error("Backend returned empty report");return{report:l.report}}catch(D){throw D?.name==="AbortError"?new Error("Request timeout. Please try again."):D}finally{clearTimeout(N)}}function ni(o){return o?o.split(" ").map(m=>m[0]||"").slice(0,2).join("").toUpperCase():""}function oi({students:o=[],days:m=[],onTogglePresent:d=()=>{},onSave:f=()=>{},saving:k=!1,hasChanges:N=!1}){return e.jsxs("div",{className:"attendance-mobile-root",children:[e.jsx("div",{className:"attendance-mobile-list",children:o.map(D=>e.jsxs("div",{className:"attendance-mobile-card",children:[e.jsxs("div",{className:"attendance-mobile-header",children:[e.jsx("div",{className:"attendance-mobile-initials",children:ni(D.name)}),e.jsx("div",{className:"attendance-mobile-name",children:D.name})]}),e.jsx("div",{className:"attendance-mobile-days",role:"list",children:m.map(l=>{const $=(Array.isArray(l.students)?l.students:[]).find(G=>{const R=G.studentKey||G.studentId||`${G.name||""}-${G.surname||""}`;return String(R).trim()===String(D.key).trim()}),b=!!($&&$.present),U=l.date?new Date(l.date).toLocaleDateString():`Day ${l.dayNumber}`;return e.jsxs("button",{type:"button",className:`attendance-mobile-day-badge ${b?"present":"absent"}`,onClick:()=>d(l.id,D.key,!b),"aria-pressed":b,title:U,children:[e.jsx("div",{className:"attendance-mobile-day-label",children:U}),e.jsx("div",{className:"attendance-mobile-day-state",children:b?"✓":"—"})]},`${l.id||l.date}-${D.key}`)})})]},D.key))}),e.jsx("div",{className:"attendance-mobile-footer",children:e.jsx("button",{type:"button",className:"ip-btn ip-btn--primary",onClick:f,disabled:!N||k,children:k?"Saving…":"Save attendance"})})]})}const si=["Pending","In Progress","Completed"],ar=o=>Math.max(0,Math.min(100,Number.isFinite(o)?o:0));function He(o){if(o===!0)return 2;if(o===!1)return 3;const m=Number(o);if(m===2)return 2;if(m===3)return 3;const d=String(o??"").trim().toLowerCase();return d==="approved"?2:d==="rejected"||d==="declined"||d==="not approved"?3:1}function li(o){return He(o?.approved)===2}function di(o){return He(o?.approved)===3}function Kt(o){return o&&{...o,days:Array.isArray(o.days)?o.days.map(m=>({...m,approved:He(m?.approved)})):o.days}}function pi(o=new Date){const m=o.getFullYear(),d=String(o.getMonth()+1).padStart(2,"0"),f=String(o.getDate()).padStart(2,"0");return`${m}-${d}-${f}`}function ci(o){const m=String(o?.date||"").slice(0,10);return m?m<pi():!1}function gi(o){if(li(o))return"approved";if(di(o))return"rejected";const m=[o?.rejected,o?.isRejected,o?.reportRejected,o?.shortReport?.rejected,o?.shortReport?.isRejected],d=[o?.status,o?.reportStatus,o?.reviewStatus,o?.shortReport?.status,o?.shortReport?.approvalStatus].map(f=>String(f||"").trim().toLowerCase()).filter(Boolean);return m.some(Boolean)||d.some(f=>f==="rejected"||f==="declined")?"rejected":ft(o)?"submitted":ci(o)?"missed":"empty"}function er(o){const m=Array.isArray(o)?o:[];if(m.length===0)return 0;const d=m.filter(f=>ft(f)).length;return ar(Math.round(d/m.length*100))}function ui(o){const m=typeof o=="number"?o:typeof o=="string"?Number.parseFloat(o.replace("%","").trim()):NaN;return Number.isFinite(m)?ar(Math.round(m)):null}function xt(o){const m=String(o||"").trim().toLowerCase();return m==="completed"?"Completed":m==="in progress"||m==="active"?"In Progress":"Pending"}function Gt(o){const m=Array.isArray(o)?o:[],d=m.length;if(d===0)return"";const f=m.map(N=>String(N?.date||"").slice(0,10)).filter(Boolean),k=d===1?"day":"days";return f.length>=2?`${d} ${k} (${f[0]} to ${f[f.length-1]})`:`${d} ${k}`}function mi(o){if(typeof o=="string")return o.trim();if(o&&typeof o=="object"){const m=o.start||o.startDate||"",d=o.end||o.endDate||"";return[m,d].filter(Boolean).join(" - ").trim()}return""}function Jt(o){return o&&String(o).split(" ").filter(Boolean).slice(0,2).map(d=>d[0]?.toUpperCase()).join("")||"U"}function xi(o){return o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function qt(o){return o.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/_(.+?)_/g,"<em>$1</em>").replace(/`(.+?)`/g,"<code>$1</code>")}function Zt(o){const m=String(o||"").trim();if(!m)return"<p>No plan provided.</p>";const d=m.split(/\r?\n/),f=[];let k=!1;return d.forEach(N=>{const D=xi(N.trim());if(!D){k&&(f.push("</ul>"),k=!1);return}if(D.startsWith("- ")){k||(f.push("<ul>"),k=!0),f.push(`<li>${qt(D.slice(2))}</li>`);return}if(k&&(f.push("</ul>"),k=!1),D.startsWith("## ")){f.push(`<h3>${qt(D.slice(3))}</h3>`);return}f.push(`<p>${qt(D)}</p>`)}),k&&f.push("</ul>"),f.join("")}function tr({id:o,value:m,onChange:d,options:f=[],placeholder:k="Select option",menuClassName:N="",optionClassName:D="",renderOptionContent:l}){const[$,b]=r.useState(!1),U=r.useRef(null),G=r.useMemo(()=>m&&f.find(R=>R.value===m)||null,[f,m]);return r.useEffect(()=>{if(!$)return;const R=Q=>{U.current?.contains(Q.target)||b(!1)},Y=Q=>{Q.key==="Escape"&&b(!1)};return document.addEventListener("mousedown",R),document.addEventListener("keydown",Y),()=>{document.removeEventListener("mousedown",R),document.removeEventListener("keydown",Y)}},[$]),e.jsxs("div",{className:"ip-custom-select",ref:U,children:[e.jsxs("button",{id:o,type:"button",className:`ip-custom-trigger ${$?"ip-custom-trigger--open":""}`,"aria-haspopup":"listbox","aria-expanded":$,onClick:()=>b(R=>!R),children:[e.jsx("span",{className:"ip-custom-trigger-text",children:G?.label||k}),e.jsx("span",{className:`ip-custom-chevron ${$?"ip-custom-chevron--open":""}`})]}),$&&e.jsx("div",{className:`ip-custom-menu ${N}`.trim(),role:"listbox","aria-labelledby":o,children:f.map(R=>{const Y=R.value===m;return e.jsxs("button",{type:"button",role:"option","aria-selected":Y,className:`ip-custom-option ${D} ${Y?"ip-custom-option--selected":""}`.trim(),onClick:()=>{d(R.value),b(!1)},children:[l?l(R,Y):e.jsx("span",{children:R.label}),Y&&e.jsx("span",{className:"ip-custom-option-mark",children:"✓"})]},R.value)})})]})}function ji({facultyId:o,onBack:m,user:d,initialDayIndex:f,focusCommentKey:k,students:N=[]}){const[l,$]=r.useState(null);Qr({title:l?.name??"Internship Details",description:l?`Internship diary at ${l.company||"SIUT"}. Daily reports, attendance, and comments.`:"Detailed internship view with daily logs, attendance, and student comments.",noIndex:!0});const[b,U]=r.useState(0),[G,R]=r.useState(!0),[Y,Q]=r.useState(""),[Ke,yt]=r.useState(""),[be,Qt]=r.useState(!1),[he,Ge]=r.useState(""),[ee,J]=r.useState(""),[fe,wt]=r.useState(""),[H,ye]=r.useState([]),[ea,we]=r.useState([]),[E,vt]=r.useState(!1),[jt,ta]=r.useState(""),[kt,aa]=r.useState(""),[Nt,ra]=r.useState(""),[St,ia]=r.useState(""),[ve,na]=r.useState(""),[oa,rr]=r.useState(""),[Je,je]=r.useState(""),[qe,sa]=r.useState(""),[Ze,la]=r.useState(""),[Xe,Ct]=r.useState(""),[h,y]=r.useState(!1),[ir,da]=r.useState(!1),[ke,Qe]=r.useState(0),[nr,Dt]=r.useState(!1),[or,Ne]=r.useState(!1),[At,It]=r.useState(new Date().toISOString().slice(0,10)),[sr,Se]=r.useState(!1),[Ce,pa]=r.useState(""),[lr,De]=r.useState(!1),[L,dr]=r.useState(null),[ca,ga]=r.useState(!1),[ua,ma]=r.useState(""),[q,xa]=r.useState(null),[zt,ba]=r.useState(!1),[pr,et]=r.useState(!1),[cr,ha]=r.useState(""),[gr,tt]=r.useState(null),[at,Ae]=r.useState(""),[ur,Ie]=r.useState(!1),[mr,ze]=r.useState(!1),[$t,Rt]=r.useState(""),[te,rt]=r.useState([]),[Et,Lt]=r.useState("all"),xr=r.useRef(null),fa=r.useRef(!1),ya=r.useRef(!1),[wa,br]=r.useState(!1);r.useEffect(()=>{const t=()=>{br(typeof window<"u"&&window.innerWidth<=760)};return t(),window.addEventListener("resize",t),()=>window.removeEventListener("resize",t)},[]);const[Mt,Ft]=r.useState("all"),[va,ja]=r.useState(!0),[hr,it]=r.useState(!1),[ae,ka]=r.useState(!1),[Tt,Na]=r.useState(""),[nt,Sa]=r.useState(""),[$e,se]=r.useState(null),Ca=r.useRef(null),Re=r.useRef(null),ot=r.useRef(null),fr=r.useRef(null),Pt=r.useRef([]);r.useEffect(()=>{window.scrollTo(0,0)},[]),r.useEffect(()=>{fa.current=E},[E]),r.useEffect(()=>{ya.current=h},[h]);const w=r.useCallback(async(t={})=>{try{(!t||typeof t!="object")&&(t={}),t.silent||R(!0);const a=await ht(`/faculty/${o}`);return t.skipIfEditing&&(fa.current||ya.current)?(Q(""),a):($(Kt(a)),Q(""),a)}catch(a){return Q(a.message),console.error("Error fetching faculty:",a),null}finally{t.silent||R(!1)}},[o]),Ee=r.useCallback(async()=>{if(o){ga(!0),ma("");try{const t=await ti(o);dr(t||null),xa(t?JSON.parse(JSON.stringify(t)):null)}catch(t){ma(t?.message||String(t))}finally{ga(!1)}}},[o]);r.useEffect(()=>{l&&Ee()},[l,Ee]);const Da=r.useMemo(()=>{const t=JSON.stringify(L?.attendance||[]),a=JSON.stringify(q?.attendance||[]);return t!==a},[L,q]),Aa=r.useCallback((t,a,n)=>{const i=String(t||"").trim(),s=String(a||"").trim();!i||!s||xa(p=>{const g=Array.isArray(p?.attendance)?p:L?JSON.parse(JSON.stringify(L)):null;return!g||!Array.isArray(g.attendance)?p:{...g,attendance:g.attendance.map(x=>{if(String(x?.id??x?._id??x?.dayNumber??"").trim()!==i)return x;const v=Array.isArray(x.students)?x.students:[];let P=!1;const S=v.map(C=>String(C?.studentKey??C?.studentId??C?.id??"").trim()!==s?C:(P=!0,{...C,studentKey:C?.studentKey||s,present:n}));return P||S.push({studentKey:s,present:n}),{...x,students:S}})}})},[L]),Ia=r.useCallback(async()=>{if(!o)return;const t=Array.isArray(q?.attendance)?q.attendance:[];if(t.length===0)return;const a=Array.isArray(L?.attendance)?L.attendance:[],n=t.filter(i=>{const s=String(i?.id??i?._id??""),p=a.find(g=>String(g?.id??g?._id??"")===s);return JSON.stringify(i?.students??[])!==JSON.stringify(p?.students??[])});if(n.length===0){u.success("No changes to save.");return}ba(!0);try{for(const i of n){const s=i?.id??i?._id;if(!s)throw new Error("Attendance day could not be identified.");const p=Array.isArray(i.students)?i.students:[],g={id:s,date:i?.date,dayNumber:i?.dayNumber,students:p.map(x=>({studentKey:String(x?.studentKey??x?.studentId??x?.id??"").trim(),present:!!x?.present}))};await ai(o,s,g)}await Ee(),u.success("Attendance saved.")}catch(i){u.error(i?.message||"Failed to save attendance.")}finally{ba(!1)}},[L,q,o,Ee]);r.useEffect(()=>{w()},[w]);const[yr,Bt]=r.useState(!1),[le,wr]=r.useState([]),_t=r.useCallback(async()=>{if(Bt(!0),!(le&&le.length>0))try{const t=await ht("/usersInternship"),a=(Array.isArray(t)?t:[]).filter(n=>{const i=String(n?.role||"").trim().toLowerCase();return i==="tutor"||i==="professor"});wr(a)}catch(t){console.error("Failed to load tutors:",t),u.error("Failed to load tutors list.")}},[le]),Le=r.useCallback(()=>{const t=new Set;return Array.isArray(l?.tutorIDs)&&l.tutorIDs.forEach(a=>t.add(String(a))),Array.isArray(l?.tutors)&&l.tutors.forEach(a=>{const n=String(a?._id||a?.id||a?.userId||a?.login||a?.email||a?.name||"");n&&t.add(n)}),l?.tutorID&&t.add(String(l.tutorID)),l?.tutor&&typeof l.tutor=="string"&&t.add(String(l.tutor)),Array.from(t).filter(Boolean)},[l]),Me=t=>String(t||"").trim().toLowerCase(),Fe=r.useMemo(()=>{const t=Me(d?.role);return t==="admin"||t==="developer"},[d]),vr=r.useCallback(async(t,a)=>{if(!Fe){u.warning("Only admins and developers can append tutors.");return}if(!l)return;const n=String(t||"");if(!n)return;const i=Le(),s=i.includes(n);if(!(a&&s)&&!(!a&&!s)){y(!0);try{const p=a?[...i,n]:i.filter(g=>g!==n);await O(`/faculty/${o}`,{tutorIDs:p,tutorID:p[0]||""}),await w({silent:!0}),u.success(a?"Tutor added to internship.":"Tutor removed from internship.")}catch(p){u.error(p?.message||"Failed to update tutor assignment.")}finally{y(!1)}}},[Fe,l,w,o,Le]),jr=r.useCallback(async t=>{if(!l)return;const a=Le(),n=String(t||"");if(!a.includes(n)){u.warning("Tutor not found on this internship.");return}const i=a.filter(s=>s!==n);y(!0);try{await O(`/faculty/${o}`,{tutorIDs:i,tutorID:i[0]||""}),await w({silent:!0}),u.success("Tutor removed from internship.")}catch(s){u.error(s?.message||"Failed to remove tutor.")}finally{y(!1)}},[l,w,o,Le]),z=r.useCallback(t=>t?t._id??t.id??null:null,[]),za=r.useCallback(t=>{const a=String(t||"").trim().toLowerCase();return a==="tutor"||a==="professor"},[]),re=r.useCallback(t=>t?Array.isArray(t)?t.flatMap(a=>re(a)):typeof t=="object"?[t._id,t.id,t.userId,t.login,t.username,t.email,t.name,t.surname,t.lastname,[t.name,t.surname,t.lastname].filter(Boolean).join(" ")].map(a=>String(a||"").trim().toLowerCase()).filter(Boolean):[String(t).trim().toLowerCase()].filter(Boolean):[],[]),de=r.useMemo(()=>{const t=Me(d?.role);if(!l)return!1;if(t==="admin"||t==="developer"||t==="rector")return!0;if(t==="tutor"||t==="professor"){const a=re([d?.id,d?._id,d?.userId,d?.login,d?.username,d?.email,d?.name,d?.surname,d?.lastname,[d?.name,d?.surname,d?.lastname].filter(Boolean).join(" ")]);return re([l?.tutorIDs,l?.tutorID,l?.tutor,l?.supervisor,l?.tutors,l?.supervisors]).some(i=>a.includes(i))}return!0},[d,l,re]),Ut=r.useCallback((t,a)=>t?String(t._id||`${t.date||""}-${t.text||""}-${a}`):`idx-${a}`,[]),T=r.useCallback(t=>t?String(t._id??t.id??t.studentId??"").trim():"",[]),Z=r.useCallback(t=>t&&[t.name,t.surname,t.lastname].filter(Boolean).join(" ").trim()||"Unnamed student",[]),V=r.useCallback(t=>t?typeof t.nameFaculty=="string"&&t.nameFaculty.trim()?t.nameFaculty.trim():typeof t?.faculty=="object"&&t.faculty?String(t.faculty.name||t.faculty.title||"").trim():"":"",[]),ie=r.useCallback(t=>{if(!t)return"";const a=t.year??t.faculty?.year??t.facultyYear??t.courseYear;return a==null||a===""?"":String(a).trim()},[]),$a=r.useCallback(t=>{if(!t)return null;if(typeof t=="string"||typeof t=="number"){const i=String(t).trim();return i?{_id:i}:null}const a=T(t),n={name:typeof t.name=="string"?t.name:"",surname:typeof t.surname=="string"?t.surname:"",lastname:typeof t.lastname=="string"?t.lastname:"",nameFaculty:V(t),year:ie(t)};return a?n._id=a:typeof t.id=="string"&&t.id.trim()&&(n.id=t.id.trim()),n},[V,T,ie]),pe=r.useCallback(t=>t?(Array.isArray(t.images)?t.images:Array.isArray(t.shortReport?.images)?t.shortReport.images:[]).map(n=>typeof n=="string"?n:n&&typeof n.url=="string"?n.url:null).filter(Boolean):[],[]),Ra=r.useCallback(t=>({date:t?.date?String(t.date).slice(0,10):"",title:t?.shortReport?.title||"",description:t?.shortReport?.description||"",imageUrls:pe(t)}),[pe]),ne=r.useCallback(()=>{Qt(!1),Ge(""),J(""),wt(""),ye([]),we([]),Qe(0)},[]),ce=r.useCallback(t=>{if(!t)return;const a=t?.duration?typeof t.duration=="string"?t.duration:[t.duration?.start,t.duration?.end].filter(Boolean).join(" - "):"",n=Gt(t?.days);ta(t.name||""),aa(t.company||""),ra(t.location||""),ia(n||a),na(xt(t.status)),rr(t.progressAll!=null?String(t.progressAll):""),je(t.plan||"");const i=Array.isArray(t?.days)?t.days:[];sa(i[0]?.date?String(i[0].date).slice(0,10):""),la(i.length>0&&i[i.length-1]?.date?String(i[i.length-1].date).slice(0,10):"")},[]),oe=r.useCallback((t,a,n,i="",s="text")=>{const p=t?.current;if(!p)return;const g=p.selectionStart??0,x=p.selectionEnd??0,A=p.value??"",v=A.slice(g,x),P=`${n}${v||s}${i}`,S=`${A.slice(0,g)}${P}${A.slice(x)}`;a(S),requestAnimationFrame(()=>{if(p.focus(),v)p.setSelectionRange(g+n.length,g+n.length+v.length);else{const C=g+n.length;p.setSelectionRange(C,C+s.length)}})},[]),j=r.useMemo(()=>l?.days||[],[l]),Ot=r.useMemo(()=>Array.isArray(q?.attendance)?q.attendance:Array.isArray(L?.attendance)?L.attendance:[],[q?.attendance,L?.attendance]),Ea=700,st=260,lt=132,M=r.useMemo(()=>Array.isArray(l?.numberOfStudents)?l.numberOfStudents:Array.isArray(l?.students)?l.students:[],[l]),La=r.useMemo(()=>new Set(M.map(t=>T(t)).filter(Boolean)),[M,T]),kr=r.useMemo(()=>(M||[]).map((t,a)=>{const n=(typeof T=="function"?T(t):null)||`key-${a}`,i=typeof Z=="function"?Z(t):t?.name||`${t?.surname||""}`;return{key:n,name:i}}),[M,T,Z]),Wt=r.useCallback(t=>{const a=new Set,n=i=>{if(i==null)return;const s=String(i).trim();s&&a.add(s.toLowerCase())};return Array.isArray(t)?(t.forEach(n),a):t&&typeof t=="object"?([t._id,t.id,t.login,t.username,t.email].forEach(n),a):(n(t),a)},[]),Te=r.useMemo(()=>{const t=String(d?.role||"").trim().toLowerCase();if(t==="admin")return!0;if(t!=="tutor")return!1;const a=Wt([d?._id,d?.id,d?.login,d?.username,d?.email]);if(a.size===0)return!1;const n=Wt([l?.tutorIDs,l?.tutorID,l?.tutor,l?.supervisor,l?.tutors,l?.supervisors,l?.tutorID?._id,l?.tutorID?.id,l?.tutorID?.login,l?.tutorID?.username,l?.tutorID?.email,l?.tutor?._id,l?.tutor?.id,l?.tutor?.login,l?.tutor?.username,l?.tutor?.email]);for(const i of n)if(a.has(i))return!0;return!1},[l,Wt,d]),Ma=r.useCallback(()=>{Rt(""),rt([]),Lt("all"),Ft("all"),ze(!0)},[]),Pe=r.useMemo(()=>{const t=$t.trim().toLowerCase(),a=Array.isArray(N)?N:[],n=String(Et||"all").trim().toLowerCase(),i=String(Mt||"all").trim().toLowerCase();return a.filter(s=>t?[T(s),Z(s),V(s)].join(" ").toLowerCase().includes(t):!0).filter(s=>n==="all"?!0:String(V(s)).trim().toLowerCase()===n).filter(s=>i==="all"?!0:String(ie(s)).trim().toLowerCase()===i).map(s=>{const p=T(s),g=ie(s);return{student:s,studentId:p,studentName:Z(s),studentFacultyName:V(s),studentYear:g,isAttached:p?La.has(p):!1}}).sort((s,p)=>{const g=String(s.studentFacultyName||"").trim().toLowerCase(),x=String(p.studentFacultyName||"").trim().toLowerCase();if(g!==x)return g?x?g.localeCompare(x):-1:1;const A=Number.parseInt(s.studentYear,10),v=Number.parseInt(p.studentYear,10),P=Number.isFinite(A),S=Number.isFinite(v);return P&&S&&A!==v?A-v:P!==S?P?-1:1:s.studentName.localeCompare(p.studentName)})},[La,V,T,Z,ie,Et,Mt,$t,N]),Fa=r.useMemo(()=>{const t=new Set;return(Array.isArray(N)?N:[]).forEach(a=>{const n=V(a);n&&t.add(n)}),Array.from(t).sort((a,n)=>a.localeCompare(n))},[V,N]),Ta=r.useMemo(()=>{const t=new Set;return(Array.isArray(N)?N:[]).forEach(a=>{const n=ie(a);n&&t.add(n)}),Array.from(t).sort((a,n)=>{const i=Number.parseInt(a,10),s=Number.parseInt(n,10);return Number.isFinite(i)&&Number.isFinite(s)&&i!==s?i-s:a.localeCompare(n)})},[ie,N]),Nr=r.useMemo(()=>[{value:"all",label:"All faculties"},...Fa.map(t=>({value:t,label:t}))],[Fa]),Sr=r.useMemo(()=>[{value:"all",label:"All years"},...Ta.map(t=>({value:t,label:t}))],[Ta]),Cr=r.useMemo(()=>j.filter(t=>ft(t)).length,[j]),Be=r.useMemo(()=>er(j),[j]),Pa=r.useMemo(()=>`${Be}%`,[Be]),ge=r.useMemo(()=>Math.round(Be/100*120),[Be]),c=j[b],W=r.useMemo(()=>He(c?.approved),[c]),Ba=r.useMemo(()=>pe(c),[pe,c]),_a=r.useMemo(()=>{const t=ee.trim().match(/\S+/g);return t?t.length:0},[ee]),Yt=_a>=100,dt=r.useMemo(()=>!be||!$e?!1:fe!==$e.date||he!==$e.title||ee!==$e.description||H.length>0,[fe,ee,$e,H.length,he,be]),_=r.useMemo(()=>{const t=[l?.tutorIDs,l?.tutorID,l?.tutor,l?.tutors],a=[],n=g=>{if(!g)return;if(Array.isArray(g)){g.forEach(n);return}const x=typeof g=="object";if(x&&!za(g?.role))return;const A=x?[g?.name,g?.surname,g?.lastname].filter(Boolean).join(" ").trim():String(g).trim(),v=x&&(g?.phone||g?.email||g?.login)||"",P=String(x?g?._id||g?.id||g?.userId||A||v:g).trim();P&&a.push({key:P,name:A||`Tutor ${a.length+1}`,contact:v,initials:Jt(A||P)})};t.forEach(n);const i=Array.from(new Map(a.map(g=>[g.key,g])).values()),s=i[0]||null,p=i.map(g=>g.name).filter(Boolean);return{primaryTutor:s,tutors:i,name:p.join(", "),contact:s?.contact||l?.tutorContact||l?.supervisorContact||"",initials:s?.initials||Jt(p[0]||""),hasInfo:i.length>0,count:i.length}},[l,za]),pt=r.useMemo(()=>{if(!l)return null;const t=l?.locationYmaps,a=Array.isArray(t)?t:Array.isArray(t?.coords)?t.coords:null;if(Array.isArray(a)&&a.length===2){const i=Number(a[0]),s=Number(a[1]);if(Number.isFinite(i)&&Number.isFinite(s))return{label:l?.location?.trim()||l?.company?.trim()||"Internship location",embedUrl:`https://www.google.com/maps?q=${i},${s}&z=15&output=embed`,linkUrl:`https://www.google.com/maps?q=${i},${s}`}}const n=String(l?.location||"").trim();return n?{label:n,embedUrl:`https://www.google.com/maps?q=${encodeURIComponent(n)}&z=15&output=embed`,linkUrl:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(n)}`}:null},[l]),Ua=r.useMemo(()=>{if(!l)return!1;const t=String(d?.role||"").trim().toLowerCase();if(t!=="tutor"&&t!=="professor")return!1;const a=re([d?.id,d?._id,d?.userId,d?.login,d?.username,d?.email,d?.name,d?.surname,d?.lastname,[d?.name,d?.surname,d?.lastname].filter(Boolean).join(" ")]);return re([l?.tutorIDs,l?.tutorID,l?.tutor,l?.supervisor,l?.tutors,l?.supervisors]).some(i=>a.includes(i))},[d,l,re]),ue=d?.role==="Admin"||Ua,ct=r.useMemo(()=>{const t=Me(d?.role);return!(!de||t==="tutor")},[de,d]),Oa=d?.role==="Admin"||Ua,Wa=d?.role==="Admin",Vt=d?.role==="Admin",me=r.useCallback(()=>dt?window.confirm("You have unsaved report changes. Discard them?"):!0,[dt]),Ya=r.useCallback(()=>me()?(se(null),ne(),!0):!1,[me,ne]),gt=r.useCallback(()=>{me()&&(se(null),m())},[me,m]),_e=r.useCallback(t=>{const a=Math.max(0,Math.min(j.length-1,t));if(a!==b){if(be){if(!me())return;se(null),ne()}U(a)}},[me,b,j.length,ne,be]),Va=r.useCallback(async()=>{if(!l){u.error("Internship data is not ready yet. Please try again.");return}const t=i=>Array.isArray(i)?i.map(s=>typeof s=="string"?s:s&&typeof s.url=="string"?s.url:null).filter(Boolean):[],a=j.slice(0,30).map((i,s)=>{const p=t(i?.shortReport?.images),g=t(i?.images),x=Array.from(new Set([...p,...g])),A=Array.isArray(i?.comments)?i.comments.map(v=>({text:typeof v?.text=="string"?v.text:String(v||""),date:v?.date||null,userID:typeof v?.userID=="object"?v.userID?._id||v.userID?.id||null:v?.userID||null})):[];return{dayNumber:i?.dayNumber||s+1,date:i?.date||null,approved:He(i?.approved),shortReport:{title:typeof i?.shortReport?.title=="string"?i.shortReport.title:"",description:typeof i?.shortReport?.description=="string"?i.shortReport.description:""},comments:A,photoUrls:x}}),n={internship:{id:l?._id||l?.id||o,name:l?.name||"",company:l?.company||"",location:l?.location||"",status:l?.status||"",duration:l?.duration||null,plan:l?.plan||"",progressAll:l?.progressAll||"",students:M.map(i=>({id:i?._id||i?.id||i?.studentId||null,name:[i?.name,i?.surname,i?.lastname].filter(Boolean).join(" ").trim(),faculty:i?.nameFaculty||null}))},days:a,reportType:"final-30-day-report"};ka(!0),Sa(""),Na(""),it(!0);try{const i=Xr(),s=await ii(n,i);Na(s.report),u.success("Final report generated successfully.")}catch(i){const s=i?.message||"Failed to generate AI final report.";Sa(s),u.error(s)}finally{ka(!1)}},[M,j,l,o]),ut=r.useCallback(async(t,a)=>{if(!l)return!1;if(!Te)return u.error("You do not have permission to manage students for this internship."),!1;const n=[],i=new Set;(Array.isArray(t)?t:[]).forEach(s=>{const p=$a(s);if(!p)return;const g=p._id||p.id||[p.name,p.surname,p.lastname].filter(Boolean).join("|");!g||i.has(g)||(i.add(g),n.push(p))}),y(!0);try{return await O(`/faculty/${o}`,{numberOfStudents:n}),await w({silent:!0}),u.success(a),!0}catch(s){return u.error(s.message||"Something went wrong."),!1}finally{y(!1)}},[Te,l,o,w,$a]),Ha=r.useCallback(async t=>{const a=T(t);if(!a){u.error("Student could not be identified.");return}const n=M.filter(i=>T(i)!==a);await ut(n,"Student detached from the internship.")},[M,T,ut]),Dr=r.useCallback(t=>{t&&rt(a=>a.includes(t)?a.filter(n=>n!==t):[...a,t])},[]),Ar=r.useCallback(async()=>{if(te.length===0){u.warning("Select at least one student first.");return}const t=new Set(te),a=Pe.filter(({studentId:s,isAttached:p})=>s&&t.has(s)&&!p).map(({student:s})=>s);if(a.length===0){u.warning("Selected students are already attached or could not be found.");return}const n=[...M,...a];await ut(n,`Added ${a.length} student(s) to the internship.`)&&rt([])},[M,te,Pe,ut]),X=r.useCallback(async t=>{if(!t)return;const a=er(t.days||[]),n=ui(t.progressAll),i=`${a}%`;if(n===a){String(t.progressAll||"").trim()!==i&&$(s=>s&&{...s,progressAll:i});return}try{const s=Kt(t);await O(`/faculty/${o}`,{...s,progressAll:i}),$(p=>p&&{...p,progressAll:i})}catch(s){console.error("Failed to sync internship progress:",s)}},[o]),F=r.useCallback(async t=>{if(!t)return t;const a=Gt(t.days);return a?(E||ia(a),$(n=>n&&mi(n.duration)!==a?{...n,duration:a}:n),{...t,duration:a}):t},[E]);r.useEffect(()=>{!l||E||(ce(l),F(l))},[l,E,ce,F]);const Ka=r.useCallback(async(t,a,n=null)=>{const i=z(t)??(n!=null?String(n):null);if(i==null){u.error("Day could not be identified. Try refreshing.");return}y(!0);try{await O(`/faculty/${o}/days/${i}`,a);const s=await w({silent:!0});await F(s),await Ye(o),u.success("Saved.")}catch(s){u.error(s.message||"Something went wrong.")}finally{y(!1)}},[o,w,z,F]),Ir=r.useCallback(async t=>{if(t?.preventDefault&&t.preventDefault(),!!l){y(!0);try{const a=jt.trim(),n=kt.trim(),i=Nt.trim(),s=Gt(l?.days)||St.trim(),p=xt(ve),g=oa.trim(),x=Je.trim();if(!a)throw new Error("Internship name is required.");if(!n)throw new Error("Company is required.");if(!i)throw new Error("Location is required.");if(qe&&Ze){const C=Array.isArray(l.days)?l.days:[],B=new Set(C.map(I=>String(I.date||"").slice(0,10)).filter(Boolean)),Xa=new Date(qe+"T00:00:00Z"),mt=new Date(Ze+"T00:00:00Z"),xe=[],Oe=new Date(Xa);for(;Oe<=mt;){const I=Oe.toISOString().slice(0,10);B.has(I)||xe.push(I),Oe.setUTCDate(Oe.getUTCDate()+1)}if(xe.length>0)for(let I=0;I<xe.length;I++)await Ve(`/faculty/${o}/days`,{dayNumber:String(C.length+I+1),date:xe[I],approved:1,shortReport:null,comments:[]})}const{days:A,...v}=Kt(l),P={...v,name:a,company:n,location:i,duration:s||l.duration,status:p,progressAll:g,plan:x,locationYmaps:i===(l.location||"")?l.locationYmaps:null};await O(`/faculty/${o}`,P);const S=await w({silent:!0});await X(S),await F(S),await Ye(o),u.success("Internship information saved."),vt(!1)}catch(a){u.error(a.message||"Something went wrong.")}finally{y(!1)}}},[l,o,jt,kt,Nt,St,qe,Ze,ve,oa,Je,w,X,F]),zr=r.useCallback(()=>{l&&(ce(l),vt(!0))},[l,ce]),$r=r.useCallback(()=>{l&&ce(l),vt(!1)},[l,ce]),Ga=r.useCallback(()=>{const t=Ra(c);wt(t.date),c?.shortReport?(Ge(c.shortReport.title||""),J(c.shortReport.description||"")):(Ge(""),J("")),ye([]),we([]),se(t),Qt(!0)},[Ra,c]),Rr=r.useCallback(t=>{t&&typeof t.preventDefault=="function"&&t.preventDefault(),t&&typeof t.stopPropagation=="function"&&t.stopPropagation(),Ga()},[Ga]),Er=r.useCallback(async t=>{if(t.preventDefault(),!!c){if(!Yt){u.error("Description must be at least 100 words.");return}y(!0),Qe(0);try{const a=z(c);if(!a)throw new Error("Day could not be identified. Try refreshing.");const n=pe(c),i=S=>(Array.isArray(S?.shortReport?.images)?S.shortReport.images:[]).map(B=>typeof B=="string"?B:B&&typeof B.url=="string"?B.url:null).filter(Boolean);let s=[];if(H&&H.length>0){const S=new FormData;H.forEach(I=>{S.append("images",I)}),S.append("image",H[0]);const C=await Ve(`/faculty/${o}/days/${a}/images`,S),B=[];if(Array.isArray(C?.images)&&C.images.forEach(I=>{typeof I=="string"?B.push(I):I?.url&&B.push(I.url)}),C?.image?.url&&B.push(C.image.url),s=Array.from(new Set(B.filter(Boolean))),s.length===0)throw new Error("Upload succeeded but image URL is missing in response.");Qe(100);const mt=((await ht(`/faculty/${o}`))?.days||[]).find(I=>(I?._id??I?.id??null)===a);if(!mt)throw new Error("Uploaded image verification failed: day not found.");const xe=i(mt);if(!s.every(I=>xe.includes(I)))throw new Error("Uploaded image URL was not found in shortReport.images after upload.")}const p=s.length>0?Array.from(new Set([...n,...s])):n,g=he.trim(),x=ee.trim(),A=fe||c.date||"",v={...c,dayNumber:c.dayNumber,date:A,approved:1,images:p};(c?.shortReport||g||x||p.length>0)&&(v.shortReport={title:g||c.shortReport?.title||"Report",description:x||c.shortReport?.description||"",images:p,date:c.shortReport?.date||new Date().toISOString()}),await O(`/faculty/${o}/days/${a}`,v);try{const S=l?{...l,days:Array.isArray(l.days)?l.days.map(C=>(C?._id??C?.id??null)===a?{...C,...v}:C):[v]}:null;S&&($(S),await X(S)),u.success(`Day saved with ${p.length} image(s).`),se(null),ne()}catch(S){console.error("Failed to update local faculty state:",S),u.success(`Day saved with ${p.length} image(s).`),se(null),ne()}}catch(a){u.error(a.message||"Something went wrong.")}finally{y(!1),Qe(0)}}},[c,he,ee,fe,H,o,l,z,pe,ne,X,Yt]),Lr=t=>{const a=Array.from(t.target.files),n=["image/jpeg","image/jpg","image/png","image/webp","image/gif"],i=a.filter(s=>n.includes(s.type)?s.size>5*1024*1024?(u.warning(`${s.name} is too large. Maximum size is 5MB.`),!1):!0:(u.warning(`${s.name} is not a valid image file. Only JPEG, PNG, WebP and GIF are allowed.`),!1));ye(s=>[...s,...i]),i.forEach(s=>{const p=new FileReader;p.onload=()=>{we(g=>[...g,{id:s.lastModified,src:p.result,name:s.name}])},p.readAsDataURL(s)})},Mr=t=>{ye(a=>a.filter(n=>n.lastModified!==t)),we(a=>a.filter(n=>n.id!==t))},Fr=t=>{const a=["image/jpeg","image/jpg","image/png","image/webp","image/gif"],n=t.filter(i=>a.includes(i.type)?i.size>5242880?(u.warning(`${i.name} is too large. Maximum size is 5MB.`),!1):!0:(u.warning(`${i.name} is not a valid image file. Only JPEG, PNG, WebP and GIF are allowed.`),!1));ye(i=>[...i,...n]),n.forEach(i=>{const s=new FileReader;s.onload=()=>{we(p=>[...p,{id:i.lastModified,src:s.result,name:i.name}])},s.readAsDataURL(i)})},Tr=t=>{t.preventDefault(),t.stopPropagation()},Pr=t=>{t.preventDefault(),t.stopPropagation(),Dt(!0)},Br=t=>{t.preventDefault(),t.stopPropagation(),Dt(!1)},_r=t=>{t.preventDefault(),t.stopPropagation(),Dt(!1);const a=Array.from(t.dataTransfer.files);a.length>0&&Fr(a)},Ur=r.useCallback(async()=>{if(!c)return;const t=z(c)??(b!=null?String(b):null);if(!t){u.error("Day could not be identified.");return}y(!0);try{await O(`/faculty/${o}/days/${t}/approve`,{approved:2});const a=await w({silent:!0});await F(a),u.success("Saved.")}catch(a){u.error(a.message||"Something went wrong.")}finally{y(!1)}},[c,b,o,w,z,F]),Or=r.useCallback(async()=>{if(!c)return;const t=z(c)??(b!=null?String(b):null);if(!t){u.error("Day could not be identified.");return}y(!0);try{await O(`/faculty/${o}/days/${t}/approve`,{approved:3});const a=await w({silent:!0});await F(a),u.success("Saved.")}catch(a){u.error(a.message||"Something went wrong.")}finally{y(!1)}},[c,b,o,w,z,F]),Wr=r.useCallback(async t=>{if(t.preventDefault(),!ct){u.error("You are not allowed to post comments.");return}const a=Ke.trim();if(!(!a||!c)){y(!0);try{const n=z(c)??(b!=null?String(b):null);if(!n)throw new Error("Day could not be identified.");const i={text:a,date:new Date().toISOString(),userID:d?.id||d?._id||"anonymous"};await Ve(`/faculty/${o}/days/${n}/comments`,i),await w({silent:!0}),yt(""),u.success("Comment added.")}catch{try{const n={text:a,date:new Date().toISOString(),userID:d?.id||d?._id||"anonymous"},i=[...c.comments||[],n];await Ka(c,{...c,comments:i},b),yt("")}catch(n){u.error(n.message||"Failed to add comment.")}}finally{y(!1)}}},[ct,c,Ke,Ka,b,d,o,w,z]),Ja=r.useCallback(async(t,a)=>{const n=a.trim();if(!n||!c)return;const i=z(c)??(b!=null?String(b):null);if(!i){u.error("Day could not be identified.");return}y(!0);try{await O(`/faculty/${o}/days/${i}/comments/${t}`,{text:n}),tt(null),Ae(""),await w({silent:!0}),u.success("Comment updated.")}catch(s){u.error(s.message||"Failed to update comment.")}finally{y(!1)}},[c,b,o,w,z]),Yr=r.useCallback(async t=>{if(!c||!window.confirm("Delete this comment?"))return;const a=z(c)??(b!=null?String(b):null);if(!a){u.error("Day could not be identified.");return}y(!0);try{await Qa(`/faculty/${o}/days/${a}/comments/${t}`),await w({silent:!0}),u.success("Comment deleted.")}catch(n){u.error(n.message||"Failed to delete comment.")}finally{y(!1)}},[c,b,o,w,z]),qa=r.useCallback(()=>{It(new Date().toISOString().slice(0,10)),Ne(!0)},[]),Vr=r.useCallback(async()=>{y(!0);try{const t={dayNumber:String((j.length||0)+1),date:At,approved:1,shortReport:null,comments:[]};await Ve(`/faculty/${o}/days`,t);const a=await w({silent:!0});await X(a),await F(a),await Ye(o),U(Math.max(0,(a?.days?.length||j.length||1)-1)),u.success("Day added."),Ne(!1),It(new Date().toISOString().slice(0,10))}catch(t){u.error(t.message||"Failed to add day.")}finally{y(!1)}},[o,j.length,At,w,F,X]),Hr=r.useCallback(()=>{De(!0)},[]),Kr=r.useCallback(async()=>{if(!c)return;const t=z(c)??(b!=null?String(b):null);if(!t){u.error("Day could not be identified.");return}y(!0);try{await Qa(`/faculty/${o}/days/${t}`);const a=await w({silent:!0});await X(a),await F(a),await Ye(o),U(n=>Math.max(0,n-1)),u.success("Day deleted."),De(!1)}catch(a){u.error(a.message||"Failed to delete day.")}finally{y(!1)}},[c,b,o,w,z,F,X]),Gr=r.useCallback(()=>{c&&(pa(String(c.date||"").slice(0,10)),Se(!0))},[c]),Jr=r.useCallback(async()=>{if(!c||!Ce)return;const t=z(c);if(!t){u.error("Day could not be identified.");return}y(!0);try{await O(`/faculty/${o}/days/${t}`,{...c,date:Ce});const a=await w({silent:!0});await F(a),await Ye(o),u.success("Date updated."),Se(!1)}catch(a){u.error(a.message||"Failed to update date.")}finally{y(!1)}},[c,Ce,o,Ee,w,z,F]),Za=r.useMemo(()=>!l||!l.days?[]:de?l.days.flatMap((t,a)=>(t.comments||[]).map(n=>({text:n.text||n,date:n.date,userID:n.userID,commentID:n._id,dayIndex:a,dayNumber:t.dayNumber}))):[],[l,de]),Ue=r.useMemo(()=>de?c?.comments||[]:[],[c,de]),qr=r.useCallback(t=>{_e(t),da(!1)},[_e]);return r.useEffect(()=>{if(!Array.isArray(j)||j.length===0||!Number.isInteger(f))return;const t=Math.max(0,Math.min(j.length-1,f));U(t)},[j,f]),r.useEffect(()=>{if(!Array.isArray(j)||j.length===0){b!==0&&U(0);return}b>j.length-1&&U(j.length-1)},[j,b]),r.useEffect(()=>{Ie(!1),ze(!1),Rt(""),rt([]),Lt("all"),Ft("all"),ja(!0)},[o]),r.useEffect(()=>{if(!Xe)return;const{body:t}=document,{scrollY:a}=window,n=t.style.overflow,i=t.style.position,s=t.style.top,p=t.style.width;return t.style.overflow="hidden",t.style.position="fixed",t.style.top=`-${a}px`,t.style.width="100%",()=>{t.style.overflow=n,t.style.position=i,t.style.top=s,t.style.width=p,window.scrollTo(0,a)}},[Xe]),r.useEffect(()=>{if(!dt)return;const t=a=>{a.preventDefault(),a.returnValue=""};return window.addEventListener("beforeunload",t),()=>{window.removeEventListener("beforeunload",t)}},[dt]),r.useEffect(()=>{const t=Pt.current[b];t&&t.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"})},[b,j.length]),r.useEffect(()=>{if(!k||!c||(c.comments||[]).findIndex((i,s)=>Ut(i,s)===String(k))<0)return;ha(String(k));const a=setTimeout(()=>{Ca.current?.scrollIntoView({behavior:"smooth",block:"start"})},140),n=setTimeout(()=>{ha("")},2600);return()=>{clearTimeout(a),clearTimeout(n)}},[c,k,Ut]),G?e.jsxs("div",{className:"ip-page",children:[e.jsx("style",{children:bt}),e.jsxs("div",{className:"ip-shell",children:[e.jsx("button",{type:"button",className:"ip-back",onClick:gt,children:"← Back to dashboard"}),e.jsx(Ht,{variant:"loading",title:"Loading internship details",message:"Preparing days, comments, and attachments...",className:"ip-loading"})]})]}):Y?e.jsxs("div",{className:"ip-page",children:[e.jsx("style",{children:bt}),e.jsxs("div",{className:"ip-shell",children:[e.jsx("button",{type:"button",className:"ip-back",onClick:gt,children:"← Back to dashboard"}),e.jsx(Ht,{variant:"error",title:"Failed to load internship",message:Y,className:"ip-alert"})]})]}):l?e.jsxs("div",{className:"ip-page",children:[e.jsx("style",{children:bt}),e.jsxs("div",{className:"ip-shell",children:[e.jsx("button",{type:"button",className:"ip-back",onClick:gt,children:"← Back to dashboard"}),e.jsxs("header",{className:"ip-hero",children:[e.jsxs("div",{className:"ip-hero-top",children:[e.jsxs("div",{className:"ip-hero-copyblock",children:[e.jsx("span",{className:"ip-eyebrow",children:"Internship workspace"}),e.jsx("input",{className:"ip-input ip-inline-title",value:jt,onChange:t=>ta(t.target.value),disabled:!E,"aria-label":"Internship name"}),e.jsx("p",{className:"ip-hero-copy",children:"Review daily progress, attach evidence, and keep the approval trail clear for everyone involved."})]}),e.jsxs("div",{className:"ip-hero-statuslist","aria-label":"Current internship status",children:[e.jsx("span",{className:"ip-status-pill",children:c?`Day ${c.dayNumber}`:"No day selected"}),e.jsx("span",{className:`ip-status-pill ${W===2?"ip-status-pill--ok":W===3?"ip-status-pill--warn":"ip-status-pill--neutral"}`,children:W===2?"Approved":W===3?"Not approved":"No decision"}),e.jsx("span",{className:`ip-status-pill ip-status-pill--internship-${xt(ve).toLowerCase().replace(/\s+/g,"-")}`,children:xt(ve)}),e.jsx("span",{className:"ip-status-pill",children:ue?"Editable":"Read only"}),e.jsx("span",{className:"ip-status-pill",children:l.plan?"Plan available":"No plan"}),Oa&&!E&&e.jsx("button",{type:"button",className:"ip-status-action",onClick:zr,children:"Edit"}),Oa&&E&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"ip-status-action",onClick:Ir,disabled:h,children:h?"Saving…":"Save"}),e.jsx("button",{type:"button",className:"ip-status-action ip-status-action--cancel",onClick:$r,disabled:h,children:"Cancel"})]})]})]}),e.jsxs("div",{className:"ip-hero-grid",children:[e.jsxs("div",{className:"ip-hero-item",children:[e.jsx("span",{className:"ip-hero-label",children:"Company"}),e.jsx("input",{className:"ip-input ip-inline-field",value:kt,onChange:t=>aa(t.target.value),disabled:!E,"aria-label":"Company"})]}),e.jsxs("div",{className:"ip-hero-item",children:[e.jsx("span",{className:"ip-hero-label",children:"Location"}),e.jsx("input",{className:"ip-input ip-inline-field",value:Nt,onChange:t=>ra(t.target.value),disabled:!E,"aria-label":"Location"})]}),e.jsxs("div",{className:"ip-hero-item",children:[e.jsx("span",{className:"ip-hero-label",children:"Duration"}),E?e.jsxs("div",{className:"ip-duration-pickers",children:[e.jsx(We,{value:qe,onChange:sa,placeholder:"Start date",style:{flex:1}}),e.jsx("span",{className:"ip-duration-sep",children:"—"}),e.jsx(We,{value:Ze,onChange:la,placeholder:"End date",style:{flex:1}})]}):e.jsx("span",{className:"ip-inline-field ip-inline-field--display",children:St||"—"})]}),e.jsxs("div",{className:"ip-hero-item",children:[e.jsx("span",{className:"ip-hero-label",children:"Status"}),e.jsx(ei,{value:ve,onChange:na,disabled:!E,options:si.map(t=>({value:t,label:t})),placeholder:"Status"})]}),e.jsxs("div",{className:"ip-hero-item",children:[e.jsx("span",{className:"ip-hero-label",children:"Progress"}),e.jsxs("div",{className:"ip-progress-stack",children:[e.jsx("span",{className:"ip-progress-chip",style:{color:`hsl(${ge} 76% 30%)`,borderColor:`hsla(${ge}, 75%, 45%, .35)`,background:`linear-gradient(135deg, hsla(${Math.max(0,ge-25)}, 95%, 92%, .95), hsla(${Math.min(120,ge+20)}, 95%, 88%, .95))`},children:Pa}),e.jsx("div",{className:"ip-progress-track","aria-label":`Internship progress ${Pa}`,children:e.jsx("div",{className:"ip-progress-fill",style:{width:`${Be}%`,background:`linear-gradient(90deg, hsl(${Math.max(0,ge-24)} 82% 56%), hsl(${Math.min(120,ge+12)} 80% 44%))`}})}),e.jsxs("span",{className:"ip-progress-meta",children:[Cr,"/",j.length||0," days reported"]})]})]}),e.jsxs("div",{className:"ip-hero-item","aria-label":"Internship tutor",children:[e.jsxs("div",{className:"ip-tutor-head",children:[e.jsx("span",{className:"ip-summary-label",children:_.count>1?"Tutors":"Tutor"}),e.jsx("span",{className:"ip-tutor-badge",children:_.count>1?`${_.count} tutors appended`:"Assigned"})]}),_.hasInfo?e.jsx("div",{className:"ip-tutor-body",children:_.count>1?e.jsxs("div",{className:"ip-tutor-compact",style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx("div",{style:{display:"flex",alignItems:"center",gap:12},children:e.jsx("div",{className:"ip-tutor-compact-text",children:e.jsxs("div",{className:"ip-tutor-name-compact",children:[_.count," tutors appended"]})})}),e.jsx("div",{children:e.jsx("button",{type:"button",className:"ip-eye-btn",onClick:_t,"aria-label":"View tutors",children:"👁"})})]}):(()=>{const t=_.tutors&&_.tutors[0]||{initials:_.initials,name:_.name,contact:_.contact};return e.jsxs("div",{className:"ip-tutor-list",style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs("div",{style:{display:"flex",gap:12,alignItems:"center",minWidth:0},children:[e.jsx("div",{className:"ip-tutor-avatar",children:t.initials}),e.jsx("div",{style:{minWidth:0},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("strong",{className:"ip-tutor-name",style:{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:t.name||"No information"}),e.jsx("span",{style:{color:"var(--t2, #5a6278)",fontSize:13},children:t.contact||""})]})})]}),e.jsx("div",{children:e.jsx("button",{type:"button",className:"ip-eye-btn",onClick:_t,"aria-label":"View tutors",children:"👁"})})]})})()}):Fe?e.jsx("button",{type:"button",className:"ip-student-action-btn",onClick:_t,children:"Append tutor +"}):e.jsx("p",{className:"ip-tutor-empty",children:"No tutor assigned."}),yr&&K.createPortal(e.jsx("div",{role:"dialog","aria-modal":"true",style:{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2200},onMouseDown:t=>{t.target===t.currentTarget&&Bt(!1)},children:e.jsxs("div",{className:"ip-modal-content ip-modal-content--wide",style:{background:"#fff",borderRadius:12,padding:18,boxShadow:"0 24px 60px rgba(3,7,18,.32)",maxHeight:"86vh",overflow:"auto"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:12},children:[e.jsxs("h3",{style:{margin:0},children:["Assigned tutors (",_.count,")"]}),e.jsx("div",{style:{display:"flex",gap:8},children:e.jsx("button",{type:"button",className:"ip-student-action-btn ip-student-action-btn--ghost",onClick:()=>Bt(!1),children:"Close"})})]}),e.jsx("div",{style:{display:"grid",gap:8},children:(_.tutors||[]).map(t=>e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:8,borderRadius:10,background:"#fafafa",border:"1px solid rgba(0,0,0,.06)"},children:[e.jsxs("div",{style:{display:"flex",gap:12,alignItems:"center"},children:[e.jsx("div",{style:{width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#635bff,#06c9a0)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700},children:t.initials}),e.jsxs("div",{style:{minWidth:0},children:[e.jsx("div",{style:{fontWeight:800},children:t.name}),e.jsx("div",{style:{fontSize:13,color:"var(--t2, #5a6278)"},children:t.contact||"No contact information"})]})]}),Fe&&e.jsx("div",{children:e.jsx("button",{type:"button",className:"ip-student-action-btn",onClick:()=>jr(t.key),children:"Remove"})})]},t.key))}),e.jsxs("div",{style:{marginTop:14},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:10},children:[e.jsx("label",{style:{display:"block",fontSize:13,color:"var(--t3, #9ba3bb)"},children:"Available tutors"}),e.jsxs("span",{style:{fontSize:12,color:"var(--t3, #9ba3bb)"},children:[le.length," total"]})]}),e.jsx("div",{className:"ip-student-manager-list",style:{maxHeight:280},children:(le||[]).length===0?e.jsx("div",{className:"ip-student-manager-empty",children:"No tutors available."}):le.map(t=>{const a=String(t._id||t.id||t.userId||t.login||t.email||""),n=Le().includes(a),i=String(t.name||t.login||t.email||a||"Unnamed tutor"),s=String(t.phone||t.login||t.email||t.role||"").trim();return e.jsxs("label",{className:"ip-student-manager-row ".trim(),style:{cursor:a?"pointer":"default"},children:[e.jsx("input",{type:"checkbox",className:"ip-student-check",checked:n,disabled:!a||h||!Fe,onChange:p=>vr(a,p.target.checked)}),e.jsx("span",{className:`ip-student-check-box ${n?"ip-student-check-box--checked":""}`.trim(),"aria-hidden":"true",children:n&&e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"3",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"20 6 9 17 4 12"})})}),e.jsxs("div",{className:"ip-student-copy ip-student-copy--tutor",children:[e.jsx("div",{className:"ip-student-avatar",children:Jt(i)}),e.jsxs("div",{className:"ip-student-copy-text",children:[e.jsx("div",{className:"ip-student-name",children:i}),e.jsx("div",{className:"ip-student-faculty",children:s||"No contact information"})]})]}),e.jsx("div",{className:"ip-student-manager-actions",children:e.jsx("span",{className:`ip-student-badge ${n?"ip-student-badge--attached":"ip-student-badge--free"}`,children:n?"Assigned":"Available"})})]},a||i)})})]})]})}),document.body),ur&&K.createPortal(e.jsx("div",{role:"dialog","aria-modal":"true","aria-label":"Attached students",style:{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2200},onMouseDown:t=>{t.target===t.currentTarget&&Ie(!1)},children:e.jsxs("div",{style:{background:"#fff",borderRadius:12,padding:18,boxShadow:"0 24px 60px rgba(3,7,18,.32)",maxHeight:"80vh",width:"min(480px, 92vw)",display:"flex",flexDirection:"column",gap:12,overflow:"hidden"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12},children:[e.jsxs("h3",{style:{margin:0,fontSize:16},children:["Students (",M.length," attached)"]}),e.jsx("button",{type:"button",className:"ip-student-action-btn ip-student-action-btn--ghost",onClick:()=>Ie(!1),children:"Close"})]}),e.jsx("div",{style:{overflowY:"auto",flex:1},children:M.length===0?e.jsxs("div",{className:"ip-students-empty-state",children:[e.jsx("p",{className:"ip-students-empty",children:"No students attached to this internship."}),Te&&e.jsx("button",{type:"button",className:"ip-student-action-btn",onClick:()=>{Ie(!1),Ma()},disabled:h||!Array.isArray(N)||N.length===0,children:"Attach students"})]}):e.jsx("ul",{className:"ip-students-list",style:{margin:0,padding:0},children:M.map((t,a)=>{const n=T(t)||`student-${a}`,i=Z(t);return e.jsxs("li",{className:"ip-student-item",children:[e.jsxs("div",{className:"ip-student-copy",children:[e.jsx("span",{className:"ip-student-name",children:i}),V(t)&&e.jsx("span",{className:"ip-student-faculty",children:V(t)})]}),Te&&e.jsx("button",{type:"button",className:"ip-student-action-btn ip-student-action-btn--ghost",onClick:()=>Ha(t),disabled:h,children:"Detach"})]},n)})})})]})}),document.body)]}),pt&&e.jsxs("div",{className:"ip-hero-item",style:{gridColumn:"1 / -1"},children:[e.jsx("span",{className:"ip-hero-label",children:"Location map"}),e.jsx("div",{style:{borderRadius:16,overflow:"hidden",border:"1px solid rgba(0,0,0,.08)",background:"rgba(0,0,0,.03)",boxShadow:"0 10px 30px rgba(99,91,255,.08)"},children:e.jsx("iframe",{title:`Map for ${pt.label}`,src:pt.embedUrl,style:{width:"100%",height:320,border:0,display:"block"},loading:"lazy",referrerPolicy:"no-referrer-when-downgrade"})}),e.jsx("a",{href:pt.linkUrl,target:"_blank",rel:"noreferrer",style:{display:"inline-flex",marginTop:10,alignItems:"center",gap:6,fontSize:12,fontWeight:700,color:"var(--a1)",textDecoration:"none"},children:"Open in maps"})]})]}),e.jsxs("div",{className:"ip-plan-card","aria-label":"Internship plan",children:[e.jsxs("div",{className:"ip-plan-header",children:[e.jsx("span",{className:"ip-hero-label",children:"Plan"}),e.jsx("button",{type:"button",className:"ip-student-action-btn",onClick:()=>ja(t=>!t),children:va?"Close plan":"Open plan"})]}),va&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"ip-format-toolbar",role:"toolbar","aria-label":"Plan text formatting",children:[e.jsx("button",{type:"button",className:"ip-format-btn",disabled:!E,onClick:()=>oe(ot,je,"**","**","bold"),children:"Bold"}),e.jsx("button",{type:"button",className:"ip-format-btn",disabled:!E,onClick:()=>oe(ot,je,"_","_","italic"),children:"H2"}),e.jsx("button",{type:"button",className:"ip-format-btn",disabled:!E,onClick:()=>oe(ot,je,"- ","","List item"),children:"List"})]}),e.jsx("div",{className:"ip-plan-text",children:E?e.jsx("textarea",{ref:ot,className:"ip-input ip-plan-editor",value:Je,onChange:t=>je(t.target.value),rows:10,placeholder:"Internship plan"}):e.jsx("div",{className:"ip-plan-rendered",dangerouslySetInnerHTML:{__html:Zt(Je)}})})]})]}),e.jsxs("div",{className:"ip-hero-duo",children:[e.jsx("div",{className:"ip-students-card","aria-label":"Attached students",children:e.jsxs("div",{className:"ip-students-head",children:[e.jsxs("div",{children:[e.jsx("span",{className:"ip-summary-label",children:"Students"}),e.jsxs("strong",{className:"ip-summary-value",children:[M.length," attached"]})]}),e.jsxs("div",{className:"ip-students-head-actions",children:[Te&&e.jsx("button",{type:"button",className:"ip-student-action-btn",onClick:Ma,disabled:h||!Array.isArray(N)||N.length===0,children:"Manage students"}),e.jsx("button",{type:"button",className:"ip-eye-btn",onClick:()=>Ie(!0),"aria-label":"Show attached students",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("path",{d:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"}),e.jsx("circle",{cx:"12",cy:"12",r:"3"})]})})]})]})}),e.jsx("div",{className:"ip-attendance-card","aria-label":"Attendance",children:e.jsxs("div",{className:"ip-attendance-head",children:[e.jsx("div",{children:e.jsx("strong",{className:"ip-summary-value",children:"Attendance"})}),e.jsx("button",{type:"button",className:"ip-eye-btn",onClick:()=>et(!0),"aria-label":"Open attendance manager",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("path",{d:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"}),e.jsx("circle",{cx:"12",cy:"12",r:"3"})]})})]})})]})]}),(Wa||Vt)&&e.jsxs("div",{className:"ip-actions",children:[Wa&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"ip-btn ip-btn--primary",disabled:!c||h||W===2,onClick:Ur,children:"Approve report"}),e.jsx("button",{type:"button",className:"ip-btn ip-btn--danger",disabled:!c||h||!(W===2||W===1&&ft(c)),onClick:Or,children:"Not approved"})]}),Vt&&e.jsx("button",{type:"button",className:"ip-btn ip-btn--primary",onClick:()=>window.print(),children:"Export PDF"}),Vt&&e.jsx("button",{type:"button",className:"ip-btn ip-btn--primary",onClick:Va,disabled:h||ae,title:"Generate final AI report",children:ae?"Generating…":"Final report"})]}),be&&c&&e.jsxs("div",{className:"ip-report-form-card",children:[e.jsxs("div",{className:"ip-report-form-header",children:[e.jsxs("h4",{className:"ip-report-form-title",children:["Edit day information — Day ",c.dayNumber]}),e.jsx("button",{type:"button",className:"ip-close-btn",onClick:()=>{Ya()},children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),e.jsxs("form",{onSubmit:Er,className:"ip-report-form ip-report-form-wrapper",children:[e.jsx("div",{className:"ip-form-section",children:e.jsxs("div",{className:"ip-field",children:[e.jsx("label",{className:"ip-label",htmlFor:"ip-day-date",children:"Date"}),e.jsx(We,{value:fe,onChange:wt})]})}),e.jsx("div",{className:"ip-form-divider"}),e.jsx("div",{className:"ip-form-section",children:e.jsxs("div",{className:"ip-field",children:[e.jsx("label",{className:"ip-label",htmlFor:"ip-report-title",children:"Title"}),e.jsx("input",{id:"ip-report-title",type:"text",value:he,onChange:t=>Ge(t.target.value),className:"ip-input",placeholder:"Report title"})]})}),e.jsx("div",{className:"ip-form-divider"}),e.jsx("div",{className:"ip-form-section",children:e.jsxs("div",{className:"ip-field",children:[e.jsx("label",{className:"ip-label",htmlFor:"ip-report-desc",children:"Description"}),e.jsxs("div",{className:"ip-format-toolbar",role:"toolbar","aria-label":"Report text formatting",children:[e.jsx("button",{type:"button",className:"ip-format-btn",onClick:()=>oe(Re,J,"**","**","bold"),children:"Bold"}),e.jsx("button",{type:"button",className:"ip-format-btn",onClick:()=>oe(Re,J,"_","_","italic"),children:"Italic"}),e.jsx("button",{type:"button",className:"ip-format-btn",onClick:()=>oe(Re,J,"## ","","Heading"),children:"H2"}),e.jsx("button",{type:"button",className:"ip-format-btn",onClick:()=>oe(Re,J,"- ","","List item"),children:"List"})]}),e.jsx("textarea",{ref:Re,id:"ip-report-desc",value:ee,onChange:t=>J(t.target.value),className:"ip-input ip-textarea",placeholder:"What was done today?",rows:5}),e.jsxs("div",{className:"ip-report-counter",style:{textAlign:"end"},"aria-live":"polite",children:[_a,"/",100," words"]})]})}),e.jsx("div",{className:"ip-form-divider"}),e.jsxs("div",{className:"ip-form-section",children:[e.jsx("label",{className:"ip-label",htmlFor:"ip-report-images",children:"Attachments"}),e.jsxs("div",{className:"ip-image-upload-container",children:[e.jsxs("label",{htmlFor:"ip-report-images",className:`ip-image-upload-area${nr?" drag-active":""}`,onDragOver:Tr,onDragEnter:Pr,onDragLeave:Br,onDrop:_r,children:[e.jsx("input",{id:"ip-report-images",type:"file",multiple:!0,accept:"image/*",onChange:Lr,className:"ip-image-input"}),e.jsxs("div",{className:"ip-upload-content",children:[e.jsx("div",{className:"ip-upload-icon",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}),e.jsx("polyline",{points:"17 8 12 3 7 8"}),e.jsx("line",{x1:"12",y1:"3",x2:"12",y2:"15"})]})}),e.jsx("p",{className:"ip-upload-text",children:"Click to upload or drag and drop"}),e.jsx("p",{className:"ip-upload-hint",children:"SVG, PNG, JPG, GIF (max. 5MB)"})]})]}),ea.length>0&&e.jsx("div",{className:"ip-image-previews-grid",children:ea.map(t=>e.jsxs("div",{className:"ip-image-preview-item",children:[e.jsx("img",{src:t.src,alt:t.name,className:"ip-image-preview"}),e.jsx("button",{type:"button",className:"ip-remove-image-btn",onClick:a=>{a.stopPropagation(),Mr(t.id)},"aria-label":"Remove image",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]},t.id))})]})]}),e.jsxs("div",{className:"ip-form-actions",children:[h&&H.length>0&&ke>0&&e.jsx("div",{className:"ip-progress-bar",children:e.jsx("div",{className:"ip-progress-bar-fill",style:{width:`${ke}%`}})}),e.jsx("button",{type:"button",className:"ip-btn ip-btn--secondary",onClick:()=>{Ya()},children:"Cancel"}),e.jsx("button",{type:"submit",className:"ip-btn ip-btn--primary",disabled:h||!Yt,children:h?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"ip-spinner"}),H.length>0&&ke>0&&ke<100?`Uploading (${ke}%)`:"Saving…"]}):"Save Changes"})]})]})]}),j.length>0?e.jsxs("div",{className:"ip-days",children:[e.jsxs("div",{className:"ip-day-carousel-wrapper",children:[e.jsx("button",{type:"button",className:"ip-carousel-btn ip-carousel-btn--prev",disabled:b===0,onClick:()=>_e(b-1),children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"15 18 9 12 15 6"})})}),e.jsx("div",{className:"ip-carousel",ref:fr,children:e.jsxs("div",{className:"ip-carousel-track",children:[j.map((t,a)=>{const n=gi(t),i={empty:"Empty",submitted:"Sent",missed:"Missed",rejected:"Rejected",approved:"Approved"}[n];return e.jsxs("button",{type:"button",ref:s=>{Pt.current[a]=s},className:`ip-carousel-item ip-carousel-item--${n} ${b===a?"ip-carousel-item--active":""}`,title:`Day ${t.dayNumber}: ${i}`,onClick:()=>_e(a),children:[e.jsxs("span",{className:"ip-carousel-day-number",children:["Day ",t.dayNumber]}),e.jsx("span",{className:"ip-carousel-day-date",children:t.date||"No date"}),e.jsxs("span",{className:`ip-carousel-status-badge ip-carousel-status-badge--${n}`,children:[n==="approved"&&e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"3",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"20 6 9 17 4 12"})}),i]})]},a)}),ue&&e.jsxs("button",{type:"button",ref:t=>{Pt.current[j.length]=t},className:"ip-carousel-add-day",onClick:qa,disabled:h,title:"Add a new internship day",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"12",y1:"5",x2:"12",y2:"19"}),e.jsx("line",{x1:"5",y1:"12",x2:"19",y2:"12"})]}),e.jsx("span",{className:"ip-carousel-add-day-text",children:"Add day"})]})]})}),e.jsx("button",{type:"button",className:"ip-carousel-btn ip-carousel-btn--next",disabled:b>=j.length-1,onClick:()=>_e(b+1),children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"9 18 15 12 9 6"})})})]}),c&&e.jsxs("div",{className:"ip-day-card",children:[e.jsxs("div",{className:"ip-day-header",children:[e.jsxs("div",{children:[e.jsxs("span",{className:"ip-day-title",children:["Day ",c.dayNumber]}),e.jsxs("div",{className:"ip-day-subtitle",children:[c.date||"No date",ue&&e.jsx("button",{type:"button",className:"ip-day-date-edit-btn",onClick:Gr,disabled:h,title:"Change date",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"11",height:"11",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"}),e.jsx("path",{d:"M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"})]})})]})]}),e.jsxs("div",{className:"ip-day-header-actions",children:[e.jsx("span",{className:`ip-day-badge ${W===2?"ip-day-badge--ok":W===3?"ip-day-badge--danger":"ip-day-badge--neutral"}`,children:W===2?e.jsxs(e.Fragment,{children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"14",viewBox:"0 0 24 24",fill:"currentColor",stroke:"none",children:e.jsx("path",{d:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"})}),"Approved"]}):W===3?e.jsxs(e.Fragment,{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("line",{x1:"15",y1:"9",x2:"9",y2:"15"}),e.jsx("line",{x1:"9",y1:"9",x2:"15",y2:"15"})]}),"Not approved"]}):e.jsxs(e.Fragment,{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("line",{x1:"12",y1:"8",x2:"12",y2:"12"}),e.jsx("line",{x1:"12",y1:"16",x2:"12.01",y2:"16"})]}),"No decision"]})}),ue&&e.jsxs("button",{type:"button",className:"ip-day-edit-btn",onClick:Rr,disabled:h,children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M12 20h9"}),e.jsx("path",{d:"M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"})]}),"Edit"]}),ue&&e.jsxs("button",{type:"button",className:"ip-day-delete-btn",onClick:Hr,disabled:h,title:"Delete this day",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polyline",{points:"3 6 5 6 21 6"}),e.jsx("path",{d:"M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"}),e.jsx("path",{d:"M10 11v6"}),e.jsx("path",{d:"M14 11v6"}),e.jsx("path",{d:"M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"})]}),"Delete"]})]})]}),c.shortReport&&e.jsxs("div",{className:"ip-report",children:[e.jsx("h4",{className:"ip-report-title",children:c.shortReport.title||"Untitled"}),e.jsx("div",{className:"ip-report-desc",dangerouslySetInnerHTML:{__html:Zt(c.shortReport.description||"")}}),Ba.length>0&&e.jsx("div",{className:"ip-report-images",children:Ba.map((t,a)=>e.jsx("button",{type:"button",className:"ip-report-img-btn",onClick:()=>Ct(t),children:e.jsx("img",{src:t,alt:`Report ${a+1}`,className:"ip-report-img"})},a))})]}),(Ue.length>0||ct)&&e.jsxs("div",{className:"ip-comments",ref:Ca,children:[e.jsxs("h4",{className:"ip-comments-title",children:["Comments (",Ue.length||0,")"]}),Ue&&Ue.length>0&&e.jsx("ul",{className:"ip-comments-list",children:Ue.map((t,a)=>{const n=!!t._id&&(Me(d?.role)==="admin"||Me(d?.role)==="developer"||String(d?.id||d?._id||"")===String(typeof t.userID=="object"?t.userID?._id||t.userID?.id||"":t.userID||"")),i=typeof t.userID=="object"?t.userID:null,s=i?`${i.name} ${i.surname}`:"Unknown User",p=i?i.role:"",g=Ut(t,a),x=gr===t._id;return e.jsxs("li",{className:`ip-comment ${cr===g?"ip-comment--focus":""}`,children:[e.jsxs("div",{className:"ip-comment-header",style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px",fontSize:"12px",color:"var(--t3, #9ba3bb)"},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{fontWeight:600,color:"var(--t1, #0c0e18)",marginBottom:"4px"},children:[s," ",p&&e.jsxs("span",{style:{fontSize:"11px",fontWeight:500,color:"var(--a1, #635bff)"},children:["(",p,")"]})]}),e.jsxs("div",{children:[new Date(t.date).toLocaleDateString()," ",new Date(t.date).toLocaleTimeString()]})]}),n&&!x&&e.jsxs("div",{style:{display:"flex",gap:"4px"},children:[e.jsx("button",{type:"button",style:{background:"none",border:"none",cursor:"pointer",fontSize:"12px",color:"var(--a1, #635bff)",padding:"2px 6px"},onClick:()=>{tt(t._id),Ae(t.text)},children:"Edit"}),e.jsx("button",{type:"button",style:{background:"none",border:"none",cursor:"pointer",fontSize:"12px",color:"var(--error, #e53e3e)",padding:"2px 6px"},disabled:h,onClick:()=>Yr(t._id),children:"Delete"})]})]}),x?e.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[e.jsx("input",{type:"text",value:at,onChange:A=>Ae(A.target.value),className:"ip-input",style:{flex:1},autoFocus:!0,onKeyDown:A=>{A.key==="Enter"&&Ja(t._id,at),A.key==="Escape"&&(tt(null),Ae(""))}}),e.jsx("button",{type:"button",className:"ip-btn ip-btn--primary",disabled:h||!at.trim(),onClick:()=>Ja(t._id,at),children:"Save"}),e.jsx("button",{type:"button",className:"ip-btn ip-btn--secondary",disabled:h,onClick:()=>{tt(null),Ae("")},children:"Cancel"})]}):e.jsx("p",{style:{margin:0},children:t.text})]},t._id||a)})}),ct&&e.jsxs("form",{className:"ip-comment-form",onSubmit:Wr,children:[e.jsx("input",{type:"text",value:Ke,onChange:t=>yt(t.target.value),placeholder:"Add a comment…",className:"ip-input"}),e.jsx("button",{type:"submit",className:"ip-btn ip-btn--primary",disabled:h||!Ke.trim(),children:"Post"})]})]})]})]}):e.jsxs("div",{className:"ip-empty-card",children:[e.jsx("p",{style:{margin:"0 0 16px 0"},children:"No days recorded for this internship yet."}),ue&&e.jsx("button",{type:"button",className:"ip-btn ip-btn--primary",disabled:h,onClick:qa,children:h?"Adding…":"Add first day"})]}),ir&&e.jsxs("div",{className:"ip-feedback-view",children:[e.jsxs("div",{className:"ip-feedback-header",children:[e.jsx("h3",{className:"ip-feedback-title",children:"All Comments"}),e.jsx("button",{type:"button",className:"ip-btn ip-btn--secondary",onClick:()=>da(!1),children:"Back to Days"})]}),Za.length>0?e.jsx("ul",{className:"ip-comments-list",children:Za.map((t,a)=>{const n=typeof t.userID=="object"?t.userID:null,i=n?`${n.name} ${n.surname}`:"Unknown User",s=n?n.role:"";return e.jsxs("li",{className:"ip-comment",children:[e.jsxs("div",{className:"ip-comment-header",children:[e.jsxs("div",{style:{flex:1},children:[e.jsxs("div",{style:{fontWeight:600,color:"var(--t1, #0c0e18)",marginBottom:"4px"},children:[i," ",s&&e.jsxs("span",{style:{fontSize:"11px",fontWeight:500,color:"var(--a1, #635bff)"},children:["(",s,")"]})]}),e.jsxs("span",{className:"ip-comment-day",children:["Day ",t.dayNumber," •"," ",new Date(t.date).toLocaleDateString()," ",new Date(t.date).toLocaleTimeString()]})]}),e.jsx("button",{type:"button",className:"ip-comment-navigate-btn",onClick:()=>qr(t.dayIndex),children:"Go to day"})]}),e.jsx("p",{className:"ip-comment-text",children:t.text})]},t.commentID||a)})}):e.jsx("div",{className:"ip-empty-state",children:"No comments found"})]}),Xe&&typeof document<"u"&&K.createPortal(e.jsxs("div",{className:"ip-image-modal",onClick:()=>Ct(""),children:[e.jsx("button",{type:"button",className:"ip-image-modal-close",onClick:()=>Ct(""),"aria-label":"Close image preview",children:"×"}),e.jsx("img",{src:Xe,alt:"Full size report",className:"ip-image-modal-content",onClick:t=>t.stopPropagation()})]}),document.body),or&&typeof document<"u"&&K.createPortal(e.jsx("div",{className:"ip-modal-overlay",onClick:()=>Ne(!1),children:e.jsxs("div",{className:"ip-modal-content",onClick:t=>t.stopPropagation(),children:[e.jsxs("div",{className:"ip-modal-header",children:[e.jsx("h3",{className:"ip-modal-title",children:"Add New Day"}),e.jsx("button",{type:"button",className:"ip-close-btn",onClick:()=>Ne(!1),children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),e.jsxs("div",{className:"ip-modal-body",children:[e.jsx("label",{className:"ip-label",htmlFor:"new-day-date",children:"Select date for the new day"}),e.jsx(We,{value:At,onChange:It,placeholder:"Select date for the new day"})]}),e.jsxs("div",{className:"ip-modal-footer",children:[e.jsx("button",{type:"button",className:"ip-btn ip-btn--secondary",onClick:()=>Ne(!1),children:"Cancel"}),e.jsx("button",{type:"button",className:"ip-btn ip-btn--primary",onClick:Vr,disabled:h,children:h?"Adding…":"Add Day"})]})]})}),document.body),sr&&typeof document<"u"&&K.createPortal(e.jsx("div",{className:"ip-modal-overlay",onClick:()=>Se(!1),children:e.jsxs("div",{className:"ip-modal-content",onClick:t=>t.stopPropagation(),children:[e.jsxs("div",{className:"ip-modal-header",children:[e.jsx("h3",{className:"ip-modal-title",children:"Change Day Date"}),e.jsx("button",{type:"button",className:"ip-close-btn",onClick:()=>Se(!1),children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),e.jsxs("div",{className:"ip-modal-body",children:[e.jsxs("label",{className:"ip-label",htmlFor:"edit-day-date",children:["Select new date for Day ",c?.dayNumber]}),e.jsx(We,{value:Ce,onChange:pa,placeholder:"Select new date"})]}),e.jsxs("div",{className:"ip-modal-footer",children:[e.jsx("button",{type:"button",className:"ip-btn ip-btn--secondary",onClick:()=>Se(!1),children:"Cancel"}),e.jsx("button",{type:"button",className:"ip-btn ip-btn--primary",onClick:Jr,disabled:h||!Ce,children:h?"Saving…":"Save Date"})]})]})}),document.body),lr&&typeof document<"u"&&K.createPortal(e.jsx("div",{className:"ip-modal-overlay",onClick:()=>De(!1),children:e.jsxs("div",{className:"ip-modal-content",onClick:t=>t.stopPropagation(),children:[e.jsxs("div",{className:"ip-modal-header",children:[e.jsx("h3",{className:"ip-modal-title",children:"Delete Day"}),e.jsx("button",{type:"button",className:"ip-close-btn",onClick:()=>De(!1),children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),e.jsx("div",{className:"ip-modal-body",children:e.jsxs("p",{style:{margin:0,color:"var(--t2, #5a6278)",fontSize:14},children:["Are you sure you want to delete ",e.jsxs("strong",{children:["Day ",c?.dayNumber]}),c?.date?` (${c.date})`:"","? This action cannot be undone."]})}),e.jsxs("div",{className:"ip-modal-footer",children:[e.jsx("button",{type:"button",className:"ip-btn ip-btn--secondary",onClick:()=>De(!1),children:"Cancel"}),e.jsx("button",{type:"button",className:"ip-btn ip-btn--danger",onClick:Kr,disabled:h,children:h?"Deleting…":"Delete Day"})]})]})}),document.body),pr&&typeof document<"u"&&K.createPortal(e.jsx("div",{className:"ip-modal-overlay",onClick:()=>et(!1),style:{alignItems:"stretch",justifyContent:"stretch"},children:e.jsxs("div",{className:"ip-modal-content ip-modal-content--wide ip-attendance-modal",onClick:t=>t.stopPropagation(),style:{width:"100vw",height:"100vh",maxWidth:"none",maxHeight:"none",borderRadius:0},children:[e.jsxs("div",{className:"ip-modal-header",children:[e.jsxs("div",{style:{display:"grid",gap:4},children:[e.jsx("h3",{className:"ip-modal-title",children:"Attendance"}),e.jsx("div",{style:{fontSize:12,color:"var(--t2, #5a6278)"},children:"Manage daily presence across all students and days."})]}),e.jsx("button",{type:"button",className:"ip-close-btn",onClick:()=>et(!1),children:"×"})]}),e.jsx("div",{className:"ip-modal-body",style:{display:"grid",gap:14,overflow:"hidden",padding:20},children:ca?e.jsx("div",{className:"ip-empty-state",children:"Loading attendance…"}):ua?e.jsxs("div",{className:"ip-empty-state",children:["Error: ",ua]}):!L||!Array.isArray(L.attendance)||L.attendance.length===0?e.jsx("div",{className:"ip-empty-state",children:"No attendance recorded yet."}):wa?e.jsx("div",{style:{maxHeight:"calc(100vh - 240px)",overflow:"auto"},children:e.jsx(oi,{students:kr,days:Ot,onTogglePresent:Aa,onSave:Ia,saving:zt,hasChanges:Da})}):e.jsx("div",{className:"ip-attendance-table-wrap",style:{maxHeight:"calc(100vh)",overflowX:"scroll",overflowY:"scroll",scrollbarGutter:"stable both-edges",borderRadius:16,border:"1px solid rgba(0,0,0,.08)",background:"rgba(255,255,255,.92)"},children:e.jsx("div",{className:"ip-attendance-day",children:e.jsx("div",{ref:xr,className:"ip-attendance-scroll",style:{minHeight:"420px",userSelect:"none",touchAction:"auto",WebkitOverflowScrolling:"touch"},children:e.jsx("div",{className:"ip-attendance-table-frame",style:{width:`${Ea}px`,minWidth:`${Ea}px`},children:e.jsxs("table",{className:"ip-attendance-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{minWidth:`${st}px`,width:`${st}px`}}),Ot.map(t=>e.jsx("th",{style:{whiteSpace:"nowrap",minWidth:`${lt}px`,width:`${lt}px`,textAlign:"center"},children:e.jsx("div",{style:{textAlign:"center"},children:e.jsx("div",{children:e.jsx("div",{style:{fontWeight:700},children:t.date?new Date(t.date).toLocaleDateString():`Day ${t.dayNumber}`})})})},t.id||t.date))]})}),e.jsx("tbody",{children:(Array.isArray(M)?M:[]).map((t,a)=>{const n=T(t)||`key-${a}`,i=Z(t);return e.jsxs("tr",{children:[e.jsx("td",{style:{minWidth:`${st}px`,width:`${st}px`},children:i}),Ot.map(s=>{const p=(Array.isArray(s.students)?s.students:[]).find(x=>String(x.studentKey||x.studentId||`${x.name}-${x.surname}`).trim()===String(n).trim()),g=!!(p&&p.present);return e.jsx("td",{style:{textAlign:"center",minWidth:`${lt}px`,width:`${lt}px`},children:e.jsx("input",{type:"checkbox",className:"ip-attendance-radio",checked:g,onChange:x=>Aa(s.id,n,x.target.checked),title:"Toggle presence"})},`${s.id||s.date}-${n}`)})]},n)})})]})})})})})}),e.jsxs("div",{className:"ip-modal-footer",children:[e.jsx("button",{type:"button",className:"ip-btn ip-btn--secondary",onClick:()=>et(!1),children:"Close"}),!wa&&L&&Array.isArray(L.attendance)&&L.attendance.length>0&&e.jsx("button",{type:"button",className:"ip-btn ip-btn--primary",onClick:Ia,disabled:!Da||zt||ca,children:zt?"Saving…":"Save attendance"})]})]})}),document.body),mr&&typeof document<"u"&&K.createPortal(e.jsx("div",{className:"ip-modal-overlay",onClick:()=>ze(!1),children:e.jsxs("div",{className:"ip-modal-content ip-modal-content--wide",onClick:t=>t.stopPropagation(),children:[e.jsxs("div",{className:"ip-modal-header",children:[e.jsx("h3",{className:"ip-modal-title",children:"Manage students"}),e.jsx("button",{type:"button",className:"ip-close-btn",onClick:()=>ze(!1),children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),e.jsxs("div",{className:"ip-modal-body",children:[e.jsx("label",{className:"ip-label",htmlFor:"student-search",children:"Search students"}),e.jsx("input",{id:"student-search",type:"text",value:$t,onChange:t=>Rt(t.target.value),className:"ip-input",placeholder:"Search by name or faculty"}),e.jsxs("div",{className:"ip-student-filter-row",children:[e.jsxs("div",{className:"ip-filter-card",children:[e.jsx("label",{className:"ip-label",htmlFor:"student-faculty-filter",children:"Faculty"}),e.jsx(tr,{id:"student-faculty-filter",value:Et,onChange:Lt,options:Nr})]}),e.jsxs("div",{className:"ip-filter-card",children:[e.jsx("label",{className:"ip-label",htmlFor:"student-year-filter",children:"Faculty year"}),e.jsx(tr,{id:"student-year-filter",value:Mt,onChange:Ft,options:Sr})]})]}),e.jsxs("div",{className:"ip-student-manager-meta",children:[e.jsxs("span",{children:[M.length," attached"]}),e.jsxs("span",{children:[Pe.length," matching students"]}),e.jsxs("span",{children:[te.length," selected"]})]}),Pe.length===0?e.jsx("div",{className:"ip-student-manager-empty",children:"No students found."}):e.jsx("div",{className:"ip-student-manager-list",children:Pe.map(({student:t,studentId:a,studentName:n,studentFacultyName:i,studentYear:s,isAttached:p})=>{const g=!!a&&te.includes(a);return e.jsxs("label",{className:"ip-student-manager-row",children:[e.jsx("input",{type:"checkbox",className:"ip-student-check",checked:g,onChange:()=>Dr(a),disabled:h||p||!a,"aria-label":`Select ${n}`}),e.jsx("span",{className:`ip-student-check-box ${g?"ip-student-check-box--checked":""}`.trim(),"aria-hidden":"true",children:g&&e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"3",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"20 6 9 17 4 12"})})}),e.jsxs("div",{className:"ip-student-copy ip-student-copy--student",children:[e.jsx("strong",{className:"ip-student-name",children:n}),i&&e.jsx("span",{className:"ip-student-faculty",children:i}),s&&e.jsxs("span",{className:"ip-student-faculty",children:["Year ",s]})]}),e.jsxs("div",{className:"ip-student-manager-actions",children:[e.jsx("span",{className:`ip-student-badge ${p?"ip-student-badge--attached":"ip-student-badge--free"}`,children:p?"Attached":"Available"}),p&&e.jsx("button",{type:"button",className:"ip-student-action-btn",onClick:x=>{x.preventDefault(),Ha(t)},disabled:h,children:"Detach"})]})]},a||n)})})]}),e.jsxs("div",{className:"ip-modal-footer",children:[e.jsx("button",{type:"button",className:"ip-btn ip-btn--secondary",onClick:()=>ze(!1),children:"Done"}),e.jsx("button",{type:"button",className:"ip-btn ip-btn--primary",onClick:Ar,disabled:h||te.length===0,children:h?"Adding…":`Add selected (${te.length})`})]})]})}),document.body),hr&&typeof document<"u"&&K.createPortal(e.jsx("div",{className:"ip-modal-overlay",onClick:()=>it(!1),children:e.jsxs("div",{className:"ip-modal-content ip-modal-content--wide",onClick:t=>t.stopPropagation(),children:[e.jsxs("div",{className:"ip-modal-header",children:[e.jsx("h3",{className:"ip-modal-title",children:"AI Final Report (30 Days)"}),e.jsx("button",{type:"button",className:"ip-close-btn",onClick:()=>it(!1),"aria-label":"Close final report",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),e.jsxs("div",{className:"ip-modal-body",children:[ae&&e.jsx("div",{className:"ip-final-report-state",children:"Generating report from internship data, daily texts, and photos…"}),!ae&&nt&&e.jsx("div",{className:"ip-final-report-state ip-final-report-state--error",children:nt}),!ae&&!nt&&Tt&&e.jsx("div",{className:"ip-final-report-body",dangerouslySetInnerHTML:{__html:Zt(Tt)}})]}),e.jsxs("div",{className:"ip-modal-footer",children:[e.jsx("button",{type:"button",className:"ip-btn ip-btn--secondary",onClick:()=>it(!1),children:"Close"}),nt&&e.jsx("button",{type:"button",className:"ip-btn ip-btn--primary",onClick:Va,disabled:ae,children:"Retry"}),e.jsx("button",{type:"button",className:"ip-btn ip-btn--primary",onClick:()=>window.print(),disabled:ae||!Tt,children:"Print final report"})]})]})}),document.body)]})]}):e.jsxs("div",{className:"ip-page",children:[e.jsx("style",{children:bt}),e.jsxs("div",{className:"ip-shell",children:[e.jsx("button",{type:"button",className:"ip-back",onClick:gt,children:"← Back to dashboard"}),e.jsx(Ht,{variant:"empty",title:"Internship not found",message:"This internship does not exist or is no longer accessible.",className:"ip-empty"})]})]})}const bt=`
  .ip-page {
    min-height: calc(100vh - 64px);
    padding: clamp(16px, 3vw, 44px);
    background:
      radial-gradient(1200px 600px at 10% 0%, rgba(99,91,255,.12), transparent 60%),
      radial-gradient(900px 520px at 90% 10%, rgba(6,201,160,.10), transparent 55%),
      linear-gradient(180deg, rgba(241,244,250,.92), rgba(255,255,255,1));
  }
  .ip-shell { width: 100%; max-width: 1240px; margin: 0 auto; }
  .ip-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(99,91,255,.08);
    color: var(--a1, #635bff);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .ip-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 20px;
    padding: 8px 0;
    border: none;
    background: none;
    color: var(--a1, #635bff);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: color .2s ease;
  }
  .ip-back:hover { color: var(--a2, #06c9a0); }
  .ip-loading, .ip-empty {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 22px;
    padding: 56px 24px;
    text-align: center;
    color: var(--t2, #5a6278);
    font-size: 15px;
    box-shadow: 0 18px 50px rgba(99,91,255,.10);
  }
  .ip-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 14px;
    border: 1px solid rgba(255,0,0,.18);
    background: rgba(255,0,0,.05);
    color: #8a1f1f;
    padding: 14px 16px;
    font-size: 13px;
  }
  .ip-success {
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 14px;
    border: 1px solid rgba(6,201,160,.3);
    background: rgba(6,201,160,.08);
    color: #047857;
    padding: 14px 16px;
    font-size: 13px;
  }
  .ip-report-form-card {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 22px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 18px 50px rgba(99,91,255,.10);
    backdrop-filter: blur(18px);
  }
  .ip-report-form-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0 0 16px 0;
  }
  .ip-field { margin-bottom: 14px; }
  .ip-form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(clamp(140px,30vw,180px), 1fr));
    gap: clamp(10px,2vw,14px);
  }
  @media(max-width:640px){
    .ip-form-grid {
      grid-template-columns: 1fr;
    }
  }
  .ip-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--t2, #5a6278);
    margin-bottom: 6px;
  }
  .ip-checkbox-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1.5px solid rgba(0,0,0,.08);
    background: linear-gradient(135deg, rgba(99,91,255,.02), rgba(255,255,255,.8));
    cursor: pointer;
    transition: all .2s ease;
  }
  .ip-checkbox-row:hover {
    border-color: rgba(99,91,255,.2);
    background: linear-gradient(135deg, rgba(99,91,255,.04), rgba(255,255,255,.9));
  }
  .ip-checkbox-row--disabled {
    cursor: not-allowed;
    opacity: .8;
  }
  .ip-checkbox {
    margin-top: 2px;
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    accent-color: var(--a1, #635bff);
  }
  .ip-helper-text {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    line-height: 1.4;
    color: var(--t3, #9ba3bb);
  }
  .ip-form-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(99,91,255,.1);
    justify-content: flex-end;
    flex-wrap: wrap;
    width: 100%;
  }
  .ip-form-actions .ip-progress-bar {
    width: 100%;
    flex-basis: 100%;
    margin: 0 0 12px 0;
  }
  .ip-hero {
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,255,255,.84));
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 24px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 18px 60px rgba(99,91,255,.10);
    backdrop-filter: blur(18px);
  }
  .ip-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(600px 220px at 10% 0%, rgba(99,91,255,.10), transparent 60%);
    pointer-events: none;
  }
  .ip-hero-top,
  .ip-hero-summary {
    position: relative;
    z-index: 1;
  }
  .ip-hero-top {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: clamp(12px,3vw,20px);
    align-items: flex-start;
    margin-bottom: clamp(12px,3vw,20px);
  }
  .ip-hero-copyblock { max-width: 560px; }
  .ip-hero-copy {
    margin: clamp(8px,2vw,12px) 0 0;
    color: var(--t2, #5a6278);
    font-size: clamp(13px,2vw,14px);
    line-height: 1.6;
  }
  .ip-hero-statuslist {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: clamp(6px,1vw,8px);
  }
  .ip-status-pill {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 0 clamp(8px,2vw,12px);
    border-radius: 999px;
    background: rgba(99,91,255,.08);
    color: var(--a1, #635bff);
    border: 1px solid rgba(99,91,255,.12);
    font-size: clamp(11px,1.8vw,12px);
    font-weight: 700;
    white-space: nowrap;
  }
  .ip-status-pill--ok { background: rgba(6,201,160,.10); color: #047857; border-color: rgba(6,201,160,.18); }
  .ip-status-pill--warn { background: rgba(245,166,35,.12); color: #b45309; border-color: rgba(245,166,35,.18); }
  .ip-status-pill--neutral { background: rgba(255,255,255,.88); color: var(--t2, #5a6278); border-color: rgba(0,0,0,.10); }
  .ip-status-pill--internship-pending {
    background: rgba(245,166,35,.14);
    color: #9a4f00;
    border-color: rgba(245,166,35,.35);
  }
  .ip-status-pill--internship-in-progress {
    background: rgba(59,130,246,.14);
    color: #1d4ed8;
    border-color: rgba(59,130,246,.35);
  }
  .ip-status-pill--internship-completed {
    background: rgba(34,197,94,.14);
    color: #166534;
    border-color: rgba(34,197,94,.35);
  }
  .ip-status-action {
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(99,91,255,.24);
    background: rgba(255,255,255,.82);
    color: var(--a1, #635bff);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s ease;
  }
  .ip-status-action:hover:not(:disabled) {
    background: #fff;
    border-color: rgba(99,91,255,.45);
  }
  .ip-status-action--cancel {
    color: var(--t2, #5a6278);
    border-color: rgba(0,0,0,.16);
  }
  .ip-hero-title {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: clamp(24px, 4vw, 36px);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--t1, #0c0e18);
    margin: 0;
  }
  .ip-inline-title {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: clamp(24px, 4vw, 36px);
    font-weight: 700;
    letter-spacing: -0.02em;
    padding: 8px 12px;
    margin: 0;
  }
  .ip-inline-field {
    padding: 8px 10px;
    font-size: 14px;
  }
  .ip-inline-field--display {
    display: block;
    padding: 8px 10px;
    font-size: 14px;
    color: var(--t1, #0c0e18);
  }
  .ip-duration-pickers {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .ip-duration-date {
    flex: 1 1 130px;
    min-width: 130px;
    padding: 8px 10px;
    font-size: 14px;
  }
  .ip-duration-sep {
    font-size: 14px;
    color: var(--t3, #9ba3bb);
    flex-shrink: 0;
  }
  .ip-hero-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(clamp(120px,35vw,1fr), 1fr));
    gap: clamp(10px,2vw,18px);
    position: relative;
    z-index: 1;
  }
  @media(max-width:640px){
    .ip-hero-grid {
      grid-template-columns: 1fr;
    }
  }
  .ip-hero-item {
    min-height: clamp(64px,12vw,76px);
    padding: clamp(12px,2vw,16px);
    border-radius: clamp(12px,2vw,16px);
    background: rgba(248,250,255,.92);
    border: 1px solid rgba(99,91,255,.08);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
  }
  .ip-hero-item--full { grid-column: 1 / -1; }
  .ip-hero-label {
    display: block;
    font-size: clamp(10px,1.8vw,11px);
    font-weight: 700;
    letter-spacing: .05em;
    color: var(--t3, #9ba3bb);
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .ip-hero-value { font-size: clamp(12px,2vw,14px); color: var(--t1, #0c0e18); }
  .ip-progress-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .ip-progress-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    min-width: 64px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(0,0,0,.12);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .02em;
  }
  .ip-progress-track {
    width: 100%;
    height: 10px;
    border-radius: 999px;
    background: rgba(15, 23, 42, .08);
    overflow: hidden;
    border: 1px solid rgba(15, 23, 42, .08);
  }
  .ip-progress-fill {
    height: 100%;
    min-width: 0;
    border-radius: 999px;
    transition: width .35s ease, background .35s ease;
  }
  .ip-progress-meta {
    font-size: 11px;
    color: var(--t3, #9ba3bb);
    font-weight: 600;
  }
  .ip-plan-card {
    margin-top: 14px;
    padding: 18px;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(99,91,255,.08), rgba(6,201,160,.05));
    border: 1px solid rgba(99,91,255,.12);
    box-shadow: 0 10px 26px rgba(99,91,255,.08);
  }
  .ip-plan-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }
  .ip-plan-toggle {
    border: 1px solid rgba(99,91,255,.2);
    background: rgba(255,255,255,.75);
    color: var(--a1, #635bff);
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s ease;
    flex-shrink: 0;
  }
  .ip-plan-toggle:hover {
    background: rgba(255,255,255,.95);
    border-color: rgba(99,91,255,.35);
  }
  .ip-plan-text {
    color: var(--t1, #0c0e18);
    font-size: 15px;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
  .ip-plan-editor {
    min-height: 240px;
    width: 100%;
    resize: vertical;
    line-height: 1.7;
    font-size: 15px;
  }
  .ip-plan-rendered {
    min-height: 220px;
    padding: 14px;
    border-radius: 14px;
    border: 1.5px solid rgba(99,91,255,.08);
    background: rgba(255,255,255,.88);
    line-height: 1.75;
    font-size: 15px;
  }
  .ip-plan-rendered h3 {
    margin: 0 0 8px;
    font-size: 18px;
    line-height: 1.3;
    color: var(--t1, #0c0e18);
  }
  .ip-plan-rendered p {
    margin: 0 0 10px;
  }
  .ip-plan-rendered p:last-child {
    margin-bottom: 0;
  }
  .ip-plan-rendered ul {
    margin: 0 0 10px 18px;
    padding: 0;
  }
  .ip-plan-rendered li {
    margin-bottom: 6px;
  }
  .ip-plan-rendered code {
    background: rgba(15,23,42,.08);
    padding: 1px 6px;
    border-radius: 6px;
    font-size: 13px;
  }
  .ip-format-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0 0 10px;
  }
  .ip-format-btn {
    border: 1px solid rgba(99,91,255,.2);
    background: rgba(255,255,255,.84);
    color: var(--a1, #635bff);
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s ease;
  }
  .ip-format-btn:hover {
    background: #fff;
    border-color: rgba(99,91,255,.4);
  }
  .ip-format-btn:disabled {
    opacity: .45;
    cursor: not-allowed;
  }
  .ip-hero-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(clamp(100px,22vw,1fr), 1fr));
    gap: clamp(8px,2vw,12px);
    margin-top: clamp(12px,2vw,18px);
  }
  @media(max-width:768px){
    .ip-hero-summary {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media(max-width:640px){
    .ip-hero-summary {
      grid-template-columns: 1fr;
    }
  }
  .ip-summary-card {
    padding: clamp(10px,2vw,14px) clamp(12px,2vw,16px);
    border-radius: clamp(12px,2vw,16px);
    background: rgba(248,250,255,.95);
    border: 1px solid rgba(99,91,255,.08);
  }
  .ip-summary-card--wide { grid-column: span 2; }
  @media(max-width:768px){
    .ip-summary-card--wide { grid-column: span 1; }
  }
  .ip-summary-label {
    display: block;
    margin-bottom: clamp(4px,1vw,6px);
    font-size: clamp(10px,1.8vw,11px);
    font-weight: 800;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--t3, #9ba3bb);
  }
  .ip-summary-value {
    display: block;
    color: var(--t1, #0c0e18);
    font-size: clamp(12px,2vw,14px);
    line-height: 1.35;
  }
  .ip-students-card {
    margin-top: 14px;
    padding: 14px 16px;
    border-radius: 16px;
    background: rgba(248,250,255,.95);
    border: 1px solid rgba(99,91,255,.08);
  }
  .ip-hero-duo {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
    align-items: start;
  }
  .ip-hero-duo > * {
    min-width: 0;
  }
  .ip-tutor-card {
    margin-top: 14px;
    padding: 14px 16px;
    border-radius: 16px;
    background: rgba(248,250,255,.95);
    border: 1px solid rgba(99,91,255,.08);
  }
  .ip-tutor-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }
  .ip-tutor-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .04em;
    text-transform: uppercase;
    color: #116c52;
    background: rgba(6,201,160,.12);
  }
  .ip-tutor-body {
    display: grid;
    gap: 4px;
  }
  .ip-tutor-list {
    display: grid;
    gap: 10px;
  }
  .ip-tutor-compact {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 10px;
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(248,250,255,.98));
    border: 1px solid rgba(99,91,255,.06);
  }
  .ip-tutor-compact-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ip-tutor-avatar--compact { width: 44px; height: 44px; border-radius: 12px; font-size: 14px; }
  .ip-tutor-compact-text { min-width: 0; }
  .ip-tutor-name-compact { font-weight: 900; font-size: 15px; color: var(--t1, #0c0e18); }
  .ip-tutor-sub { font-size: 13px; color: var(--t2, #5a6278); margin-top: 2px; }
  .ip-tutor-badge { font-size: 12px; padding: 6px 12px; }
  .ip-tutor-empty { font-style: italic; }
  .ip-tutor-entry {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(255,255,255,.82);
    border: 1px solid rgba(0,0,0,.06);
  }
  .ip-tutor-avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg,#635bff,#06c9a0);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', system-ui, sans-serif;
    font-weight: 700;
    color: #fff;
    font-size: 13px;
    flex-shrink: 0;
  }
  .ip-tutor-entry-body {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .ip-tutor-name {
    font-size: 14px;
    font-weight: 800;
    color: var(--t1, #0c0e18);
  }
  .ip-tutor-contact {
    font-size: 12px;
    color: var(--t2, #5a6278);
  }
  .ip-tutor-empty {
    margin: 0;
    font-size: 13px;
    color: var(--t2, #5a6278);
  }
  .ip-students-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .ip-students-head-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ip-eye-btn {
    min-width: 34px;
    height: 34px;
    padding: 0 8px;
    border-radius: 10px;
    border: 1px solid rgba(99,91,255,.22);
    background: rgba(99,91,255,.08);
    color: var(--a1, #635bff);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition: all .2s ease;
  }
  .ip-eye-btn:hover {
    background: rgba(99,91,255,.16);
    border-color: rgba(99,91,255,.35);
  }
  .ip-student-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid rgba(99,91,255,.18);
    background: rgba(99,91,255,.08);
    color: var(--a1, #635bff);
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: background .2s ease, border-color .2s ease, transform .15s ease;
  }
  .ip-student-action-btn svg {
    flex-shrink: 0;
  }
  .ip-eye-chevron {
    transition: transform .2s ease;
  }
  .ip-eye-chevron--open {
    transform: rotate(180deg);
  }
  .ip-student-action-btn:hover:not(:disabled) {
    background: rgba(99,91,255,.14);
    border-color: rgba(99,91,255,.34);
    transform: translateY(-1px);
  }
  .ip-student-action-btn:disabled {
    opacity: .55;
    cursor: not-allowed;
    transform: none;
  }
  .ip-student-action-btn--ghost {
    background: rgba(255,255,255,.84);
    color: var(--t1, #0c0e18);
    border-color: rgba(0,0,0,.12);
  }
  .ip-student-action-btn--ghost:hover:not(:disabled) {
    background: rgba(0,0,0,.03);
    border-color: rgba(0,0,0,.18);
  }
  .ip-students-list-wrap {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px dashed rgba(99,91,255,.2);
  }
  .ip-students-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }
  .ip-student-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(255,255,255,.82);
    border: 1px solid rgba(0,0,0,.06);
  }
  .ip-student-copy {
    min-width: 0;
    display: grid;
    gap: 3px;
  }
  .ip-student-name {
    font-size: 13px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
  }
  .ip-student-faculty {
    font-size: 12px;
    color: var(--t2, #5a6278);
  }
  .ip-students-empty {
    margin: 0;
    font-size: 13px;
    color: var(--t2, #5a6278);
  }
  .ip-students-empty-state {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .ip-modal-content--wide {
    width: min(920px, calc(100vw - 32px));
  }
  .ip-final-report-state {
    padding: 14px 12px;
    border-radius: 12px;
    border: 1px solid rgba(99,91,255,.16);
    background: rgba(99,91,255,.06);
    color: var(--t2, #5a6278);
    font-size: 14px;
    line-height: 1.55;
  }
  .ip-final-report-state--error {
    border-color: rgba(239,68,68,.22);
    background: rgba(239,68,68,.08);
    color: #991b1b;
  }
  .ip-final-report-body {
    max-height: min(64vh, 760px);
    overflow: auto;
    padding: 14px 12px;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,.08);
    background: rgba(255,255,255,.95);
    color: var(--t1, #0c0e18);
    line-height: 1.7;
    font-size: 14px;
  }
  .ip-final-report-body p {
    margin: 0 0 10px;
  }
  .ip-final-report-body p:last-child {
    margin-bottom: 0;
  }
  .ip-final-report-body h3 {
    margin: 0 0 8px;
    font-size: 18px;
    line-height: 1.35;
  }
  .ip-final-report-body ul {
    margin: 0 0 10px 18px;
    padding: 0;
  }
  .ip-final-report-body li {
    margin-bottom: 6px;
  }
  .ip-student-manager-meta {
    display: flex;
    flex-wrap: wrap;
    gap: clamp(6px,1vw,10px);
    margin: clamp(8px,2vw,12px) 0 clamp(4px,1vw,8px);
    font-size: clamp(11px,1.8vw,12px);
    color: var(--t3, #9ba3bb);
  }
  .ip-student-filter-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(clamp(140px,40vw,1fr), 1fr));
    gap: clamp(10px,2vw,12px);
    margin-top: clamp(8px,2vw,12px);
  }
  @media(max-width:820px){
    .ip-student-filter-row {
      grid-template-columns: 1fr;
    }
  }
  .ip-filter-card {
    display: grid;
    gap: clamp(6px,1vw,8px);
    padding: clamp(8px,1.5vw,10px);
    border-radius: 12px;
    border: 1px solid rgba(99,91,255,.14);
    background: linear-gradient(180deg, rgba(255,255,255,.92), rgba(248,250,255,.92));
  }
  .ip-custom-select {
    position: relative;
  }
  .ip-custom-trigger {
    width: 100%;
    min-height: 44px;
    border-radius: 12px;
    border: 1.5px solid rgba(99,91,255,.2);
    background: rgba(255,255,255,.95);
    color: var(--t1, #0c0e18);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 600;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    cursor: pointer;
    transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
  }
  .ip-custom-trigger:hover {
    border-color: rgba(99,91,255,.42);
    background: rgba(255,255,255,.98);
  }
  .ip-custom-trigger--open {
    border-color: rgba(99,91,255,.58);
    box-shadow: 0 0 0 4px rgba(99,91,255,.14);
  }
  .ip-custom-trigger-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ip-custom-chevron {
    width: 8px;
    height: 8px;
    border-right: 2px solid rgba(76,86,122,.85);
    border-bottom: 2px solid rgba(76,86,122,.85);
    transform: rotate(45deg);
    transition: transform .2s ease;
    flex-shrink: 0;
    margin-top: -2px;
  }
  .ip-custom-chevron--open {
    transform: rotate(-135deg);
    margin-top: 3px;
  }
  .ip-custom-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 20;
    border-radius: 12px;
    border: 1px solid rgba(99,91,255,.2);
    background: rgba(255,255,255,.98);
    box-shadow: 0 18px 40px rgba(12,14,24,.12);
    max-height: 240px;
    overflow: auto;
    padding: 6px;
  }
  .ip-custom-menu--tutor {
    max-height: 300px;
    padding: 8px;
    border-color: rgba(6,201,160,.2);
    background: linear-gradient(180deg, rgba(255,255,255,.99), rgba(248,250,255,.96));
  }
  .ip-custom-option {
    width: 100%;
    border: none;
    background: transparent;
    border-radius: 10px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: var(--t1, #0c0e18);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  .ip-custom-option--tutor {
    padding: 10px 12px;
    border-radius: 14px;
    align-items: center;
  }
  .ip-custom-option:hover {
    background: rgba(99,91,255,.08);
  }
  .ip-custom-option--selected {
    background: linear-gradient(135deg, rgba(99,91,255,.12), rgba(6,201,160,.12));
    color: #4338ca;
  }
  .ip-custom-option--tutor.ip-custom-option--selected {
    background: linear-gradient(135deg, rgba(99,91,255,.16), rgba(6,201,160,.14));
    color: #312e81;
  }
  .ip-custom-option-tutor {
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ip-custom-option-avatar {
    width: 38px;
    height: 38px;
    flex: 0 0 auto;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .04em;
    box-shadow: 0 8px 18px rgba(99,91,255,.16);
  }
  .ip-custom-option-copy {
    min-width: 0;
    display: grid;
    gap: 2px;
  }
  .ip-custom-option-title {
    min-width: 0;
    text-align: left;
    font-size: 13px;
    font-weight: 800;
    color: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    }
    .ip-custom-option-subtitle {
      text-align: left;
    min-width: 0;
    font-size: 11px;
    font-weight: 600;
    color: var(--t3, #9ba3bb);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ip-custom-option-mark {
    font-size: 12px;
    font-weight: 800;
    color: #4338ca;
  }
  .ip-student-manager-list {
    display: grid;
    gap: 10px;
    margin-top: 14px;
    max-height: min(54vh, 520px);
    overflow: auto;
    padding-right: 4px;
  }
  .ip-student-manager-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid rgba(0,0,0,.08);
    background: rgba(248,250,255,.9);
  }
  .ip-student-manager-row:has(.ip-student-check:checked) {
    border-color: rgba(99,91,255,.34);
    box-shadow: 0 0 0 3px rgba(99,91,255,.08);
  }
  .ip-student-check {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }
  .ip-student-check-box {
    width: 18px;
    height: 18px;
    border-radius: 6px;
    border: 1.5px solid rgba(99,91,255,.32);
    background: rgba(255,255,255,.94);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: inset 0 1px 2px rgba(255,255,255,.9);
    transition: all .2s ease;
    cursor: pointer;
  }
  .ip-student-check-box--checked {
    border-color: rgba(6,201,160,.45);
    background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
    box-shadow: 0 8px 18px rgba(99,91,255,.18);
  }
  .ip-student-check:focus-visible + .ip-student-check-box {
    box-shadow: 0 0 0 4px rgba(99,91,255,.18), inset 0 1px 2px rgba(255,255,255,.9);
  }
  .ip-student-check:disabled + .ip-student-check-box {
    opacity: .5;
    cursor: not-allowed;
  }
  .ip-student-check-box svg {
    width: 12px;
    height: 12px;
  }
  .ip-student-copy {
    display: grid;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }
  .ip-student-copy--tutor {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ip-student-copy--student {
    gap: 3px;
  }
  .ip-student-avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg,#635bff,#06c9a0);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }
  .ip-student-copy-text {
    min-width: 0;
    display: grid;
    gap: 2px;
  }
  .ip-student-manager-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    margin-left: auto;
  }
  .ip-student-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .04em;
    text-transform: uppercase;
  }
  .ip-student-badge--attached {
    color: #116c52;
    background: rgba(6,201,160,.12);
  }
  .ip-student-badge--free {
    color: #7a5417;
    background: rgba(255,193,7,.16);
  }
  .ip-student-manager-empty {
    margin-top: 14px;
    padding: 16px;
    border-radius: 14px;
    background: rgba(248,250,255,.9);
    border: 1px dashed rgba(99,91,255,.24);
    color: var(--t2, #5a6278);
    font-size: 13px;
  }
  .ip-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 24px;
    position: sticky;
    top: 12px;
    z-index: 5;
    padding: 12px;
    border-radius: 18px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(0,0,0,.06);
    backdrop-filter: blur(18px);
  }
  .ip-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 12px;
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: transform .15s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
  }
  .ip-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
  .ip-btn--primary {
    border: 1px solid rgba(99,91,255,.18);
    background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
    color: #fff;
    box-shadow: 0 10px 30px rgba(99,91,255,.25);
  }
  .ip-btn--primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 16px 44px rgba(99,91,255,.30);
  }
  .ip-btn--secondary {
    border: 1px solid rgba(0,0,0,.12);
    background: rgba(255,255,255,.8);
    color: var(--t1, #0c0e18);
  }
  .ip-btn--secondary:hover:not(:disabled) { background: rgba(0,0,0,.04); }
  .ip-btn--danger {
    border: 1px solid rgba(239,68,68,.2);
    background: linear-gradient(135deg, rgba(239,68,68,.14), rgba(255,255,255,.95));
    color: #b91c1c;
    box-shadow: 0 10px 24px rgba(239,68,68,.10);
  }
  .ip-btn--danger:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(239,68,68,.18), rgba(255,255,255,.98));
    box-shadow: 0 14px 28px rgba(239,68,68,.14);
    transform: translateY(-1px);
  }
  .ip-days { margin-bottom: clamp(16px,3vw,24px); }
  .ip-day-nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: clamp(8px,2vw,12px);
    margin-bottom: clamp(12px,2vw,16px);
  }
  .ip-day-label {
    font-size: clamp(12px,1.8vw,13px);
    font-weight: 600;
    color: var(--t2, #5a6278);
  }
  .ip-select {
    padding: clamp(8px,1.5vw,10px) clamp(10px,2vw,14px);
    border-radius: 12px;
    border: 1.5px solid rgba(0,0,0,.10);
    background: rgba(0,0,0,.03);
    color: var(--t1, #0c0e18);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: clamp(12px,1.8vw,14px);
    outline: none;
    transition: border-color .2s ease, box-shadow .2s ease;
  }
  .ip-select:focus {
    border-color: rgba(99,91,255,.55);
    box-shadow: 0 0 0 4px rgba(99,91,255,.14);
  }
  .ip-day-btns { display: flex; gap: clamp(6px,1vw,8px); flex-wrap: wrap; }
  .ip-day-card {
    background: rgba(255,255,255,.94);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: clamp(16px,3vw,22px);
    padding: clamp(16px,3vw,24px);
    box-shadow: 0 18px 50px rgba(99,91,255,.10);
    backdrop-filter: blur(18px);
  }
  .ip-day-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: clamp(8px,2vw,12px);
    margin-bottom: clamp(12px,2vw,20px);
    padding-bottom: clamp(10px,2vw,16px);
    border-bottom: 1px solid rgba(0,0,0,.06);
  }
  .ip-day-title {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: clamp(16px,3vw,18px);
    font-weight: 700;
    color: var(--t1, #0c0e18);
  }
  .ip-day-subtitle {
    margin-top: clamp(2px,1vw,4px);
    font-size: clamp(11px,1.8vw,12px);
    color: var(--t3, #9ba3bb);
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .ip-day-date-edit-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--t3, #9ba3bb);
    cursor: pointer;
    border-radius: 4px;
    transition: color .15s, background .15s;
    flex-shrink: 0;
  }
  .ip-day-date-edit-btn:hover:not(:disabled) {
    color: var(--a1, #635bff);
    background: rgba(99,91,255,.1);
  }
  .ip-day-date-edit-btn:disabled {
    opacity: .4;
    cursor: not-allowed;
  }
  .ip-day-header-actions {
    display: inline-flex;
    align-items: center;
    gap: clamp(6px,1vw,8px);
  }
  .ip-day-badge {
    display: inline-flex;
    align-items: center;
    gap: clamp(4px,1vw,6px);
    font-size: clamp(11px,1.8vw,12px);
    font-weight: 600;
    padding: 7px 14px;
    border-radius: 10px;
    transition: all .2s cubic-bezier(0.34, 1.56, 0.64, 1);
    white-space: nowrap;
  }
  .ip-day-badge svg {
    flex-shrink: 0;
  }
  .ip-day-badge--ok {
    background: linear-gradient(135deg, rgba(6,201,160,.12), rgba(6,201,160,.06));
    color: #047857;
    border: 1px solid rgba(6,201,160,.3);
    box-shadow: inset 0 1px 2px rgba(6,201,160,.1), 0 2px 6px rgba(6,201,160,.08);
  }
  .ip-day-badge--ok:hover {
    background: linear-gradient(135deg, rgba(6,201,160,.15), rgba(6,201,160,.08));
    border-color: rgba(6,201,160,.5);
    box-shadow: inset 0 1px 2px rgba(6,201,160,.1), 0 4px 12px rgba(6,201,160,.12);
    transform: translateY(-1px);
  }
  .ip-day-badge--pending {
    background: linear-gradient(135deg, rgba(245,166,35,.12), rgba(245,166,35,.06));
    color: #b45309;
    border: 1px solid rgba(245,166,35,.3);
    box-shadow: inset 0 1px 2px rgba(245,166,35,.1), 0 2px 6px rgba(245,166,35,.08);
  }
  .ip-day-badge--pending:hover {
    background: linear-gradient(135deg, rgba(245,166,35,.15), rgba(245,166,35,.08));
    border-color: rgba(245,166,35,.5);
    box-shadow: inset 0 1px 2px rgba(245,166,35,.1), 0 4px 12px rgba(245,166,35,.12);
    transform: translateY(-1px);
  }
  .ip-day-badge--pending svg {
    animation: pulse-info 2s ease-in-out infinite;
  }
  .ip-day-badge--neutral {
    background: linear-gradient(135deg, rgba(255,255,255,.96), rgba(246,248,252,.96));
    color: var(--t2, #5a6278);
    border: 1px solid rgba(0,0,0,.10);
    box-shadow: inset 0 1px 2px rgba(255,255,255,.7), 0 2px 6px rgba(15,23,42,.06);
  }
  .ip-day-badge--neutral:hover {
    background: linear-gradient(135deg, rgba(255,255,255,.99), rgba(246,248,252,.99));
    transform: translateY(-1px);
  }
  .ip-day-badge--danger {
    background: linear-gradient(135deg, rgba(239,68,68,.14), rgba(239,68,68,.06));
    color: #b91c1c;
    border: 1px solid rgba(239,68,68,.28);
    box-shadow: inset 0 1px 2px rgba(239,68,68,.08), 0 2px 6px rgba(239,68,68,.10);
  }
  .ip-day-badge--danger:hover {
    background: linear-gradient(135deg, rgba(239,68,68,.18), rgba(239,68,68,.08));
    border-color: rgba(239,68,68,.38);
    transform: translateY(-1px);
  }
  .ip-day-edit-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 34px;
    padding: 0 12px;
    border-radius: 10px;
    border: 1px solid rgba(99,91,255,.24);
    background: rgba(99,91,255,.08);
    color: var(--a1, #635bff);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s ease;
    white-space: nowrap;
  }
  .ip-day-edit-btn:hover:not(:disabled) {
    background: rgba(99,91,255,.16);
    border-color: rgba(99,91,255,.36);
  }
  .ip-day-edit-btn:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
  .ip-day-delete-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 34px;
    padding: 0 12px;
    border-radius: 10px;
    border: 1px solid rgba(239,68,68,.24);
    background: rgba(239,68,68,.08);
    color: #b91c1c;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s ease;
    white-space: nowrap;
  }
  .ip-day-delete-btn:hover:not(:disabled) {
    background: rgba(239,68,68,.16);
    border-color: rgba(239,68,68,.36);
  }
  .ip-day-delete-btn:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
  @keyframes pulse-info {
    0%, 100% { opacity: 1; }
    50% { opacity: .6; }
  }
  .ip-report {
    margin-bottom: 20px;
    padding: 18px;
    background: linear-gradient(180deg, rgba(99,91,255,.05), rgba(6,201,160,.03));
    border-radius: 14px;
    border: 1px solid rgba(0,0,0,.06);
  }
  .ip-report-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0 0 8px 0;
  }
  .ip-report-desc {
    font-size: 14px;
    color: var(--t2, #5a6278);
    margin: 0;
    line-height: 1.6;
  }
  .ip-report-desc p {
    margin: 0 0 10px;
  }
  .ip-report-desc p:last-child {
    margin-bottom: 0;
  }
  .ip-report-desc h3 {
    margin: 0 0 8px;
    font-size: 17px;
    line-height: 1.3;
    color: var(--t1, #0c0e18);
  }
  .ip-report-desc ul {
    margin: 0 0 10px 18px;
    padding: 0;
  }
  .ip-report-desc li {
    margin-bottom: 6px;
  }
  .ip-report-desc code {
    background: rgba(15,23,42,.08);
    padding: 1px 6px;
    border-radius: 6px;
    font-size: 13px;
  }
  .ip-report-images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
    margin-top: 14px;
  }
  .ip-report-img {
    width: 100%;
    height: 100px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid rgba(0,0,0,.08);
  }
  .ip-report-img-btn {
    border: none;
    padding: 0;
    background: transparent;
    border-radius: 10px;
    cursor: zoom-in;
  }
  /* Attendance styles */
  .ip-attendance-card {
    margin-top: 16px;
    background: rgba(255,255,255,.94);
    border: 1px solid rgba(0,0,0,.06);
    border-radius: 14px;
    padding: 16px;
  }
  .ip-attendance-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .ip-attendance-actions { display:flex; gap:8px; align-items:center; }
  .ip-attendance-body { }
  .ip-attendance-table-wrap { display: grid; gap: 12px; min-height: 0; }
  .ip-attendance-scroll {
    cursor: grab;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .ip-attendance-scroll::-webkit-scrollbar {
    display: none;
  }
  .ip-attendance-scroll--dragging {
    cursor: grabbing !important;
  }
  .ip-attendance-table-frame {
    width: 700px;
    min-width: 700px;
  }
  .ip-attendance-day {
    border-radius: 12px;
  }
  .ip-attendance-day-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:8px; }
  .ip-attendance-table {
    width: 100%;
    min-width: 700px;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 0;
    margin-top: 8px;
  }
  .ip-attendance-table thead th {
    position: sticky;
    top: 0;
    z-index: 4;
    text-align: left;
    padding: 10px 12px;
    font-size: 12px;
    text-transform: uppercase;
    color: var(--t2,#5a6278);
    background: rgba(246,248,252,.98);
    border-bottom: 1px solid rgba(0,0,0,.08);
    box-shadow: 0 1px 0 rgba(255,255,255,.8) inset;
  }
  .ip-attendance-table thead th:first-child {
    position: sticky;
    left: 0;
    z-index: 6;
    min-width: 260px;
    width: 260px;
    background: rgba(246,248,252,.98);
  }
  .ip-attendance-table thead th:not(:first-child),
  .ip-attendance-table tbody td:not(:first-child) {
    min-width: 132px;
    width: 132px;
  }
  .ip-attendance-table tbody td {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(0,0,0,.06);
    font-size: 14px;
    color: var(--t1,#0c0e18);
    background: #fff;
  }
  .ip-attendance-table tbody tr:nth-child(even) td {
    background: rgba(0,0,0,.02);
  }
  .ip-attendance-table tbody td:first-child {
    position: sticky;
    left: 0;
    z-index: 3;
    min-width: 260px;
    width: 260px;
    box-shadow: 10px 0 16px -14px rgba(12,14,24,.45);
  }
  .ip-attendance-table tbody tr:nth-child(even) td:first-child {
    background: rgba(250, 250, 250);
  }
  .ip-attendance-radio {
    width:18px;
    height:18px;
    appearance:none;
    -webkit-appearance:none;
    border:2px solid rgba(99,91,255,.45);
    border-radius:999px;
    background:#fff;
    display:inline-grid;
    place-content:center;
    cursor:pointer;
    transition:all .18s ease;
  }
  .ip-attendance-radio::before {
    content:'';
    width:8px;
    height:8px;
    border-radius:999px;
    transform:scale(0);
    transition:transform .14s ease;
    background:var(--a1,#635bff);
  }
  .ip-attendance-radio:checked {
    border-color: var(--a1,#635bff);
    box-shadow: 0 0 0 4px rgba(99,91,255,.10);
  }
  .ip-attendance-radio:checked::before { transform:scale(1); }
  .ip-attendance-radio:disabled {
    opacity:.45;
    cursor:not-allowed;
  }

  .ip-comments { margin-top: 20px; }
  .ip-comments-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0 0 12px 0;
  }
  .ip-comments-list { list-style: none; margin: 0; padding: 0; }
  .ip-comment {
    padding: 14px 16px;
    background: rgba(255,255,255,.95);
    border: 1px solid rgba(0,0,0,.06);
    border-radius: 16px;
    font-size: 13px;
    color: var(--t2, #5a6278);
  .ip-comment--focus {
    border-color: rgba(99,91,255,.4);
    background: linear-gradient(135deg, rgba(99,91,255,.14), rgba(6,201,160,.08));
    box-shadow: 0 0 0 3px rgba(99,91,255,.14);
    animation: ipCommentPulse 1.2s ease 1;
  }
  @keyframes ipCommentPulse {
    0% { transform: translateY(0); }
    35% { transform: translateY(-2px); }
    100% { transform: translateY(0); }
  }
    margin-bottom: 8px;
    box-shadow: 0 8px 24px rgba(15,23,42,.04);
  }
  .ip-comment-form {
    display: flex;
    gap: 10px;
    margin-top: 14px;
    align-items: stretch;
  }
  .ip-input {
    padding: 12px 14px;
    border-radius: 14px;
    border: 1.5px solid rgba(0,0,0,.08);
    background: linear-gradient(135deg, rgba(99,91,255,.02), rgba(255,255,255,.8));
    color: var(--t1, #0c0e18);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 14px;
    outline: none;
    transition: all .25s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-sizing: border-box;
    width: 100%;
  }
  .ip-comment-form .ip-input {
    flex: 1;
  }
  .ip-input::placeholder { color: rgba(90,98,120,.5); }
  .ip-input:focus {
    border-color: rgba(99,91,255,.45);
    box-shadow: 0 0 0 5px rgba(99,91,255,.08), inset 0 0 0 1px rgba(99,91,255,.1);
    background: linear-gradient(135deg, rgba(99,91,255,.04), rgba(255,255,255,.95));
  }
  .ip-input:hover:not(:focus) {
    border-color: rgba(99,91,255,.2);
  }
  .ip-empty-card {
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 22px;
    padding: 44px 24px;
    text-align: center;
    color: var(--t2, #5a6278);
    font-size: 14px;
    box-shadow: 0 18px 50px rgba(99,91,255,.10);
  }
  .ip-image-upload-container { margin-top: 12px; }
  .ip-image-upload-area {
    display: block;
    position: relative;
    border: 2px dashed rgba(99,91,255,.25);
    border-radius: 14px;
    padding: 28px 24px;
    text-align: center;
    cursor: pointer;
    background: linear-gradient(135deg, rgba(99,91,255,.04), rgba(6,201,160,.02));
    transition: all .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
  }
  .ip-image-upload-area:hover {
    border-color: rgba(99,91,255,.4);
    background: linear-gradient(135deg, rgba(99,91,255,.08), rgba(6,201,160,.05));
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99,91,255,.12);
  }
  .ip-image-upload-area.drag-active {
    border-color: rgba(99,91,255,.7);
    background: linear-gradient(135deg, rgba(99,91,255,.14), rgba(6,201,160,.08));
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 10px 30px rgba(99,91,255,.2);
  }
  .ip-image-input { display: none; }
  .ip-upload-content {
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .ip-upload-icon {
    font-size: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, rgba(99,91,255,.15), rgba(6,201,160,.08));
    border-radius: 10px;
    margin: 0 auto 6px auto;
    color: var(--a1, #635bff);
  }
  .ip-upload-text {
    margin: 0;
    color: var(--a1, #635bff);
    font-weight: 600;
    font-size: 14px;
  }
  .ip-upload-hint {
    margin: 0;
    color: var(--t3, #9ba3bb);
    font-size: 12px;
  }
  .ip-image-previews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
    margin-top: 16px;
  }
  .ip-image-preview-item {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    background: rgba(0,0,0,.05);
    border: 1px solid rgba(0,0,0,.08);
    aspect-ratio: 1;
    transition: all .2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ip-image-preview-item:hover {
    box-shadow: 0 6px 18px rgba(99,91,255,.12);
    transform: translateY(-2px) scale(1.03);
  }
  .ip-image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .ip-remove-image-btn {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,.95);
    border: 1px solid rgba(0,0,0,.12);
    border-radius: 8px;
    cursor: pointer;
    color: #ef4444;
    padding: 0;
    transition: all .2s cubic-bezier(0.34, 1.56, 0.64, 1);
    opacity: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,.1);
  }
  .ip-image-preview-item:hover .ip-remove-image-btn {
    opacity: 1;
  }
  .ip-remove-image-btn:hover {
    background: #ef4444;
    color: #fff;
    transform: scale(1.15);
    box-shadow: 0 4px 12px rgba(239, 68, 68, .3);
  }
  .ip-image-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,.82);
    z-index: 1110;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(16px, 3vw, 36px);
    overflow: hidden;
    touch-action: none;
  }
  .ip-image-modal-content {
    max-width: calc(100vw - (2 * clamp(16px, 3vw, 36px)));
    max-height: calc(100vh - (2 * clamp(16px, 3vw, 36px)));
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: clamp(0px, 1.2vw, 12px);
    box-shadow: 0 24px 80px rgba(0,0,0,.45);
  }
  .ip-image-modal-close {
    position: absolute;
    top: 18px;
    right: 18px;
    width: 42px;
    height: 42px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.32);
    background: rgba(0,0,0,.42);
    color: #fff;
    font-size: 28px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ip-report-form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .ip-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--t2, #5a6278);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all .2s ease;
  }
  .ip-close-btn:hover {
    background: rgba(0,0,0,.05);
    color: var(--t1, #0c0e18);
  }
  .ip-report-form-wrapper {
    max-width: 560px;
    margin: 0 auto;
  }
  .ip-report-form {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .ip-form-section {
    padding: 20px 0;
  }
  .ip-form-section:first-child {
    padding-top: 0;
  }
  .ip-form-section:last-child {
    padding-bottom: 0;
  }
  .ip-form-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,91,255,.15), transparent);
    margin: 0;
  }
  .ip-textarea {
    resize: vertical;
    font-family: 'Epilogue', system-ui, sans-serif;
    min-height: 140px;
  }
  .ip-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin .8s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .ip-feedback-view {
    background: rgba(255,255,255,.86);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 18px;
    padding: 24px;
    box-shadow: 0 14px 44px rgba(99,91,255,.10);
  }
  .ip-feedback-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(0,0,0,.06);
  }
  .ip-feedback-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0;
  }
  .ip-comment-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }
  .ip-comment-day {
    font-size: 12px;
    font-weight: 600;
    color: var(--t3, #9ba3bb);
  }
  .ip-comment-navigate-btn {
    padding: 4px 10px;
    border-radius: 8px;
    border: 1px solid rgba(99,91,255,.2);
    background: rgba(99,91,255,.08);
    color: var(--a1, #635bff);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s ease;
  }
  .ip-comment-navigate-btn:hover {
    background: rgba(99,91,255,.15);
    border-color: rgba(99,91,255,.4);
  }
  .ip-comment-text { margin: 0; }
  .ip-empty-state {
    text-align: center;
    color: var(--t3, #9ba3bb);
    font-size: 14px;
    padding: 24px;
  }
  .ip-day-carousel-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    margin-bottom: 24px;
    min-width: 0;
  }
  .ip-carousel-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid rgba(99,91,255,.24);
    background: rgba(255,255,255,.95);
    border-radius: 10px;
    cursor: pointer;
    color: var(--a1, #635bff);
    transition: all .2s ease;
    padding: 0;
    flex-shrink: 0;
    z-index: 2;
    box-shadow: 0 8px 18px rgba(99,91,255,.12);
  }
  .ip-carousel-btn:hover:not(:disabled) {
    background: #fff;
    border-color: rgba(99,91,255,.5);
    transform: translateY(-1px) scale(1.03);
  }
  .ip-carousel-btn:disabled {
    opacity: .4;
    cursor: not-allowed;
  }
  .ip-carousel {
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    border-radius: 16px;
    background: rgba(255,255,255,.55);
    border: 1px solid rgba(0,0,0,.06);
    padding: 8px 6px;
    scrollbar-width: none;
  }
  .ip-carousel::-webkit-scrollbar { display: none; }
  .ip-carousel-track {
    display: flex;
    gap: 12px;
    width: max-content;
    min-width: 100%;
    transition: none;
  }
  .ip-carousel-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1.5px solid rgba(99,91,255,.1);
    background: rgba(255,255,255,.7);
    cursor: pointer;
    transition: all .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    min-width: clamp(150px, 28vw, 220px);
    max-width: clamp(150px, 28vw, 220px);
    text-align: center;
    position: relative;
    flex: 0 0 clamp(150px, 28vw, 220px);
  }
  .ip-carousel-item--empty {
    border-color: rgba(99,91,255,.1);
    background: rgba(255,255,255,.7);
    box-shadow: none;
  }
  .ip-carousel-item--submitted {
    border-color: rgba(249, 115, 22, .36);
    background: linear-gradient(135deg, rgba(249, 115, 22, .14), rgba(255, 255, 255, .96));
    box-shadow: 0 10px 24px rgba(249, 115, 22, .14);
  }
  .ip-carousel-item--missed {
    border-color: rgba(239, 68, 68, .42);
    background: linear-gradient(135deg, rgba(239, 68, 68, .16), rgba(255, 255, 255, .96));
    box-shadow: 0 10px 24px rgba(239, 68, 68, .16);
  }
  .ip-carousel-item--rejected {
    border-color: rgba(239, 68, 68, .34);
    background: linear-gradient(135deg, rgba(239, 68, 68, .14), rgba(255, 255, 255, .96));
    box-shadow: 0 10px 24px rgba(239, 68, 68, .14);
  }
  .ip-carousel-item--approved {
    border-color: rgba(34, 197, 94, .34);
    background: linear-gradient(135deg, rgba(34, 197, 94, .14), rgba(255, 255, 255, .96));
    box-shadow: 0 10px 24px rgba(34, 197, 94, .14);
  }
  .ip-carousel-item:hover {
    border-color: rgba(99,91,255,.3);
    background: rgba(255,255,255,.98);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99,91,255,.1);
  }
  .ip-carousel-item--active {
    border-color: rgba(99,91,255,.5);
    background: linear-gradient(135deg, rgba(99,91,255,.12), rgba(6,201,160,.08));
    box-shadow: 0 8px 24px rgba(99,91,255,.15);
  }
  .ip-carousel-item--active.ip-carousel-item--empty {
    box-shadow: 0 12px 28px rgba(245, 158, 11, .18);
  }
  .ip-carousel-item--active.ip-carousel-item--submitted {
    box-shadow: 0 12px 28px rgba(249, 115, 22, .2);
  }
  .ip-carousel-item--active.ip-carousel-item--missed {
    box-shadow: 0 12px 28px rgba(239, 68, 68, .2);
  }
  .ip-carousel-item--active.ip-carousel-item--rejected {
    box-shadow: 0 12px 28px rgba(239, 68, 68, .2);
  }
  .ip-carousel-item--active.ip-carousel-item--approved {
    box-shadow: 0 12px 28px rgba(34, 197, 94, .2);
  }
  .ip-carousel-day-number {
    font-size: 13px;
    font-weight: 700;
    color: var(--a1, #635bff);
  }
  .ip-carousel-day-date {
    font-size: 11px;
    color: var(--t3, #9ba3bb);
  }
  .ip-carousel-status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 22px;
    font-size: 10px;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 6px;
    margin-top: 4px;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(15,23,42,.08);
    transition: all .2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ip-carousel-status-badge--empty {
    background: rgba(255,255,255,.9);
    color: var(--t3, #9ba3bb);
    border: 1px solid rgba(99,91,255,.12);
  }
  .ip-carousel-status-badge--submitted {
    background: linear-gradient(135deg, rgba(249, 115, 22, .18), rgba(249, 115, 22, .08));
    color: #c2410c;
    border: 1px solid rgba(249, 115, 22, .24);
  }
  .ip-carousel-status-badge--missed {
    background: linear-gradient(135deg, rgba(239, 68, 68, .18), rgba(239, 68, 68, .08));
    color: #b91c1c;
    border: 1px solid rgba(239, 68, 68, .24);
  }
  .ip-carousel-status-badge--rejected {
    background: linear-gradient(135deg, rgba(239, 68, 68, .18), rgba(239, 68, 68, .08));
    color: #b91c1c;
    border: 1px solid rgba(239, 68, 68, .24);
  }
  .ip-carousel-status-badge--approved {
    background: linear-gradient(135deg, rgba(6,201,160,.15), rgba(6,201,160,.08));
    color: #047857;
    border: 1px solid rgba(6,201,160,.25);
    box-shadow: 0 2px 4px rgba(6,201,160,.08);
  }
  .ip-carousel-item:hover .ip-carousel-status-badge--empty {
    box-shadow: 0 4px 8px rgba(245, 158, 11, .12);
  }
  .ip-carousel-item:hover .ip-carousel-status-badge--submitted {
    box-shadow: 0 4px 8px rgba(249, 115, 22, .14);
  }
  .ip-carousel-item:hover .ip-carousel-status-badge--missed {
    box-shadow: 0 4px 8px rgba(239, 68, 68, .14);
  }
  .ip-carousel-item:hover .ip-carousel-status-badge--rejected {
    box-shadow: 0 4px 8px rgba(239, 68, 68, .14);
  }
  .ip-carousel-item:hover .ip-carousel-status-badge--approved {
    background: linear-gradient(135deg, rgba(6,201,160,.2), rgba(6,201,160,.12));
    border-color: rgba(6,201,160,.4);
    box-shadow: 0 4px 8px rgba(6,201,160,.12);
  }
  .ip-carousel-item--active .ip-carousel-status-badge--approved {
    background: linear-gradient(135deg, rgba(6,201,160,.25), rgba(6,201,160,.15));
    border-color: rgba(6,201,160,.5);
    box-shadow: 0 4px 12px rgba(6,201,160,.15);
  }
  .ip-carousel-add-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px dashed rgba(99,91,255,.25);
    background: linear-gradient(135deg, rgba(99,91,255,.06), rgba(6,201,160,.03));
    cursor: pointer;
    transition: all .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    min-width: clamp(150px, 28vw, 220px);
    max-width: clamp(150px, 28vw, 220px);
    text-align: center;
    position: relative;
    flex: 0 0 clamp(150px, 28vw, 220px);
    color: var(--a1, #635bff);
    font-size: 13px;
    font-weight: 600;
  }
  .ip-carousel-add-day:hover:not(:disabled) {
    border-color: rgba(99,91,255,.4);
    background: linear-gradient(135deg, rgba(99,91,255,.1), rgba(6,201,160,.06));
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99,91,255,.15);
  }
  .ip-carousel-add-day:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
  .ip-carousel-add-day svg {
    width: 20px;
    height: 20px;
    color: var(--a1, #635bff);
  }
  .ip-carousel-add-day-text {
    font-size: 12px;
    font-weight: 600;
    color: var(--a1, #635bff);
  }
  .ip-progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(0,0,0,.08);
    border-radius: 999px;
    overflow: hidden;
    margin-top: 12px;
  }
  .ip-progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--a1, #635bff), var(--a2, #06c9a0));
    border-radius: 999px;
    transition: width .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 0 10px rgba(99,91,255,.3);
  }
  .ip-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
    animation: fadeIn .2s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .ip-modal-content {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    max-width: 600px;
    width: 90%;
    max-height: min(90vh, 820px);
    display: flex;
    flex-direction: column;
    animation: slideUp .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .ip-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  .ip-modal-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--t1, #0c0e18);
    margin: 0;
  }
  .ip-modal-body {
    padding: 24px 20px;
    overflow: auto;
    flex: 1 1 auto;
  }
  .ip-modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
  }
  .ip-date-input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1.5px solid rgba(0, 0, 0, 0.08);
    background: linear-gradient(135deg, rgba(99, 91, 255, 0.02), rgba(255, 255, 255, 0.8));
    color: var(--t1, #0c0e18);
    font-family: 'Epilogue', system-ui, sans-serif;
    font-size: 14px;
    margin-top: 8px;
    box-sizing: border-box;
    outline: none;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ip-date-input:focus {
    border-color: rgba(99, 91, 255, 0.45);
    box-shadow: 0 0 0 5px rgba(99, 91, 255, 0.08), inset 0 0 0 1px rgba(99, 91, 255, 0.1);
    background: linear-gradient(135deg, rgba(99, 91, 255, 0.04), rgba(255, 255, 255, 0.95));
  }
  .ip-date-input:hover:not(:focus) {
    border-color: rgba(99, 91, 255, 0.2);
  }
  @media (min-width: 640px) {
    .ip-hero-title { font-size: 32px; }
    .ip-hero { padding: 28px; }
    .ip-hero-grid { grid-template-columns: repeat(3, 1fr); }
    .ip-hero-item--full { grid-column: 1 / -1; }
    .ip-image-previews-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
  }
  @media (max-width: 760px) {
    .ip-hero-top { flex-direction: column; }
    .ip-hero-statuslist { justify-content: flex-start; }
    .ip-hero-summary { grid-template-columns: 1fr 1fr; }
    .ip-summary-card--wide { grid-column: 1 / -1; }
    .ip-hero-duo { grid-template-columns: 1fr; gap: 16px; }
    .ip-actions { position: static; }
    .ip-comment-form { flex-direction: column; }
    .ip-plan-card { padding: 16px; }
    .ip-plan-text { font-size: 14px; line-height: 1.7; }
  }
  /* Extra small screen tuning */
  @media (max-width: 480px) {
    .ip-page { padding: 12px; }
    .ip-shell { padding: 0 6px; }
    .ip-hero { padding: 16px; border-radius: 14px; }
    .ip-hero-title { font-size: 20px; }
    .ip-hero-copy { font-size: 13px; }

    .ip-carousel { padding: 6px; }
    .ip-carousel-item { min-width: 120px; max-width: 140px; flex: 0 0 120px; padding: 10px; }
    .ip-carousel-track { gap: 8px; }

    .ip-actions { position: static; padding: 8px; border-radius: 12px; gap: 8px; box-shadow: none; }
    .ip-btn { padding: 10px; font-size: 14px; }

    /* Make attendance table collapse gracefully and allow mobile component to be used */
    .ip-attendance-table-frame, .ip-attendance-table { min-width: 100% !important; width: 100% !important; }
    .ip-attendance-table thead th:first-child, .ip-attendance-table tbody td:first-child { min-width: 140px !important; width: 140px !important; }
    .ip-attendance-table thead th:not(:first-child), .ip-attendance-table tbody td:not(:first-child) { min-width: 80px !important; width: 80px !important; }

    .ip-modal-content { width: 100%; height: 100%; border-radius: 0; max-height: 100vh; }
    .ip-modal-body { padding: 16px; }
    .ip-modal-footer { padding: 12px; }

    .ip-image-preview-item { aspect-ratio: 1 / 1; }
    .ip-report-form-wrapper { max-width: 100%; padding: 0 6px; }
    .ip-report-form-card { padding: 14px; border-radius: 12px; }
    .ip-plan-editor { min-height: 160px; }
    .ip-day-card { padding: 12px; border-radius: 12px; }
    .ip-comment-form { flex-direction: column; gap: 8px; }

    /* Make image modal adapt to screen and allow pinch/zoom gestures */
    .ip-image-modal { padding: 12px; }
    .ip-image-modal-content { max-width: 100%; max-height: 100%; width: auto; height: auto; }

    /* Make buttons block on very small screens to improve tap targets */
    .ip-modal-footer { flex-direction: column-reverse; gap: 10px; align-items: stretch; }
    .ip-modal-footer .ip-btn, .ip-actions .ip-btn { width: 100%; }

    /* Attendance mobile list cards */
    .attendance-mobile-root { padding: 6px 0; }
    .attendance-mobile-card { margin-bottom: 12px; padding: 10px; border-radius: 12px; }
  }
  /* AttendanceMobile component styles (mobile-first) */
  .attendance-mobile-root {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .attendance-mobile-list { display: flex; flex-direction: column; gap: 12px; }
  .attendance-mobile-card {
    background: rgba(255,255,255,.95);
    border: 1px solid rgba(0,0,0,.06);
    border-radius: 12px;
    padding: 12px;
  }
  .attendance-mobile-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .attendance-mobile-initials {
    width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg,#635bff,#06c9a0);
    color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800;
  }
  .attendance-mobile-name { font-weight: 800; color: var(--t1,#0c0e18); font-size: 14px; }
  .attendance-mobile-days { display: flex; gap: 8px; overflow: auto; padding-bottom: 6px; }
  .attendance-mobile-day-badge {
    min-width: 72px; padding: 8px; border-radius: 10px; border: 1px solid rgba(0,0,0,.06);
    background: #fff; display: flex; flex-direction: column; gap: 4px; align-items: center; justify-content: center; cursor: pointer;
  }
  .attendance-mobile-day-badge.present {
    border-color: var(--a1,#635bff); background: linear-gradient(135deg, rgba(99,91,255,.06), rgba(6,201,160,.03)); color: var(--a1,#635bff);
  }
  .attendance-mobile-day-label { font-size: 11px; color: var(--t3,#9ba3bb); white-space: nowrap; }
  .attendance-mobile-day-state { font-size: 16px; font-weight: 800; }
  .attendance-mobile-footer { display: flex; gap: 8px; }

/* Mobile clean theme overrides: remove heavy backgrounds, reduce paddings */
@media (max-width: 760px) {
  .ip-page { background: #fff !important; padding: 8px !important; }
  .ip-shell { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }

  .ip-hero,
  .ip-report-form-card,
  .ip-day-card,
  .ip-summary-card,
  .ip-students-card,
  .ip-tutor-card,
  .ip-attendance-card,
  .ip-plan-card,
  .ip-image-upload-area,
  .ip-student-manager-row,
  .ip-modal-content {
    background: #fff !important;
    border-radius: 8px !important;
    padding: 8px !important;
    box-shadow: none !important;
    border: 1px solid rgba(0,0,0,.06) !important;
    backdrop-filter: none !important;
  }

  .ip-hero::before { display: none !important; }
  .ip-actions { background: transparent !important; box-shadow: none !important; padding: 6px !important; gap: 6px !important; }
  .ip-btn { padding: 10px 12px !important; }
  .ip-form-actions { padding-top: 10px !important; margin-top: 10px !important; }
  .ip-hero-title { font-size: 20px !important; }
  .ip-hero-copy { font-size: 13px !important; }
  .ip-hero-grid, .ip-hero-item { gap: 8px !important; }
  .ip-report-form-wrapper { padding: 0 6px !important; }
  .ip-carousel-item { padding: 6px 8px !important; min-width: 100px !important; max-width: 120px !important; }
  .ip-modal-content { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
}

@media (max-width: 480px) {
  .ip-page { background: #fff !important; padding: 6px !important; }
  .ip-shell { padding: 0 !important; }
  .ip-hero, .ip-day-card, .ip-report-form-card { padding: 6px !important; border-radius: 8px !important; box-shadow: none !important; }
  .ip-hero::before { display: none !important; }
  .ip-hero-title { font-size: 18px !important; }
  .ip-hero-copy { font-size: 12px !important; }
  .ip-plan-editor { min-height: 120px !important; }
  .ip-actions { padding: 6px !important; gap: 6px !important; background: transparent !important; box-shadow: none !important; border: none !important; }
  .ip-modal-content { border-radius: 0 !important; }
  .ip-report-form-card { margin-bottom: 10px !important; }
  .ip-report-form-wrapper { padding: 0 !important; }
  .ip-student-manager-list { max-height: 46vh !important; }
  .attendance-mobile-day-badge { min-width: 64px !important; padding: 6px !important; }
}
`;export{ji as default};
