import { useCallback, useEffect, useRef, useState } from "react";
import hq720 from "@/assets/preloader-hq720-hq.mp4.asset.json";
import q720 from "@/assets/preloader-p720-hq.mp4.asset.json";
import q480 from "@/assets/preloader-p480-hq.mp4.asset.json";
import q360 from "@/assets/preloader-p360-hq.mp4.asset.json";
import poster from "@/assets/preloader-poster.jpg.asset.json";
import styles from "./VideoPreloader.module.css";

/** Quality ladder, best first. Every tier is fast-start so playback begins instantly. */
const LADDER = [hq720.url, q720.url, q480.url, q360.url];

/** Picks the highest stream the visitor's connection can comfortably stream. */
function pickIndex() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return 2;
  const c = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean; downlink?: number };
    }
  ).connection;
  if (c?.saveData) return 3;
  const t = c?.effectiveType ?? "4g";
  if (t.includes("2g")) return 3;
  if (t === "3g") return 2;
  const down = c?.downlink ?? 10;
  if (down < 3) return 2;
  if (down < 6) return 1;
  return window.innerWidth < 900 ? 1 : 0;
}

/** Fullscreen cinematic video preloader; hands over to the site when the film ends. */
export function VideoPreloader({ onDone }: { onDone: () => void }) {
  // Deterministic first render (server + client) — the real tier is chosen after
  // mount so hydration never swaps the <video> element mid-playback.
  const [tier, setTier] = useState<number | null>(null);
  const src = tier === null ? undefined : LADDER[tier];
  const [fade, setFade] = useState(false);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const doneRef = useRef(false);
  const stallTimerRef = useRef(0);

  useEffect(() => {
    setTier(pickIndex());
  }, []);

  const finishRef = useRef<() => void>(() => {});

  // If the chosen stream stalls, drop one quality step and resume where we were.
  const onStall = useCallback(() => {
    const v = videoRef.current;
    if (!v || doneRef.current) return;
    // A brief buffer hiccup is normal right after load — only step down if the
    // player is genuinely starved of data.
    if (v.readyState >= 3) return;
    if (stallTimerRef.current) return;
    stallTimerRef.current = window.setTimeout(() => {
      stallTimerRef.current = 0;
      const el = videoRef.current;
      if (!el || doneRef.current || el.readyState >= 3) return;
      stepDown(el);
    }, 1200);
  }, []);

  const stepDown = useCallback((v: HTMLVideoElement) => {
    setTier((i) => {
      if (i === null || i >= LADDER.length - 1) return i;
      const at = v.currentTime;
      window.setTimeout(() => {
        const el = videoRef.current;
        if (!el) return;
        el.currentTime = at;
        void el.play();
      }, 0);
      return i + 1;
    });
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setFade(true);
    window.setTimeout(onDone, 650);
  }, [onDone]);
  finishRef.current = finish;

  // A decode/network error on one tier shouldn't kill the intro — step down first.
  const onError = useCallback(() => {
    if (doneRef.current) return;
    setTier((i) => {
      if (i === null) return i;
      if (i >= LADDER.length - 1) {
        finishRef.current();
        return i;
      }
      return i + 1;
    });
  }, []);

  useEffect(() => {
    // Safety net: never trap the visitor if the file stalls on a weak network.
    const t = window.setTimeout(finish, 14000);
    return () => window.clearTimeout(t);
  }, [finish]);

  // Free the GPU: stop the WebGL backdrop while the film plays.
  useEffect(() => {
    window.dispatchEvent(new Event("dm:pause3d"));
    return () => {
      window.dispatchEvent(new Event("dm:resume3d"));
    };
  }, []);

  // Try to play with sound; browsers that block it fall back to muted playback
  // and unmute automatically on the visitor's first interaction.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || tier === null) return;
    v.volume = 0.9;
    v.muted = false;
    let cleanup = () => {};
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      void v.play().catch(finish);
      const unmute = () => {
        v.muted = false;
        v.volume = 0.9;
        setMuted(false);
        void v.play();
        cleanup();
      };
      const opts = { once: true } as const;
      window.addEventListener("pointerdown", unmute, opts);
      window.addEventListener("keydown", unmute, opts);
      window.addEventListener("touchstart", unmute, opts);
      cleanup = () => {
        window.removeEventListener("pointerdown", unmute);
        window.removeEventListener("keydown", unmute);
        window.removeEventListener("touchstart", unmute);
      };
    });
    return () => cleanup();
  }, [finish, tier]);

  const enableSound = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.volume = 0.9;
    setMuted(false);
    void v.play();
  }, []);

  return (
    <div
      className={`${styles.root} ${fade ? styles.fade : ""}`}
      role="status"
      aria-label="Loading DIMISI Technologies"
    >
      {src ? (
        <video
          key={src}
          ref={videoRef}
          className={styles.video}
          src={src}
          poster={poster.url}
          autoPlay
          playsInline
          preload="auto"
          onEnded={finish}
          onStalled={onStall}
          onWaiting={onStall}
          onError={onError}
        />
      ) : (
        <img className={styles.video} src={poster.url} alt="" aria-hidden />
      )}
      <div className={styles.glow} />
      <div className={styles.vignette} />
      {muted ? (
        <button type="button" className={styles.sound} onClick={enableSound}>
          Tap for sound
        </button>
      ) : null}
      <button type="button" className={styles.skip} onClick={finish}>
        Skip intro
      </button>
    </div>
  );
}
