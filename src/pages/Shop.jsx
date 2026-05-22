import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { perms, abonnements, whitelist } from "../data/shopData";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CoinIcon from "../components/CoinIcon";

const CROWN_PERMS = ["crown", "admin", "botbot", "invisible", "couronne", "createur", "systeme"];

function wlItemName(id) {
  for (const cat of whitelist) {
    const found = cat.items.find((i) => i.id === id);
    if (found) return found.name;
  }
  return id;
}

function getWlBlockReason(item, ownedWlIds, ownedPermId, cartItems, cartPerm) {
  if (item.requiredPerm) {
    if (item.requiredPerm === "crown") {
      const hasPerm = CROWN_PERMS.includes(ownedPermId) || (cartPerm && CROWN_PERMS.includes(cartPerm.id));
      if (!hasPerm) return "Requiert la perm Crown ou supérieure";
    } else {
      const hasIt = ownedWlIds.includes(item.requiredPerm) || !!cartItems.find((i) => i.id === item.requiredPerm);
      if (!hasIt) return `Requiert ${wlItemName(item.requiredPerm)}`;
    }
  }
  if (item.requiredWL) {
    const hasIt = ownedWlIds.includes(item.requiredWL) || !!cartItems.find((i) => i.id === item.requiredWL);
    if (!hasIt) return `Requiert ${wlItemName(item.requiredWL)}`;
  }
  return null;
}

// ─── Variants partagés ───────────────────────────────────────────
const cardVariants = {
  hidden:  { opacity: 0, y: 22, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.32, ease: "easeOut" } },
};
const gridVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.045 } },
};

// ─── Corners décoratifs ──────────────────────────────────────────
function RpgCorners() {
  return (
    <>
      <span className="rpg-c tl" />
      <span className="rpg-c tr" />
      <span className="rpg-c bl" />
      <span className="rpg-c br" />
    </>
  );
}

// ─── MODALS (inchangées) ─────────────────────────────────────────
function PermModal({ item, ownedPermId, userPerms, userPermPrice, onClose }) {
  const { add, items, getPermPrice } = useCart();
  const inCart = items.find((i) => i.id === item.id);
  const isOwned = (userPerms || []).includes(item.role);
  const isBlocked = item.price <= userPermPrice;
  const effectivePrice = getPermPrice(item, ownedPermId);
  const hasDiscount = effectivePrice < item.price;

  const handleAdd = () => { add({ ...item, _type: "perm", effectivePrice }); onClose(); };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="perm-modal">
        <RpgCorners />
        <div className="modal-shine" />
        <div className="particles">
          <span/><span/><span/><span/><span/><span/><span/><span/><span/><span/>
          <span/><span/><span/><span/><span/><span/><span/><span/><span/><span/>
        </div>
        <div className="modal-inner">
          <button className="modal-close" onClick={onClose}>✕</button>
          {item.deco && <div className="modal-deco">✦ {item.deco} ✦</div>}
          <div className={`modal-perm-title role-${item.id === "botbot" ? "bot" : item.id}`}>{item.role}</div>
          <div className="modal-divider" />
          {item.description && <div className="modal-perm-desc">{item.description}</div>}
          <div className="modal-perm-price">
            {hasDiscount ? (
              <>
                <s style={{ color: "#7A6A50", fontSize: "0.85rem" }}>{item.price}</s>
                <CoinIcon size={14} />
                <span>{effectivePrice}</span>
                <CoinIcon size={16} />
                <span style={{ fontSize: "0.72rem", color: "#C9A227" }}>après échange</span>
              </>
            ) : (
              <>{item.price} <CoinIcon size={16} /></>
            )}
          </div>
          <button className="modal-add-btn" onClick={handleAdd} disabled={!!inCart || isBlocked || isOwned}>
            {isOwned ? "Déjà possédé" : inCart ? "✓ Ajouté au panier" : isBlocked ? "Non disponible" : "Ajouter au panier ⚡"}
          </button>
        </div>
      </div>
    </>
  );
}

function WlModal({ item, ownedWlIds, userWL, ownedPermId, cartItems, cartPerm, onClose }) {
  const { add } = useCart();
  const inCart = cartItems.find((i) => i.id === item.id);
  const isOwned = (userWL || []).includes(item.name);
  const blockReason = getWlBlockReason(item, ownedWlIds, ownedPermId, cartItems, cartPerm);
  const isDisabled = isOwned || !!inCart || !!blockReason;

  const handleAdd = () => { add({ ...item, _type: "wl", effectivePrice: item.price }); onClose(); };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="perm-modal wl-modal">
        <RpgCorners />
        <div className="modal-shine" />
        <div className="particles">
          <span/><span/><span/><span/><span/><span/><span/><span/><span/><span/>
          <span/><span/><span/><span/><span/><span/><span/><span/><span/><span/>
        </div>
        <div className="modal-inner">
          <button className="modal-close" onClick={onClose}>✕</button>
          {item.category && <div className="modal-deco">✦ {item.category}</div>}
          <div className="modal-perm-title" style={{ color: "#C9A227", textShadow: "0 0 10px #C9A227, 0 0 20px #C9A227" }}>{item.name}</div>
          <div className="modal-divider" />
          {item.description && <div className="modal-perm-desc" style={{ whiteSpace: "pre-line" }}>{item.description}</div>}
          {blockReason && <p style={{ color: "#ff6b6b", fontSize: "0.85rem", textAlign: "center" }}>🔒 {blockReason}</p>}
          <div className="modal-perm-price">{item.price} <CoinIcon size={16} /></div>
          <button className="modal-add-btn" onClick={handleAdd} disabled={isDisabled}>
            {isOwned ? "Déjà possédé" : inCart ? "✓ Ajouté au panier" : blockReason ? "Non disponible" : "Ajouter au panier ⚡"}
          </button>
        </div>
      </div>
    </>
  );
}

function AboModal({ item, ownedAboId, userAbonnement, userAboPrice, onClose }) {
  const { add, items } = useCart();
  const inCart = items.find((i) => i.id === item.id);
  const isOwned = item.name === userAbonnement;
  const isBlocked = item.price <= userAboPrice;

  const handleAdd = () => { add({ ...item, role: item.name, _type: "abo", effectivePrice: item.price }); onClose(); };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="perm-modal abo-modal">
        <RpgCorners />
        <div className="modal-shine" />
        <div className="particles">
          <span/><span/><span/><span/><span/><span/><span/><span/><span/><span/>
          <span/><span/><span/><span/><span/><span/><span/><span/><span/><span/>
        </div>
        <div className="modal-inner">
          <button className="modal-close" onClick={onClose}>✕</button>
          <img src={item.banner} alt={item.name} style={{ width: "100%", borderRadius: "12px", marginBottom: "0.5rem", display: "block" }} />
          <div className={`modal-perm-title plan-${item.id}`} style={{ fontSize: "1.5rem" }}>{item.name}</div>
          <div className="modal-divider" />
          <div className="modal-perm-price">
            {item.price.toFixed(2)} €<span style={{ fontSize: "0.8rem", color: "#C9A227", marginLeft: "4px" }}>/mois</span>
          </div>
          {item.description && <div className="modal-perm-desc">{item.description}</div>}
          <button className="modal-add-btn" onClick={handleAdd} disabled={!!inCart || isBlocked || isOwned}>
            {isOwned ? "Déjà possédé" : inCart ? "✓ Ajouté au panier" : isBlocked ? "Non disponible" : "S'abonner ⚡"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── PERM CARD (RPG) ─────────────────────────────────────────────
function PermCard({ item, ownedPermId, userPerms, userPermPrice, cartPerm, onDetails }) {
  const { add, items, getPermPrice } = useCart();
  const inCart         = items.find((i) => i.id === item.id);
  const isOwned        = (userPerms || []).includes(item.role);
  const isLocked       = item.price <= userPermPrice;
  const refPerm        = perms.find((p) => p.id === (ownedPermId || cartPerm?.id || null));
  const isBlocked      = isLocked || (refPerm && item.price <= refPerm.price);
  const effectivePrice = getPermPrice(item, ownedPermId);
  const hasDiscount    = effectivePrice < item.price;

  const handleAdd = () => add({ ...item, _type: "perm", effectivePrice });

  let btnLabel = "Ajouter";
  if (isOwned)   btnLabel = "Possédé";
  else if (inCart)    btnLabel = "✓ Ajouté";
  else if (isBlocked) btnLabel = "Indisponible";

  return (
    <motion.div
      className={`rpg-card${isBlocked || isOwned ? " card-dim" : ""}`}
      variants={cardVariants}
      whileHover={!isLocked && !isOwned ? {
        scale: 1.04,
        boxShadow: "0 0 0 1px rgba(201,162,39,0.6), 0 12px 40px rgba(201,162,39,0.15), 0 4px 16px rgba(0,0,0,0.7)",
      } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      style={{ "--card-color": item.color, opacity: isLocked ? 0.5 : 1, filter: isLocked ? "grayscale(0.5)" : "none" }}
    >
      {item.id === "systeme" && <span className="badge-new-corner">NEW</span>}
      <RpgCorners />

      <div className="rpg-header">
        {item.deco && <span className="rpg-deco">✦ {item.deco} ✦</span>}
        <span className={`rpg-role role-${item.id === "botbot" ? "bot" : item.id}`}>{item.role}</span>
      </div>

      <div className="rpg-divider" />

      <div className="rpg-price">
        {hasDiscount ? (
          <div style={{ textAlign: "center", lineHeight: 1.3 }}>
            <div style={{ fontSize: "0.72rem", color: "rgba(201,162,39,0.45)", textDecoration: "line-through" }}>
              {item.price} <CoinIcon size={11} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
              {effectivePrice} <CoinIcon size={15} />
            </div>
            <div style={{ fontSize: "0.6rem", color: "rgba(201,162,39,0.55)", letterSpacing: "0.06em" }}>après échange</div>
          </div>
        ) : (
          <>{item.price} <CoinIcon size={15} /></>
        )}
      </div>

      <div className="rpg-actions">
        <button
          className={`rpg-btn-add${inCart ? " in-cart" : ""}${isOwned ? " owned" : ""}`}
          onClick={handleAdd}
          disabled={!!inCart || isBlocked || isOwned}
        >
          {btnLabel}
        </button>
        <button className="rpg-btn-info" onClick={() => onDetails(item)}>ℹ</button>
      </div>
    </motion.div>
  );
}

// ─── ABO CARD (RPG) ──────────────────────────────────────────────
function AboCard({ item, ownedAboId, userAbonnement, userAboPrice, cartAbo, onDetails }) {
  const { add, items } = useCart();
  const inCart    = items.find((i) => i.id === item.id);
  const isOwned   = item.name === userAbonnement;
  const isLocked  = item.price <= userAboPrice;
  const refAbo    = abonnements.find((a) => a.id === (ownedAboId || cartAbo?.id || null));
  const isBlocked = isLocked || (refAbo && item.price <= refAbo.price);
  const disabled  = !!inCart || isBlocked || isOwned;

  let btnLabel = "S'abonner";
  if (isOwned)   btnLabel = "Possédé";
  else if (inCart)    btnLabel = "✓ Ajouté";
  else if (isBlocked) btnLabel = "Indisponible";

  return (
    <motion.div
      className={`rpg-card rpg-abo${isBlocked || isOwned ? " card-dim" : ""}`}
      variants={cardVariants}
      whileHover={!disabled ? {
        scale: 1.04,
        boxShadow: "0 0 0 1px rgba(201,162,39,0.6), 0 12px 40px rgba(201,162,39,0.15), 0 4px 16px rgba(0,0,0,0.7)",
      } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      style={{ "--abo-gradient": item.gradient, opacity: isLocked ? 0.5 : 1, filter: isLocked ? "grayscale(0.5)" : "none" }}
    >
      <RpgCorners />

      {item.banner && (
        <div
          className="rpg-abo-banner"
          style={{ backgroundImage: `url(${item.banner})` }}
        />
      )}

      <div className="rpg-header" style={{ paddingTop: item.banner ? "0.6rem" : "0.9rem" }}>
        {item.icon && (
          <img src={item.icon} alt="" style={{ width: 22, height: 22, objectFit: "contain" }} />
        )}
        <span className={`rpg-role plan-${item.id}`} style={{ fontSize: "1.05rem" }}>{item.name}</span>
      </div>

      <div className="rpg-divider" />

      <div className="rpg-price" style={{ fontSize: "1.4rem" }}>
        {item.price.toFixed(2)} <CoinIcon size={15} />
        <span style={{ fontSize: "0.82rem", color: "#C9A227", marginLeft: "3px" }}>/mois</span>
      </div>

      <div className="rpg-actions">
        <button
          className={`rpg-btn-add${inCart ? " in-cart" : ""}${isOwned ? " owned" : ""}`}
          onClick={() => add({ ...item, role: item.name, _type: "abo", effectivePrice: item.price })}
          disabled={disabled}
        >
          {btnLabel}
        </button>
        <button className="rpg-btn-info" onClick={() => onDetails(item)}>ℹ</button>
      </div>
    </motion.div>
  );
}

// ─── WL SECTION (RPG) ────────────────────────────────────────────
function WlSection({ ownedWlIds, userWL, ownedPermId, cartPerm, onDetails }) {
  const { add, items } = useCart();

  return (
    <motion.div className="wl-grid" variants={gridVariants} initial="hidden" animate="visible">
      {whitelist.map((cat) => (
        <motion.div
          key={cat.category}
          className="rpg-card rpg-wl-cat"
          variants={cardVariants}
          style={{ position: "relative" }}
        >
          {cat.category === "Bendo" && <span className="badge-new-corner">NEW</span>}
          <RpgCorners />

          <h4 className="rpg-wl-title">{cat.category}</h4>
          <div className="rpg-divider" style={{ margin: "0 0 0.5rem" }} />

          <div className="rpg-wl-items">
            {cat.items.map((item) => {
              const inCart      = items.find((i) => i.id === item.id);
              const isOwned     = (userWL || []).includes(item.name);
              const blockReason = getWlBlockReason(item, ownedWlIds, ownedPermId, items, cartPerm);
              const isDisabled  = isOwned || !!inCart || !!blockReason;

              return (
                <div
                  key={item.id}
                  className={`rpg-wl-row${isOwned ? " wl-owned" : ""}${blockReason ? " wl-blocked" : ""}`}
                >
                  <div className="rpg-wl-row-info">
                    <span className="rpg-wl-name">{item.name}</span>
                    {item.note      && <span className="rpg-wl-note">{item.note}</span>}
                    {blockReason    && <span className="rpg-wl-note req-note">{blockReason}</span>}
                  </div>
                  <div className="rpg-wl-row-right">
                    <span className="rpg-wl-price">{item.price} <CoinIcon size={13} /></span>
                    {item.description && (
                      <button className="rpg-btn-info sm" onClick={() => onDetails(item)}>ℹ</button>
                    )}
                    <button
                      className={`rpg-wl-add${inCart ? " in-cart" : ""}${isOwned ? " owned" : ""}`}
                      onClick={() => add({ ...item, _type: "wl", effectivePrice: item.price })}
                      disabled={isDisabled}
                      title={blockReason || (isOwned ? "Déjà possédé" : "")}
                    >
                      {isOwned ? "✓" : inCart ? "✓" : blockReason ? "🔒" : "+"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── SHOP PRINCIPAL ──────────────────────────────────────────────
export default function Shop() {
  const location = useLocation();
  const [tab,        setTab]       = useState(location.state?.tab || "perms");
  const [detailItem, setDetailItem] = useState(null);
  const [detailAbo,  setDetailAbo]  = useState(null);
  const [detailWl,   setDetailWl]   = useState(null);
  const { user }  = useAuth();
  const { items } = useCart();

  const userPermPrice  = perms.find(p => user?.perms?.includes(p.role))?.price || 0;
  const ownedPermId    = [...perms].reverse().find(p => user?.perms?.includes(p.role))?.id || null;
  const userPerms      = user?.perms || [];

  const userAboPrice   = abonnements.find(a => a.name === user?.abonnement)?.price || 0;
  const ownedAboId     = abonnements.find(a => a.name === user?.abonnement)?.id || null;
  const userAbonnement = user?.abonnement || null;

  const userWL     = user?.whitelist || [];
  const ownedWlIds = userWL.map(name => {
    for (const cat of whitelist) {
      const found = cat.items.find(i => i.name === name);
      if (found) return found.id;
    }
    return null;
  }).filter(Boolean);

  const cartPerm = items.find((i) => i._type === "perm") || null;
  const cartAbo  = items.find((i) => i._type === "abo")  || null;

  const TABS = [
    { id: "perms", label: "Permissions", icon: "⚡" },
    { id: "abos",  label: "Abonnements", icon: "🏛️" },
    { id: "wl",    label: "Whitelist",   icon: "📜" },
  ];

  return (
    <main className="shop">
      <div className="shop-header">
        <h1>Boutique</h1>
        <p>Choisis tes items et passe commande</p>
      </div>

      {/* Tabs avec indicateur animé */}
      <div className="tabs">
        {TABS.map((t) => (
          <motion.button
            key={t.id}
            className={`tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {t.icon} {t.label}
            {tab === t.id && (
              <motion.div
                className="tab-indicator"
                layoutId="tab-indicator"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Modals */}
      {detailItem && (
        <PermModal item={detailItem} ownedPermId={ownedPermId} userPerms={userPerms}
          userPermPrice={userPermPrice} onClose={() => setDetailItem(null)} />
      )}
      {detailAbo && (
        <AboModal item={detailAbo} ownedAboId={ownedAboId} userAbonnement={userAbonnement}
          userAboPrice={userAboPrice} onClose={() => setDetailAbo(null)} />
      )}
      {detailWl && (
        <WlModal item={detailWl} ownedWlIds={ownedWlIds} userWL={userWL}
          ownedPermId={ownedPermId} cartItems={items} cartPerm={cartPerm}
          onClose={() => setDetailWl(null)} />
      )}

      {/* Content avec transition de tab */}
      <div className="shop-content">
        <AnimatePresence mode="wait">
          {tab === "perms" && (
            <motion.div key="perms"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
            >
              <motion.div className="perms-grid" variants={gridVariants} initial="hidden" animate="visible">
                {perms.map((p) => (
                  <PermCard key={p.id} item={p} ownedPermId={ownedPermId}
                    userPerms={userPerms} userPermPrice={userPermPrice}
                    cartPerm={cartPerm} onDetails={setDetailItem} />
                ))}
              </motion.div>
            </motion.div>
          )}

          {tab === "abos" && (
            <motion.div key="abos"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
            >
              <motion.div className="abos-grid" variants={gridVariants} initial="hidden" animate="visible">
                {abonnements.map((a) => (
                  <AboCard key={a.id} item={a} ownedAboId={ownedAboId}
                    userAbonnement={userAbonnement} userAboPrice={userAboPrice}
                    cartAbo={cartAbo} onDetails={setDetailAbo} />
                ))}
              </motion.div>
            </motion.div>
          )}

          {tab === "wl" && (
            <motion.div key="wl"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
            >
              <WlSection ownedWlIds={ownedWlIds} userWL={userWL}
                ownedPermId={ownedPermId} cartPerm={cartPerm} onDetails={setDetailWl} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
