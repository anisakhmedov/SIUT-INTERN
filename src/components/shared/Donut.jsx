export default function Donut({ v = 4.6 }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const pct = (v / 5) * 100;

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
        <circle cx="54" cy="54" r={r} fill="none" stroke="rgba(0,0,0,.07)" strokeWidth="9" />
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
        <div style={{ fontFamily: "Montserrat", fontSize: 19, fontWeight: 800, color: "var(--t1)" }}>
          {v}
        </div>
        <div style={{ fontSize: 9, color: "var(--t3)", fontWeight: 600 }}>/5.0</div>
      </div>
    </div>
  );
}
