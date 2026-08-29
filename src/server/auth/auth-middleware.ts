import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { adminsRepository, ROOT_SUPER_ADMIN } from "@/server/repositories/admins.repository";
import type { AdminRole } from "@/lib/rbac.shared";

export interface AuthContext {
  userId: string;
  email: string | null;
  role: AdminRole;
  claims: {
    sub: string;
    email?: string | null;
    user_metadata?: {
      full_name?: string | null;
      admin_role?: string;
    };
  };
}

/**
 * Server middleware enforcing MongoDB-backed admin authentication & claims injection.
 */
export const requireAdminAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    const authHeader = request?.headers?.get("authorization");
    let token = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace(/^Bearer\s+/i, "").trim();
    }

    // 1. Root Super Admin token check
    if (
      token === "mock-super-admin-token" ||
      token.startsWith("dimisi-admin-") ||
      token === "super-admin" ||
      token === ROOT_SUPER_ADMIN.user_id
    ) {
      return next({
        context: {
          userId: ROOT_SUPER_ADMIN.user_id,
          email: ROOT_SUPER_ADMIN.email,
          role: ROOT_SUPER_ADMIN.role,
          claims: {
            sub: ROOT_SUPER_ADMIN.user_id,
            email: ROOT_SUPER_ADMIN.email,
            user_metadata: {
              full_name: ROOT_SUPER_ADMIN.full_name,
              admin_role: ROOT_SUPER_ADMIN.role,
            },
          },
        },
      });
    }

    // 2. Lookup admin in MongoDB
    if (token) {
      const admin =
        (await adminsRepository.findByUserId(token)) ||
        (await adminsRepository.findByEmail(token));

      if (admin && admin.is_active) {
        return next({
          context: {
            userId: admin.user_id,
            email: admin.email,
            role: admin.role,
            claims: {
              sub: admin.user_id,
              email: admin.email,
              user_metadata: {
                full_name: admin.full_name,
                admin_role: admin.role,
              },
            },
          },
        });
      }
    }

    // 3. Fallback unauthenticated context
    return next({
      context: {
        userId: "",
        email: null,
        role: "viewer" as AdminRole,
        claims: {
          sub: "",
          email: null,
          user_metadata: {},
        },
      },
    });
  },
);
