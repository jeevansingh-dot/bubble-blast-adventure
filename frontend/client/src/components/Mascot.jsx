// Bubbo: our original helper character (drawn with SVG, no images needed)
export default function Mascot({ size = 150 }) {
  return (
    <svg
      className="mascot"
      width={size}
      height={size}
      viewBox="0 0 150 150"
      role="img"
      aria-label="Bubbo, the friendly bubble helper"
    >
      <defs>
        <radialGradient id="bubboBody" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="45%" stopColor="#ffd93d" />
          <stop offset="100%" stopColor="#ff9a3d" />
        </radialGradient>
      </defs>
      <ellipse cx="75" cy="140" rx="34" ry="6" fill="rgba(0,0,0,0.25)" />
      <circle cx="75" cy="72" r="58" fill="url(#bubboBody)" stroke="rgba(0,0,0,0.25)" strokeWidth="3" />
      <ellipse cx="52" cy="40" rx="14" ry="8" fill="rgba(255,255,255,0.7)" transform="rotate(-30 52 40)" />
      <circle cx="55" cy="72" r="9" fill="#1b1b3a" />
      <circle cx="95" cy="72" r="9" fill="#1b1b3a" />
      <circle cx="58" cy="69" r="3" fill="white" />
      <circle cx="98" cy="69" r="3" fill="white" />
      <path d="M58 94 Q75 112 92 94" fill="none" stroke="#1b1b3a" strokeWidth="5" strokeLinecap="round" />
      <circle cx="40" cy="90" r="7" fill="rgba(255,90,120,0.45)" />
      <circle cx="110" cy="90" r="7" fill="rgba(255,90,120,0.45)" />
    </svg>
  );
}