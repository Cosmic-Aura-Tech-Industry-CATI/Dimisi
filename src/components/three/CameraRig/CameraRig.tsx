import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PointerRef } from "@/hooks/usePointer";

interface CameraRigProps {
  pointer: React.RefObject<PointerRef>;
  scrollRef: React.RefObject<number>;
}

/** Scroll = movie timeline. Camera dollies, orbits and tilts through five chapters. */
export function CameraRig({ pointer, scrollRef }: CameraRigProps) {
  useFrame((state) => {
    const s = scrollRef.current ?? 0;
    const p = pointer.current ?? { x: 0, y: 0 };
    const t = state.clock.elapsedTime;

    // Gentle drift only — depth comes from the starfield streaming past us,
    // so the camera stays anchored and space feels endless in every direction.
    const targetX = Math.sin(s * Math.PI * 2 + t * 0.05) * 1.1 + p.x * 0.5;
    const targetY = Math.cos(s * Math.PI * 1.4) * 0.5 - p.y * 0.35;
    const targetZ = 7;

    state.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.05);
    state.camera.lookAt(p.x * 0.35, -p.y * 0.25 + Math.sin(t * 0.2) * 0.05, -20);
  });

  return null;
}