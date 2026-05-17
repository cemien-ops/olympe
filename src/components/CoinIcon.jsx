import { motion, useAnimation } from "framer-motion";

export default function CoinIcon({ size = 18, style = {} }) {
  const controls = useAnimation();

  const handleHover = async () => {
    await controls.start({
      rotateY: [0, 180, 360],
      scale: [1, 1.2, 1],
      filter: [
        "drop-shadow(0 0 4px rgba(201,162,39,0.6))",
        "drop-shadow(0 0 12px rgba(240,192,96,1))",
        "drop-shadow(0 0 4px rgba(201,162,39,0.6))",
      ],
      transition: { duration: 0.6, ease: "easeInOut" },
    });
  };

  return (
    <motion.span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        marginLeft: "4px",
        verticalAlign: "middle",
        cursor: "default",
        perspective: "400px",
        ...style,
      }}
      onHoverStart={handleHover}
    >
      {/* Glow pulse en continu */}
      <motion.img
        animate={controls}
        initial={{
          filter: "drop-shadow(0 0 3px rgba(201,162,39,0.5))",
        }}
        src="https://i.imgur.com/o5vLGo6.jpg"
        alt="Drachmes"
        style={{
          width: size,
          height: size,
          objectFit: "cover",
          borderRadius: "50%",
          display: "block",
        }}
      />

      {/* Anneau doré pulsant autour */}
      <motion.span
        style={{
          position: "absolute",
          width: size + 6,
          height: size + 6,
          borderRadius: "50%",
          border: "1px solid rgba(201,162,39,0.4)",
          pointerEvents: "none",
        }}
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.span>
  );
}
