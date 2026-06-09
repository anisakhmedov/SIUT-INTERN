export default function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 9, height: 108, paddingTop: 6 }}>
      {data.map((d, i) => (
        <div
          key={i}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
        >
          <span style={{ fontSize: 9.5, color: "var(--t3)", fontWeight: 600 }}>{d.v}</span>
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
