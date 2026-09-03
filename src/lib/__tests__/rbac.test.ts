import test from "node:test";
import assert from "node:assert/strict";
import {
  type AdminRole,
  hasPermission,
  canAccessTab,
  isSuperAdmin,
  getRoleMeta,
  ROLE_PERMISSIONS,
  ADMIN_ROLES,
} from "../../../dimisi-admin/lib/rbac.shared";

test("RBAC System - Role Definitions & Metadata", async (t) => {
  await t.test("defines all 5 authoritative roles with valid metadata", () => {
    const roles: AdminRole[] = ["super_admin", "admin", "editor", "moderator", "analyst"];
    assert.equal(ADMIN_ROLES.length, 5);

    for (const r of roles) {
      const meta = getRoleMeta(r);
      assert.ok(meta);
      assert.equal(meta.id, r);
      assert.ok(meta.label.length > 0);
      assert.ok(meta.color.length > 0);
      assert.ok(meta.description.length > 0);
    }
  });

  await t.test("correctly identifies Super Admin", () => {
    assert.equal(isSuperAdmin("super_admin"), true);
    assert.equal(isSuperAdmin("admin"), false);
    assert.equal(isSuperAdmin("editor"), false);
    assert.equal(isSuperAdmin("moderator"), false);
    assert.equal(isSuperAdmin("analyst"), false);
    assert.equal(isSuperAdmin(null), false);
  });
});

test("RBAC System - Granular Permission Mapping", async (t) => {
  await t.test("Super Admin has unrestricted permissions across all modules", () => {
    assert.equal(hasPermission("super_admin", "admins.view"), true);
    assert.equal(hasPermission("super_admin", "admins.create"), true);
    assert.equal(hasPermission("super_admin", "admins.change_role"), true);
    assert.equal(hasPermission("super_admin", "admins.delete"), true);
    assert.equal(hasPermission("super_admin", "services.create"), true);
    assert.equal(hasPermission("super_admin", "blog.delete"), true);
    assert.equal(hasPermission("super_admin", "moderation.manage"), true);
    assert.equal(hasPermission("super_admin", "analytics.view"), true);
  });

  await t.test("Admin can view admins and manage content but cannot change roles or delete admins", () => {
    assert.equal(hasPermission("admin", "admins.view"), true);
    assert.equal(hasPermission("admin", "admins.create"), false);
    assert.equal(hasPermission("admin", "admins.change_role"), false);
    assert.equal(hasPermission("admin", "admins.delete"), false);
    assert.equal(hasPermission("admin", "services.create"), true);
    assert.equal(hasPermission("admin", "blog.create"), true);
    assert.equal(hasPermission("admin", "moderation.manage"), true);
    assert.equal(hasPermission("admin", "analytics.view"), true);
  });

  await t.test("Editor has CMS content permissions but no administrative or moderation rights", () => {
    assert.equal(hasPermission("editor", "services.create"), true);
    assert.equal(hasPermission("editor", "work.create"), true);
    assert.equal(hasPermission("editor", "blog.create"), true);
    assert.equal(hasPermission("editor", "events.create"), true);
    assert.equal(hasPermission("editor", "admins.view"), false);
    assert.equal(hasPermission("editor", "admins.create"), false);
    assert.equal(hasPermission("editor", "moderation.manage"), false);
    assert.equal(hasPermission("editor", "analytics.view"), false);
  });

  await t.test("Moderator has review and queue permissions only", () => {
    assert.equal(hasPermission("moderator", "reviews.view"), true);
    assert.equal(hasPermission("moderator", "reviews.moderate"), true);
    assert.equal(hasPermission("moderator", "moderation.manage"), true);
    assert.equal(hasPermission("moderator", "notifications.manage"), true);
    assert.equal(hasPermission("moderator", "admins.view"), false);
    assert.equal(hasPermission("moderator", "services.create"), false);
    assert.equal(hasPermission("moderator", "blog.create"), false);
  });

  await t.test("Analyst has read-only reporting and metrics access", () => {
    assert.equal(hasPermission("analyst", "analytics.view"), true);
    assert.equal(hasPermission("analyst", "leads.view"), true);
    assert.equal(hasPermission("analyst", "campaigns.view"), true);
    assert.equal(hasPermission("analyst", "admins.view"), false);
    assert.equal(hasPermission("analyst", "blog.create"), false);
    assert.equal(hasPermission("analyst", "services.create"), false);
  });
});

test("RBAC System - Tab Access & Navigation Filtering", async (t) => {
  await t.test("Super Admin can access every tab in the control room", () => {
    const allTabs = [
      "overview",
      "services",
      "work",
      "careers",
      "blog",
      "events",
      "reviews",
      "campaigns",
      "reports",
      "analytics",
      "settings",
      "leads",
      "admins",
    ];

    for (const tab of allTabs) {
      assert.equal(canAccessTab("super_admin", tab), true, `Super Admin should access ${tab}`);
    }
  });

  await t.test("Editor can only access content tabs and overview", () => {
    assert.equal(canAccessTab("editor", "overview"), true);
    assert.equal(canAccessTab("editor", "services"), true);
    assert.equal(canAccessTab("editor", "work"), true);
    assert.equal(canAccessTab("editor", "careers"), true);
    assert.equal(canAccessTab("editor", "blog"), true);
    assert.equal(canAccessTab("editor", "events"), true);

    assert.equal(canAccessTab("editor", "admins"), false);
    assert.equal(canAccessTab("editor", "reports"), false);
    assert.equal(canAccessTab("editor", "settings"), false);
    assert.equal(canAccessTab("editor", "leads"), false);
  });

  await t.test("Moderator can access reviews, moderation queue, and settings", () => {
    assert.equal(canAccessTab("moderator", "overview"), true);
    assert.equal(canAccessTab("moderator", "reviews"), true);
    assert.equal(canAccessTab("moderator", "reports"), true);
    assert.equal(canAccessTab("moderator", "settings"), true);

    assert.equal(canAccessTab("moderator", "admins"), false);
    assert.equal(canAccessTab("moderator", "services"), false);
    assert.equal(canAccessTab("moderator", "work"), false);
    assert.equal(canAccessTab("moderator", "careers"), false);
  });

  await t.test("Analyst can access overview, analytics, leads, and campaigns", () => {
    assert.equal(canAccessTab("analyst", "overview"), true);
    assert.equal(canAccessTab("analyst", "analytics"), true);
    assert.equal(canAccessTab("analyst", "leads"), true);
    assert.equal(canAccessTab("analyst", "campaigns"), true);

    assert.equal(canAccessTab("analyst", "admins"), false);
    assert.equal(canAccessTab("analyst", "careers"), false);
    assert.equal(canAccessTab("analyst", "settings"), false);
  });
});
