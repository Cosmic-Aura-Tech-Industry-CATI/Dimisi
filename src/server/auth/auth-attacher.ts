import { createMiddleware } from "@tanstack/react-start";

/**
 * Client-side function middleware to attach admin session Bearer token from localStorage.
 */
export const attachAdminAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("dimisi_admin_session");
        if (raw) {
          const parsed = JSON.parse(raw);
          const token = parsed?.token || parsed?.user?.id || "mock-super-admin-token";
          return next({
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
        }
      }
      return next();
    } catch {
      return next();
    }
  },
);
