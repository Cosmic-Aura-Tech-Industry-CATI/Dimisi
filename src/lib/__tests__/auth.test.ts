import test from "node:test";
import assert from "node:assert/strict";
import {
  transformBackendPanelUser,
  getStoredAdminSession,
  clearAdminSession,
  type AdminAuthSession,
} from "../../services/adminAuth.service";
import { ApiError } from "../../services/apiClient";
import type { IPanelUserBackend } from "../../types/adminAuth.types";

test("Admin Authentication - Backend User Transformation", async (t) => {
  await t.test("transforms raw backend IPanelUser payload into clean AdminAuthUser", () => {
    const rawBackendUser: IPanelUserBackend = {
      _id: "panel-user-123",
      user: {
        _id: "user-456",
        name: "Swatantra Singh",
        email: "swatantrasingh308@gmail.com",
        empId: "EMP-001",
        designation: { title: "Lead Architect" },
        isActive: true,
      },
      role: "super_admin",
      isActive: true,
      permissions: ["services.create", "services.edit", "admins.view"],
    };

    const transformed = transformBackendPanelUser(rawBackendUser);
    assert.equal(transformed.id, "user-456");
    assert.equal(transformed.name, "Swatantra Singh");
    assert.equal(transformed.email, "swatantrasingh308@gmail.com");
    assert.equal(transformed.role, "super_admin");
    assert.equal(transformed.designation, "Lead Architect");
    assert.equal(transformed.empId, "EMP-001");
    assert.deepEqual(transformed.permissions, ["services.create", "services.edit", "admins.view"]);
    assert.equal(transformed.user_metadata.full_name, "Swatantra Singh");
    assert.equal(transformed.user_metadata.admin_role, "super_admin");
  });

  await t.test("handles string user reference gracefully", () => {
    const rawBackendUser: IPanelUserBackend = {
      _id: "panel-user-789",
      user: "user-999",
      role: "admin",
      isActive: true,
    };

    const transformed = transformBackendPanelUser(rawBackendUser, "admin@dimisi.tech");
    assert.equal(transformed.id, "user-999");
    assert.equal(transformed.email, "admin@dimisi.tech");
    assert.equal(transformed.role, "admin");
    assert.equal(transformed.name, "admin");
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
      user: {
        id: "admin-1",
        email: "admin@dimisi.tech",
        name: "Lead Admin",
        role: "super_admin",
        isActive: true,
        designation: "Super Admin",
        permissions: ["all"],
        user_metadata: {
          full_name: "Lead Admin",
          admin_role: "super_admin",
          designation: "Super Admin",
          emp_id: null,
          employee_id: null,
          avatar_url: null,
        },
      },
      authenticated_at: Date.now(),
      expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    localStorage.setItem("dimisi_admin_session", JSON.stringify(activeSession));

    const retrieved = getStoredAdminSession();
    assert.ok(retrieved);
    assert.equal(retrieved.user.email, "admin@dimisi.tech");
    assert.equal(retrieved.user.role, "super_admin");
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
