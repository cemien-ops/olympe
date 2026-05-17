import { useEffect, useRef } from "react";

export default function CursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let rafId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (x, y, count, burst) => {
      for (let i = 0; i < count; i++) {
        const angle = burst
          ? (i / count) * Math.PI * 2
          : Math.random() * Math.PI * 2;
        const speed = burst
          ? 2.5 + Math.random() * 3.5
          : 0.6 + Math.random() * 1.6;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed * (burst ? 1 : 0.45),
          vy: Math.sin(angle) * speed * (burst ? 1 : 0.45) - (burst ? 0 : 1.4),
          life: 1,
          size: burst ? 2 + Math.random() * 2.5 : 1 + Math.random() * 2,
          gold: burst || Math.random() > 0.25,
          burst,
        });
      }
    };

    const onMove = (e) => spawn(e.clientX, e.clientY, 3, false);
    const onClick = (e) => spawn(e.clientX, e.clientY, 22, true);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.life > 0.02);

      for (const p of particles) {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += p.burst ? 0.08 : 0.04;
        p.vx *= 0.97;
        p.life *= p.burst ? 0.93 : 0.87;

        const color = p.gold ? "#F0C060" : "#ffffff";
        const r = p.size * p.life;

        ctx.save();
        ctx.globalAlpha = p.life * (p.burst ? 0.85 : 0.7);
        ctx.fillStyle   = color;
        ctx.shadowColor = p.gold ? "#C9A227" : "#F0C060";
        ctx.shadowBlur  = p.burst ? 10 : 5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.3, r), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9998,
        mixBlendMode: "screen",
      }}
    />
  );
}
