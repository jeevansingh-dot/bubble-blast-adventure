export const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  fontSize: "16px",
  borderRadius: "10px",
  border: "2px solid #3b4290",
  background: "#0d1233",
  color: "white",
};

export const submitStyle = {
  padding: "12px 24px",
  fontSize: "18px",
  fontWeight: "bold",
  borderRadius: "999px",
  border: "none",
  cursor: "pointer",
  background: "#ffd93d",
  color: "#1b1b3a",
};

// A label + input pair (label is linked to the input for screen readers)
export function Field({ label, id, type = "text", value, onChange, ...rest }) {
  return (
    <label htmlFor={id} style={{ display: "block", textAlign: "left" }}>
      <span style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}>
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

// The card that wraps a form, with an error box at the top
export default function AuthCard({ title, error, children }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "380px",
        boxSizing: "border-box",
        background: "#1b2158",
        borderRadius: "20px",
        padding: "24px",
      }}
    >
      <h2 style={{ marginTop: 0, textAlign: "center" }}>{title}</h2>

      {error && (
        <div
          role="alert"
          style={{
            background: "#5b1f2e",
            border: "2px solid #ff4d5e",
            borderRadius: "10px",
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