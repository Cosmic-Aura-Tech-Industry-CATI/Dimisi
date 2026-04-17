"use client";

import { useEffect } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import CursorGlow from "@/components/CursorGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function LayoutClient({
  children,
  interVariable,
}: {
  children: React.ReactNode;
  interVariable: string;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      root.style.setProperty("--star-shift-x", "0px");
      root.style.setProperty("--star-shift-y", "0px");
      return;
    }

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let raf = 0;

    const update = () => {
      const shiftX = (x / window.innerWidth - 0.5) * 100;
      const shiftY = (y / window.innerHeight - 0.5) * 72;

      root.style.setProperty("--star-shift-x", `${shiftX.toFixed(2)}px`);
      root.style.setProperty("--star-shift-y", `${shiftY.toFixed(2)}px`);
      raf = 0;
    };

    const onMouseMove = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!raf) {
        raf = window.requestAnimationFrame(update);
      }
    };

    const reset = () => {
      root.style.setProperty("--star-shift-x", "0px");
      root.style.setProperty("--star-shift-y", "0px");
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", reset);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", reset);
      if (raf) {
        window.cancelAnimationFrame(raf);
      }
      reset();
    };
  }, []);

  return (
    <body className={`${interVariable} min-h-full flex flex-col bg-background text-foreground selection:bg-blue-500/30 overflow-x-hidden`}>
      <div className="site-bg" aria-hidden="true">
        <span className="site-bg-stars" />
        <span className="site-bg-orbit" />
        <span className="site-bg-vignette" />
      </div>
      <SmoothScroll>
        <CursorGlow />
        {!isAuthPage && <Navbar />}
        {children}
        {!isAuthPage && <Footer />}
      </SmoothScroll>
    </body>
  );
}
