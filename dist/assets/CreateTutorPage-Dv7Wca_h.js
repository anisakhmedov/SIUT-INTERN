import{c as J,r as n,g as le,t as j,j as e,U as oe,p as ie,b as pe}from"./index-B9wUb5OY.js";import{C as Y}from"./ui-DPolIwNU.js";import{u as de}from"./useSEO-IGeWuCVr.js";import{U as ue}from"./user-plus-Ck5s6QV2.js";import{S as me}from"./save-D4dShZ53.js";import"./calendar-Dqt64F1I.js";const xe=[["path",{d:"M13 21h8",key:"1jsn5i"}],["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}]],ge=J("pen-line",xe);const he=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],be=J("shield-check",he),fe=["Tutor","Admin","Rector","Professor","Student"],ye=["name","surname","login","password","role"],v=[{key:"email",label:"Email",type:"email",placeholder:"john@example.com"},{key:"phone",label:"Phone",type:"text",placeholder:"+994501112233"},{key:"telegram",label:"Telegram",type:"text",placeholder:"@johndoe"},{key:"whatsapp",label:"WhatsApp",type:"text",placeholder:"+994501112233"}];function k(){return v.reduce((s,o)=>(s[o.key]="",s),{})}function S(){return v.reduce((s,o)=>(s[o.key]=!1,s),{})}function N(s){const o=k(),d=S();return v.forEach(({key:i})=>{const u=typeof s?.[i]=="string"?s[i].trim():"";o[i]=u,d[i]=!!u}),{values:o,enabled:d}}function G(s,o){const d={};return v.forEach(({key:i})=>{if(!o?.[i])return;const u=(s?.[i]||"").trim();u&&(d[i]=u)}),d}function K(s){return Array.isArray(s)?s:Array.isArray(s?.data)?s.data:Array.isArray(s?.users)?s.users:[]}function H(s){if(s?._id||s?.id)return s;if(s?.user&&(s.user._id||s.user.id))return s.user;if(s?.data&&!Array.isArray(s.data)&&(s.data._id||s.data.id))return s.data;const o=K(s);return o.length===1?o[0]:null}function b(s,o){return s?._id||s?.id||`user-${o}`}function C(s){return{name:String(s?.name||""),surname:String(s?.surname||""),login:String(s?.login||""),password:"",role:String(s?.role||"Tutor")}}function Se(){de({title:"Manage Staff",description:"Create and edit tutor, supervisor, and professor accounts in the SIUT internship system.",noIndex:!0});const[s,o]=n.useState({name:"",surname:"",login:"",password:"",role:"Tutor"}),[d,i]=n.useState(S()),[u,U]=n.useState(k()),[_,L]=n.useState(!1),[m,z]=n.useState([]),[F,O]=n.useState(!1),[f,E]=n.useState(""),[A,g]=n.useState({}),[I,h]=n.useState(S()),[$,x]=n.useState(k()),[D,R]=n.useState(!1),M=n.useRef("");n.useEffect(()=>{M.current=f},[f]);const T=n.useCallback(async()=>{O(!0);try{const t=await le("/usersInternship"),a=K(t);if(z(a),!a.length){E(""),g({}),h(S()),x(k());return}const r=M.current;if(r){const c=a.find((l,p)=>b(l,p)===r);if(c){g(C(c));const l=N(c?.contact);h(l.enabled),x(l.values)}else{const l=b(a[0],0);E(l),g(C(a[0]));const p=N(a[0]?.contact);h(p.enabled),x(p.values)}}else{const c=b(a[0],0);E(c),g(C(a[0]));const l=N(a[0]?.contact);h(l.enabled),x(l.values)}}catch(t){j.error(t.message||"Failed to load users.")}finally{O(!1)}},[]);n.useEffect(()=>{T()},[T]);const y=n.useMemo(()=>m.find((t,a)=>b(t,a)===f)||null,[f,m]),V=n.useMemo(()=>{const t=Array.from(new Set(m.map(a=>a?.role).filter(Boolean)));return Array.from(new Set([...fe,...t]))},[m]),w=n.useCallback(t=>{const{name:a,value:r}=t.target;o(c=>({...c,[a]:r}))},[]),Q=n.useCallback((t,a)=>{i(r=>({...r,[t]:a})),a||U(r=>({...r,[t]:""}))},[]),X=n.useCallback((t,a)=>{U(r=>({...r,[t]:a}))},[]),Z=async t=>{t.preventDefault(),L(!0);try{const a=G(u,d),r={...s,...Object.keys(a).length?{contact:a}:{}},c=await ie("/usersInternship/register",r);j.success("User was created successfully.");const l=H(c);l&&z(p=>[l,...p]),o({name:"",surname:"",login:"",password:"",role:"Tutor"}),i(S()),U(k()),l||await T()}catch(a){j.error(a.message||"Something went wrong.")}finally{L(!1)}},q=n.useCallback((t,a)=>{const r=b(t,a);E(r),g(C(t));const c=N(t?.contact);h(c.enabled),x(c.values)},[]),B=n.useCallback(t=>{const{name:a,value:r}=t.target;g(c=>({...c,[a]:r}))},[]),ee=n.useCallback((t,a)=>{h(r=>({...r,[t]:a})),a||x(r=>({...r,[t]:""}))},[]),te=n.useCallback((t,a)=>{x(r=>({...r,[t]:a}))},[]),ae=n.useMemo(()=>F?e.jsx("div",{className:"ctp-empty",children:"Loading users..."}):m.length===0?e.jsx("div",{className:"ctp-empty",children:"No users found."}):m.map((t,a)=>{const r=b(t,a),c=r===f;return e.jsxs("button",{type:"button",className:`ctp-user-item ${c?"active":""}`,onClick:()=>q(t,a),children:[e.jsxs("p",{className:"ctp-user-name",children:[t?.name||"Unknown"," ",t?.surname||""]}),e.jsxs("div",{className:"ctp-user-meta",children:[e.jsxs("span",{children:["Login: ",t?.login||"N/A"]}),e.jsxs("span",{children:["Role: ",t?.role||"N/A"]})]})]},r)}),[F,m,f,q]),se=async t=>{if(t.preventDefault(),!y)return;const a=y._id||y.id;if(!a){j.error("Selected user does not have an id.");return}R(!0);const r={...A};r.password||delete r.password;const c=G($,I);r.contact=c;try{const l=await pe(`/usersInternship/${a}`,r),p=H(l)||{...y,...r};z(re=>re.map((P,ne)=>{const ce=b(P,ne);return String(ce)===String(a)?{...P,...p}:P})),g(C({...y,...p}));const W=N(p?.contact||c);h(W.enabled),x(W.values),j.success("User was updated successfully.")}catch(l){j.error(l.message||"Failed to update user.")}finally{R(!1)}};return e.jsxs("div",{className:"ctp-page",children:[e.jsx("style",{children:`
        .ctp-page {
          min-height: calc(100vh - 64px);
          padding: clamp(16px, 3vw, 44px);
          background:
            radial-gradient(1000px 500px at 5% 0%, rgba(8, 145, 178, .12), transparent 60%),
            radial-gradient(850px 450px at 100% 10%, rgba(22, 163, 74, .10), transparent 60%),
            linear-gradient(180deg, rgba(240, 249, 255, .86), rgba(255, 255, 255, 1));
        }
        .ctp-shell {
          max-width: 1320px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(clamp(280px,30vw,420px), 420px) minmax(0, 1fr);
          gap: clamp(12px,2vw,18px);
        }
        @media(max-width:1024px){
          .ctp-shell {
            grid-template-columns: 1fr;
          }
        }
        .ctp-card {
          background: rgba(255, 255, 255, .95);
          border: 1px solid rgba(0, 0, 0, .08);
          border-radius: clamp(16px,2vw,20px);
          padding: clamp(16px, 2.2vw, 28px);
          box-shadow: 0 18px 50px rgba(14, 116, 144, .12);
          backdrop-filter: blur(12px);
        }
        .ctp-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(8px,2vw,12px);
          margin-bottom: clamp(12px,2vw,16px);
        }
        .ctp-title {
          margin: 0;
          font-family: 'Syne', system-ui, sans-serif;
          font-size: clamp(18px, 3.5vw, 28px);
          color: #0f172a;
          letter-spacing: -.01em;
        }
        .ctp-sub {
          margin: clamp(4px,1vw,8px) 0 0;
          font-size: clamp(12px,1.8vw,13px);
          color: #475569;
          line-height: 1.55;
        }
        .ctp-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: clamp(6px,1vw,8px) clamp(8px,2vw,12px);
          border-radius: 999px;
          background: rgba(8, 145, 178, .10);
          border: 1px solid rgba(8, 145, 178, .20);
          color: #0e7490;
          font-size: clamp(11px,1.8vw,12px);
          font-weight: 700;
          white-space: nowrap;
        }
        .ctp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(clamp(120px,40vw,1fr), 1fr));
          gap: clamp(10px,1.5vw,12px);
        }
        @media(max-width:640px){
          .ctp-grid {
            grid-template-columns: 1fr;
          }
        }
        .ctp-field {
          display: flex;
          flex-direction: column;
          gap: clamp(4px,1vw,6px);
        }
        .ctp-field--full {
          grid-column: 1 / -1;
        }
        .ctp-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: .05em;
          text-transform: uppercase;
        }
        .ctp-input {
          width: 100%;
          border-radius: 12px;
          border: 1.5px solid rgba(15, 23, 42, .12);
          background: rgba(255, 255, 255, .90);
          padding: 11px 13px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
        }
        .ctp-input:focus {
          border-color: rgba(8, 145, 178, .55);
          box-shadow: 0 0 0 4px rgba(8, 145, 178, .12);
          background: #fff;
        }
        .ctp-actions {
          margin-top: 16px;
          display: flex;
          justify-content: flex-end;
        }
        .ctp-contact-block {
          margin-top: 12px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(8, 145, 178, .16);
          background: rgba(8, 145, 178, .04);
          grid-column: 1 / -1;
        }
        .ctp-contact-title {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #0e7490;
          font-weight: 800;
          letter-spacing: .05em;
          text-transform: uppercase;
        }
        .ctp-contact-sub {
          margin: 0 0 10px 0;
          font-size: 12px;
          color: #64748b;
        }
        .ctp-contact-row {
          display: grid;
          grid-template-columns: minmax(130px, 170px) minmax(0, 1fr);
          gap: 10px;
          align-items: center;
          margin-bottom: 8px;
        }
        .ctp-contact-row:last-child {
          margin-bottom: 0;
        }
        .ctp-check {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #0f172a;
          font-weight: 600;
        }
        .ctp-check input {
          width: 16px;
          height: 16px;
          accent-color: #0891b2;
        }
        .ctp-btn {
          border: 1px solid rgba(8, 145, 178, .20);
          background: linear-gradient(135deg, #0891b2, #16a34a);
          color: #fff;
          border-radius: 12px;
          padding: 11px 16px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .ctp-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 30px rgba(8, 145, 178, .25);
        }
        .ctp-btn:disabled {
          opacity: .6;
          cursor: not-allowed;
        }
        .ctp-alert {
          margin-bottom: 12px;
          border-radius: 12px;
          padding: 11px 13px;
          font-size: 13px;
          border: 1px solid;
        }
        .ctp-alert--error {
          color: #991b1b;
          border-color: rgba(220, 38, 38, .24);
          background: rgba(220, 38, 38, .08);
        }
        .ctp-alert--ok {
          color: #166534;
          border-color: rgba(22, 163, 74, .24);
          background: rgba(22, 163, 74, .08);
        }
        .ctp-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }
        .ctp-count {
          font-size: 12px;
          color: #0e7490;
          background: rgba(8, 145, 178, .10);
          border: 1px solid rgba(8, 145, 178, .2);
          border-radius: 999px;
          padding: 6px 9px;
          font-weight: 700;
        }
        .ctp-layout {
          display: grid;
          grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
          gap: 14px;
        }
        .ctp-user-list {
          border: 1px solid rgba(0, 0, 0, .08);
          border-radius: 16px;
          background: rgba(248, 250, 252, .95);
          max-height: 72vh;
          overflow: auto;
          padding: 8px;
        }
        .ctp-user-item {
          width: 100%;
          text-align: left;
          border: 1px solid transparent;
          border-radius: 12px;
          background: transparent;
          padding: 10px;
          cursor: pointer;
          margin-bottom: 6px;
          transition: all .18s ease;
        }
        .ctp-user-item:hover {
          background: rgba(8, 145, 178, .06);
          border-color: rgba(8, 145, 178, .2);
        }
        .ctp-user-item.active {
          background: linear-gradient(135deg, rgba(8, 145, 178, .12), rgba(22, 163, 74, .08));
          border-color: rgba(8, 145, 178, .28);
        }
        .ctp-user-name {
          font-size: 14px;
          color: #0f172a;
          font-weight: 700;
          margin: 0;
        }
        .ctp-user-meta {
          margin-top: 3px;
          font-size: 12px;
          color: #64748b;
          display: grid;
          gap: 2px;
        }
        .ctp-empty {
          padding: 18px;
          color: #64748b;
          font-size: 13px;
          text-align: center;
        }
        @media (max-width: 980px) {
          .ctp-shell,
          .ctp-layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 720px) {
          .ctp-grid {
            grid-template-columns: 1fr;
          }
          .ctp-contact-row {
            grid-template-columns: 1fr;
          }
        }
      `}),e.jsxs("div",{className:"ctp-shell",children:[e.jsxs("div",{className:"ctp-card",children:[e.jsxs("div",{className:"ctp-head",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"ctp-title",children:"Create Staff Account"}),e.jsx("p",{className:"ctp-sub",children:"Add a new system user for internship workflows."})]}),e.jsxs("span",{className:"ctp-badge",children:[e.jsx(be,{size:14})," Admin only"]})]}),e.jsxs("form",{onSubmit:Z,children:[e.jsxs("div",{className:"ctp-grid",children:[e.jsxs("label",{className:"ctp-field",children:[e.jsx("span",{className:"ctp-label",children:"Name"}),e.jsx("input",{className:"ctp-input",name:"name",value:s.name,onChange:w,required:!0})]}),e.jsxs("label",{className:"ctp-field",children:[e.jsx("span",{className:"ctp-label",children:"Surname"}),e.jsx("input",{className:"ctp-input",name:"surname",value:s.surname,onChange:w,required:!0})]}),e.jsxs("label",{className:"ctp-field",children:[e.jsx("span",{className:"ctp-label",children:"Login"}),e.jsx("input",{className:"ctp-input",name:"login",value:s.login,onChange:w,required:!0})]}),e.jsxs("label",{className:"ctp-field",children:[e.jsx("span",{className:"ctp-label",children:"Password"}),e.jsx("input",{className:"ctp-input",type:"password",name:"password",value:s.password,onChange:w,required:!0})]}),e.jsxs("label",{className:"ctp-field ctp-field--full",children:[e.jsx("span",{className:"ctp-label",children:"Role"}),e.jsx(Y,{value:s.role,onChange:t=>w({target:{name:"role",value:t}}),options:V.map(t=>({value:t,label:t})),placeholder:"Select role"})]}),e.jsxs("div",{className:"ctp-contact-block",children:[e.jsx("p",{className:"ctp-contact-title",children:"Optional contact"}),e.jsx("p",{className:"ctp-contact-sub",children:"Enable only contact fields you need for this user."}),v.map(t=>e.jsxs("div",{className:"ctp-contact-row",children:[e.jsxs("label",{className:"ctp-check",htmlFor:`create-contact-${t.key}`,children:[e.jsx("input",{id:`create-contact-${t.key}`,type:"checkbox",checked:d[t.key],onChange:a=>Q(t.key,a.target.checked)}),e.jsx("span",{children:t.label})]}),d[t.key]&&e.jsx("input",{className:"ctp-input",type:t.type,value:u[t.key],onChange:a=>X(t.key,a.target.value),placeholder:t.placeholder})]},`create-${t.key}`))]})]}),e.jsx("div",{className:"ctp-actions",children:e.jsxs("button",{className:"ctp-btn",type:"submit",disabled:_,children:[e.jsx(ue,{size:15})," ",_?"Creating...":"Create Account"]})})]})]}),e.jsxs("div",{className:"ctp-card",children:[e.jsxs("div",{className:"ctp-panel-head",children:[e.jsx("h2",{className:"ctp-title",style:{fontSize:22,margin:0},children:"All Users"}),e.jsxs("span",{className:"ctp-count",children:[e.jsx(oe,{size:13,style:{marginRight:6}})," ",m.length]})]}),e.jsxs("div",{className:"ctp-layout",children:[e.jsx("div",{className:"ctp-user-list",children:ae}),e.jsxs("div",{children:[e.jsxs("div",{className:"ctp-head",style:{marginBottom:10},children:[e.jsxs("div",{children:[e.jsx("h3",{className:"ctp-title",style:{fontSize:20,margin:0},children:"Edit User"}),e.jsx("p",{className:"ctp-sub",style:{marginTop:5},children:"Update any field for the selected user and save changes."})]}),e.jsxs("span",{className:"ctp-badge",children:[e.jsx(ge,{size:13})," Full edit"]})]}),y?e.jsxs("form",{onSubmit:se,children:[e.jsxs("div",{className:"ctp-grid",children:[ye.map(t=>{const a=t.toLowerCase()==="role",r=t.toLowerCase()==="password";return e.jsxs("label",{className:`ctp-field ${t.length>12?"ctp-field--full":""}`,children:[e.jsx("span",{className:"ctp-label",children:t}),a?e.jsx(Y,{value:A[t]??"",onChange:c=>B({target:{name:t,value:c}}),options:V.map(c=>({value:c,label:c})),placeholder:"Select role"}):e.jsx("input",{className:"ctp-input",type:r?"password":"text",name:t,value:A[t]??"",onChange:B,placeholder:r?"Leave blank to keep current password":""})]},t)}),e.jsxs("div",{className:"ctp-contact-block",children:[e.jsx("p",{className:"ctp-contact-title",children:"Optional contact"}),e.jsx("p",{className:"ctp-contact-sub",children:"Select what contact information should be stored for this user."}),v.map(t=>e.jsxs("div",{className:"ctp-contact-row",children:[e.jsxs("label",{className:"ctp-check",htmlFor:`edit-contact-${t.key}`,children:[e.jsx("input",{id:`edit-contact-${t.key}`,type:"checkbox",checked:I[t.key],onChange:a=>ee(t.key,a.target.checked)}),e.jsx("span",{children:t.label})]}),I[t.key]&&e.jsx("input",{className:"ctp-input",type:t.type,value:$[t.key],onChange:a=>te(t.key,a.target.value),placeholder:t.placeholder})]},`edit-${t.key}`))]})]}),e.jsx("div",{className:"ctp-actions",children:e.jsxs("button",{className:"ctp-btn",type:"submit",disabled:D,children:[e.jsx(me,{size:15})," ",D?"Saving...":"Save User Changes"]})})]}):e.jsx("div",{className:"ctp-empty",style:{textAlign:"left",padding:"12px 0"},children:"Select a user from the left list to edit all fields."})]})]})]})]})]})}export{Se as default};
