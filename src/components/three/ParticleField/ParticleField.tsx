import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleFieldProps {
  count?: number;
  /** Radius of the tunnel the stars fill. */
  radius?: number;
  /** Depth of the looping corridor. */
  depth?: number;
  scrollRef?: React.RefObject<number>;
}

/**
 * Infinite starfield corridor. Stars stream past the camera and wrap around,
 * so scrolling reads as flying deeper into open space — never a finite cloud.
 */
export function ParticleField({
  count = 1400,
  radius = 16,
  depth = 120,
  scrollRef,
}: ParticleFieldProps) {
  const points = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const r = radius * Math.sqrt(Math.random()) + 0.6;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = Math.sin(theta) * r * 0.75;
      positions[i * 3 + 2] = -Math.random() * depth;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count, radius, depth]);

  const travel = useRef(0);
  const lastScroll = useRef(0);

  useFrame((state, delta) => {
    const pts = points.current;
    if (!pts) return;
    const t = state.clock.elapsedTime;

    const s = scrollRef?.current ?? 0;
    const ds = s - lastScroll.current;
    lastScroll.current = s;

    // constant drift + scroll thrust
    travel.current += delta * 2.2 + ds * 260;

    const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const step = delta * 2.2 + ds * 260;
    for (let i = 2; i < arr.length; i += 3) {
      let z = arr[i]! + step;
      if (z > 6) z -= depth;
      else if (z < -depth) z += depth;
      arr[i] = z;
    }
    attr.needsUpdate = true;

    pts.rotation.z = Math.sin(t * 0.05) * 0.08 + s * 0.6;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        color="#ffc78a"
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}