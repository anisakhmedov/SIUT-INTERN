export default function FormField({ label, type = "text", ta, value, onChange, error }) {
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
        <span style={{ fontSize: 11, color: "#ef4444", marginTop: 3, display: "block" }}>
          {error}
        </span>
      )}
    </div>
  );
}
