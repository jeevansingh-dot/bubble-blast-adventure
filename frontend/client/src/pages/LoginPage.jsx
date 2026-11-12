
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="arcade-login">
      <style>{`
        .arcade-login {
          min-height: calc(100vh - 70px);
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 35px 16px;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(ellipse at 50% 15%, rgba(65, 76, 180, .20), transparent 50%),
            radial-gradient(ellipse at 10% 80%, rgba(111, 55, 190, .13), transparent 45%),
            #080d1b;
          color: white;
          font-family: Inter, system-ui, sans-serif;
          isolation: isolate;
        }

        .arcade-login * {
          box-sizing: border-box;
        }

        .login-stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .55;
          background-image:
            radial-gradient(2px 2px at 20% 20%, #fff, transparent),
            radial-gradient(2px 2px at 80% 30%, #8b9dff, transparent),
            radial-gradient(2px 2px at 60% 80%, #fff, transparent),
            radial-gradient(2px 2px at 30% 70%, #a78bfa, transparent),
            radial-gradient(1px 1px at 90% 85%, #fff, transparent);
          background-size: 220px 220px;
          z-index: -1;
        }

        .login-orb {
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: .16;
          pointer-events: none;
          z-index: -1;
        }

        .login-orb.one {
          background: #514bff;
          top: -120px;
          left: -100px;
        }

        .login-orb.two {
          background: #00c2ff;
          right: -130px;
          bottom: -130px;
        }

        .login-card {
          width: 100%;
          max-width: 430px;
          padding: 38px 34px;
          position: relative;
          z-index: 2;
          border-radius: 27px;
          background: linear-gradient(
            145deg,
            rgba(31, 42, 78, .94),
            rgba(13, 19, 39, .97)
          );
          border: 1px solid rgba(143, 158, 255, .25);
          box-shadow:
            0 25px 70px rgba(0,0,0,.45),
            inset 0 1px 0 rgba(255,255,255,.09),
            0 0 35px rgba(81, 87, 255, .10);
          animation: loginEnter .65s ease both;
        }

        .login-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 12%;
          width: 76%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            #8c8aff,
            #45d8ff,
            transparent
          );
        }

        .login-logo {
          width: 91px;
          height: 91px;
          margin: 0 auto 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          font-size: 45px;
          background: radial-gradient(
            circle at 32% 25%,
            #fff5ad 0%,
            #ffd84a 25%,
            #f59e0b 60%,
            #a64c08 100%
          );
          box-shadow:
            0 0 18px rgba(255, 190, 45, .55),
            0 0 45px rgba(255, 166, 0, .25),
            inset -7px -9px 13px rgba(130, 60, 0, .55),
            inset 5px 5px 10px rgba(255,255,255,.8);
          animation: loginFloat 3s ease-in-out infinite;
        }

        .login-logo::after {
          content: "";
          position: absolute;
          width: 110px;
          height: 110px;
          border: 1px solid rgba(255, 211, 94, .35);
          border-radius: 50%;
          animation: loginPulse 3s ease-in-out infinite;
        }

        .login-heading {
          text-align: center;
          font-size: 28px;
          font-weight: 950;
          letter-spacing: 1.5px;
          margin: 0;
          color: #fff;
        }

        .login-heading span {
          background: linear-gradient(90deg, #38d9ff, #8c8bff);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .login-subtitle {
          text-align: center;
          font-size: 13px;
          color: #9ba8ca;
          margin: 10px 0 28px;
          line-height: 1.6;
        }

        .login-field {
          margin-bottom: 19px;
        }

        .login-label {
          display: block;
          margin-bottom: 9px;
          color: #cbd5f0;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 1.2px;
        }

        .login-input-wrap {
          position: relative;
        }

        .login-input {
          width: 100%;
          height: 52px;
          padding: 0 15px;
          border-radius: 13px;
          outline: none;
          color: #fff;
          background: rgba(5, 12, 29, .8);
          border: 1px solid rgba(139, 157, 211, .22);
          font-size: 14px;
          transition: .25s ease;
        }

        .login-input::placeholder {
          color: #667391;
        }

        .login-input:focus {
          border-color: #50cfff;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, .10),
                      0 0 17px rgba(56, 189, 248, .12);
        }

        .login-password {
          padding-right: 65px;
        }

        .login-toggle {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: #7dd3fc;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
        }

        .login-error {
          margin-bottom: 17px;
          padding: 12px;
          border-radius: 12px;
          color: #ffaaaa;
          background: rgba(239, 68, 68, .10);
          border: 1px solid rgba(239, 68, 68, .28);
          font-size: 12px;
          font-weight: 700;
          text-align: center;
        }

        .login-submit {
          width: 100%;
          height: 54px;
          margin-top: 9px;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          color: #21152a;
          font-size: 14px;
          font-weight: 950;
          letter-spacing: 1.2px;
          background: linear-gradient(180deg, #ffe27a, #ffb72e 55%, #e58a13);
          box-shadow:
            0 5px 0 #a85b0b,
            0 12px 25px rgba(245, 158, 11, .24),
            inset 0 2px 3px rgba(255,255,255,.75);
          transition: transform .15s, box-shadow .15s, filter .2s;
        }

        .login-submit:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow:
            0 7px 0 #a85b0b,
            0 16px 30px rgba(245, 158, 11, .3);
        }

        .login-submit:active:not(:disabled) {
          transform: translateY(4px);
          box-shadow: 0 1px 0 #a85b0b;
        }

        .login-submit:disabled {
          opacity: .7;
          cursor: not-allowed;
        }

        .login-divider {
          height: 1px;
          margin: 27px 0 21px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(150, 164, 220, .25),
            transparent
          );
        }

        .login-register {
          text-align: center;
          color: #96a3c2;
          font-size: 13px;
        }

        .login-register a {
          color: #57d5ff;
          font-weight: 850;
          text-decoration: none;
          margin-left: 4px;
        }

        .login-register a:hover {
          color: #a6ecff;
          text-decoration: underline;
        }

        .login-footer {
          margin-top: 25px;
          text-align: center;
          font-size: 9px;
          letter-spacing: 1.8px;
          color: #647293;
        }

        @keyframes loginFloat {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-9px) rotate(5deg); }
        }

        @keyframes loginPulse {
          0%, 100% { transform: scale(.95); opacity: .3; }
          50% { transform: scale(1.13); opacity: .8; }
        }

        @keyframes loginEnter {
          from { opacity: 0; transform: translateY(20px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 480px) {
          .arcade-login {
            padding: 25px 13px;
          }

          .login-card {
            padding: 32px 22px;
            border-radius: 23px;
          }

          .login-heading {
            font-size: 25px;
          }
        }
      `}</style>

      <div className="login-stars" />
      <div className="login-orb one" />
      <div className="login-orb two" />

      <main className="login-card">
        <div className="login-logo">😊</div>

        <h1 className="login-heading">
          WELCOME <span>BACK</span>
        </h1>

        <p className="login-subtitle">
          Your next adventure is waiting.
          <br />
          Sign in and continue your journey!
        </p>

        {error && (
          <div className="login-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">EMAIL ADDRESS</label>
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="abc@gmail.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label">PASSWORD</label>

            <div className="login-input-wrap">
              <input
                className="login-input login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="login-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <button
            className="login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "⏳ SIGNING IN..." : "🚀  LOG IN"}
          </button>
        </form>

        <div className="login-divider" />

        <div className="login-register">
          New to the adventure?
          <Link to="/register">Create Account</Link>
        </div>

        <div className="login-footer">
          ✦ BUBBLE BLAST ADVENTURE ✦
        </div>
      </main>
    </div>
  );
}
