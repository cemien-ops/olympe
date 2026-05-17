import { useState } from "react";

export default function SplashScreen({ onEnter }) {
  const [fading, setFading] = useState(false);

  const handleEnter = () => {
    if (fading) return;
    setFading(true);
    setTimeout(() => onEnter(), 800);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        overflow: "hidden",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.8s ease",
      }}
    >
      <img
        src="https://i.imgur.com/XLRPbpX.jpg"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center bottom",
        }}
      />

      {/* Porte gauche */}
      <button
        onClick={handleEnter}
        style={{
          position: "absolute",
          left: "35%",
          top: "45%",
          width: "14%",
          height: "50%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          zIndex: 2,
          transition: "box-shadow 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "inset 0 0 60px rgba(201,162,39,0.25)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
        aria-label="Entrer par la porte gauche"
      />

      {/* Porte droite */}
      <button
        onClick={handleEnter}
        style={{
          position: "absolute",
          left: "51%",
          top: "45%",
          width: "14%",
          height: "50%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          zIndex: 2,
          transition: "box-shadow 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "inset 0 0 60px rgba(201,162,39,0.25)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
        aria-label="Entrer par la porte droite"
      />

      {/* CTA visible */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          zIndex: 3,
          cursor: "pointer",
        }}
        onClick={handleEnter}
      >
        <div style={{
          color: "rgba(201,162,39,0.9)",
          fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
          fontFamily: "'Cinzel Decorative', serif",
          letterSpacing: "0.2em",
          textShadow: "0 0 20px rgba(201,162,39,0.8)",
          animation: "splashPulse 2s ease-in-out infinite",
        }}>
          ⚡ ENTRER ⚡
        </div>
      </div>
    </div>
  );
}
