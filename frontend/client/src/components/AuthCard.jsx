import Mascot from "./Mascot.jsx";

export const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 14px",
  fontSize: "16px",
  borderRadius: "12px",
  border: "2px solid rgba(255,255,255,0.2)",
  background: "rgba(10,15,46,0.7)",
  color: "white",
};

export const submitStyle = {
  padding: "13px 24px",
  fontSize: "18px",
  fontWeight: 900,
  borderRadius: "999px",
  border: "none",
  cursor: "pointer",
  background: "linear-gradient(180deg, #ffe36b, #ffb81f)",
  color: "#3a2a00",
  boxShadow: "0 4px 0 #b8741a",
};

// A label + input pair (label is linked to the input for screen readers)
export function Field({ label, id, type = "text", value, onChange, ...rest }) {
  return (
    <label htmlFor={id} style={{ display: "block", textAlign: "left" }}>
      <span style={{ display: "block", fontSize: "14px", marginBottom: "4px", fontWeight: 600 }}>
        {label}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required
        style={inputStyle}
        {...rest}
      />
    </label>
  );
}

// The card that wraps a form, with Bubbo on top and an error box
export default function AuthCard({ title, error, children }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "400px",
        boxSizing: "border-box",
        background: "rgba(27,33,88,0.72)",
        border: "1px solid rgba(255,255,255,0.15)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        borderRadius: "24px",
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center", marginTop: "-6px" }}>
        <Mascot size={84} />
      </div>
      <h2 style={{ marginTop: 0, textAlign: "center" }}>{title}</h2>

      {error && (
        <div
          role="alert"
          style={{
            background: "rgba(91,31,46,0.9)",
            border: "2px solid #ff4d5e",
            borderRadius: "12px",
            padding: "10px 12px",
            marginBottom: "14px",
            fontSize: "15px",
          }}
        >
          {error}
        </div>
      )}

      {children}
    </div>
  );
}