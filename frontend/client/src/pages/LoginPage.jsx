import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthCard, { Field, submitStyle } from "../components/AuthCard.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login({ email, password });
      // go back to the page the player wanted, or the level list
      navigate(location.state?.from || "/levels", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Log In" error={error}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "14px" }}
      >
        <Field
          label="Email"
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={busy}
          style={{ ...submitStyle, opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginBottom: 0 }}>
        New here?{" "}
        <Link to="/register" style={{ color: "#ffd93d" }}>
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}