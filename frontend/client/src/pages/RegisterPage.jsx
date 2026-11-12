
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

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
      setError(err.message || "Unable to create account");
      setBusy(false);
    }
  }

  return (
    <div className="arcade-register">
      <style>{`
        .arcade-register {
          min-height: calc(100vh - 70px);
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 35px 16px;
          position: relative;
          overflow: hidden;
          isolation: isolate;
          color: white;
          background:
            radial-gradient(ellipse at 50% 15%, rgba(65,76,180,.20), transparent 50%),
            radial-gradient(ellipse at 10% 80%, rgba(111,55,190,.13), transparent 45%),
            #080d1b;
          font-family: Inter, system-ui, sans-serif;
        }

        .arcade-register * {
          box-sizing: border-box;
        }

        .register-stars {
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: .55;
          background-image:
            radial-gradient(2px 2px at 20% 20%, #fff, transparent),
            radial-gradient(2px 2px at 80% 30%, #8b9dff, transparent),
            radial-gradient(2px 2px at 60% 80%, #fff, transparent),
            radial-gradient(2px 2px at 30% 70%, #a78bfa, transparent);
          background-size: 220px 220px;
        }

        .register-orb {
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: .16;
          pointer-events: none;
          z-index: -1;
        }

        .register-orb.one {
          background: #514bff;
          top: -120px;
          left: -100px;
        }

        .register-orb.two {
          background: #00c2ff;
          right: -130px;
          bottom: -130px;
        }

        .register-card {
          width: 100%;
          max-width: 450px;
          padding: 35px 34px;
          position: relative;
          z-index: 2;
          border-radius: 27px;
          background: linear-gradient(145deg, rgba(31,42,78,.94), rgba(13,19,39,.97));
          border: 1px solid rgba(143,158,255,.25);
          box-shadow:
            0 25px 70px rgba(0,0,0,.45),
            inset 0 1px 0 rgba(255,255,255,.09),
            0 0 35px rgba(81,87,255,.10);
          animation: registerEnter .65s ease both;
        }

        .register-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 12%;
          width: 76%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #8c8aff, #45d8ff, transparent);
        }

        .register-logo {
          width: 78px;
          height: 78px;
          margin: 0 auto 17px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 39px;
          background: radial-gradient(circle at 32% 25%, #fff5ad, #ffd84a 25%, #f59e0b 60%, #a64c08);
          box-shadow:
            0 0 18px rgba(255,190,45,.55),
            0 0 45px rgba(255,166,0,.25),
            inset -7px -9px 13px rgba(130,60,0,.55),
            inset 5px 5px 10px rgba(255,255,255,.8);
          animation: registerFloat 3s ease-in-out infinite;
        }

        .register-heading {
          text-align: center;
          font-size: 27px;
          font-weight: 950;
          letter-spacing: 1.2px;
          margin: 0;
          color: #fff;
        }

        .register-heading span {
          background: linear-gradient(90deg, #38d9ff, #8c8bff);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .register-subtitle {
          text-align: center;
          color: #9ba8ca;
          font-size: 12px;
          line-height: 1.6;
          margin: 9px 0 25px;
        }

        .register-field {
          margin-bottom: 15px;
        }

        .register-label {
          display: block;
          margin-bottom: 8px;
          color: #cbd5f0;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1.2px;
        }

        .register-input-wrap {
          position: relative;
        }

        .register-input {
          width: 100%;
          height: 49px;
          padding: 0 14px;
          border-radius: 12px;
          outline: none;
          color: #fff;
          background: rgba(5,12,29,.8);
          border: 1px solid rgba(139,157,211,.22);
          font-size: 13px;
          transition: .25s ease;
        }

        .register-input::placeholder {
          color: #667391;
        }

        .register-input:focus {
          border-color: #50cfff;
          box-shadow: 0 0 0 3px rgba(56,189,248,.10), 0 0 17px rgba(56,189,248,.12);
        }

        .register-password {
          padding-right: 65px;
        }

        .register-toggle {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: #7dd3fc;
          cursor: pointer;
          font-size: 10px;
          font-weight: 850;
        }

        .register-error {
          margin-bottom: 16px;
          padding: 11px;
          border-radius: 12px;
          color: #ffaaaa;
          background: rgba(239,68,68,.10);
          border: 1px solid rgba(239,68,68,.28);
          font-size: 12px;
          font-weight: 700;
          text-align: center;
        }

        .register-submit {
          width: 100%;
          height: 52px;
          margin-top: 8px;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          color: #21152a;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: 1.2px;
          background: linear-gradient(180deg, #ffe27a, #ffb72e 55%, #e58a13);
          box-shadow:
            0 5px 0 #a85b0b,
            0 12px 25px rgba(245,158,11,.24),
            inset 0 2px 3px rgba(255,255,255,.75);
          transition: .2s ease;
        }

        .register-submit:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 7px 0 #a85b0b, 0 16px 30px rgba(245,158,11,.3);
        }

        .register-submit:active:not(:disabled) {
          transform: translateY(4px);
          box-shadow: 0 1px 0 #a85b0b;
        }

        .register-submit:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .register-divider {
          height: 1px;
          margin: 24px 0 19px;
          background: linear-gradient(90deg, transparent, rgba(150,164,220,.25), transparent);
        }

        .register-login {
          text-align: center;
          color: #96a3c2;
          font-size: 12px;
        }

        .register-login a {
          color: #57d5ff;
          font-weight: 850;
          text-decoration: none;
          margin-left: 4px;
        }

        .register-login a:hover {
          color: #a6ecff;
          text-decoration: underline;
        }

        .register-footer {
          margin-top: 21px;
          text-align: center;
          font-size: 9px;
          letter-spacing: 1.8px;
          color: #647293;
        }

        @keyframes registerFloat {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }

        @keyframes registerEnter {
          from { opacity: 0; transform: translateY(20px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 480px) {
          .arcade-register { padding: 24px 12px; }
          .register-card { padding: 30px 21px; border-radius: 23px; }
          .register-heading { font-size: 24px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .register-card, .register-logo { animation: none; }
        }
      `}</style>

      <div className="register-stars" />
      <div className="register-orb one" />
      <div className="register-orb two" />

      <main className="register-card">
        <div className="register-logo">🎮</div>

        <h1 className="register-heading">
          JOIN THE <span>ADVENTURE</span>
        </h1>

        <p className="register-subtitle">
          Create your player account.
          <br />
          Your gaming journey starts here!
        </p>

        {error && (
          <div className="register-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="register-field">
            <label className="register-label" htmlFor="register-name">
              PLAYER NAME
            </label>
            <input
              className="register-input"
              id="register-name"
              type="text"
              autoComplete="name"
              minLength={2}
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="register-email">
              EMAIL ADDRESS
            </label>
            <input
              className="register-input"
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="abc@gmail.com"
              required
            />
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="register-password">
              PASSWORD (MIN 8 CHARACTERS)
            </label>

            <div className="register-input-wrap">
              <input
                className="register-input register-password"
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                minLength={8}
                required
              />

              <button
                type="button"
                className="register-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <div className="register-field">
            <label className="register-label" htmlFor="register-confirm">
              CONFIRM PASSWORD
            </label>

            <div className="register-input-wrap">
              <input
                className="register-input register-password"
                id="register-confirm"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                minLength={8}
                required
              />

              <button
                type="button"
                className="register-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="register-submit"
            disabled={busy}
          >
            {busy ? "⏳ CREATING ACCOUNT..." : "🚀  CREATE ACCOUNT"}
          </button>
        </form>

        <div className="register-divider" />

        <div className="register-login">
          Already have an account?
          <Link to="/login">Log In</Link>
        </div>

        <div className="register-footer">
          ✦ BUBBLE BLAST ADVENTURE ✦
        </div>
      </main>
    </div>
  );
}
