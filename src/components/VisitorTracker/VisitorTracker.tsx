/**
 * Global Visitor Tracking Component
 * Subscribes to TanStack Router location transitions and manages visitor/session telemetry.
 */
import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { visitorTracker } from "@/lib/visitor-tracker";

export function VisitorTracker() {
  const location = useLocation();

  useEffect(() => {
    // Initialize session and global listeners on mount
    visitorTracker.init();

    return () => {
      visitorTracker.destroy();
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
