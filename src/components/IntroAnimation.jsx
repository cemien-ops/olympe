import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useState, useEffect } from "react";

const LETTERS = "OLYMPE".split("");
const STRIPS = 12;

// Pre-computed burst particles (deterministic, no random on render)
const PARTICLES = Array.from({ length: 32 }, (_, i) => {
  const angle = (i / 32) * Math.PI * 2;
  const dist  = 55 + (i * 23) % 130;
  return {
    x:     Math.cos(angle) * dist,
    y:     Math.sin(angle) * dist,
    size:  1.5 + (i % 4) * 0.6,
    delay: i * 0.018,
    bright: i % 3 === 0,
  };
});

// Pre-computed secondary sparks
const SPARKS = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2 + 0.2;
  const dist  = 20 + (i * 11) % 50;
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, delay: i * 0.03 };
});

export default function IntroAnimation({ onComplete }) {
  const [phase, setPhase] = useState(0);
  // 0: bolt draws
  // 1: flash + letters
  // 2: curtains reveal
  const flashAnim = useAnimation();

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase(1);
      flashAnim.start({
        opacity: [0, 0.9, 0],
        transition: { duration: 0.45, times: [0, 0.1, 1] },
      });
    }, 1300);
    const t2 = setTimeout(() => setPhase(2), 3000);
    const t3 = setTimeout(onComplete, 4300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Strip delay: center opens first (portal iris effect)
  const stripDelay = (i) => {
    const dist = Math.abs(i - (STRIPS - 1) / 2);
    const norm = dist / ((STRIPS - 1) / 2);
    return norm * 0.22;
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, overflow: "hidden" }}>

      {/* === CURTAIN STRIPS === */}
      {Array.from({ length: STRIPS }, (_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            top:    `${(i / STRIPS) * 100}%`,
            left:   0, right: 0,
            height: `${100 / STRIPS + 0.2}%`,
            background: i % 2 === 0
              ? "linear-gradient(180deg,#0D0A1C,#0A0812)"
              : "linear-gradient(180deg,#0A0812,#0D0A1C)",
            zIndex: 5,
            originY: 0.5,
          }}
          initial={{ scaleY: 1 }}
          animate={phase >= 2 ? { scaleY: 0 } : { scaleY: 1 }}
          transition={{ duration: 0.6, delay: stripDelay(i), ease: [0.76, 0, 0.24, 1] }}
        />
      ))}

      {/* === CENTRE CONTENT (sits above strips) === */}
      <motion.div
        style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "1.8rem",
        }}
        animate={phase >= 2 ? { opacity: 0, scale: 0.92 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeIn" }}
      >

        {/* ── LIGHTNING BOLT SVG ── */}
        <motion.svg
          width="56" height="108"
          viewBox="0 0 56 108"
          style={{ filter: "drop-shadow(0 0 18px rgba(240,192,96,0.55))" }}
        >
          <defs>
            <filter id="glow-b">
              <feGaussianBlur stdDeviation="5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* halo glow fill */}
          <motion.path
            d="M 36 2 L 10 58 L 28 58 L 4 106 L 50 46 L 30 46 Z"
            fill="rgba(240,192,96,0.18)"
            filter="url(#glow-b)"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* outer glow stroke */}
          <motion.path
            d="M 36 2 L 10 58 L 28 58 L 4 106 L 50 46 L 30 46 Z"
            fill="none"
            stroke="rgba(240,192,96,0.4)"
            strokeWidth="5"
            filter="url(#glow-b)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />

          {/* sharp main stroke */}
          <motion.path
            d="M 36 2 L 10 58 L 28 58 L 4 106 L 50 46 L 30 46 Z"
            fill="none"
            stroke="#F0C060"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />

          {/* electric crackle top */}
          <motion.line
            x1="36" y1="2" x2="44" y2="16"
            stroke="#fff" strokeWidth="1" opacity="0.7"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.4, delay: 0.9 }}
          />
          <motion.line
            x1="36" y1="2" x2="28" y2="14"
            stroke="#F0C060" strokeWidth="0.8" opacity="0.6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.4, delay: 1.0 }}
          />
        </motion.svg>

        {/* ── OLYMPE LETTERS ── */}
        <div style={{ display: "flex", gap: "6px", position: "relative" }}>
          {LETTERS.map((letter, i) => (
            <motion.span
              key={i}
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "clamp(2.8rem, 7.5vw, 5rem)",
                fontWeight: "700",
                color: "#F0C060",
                display: "inline-block",
                lineHeight: 1,
                textShadow:
                  "0 0 20px rgba(240,192,96,0.8), 0 0 50px rgba(201,162,39,0.4), 0 2px 8px rgba(0,0,0,0.8)",
              }}
              initial={{ y: -70, opacity: 0, rotateX: 80, scale: 0.7 }}
              animate={phase >= 1 ? { y: 0, opacity: 1, rotateX: 0, scale: 1 } : {}}
              transition={{
                delay: 0.08 + i * 0.07,
                type: "spring",
                stiffness: 380,
                damping: 20,
              }}
            >
              {letter}
            </motion.span>
          ))}

          {/* Gold particle burst on letter impact */}
          {phase >= 1 && PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              style={{
                position: "absolute",
                top: "50%", left: "50%",
                width:  p.size, height: p.size,
                borderRadius: "50%",
                background: p.bright ? "#fff" : "#F0C060",
                boxShadow: `0 0 ${p.bright ? 6 : 3}px ${p.bright ? "#fff" : "#C9A227"}`,
                pointerEvents: "none",
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
              transition={{ duration: 1.4, delay: p.delay, ease: "easeOut" }}
            />
          ))}

          {/* Inner sparks (tight cluster) */}
          {phase >= 1 && SPARKS.map((s, i) => (
            <motion.span
              key={i}
              style={{
                position: "absolute", top: "50%", left: "50%",
                width: 1.5, height: 1.5,
                borderRadius: "50%",
                background: "#fff",
                pointerEvents: "none",
              }}
              initial={{ x: 0, y: 0, opacity: 0.9 }}
              animate={{ x: s.x, y: s.y, opacity: 0 }}
              transition={{ duration: 0.5, delay: s.delay, ease: "easeOut" }}
            />
          ))}
        </div>

        {/* ── GREEK SUBTITLE ── */}
        <motion.p
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(0.85rem, 2vw, 1.05rem)",
            letterSpacing: "0.45em",
            color: "rgba(201,162,39,0.65)",
            margin: 0,
            textTransform: "uppercase",
          }}
          initial={{ opacity: 0, y: 18 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.72, duration: 0.9, ease: "easeOut" }}
        >
          Ὄλυμπος
        </motion.p>

        {/* ── GOLDEN SCAN LINE ── */}
        <motion.div
          style={{
            position: "absolute",
            top: "50%", left: "10%",
            width: "80%", height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(240,192,96,0.8), transparent)",
            pointerEvents: "none",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={phase >= 1 ? { scaleX: [0, 1, 1, 0], opacity: [0, 0.9, 0.9, 0] } : {}}
          transition={{ delay: 0.5, duration: 1.0, times: [0, 0.3, 0.7, 1] }}
        />
      </motion.div>

      {/* === WHITE FLASH === */}
      <motion.div
        style={{
          position: "absolute", inset: 0, zIndex: 20,
          background: "white", pointerEvents: "none",
        }}
        initial={{ opacity: 0 }}
        animate={flashAnim}
      />

      {/* === SKIP BUTTON === */}
      <motion.button
        style={{
          position: "absolute", bottom: "1.8rem", right: "1.8rem",
          zIndex: 30, background: "transparent",
          border: "1px solid rgba(201,162,39,0.22)",
          color: "rgba(201,162,39,0.45)", padding: "7px 16px",
          fontFamily: "'Cinzel', serif", fontSize: "0.72rem",
          letterSpacing: "0.14em", cursor: "pointer", borderRadius: "4px",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        whileHover={{
          borderColor: "rgba(201,162,39,0.65)",
          color: "rgba(201,162,39,0.95)",
        }}
        onClick={onComplete}
      >
        PASSER →
      </motion.button>
    </div>
  );
}
