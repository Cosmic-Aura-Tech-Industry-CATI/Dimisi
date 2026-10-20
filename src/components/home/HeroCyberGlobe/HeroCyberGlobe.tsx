import type { HomeHeroConfig } from "@/types/homeHero.types";
import { DEFAULT_HOME_HERO_CONFIG } from "@/types/homeHero.types";
import { Suspense, useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  Lightbulb,
  Cpu,
  TrendingUp,
  Users,
  Target,
} from "lucide-react";
import { getPerfProfile, type PerfProfile } from "@/lib/perf";
import styles from "./HeroCyberGlobe.module.css";

// 3D Photorealistic Blue Marble Earth with Dynamic Cloud Systems (Option B)
function GlobeMesh({ perf, isPaused }: { perf: PerfProfile; isPaused: boolean }) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Scaled geometry details according to client GPU tier
  const geoConfig = useMemo(() => {
    if (perf.tier === "low") {
      return {
        sphere: [1.5, 32, 24] as [number, number, number],
        clouds: [1.52, 24, 18] as [number, number, number],
        atmosphere: [1.54, 16, 12] as [number, number, number],
        ring1: [2.08, 0.022, 12, 40] as [number, number, number, number],
        ring2: [2.38, 0.018, 12, 40] as [number, number, number, number],
        ring3: [2.6, 0.012, 12, 36] as [number, number, number, number],
        particleCount: 90,
      };
    }
    if (perf.tier === "medium") {
      return {
        sphere: [1.5, 48, 36] as [number, number, number],
        clouds: [1.52, 36, 28] as [number, number, number],
        atmosphere: [1.54, 24, 18] as [number, number, number],
        ring1: [2.08, 0.022, 14, 60] as [number, number, number, number],
        ring2: [2.38, 0.018, 14, 60] as [number, number, number, number],
        ring3: [2.6, 0.012, 14, 50] as [number, number, number, number],
        particleCount: 150,
      };
    }
    return {
      sphere: [1.5, 64, 48] as [number, number, number],
      clouds: [1.52, 48, 36] as [number, number, number],
      atmosphere: [1.54, 32, 24] as [number, number, number],
      ring1: [2.08, 0.022, 16, 80] as [number, number, number, number],
      ring2: [2.38, 0.018, 16, 80] as [number, number, number, number],
      ring3: [2.6, 0.012, 16, 70] as [number, number, number, number],
      particleCount: 220,
    };
  }, [perf.tier]);

  // Load High-Resolution NASA Blue Marble Earth & Clouds Textures
  const { earthTexture, cloudsTexture } = useMemo(() => {
    if (typeof window === "undefined") {
      return { earthTexture: null, cloudsTexture: null };
    }
    const loader = new THREE.TextureLoader();
    const earth = loader.load("/textures/earth-blue-marble.jpg");
    earth.colorSpace = THREE.SRGBColorSpace;
    earth.wrapS = THREE.RepeatWrapping;
    earth.wrapT = THREE.ClampToEdgeWrapping;

    const clouds = loader.load("/textures/earth-clouds.png");
    clouds.colorSpace = THREE.SRGBColorSpace;
    clouds.wrapS = THREE.RepeatWrapping;
    clouds.wrapT = THREE.ClampToEdgeWrapping;

    return { earthTexture: earth, cloudsTexture: clouds };
  }, []);

  // Subtle orbital particle field around Earth
  const particles = useMemo(() => {
    const count = geoConfig.particleCount;
    const pos = new Float32Array(count * 3);
    const radius = 1.62;
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = radius + (Math.random() - 0.5) * 0.12;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    return pos;
  }, [geoConfig.particleCount]);

  useFrame((_, delta) => {
    // If paused (e.g. scrolled out of view or modal open), abort CPU/GPU matrix compute immediately
    if (isPaused) return;

    // Realistic Earth axial rotation
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.12;
    }
    // Dynamic clouds rotate independently slightly faster for weather realism
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.16;
    }
    // Subtle particle drift
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.06;
    }
    // Orbital Rings Rotation (Zero Clipping at Calibrated Distances)
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.32;
      ring1Ref.current.rotation.x += delta * 0.07;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.22;
      ring2Ref.current.rotation.y += delta * 0.11;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x -= delta * 0.16;
      ring3Ref.current.rotation.z += delta * 0.14;
    }
  });

  return (
    <group ref={globeGroupRef} position={[0, 0, 0]}>
      {/* 1. Real Blue Marble Earth Surface (Vivid Oceans, Continents, Ice Caps) */}
      <mesh ref={earthRef} rotation={[0.2, 0, 0]}>
        <sphereGeometry args={geoConfig.sphere} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.55}
          metalness={0.08}
        />
      </mesh>

      {/* 2. Realistic Dynamic Cloud Layer (Moving Weather Atmosphere) */}
      <mesh ref={cloudsRef} rotation={[0.2, 0, 0]}>
        <sphereGeometry args={geoConfig.clouds} />
        <meshStandardMaterial
          map={cloudsTexture}
          transparent
          opacity={0.42}
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Soft Atmospheric Horizon Fresnel Blue Glow */}
      <mesh ref={atmosphereRef} rotation={[0.2, 0, 0]}>
        <sphereGeometry args={geoConfig.atmosphere} />
        <meshBasicMaterial
          color="#60b5ff"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 4. Global Network Satellite Particle Constellation */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.048}
          color="#ffd685"
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 5. Primary Orbital Ring (Equatorial Tilt) - Radius 2.08 */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={geoConfig.ring1} />
        <meshStandardMaterial
          color="#ffb238"
          emissive="#ff8c1a"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.95}
        />
      </mesh>

      {/* 6. Secondary Orbital Ring (Cross Angle) - Radius 2.38 */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={geoConfig.ring2} />
        <meshStandardMaterial
          color="#ffa026"
          emissive="#ff5f2e"
          emissiveIntensity={0.95}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* 7. Tertiary Outer Gyro Ring - Radius 2.60 */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 6, -Math.PI / 4, Math.PI / 3]}>
        <torusGeometry args={geoConfig.ring3} />
        <meshBasicMaterial
          color="#ffd79a"
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Cinematic Solar Lighting (Sun Direction Illuminates the Real Earth) */}
      <ambientLight intensity={0.55} color="#e6f2ff" />
      <directionalLight position={[6, 4, 5]} intensity={2.6} color="#ffffff" />
      <pointLight color="#ff8c1a" intensity={24} distance={12} position={[-4, -2, 3]} />
    </group>
  );
}

interface HeroCyberGlobeProps {
  orbitCards?: HomeHeroConfig["orbitCards"];
}

export function HeroCyberGlobe({
  orbitCards = DEFAULT_HOME_HERO_CONFIG.orbitCards,
}: HeroCyberGlobeProps = {}) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [explicitPause, setExplicitPause] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [perf] = useState(() => getPerfProfile());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pause render loop if story video modal or background events request it
  useEffect(() => {
    const onPause = () => setExplicitPause(true);
    const onResume = () => setExplicitPause(false);
    window.addEventListener("dm:pause3d", onPause);
    window.addEventListener("dm:resume3d", onResume);
    return () => {
      window.removeEventListener("dm:pause3d", onPause);
      window.removeEventListener("dm:resume3d", onResume);
    };
  }, []);

  // Performance Guard: Stop 3D WebGL render loop when Hero is scrolled out of viewport
  useEffect(() => {
    if (!wrapperRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry?.isIntersecting ?? true);
      },
      { rootMargin: "120px" },
    );
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const shouldRender = isVisible && !explicitPause;

  return (
    <div
      ref={wrapperRef}
      className={styles.globeWrapper}
      aria-label="DIMISI Global Photorealistic Earth Network"
    >
      {/* 1. Ambient Glow Backdrops */}
      <div className={styles.coreGlowBackdrop} aria-hidden="true" />
      <div className={styles.radiantRingGlow} aria-hidden="true" />

      {/* 2. 3D WebGL Canvas Layer (Calibrated for Zero Clipping at z=7.6) */}
      <div className={styles.canvasContainer}>
        {mounted ? (
          <Canvas
            camera={{ position: [0, 0, 7.6], fov: 45 }}
            gl={{
              antialias: perf.antialias,
              alpha: true,
              powerPreference: perf.tier === "low" ? "default" : "high-performance",
            }}
            dpr={perf.dpr}
            frameloop={shouldRender ? "always" : "never"}
          >
            <Suspense fallback={null}>
              <GlobeMesh perf={perf} isPaused={!shouldRender} />
            </Suspense>
          </Canvas>
        ) : null}
      </div>

      {/* 3. Center Metallic Silver DIMISI Emblem (Official Brand Monogram) */}
      <div className={styles.centerLogoBadge} aria-hidden="true">
        <div className={styles.logoEmblemInner}>
          <img
            src="/dimisi-silver-logo.png"
            alt="DIMISI Technologies"
            className={styles.dimisiSilverLogo}
            loading="eager"
            decoding="async"
            width={98}
            height={98}
          />
        </div>
      </div>

      {/* 4. Surrounding 5 Floating Glass Feature Badges */}
      {/* Badge 1: Ideas (Top Left) */}
      <div className={[styles.orbitCard, styles.cardIdeas].join(" ")}>
        <div className={styles.cardIconBox}>
          <Lightbulb size={16} />
        </div>
        <div className={styles.cardTextBox}>
          <span className={styles.cardTitle}>{orbitCards.ideas.title}</span>
          <span className={styles.cardDesc}>{orbitCards.ideas.desc}</span>
        </div>
      </div>

      {/* Badge 2: Technology (Top Right) */}
      <div className={[styles.orbitCard, styles.cardTech].join(" ")}>
        <div className={styles.cardIconBox}>
          <Cpu size={16} />
        </div>
        <div className={styles.cardTextBox}>
          <span className={styles.cardTitle}>{orbitCards.technology.title}</span>
          <span className={styles.cardDesc}>{orbitCards.technology.desc}</span>
        </div>
      </div>

      {/* Badge 3: Growth (Mid Left) */}
      <div className={[styles.orbitCard, styles.cardGrowth].join(" ")}>
        <div className={styles.cardIconBox}>
          <TrendingUp size={16} />
        </div>
        <div className={styles.cardTextBox}>
          <span className={styles.cardTitle}>{orbitCards.growth.title}</span>
          <span className={styles.cardDesc}>{orbitCards.growth.desc}</span>
        </div>
      </div>

      {/* Badge 4: People (Mid Right) */}
      <div className={[styles.orbitCard, styles.cardPeople].join(" ")}>
        <div className={styles.cardIconBox}>
          <Users size={16} />
        </div>
        <div className={styles.cardTextBox}>
          <span className={styles.cardTitle}>{orbitCards.people.title}</span>
          <span className={styles.cardDesc}>{orbitCards.people.desc}</span>
        </div>
      </div>

      {/* Badge 5: Impact (Bottom Right) */}
      <div className={[styles.orbitCard, styles.cardImpact].join(" ")}>
        <div className={styles.cardIconBox}>
          <Target size={16} />
        </div>
        <div className={styles.cardTextBox}>
          <span className={styles.cardTitle}>{orbitCards.impact.title}</span>
          <span className={styles.cardDesc}>{orbitCards.impact.desc}</span>
        </div>
      </div>
    </div>
  );
}
