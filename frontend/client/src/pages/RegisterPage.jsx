import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthCard, { Field, submitStyle } from "../components/AuthCard.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // quick checks in the browser (the server checks everything again)
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setBusy(true);
    try {
      await register({ name, email, password, confirmPassword });
      navigate("/levels", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Create Account" error={error}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "14px" }}
      >
        <Field
          label="Name"
          id="name"
          autoComplete="name"
          minLength={2}
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Field
          label="Email"
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password (min 8 characters)"
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={busy}
          style={{ ...submitStyle, opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginBottom: 0 }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#ffd93d" }}>
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}