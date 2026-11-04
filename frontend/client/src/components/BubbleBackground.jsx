// 14 bubbles floating upward behind every page (pure CSS animation, very light)
const BUBBLES = Array.from({ length: 14 }, (_, i) => ({
  size: 24 + ((i * 37) % 56),
  left: (i * 71) % 100,
  duration: 14 + ((i * 5) % 12),
  delay: -((i * 3) % 14), // negative = already in motion when the page opens
}));

export default function BubbleBackground() {
  return (
    <div className="bubble-bg" aria-hidden="true">
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}