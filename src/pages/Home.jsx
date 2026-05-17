import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const FEAT = [
  { icon: "⚡", title: "Permissions",  text: "Des titres et insignes divins pour marquer ton rang au sein de l'Olympe", tab: "perms" },
  { icon: "🏛️", title: "Abonnements", text: "Des offrandes mensuelles t'accordant pouvoir et privilèges divins",        tab: "abos"  },
  { icon: "📜", title: "Whitelist",    text: "Accède aux cercles divins, là où seuls les initiés sont admis",            tab: "wl"    },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="home">
      <div className="home-hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <motion.span
              className="hero-kanji"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Ὄλυμπος
            </motion.span>
            Olympe
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            Serveur Discord • Univers grec antique • Dieux &amp; Légendes
          </motion.p>

          <motion.p
            className="hero-desc"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            Acquiers des permissions, des rôles divins et des abonnements pour enrichir ton expérience sur le serveur.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/shop" className="btn-primary">Voir la boutique ⚡</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/members" className="btn-primary">Nos membres</Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <section className="home-features">
        <div className="feat-grid">
          {FEAT.map((f, i) => (
            <motion.div
              key={f.tab}
              className={`feat-card feat-card-${f.tab}`}
              onClick={() => navigate("/shop", { state: { tab: f.tab } })}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.03, boxShadow: "0 18px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(201,162,39,0.35)" }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="feat-medallion">
                <span className="feat-icon">{f.icon}</span>
              </div>
              <h3 className="feat-card-title">{f.title}</h3>
              <div className="feat-card-rule" />
              <p>{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
