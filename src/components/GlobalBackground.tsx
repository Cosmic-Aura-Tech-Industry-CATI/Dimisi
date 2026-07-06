import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  amp: number;
  speed: number;
  twinkle: number;
};

/**
 * Site-wide ambient background — continuous across every section:
 *  - a matte-black field (#050505)
 *  - drifting silver particles, faint stars and dust
 *  - delicate neural lines drawn between nearby particles
 *  - a subtle circuit-grid overlay
 *  - click anywhere to scatter nearby particles; they spring back home
 * pointer-events-none so it never blocks the UI; clicks are read from a window
 * listener so the scatter still works over buttons and links.
 */
export function GlobalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const reduceMotion = useRef(false);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const context = el.getContext("2d");
    if (!context) return;
    const cv = el;
    const ctx = context;

    reduceMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function build() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = width * dpr;
      cv.height = height * dpr;
      cv.style.width = `${width}px`;
      cv.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with viewport area, capped for performance.
      const count = Math.min(130, Math.floor((width * height) / 13000));
      particlesRef.current = Array.from({ length: count }, () => {
        const hx = Math.random() * width;
        const hy = Math.random() * height;
        return {
          x: hx,
          y: hy,
          homeX: hx,
          homeY: hy,
          vx: 0,
          vy: 0,
          size: 0.5 + Math.random() * 1.8,
          phase: Math.random() * Math.PI * 2,
          amp: 6 + Math.random() * 18,
          speed: 0.15 + Math.random() * 0.45,
          twinkle: 0.4 + Math.random() * 0.6,
        };
      });
    }

    build();

    let t = 0;
    const k = 0.016; // spring stiffness toward home
    const friction = 0.9;
    const LINK_DIST = 130;

    function frame() {
      t += 0.016;
      ctx.clearRect(0, 0, width, height);
      const ps = particlesRef.current;

      // Neural lines between nearby particles.
      for (let i = 0; i < ps.length; i++) {
        const a = ps[i];
        for (let j = i + 1; j < ps.length; j++) {
          const b = ps[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.12;
            ctx.strokeStyle = `rgba(210,210,215,${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Particles / stars.
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        const tx = p.homeX + Math.sin(t * p.speed + p.phase) * p.amp;
        const ty = p.homeY + Math.cos(t * p.speed * 0.8 + p.phase) * p.amp;

        p.vx = (p.vx + (tx - p.x) * k) * friction;
        p.vy = (p.vy + (ty - p.y) * k) * friction;
        p.x += p.vx;
        p.y += p.vy;

        const motionSpeed = Math.min(Math.hypot(p.vx, p.vy) / 6, 1);
        const flicker = 0.5 + Math.sin(t * 2 * p.twinkle + p.phase) * 0.5;
        const alpha = 0.14 + flicker * 0.35 + motionSpeed * 0.4;
        ctx.beginPath();
        ctx.fillStyle = `rgba(225,225,230,${Math.min(alpha, 0.85).toFixed(3)})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    if (reduceMotion.current) {
      ctx.clearRect(0, 0, width, height);
      for (const p of particlesRef.current) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(225,225,230,0.25)";
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      rafRef.current = requestAnimationFrame(frame);
    }

    function scatter(clientX: number, clientY: number) {
      const radius = 200;
      const power = 26;
      for (const p of particlesRef.current) {
        const dx = p.x - clientX;
        const dy = p.y - clientY;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < radius) {
          const force = (1 - dist / radius) * power;
          p.vx += (dx / dist) * force + (Math.random() - 0.5) * 3;
          p.vy += (dy / dist) * force + (Math.random() - 0.5) * 3;
        }
      }
    }

    function onClick(e: MouseEvent) {
      scatter(e.clientX, e.clientY);
    }
    function onResize() {
      build();
    }

    window.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050505]">
      {/* Subtle circuit-grid overlay — masked so it fades toward the edges */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(200,200,205,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(200,200,205,0.6) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(80% 70% at 50% 40%, black 0%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(80% 70% at 50% 40%, black 0%, transparent 85%)",
        }}
      />
      {/* Faint ambient glow to add depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 55% at 50% 30%, rgba(120,120,125,0.08) 0%, transparent 70%)",
        }}
      />
      {/* Particle / neural-line / star field */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
