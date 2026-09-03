import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { ParticleField } from "../ParticleField/ParticleField";
import { FloatingGeometry } from "../FloatingGeometry/FloatingGeometry";
import { CameraRig } from "../CameraRig/CameraRig";
import { AmbientBrandField } from "../AmbientBrandField/AmbientBrandField";
import { usePointer } from "@/hooks/usePointer";
import { getPerfProfile, scaleCount } from "@/lib/perf";
import styles from "./CinematicStage.module.css";

/**
 * The persistent WebGL layer behind the entire experience.
 * Scroll drives the camera, the character and the environment — never the DOM alone.
 */
export function CinematicStage() {
  const pointer = usePointer();
  const scrollRef = useRef(0);
  const raysRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  // Defer the WebGL layer until after first paint so the page loads fast.
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [perf] = useState(() => getPerfProfile());

  useEffect(() => {
    const idle =
      (window as unknown as { requestIdleCallback?: (cb: () => void) => number })
        .requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const id = idle(() => setReady(true));
    return () => window.clearTimeout(id as number);
  }, []);

  useEffect(() => {
    const onVis = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    const onPause = () => setActive(false);
    const onResume = () => setActive(!document.hidden);
    window.addEventListener("dm:pause3d", onPause);
    window.addEventListener("dm:resume3d", onResume);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("dm:pause3d", onPause);
      window.removeEventListener("dm:resume3d", onResume);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const s = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      scrollRef.current = s;
      // 3D parallax on the backdrop layers themselves
      if (raysRef.current) {
        raysRef.current.style.transform = `perspective(1200px) rotateX(${s * 18}deg) rotateZ(${s * 26}deg) scale(${1 + s * 0.25})`;
      }
      if (stageRef.current) {
        stageRef.current.style.setProperty("--dm-scroll", String(s));
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={stageRef} className={styles.stage} aria-hidden="true">
      {ready && !perf.reducedMotion ? (
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={perf.dpr}
        gl={{
          antialias: perf.antialias,
          powerPreference: "high-performance",
          alpha: true,
          stencil: false,
          depth: true,
        }}
        camera={{ position: [0, 0, 7], fov: 42 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
        }}
      >
        <fog attach="fog" args={["#050507", 14, 95]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} color="#ffb454" />
        <pointLight position={[-5, -2, 3]} intensity={28} color="#ff6a00" distance={18} />
        <pointLight position={[5, 3, -4]} intensity={20} color="#f7c56b" distance={20} />
        <spotLight
          position={[0, 7, 4]}
          angle={0.6}
          penumbra={1}
          intensity={40}
          color="#ffd9a0"
          distance={26}
        />

        <Suspense fallback={null}>
          <CameraRig pointer={pointer} scrollRef={scrollRef} />
          <FloatingGeometry scrollRef={scrollRef} count={scaleCount(22, 8)} />
          <ParticleField scrollRef={scrollRef} count={scaleCount(1400, 350)} />
        </Suspense>
      </Canvas>
      ) : null}
      <div ref={raysRef} className={styles.rays} />
      <AmbientBrandField scrollRef={scrollRef} />
      <div className={styles.scrim} />
      <div className={styles.fog} />
    </div>
  );
}