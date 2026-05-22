import { useEffect, useRef, useState } from "react";

const VIDEO_ID = "Z8cicQYzYaA";

export default function BackgroundMusic() {
  const playerRef      = useRef(null);
  const holderRef      = useRef(null);
  const [muted,  setMuted]  = useState(true);
  const [volume, setVolume] = useState(10);
  const [open,   setOpen]   = useState(false);

  useEffect(() => {
    if (window.YT && window.YT.Player) { initPlayer(); return; }
    if (!document.getElementById("yt-api-script")) {
      const s = document.createElement("script");
      s.id = "yt-api-script";
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
    window.onYouTubeIframeAPIReady = initPlayer;
    return () => { window.onYouTubeIframeAPIReady = null; };
  }, []);

  function initPlayer() {
    if (playerRef.current) return;
    playerRef.current = new window.YT.Player(holderRef.current, {
      videoId: VIDEO_ID,
      playerVars: { autoplay: 1, loop: 1, playlist: VIDEO_ID, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, mute: 1 },
      events: { onReady: (e) => { e.target.mute(); e.target.playVideo(); } },
    });
  }

  const handleFabClick = () => {
    if (muted) {
      if (playerRef.current) { playerRef.current.unMute(); playerRef.current.setVolume(volume); }
      setMuted(false);
    } else {
      if (playerRef.current) { playerRef.current.mute(); }
      setMuted(true);
    }
  };

  const handleVolume = (e) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (!playerRef.current) return;
    if (v === 0) {
      playerRef.current.mute();
      setMuted(true);
    } else {
      playerRef.current.unMute();
      playerRef.current.setVolume(v);
      setMuted(false);
    }
  };

  const icon = !open || muted || volume === 0 ? "🔇" : volume < 50 ? "🔉" : "🔊";

  return (
    <>
      <div ref={holderRef} style={{ position: "fixed", left: "-9999px", top: 0, width: "1px", height: "1px", pointerEvents: "none" }} />
      <div className="music-widget">
        <div className="music-volume-panel">
          <span className="music-vol-label">{muted ? 0 : volume}%</span>
          <input
            type="range"
            min="0" max="100"
            value={muted ? 0 : volume}
            onChange={handleVolume}
            className="music-slider"
            style={{ writingMode: "vertical-lr", direction: "rtl" }}
          />
        </div>
        <button
          className={`music-fab${muted || volume === 0 ? " music-fab-muted" : " music-fab-on"}`}
          onClick={handleFabClick}
          title={muted ? "Activer la musique" : "Couper la musique"}
          aria-label="Contrôle musique"
        >
          {icon}
        </button>
      </div>
    </>
  );
}
