import{c as X,A as de,e as oe,l as ce,r,t as V,j as e,U as te,C as pe,S as ue}from"./index-B9wUb5OY.js";import{C as ge}from"./ui-DPolIwNU.js";import{u as me}from"./useSEO-IGeWuCVr.js";import{F as U}from"./funnel-CEBQrpA2.js";import{E as R}from"./eye-DdTxNsvW.js";import"./calendar-Dqt64F1I.js";const xe=[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["circle",{cx:"10",cy:"12",r:"2",key:"737tya"}],["path",{d:"m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22",key:"wt3hpn"}]],C=X("file-image",xe);const fe=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],se=X("loader-circle",fe);const he=[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m17 8-5-5-5 5",key:"7q97r8"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}]],z=X("upload",he),be=["image/jpeg","image/png","image/gif","image/webp"],ye=15*1024*1024;function ve(s){return s?be.includes(s.type)?s.size>ye?"Maximum file size is 15MB.":"":"Only JPEG, PNG, GIF, and WebP images are allowed.":"Please choose an image file."}function je(s){if(!s)return null;try{return JSON.parse(s)}catch{return null}}function we(s){return s?.message||s?.data?.message||"Upload failed"}function ae(s,d,c,y){return new Promise((T,m)=>{if(!s){m(new Error("Student ID is required."));return}if(!d){m(new Error("Please choose an image file."));return}const A=new FormData;A.append("image",d);const l=new XMLHttpRequest;l.open("PATCH",`${de}/student/${s}/${c}`);const E=oe();E&&l.setRequestHeader("Authorization",`Bearer ${E}`),l.upload.onprogress=p=>{if(!y)return;if(!p.lengthComputable||!p.total){y(0);return}const _=Math.min(100,Math.round(p.loaded/p.total*100));y(_)},l.onload=()=>{const p=je(l.responseText);if(l.status>=200&&l.status<300){T(p||{});return}if(l.status===401){ce("expired"),m(new Error("Session expired. Please login again."));return}if(l.status===403){m(new Error("You don't have permission to perform this action"));return}m(new Error(we(p)))},l.onerror=()=>{m(new Error("Upload failed"))},l.send(A)})}function Ne(s,d,c){return ae(s,d,"passport-image",c)}function ke(s,d,c){return ae(s,d,"medicine-image",c)}function b(s,d=0){return s?._id||s?.id||s?.studentId||`${s?.name||"student"}-${d}`}function $(s,d){const c=s?.[d]||s?.[`${d}Image`]||s?.[`${d}Url`];return c?typeof c=="string"?c:c?.url?c.url:null:null}const J=20;function Ie({students:s=[],search:d="",onStudentUpdated:c}){me({title:"Students",description:"Manage student documents, passports, and medical records for SIUT internship participants.",noIndex:!0});const[y,T]=r.useState(s),[m,A]=r.useState(!0),[l,E]=r.useState(""),[p,_]=r.useState("all"),[v,G]=r.useState("all"),[j,L]=r.useState("all"),[k,M]=r.useState(()=>b(s[0])),[ie,D]=r.useState(1),[o,q]=r.useState({passport:{loading:!1,progress:0},medicine:{loading:!1,progress:0}});r.useEffect(()=>{if(T(s),s.length===0){M("");return}s.some((a,n)=>b(a,n)===k)||M(b(s[0]))},[s,k]);const B=r.useCallback((t,a,n)=>{const f=[a,n].filter(Boolean).join(": ");if(t==="success"){V.success(f,{duration:3600});return}if(t==="warning"){V.warning(f,{duration:4200});return}V.error(f,{duration:4600})},[]),W=r.useCallback((t,a)=>!!$(t,a),[]),Y=r.useCallback(t=>[t?.name,t?.surname,t?.lastname].filter(Boolean).join(" ").trim(),[]),Z=r.useMemo(()=>Array.from(new Set(y.map(a=>a?.nameFaculty||a?.faculty?.name).filter(Boolean))).sort((a,n)=>a.localeCompare(n)),[y]),x=r.useMemo(()=>{const t=d.trim().toLowerCase(),a=l.trim().toLowerCase(),n=`${t} ${a}`.trim();return y.filter(i=>{const u=i?.nameFaculty||i?.faculty?.name||"",h=W(i,"passport"),I=W(i,"medicine");return p!=="all"&&u!==p||v==="has"&&!h||v==="missing"&&h||j==="has"&&!I||j==="missing"&&I?!1:n?[i?.name,i?.surname,i?.lastname,i?.nameFaculty,i?.faculty?.name,i?.gender,i?.year].filter(Boolean).join(" ").toLowerCase().includes(n):!0}).sort((i,u)=>Y(i).localeCompare(Y(u)))},[Y,W,l,y,j,v,d,p]),F=Math.max(1,Math.ceil(x.length/J)),P=Math.min(ie,F),re=x.slice((P-1)*J,P*J),O=r.useMemo(()=>{let t=0;return l.trim()&&(t+=1),p!=="all"&&(t+=1),v!=="all"&&(t+=1),j!=="all"&&(t+=1),t},[l,j,v,p]),ne=r.useCallback(()=>{E(""),_("all"),G("all"),L("all"),D(1)},[]);r.useEffect(()=>{D(1)},[d,l,p,v,j]);const g=r.useMemo(()=>x.length?x.find((t,a)=>b(t,a)===k)||x[0]:null,[x,k]);r.useEffect(()=>{if(!x.length){k&&M("");return}x.some((a,n)=>b(a,n)===k)||M(b(x[0]))},[x,k]);const K=r.useCallback((t,a)=>{T(n=>{const f=n.map((i,u)=>b(i,u)!==t?i:{...i,...a});if(c){const i=f.find((u,h)=>b(u,h)===t)||null;i&&c(i)}return f})},[c]),Q=r.useCallback(async(t,a)=>{const n=g;if(!n)return;const f=ve(a);if(f){B("error","Validation error",f);return}const i=b(n),u=t==="passport";q(h=>({...h,[t]:{loading:!0,progress:0}}));try{const I=await(u?Ne:ke)(i,a,H=>{q(le=>({...le,[t]:{loading:!0,progress:H}}))}),S=I?.image||null;if(!S)throw new Error("Upload failed");K(i,u?{passport:S,passportImage:S}:{medicine:S,medicineImage:S}),q(H=>({...H,[t]:{loading:!1,progress:100}})),B("success","Upload complete",I?.message||`${u?"Passport":"Medicine"} image uploaded successfully.`)}catch(h){B("error","Upload failed",h?.message||"Upload failed")}finally{setTimeout(()=>{q(h=>({...h,[t]:{loading:!1,progress:0}}))},120)}},[B,g,K]),w=$(g,"passport"),N=$(g,"medicine"),ee=r.useCallback(t=>{t&&window.open(t,"_blank","noopener,noreferrer")},[]);return e.jsxs("div",{className:"student-docs-page",children:[e.jsx("style",{children:`
        .student-docs-page {
          min-height: calc(100vh - 64px);
          padding: clamp(18px, 3vw, 40px);
          background:
            radial-gradient(1200px 520px at 8% 0%, rgba(99,91,255,.12), transparent 55%),
            radial-gradient(900px 520px at 94% 8%, rgba(6,201,160,.12), transparent 52%),
            linear-gradient(180deg, rgba(240,241,247,.72), rgba(255,255,255,1));
        }
        .student-docs-shell {
          max-width: 1420px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(clamp(260px,28vw,410px), 410px) minmax(0, 1fr);
          gap: clamp(16px,2vw,24px);
          align-items: start;
        }
        @media(max-width:1024px){
          .student-docs-shell {
            grid-template-columns: 1fr;
          }
        }
        .student-docs-aside,
        .student-docs-main,
        .student-docs-panel {
          background: rgba(255,255,255,.82);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: clamp(18px,2vw,22px);
          box-shadow: 0 18px 56px rgba(99,91,255,.10);
          backdrop-filter: blur(20px);
        }
        .student-docs-aside {
          overflow: hidden;
        }
        .student-docs-main {
          padding: clamp(16px,3vw,24px);
        }
        .student-docs-head {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          justify-content: space-between;
          gap: clamp(12px,2vw,16px);
          margin-bottom: clamp(12px,2vw,18px);
          padding-bottom: clamp(12px,2vw,18px);
          border-bottom: 1px solid rgba(0,0,0,.06);
        }
        .student-docs-eyebrow {
          margin: 0 0 clamp(4px,1vw,8px) 0;
          font-size: clamp(11px,1.8vw,12px);
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--a1, #635bff);
          display: flex;
          align-items: center;
          gap: clamp(4px,1vw,8px);
        }
        .student-docs-eyebrow::before {
          content: '';
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
        }
        .student-docs-title {
          margin: 0;
          font-family: 'Syne', system-ui, sans-serif;
          font-size: clamp(28px, 4vw, 40px);
          line-height: 1.08;
          color: var(--t1, #0c0e18);
          letter-spacing: -0.03em;
        }
        .student-docs-subtitle {
          margin: 8px 0 0 0;
          color: var(--t2, #5a6278);
          font-size: 14px;
          line-height: 1.55;
          max-width: 720px;
        }
        .student-docs-count {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          padding: 10px 14px;
          background: rgba(99,91,255,.10);
          color: var(--a1, #635bff);
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }
        .student-docs-count svg {
          flex-shrink: 0;
        }
        .student-docs-head-right {
          display: grid;
          gap: 10px;
          justify-items: end;
        }
        .student-docs-quickstats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          width: min(500px, 100%);
        }
        .student-docs-quickstat {
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,.08);
          background: rgba(255,255,255,.76);
          padding: 8px 10px;
          text-align: center;
        }
        .student-docs-quickstat strong {
          display: block;
          font-size: 16px;
          color: var(--t1, #0c0e18);
          font-family: 'Syne', system-ui, sans-serif;
          line-height: 1.1;
        }
        .student-docs-quickstat span {
          display: block;
          margin-top: 3px;
          color: var(--t2, #5a6278);
          font-size: 11px;
          font-weight: 700;
        }
        .student-list-wrap {
          display: flex;
          flex-direction: column;
          min-height: 74vh;
        }
        .student-list-head {
          padding: 20px 20px 16px;
          border-bottom: 1px solid rgba(0,0,0,.06);
        }
        .student-list-head-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .student-filter-toggle {
          min-width: 68px;
          height: 34px;
          border: 1px solid rgba(99,91,255,.24);
          background: linear-gradient(135deg, rgba(99,91,255,.12), rgba(6,201,160,.08));
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 9px;
          cursor: pointer;
          transition: transform .26s cubic-bezier(.22,1,.36,1), box-shadow .26s ease, border-color .2s ease;
        }
        .student-filter-toggle:hover {
          border-color: rgba(99,91,255,.5);
          box-shadow: 0 10px 22px rgba(99,91,255,.18);
          transform: translateY(-1px);
        }
        .student-filter-toggle-main {
          color: var(--a1, #635bff);
          opacity: .95;
        }
        .student-filter-toggle-arrow {
          color: var(--a1, #635bff);
          transition: transform .36s cubic-bezier(.22,1,.36,1);
        }
        .student-filter-toggle.open .student-filter-toggle-arrow {
          transform: rotate(180deg);
        }
        .student-filter-collapse {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transform: translateY(-8px);
          transition: grid-template-rows .42s cubic-bezier(.22,1,.36,1), opacity .28s ease, transform .28s ease;
        }
        .student-filter-collapse.open {
          grid-template-rows: 1fr;
          opacity: 1;
          transform: translateY(0);
        }
        .student-filter-collapse-inner {
          overflow: hidden;
          padding-top: 0;
          transition: padding-top .28s ease;
        }
        .student-filter-collapse.open .student-filter-collapse-inner {
          padding-top: 12px;
        }
        .student-filter-block {
          margin-top: 14px;
          display: grid;
          gap: 12px;
          padding: 12px;
          border-radius: 16px;
          border: 1px solid rgba(99,91,255,.14);
          background:
            linear-gradient(135deg, rgba(99,91,255,.06), rgba(6,201,160,.04));
          box-shadow: inset 0 1px 0 rgba(255,255,255,.72);
        }
        .student-filter-top {
          display: grid;
          gap: 10px;
        }
        .student-filter-search {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 14px;
          border: 1px solid rgba(99,91,255,.2);
          background: rgba(255,255,255,.96);
          padding: 11px 13px;
          box-shadow: 0 10px 20px rgba(99,91,255,.08);
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .student-filter-search:focus-within {
          border-color: rgba(99,91,255,.5);
          box-shadow: 0 0 0 4px rgba(99,91,255,.13);
        }
        .student-filter-search input {
          border: 0;
          background: transparent;
          width: 100%;
          outline: none;
          color: var(--t1, #0c0e18);
          font-size: 13px;
          font-weight: 600;
          font-family: 'Epilogue', system-ui, sans-serif;
        }
        .student-filter-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .student-filter-active {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 800;
          background: rgba(99,91,255,.12);
          color: var(--a1, #635bff);
        }
        .student-filter-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        .student-filter-card {
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,.09);
          background: rgba(255,255,255,.9);
          padding: 10px;
          display: grid;
          gap: 8px;
        }
        .student-filter-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .student-filter-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--t2, #5a6278);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          letter-spacing: .05em;
          text-transform: uppercase;
        }
        .student-filter-card small {
          font-size: 10px;
          color: #8c93a8;
          font-weight: 700;
        }
        .student-filter-select {
          border-radius: 10px;
          border: 1px solid rgba(99,91,255,.18);
          background: rgba(255,255,255,.95);
          color: var(--t1, #0c0e18);
          padding: 9px 10px;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Epilogue', system-ui, sans-serif;
          outline: none;
        }
        .student-filter-segment {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
        }
        .student-filter-chip {
          border: 1px solid rgba(0,0,0,.12);
          background: rgba(255,255,255,.92);
          color: var(--t2, #5a6278);
          border-radius: 10px;
          padding: 8px 6px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all .18s ease;
          text-align: center;
        }
        .student-filter-chip:hover {
          border-color: rgba(99,91,255,.45);
          color: var(--a1, #635bff);
          transform: translateY(-1px);
        }
        .student-filter-chip.active {
          border-color: transparent;
          color: #fff;
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
          box-shadow: 0 10px 24px rgba(99,91,255,.25);
        }
        .student-filter-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .student-filter-result {
          font-size: 11px;
          color: var(--t2, #5a6278);
          font-weight: 700;
        }
        .student-filter-reset {
          border: 1px solid rgba(0,0,0,.10);
          background: rgba(255,255,255,.95);
          color: var(--t1, #0c0e18);
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all .18s ease;
        }
        .student-filter-reset:hover:not(:disabled) {
          border-color: rgba(99,91,255,.35);
          color: var(--a1, #635bff);
        }
        .student-filter-reset:disabled {
          opacity: .45;
          cursor: not-allowed;
        }
        .student-list-title {
          margin: 0;
          font-family: 'Syne', system-ui, sans-serif;
          font-size: 18px;
          color: var(--t1, #0c0e18);
        }
        .student-list-subtitle {
          margin-top: 6px;
          color: var(--t2, #5a6278);
          font-size: 13px;
        }
        .student-list {
          padding: 10px;
          overflow: auto;
          max-height: calc(100vh - 190px);
        }
        .student-list-empty {
          padding: 26px 18px;
          text-align: center;
          color: var(--t2, #5a6278);
          font-size: 14px;
        }
        .student-item {
          width: 100%;
          text-align: left;
          border: 1px solid transparent;
          background: transparent;
          border-radius: 18px;
          padding: 14px;
          cursor: pointer;
          transition: all .22s ease;
          display: grid;
          gap: 10px;
          margin-bottom: 8px;
        }
        .student-item:hover {
          background: rgba(99,91,255,.05);
          border-color: rgba(99,91,255,.10);
        }
        .student-item:focus-visible {
          outline: 2px solid rgba(99,91,255,.55);
          outline-offset: 2px;
        }
        .student-item.active {
          background: linear-gradient(135deg, rgba(99,91,255,.12), rgba(6,201,160,.08));
          border-color: rgba(99,91,255,.18);
          box-shadow: 0 12px 28px rgba(99,91,255,.08);
        }
        .student-item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .student-item-name {
          margin: 0;
          font-weight: 800;
          font-size: 15px;
          color: var(--t1, #0c0e18);
          line-height: 1.3;
        }
        .student-item-meta {
          margin-top: 5px;
          color: var(--t2, #5a6278);
          font-size: 12px;
          line-height: 1.5;
          display: grid;
          gap: 2px;
        }
        .student-item-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .student-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          color: var(--t2, #5a6278);
          background: rgba(0,0,0,.04);
        }
        .student-chip.ready {
          background: rgba(6,201,160,.12);
          color: #0d7a5c;
        }
        .student-chip.missing {
          background: rgba(245,166,35,.12);
          color: #92400e;
        }
        .student-docs-panel {
          padding: 24px;
        }
        .student-summary {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          align-items: start;
          padding: 20px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(99,91,255,.08), rgba(6,201,160,.06));
          border: 1px solid rgba(99,91,255,.12);
          margin-bottom: 20px;
        }
        .student-summary-name {
          margin: 0;
          font-family: 'Syne', system-ui, sans-serif;
          font-size: 22px;
          color: var(--t1, #0c0e18);
        }
        .student-summary-text {
          margin-top: 6px;
          color: var(--t2, #5a6278);
          font-size: 14px;
          line-height: 1.55;
          display: grid;
          gap: 3px;
        }
        .student-summary-stats {
          display: grid;
          gap: 8px;
          min-width: 170px;
        }
        .student-summary-stat {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 14px;
          background: rgba(255,255,255,.65);
          border: 1px solid rgba(0,0,0,.06);
          font-size: 12px;
          color: var(--t2, #5a6278);
        }
        .student-summary-stat strong {
          color: var(--t1, #0c0e18);
          font-size: 13px;
        }
        .upload-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .upload-card {
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,.08);
          background: rgba(255,255,255,.84);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-height: 320px;
        }
        .upload-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .upload-card-title {
          margin: 0;
          font-family: 'Syne', system-ui, sans-serif;
          font-size: 18px;
          color: var(--t1, #0c0e18);
        }
        .upload-card-subtitle {
          margin-top: 4px;
          color: var(--t2, #5a6278);
          font-size: 12px;
        }
        .upload-preview {
          flex: 1;
          border-radius: 16px;
          border: 1.5px dashed rgba(99,91,255,.22);
          background:
            linear-gradient(180deg, rgba(99,91,255,.03), rgba(6,201,160,.03));
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 170px;
          overflow: hidden;
          position: relative;
        }
        .upload-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .upload-preview-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-align: center;
          color: var(--t2, #5a6278);
          padding: 24px;
        }
        .upload-preview-empty svg {
          color: var(--a1, #635bff);
        }
        .upload-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .upload-btn,
        .upload-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-family: 'Epilogue', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 800;
          transition: transform .18s ease, box-shadow .2s ease, background .2s ease;
        }
        .upload-btn {
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
          color: #fff;
          box-shadow: 0 12px 28px rgba(99,91,255,.22);
        }
        .upload-btn-secondary {
          background: rgba(255,255,255,.9);
          border: 1px solid rgba(0,0,0,.09);
          color: var(--t1, #0c0e18);
        }
        .upload-btn:hover:not(:disabled),
        .upload-btn-secondary:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .upload-btn:disabled,
        .upload-btn-secondary:disabled {
          opacity: .55;
          cursor: not-allowed;
          transform: none;
        }
        .upload-progress {
          height: 10px;
          border-radius: 999px;
          background: rgba(0,0,0,.06);
          overflow: hidden;
        }
        .upload-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--a1, #635bff), var(--a2, #06c9a0));
          border-radius: inherit;
          transition: width .18s ease;
        }
        .upload-progress-text {
          font-size: 12px;
          color: var(--t2, #5a6278);
        }
        .docs-empty {
          padding: 32px 20px;
          border-radius: 18px;
          border: 1px dashed rgba(99,91,255,.22);
          background: rgba(99,91,255,.03);
          color: var(--t2, #5a6278);
          text-align: center;
        }
        .student-mini {
          margin-top: 12px;
          display: grid;
          gap: 6px;
          font-size: 12px;
          color: var(--t2, #5a6278);
        }
        .student-mini strong {
          color: var(--t1, #0c0e18);
        }
        .spin {
          animation: spin .8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1100px) {
          .student-docs-shell {
            grid-template-columns: 1fr;
          }
          .student-docs-head-right,
          .student-docs-quickstats {
            width: 100%;
            justify-items: start;
          }
          .student-list {
            max-height: 420px;
          }
        }
        @media (max-width: 760px) {
          .student-docs-main,
          .student-docs-panel {
            padding: 18px;
          }
          .student-filter-meta {
            flex-direction: column;
            align-items: flex-start;
          }
          .student-docs-quickstats {
            grid-template-columns: 1fr;
          }
          .student-summary,
          .upload-grid {
            grid-template-columns: 1fr;
          }
          .student-summary-stats {
            min-width: 0;
          }
          .upload-card {
            min-height: 0;
          }
        }
      `}),e.jsxs("div",{className:"student-docs-shell",children:[e.jsxs("aside",{className:"student-docs-aside student-list-wrap",children:[e.jsxs("div",{className:"student-list-head",children:[e.jsxs("div",{className:"student-list-head-top",children:[e.jsxs("div",{children:[e.jsxs("p",{className:"student-docs-eyebrow",children:[e.jsx(te,{size:13})," Students"]}),e.jsx("h2",{className:"student-list-title",children:"All students"})]}),e.jsxs("button",{type:"button",className:`student-filter-toggle ${m?"open":""}`,onClick:()=>A(t=>!t),"aria-expanded":m,"aria-label":m?"Close filters":"Open filters",title:m?"Hide filters":"Show filters",children:[e.jsx(U,{size:14,className:"student-filter-toggle-main"}),e.jsx(pe,{size:16,className:"student-filter-toggle-arrow"})]})]}),e.jsx("div",{className:`student-filter-collapse ${m?"open":""}`,children:e.jsx("div",{className:"student-filter-collapse-inner",children:e.jsxs("div",{className:"student-filter-block",children:[e.jsxs("div",{className:"student-filter-top",children:[e.jsxs("div",{className:"student-filter-search",children:[e.jsx(ue,{size:14,color:"#5a6278"}),e.jsx("input",{type:"text",value:l,onChange:t=>E(t.target.value),placeholder:"Search by name, faculty, gender, year","aria-label":"Search students"})]}),e.jsxs("div",{className:"student-filter-meta",children:[e.jsxs("div",{className:"student-filter-active",children:[e.jsx(U,{size:12})," ",O," active filters"]}),e.jsxs("div",{className:"student-filter-result",children:["Showing ",x.length," of ",y.length]})]})]}),e.jsxs("div",{className:"student-filter-grid",children:[e.jsxs("div",{className:"student-filter-card",children:[e.jsxs("div",{className:"student-filter-card-head",children:[e.jsxs("span",{className:"student-filter-label",children:[e.jsx(U,{size:12})," Faculty"]}),e.jsxs("small",{children:[Z.length," options"]})]}),e.jsx(ge,{value:p,onChange:_,options:[{value:"all",label:"All faculties"},...Z.map(t=>({value:t,label:t}))],placeholder:"All faculties"})]}),e.jsxs("div",{className:"student-filter-card",children:[e.jsxs("div",{className:"student-filter-card-head",children:[e.jsxs("span",{className:"student-filter-label",children:[e.jsx(U,{size:12})," Passport status"]}),e.jsx("small",{children:"Document"})]}),e.jsxs("div",{className:"student-filter-segment",role:"group","aria-label":"Passport filter",children:[e.jsx("button",{type:"button",className:`student-filter-chip ${v==="all"?"active":""}`,onClick:()=>G("all"),children:"All"}),e.jsx("button",{type:"button",className:`student-filter-chip ${v==="has"?"active":""}`,onClick:()=>G("has"),children:"Has"}),e.jsx("button",{type:"button",className:`student-filter-chip ${v==="missing"?"active":""}`,onClick:()=>G("missing"),children:"Missing"})]})]}),e.jsxs("div",{className:"student-filter-card",children:[e.jsxs("div",{className:"student-filter-card-head",children:[e.jsxs("span",{className:"student-filter-label",children:[e.jsx(U,{size:12})," Medicine status"]}),e.jsx("small",{children:"Document"})]}),e.jsxs("div",{className:"student-filter-segment",role:"group","aria-label":"Medicine filter",children:[e.jsx("button",{type:"button",className:`student-filter-chip ${j==="all"?"active":""}`,onClick:()=>L("all"),children:"All"}),e.jsx("button",{type:"button",className:`student-filter-chip ${j==="has"?"active":""}`,onClick:()=>L("has"),children:"Has"}),e.jsx("button",{type:"button",className:`student-filter-chip ${j==="missing"?"active":""}`,onClick:()=>L("missing"),children:"Missing"})]})]})]}),e.jsxs("div",{className:"student-filter-actions",children:[e.jsx("div",{className:"student-filter-result",children:"Fine-tune students fast using smart filters"}),e.jsxs("button",{type:"button",className:"student-filter-reset",onClick:ne,disabled:O===0,children:["Clear filters (",O,")"]})]})]})})})]}),e.jsxs("div",{className:"student-list",children:[x.length>0?re.map((t,a)=>{const n=b(t,a),f=n===b(g),i=$(t,"passport"),u=$(t,"medicine");return e.jsxs("button",{type:"button",className:`student-item ${f?"active":""}`,onClick:()=>M(n),children:[e.jsx("div",{className:"student-item-top",children:e.jsxs("div",{children:[e.jsxs("p",{className:"student-item-name",children:[t?.name||"Unknown"," ",t?.surname||""," ",t?.lastname||""]}),e.jsxs("div",{className:"student-item-meta",children:[e.jsxs("span",{children:["Faculty: ",t?.nameFaculty||t?.faculty?.name||"Not specified"]}),e.jsxs("span",{children:["Gender: ",t?.gender||"Not specified"]}),e.jsxs("span",{children:["Year: ",t?.year??"Not specified"]})]})]})}),e.jsxs("div",{className:"student-item-badges",children:[e.jsxs("span",{className:`student-chip ${i?"ready":"missing"}`,children:[i?e.jsx(R,{size:12}):e.jsx(z,{size:12}),"Passport ",i?"ready":"missing"]}),e.jsxs("span",{className:`student-chip ${u?"ready":"missing"}`,children:[u?e.jsx(C,{size:12}):e.jsx(z,{size:12}),"Medicine ",u?"ready":"missing"]})]})]},n)}):e.jsx("div",{className:"student-list-empty",children:"No students match the current filters. Try clearing filters or changing search."}),F>1&&e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"12px 0 4px",borderTop:"1px solid rgba(0,0,0,.06)",marginTop:6},children:[e.jsx("button",{type:"button",className:"bg",disabled:P<=1,onClick:()=>D(t=>Math.max(1,t-1)),style:{fontSize:12,padding:"5px 10px"},children:"← Prev"}),e.jsxs("span",{style:{fontSize:12,color:"var(--t2)",fontWeight:600},children:[P," / ",F]}),e.jsx("button",{type:"button",className:"bg",disabled:P>=F,onClick:()=>D(t=>Math.min(F,t+1)),style:{fontSize:12,padding:"5px 10px"},children:"Next →"})]})]})]}),e.jsxs("main",{className:"student-docs-main",children:[e.jsx("div",{className:"student-docs-head",children:e.jsx("div",{children:e.jsxs("p",{className:"student-docs-eyebrow",children:[e.jsx(C,{size:13})," Document upload"]})})}),g?e.jsxs(e.Fragment,{children:[e.jsx("section",{className:"student-docs-panel",style:{marginBottom:18},children:e.jsxs("div",{className:"student-summary",children:[e.jsxs("div",{children:[e.jsxs("p",{className:"student-docs-eyebrow",children:[e.jsx(te,{size:13})," Selected student"]}),e.jsxs("h2",{className:"student-summary-name",children:[g?.name||"Unknown"," ",g?.surname||""," ",g?.lastname||""]}),e.jsxs("div",{className:"student-summary-text",children:[e.jsxs("span",{children:["Faculty: ",g?.nameFaculty||g?.faculty?.name||"Not specified"]}),e.jsxs("span",{children:["Gender: ",g?.gender||"Not specified"]}),e.jsxs("span",{children:["Year: ",g?.year??"Not specified"]})]})]}),e.jsxs("div",{className:"student-summary-stats",children:[e.jsxs("div",{className:"student-summary-stat",children:[e.jsx("span",{children:"Passport"}),e.jsx("strong",{children:w?"Uploaded":"Missing"})]}),e.jsxs("div",{className:"student-summary-stat",children:[e.jsx("span",{children:"Medicine"}),e.jsx("strong",{children:N?"Uploaded":"Missing"})]})]})]})}),e.jsxs("section",{className:"upload-grid",children:[e.jsxs("article",{className:"upload-card",children:[e.jsxs("div",{className:"upload-card-head",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"upload-card-title",children:"Front side"}),e.jsx("p",{className:"upload-card-subtitle",children:"Upload passport front side image in JPEG, PNG, GIF, or WebP format."})]}),e.jsx("div",{children:w?e.jsx(R,{size:22,color:"var(--a1, #635bff)"}):e.jsx(z,{size:22,color:"var(--a1, #635bff)"})})]}),e.jsx("div",{className:"upload-preview",children:w?e.jsx("img",{src:w,alt:"Passport front side preview"}):e.jsxs("div",{className:"upload-preview-empty",children:[e.jsx(z,{size:38,strokeWidth:1.8}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:800,color:"var(--t1, #0c0e18)"},children:"No front side image yet"}),e.jsx("div",{style:{marginTop:4,fontSize:12},children:"Choose one image to upload"})]})]})}),e.jsxs("div",{className:"upload-actions",children:[e.jsx("input",{id:"passport-image-input",type:"file",accept:"image/jpeg,image/png,image/gif,image/webp",style:{display:"none"},disabled:o.passport.loading,onChange:t=>{const a=t.target.files?.[0]||null;t.target.value="",a&&Q("passport",a)}}),e.jsxs("label",{className:"upload-btn",htmlFor:"passport-image-input",style:{pointerEvents:o.passport.loading?"none":"auto"},children:[o.passport.loading?e.jsx(se,{size:16,className:"spin"}):w?e.jsx(R,{size:16}):e.jsx(z,{size:16}),o.passport.loading?"Uploading...":w?"Replace front side":"Upload front side"]}),w&&e.jsxs("button",{type:"button",className:"upload-btn-secondary",onClick:()=>ee(w),disabled:o.passport.loading,children:[e.jsx(R,{size:16})," View front side"]})]}),o.passport.loading&&e.jsxs("div",{style:{display:"grid",gap:8},children:[e.jsx("div",{className:"upload-progress",children:e.jsx("div",{className:"upload-progress-fill",style:{width:`${o.passport.progress}%`}})}),e.jsxs("div",{className:"upload-progress-text",children:["Uploading front side image: ",o.passport.progress,"%"]})]})]}),e.jsxs("article",{className:"upload-card",children:[e.jsxs("div",{className:"upload-card-head",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"upload-card-title",children:"Back side"}),e.jsx("p",{className:"upload-card-subtitle",children:"Upload passport back side image in JPEG, PNG, GIF, or WebP format."})]}),e.jsx("div",{children:N?e.jsx(C,{size:22,color:"var(--a1, #635bff)"}):e.jsx(z,{size:22,color:"var(--a1, #635bff)"})})]}),e.jsx("div",{className:"upload-preview",children:N?e.jsx("img",{src:N,alt:"Passport back side preview"}):e.jsxs("div",{className:"upload-preview-empty",children:[e.jsx(C,{size:38,strokeWidth:1.8}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:800,color:"var(--t1, #0c0e18)"},children:"No back side image yet"}),e.jsx("div",{style:{marginTop:4,fontSize:12},children:"Choose one image to upload"})]})]})}),e.jsxs("div",{className:"upload-actions",children:[e.jsx("input",{id:"medicine-image-input",type:"file",accept:"image/jpeg,image/png,image/gif,image/webp",style:{display:"none"},disabled:o.medicine.loading,onChange:t=>{const a=t.target.files?.[0]||null;t.target.value="",a&&Q("medicine",a)}}),e.jsxs("label",{className:"upload-btn",htmlFor:"medicine-image-input",style:{pointerEvents:o.medicine.loading?"none":"auto"},children:[o.medicine.loading?e.jsx(se,{size:16,className:"spin"}):N?e.jsx(C,{size:16}):e.jsx(z,{size:16}),o.medicine.loading?"Uploading...":N?"Replace back side":"Upload back side"]}),N&&e.jsxs("button",{type:"button",className:"upload-btn-secondary",onClick:()=>ee(N),disabled:o.medicine.loading,children:[e.jsx(C,{size:16})," View back side"]})]}),o.medicine.loading&&e.jsxs("div",{style:{display:"grid",gap:8},children:[e.jsx("div",{className:"upload-progress",children:e.jsx("div",{className:"upload-progress-fill",style:{width:`${o.medicine.progress}%`}})}),e.jsxs("div",{className:"upload-progress-text",children:["Uploading back side image: ",o.medicine.progress,"%"]})]})]})]})]}):e.jsx("div",{className:"docs-empty",children:"No student is selected. Add students in the API first, then return here to upload documents."})]})]})]})}export{Ie as default};
