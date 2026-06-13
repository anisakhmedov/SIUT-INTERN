import{c as ae,r as s,j as e,S as pe,a as ue,g as Z,p as me,t as ge}from"./index-B9wUb5OY.js";import{C as J}from"./ui-DPolIwNU.js";import{u as xe}from"./useSEO-IGeWuCVr.js";import{X as G}from"./x-CloWw-72.js";import{C as be}from"./calendar-Dqt64F1I.js";import{C as fe,a as he}from"./chevron-right-DhxuUGmZ.js";const ye=[["line",{x1:"2",x2:"5",y1:"12",y2:"12",key:"bvdh0s"}],["line",{x1:"19",x2:"22",y1:"12",y2:"12",key:"1tbv5k"}],["line",{x1:"12",x2:"12",y1:"2",y2:"5",key:"11lu5j"}],["line",{x1:"12",x2:"12",y1:"19",y2:"22",key:"x3vr5v"}],["circle",{cx:"12",cy:"12",r:"7",key:"fim9np"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],ve=ae("locate-fixed",ye);const we=[["path",{d:"M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0",key:"11u0oz"}],["circle",{cx:"12",cy:"8",r:"2",key:"1822b1"}],["path",{d:"M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712",key:"q8zwxj"}]],je=ae("map-pinned",we),ke="a82d324e-b1dc-4510-b1f8-782e0913094e",ee=`https://api-maps.yandex.ru/2.1/?lang=en_US&apikey=${ke}`,Ne=[41.3775,69.1824];function te(r){return Array.isArray(r)?r:Array.isArray(r?.data)?r.data:Array.isArray(r?.users)?r.users:[]}function re(r){return{_id:r?._id||r?.id||r?.userId||"",name:r?.name||"",surname:r?.surname||"",lastname:r?.lastname||"",role:r?.role||"",login:r?.login||r?.email||"",phone:r?.phone||""}}function X(r){return[r?.name,r?.surname,r?.lastname].filter(Boolean).join(" ").trim()||"Unnamed tutor"}function B(r){const g=Number(Number(r[0]).toFixed(6)),x=Number(Number(r[1]).toFixed(6));return{label:`Selected point [${g}, ${x}]`,fullAddress:`Selected point [${g}, ${x}]`,street:"",city:"",country:"",coords:[g,x]}}function W(r){const g=r.getFullYear(),x=String(r.getMonth()+1).padStart(2,"0"),j=String(r.getDate()).padStart(2,"0");return`${g}-${x}-${j}`}function ne(r){if(!r)return new Date;const[g,x,j]=r.split("-").map(Number);return new Date(g,x-1,j)}function Se({startDate:r,endDate:g,onChange:x,daysCount:j}){const[v,i]=s.useState(!1),[f,R]=s.useState(r?ne(r):new Date),[F,C]=s.useState("bottom"),k=s.useRef(null),y=s.useRef(null),D=s.useRef(null),M=l=>new Date(l.getFullYear(),l.getMonth()+1,0).getDate(),$=l=>new Date(l.getFullYear(),l.getMonth(),1).getDay(),S=l=>W(l),T=l=>{if(!r||!g)return!1;const m=S(l);return m>=r&&m<=g},L=l=>{const m=S(l);return m===r||m===g},I=l=>{const m=S(new Date(f.getFullYear(),f.getMonth(),l));if(!r||r&&g)x({startDate:m,endDate:""});else{const w=new Date(r+"T00:00:00");new Date(m+"T00:00:00")<w?x({startDate:m,endDate:r}):x({startDate:r,endDate:m}),i(!1)}},z=()=>{R(new Date(f.getFullYear(),f.getMonth()-1,1))},_=()=>{R(new Date(f.getFullYear(),f.getMonth()+1,1))},A=()=>{const l=M(f),m=$(f),w=[];for(let a=0;a<m;a++)w.push(e.jsx("div",{className:"cdrp-day-empty"},`empty-${a}`));for(let a=1;a<=l;a++){const d=new Date(f.getFullYear(),f.getMonth(),a),c=L(d),p=T(d);w.push(e.jsx("button",{type:"button",className:`cdrp-day ${c?"cdrp-day--selected":""} ${p?"cdrp-day--range":""}`,onClick:()=>I(a),children:a},a))}return w};return s.useEffect(()=>{const l=m=>{k.current&&!k.current.contains(m.target)&&i(!1)};if(v)return document.addEventListener("mousedown",l),()=>document.removeEventListener("mousedown",l)},[v]),s.useEffect(()=>{if(!v||!y.current||!D.current)return;const m=setTimeout(()=>{const w=y.current.getBoundingClientRect(),a=D.current.offsetHeight,c=window.innerHeight-w.bottom,p=w.top,b=20;c<a+b&&p>a+b?C("top"):C("bottom")},0);return()=>clearTimeout(m)},[v]),e.jsxs("div",{ref:k,className:"custom-date-range-picker",children:[e.jsx("style",{children:`
        .custom-date-range-picker {
          position: relative;
        }
        .cdrp-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .cdrp-input {
          width: 100%;
          padding: 12px 16px 12px 40px;
          border-radius: 12px;
          border: 1.5px solid rgba(0,0,0,.10);
          background: rgba(0,0,0,.03);
          color: var(--t1, #0c0e18);
          font-family: 'Epilogue', system-ui, sans-serif;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          transition: all .25s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-sizing: border-box;
        }
        .cdrp-input:hover {
          border-color: rgba(99,91,255,.2);
          background: rgba(99,91,255,.03);
        }
        .cdrp-input:focus {
          border-color: var(--a1, #635bff);
          box-shadow: 0 0 0 4px rgba(99,91,255,.14);
          background: rgba(99,91,255,.04);
        }
        .cdrp-icon {
          position: absolute;
          left: 12px;
          color: var(--a1, #635bff);
          pointer-events: none;
        }
        .cdrp-clear-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--t3, #9ba3bb);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all .2s ease;
          border-radius: 6px;
        }
        .cdrp-clear-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, .1);
        }
        .cdrp-popup {
          position: absolute;
          left: 0;
          background: rgba(255, 255, 255, .98);
          border: 1px solid rgba(0, 0, 0, .08);
          border-radius: 14px;
          box-shadow: 0 14px 44px rgba(99, 91, 255, .15);
          padding: 20px;
          z-index: 1000;
          backdrop-filter: blur(8px);
          min-width: 320px;
        }
        .cdrp-popup[data-position="bottom"] {
          top: 100%;
          margin-top: 8px;
          animation: cdrpSlideUp .25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cdrp-popup[data-position="top"] {
          bottom: 100%;
          margin-bottom: 8px;
          animation: cdrpSlideDown .25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes cdrpSlideUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes cdrpSlideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .cdrp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .cdrp-month-year {
          font-weight: 700;
          font-size: 15px;
          color: var(--t1, #0c0e18);
        }
        .cdrp-nav-btn {
          background: rgba(99,91,255,.08);
          border: 1px solid rgba(99,91,255,.15);
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--a1, #635bff);
          transition: all .2s ease;
          padding: 0;
        }
        .cdrp-nav-btn:hover {
          background: rgba(99,91,255,.15);
          border-color: rgba(99,91,255,.3);
          transform: scale(1.05);
        }
        .cdrp-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 8px;
          text-align: center;
        }
        .cdrp-weekday {
          font-size: 11px;
          font-weight: 700;
          color: var(--t3, #9ba3bb);
          padding: 8px 0;
          text-transform: uppercase;
          letter-spacing: .05em;
        }
        .cdrp-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .cdrp-day-empty {
          height: 32px;
        }
        .cdrp-day {
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--t1, #0c0e18);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all .2s cubic-bezier(0.34, 1.56, 0.64, 1);
          padding: 0;
        }
        .cdrp-day:hover:not(.cdrp-day--selected) {
          background: rgba(99,91,255,.08);
          border-color: rgba(99,91,255,.15);
        }
        .cdrp-day--selected {
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
          color: white;
          box-shadow: 0 4px 12px rgba(99,91,255,.25);
          border-color: transparent;
        }
        .cdrp-day--range {
          background: rgba(99,91,255,.08);
          border-color: rgba(99,91,255,.15);
        }
        .cdrp-info {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(0, 0, 0, .06);
          font-size: 12px;
          color: var(--t2, #5a6278);
        }
        .cdrp-range-text {
          font-weight: 600;
          color: var(--a1, #635bff);
          margin-bottom: 4px;
        }
      `}),e.jsxs("div",{className:"cdrp-input-wrapper",children:[e.jsx(be,{className:"cdrp-icon",size:14}),e.jsx("input",{ref:y,type:"text",className:"cdrp-input",value:r&&g?`${r} → ${g}`:r?`From ${r}`:"Select date range",placeholder:"Select date range",readOnly:!0,onClick:()=>i(!v)}),(r||g)&&e.jsx("button",{type:"button",className:"cdrp-clear-btn",onClick:()=>{x({startDate:"",endDate:""}),i(!1)},children:e.jsx(G,{size:14})})]}),v&&e.jsxs("div",{ref:D,className:"cdrp-popup","data-position":F,children:[e.jsxs("div",{className:"cdrp-header",children:[e.jsx("button",{type:"button",className:"cdrp-nav-btn",onClick:z,children:e.jsx(fe,{size:14})}),e.jsx("span",{className:"cdrp-month-year",children:f.toLocaleString("en-US",{month:"long",year:"numeric"})}),e.jsx("button",{type:"button",className:"cdrp-nav-btn",onClick:_,children:e.jsx(he,{size:14})})]}),e.jsx("div",{className:"cdrp-weekdays",children:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(l=>e.jsx("div",{className:"cdrp-weekday",children:l},l))}),e.jsx("div",{className:"cdrp-days",children:A()}),r&&g&&e.jsxs("div",{className:"cdrp-info",children:[e.jsxs("div",{className:"cdrp-range-text",children:[j," days ","selected"]}),e.jsxs("div",{children:[r," to ",g]})]})]})]})}function Ce({value:r,onChange:g}){const x=s.useRef(null),j=s.useRef(null),v=s.useRef(null),i=s.useRef(null),f=s.useRef(g),R=s.useRef(r?.label||""),F=s.useRef(r?.coords||Ne),C=s.useRef(r?.label||"Selected place"),[k,y]=s.useState(r?.label||""),[D,M]=s.useState(!1),[$,S]=s.useState(!1),[T,L]=s.useState([]),[I,z]=s.useState(""),_=s.useRef((a,d="")=>{const c=a?.properties?.get?.("metaDataProperty.GeocoderMetaData.Address.Components")||a?.properties?.get?.("metaDataProperty.GeocoderMetaData.Address.components")||[],p=a?.getAddressLine?.()||a?.properties?.get?.("metaDataProperty.GeocoderMetaData.text")||d||"Selected place",b=(...U)=>c.find(q=>U.includes(q.kind))?.name||"",N=[b("street"),b("house")].filter(Boolean).join(" "),P=b("locality","district","province"),E=b("country");return{label:p,fullAddress:p,street:N,city:P,country:E}}),A=s.useRef((a,d)=>{const c=[Number(Number(a[0]).toFixed(6)),Number(Number(a[1]).toFixed(6))],p=d||B(c);f.current({label:p.fullAddress||p.label||"Selected place",fullAddress:p.fullAddress||p.label||"Selected place",street:p.street||"",city:p.city||"",country:p.country||"",coords:c})});s.useEffect(()=>{f.current=g},[g]);const l=async a=>{if(!window.ymaps?.geocode)return null;const c=(await window.ymaps.geocode(a,{results:1,kind:"house"}))?.geoObjects?.get?.(0);return c?_.current(c,R.current):null};s.useEffect(()=>{R.current=k},[k]),s.useEffect(()=>{if(typeof window>"u")return;if(!ee){z("Map unavailable: VITE_YANDEX_MAPS_API_KEY is not set.");return}const a=document.querySelector('script[data-yandex-maps="true"]'),d=()=>{window.ymaps?.ready&&window.ymaps.ready(()=>M(!0))};if(window.ymaps){d();return}if(a)return a.addEventListener("load",d,{once:!0}),()=>a.removeEventListener("load",d);const c=document.createElement("script");return c.dataset.yandexMaps="true",c.async=!0,c.src=ee,c.onload=d,c.onerror=()=>z("Failed to load Yandex Maps."),document.head.appendChild(c),()=>{c.onload=null}},[]),s.useEffect(()=>{if(!D||!x.current||!window.ymaps||v.current)return;const a=new window.ymaps.Map(x.current,{center:F.current,zoom:13,controls:["zoomControl","fullscreenControl"]}),d=new window.ymaps.Placemark(F.current,{balloonContent:C.current},{preset:"islands#redDotIcon",draggable:!0});return a.geoObjects.add(d),a.events.add("click",c=>{const p=c.get("coords");d.geometry.setCoordinates(p),l(p).then(b=>{const N=b||B(p);A.current(p,N),y(N.fullAddress||N.label||"")}).catch(()=>{const b=B(p);A.current(p,b),y(b.fullAddress)})}),d.events.add("dragend",()=>{const c=d.geometry.getCoordinates();l(c).then(p=>{const b=p||B(c);A.current(c,b),y(b.fullAddress||b.label||"")}).catch(()=>{const p=B(c);A.current(c,p),y(p.fullAddress)})}),v.current=a,j.current=d,()=>{a.destroy(),v.current=null,j.current=null}},[D]),s.useEffect(()=>{!v.current||!j.current||r?.coords&&Array.isArray(r.coords)&&r.coords.length===2&&(v.current.setCenter(r.coords,v.current.getZoom(),{duration:250}),j.current.geometry.setCoordinates(r.coords))},[r?.coords]);const m=s.useCallback(async a=>{const d=a.trim();if(!d||!window.ymaps?.geocode){L([]);return}S(!0),z("");try{const b=((await window.ymaps.geocode(d,{results:15}))?.geoObjects?.toArray?.()||[]).map(N=>{const P=N.geometry.getCoordinates(),E=_.current(N,d);return{label:E.fullAddress,fullAddress:E.fullAddress,street:E.street,city:E.city,country:E.country,coords:[Number(P[0].toFixed(6)),Number(P[1].toFixed(6))]}});L(b)}catch{z("Could not search the place on Yandex Maps.")}finally{S(!1)}},[]);s.useEffect(()=>{if(k.trim())return i.current&&clearTimeout(i.current),i.current=setTimeout(()=>{m(k)},450),()=>{i.current&&clearTimeout(i.current)}},[k,m]);const w=a=>{y(a.label),L([]),A.current(a.coords,a)};return e.jsxs("div",{style:{marginTop:8},children:[e.jsxs("div",{style:{display:"grid",gap:10,marginBottom:10},children:[e.jsxs("div",{style:{position:"relative"},children:[e.jsx(je,{size:16,style:{position:"absolute",left:12,top:12,color:"var(--t3, #9ba3bb)"}}),e.jsx("input",{type:"text",className:"form-input",value:k,onChange:a=>y(a.target.value),placeholder:"Type a place name, street, or city",style:{paddingLeft:38}})]}),e.jsxs("button",{type:"button",className:"btn btn-secondary",onClick:()=>m(k),disabled:$,children:[e.jsx(ve,{size:14})," ",$?"Searching...":"Search on Yandex Maps"]})]}),I&&e.jsx("div",{style:{background:"rgba(239,68,68,.1)",color:"#b91c1c",padding:"10px 12px",borderRadius:10,marginBottom:10,fontSize:12},children:I}),e.jsx("div",{ref:x,style:{width:"100%",height:320,borderRadius:16,overflow:"hidden",border:"1px solid rgba(0,0,0,.1)",background:"rgba(0,0,0,.04)"}}),e.jsx("div",{style:{marginTop:10,fontSize:12,color:"var(--t2, #5a6278)",lineHeight:1.5},children:r?.label?e.jsxs("div",{style:{display:"grid",gap:4},children:[e.jsxs("div",{children:["Selected place: ",e.jsx("strong",{style:{color:"var(--t1, #0c0e18)"},children:r.fullAddress||r.label})]}),e.jsxs("div",{children:["Coordinates: ",e.jsxs("strong",{style:{color:"var(--t1, #0c0e18)"},children:["[",r.coords?.[0],", ",r.coords?.[1],"]"]})]}),(r.street||r.city||r.country)&&e.jsxs("div",{children:[r.street?e.jsxs("span",{children:[e.jsx("strong",{children:"Street:"})," ",r.street]}):null,r.city?e.jsxs("span",{children:[r.street?" | ":"",e.jsx("strong",{children:"City:"})," ",r.city]}):null,r.country?e.jsxs("span",{children:[r.street||r.city?" | ":"",e.jsx("strong",{children:"Country:"})," ",r.country]}):null]})]}):"Select a point on the map or search for a place. The form will save coordinates as [lat, lng] and a full address."}),T.length>0&&e.jsxs("div",{style:{marginTop:10,display:"grid",gap:8},children:[e.jsx("div",{style:{fontSize:11,color:"var(--t3, #9ba3bb)",fontWeight:600},children:"Similar results"}),T.map(a=>e.jsxs("button",{type:"button",onClick:()=>w(a),style:{textAlign:"left",borderRadius:12,padding:"10px 12px",border:"1px solid rgba(0,0,0,.08)",background:"rgba(255,255,255,.92)",cursor:"pointer",fontSize:12,color:"var(--t1, #0c0e18)"},children:[e.jsx("div",{style:{fontWeight:700,marginBottom:2},children:a.label}),e.jsx("div",{style:{color:"var(--t2, #5a6278)"},children:a.street||a.city||a.country?[a.street,a.city,a.country].filter(Boolean).join(", "):"Address unavailable"}),e.jsxs("div",{style:{color:"var(--t2, #5a6278)",marginTop:2},children:["[",a.coords[0],", ",a.coords[1],"]"]})]},`${a.label}-${a.coords.join(",")}`))]})]})}function Te({onSubmit:r,onCancel:g,students:x=[],tutors:j=[],user:v=null}){xe({title:"Create Internship",description:"Create a new internship in the SIUT system — set the company, dates, students, and supervisor.",noIndex:!0});const[i,f]=s.useState({name:"",company:"",location:"",locationYmaps:null,duration:{start:"",end:""},status:"Pending",plan:"",days:[]}),[R,F]=s.useState(()=>{try{return Array.isArray(x)?x.map(t=>({_id:t._id||t.id||t.studentId||String(Math.random()),name:t.name||t.fullName||"",surname:t.surname||"",lastname:t.lastname||"",nameFaculty:t.nameFaculty||t.faculty||t.facultyName||"",studentId:t.studentId||t.id||""})):[]}catch{return[]}}),[C,k]=s.useState([]),[y,D]=s.useState(""),[M,$]=s.useState(""),[S,T]=s.useState([]),[L,I]=s.useState([]),[z,_]=s.useState(!1),[A,l]=s.useState(!1),m=s.useRef(null),w=s.useMemo(()=>te(j).map(re).filter(t=>{const o=String(t.role||"").trim().toLowerCase();return o==="tutor"||o==="professor"}),[j]),a=w.length>0?w:L,d=s.useMemo(()=>S.map(t=>a.find(o=>o._id===t)).filter(Boolean),[S,a]);s.useEffect(()=>{if(w.length>0){I(w);return}if(!(String(v?.role||"").toLowerCase()==="admin")){I([]);return}(async()=>{try{_(!0);const n=await Z("/usersInternship"),h=te(n).map(re).filter(u=>{const Y=String(u.role||"").trim().toLowerCase();return Y==="tutor"||Y==="professor"});I(h)}catch(n){console.error("Error fetching tutors:",n)}finally{_(!1)}})()},[w,v?.role]),s.useEffect(()=>{T(t=>t.filter(o=>a.some(n=>n._id===o)))},[a]),s.useEffect(()=>{const t=n=>{m.current&&!m.current.contains(n.target)&&l(!1)},o=n=>{n.key==="Escape"&&l(!1)};return document.addEventListener("mousedown",t),document.addEventListener("keydown",o),()=>{document.removeEventListener("mousedown",t),document.removeEventListener("keydown",o)}},[]),s.useEffect(()=>{if(Array.isArray(x)&&x.length>0){F(x.map(n=>({_id:n._id||n.id||n.studentId||String(Math.random()),name:n.name||n.fullName||"",surname:n.surname||"",lastname:n.lastname||"",nameFaculty:n.nameFaculty||n.faculty||n.facultyName||"",studentId:n.studentId||n.id||""})));return}let t=!0;return(async()=>{try{const n=await Z("/student"),h=Array.isArray(n)?n:Array.isArray(n?.data)?n.data:Array.isArray(n?.students)?n.students:[];if(!t)return;F(h.map(u=>({_id:u._id||u.id||u.studentId||String(Math.random()),name:u.name||u.fullName||"",surname:u.surname||"",lastname:u.lastname||"",nameFaculty:u.nameFaculty||u.faculty||u.facultyName||"",studentId:u.studentId||u.id||""})))}catch(n){console.error("Error fetching students for CreatePage:",n)}})(),()=>{t=!1}},[x]);const c=[...new Set(R.map(t=>t.nameFaculty).filter(Boolean))],b=R.filter(t=>t.name&&t.name.toLowerCase().includes(y.toLowerCase())||t.surname&&t.surname.toLowerCase().includes(y.toLowerCase())||t.lastname&&t.lastname.toLowerCase().includes(y.toLowerCase())||t.nameFaculty&&t.nameFaculty.toLowerCase().includes(y.toLowerCase())).filter(t=>!M||t.nameFaculty===M).filter(t=>!C.some(o=>(o._id||o.id)===(t._id||t.id))),N=t=>{const{name:o,value:n}=t.target;f(h=>({...h,[o]:n}))},P=()=>{if(!i.duration?.start||!i.duration?.end)return 0;const t=new Date(i.duration.start),n=new Date(i.duration.end)-t,h=Math.ceil(n/(1e3*60*60*24))+1;return Math.max(0,h)},E=()=>{if(!i.duration?.start||!i.duration?.end)return[];const t=P(),o=[],n=ne(i.duration.start);for(let h=0;h<t;h++){const u=new Date(n);u.setDate(u.getDate()+h);const Y=W(u);o.push({dayNumber:String(h+1),date:Y,approved:1,shortReport:null,comments:[],images:[]})}return o},U=(t,o)=>{if(!t||!o)return"";const n=new Date(t),u=new Date(o)-n;return`${Math.ceil(u/(1e3*60*60*24))+1} days (${t} to ${o})`},K=()=>{const t=i.duration?.start,o=i.duration?.end;return!t||!o?"":U(t,o)},q=async t=>{t.preventDefault();try{if(!Array.isArray(i.locationYmaps?.coords)||i.locationYmaps.coords.length!==2)throw new Error("Please choose a location on the Yandex map.");if(!i.duration?.start||!i.duration?.end)throw new Error("Please select both start and end dates.");const o=E();if(o.length===0)throw new Error("Invalid date range. End date must be after start date.");const n={...i,tutorID:S[0]||"",tutorIDs:S,location:i.locationYmaps?.label||i.location,locationYmaps:i.locationYmaps.coords,duration:{start:i.duration.start,end:i.duration.end},days:o,numberOfStudents:C.map(u=>({_id:u._id,name:u.name,surname:u.surname,lastname:u.lastname,nameFaculty:u.nameFaculty}))},h=await me("/faculty",n);r(h)}catch(o){ge.error(o.message||"Failed to create internship."),console.error("Error creating internship:",o)}},oe=t=>{T(o=>o.includes(t)?o.filter(n=>n!==t):[...o,t])},se=t=>{T(o=>o.filter(n=>n!==t))},ie=t=>{k(o=>[...o,t]),D("")},ce=s.useMemo(()=>{const t=i.locationYmaps;return t?.label&&Array.isArray(t?.coords)&&t.coords.length===2?t:null},[i.locationYmaps]),le=t=>{k(o=>o.filter(n=>n._id!==t))};return e.jsxs("div",{className:"create-page",children:[e.jsx("style",{children:`
        .create-page {
          min-height: calc(100vh - 64px);
          padding: clamp(16px, 3vw, 44px);
          background:
            radial-gradient(1200px 600px at 10% 0%, rgba(99,91,255,.10), transparent 60%),
            radial-gradient(900px 520px at 90% 10%, rgba(6,201,160,.10), transparent 55%),
            linear-gradient(180deg, rgba(240,241,247,.65), rgba(255,255,255,1));
        }
        .create-shell {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 24px;
        }
        .create-main {
          width: 100%;
        }
        .create-sidebar {
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 18px;
          padding: 24px;
          height: fit-content;
          box-shadow: 0 14px 44px rgba(99,91,255,.10);
        }
        .create-card {
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 18px;
          padding: 28px;
          margin-bottom: 24px;
          box-shadow: 0 14px 44px rgba(99,91,255,.10);
        }
        .create-title {
          font-family: 'Syne', system-ui, sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--t1, #0c0e18);
          margin: 0 0 24px 0;
        }
        .create-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 24px;
        }
        .create-title-row .create-title {
          margin: 0;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .05em;
          color: var(--t3, #9ba3bb);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .form-input {
          width: 100%;
          padding: clamp(10px,2vw,12px) clamp(12px,2vw,16px);
          border-radius: 12px;
          border: 1.5px solid rgba(0,0,0,.10);
          background: rgba(0,0,0,.03);
          color: var(--t1, #0c0e18);
          font-family: 'Epilogue', system-ui, sans-serif;
          font-size: clamp(13px,2vw,14px);
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease;
          box-sizing: border-box;
        }
        .form-input:focus {
          border-color: var(--a1, #635bff);
          box-shadow: 0 0 0 4px rgba(99,91,255,.14);
        }
        .tutor-picker {
          position: relative;
        }
        .tutor-picker-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 14px;
          border: 1.5px solid rgba(0,0,0,.10);
          background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(247,248,252,.96));
          color: var(--t1, #0c0e18);
          font-family: 'Epilogue', system-ui, sans-serif;
          text-align: left;
          cursor: pointer;
          transition: border-color .2s ease, box-shadow .2s ease, transform .15s ease;
          box-sizing: border-box;
        }
        .tutor-picker-trigger:hover:not(:disabled) {
          border-color: rgba(99,91,255,.22);
          box-shadow: 0 10px 24px rgba(99,91,255,.08);
        }
        .tutor-picker-trigger.open,
        .tutor-picker-trigger:focus-visible {
          border-color: var(--a1, #635bff);
          box-shadow: 0 0 0 4px rgba(99,91,255,.14);
          outline: none;
        }
        .tutor-picker-trigger:disabled {
          cursor: not-allowed;
          opacity: .7;
        }
        .tutor-picker-title {
          font-size: 14px;
          font-weight: 700;
        }
        .tutor-picker-meta {
          font-size: 12px;
          font-weight: 600;
          color: var(--t3, #9ba3bb);
          white-space: nowrap;
        }
        .tutor-picker-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        .tutor-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(99,91,255,.12), rgba(6,201,160,.10));
          border: 1px solid rgba(99,91,255,.15);
          color: var(--t1, #0c0e18);
          font-size: 12px;
          font-weight: 600;
        }
        .tutor-chip-remove {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border: none;
          border-radius: 50%;
          background: rgba(255,255,255,.75);
          color: #ef4444;
          cursor: pointer;
          padding: 0;
        }
        .tutor-picker-menu {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 0;
          right: 0;
          z-index: 20;
          max-height: 280px;
          overflow-y: auto;
          padding: 10px;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,.08);
          background: rgba(255,255,255,.98);
          box-shadow: 0 18px 42px rgba(99,91,255,.16);
          backdrop-filter: blur(10px);
        }
        .tutor-picker-option {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--t1, #0c0e18);
          text-align: left;
          cursor: pointer;
          transition: all .18s ease;
        }
        .tutor-picker-option:hover {
          background: rgba(99,91,255,.06);
          border-color: rgba(99,91,255,.10);
        }
        .tutor-picker-option.selected {
          background: linear-gradient(135deg, rgba(99,91,255,.10), rgba(6,201,160,.08));
          border-color: rgba(99,91,255,.14);
        }
        .tutor-picker-option + .tutor-picker-option {
          margin-top: 6px;
        }
        .tutor-picker-option-title {
          font-size: 13px;
          font-weight: 700;
        }
        .tutor-picker-option-subtitle {
          margin-top: 2px;
          font-size: 11px;
          color: var(--t3, #9ba3bb);
        }
        .tutor-picker-option-mark {
          font-size: 11px;
          font-weight: 700;
          color: var(--a1, #635bff);
          white-space: nowrap;
        }
        .tutor-picker-empty {
          padding: 14px;
          font-size: 13px;
          color: var(--t3, #9ba3bb);
          text-align: center;
        }
        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(clamp(140px,40vw,1fr), 1fr));
          gap: clamp(12px,2vw,16px);
        }
        @media(max-width:640px){
          .form-row {
            grid-template-columns: 1fr;
          }
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: clamp(8px,1.5vw,10px) clamp(12px,2vw,16px);
          border-radius: 12px;
          font-family: 'Epilogue', system-ui, sans-serif;
          font-size: clamp(12px,2vw,13px);
          font-weight: 700;
          cursor: pointer;
          transition: transform .15s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
          border: none;
          white-space: nowrap;
        }
        .btn-primary {
          border: 1px solid rgba(99,91,255,.18);
          background: linear-gradient(135deg, var(--a1, #635bff), var(--a2, #06c9a0));
          color: #fff;
          box-shadow: 0 10px 30px rgba(99,91,255,.25);
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 16px 44px rgba(99,91,255,.30);
        }
        .btn-secondary {
          border: 1px solid rgba(0,0,0,.12);
          background: rgba(255,255,255,.8);
          color: var(--t1, #0c0e18);
        }
        .btn-danger {
          border: 1px solid rgba(220, 38, 38, 0.2);
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .btn:disabled { 
          opacity: .5; 
          cursor: not-allowed; 
          transform: none; 
        }
        .search-container {
          position: relative;
          margin-bottom: 16px;
        }
        .search-input {
          width: 100%;
          padding: 10px 14px 10px 40px;
          border-radius: 12px;
          border: 1.5px solid rgba(0,0,0,.10);
          background: rgba(0,0,0,.03);
          color: var(--t1, #0c0e18);
          font-family: 'Epilogue', system-ui, sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease;
          box-sizing: border-box;
        }
        .search-input:focus {
          border-color: var(--a1, #635bff);
          box-shadow: 0 0 0 4px rgba(99,91,255,.14);
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--t3, #9ba3bb);
        }
        .student-list {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 12px;
          background: rgba(0,0,0,.03);
        }
        .student-item {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0,0,0,.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background-color 0.2s ease;
        }
        .student-item:hover {
          background-color: rgba(99,91,255, 0.05);
        }
        .student-item:last-child {
          border-bottom: none;
        }
        .student-info {
          flex: 1;
        }
        .student-name {
          font-weight: 600;
          color: var(--t1, #0c0e18);
          margin-bottom: 2px;
        }
        .student-details {
          font-size: 12px;
          color: var(--t2, #5a6278);
        }
        .student-id {
          font-size: 11px;
          color: var(--t3, #9ba3bb);
          margin-top: 3px;
        }
        .add-btn {
          background: rgba(6,201,160,.1);
          color: #06c9a0;
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
        }
        .add-btn:hover {
          background: rgba(6,201,160,.2);
          transform: translateY(-1px);
        }
        .selected-students-list {
          margin-top: 16px;
        }
        .selected-student {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: linear-gradient(135deg, rgba(99,91,255, 0.1), rgba(6,201,160, 0.05));
          border-radius: 8px;
          margin-bottom: 8px;
          font-size: 13px;
          border: 1px solid rgba(99,91,255, 0.15);
          transition: transform 0.2s ease;
        }
        .selected-student:hover {
          transform: translateX(2px);
        }
        .remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        .remove-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }
        .loading {
          text-align: center;
          padding: 10px;
          color: var(--t2, #5a6278);
          font-size: 13px;
        }
        .error {
          color: #ef4444;
          font-size: 13px;
          margin-top: 4px;
        }
        .student-count {
          display: inline-block;
          background: rgba(99,91,255, 0.1);
          color: var(--a1, #635bff);
          border-radius: 20px;
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 600;
          margin-left: 8px;
        }
        .no-students {
          text-align: center;
          padding: 20px;
          color: var(--t3, #9ba3bb);
          font-style: italic;
        }
        @media (max-width: 900px) {
          .create-shell {
            grid-template-columns: 1fr;
          }
          .create-sidebar {
            max-height: 50vh;
            overflow-y: auto;
          }
          .create-title-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}),e.jsxs("div",{className:"create-shell",children:[e.jsx("div",{className:"create-main",children:e.jsxs("div",{className:"create-card",children:[e.jsx("div",{className:"create-title-row",children:e.jsx("h1",{className:"create-title",children:"Create New Internship"})}),e.jsxs("form",{onSubmit:q,children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Internship Name"}),e.jsx("input",{type:"text",name:"name",value:i.name,onChange:N,className:"form-input",required:!0})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Company"}),e.jsx("input",{type:"text",name:"company",value:i.company,onChange:N,className:"form-input",required:!0})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Location"}),e.jsx("input",{type:"text",name:"location",value:i.location,onChange:N,className:"form-input",required:!0}),e.jsx("div",{style:{marginTop:"10px"},children:e.jsx(Ce,{value:ce,onChange:t=>{f(o=>({...o,location:t.label,locationYmaps:t}))}})})]}),e.jsxs("div",{className:"form-row",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Duration"}),e.jsx("input",{type:"text",name:"duration",value:K(),className:"form-input",readOnly:!0,placeholder:"Select dates to auto-calculate",style:{background:"rgba(0,0,0,.05)",cursor:"not-allowed"}})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Status"}),e.jsx(J,{value:i.status,onChange:t=>N({target:{name:"status",value:t}}),options:[{value:"Pending",label:"Pending"},{value:"In Progress",label:"In Progress"},{value:"Completed",label:"Completed"}],placeholder:"Select status"})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Plan"}),e.jsx("textarea",{name:"plan",value:i.plan,onChange:N,className:"form-input",rows:"4",required:!0})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Internship Duration"}),e.jsx(Se,{startDate:i.duration?.start,endDate:i.duration?.end,daysCount:P(),onChange:t=>{f(o=>{const n={start:t.startDate||"",end:t.endDate||""};if(!n.start||!n.end)return{...o,duration:n,days:[]};const h=new Date(n.start),Y=new Date(n.end)-h,V=Math.ceil(Y/(1e3*60*60*24))+1;if(V<=0)return{...o,duration:n,days:[]};const Q=[];for(let O=0;O<V;O++){const H=new Date(h);H.setDate(H.getDate()+O);const de=W(H);Q.push({dayNumber:String(O+1),date:de,approved:1,shortReport:null,comments:[],images:[]})}return{...o,duration:n,days:Q}})}})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Assign Tutors or Professors"}),e.jsxs("div",{className:"tutor-picker",ref:m,children:[e.jsxs("button",{type:"button",className:`tutor-picker-trigger ${A?"open":""}`,onClick:()=>l(t=>!t),disabled:z,"aria-haspopup":"listbox","aria-expanded":A,children:[e.jsx("span",{className:"tutor-picker-title",children:d.length>0?`${d.length} tutor${d.length===1?"":"s"} selected`:"Choose one or more tutors"}),e.jsx("span",{className:"tutor-picker-meta",children:z?"Loading...":`${a.length} available`})]}),d.length>0&&e.jsx("div",{className:"tutor-picker-chips",children:d.map(t=>e.jsxs("span",{className:"tutor-chip",children:[e.jsx("span",{children:X(t)}),e.jsx("button",{type:"button",className:"tutor-chip-remove",onClick:()=>se(t._id),"aria-label":`Remove ${X(t)}`,children:e.jsx(G,{size:12})})]},t._id))}),A&&e.jsx("div",{className:"tutor-picker-menu",role:"listbox","aria-multiselectable":"true",children:z?e.jsx("div",{className:"tutor-picker-empty",children:"Loading tutors..."}):a.length>0?a.map(t=>{const o=S.includes(t._id);return e.jsxs("button",{type:"button",role:"option","aria-selected":o,className:`tutor-picker-option ${o?"selected":""}`,onClick:()=>oe(t._id),children:[e.jsxs("div",{children:[e.jsx("div",{className:"tutor-picker-option-title",children:X(t)}),e.jsx("div",{className:"tutor-picker-option-subtitle",children:t.role||"Tutor"})]}),e.jsx("span",{className:"tutor-picker-option-mark",children:o?"Selected":"Add"})]},t._id)}):e.jsx("div",{className:"tutor-picker-empty",children:"No tutors available."})})]})]}),e.jsxs("div",{className:"form-group",style:{marginTop:"30px"},children:[e.jsx("button",{type:"submit",className:"btn btn-primary",children:"Create Internship"}),e.jsx("button",{type:"button",onClick:g,className:"btn btn-secondary",style:{marginLeft:"10px"},children:"Cancel"})]})]})]})}),e.jsxs("div",{className:"create-sidebar",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"},children:[e.jsx("h2",{className:"create-title",style:{fontSize:"20px",marginBottom:0},children:"Add Students"}),e.jsx("span",{className:"student-count",children:C.length})]}),e.jsxs("div",{className:"search-container",children:[e.jsx(pe,{className:"search-icon",size:16}),e.jsx("input",{type:"text",placeholder:"Search students by name/faculty...",className:"search-input",value:y,onChange:t=>D(t.target.value)})]}),e.jsx("div",{style:{marginBottom:"16px"},children:e.jsx(J,{value:M,onChange:$,options:[{value:"",label:"All Faculties"},...c.map(t=>({value:t,label:t}))],placeholder:"All Faculties"})}),e.jsx("div",{className:"student-list",children:b.length>0?b.map(t=>e.jsxs("div",{className:"student-item",children:[e.jsxs("div",{className:"student-info",children:[e.jsxs("div",{className:"student-name",children:[t.name," ",t.surname," ",t.lastname]}),e.jsxs("div",{className:"student-details",children:["Faculty: ",t.nameFaculty]}),t.studentId&&e.jsxs("div",{className:"student-id",children:["ID: ",t.studentId]})]}),e.jsxs("button",{className:"add-btn",onClick:()=>ie(t),children:[e.jsx(ue,{size:14})," Add"]})]},t._id)):e.jsx("div",{className:"no-students",children:y||M?"No students found":"No students available"})}),C.length>0&&e.jsxs("div",{className:"selected-students-list",children:[e.jsxs("h3",{style:{fontSize:"16px",marginBottom:"12px",color:"var(--t1, #0c0e18)"},children:["Selected Students (",C.length,")"]}),C.map(t=>e.jsxs("div",{className:"selected-student",children:[e.jsxs("span",{children:[e.jsxs("strong",{children:[t.name," ",t.surname," ",t.lastname]}),e.jsxs("div",{style:{fontSize:"12px",color:"var(--t2, #5a6278)",marginTop:"2px"},children:[t.nameFaculty," ",t.studentId&&`• ID: ${t.studentId}`]})]}),e.jsx("button",{className:"remove-btn",onClick:()=>le(t._id),children:e.jsx(G,{size:14})})]},t._id))]})]})]})]})}export{Te as default};
