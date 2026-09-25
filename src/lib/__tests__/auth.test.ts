import test from "node:test";
import assert from "node:assert/strict";
import {
  decodeJwtPayload,
  getStoredAdminSession,
  clearAdminSession,
  type AdminAuthSession,
} from "../../services/adminAuth.service";
import { ApiError } from "../../services/apiClient";

test("Admin Authentication - JWT Payload Decoding", async (t) => {
  await t.test("decodes valid standard JWT payload safely", () => {
    // Valid mock JWT token with id and exp
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({
        id: "64b8f3e5c9e77b0012a4b8d1",
        type: "panel_user",
        exp: 1893456000, // 2030-01-01
      }),
    ).toString("base64url");
    const token = `${header}.${payload}.signature`;

    const decoded = decodeJwtPayload(token);
    assert.ok(decoded);
    assert.equal(decoded.id, "64b8f3e5c9e77b0012a4b8d1");
    assert.equal(decoded.type, "panel_user");
    assert.equal(decoded.exp, 1893456000);
  });

  await t.test("returns null for malformed or incomplete JWT tokens", () => {
    assert.equal(decodeJwtPayload(""), null);
    assert.equal(decodeJwtPayload("invalid-token"), null);
    assert.equal(decodeJwtPayload("part1"), null);
  });
});

test("Admin Authentication - Session Lifecycle & Storage", async (t) => {
  // Mock localStorage and sessionStorage for testing environment
  const mockStorage: Record<string, string> = {};
  const mockSessionStorage: Record<string, string> = {};

  (globalThis as any).localStorage = {
    getItem: (k: string) => mockStorage[k] || null,
    setItem: (k: string, v: string) => {
      mockStorage[k] = v;
    },
    removeItem: (k: string) => {
      delete mockStorage[k];
    },
    clear: () => {
      for (const k in mockStorage) delete mockStorage[k];
    },
  };

  (globalThis as any).sessionStorage = {
    getItem: (k: string) => mockSessionStorage[k] || null,
    setItem: (k: string, v: string) => {
      mockSessionStorage[k] = v;
    },
    removeItem: (k: string) => {
      delete mockSessionStorage[k];
    },
    clear: () => {
      for (const k in mockSessionStorage) delete mockSessionStorage[k];
    },
  };

  (globalThis as any).window = {
    dispatchEvent: () => true,
  };

  await t.test("stores and retrieves active admin session", () => {
    const activeSession: AdminAuthSession = {
      token: "valid-jwt-token",
      user: {
        id: "admin-1",
        email: "admin@dimisi.tech",
        user_metadata: { full_name: "Lead Admin", admin_role: "super_admin" },
      },
      expires_at: Date.now() + 3600 * 1000,
    };

    localStorage.setItem("dimisi_admin_session", JSON.stringify(activeSession));

    const retrieved = getStoredAdminSession();
    assert.ok(retrieved);
    assert.equal(retrieved.token, "valid-jwt-token");
    assert.equal(retrieved.user.email, "admin@dimisi.tech");
  });

  await t.test("automatically evicts expired admin session", () => {
    const expiredSession: AdminAuthSession = {
      token: "expired-jwt-token",
      user: {
        id: "admin-2",
        email: "expired@dimisi.tech",
      },
      expires_at: Date.now() - 5000, // Expired 5 seconds ago
    };

    localStorage.setItem("dimisi_admin_session", JSON.stringify(expiredSession));

    const retrieved = getStoredAdminSession();
    assert.equal(retrieved, null);
    assert.equal(localStorage.getItem("dimisi_admin_session"), null);
  });

  await t.test("clearAdminSession removes credentials and sets expiration notice", () => {
    localStorage.setItem("dimisi_admin_session", "some-session");

    clearAdminSession("Your admin session has expired. Please sign in again.");

    assert.equal(localStorage.getItem("dimisi_admin_session"), null);
    assert.equal(
      sessionStorage.getItem("dimisi_admin_session_expired"),
      "Your admin session has expired. Please sign in again.",
    );
  });
});

test("Admin Authentication - ApiError Class Integrity", async (t) => {
  await t.test("creates structured ApiError with status and custom data", () => {
    const err = new ApiError("Unauthorized", 401, { reason: "token_expired" });
    assert.equal(err.name, "ApiError");
    assert.equal(err.message, "Unauthorized");
    assert.equal(err.status, 401);
    assert.deepEqual(err.data, { reason: "token_expired" });
  });
});

test("Department Service - Standard Taxonomy Integrity", async (t) => {
  const { getAllActiveDepartmentsApi, getDepartmentByIdApi, DEFAULT_DEPARTMENTS } = await import("../../services/department.service");

  await t.test("returns standard departments without making invalid employee API calls", async () => {
    const depts = await getAllActiveDepartmentsApi();
    assert.ok(Array.isArray(depts));
    assert.equal(depts.length, DEFAULT_DEPARTMENTS.length);
    assert.ok(depts.some((d) => d.name === "Engineering"));
  });

  await t.test("resolves department by ID or code", async () => {
    const eng = await getDepartmentByIdApi("ENG");
    assert.ok(eng);
    assert.equal(eng.name, "Engineering");

    const none = await getDepartmentByIdApi("NON_EXISTENT");
    assert.equal(none, null);
  });
});
