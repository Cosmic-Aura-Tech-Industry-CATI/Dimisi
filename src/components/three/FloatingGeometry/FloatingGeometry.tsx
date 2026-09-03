import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FloatingGeometryProps {
  scrollRef: React.RefObject<number>;
  count?: number;
}

interface Shard {
  position: [number, number, number];
  scale: number;
  speed: number;
  kind: number;
}

const DEPTH = 110;

/** Asteroids streaming out of deep space toward the viewer as you scroll inward. */
export function FloatingGeometry({ scrollRef, count = 22 }: FloatingGeometryProps) {
  const group = useRef<THREE.Group>(null);
  const lastScroll = useRef(0);

  const shards = useMemo<Shard[]>(() => {
    const list: Shard[] = [];
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2 * 3.7;
      const radius = 3.2 + ((i * 17) % 9) * 0.9;
      list.push({
        position: [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.7,
          -((i / count) * DEPTH) - 4,
        ],
        scale: 0.22 + ((i * 13) % 7) / 18,
        speed: 0.15 + (i % 5) * 0.05,
        kind: i % 3,
      });
    }
    return list;
  }, [count]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const s = scrollRef.current ?? 0;
    const ds = s - lastScroll.current;
    lastScroll.current = s;
    const step = delta * 1.6 + ds * 200;

    group.current.children.forEach((child, i) => {
      let z = child.position.z + step;
      if (z > 7) z -= DEPTH;
      else if (z < -DEPTH) z += DEPTH;
      child.position.z = z;
      child.rotation.x = t * (0.12 + i * 0.01);
      child.rotation.y = t * 0.09;
      child.rotation.z = t * 0.06;
    });
  });

  return (
    <group ref={group}>
      {shards.map((shard, i) => (
        <mesh key={i} position={shard.position} scale={shard.scale}>
          {shard.kind === 0 ? (
            <icosahedronGeometry args={[1, 0]} />
          ) : shard.kind === 1 ? (
            <octahedronGeometry args={[1, 0]} />
          ) : (
            <torusGeometry args={[1, 0.12, 12, 40]} />
          )}
          <meshStandardMaterial
            color="#1a1a20"
            metalness={1}
            roughness={0.3}
            emissive="#ff7a12"
            emissiveIntensity={shard.kind === 2 ? 0.5 : 0.12}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}