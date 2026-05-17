export default function Particles() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: `${1 + (i % 3)}px`,
            height: `${12 + (i % 8) * 2}px`,
            background: `linear-gradient(180deg, rgba(240,192,96,0.95) 0%, rgba(201,162,39,0.5) 60%, transparent 100%)`,
            left: `${(i * 2.05 + 0.5) % 100}%`,
            top: "-30px",
            opacity: 0.6,
            borderRadius: "1px",
            boxShadow: "0 0 4px rgba(201,162,39,0.6)",
            animation: `goldFall ${3 + (i % 8) * 0.6}s ${-(i * 0.25)}s linear infinite`,
            transform: `rotate(${-5 + (i % 11) - 5}deg)`,
          }}
        />
      ))}
    </div>
  );
}
