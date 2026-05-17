import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useAnimate } from "framer-motion";
import { useAuth } from "../context/AuthContext";

function RpgCorners() {
  return (<><span className="rpg-c tl"/><span className="rpg-c tr"/><span className="rpg-c bl"/><span className="rpg-c br"/></>);
}

const TIERS = {
  createur:    { label:"Fondateur",    icon:"✦",  col:"#C8B4E8", rgb:"200,180,232", slots:1    },
  gerant:      { label:"Gérant",      icon:"♔", col:"#C9A227", rgb:"201,162,39",  slots:1    },
  diplomate:   { label:"Diplomate",   icon:"⚔", col:"#8BA3C7", rgb:"139,163,199", slots:2    },
  ambassadeur: { label:"Ambassadeur", icon:"🏛️", col:"#CD7F32", rgb:"205,127,50",  slots:10   },
  membre:      { label:"Membre",      icon:"⚡", col:"#8A7A58", rgb:"138,122,88",  slots:null },
};

function categorize(m) {
  if (m.pseudo === "Chaos")             return "createur";
  if (m.perms?.includes("Gérant"))      return "gerant";
  if (m.perms?.includes("Diplomate"))   return "diplomate";
  if (m.perms?.includes("Ambassadeur")) return "ambassadeur";
  return "membre";
}

function renderAvatar(avatar, size = "3rem", circle = true) {
  if (!avatar) return <span style={{ fontSize: size, lineHeight: 1 }}>⚡</span>;
  if (typeof avatar === "string" && (avatar.startsWith("data:") || avatar.startsWith("http")))
    return <img src={avatar} alt="" style={{ width: size, height: size, borderRadius: circle ? "50%" : 0, objectFit: "cover", display: "block" }} />;
  return <span style={{ fontSize: size, lineHeight: 1 }}>{avatar}</span>;
}

// ─── Pantheon Entrance ────────────────────────────────────────
function PantheonEntrance({ onComplete }) {
  const [scope, animate] = useAnimate();
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const seq = async () => {
      try {
        await animate(".pe-greek",
          { opacity: 1, y: 0, filter: "blur(0px)" },
          { duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }
        );
        animate(".pe-line",  { opacity: 0.85, scaleX: 1 }, { duration: 0.45 });
        await animate(".pe-sub",  { opacity: 0.9, y: 0 },  { duration: 0.5 });
        await animate(".pe-tagline", { opacity: 0.55 },     { duration: 0.4 });

        await new Promise(r => setTimeout(r, 380));

        await animate(".pe-flash",
          { opacity: [0, 0.92, 0, 0.78, 0, 0.48, 0] },
          { duration: 0.68, times: [0, 0.07, 0.22, 0.38, 0.54, 0.72, 1] }
        );

        await new Promise(r => setTimeout(r, 200));

        animate(".pe-bloom",  { opacity: 1 },     { duration: 0.35 });
        animate(".pe-door-l", { x: "-100%" },     { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
        await animate(".pe-door-r", { x: "100%" },{ duration: 1.2, ease: [0.22, 1, 0.36, 1] });

        animate(".pe-title-wrap", { opacity: 0 }, { duration: 0.45 });
        animate(".pe-cols",       { opacity: 0 }, { duration: 0.5 });
        await animate(".pe-bloom", { opacity: 0 }, { duration: 0.9, ease: "easeInOut" });

        finish();
      } catch {}
    };
    seq();
  }, []);

  return (
    <motion.div
      ref={scope}
      className="pantheon-entrance"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      onClick={finish}
    >
      <div className="pe-bg" />
      <div className="pe-torch pe-torch-l" />
      <div className="pe-torch pe-torch-r" />

      <div className="pe-cols">
        <div className="pe-col pe-col-l">
          <div className="pe-cap" /><div className="pe-shaft" /><div className="pe-base" />
        </div>
        <div className="pe-col pe-col-r">
          <div className="pe-cap" /><div className="pe-shaft" /><div className="pe-base" />
        </div>
      </div>

      <div className="pe-door pe-door-l">
        <div className="pe-door-face">
          <div className="pe-panel" /><div className="pe-panel" /><div className="pe-panel" />
        </div>
        <div className="pe-handle" />
      </div>

      <div className="pe-door pe-door-r">
        <div className="pe-door-face">
          <div className="pe-panel" /><div className="pe-panel" /><div className="pe-panel" />
        </div>
        <div className="pe-medallion">⚡</div>
        <div className="pe-handle" />
      </div>

      <div className="pe-bloom" />

      <div className="pe-title-wrap">
        <div className="pe-greek">ὌΛΥΜΠΟΣ</div>
        <div className="pe-line" />
        <div className="pe-sub">L'Enceinte Olympienne</div>
        <div className="pe-tagline">Seuls les élus franchissent ces portes</div>
      </div>

      <div className="pe-flash" />

      <button className="pe-skip" onClick={(e) => { e.stopPropagation(); finish(); }}>
        Passer ↵
      </button>
    </motion.div>
  );
}

// ─── Cosmic constants ─────────────────────────────────────────
const STARS = Array.from({ length: 130 }, (_, i) => ({
  id: i,
  x:   (i * 37.31 + 11.5) % 100,
  y:   (i * 29.67 + 17.3) % 100,
  s:   0.5 + (i % 7) * 0.32,
  dur: 1.8 + (i % 9) * 0.42,
  del: (i * 0.23) % 4,
}));

const BURST = Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2;
  return { id: i, dx: Math.cos(a) * (72 + (i % 4) * 22), dy: Math.sin(a) * (72 + (i % 4) * 22), s: 2 + (i % 3) * 2.5 };
});

// ─── StarField ────────────────────────────────────────────────
function StarField() {
  return (
    <div className="cs-stars">
      {STARS.map(s => (
        <div key={s.id} className="cs-star"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, '--dur': `${s.dur}s`, '--del': `${-s.del}s` }}
        />
      ))}
    </div>
  );
}

// ─── Portrait constants ───────────────────────────────────────
const CARD_SIZES = {
  createur:    [140, 210],
  gerant:      [160, 240],
  diplomate:   [130, 195],
  ambassadeur: [108, 162],
  membre:      [88,  132],
};

// ─── DivinCard ────────────────────────────────────────────────
function DivinCard({ m, tier, delay = 0, onSelect }) {
  const t        = TIERS[tier];
  const isGerant = tier === "gerant";
  const [w, h]   = CARD_SIZES[tier];
  const [sparks, setSparks] = useState([]);

  const shimX      = useMotionValue(-1.5);
  const shimSpring = useSpring(shimX, { stiffness: 85, damping: 18 });
  const shimTX     = useTransform(shimSpring, [-1.5, 2.5], ["-130%", "230%"]);

  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const rxSp = useSpring(rotX, { stiffness: 160, damping: 22 });
  const rySp = useSpring(rotY, { stiffness: 160, damping: 22 });

  const onMove = (e) => {
    if (!m) return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top)  / r.height;
    shimX.set(nx * 4 - 1.5);
    rotY.set((nx - 0.5) * (isGerant ? 20 : 15));
    rotX.set((ny - 0.5) * (isGerant ? -13 : -9));
  };

  const onLeave = () => {
    shimX.set(-1.5);
    rotX.set(0);
    rotY.set(0);
  };

  const onClick = useCallback(() => {
    if (!m) return;
    setSparks(BURST);
    setTimeout(() => { setSparks([]); onSelect(m); }, 370);
  }, [m, onSelect]);

  return (
    <motion.div
      className={`dv-wrap dv-wrap-${tier}`}
      style={{ '--tc': t.col, '--rgb': t.rgb }}
      initial={{ opacity: 0, y: 55, scale: 0.72 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Spark burst */}
      <AnimatePresence>
        {sparks.map(s => (
          <motion.div key={s.id} className="deity-spark"
            style={{ width: s.s, height: s.s }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: s.dx, y: s.dy, opacity: 0, scale: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Icon above card — gérant = crown, others = tier icon */}
      {m && (
        isGerant
          ? <motion.div className="dv-crown"
              animate={{
                y: [0, -8, 0],
                filter: [
                  "drop-shadow(0 0 5px #C9A227)",
                  "drop-shadow(0 0 26px #FFD060)",
                  "drop-shadow(0 0 5px #C9A227)",
                ],
              }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >♔</motion.div>
          : <div className="dv-tier-icon-above">{t.icon}</div>
      )}

      {/* Card */}
      <motion.div
        className={`dv-card dv-card-${tier}${!m ? " dv-vacant" : ""}`}
        style={{
          width: w, height: h,
          '--card-w': `${w}px`,
          rotateX: m ? rxSp : 0, rotateY: m ? rySp : 0,
          transformPerspective: 700,
          pointerEvents: m ? "auto" : "none",
        }}
        animate={{ filter: "drop-shadow(0 0 0px transparent)" }}
        onMouseMove={m ? onMove : undefined}
        onMouseLeave={m ? onLeave : undefined}
        onClick={m ? onClick : undefined}
        whileHover={m ? {
          y: -18,
          scale: isGerant ? 1.05 : 1.08,
          filter: `drop-shadow(0 24px 48px rgba(${t.rgb},0.6)) drop-shadow(0 0 14px rgba(${t.rgb},0.35))`,
        } : {}}
        whileTap={m ? { scale: 0.93 } : {}}
        transition={{ type: "spring", stiffness: 250, damping: 22 }}
      >
        {/* Holographic shimmer */}
        <motion.div className="dv-shimmer" style={{ translateX: shimTX }} />

        {/* Corner ornaments */}
        <span className="dv-c dv-tl" /><span className="dv-c dv-tr" />
        <span className="dv-c dv-bl" /><span className="dv-c dv-br" />

        {/* Full-card portrait image */}
        <div className="dv-portrait-bg">
          {m && m.lastSeen && Date.now() - new Date(m.lastSeen).getTime() < 3 * 60 * 1000 && (
            <span className="dv-online-dot" />
          )}
          {m
            ? renderAvatar(m.avatar, "100%", false)
            : <motion.span className="dv-q"
                animate={{ opacity: [0.12, 0.35, 0.12] }}
                transition={{ duration: 2.8, repeat: Infinity }}
              >?</motion.span>
          }
        </div>
        {/* Bottom gradient overlay */}
        <div className="dv-portrait-overlay" />

        {/* Card body — no icon inside anymore */}
        <div className="dv-inner">
          <div style={{ flex: 1 }} />
          <div className="dv-rule">
            <span className="dv-rule-line" />
            <span className="dv-rule-diamond">◆</span>
            <span className="dv-rule-line" />
          </div>
          <div className="dv-text-block">
            {m ? (
              <>
                <div className="dv-name">{m.pseudo}</div>
                {tier !== "membre" && <div className="dv-tier-label">{t.label}</div>}
              </>
            ) : (
              <div className="dv-vacant-text">vacant</div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Modal profil ─────────────────────────────────────────────
function ProfileModal({ m, user, onClose }) {
  const tier = categorize(m);
  const t    = TIERS[tier];
  const TIER_LABELS = ["Gérant", "Diplomate", "Ambassadeur", "Membre"];
  const filteredPerms = (m.perms || []).filter(p => !TIER_LABELS.includes(p));
  const hasAvatar = typeof m.avatar === "string" && (m.avatar.startsWith("data:") || m.avatar.startsWith("http"));

  return (
    <>
      <motion.div className="pm-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="pm-modal"
        style={{ "--tc": t.col, "--rgb": t.rgb }}
        initial={{ opacity: 0, y: 40, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.94 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        {/* Close */}
        <button className="pm-close" onClick={onClose}>✕</button>

        {/* Portrait banner */}
        <div className="pm-banner">
          {hasAvatar
            ? <img src={m.avatar} alt="" className="pm-banner-img" />
            : <div className="pm-banner-placeholder">{m.avatar || "⚡"}</div>
          }
          <div className="pm-banner-grad" />
          {/* Tier icon top-left */}
          <div className="pm-banner-icon">{t.icon}</div>
        </div>

        {/* Hero identity */}
        <div className="pm-hero">
          <div className="pm-name" style={{ color: t.col }}>{m.pseudo}</div>
          {tier !== "membre" && (
            <div className="pm-tier" style={{ color: t.col, borderColor: `rgba(${t.rgb},0.4)` }}>
              {t.label}
            </div>
          )}
          {m.customId && <div className="pm-id">{m.customId}</div>}
        </div>

        <div className="pm-divider" style={{ background: `linear-gradient(90deg, transparent, rgba(${t.rgb},0.5), transparent)` }} />

        {/* Sections */}
        <div className="pm-body">
          <div className="pm-section">
            <span className="pm-label">⚡ Permissions</span>
            <div className="pm-tags">
              {filteredPerms.length > 0
                ? filteredPerms.map(p => <span key={p} className="pm-tag pm-tag-perm">{p}</span>)
                : <span className="pm-empty">Aucune perm</span>}
            </div>
          </div>

          <div className="pm-section">
            <span className="pm-label">💎 Abonnement</span>
            <div className="pm-tags">
              {m.abonnement
                ? <span className="pm-tag pm-tag-abo">{m.abonnement}</span>
                : <span className="pm-empty">Aucun abonnement</span>}
            </div>
          </div>

          <div className="pm-section">
            <span className="pm-label">📋 Whitelist</span>
            <div className="pm-tags">
              {m.whitelist?.length
                ? m.whitelist.map(w => <span key={w} className="pm-tag pm-tag-wl">{w}</span>)
                : <span className="pm-empty">Aucune whitelist</span>}
            </div>
          </div>

          {user?.isAdmin && m.parrain && (
            <div className="pm-section">
              <span className="pm-label">🤝 Parrainage</span>
              <div className="pm-tags">
                <span className="pm-tag pm-tag-parrain">Parrainé par <strong>{Array.isArray(m.parrain) ? m.parrain.join(", ") : m.parrain}</strong></span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── CosmicMembers ────────────────────────────────────────────
function CosmicMembers({ members, onSelect }) {
  const sceneRef = useRef(null);
  const mouseX   = useMotionValue(0.5);
  const mouseY   = useMotionValue(0.5);

  const s1x = useSpring(useTransform(mouseX, [0, 1], [-28, 28]), { stiffness: 55, damping: 14 });
  const s1y = useSpring(useTransform(mouseY, [0, 1], [-18, 18]), { stiffness: 55, damping: 14 });
  const s2x = useSpring(useTransform(mouseX, [0, 1], [-5,   5]), { stiffness: 90, damping: 18 });
  const s2y = useSpring(useTransform(mouseY, [0, 1], [-3,   3]), { stiffness: 90, damping: 18 });

  const onMove = useCallback((e) => {
    const r = sceneRef.current?.getBoundingClientRect();
    if (!r) return;
    mouseX.set((e.clientX - r.left) / r.width);
    mouseY.set((e.clientY - r.top)  / r.height);
  }, [mouseX, mouseY]);

  const fondateur    = members.find(m => categorize(m) === "createur") || null;
  const gerants      = members.filter(m => categorize(m) === "gerant");
  const diplomates   = members.filter(m => categorize(m) === "diplomate");
  const ambassadeurs = members.filter(m => categorize(m) === "ambassadeur");
  const regular      = members.filter(m => categorize(m) === "membre" || (categorize(m) === "createur" && m !== fondateur));
  const dipRow = [...diplomates,   ...Array(Math.max(0, 2 - diplomates.length)).fill(null)];
  const ambRow = [...ambassadeurs, ...Array(Math.max(0, 10 - ambassadeurs.length)).fill(null)];

  return (
    <div className="cosmic-scene" ref={sceneRef} onMouseMove={onMove}>
      <div className="cs-nebula" />
      <div className="cs-planet" />

      {/* Stars — max parallax */}
      <motion.div className="cs-layer" style={{ x: s1x, y: s1y }}>
        <StarField />
      </motion.div>

      {/* Cards — gentle parallax */}
      <motion.div className="cs-layer cs-layer-fg" style={{ x: s2x, y: s2y }}>
        <div className="cs-layout">
          <motion.div className="cs-header"
            initial={{ opacity: 0, y: -22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="cs-title">L'Enceinte Olympienne</h1>
            <p className="cs-sub">Les divinités de l'Olympe</p>
          </motion.div>

          <div className="cs-row-g-container">
            {fondateur && (
              <motion.div
                className="cs-fondateur-side"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="cs-createur-label">Fondateur du site</span>
                <DivinCard m={fondateur} tier="createur" delay={0.15} onSelect={onSelect} />
              </motion.div>
            )}
            <div className="cs-row cs-row-g">
              {gerants.length > 0
                ? gerants.map((m, i) => <DivinCard key={m.pseudo} m={m} tier="gerant" delay={0.1 + i * 0.1} onSelect={onSelect} />)
                : <DivinCard m={null} tier="gerant" delay={0.1} onSelect={onSelect} />}
            </div>
          </div>

          <div className="cs-row cs-row-d">
            {dipRow.map((m, i) => <DivinCard key={m?.pseudo ?? `vd${i}`} m={m} tier="diplomate" delay={0.3 + i * 0.12} onSelect={onSelect} />)}
          </div>

          <div className="cs-row cs-row-a">
            {ambRow.map((m, i) => <DivinCard key={m?.pseudo ?? `va${i}`} m={m} tier="ambassadeur" delay={0.5 + i * 0.08} onSelect={onSelect} />)}
          </div>

          {regular.length > 0 && (
            <div className="cs-row cs-row-m">
              {regular.map((m, i) => <DivinCard key={m.pseudo} m={m} tier="membre" delay={0.7 + i * 0.06} onSelect={onSelect} />)}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────
export default function Members() {
  const { members, user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [entered,  setEntered]  = useState(false);
  const handleEntered = useCallback(() => setEntered(true), []);

  return (
    <>
      <CosmicMembers members={members} onSelect={setSelected} />

      <AnimatePresence>
        {selected && (
          <ProfileModal key={selected.pseudo} m={selected} user={user} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!entered && <PantheonEntrance key="pe" onComplete={handleEntered} />}
      </AnimatePresence>
    </>
  );
}
