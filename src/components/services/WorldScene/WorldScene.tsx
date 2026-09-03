import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { WorldMotif } from "@/data/serviceWorlds";
import { usePointer } from "@/hooks/usePointer";
import { getPerfProfile, scaleCount } from "@/lib/perf";
import styles from "./WorldScene.module.css";

const AMBER = "#ff8c1a";
const GOLD = "#ffc78a";
const SILVER = "#d8d8d8";

/** Core object — its geometry changes per service world. */
function Core({ motif, pointer }: { motif: WorldMotif; pointer: React.RefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);

  const geo = useMemo(() => {
    switch (motif) {
      case "ai":
        return new THREE.IcosahedronGeometry(1.15, 1);
      case "web":
        return new THREE.BoxGeometry(1.9, 1.25, 0.09);
      case "mobile":
        return new THREE.BoxGeometry(0.78, 1.6, 0.09);
      case "cloud":
        return new THREE.SphereGeometry(1.15, 32, 32);
      case "automation":
        return new THREE.TorusGeometry(1.05, 0.24, 20, 64);
      case "uiux":
        return new THREE.TorusKnotGeometry(0.82, 0.2, 128, 24);
      case "enterprise":
        return new THREE.CylinderGeometry(1.05, 1.05, 0.6, 6, 1, true);
      default:
        return new THREE.OctahedronGeometry(1.2, 0);
    }
  }, [motif]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y += delta * 0.35;
    g.rotation.x = Math.sin(t * 0.3) * 0.18 + (pointer.current?.y ?? 0) * 0.25;
    g.rotation.z = (pointer.current?.x ?? 0) * 0.12;
    g.position.y = Math.sin(t * 0.7) * 0.12;
    const s = 1 + Math.sin(t * 1.2) * 0.02;
    g.scale.setScalar(s);
  });

  return (
    <group ref={group}>
      <mesh geometry={geo}>
        <meshStandardMaterial
          color={SILVER}
          metalness={0.95}
          roughness={0.22}
          emissive={AMBER}
          emissiveIntensity={0.22}
          wireframe={motif === "ai" || motif === "api"}
        />
      </mesh>
      <mesh geometry={geo} scale={1.06}>
        <meshBasicMaterial color={AMBER} wireframe transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

/** Orbiting satellite nodes — instanced for performance. */
function Nodes({ count = 46, radius = 2.6 }: { count?: number; radius?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        a: Math.random() * Math.PI * 2,
        r: radius * (0.7 + Math.random() * 0.6),
        y: (Math.random() - 0.5) * 2.6,
        s: 0.03 + Math.random() * 0.06,
        v: 0.12 + Math.random() * 0.3,
      })),
    [count, radius],
  );

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    seeds.forEach((s, i) => {
      const a = s.a + t * s.v;
      dummy.position.set(Math.cos(a) * s.r, s.y + Math.sin(t * 0.6 + i) * 0.12, Math.sin(a) * s.r);
      dummy.scale.setScalar(s.s);
      dummy.rotation.set(t * 0.4, a, 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={GOLD} emissive={AMBER} emissiveIntensity={1.1} metalness={0.6} roughness={0.3} />
    </instancedMesh>
  );
}

function Rings() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (a.current) a.current.rotation.z += delta * 0.25;
    if (b.current) b.current.rotation.z -= delta * 0.16;
    if (b.current) b.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.6;
  });
  return (
    <group rotation={[Math.PI / 2.6, 0, 0]}>
      <mesh ref={a}>
        <torusGeometry args={[2.1, 0.008, 8, 128]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0.55} />
      </mesh>
      <mesh ref={b}>
        <torusGeometry args={[2.9, 0.006, 8, 128]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function Dust({ count = 700 }: { count?: number }) {
  const pts = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = -Math.random() * 30;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [count]);

  useFrame((_, delta) => {
    const p = pts.current;
    if (!p) return;
    const attr = p.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 2; i < arr.length; i += 3) {
      let z = arr[i]! + delta * 1.6;
      if (z > 4) z -= 30;
      arr[i] = z;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pts} geometry={geometry}>
      <pointsMaterial
        size={0.045}
        sizeAttenuation
        color={GOLD}
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Rig({ pointer }: { pointer: React.RefObject<{ x: number; y: number }> }) {
  useFrame((state, delta) => {
    const p = pointer.current ?? { x: 0, y: 0 };
    const cam = state.camera;
    cam.position.x += (p.x * 1.2 - cam.position.x) * Math.min(1, delta * 2);
    cam.position.y += (-p.y * 0.8 - cam.position.y) * Math.min(1, delta * 2);
    cam.lookAt(0, 0, 0);
  });
  return null;
}

export function WorldScene({ motif }: { motif: WorldMotif }) {
  const pointer = usePointer();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [perf] = useState(() => getPerfProfile());
  const [active, setActive] = useState(false);

  // Only render frames while the scene is on screen and the tab is visible.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let onScreen = false;
    const sync = () => setActive(onScreen && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      onScreen = !!e?.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div ref={wrapRef} className={styles.wrap} aria-hidden="true">
      {perf.reducedMotion ? null : (
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={perf.dpr}
        gl={{
          antialias: perf.antialias,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
        }}
        camera={{ position: [0, 0, 6.2], fov: 45 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <fog attach="fog" args={["#0b0b0d", 8, 34]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 5]} intensity={2.4} color={GOLD} />
        <pointLight position={[-4, -2, 2]} intensity={26} color={AMBER} distance={16} />
        <spotLight position={[0, 5, 4]} angle={0.7} penumbra={1} intensity={30} color="#ffd9a0" distance={22} />
        <Rig pointer={pointer} />
        <Core motif={motif} pointer={pointer} />
        <Nodes count={scaleCount(46, 14)} />
        <Rings />
        <Dust count={scaleCount(700, 160)} />
      </Canvas>
      )}
      <span className={styles.halo} />
    </div>
  );
}
