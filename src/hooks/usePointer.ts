import { useEffect, useRef } from "react";

export interface PointerRef {
  x: number;
  y: number;
}

/** Normalised (-1..1) pointer position, ref-based so it never re-renders. */
export function usePointer() {
  const pointer = useRef<PointerRef>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return pointer;
}