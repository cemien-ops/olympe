import { useCart } from "../context/CartContext";
import { perms } from "../data/shopData";
import CoinIcon from "./CoinIcon";

/* ─── Coins décoratifs (forme rpg-card) ─────────────────────────── */
function GrcCorners() {
  return (
    <>
      <span className="grc-c tl" />
      <span className="grc-c tr" />
      <span className="grc-c bl" />
      <span className="grc-c br" />
    </>
  );
}

/* ─── Symboles SVG d'après l'image de référence ─────────────────── */
const SYMBOLS = {

  /* 1 — Zeus · Éclair */
  kami: (
    <svg viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <polygon points="118,12 58,108 96,108 74,188 152,82 110,82"/>
    </svg>
  ),

  /* 2 — Poséidon · Trident */
  oni: (
    <svg viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="93" y="90" width="14" height="100" rx="5"/>
      <rect x="68" y="44" width="11" height="54" rx="4"/>
      <rect x="93" y="28" width="14" height="70" rx="4"/>
      <rect x="121" y="44" width="11" height="54" rx="4"/>
      <polygon points="73.5,44 68,22 79,22"/>
      <polygon points="100,28 93,8 107,8"/>
      <polygon points="126.5,44 121,22 132,22"/>
      <rect x="66" y="90" width="68" height="10" rx="4"/>
    </svg>
  ),

  /* 3 — Apollon · Lyre */
  ryu: (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M62,162 L62,74 Q62,26 100,22 Q138,26 138,74 L138,162" strokeWidth="7" strokeLinecap="round"/>
      <line x1="62" y1="162" x2="138" y2="162" strokeWidth="9" strokeLinecap="round"/>
      <line x1="80"  y1="162" x2="80"  y2="52" strokeWidth="4" strokeLinecap="round"/>
      <line x1="100" y1="162" x2="100" y2="22" strokeWidth="4" strokeLinecap="round"/>
      <line x1="120" y1="162" x2="120" y2="52" strokeWidth="4" strokeLinecap="round"/>
      <line x1="54"  y1="125" x2="146" y2="125" strokeWidth="6" strokeLinecap="round"/>
    </svg>
  ),

  /* 4 — Hermès · Caducée */
  samui: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <line x1="100" y1="22" x2="100" y2="185" stroke="currentColor" strokeWidth="9" strokeLinecap="round"/>
      <path d="M100,70 C72,57 68,100 100,100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
      <path d="M100,100 C128,100 132,57 100,70" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
      <path d="M100,100 C72,100 68,142 100,142" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
      <path d="M100,142 C128,142 132,100 100,100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
      <path d="M100,26 Q78,13 55,20 Q72,30 100,26Z" fill="currentColor"/>
      <path d="M100,26 Q122,13 145,20 Q128,30 100,26Z" fill="currentColor"/>
      <path d="M100,26 Q68,8 46,14 Q67,26 100,26Z" fill="currentColor" opacity="0.6"/>
      <path d="M100,26 Q132,8 154,14 Q133,26 100,26Z" fill="currentColor" opacity="0.6"/>
    </svg>
  ),

  /* 5 — Hyperion · Soleil radiant */
  shogun: (
    <svg viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="30"/>
      <circle cx="100" cy="100" r="12" fill="#06060f"/>
      <line x1="100" y1="58" x2="100" y2="18"  stroke="currentColor" strokeWidth="9" strokeLinecap="round"/>
      <line x1="100" y1="142" x2="100" y2="182" stroke="currentColor" strokeWidth="9" strokeLinecap="round"/>
      <line x1="58"  y1="100" x2="18"  y2="100" stroke="currentColor" strokeWidth="9" strokeLinecap="round"/>
      <line x1="142" y1="100" x2="182" y2="100" stroke="currentColor" strokeWidth="9" strokeLinecap="round"/>
      <line x1="71"  y1="71"  x2="41"  y2="41"  stroke="currentColor" strokeWidth="9" strokeLinecap="round"/>
      <line x1="129" y1="129" x2="159" y2="159" stroke="currentColor" strokeWidth="9" strokeLinecap="round"/>
      <line x1="129" y1="71"  x2="159" y2="41"  stroke="currentColor" strokeWidth="9" strokeLinecap="round"/>
      <line x1="71"  y1="129" x2="41"  y2="159" stroke="currentColor" strokeWidth="9" strokeLinecap="round"/>
    </svg>
  ),

  /* 6 — Déméter · Épi de blé */
  nakama: (
    <svg viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="95" y="90" width="10" height="100" rx="4"/>
      <ellipse cx="100" cy="52" rx="10" ry="24"/>
      <ellipse cx="76"  cy="64" rx="9"  ry="20" transform="rotate(-22,76,64)"/>
      <ellipse cx="124" cy="64" rx="9"  ry="20" transform="rotate(22,124,64)"/>
      <ellipse cx="56"  cy="82" rx="8"  ry="17" transform="rotate(-38,56,82)"/>
      <ellipse cx="144" cy="82" rx="8"  ry="17" transform="rotate(38,144,82)"/>
      <path d="M100,133 C82,120 60,126 55,145 C74,139 93,141 100,133Z"/>
      <path d="M100,133 C118,120 140,126 145,145 C126,139 107,141 100,133Z"/>
      <path d="M100,160 C80,146 56,152 50,172 C70,165 94,167 100,160Z"/>
      <path d="M100,160 C120,146 144,152 150,172 C130,165 106,167 100,160Z"/>
    </svg>
  ),

  /* 7 — Sélène · Lune croissante */
  daimyo: (
    <svg viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="76"/>
      <circle cx="132" cy="86" r="65" fill="#06060f"/>
    </svg>
  ),

  /* 8 — Hestia · Flamme */
  shinigami: (
    <svg viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M100,185 C55,185 20,148 20,105 C20,62 52,38 70,22 C64,48 76,58 87,46 C76,82 92,96 100,74 C108,96 108,112 118,107 C130,90 136,64 130,22 C150,38 180,62 180,105 C180,148 145,185 100,185Z"/>
    </svg>
  ),

  /* 9 — Nike · Couronne de laurier */
  royal: (
    <svg viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M100,170 C82,160 64,143 52,118 C46,102 47,86 54,72 C57,84 56,98 60,112 C64,124 72,136 80,146 C88,155 95,163 100,170Z"/>
      <path d="M100,170 C118,160 136,143 148,118 C154,102 153,86 146,72 C143,84 144,98 140,112 C136,124 128,136 120,146 C112,155 105,163 100,170Z"/>
      <ellipse cx="52"  cy="72"  rx="14" ry="9" transform="rotate(-50,52,72)"/>
      <ellipse cx="46"  cy="95"  rx="14" ry="9" transform="rotate(-40,46,95)"/>
      <ellipse cx="46"  cy="120" rx="14" ry="9" transform="rotate(-28,46,120)"/>
      <ellipse cx="56"  cy="143" rx="14" ry="9" transform="rotate(-14,56,143)"/>
      <ellipse cx="148" cy="72"  rx="14" ry="9" transform="rotate(50,148,72)"/>
      <ellipse cx="154" cy="95"  rx="14" ry="9" transform="rotate(40,154,95)"/>
      <ellipse cx="154" cy="120" rx="14" ry="9" transform="rotate(28,154,120)"/>
      <ellipse cx="144" cy="143" rx="14" ry="9" transform="rotate(14,144,143)"/>
      <ellipse cx="100" cy="172" rx="12" ry="7"/>
    </svg>
  ),

  /* 10 — Athéna · Chouette */
  crown: (
    <svg viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="118" rx="52" ry="62"/>
      <circle cx="76"  cy="86" r="24"/>
      <circle cx="124" cy="86" r="24"/>
      <circle cx="76"  cy="86" r="10" fill="#06060f"/>
      <circle cx="124" cy="86" r="10" fill="#06060f"/>
      <circle cx="72"  cy="82" r="4"/>
      <circle cx="120" cy="82" r="4"/>
      <polygon points="100,100 90,115 110,115"/>
      <polygon points="54,74 70,50 70,74"/>
      <polygon points="146,74 130,50 130,74"/>
    </svg>
  ),

  /* 11 — Arès · Casque spartiate */
  admin: (
    <svg viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M26,122 L26,96 Q26,26 100,20 Q174,26 174,96 L174,122 Z"/>
      <rect x="18" y="120" width="164" height="18" rx="6"/>
      <rect x="86" y="138" width="28" height="48" rx="9"/>
      <path d="M78,20 C82,10 100,8 122,20 C110,18 90,18 78,20Z"/>
    </svg>
  ),

  /* 12 — Héphaistos · Enclume & Marteau */
  botbot: (
    <svg viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="28" y="150" width="144" height="28" rx="6"/>
      <rect x="48" y="118" width="104" height="38" rx="5"/>
      <path d="M48,118 Q48,88 90,78 L162,78 Q182,78 182,98 L182,118 Z"/>
      <rect x="90" y="22" width="11" height="66" rx="4" transform="rotate(35,95.5,55)"/>
      <rect x="68" y="15" width="54" height="28" rx="7" transform="rotate(35,95,29)"/>
    </svg>
  ),

  /* 13 — Héra · Œil de paon */
  invisible: (
    <svg viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M100,18 Q148,74 148,116 Q148,162 100,182 Q52,162 52,116 Q52,74 100,18Z"/>
      <ellipse cx="100" cy="118" rx="30" ry="38" fill="#06060f"/>
      <circle cx="100" cy="118" r="18"/>
      <circle cx="107" cy="111" r="6" fill="#06060f"/>
    </svg>
  ),

  /* 14 — Dionysos · Grappe de raisin */
  couronne: (
    <svg viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="74"  r="14"/>
      <circle cx="78"  cy="92"  r="14"/>
      <circle cx="122" cy="92"  r="14"/>
      <circle cx="90"  cy="112" r="14"/>
      <circle cx="110" cy="112" r="14"/>
      <circle cx="100" cy="132" r="14"/>
      <circle cx="83"  cy="150" r="12"/>
      <circle cx="117" cy="150" r="12"/>
      <circle cx="100" cy="166" r="12"/>
      <line x1="100" y1="60" x2="100" y2="28" stroke="currentColor" strokeWidth="6" fill="none"/>
      <path d="M100,28 Q124,12 148,18" stroke="currentColor" strokeWidth="5" fill="none"/>
      <path d="M100,28 Q76,12 52,18"  stroke="currentColor" strokeWidth="5" fill="none"/>
    </svg>
  ),

  /* 15 — Prométhée · Torche */
  createur: (
    <svg viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="87" y="110" width="26" height="80" rx="9"/>
      <path d="M67,110 L67,84 Q67,66 100,62 Q133,66 133,84 L133,110 Z"/>
      <path d="M100,62 C78,54 62,34 76,16 C72,35 84,43 91,30 C86,50 97,55 100,38 C103,55 114,50 109,30 C116,43 128,35 124,16 C138,34 122,54 100,62Z"/>
    </svg>
  ),

  /* 16 — Chaos · Étoile cosmique */
  systeme: (
    <svg viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <polygon points="100,15 115,63 160,40 137,85 185,100 137,115 160,160 115,137 100,185 85,137 40,160 63,115 15,100 63,85 40,40 85,63"/>
      <circle cx="100" cy="100" r="22" fill="#06060f"/>
      <circle cx="100" cy="100" r="13"/>
    </svg>
  ),
};

/* ─── Card Metadata ──────────────────────────────────────────────── */
const CARD_META = {
  kami:      { label: "★ KAMI ★",       bg: "linear-gradient(145deg,#1c1208 0%,#2e1f0d 100%)", border: "rgba(180,130,35,0.55)",  glow: "rgba(200,150,30,0.22)",  holo: ["rgba(220,175,60,0.28)","rgba(255,235,130,0.22)","rgba(180,120,20,0.24)"] },
  oni:       { label: "★ ONI ★",        bg: "linear-gradient(145deg,#1a0e07 0%,#2e1608 100%)", border: "rgba(195,100,40,0.55)",  glow: "rgba(210,110,40,0.22)",  holo: ["rgba(220,120,50,0.28)","rgba(255,175,85,0.22)","rgba(190,70,20,0.24)"] },
  ryu:       { label: "★ RYU ★",        bg: "linear-gradient(145deg,#05101e 0%,#0a1f3a 100%)", border: "rgba(65,105,225,0.55)",  glow: "rgba(70,120,255,0.22)",  holo: ["rgba(70,130,255,0.28)","rgba(120,210,255,0.22)","rgba(40,70,220,0.24)"] },
  samui:     { label: "★ SAMUI ★",      bg: "linear-gradient(145deg,#050f0a 0%,#0a2015 100%)", border: "rgba(46,140,80,0.55)",   glow: "rgba(50,160,90,0.22)",   holo: ["rgba(50,185,100,0.28)","rgba(110,255,160,0.22)","rgba(20,140,65,0.24)"] },
  shogun:    { label: "★ SHOGUN ★",     bg: "linear-gradient(145deg,#1c1606 0%,#322509 100%)", border: "rgba(218,165,32,0.65)",  glow: "rgba(230,180,35,0.25)",  holo: ["rgba(245,200,45,0.30)","rgba(255,245,130,0.24)","rgba(210,160,15,0.26)"] },
  nakama:    { label: "★ NAKAMA ★",     bg: "linear-gradient(145deg,#050f07 0%,#0a2010 100%)", border: "rgba(0,168,107,0.55)",   glow: "rgba(0,180,120,0.22)",   holo: ["rgba(0,200,120,0.28)","rgba(80,255,185,0.22)","rgba(0,155,85,0.24)"] },
  daimyo:    { label: "★ DAIMYŌ ★",     bg: "linear-gradient(145deg,#05101e 0%,#0b1e34 100%)", border: "rgba(91,155,213,0.55)",  glow: "rgba(100,170,230,0.22)", holo: ["rgba(100,185,245,0.28)","rgba(170,235,255,0.22)","rgba(60,135,210,0.24)"] },
  shinigami: { label: "★ SHINIGAMI ★",  bg: "linear-gradient(145deg,#150508 0%,#2a0812 100%)", border: "rgba(194,24,91,0.55)",   glow: "rgba(210,30,100,0.22)",  holo: ["rgba(225,35,105,0.28)","rgba(255,110,165,0.22)","rgba(175,15,75,0.24)"] },
  royal:     { label: "✦ BASILEUS ✦",   bg: "linear-gradient(145deg,#0f0520 0%,#200838 100%)", border: "rgba(123,31,162,0.6)",   glow: "rgba(140,40,180,0.25)",  holo: ["rgba(155,45,210,0.28)","rgba(210,105,255,0.22)","rgba(110,20,165,0.24)"] },
  crown:     { label: "✦ ANAX ✦",       bg: "linear-gradient(145deg,#1c1606 0%,#382a00 100%)", border: "rgba(201,162,39,0.7)",   glow: "rgba(215,175,45,0.28)",  holo: ["rgba(230,190,55,0.32)","rgba(255,248,155,0.26)","rgba(205,160,20,0.28)"] },
  admin:     { label: "✦ ARCHON ✦",     bg: "linear-gradient(145deg,#050f1e 0%,#081a3c 100%)", border: "rgba(21,101,192,0.6)",   glow: "rgba(30,120,220,0.25)",  holo: ["rgba(30,140,230,0.28)","rgba(80,180,255,0.22)","rgba(15,90,185,0.24)"] },
  botbot:    { label: "✦ PYTHIA ✦",     bg: "linear-gradient(145deg,#051008 0%,#0c2212 100%)", border: "rgba(46,125,50,0.6)",    glow: "rgba(50,140,55,0.22)",   holo: ["rgba(55,165,65,0.28)","rgba(110,230,120,0.22)","rgba(30,125,40,0.24)"] },
  invisible: { label: "✦ SKIÁ ✦",       bg: "linear-gradient(145deg,#08090f 0%,#101420 100%)", border: "rgba(55,70,100,0.6)",    glow: "rgba(80,100,150,0.22)",  holo: ["rgba(85,115,170,0.28)","rgba(175,200,235,0.22)","rgba(55,80,135,0.24)"] },
  couronne:  { label: "✦ STEPHANOS ✦",  bg: "linear-gradient(145deg,#1e0f05 0%,#321808 100%)", border: "rgba(230,100,0,0.6)",    glow: "rgba(245,120,10,0.25)",  holo: ["rgba(245,115,10,0.30)","rgba(255,190,70,0.24)","rgba(210,75,0,0.26)"] },
  createur:  { label: "✧ DEMIURGOS ✧",  bg: "linear-gradient(145deg,#080520 0%,#140a3c 100%)", border: "rgba(106,27,154,0.65)",  glow: "rgba(130,40,200,0.28)",  holo: ["rgba(145,35,225,0.30)","rgba(210,85,255,0.24)","rgba(100,15,185,0.26)"] },
  systeme:   { label: "✧ KOSMOS ✧",     bg: "linear-gradient(145deg,#020208 0%,#06060f 100%)", border: "rgba(201,162,39,0.8)",   glow: "rgba(215,175,45,0.35)",  holo: ["rgba(230,190,55,0.35)","rgba(255,252,180,0.28)","rgba(185,145,15,0.30)"] },
};

/* ─── Carte individuelle ─────────────────────────────────────────── */
export function GreekRoleCard({ item, ownedPermId, userPerms, userPermPrice, cartPerm, onDetails }) {
  const { add, items, getPermPrice } = useCart();
  const inCart         = items.find(i => i.id === item.id);
  const isOwned        = (userPerms || []).includes(item.role);
  const isLocked       = item.price <= userPermPrice;
  const refPerm        = perms.find(p => p.id === (ownedPermId || cartPerm?.id || null));
  const isBlocked      = isLocked || (refPerm && item.price <= refPerm.price);
  const effectivePrice = getPermPrice(item, ownedPermId);
  const hasDiscount    = effectivePrice < item.price;

  const meta = CARD_META[item.id] || {
    label: `★ ${(item.deco || item.role).toUpperCase()} ★`,
    bg:    "linear-gradient(145deg,#0a0a10 0%,#141420 100%)",
    border:"rgba(201,162,39,0.4)",
    glow:  "rgba(201,162,39,0.2)",
    holo:  ["rgba(255,255,255,0.18)","rgba(200,200,255,0.14)","rgba(255,255,200,0.16)"],
  };

  const handleAdd = () => {
    if (!inCart && !isBlocked && !isOwned)
      add({ ...item, _type: "perm", effectivePrice });
  };

  let btnLabel = "Ajouter";
  if (isOwned)        btnLabel = "Possédé";
  else if (inCart)    btnLabel = "✓ Ajouté";
  else if (isBlocked) btnLabel = "Indisponible";

  return (
    <div
      className={`grc${isLocked || isOwned ? " grc-dim" : ""}`}
      style={{
        "--grc-bg":     meta.bg,
        "--grc-border": meta.border,
        "--grc-glow":   meta.glow,
        "--grc-h1":     meta.holo[0],
        "--grc-h2":     meta.holo[1],
        "--grc-h3":     meta.holo[2],
        opacity: isLocked ? 0.45 : 1,
        filter:  isLocked ? "grayscale(0.6)" : "none",
      }}
    >
      <GrcCorners />

      {/* Shimmer holographique unique par carte */}
      <div className="grc-holo" aria-hidden="true"/>

      {/* Symbole divinité en filigrane */}
      <div className="grc-symbol" aria-hidden="true">
        {SYMBOLS[item.id]}
      </div>

      {/* Contenu */}
      <div className="grc-content">
        <div className="grc-tier">{meta.label}</div>

        <div className={`grc-role-name role-${item.id === "botbot" ? "bot" : item.id}`}>
          {item.role}
        </div>

        <div className="grc-divider"/>

        <div className="grc-price">
          {hasDiscount ? (
            <div className="grc-price-discount">
              <span className="grc-price-old">{item.price} <CoinIcon size={11}/></span>
              <span className="grc-price-new">{effectivePrice} <CoinIcon size={14}/></span>
              <span className="grc-price-tag">après échange</span>
            </div>
          ) : (
            <span className="grc-price-main">{item.price} <CoinIcon size={14}/></span>
          )}
        </div>

        <div className="grc-actions">
          <button
            className={`grc-btn-add${inCart ? " grc-btn-incart" : ""}${isOwned ? " grc-btn-owned" : ""}${isBlocked && !isOwned ? " grc-btn-blocked" : ""}`}
            onClick={handleAdd}
            disabled={!!inCart || isBlocked || isOwned}
          >
            {btnLabel}
          </button>
          <button className="grc-btn-info" onClick={() => onDetails(item)} title="Détails">ℹ</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Grille ─────────────────────────────────────────────────────── */
export default function GreekRoleCards({ ownedPermId, userPerms, userPermPrice, cartPerm, onDetails }) {
  return (
    <div className="grc-grid">
      {perms.map(item => (
        <GreekRoleCard
          key={item.id}
          item={item}
          ownedPermId={ownedPermId}
          userPerms={userPerms}
          userPermPrice={userPermPrice}
          cartPerm={cartPerm}
          onDetails={onDetails}
        />
      ))}
    </div>
  );
}
