/**
 * Global Visitor Tracking Component
 * Subscribes to TanStack Router location transitions and manages visitor/session telemetry.
 */
import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { visitorTracker } from "@/lib/visitor-tracker";
import { API_BASE_URL } from "@/services/apiClient";

export function VisitorTracker() {
  const location = useLocation();

  useEffect(() => {
    // Initialize session and global listeners on mount
    visitorTracker.init();

    // Lightweight keep-alive warm-up ping for hosted backend instances
    const pingBackend = () => {
      if (typeof window === "undefined" || document.hidden) return;
      fetch(`${API_BASE_URL}/api/v1/health`, { method: "GET", mode: "cors" }).catch(() => {});
    };

    const initTimer = window.setTimeout(pingBackend, 3000);
    const interval = window.setInterval(pingBackend, 8 * 60 * 1000);

    return () => {
      visitorTracker.destroy();
      window.clearTimeout(initTimer);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Record page view transition whenever the pathname changes
    if (location?.pathname) {
      visitorTracker.onNavigate(location.pathname);
    }
  }, [location?.pathname]);

  return null;
}
