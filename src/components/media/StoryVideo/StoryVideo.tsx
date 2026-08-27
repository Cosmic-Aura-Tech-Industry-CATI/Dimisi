import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import story720 from "@/assets/dimisi-story-720p.mp4.asset.json";
import story480 from "@/assets/dimisi-story-480p.mp4.asset.json";
import story360 from "@/assets/dimisi-story-360p.mp4.asset.json";
import storyPoster from "@/assets/dimisi-story-poster.jpg.asset.json";
import styles from "./StoryVideo.module.css";

/** Lowest → highest. Index 0 is the safest stream for weak connections. */
const LADDER = [story360.url, story480.url, story720.url];

function pickTier() {
  if (typeof navigator === "undefined") return 1;
  const conn = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean; downlink?: number };
    }
  ).connection;
  if (!conn) return 1;
  if (conn.saveData) return 0;
  const type = conn.effectiveType ?? "4g";
  const down = conn.downlink ?? 10;
  if (type === "slow-2g" || type === "2g" || down < 1) return 0;
  if (type === "3g" || down < 3) return 1;
  return 2;
}

export function StoryVideo({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState(() => pickTier());
  const stalls = useRef(0);
  const src = LADDER[tier] ?? LADDER[1];

  // Free the GPU: the WebGL backdrop stops rendering while the film plays.
  useEffect(() => {
    window.dispatchEvent(new Event("dm:pause3d"));
    return () => {
      window.dispatchEvent(new Event("dm:resume3d"));
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
    v.muted = muted;
  }, [volume, muted]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  // Repeated buffering → step down to a lighter stream and resume in place.
  const onWaiting = useCallback(() => {
    setLoading(true);
    stalls.current += 1;
    if (stalls.current >= 2 && tier > 0) {
      const v = videoRef.current;
      const at = v?.currentTime ?? 0;
      stalls.current = 0;
      setTier((t) => t - 1);
      requestAnimationFrame(() => {
        const el = videoRef.current;
        if (!el) return;
        el.currentTime = at;
        void el.play();
      });
    }
  }, [tier]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="DIMISI story film">
      <video
        ref={videoRef}
        className={styles.video}
        src={src}
        poster={storyPoster.url}
        preload="auto"
        autoPlay
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        // eslint-disable-next-line react/no-unknown-property
        x-webkit-airplay="deny"
        controls={false}
        onWaiting={onWaiting}
        onPlaying={() => setLoading(false)}
        onCanPlay={() => setLoading(false)}
        onEnded={() => setPlaying(false)}
        onClick={toggle}
      />

      {loading ? (
        <div className={styles.spinner} aria-live="polite">
          <Loader2 size={26} />
        </div>
      ) : null}

      <button type="button" className={styles.back} onClick={onClose}>
        <ArrowLeft size={15} aria-hidden="true" />
        Back
      </button>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause size={17} /> : <Play size={17} />}
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
        <input
          className={styles.slider}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          aria-label="Volume"
          onChange={(e) => {
            const v = Number(e.target.value);
            setVolume(v);
            setMuted(v === 0);
          }}
        />
        <span className={styles.pct}>{Math.round((muted ? 0 : volume) * 100)}%</span>
      </div>
    </div>
  );
}