import { useEffect, useRef } from "react";

/**
 * Adds a class when the element enters the viewport.
 * Used by every reveal animation on the site so behaviour stays responsive and instant.
 */
export function useReveal<T extends HTMLElement>(visibleClass: string, threshold = 0.05) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.classList.add(visibleClass);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add(visibleClass);
            observer.unobserve(el);
          }
        });
      },
      { threshold, rootMargin: "0px 0px 40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleClass, threshold]);

  return ref;
}