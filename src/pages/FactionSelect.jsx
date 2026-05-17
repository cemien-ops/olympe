export default function FactionSelect({ onSelect }) {
  const selectFaction = (faction) => {
    localStorage.setItem("mh_faction", faction);
    document.documentElement.setAttribute("data-faction", faction);
    document.body.setAttribute("data-faction", faction);
    onSelect(faction);
  };

  return (
    <div className="faction-page">
      <div className="faction-title">
        <h1>Choisissez votre camp</h1>
        <p>Deux factions. Un seul Olympe.</p>
      </div>

      <div className="faction-cards">
        <div className="faction-card olympe" onClick={() => selectFaction("olympe")}>
          <div className="faction-glow olympe-glow" />
          <div className="faction-inner">
            <span className="faction-icon">⚡</span>
            <h2 className="faction-name olympe-name">Olympiens</h2>
            <p className="faction-desc">La voie des dieux. Honneur, foudre et gloire éternelle.</p>
            <button className="faction-btn olympe-btn">Rejoindre</button>
          </div>
        </div>

        <div className="faction-card titans" onClick={() => selectFaction("titans")}>
          <div className="faction-glow titans-glow" />
          <div className="faction-inner">
            <span className="faction-icon">🌑</span>
            <h2 className="faction-name titans-name">Titanides</h2>
            <p className="faction-desc">La voie des anciens. Ténèbres, chaos et puissance primordiale.</p>
            <button className="faction-btn titans-btn">Rejoindre</button>
          </div>
        </div>
      </div>
    </div>
  );
}
