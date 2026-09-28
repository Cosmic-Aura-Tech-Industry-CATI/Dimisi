import { useState, useMemo } from "react";
import {
  ShieldCheck,
  Trash2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  X,
  Shield,
  Search,
  Info,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";
import {
  grantAdminAccess,
  setAdminRole,
  setAdminActive,
  deleteUserAccount,
  type AdminUser,
} from "../../server/admin.functions";
import {
  type AdminRole,
  ADMIN_ROLES,
  getRoleMeta,
  isSuperAdmin,
} from "../../lib/rbac.shared";
import shared from "../styles/admin.module.css";
import styles from "./AdminAdmins.module.css";

type Result = { admins: AdminUser[]; message: string };

interface AdminAdminsProps {
  admins: AdminUser[];
  selfId: string;
  currentUserRole?: AdminRole | undefined;
  onAdmins: (next: AdminUser[]) => void;
}

export function AdminAdmins({
  admins,
  selfId,
  currentUserRole = "super_admin",
  onAdmins,
}: AdminAdminsProps) {
  const grant = grantAdminAccess;
  const changeRole = setAdminRole;
  const destroy = deleteUserAccount;
  const toggleActive = setAdminActive;

  // Form State (Account Email & Assigned Role)
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Status & Feedback State
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal State for Confirmation Dialogs
  const [roleModalTarget, setRoleModalTarget] = useState<{
    user: AdminUser;
    targetRole: AdminRole;
  } | null>(null);

  const [deleteModalTarget, setDeleteModalTarget] = useState<AdminUser | null>(null);

  const canManageRoles = isSuperAdmin(currentUserRole);

  async function run(fn: () => Promise<Result>) {
    setBusy(true);
    setNotice(null);
    setError(null);
    try {
      const res = await fn();
      onAdmins(res.admins);
      setNotice(res.message);
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : "Action failed.";
      if (msg.includes("User not found in the primary system") || msg.includes("primary system")) {
        msg = "Account not found in primary user directory. The user must be registered in the system before being granted administrator access.";
      } else if (msg.includes("already a panel administrator") || msg.includes("already a panel admin")) {
        msg = "This account is already registered as a panel administrator.";
      }
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  // Handle Grant Administrator Access Submission
  const handleGrantAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError("Please provide a valid account email address.");
      return;
    }

    void run(async () => {
      const res = await grant({
        data: { email: cleanEmail, role },
      });
      setEmail("");
      setRole("editor");
      return res;
    });
  };

  // Confirm Role Change Execution
  const executeRoleChange = () => {
    if (!roleModalTarget) return;
    const { user: targetUser, targetRole } = roleModalTarget;
    setRoleModalTarget(null);

    void run(async () => {
      return changeRole({
        data: { targetUserId: targetUser.user_id, newRole: targetRole },
      });
    });
  };

  // Confirm Delete / Revoke Administrator Execution
  const executeDeleteAdmin = () => {
    if (!deleteModalTarget) return;
    const targetUser = deleteModalTarget;
    setDeleteModalTarget(null);

    void run(async () => {
      return destroy({ data: { targetUserId: targetUser.user_id } });
    });
  };

  // Filtered Admins computation
  const filteredAdmins = useMemo(() => {
    return (admins ?? []).filter((a) => {
      // 1. Search filter (Name, Email, Designation, Department)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const emailMatch = a.email?.toLowerCase().includes(q) ?? false;
        const nameMatch = a.full_name?.toLowerCase().includes(q) ?? false;
        const desigMatch = a.designation?.toLowerCase().includes(q) ?? false;
        const deptMatch = a.department?.toLowerCase().includes(q) ?? false;
        if (!emailMatch && !nameMatch && !desigMatch && !deptMatch) {
          return false;
        }
      }

      // 2. Role filter
      if (roleFilter !== "all" && a.role !== roleFilter) {
        return false;
      }

      // 3. Status filter
      if (statusFilter === "active" && !a.is_active) return false;
      if (statusFilter === "inactive" && a.is_active) return false;

      return true;
    });
  }, [admins, searchQuery, roleFilter, statusFilter]);

  const selectedRoleMeta = getRoleMeta(role);

  return (
    <div className={styles.wrapper}>
      {/* Top Banner / Header */}
      <div className={styles.headerBox}>
        <div>
          <h2 className={styles.pageTitle}>Admin Management &amp; RBAC</h2>
          <p className={styles.pageSubtitle}>
            Configure administrator accounts, system roles, granular permissions, and security status.
          </p>
        </div>
        <div className={styles.roleLegend}>
          {ADMIN_ROLES.map((r) => (
            <span
              key={r.id}
              className={styles.legendBadge}
              style={{ color: r.color, background: r.bg, borderColor: r.border }}
            >
              {r.shortLabel}
            </span>
          ))}
        </div>
      </div>

      {/* Global Alerts */}
      {notice && (
        <div className={styles.okAlert}>
          <CheckCircle size={18} />
          <span>{notice}</span>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={() => setNotice(null)}
            style={{ marginLeft: "auto" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className={styles.errorAlert}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={() => setError(null)}
            style={{ marginLeft: "auto" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* GRANT ADMINISTRATOR ACCESS FORM (SUPER ADMIN ONLY) */}
      {canManageRoles && (
        <div className={shared.panelCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIconBox}>
              <ShieldCheck size={20} className={styles.cardIcon} />
            </div>
            <div>
              <h3 className={shared.sectionTitle}>Grant Administrator Access</h3>
              <p className={shared.sub}>
                Elevate an existing DIMISI team member to panel administrator access.
              </p>
            </div>
          </div>

          <div className={styles.helperCallout}>
            <Info size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>
              <strong>Primary User Directory Requirement:</strong> Administrator privileges can only be granted to individuals who are already registered in the core DIMISI user database. Their credentials and security profiles are verified against the primary directory.
            </span>
          </div>

          <form onSubmit={handleGrantAdmin}>
            <div className={styles.formGrid}>
              <div className={shared.field}>
                <label className={shared.label} htmlFor="a-email">
                  ACCOUNT EMAIL *
                </label>
                <input
                  id="a-email"
                  className={shared.input}
                  type="email"
                  required
                  placeholder="teammate@dimisi.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                />
              </div>

              <div className={shared.field}>
                <label className={shared.label} htmlFor="a-role">
                  ASSIGNED ROLE * (ACCESS LEVEL)
                </label>
                <select
                  id="a-role"
                  className={styles.selectRole}
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  disabled={busy}
                >
                  {ADMIN_ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label} ({r.shortLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div className={shared.field} style={{ gridColumn: "span 2" }}>
                {/* Dynamic Role Explanation Box */}
                <div className={styles.roleExplanationBox}>
                  <div className={styles.roleBadgeBox}>
                    <span
                      className={styles.roleBadge}
                      style={{
                        color: selectedRoleMeta.color,
                        background: selectedRoleMeta.bg,
                        borderColor: selectedRoleMeta.border,
                      }}
                    >
                      {selectedRoleMeta.shortLabel}
                    </span>
                    <span className={styles.roleDescText}>{selectedRoleMeta.description}</span>
                  </div>

                  {selectedRoleMeta.capabilities && selectedRoleMeta.capabilities.length > 0 && (
                    <div className={styles.capabilitiesGrid}>
                      {selectedRoleMeta.capabilities.map((cap, i) => (
                        <div key={i} className={styles.capabilityItem}>
                          <span className={styles.capabilityBullet} />
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.createBtnRow}>
              <button type="submit" className={shared.btn} disabled={busy}>
                {busy ? "GRANTING ACCESS…" : "GRANT ADMINISTRATOR"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH & FILTERS TOOLBAR */}
      <div className={styles.toolbarCard}>
        <div className={styles.searchRow}>
          <div className={styles.searchInputWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name, email, designation, or department…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery("")}
                title="Clear Search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className={styles.filterChips}>
            <button
              type="button"
              className={[
                styles.filterChip,
                roleFilter === "all" && statusFilter === "all" ? styles.filterChipActive : "",
              ].join(" ")}
              onClick={() => {
                setRoleFilter("all");
                setStatusFilter("all");
              }}
            >
              All ({admins?.length ?? 0})
            </button>

            <button
              type="button"
              className={[
                styles.filterChip,
                statusFilter === "active" ? styles.filterChipActive : "",
              ].join(" ")}
              onClick={() => setStatusFilter(statusFilter === "active" ? "all" : "active")}
            >
              <UserCheck size={12} style={{ display: "inline", marginRight: "4px" }} />
              Active
            </button>

            <button
              type="button"
              className={[
                styles.filterChip,
                statusFilter === "inactive" ? styles.filterChipActive : "",
              ].join(" ")}
              onClick={() => setStatusFilter(statusFilter === "inactive" ? "all" : "inactive")}
            >
              <UserX size={12} style={{ display: "inline", marginRight: "4px" }} />
              Inactive
            </button>

            {ADMIN_ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                className={[
                  styles.filterChip,
                  roleFilter === r.id ? styles.filterChipActive : "",
                ].join(" ")}
                onClick={() => setRoleFilter(roleFilter === r.id ? "all" : r.id)}
              >
                {r.shortLabel}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ADMINS LIST TABLE */}
      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h3 className={styles.tableTitle}>
            <Shield size={18} />
            <span>Active Administrators ({filteredAdmins.length})</span>
          </h3>
          {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
            <span className={styles.tableSummaryText}>
              Showing {filteredAdmins.length} of {admins?.length ?? 0} administrators
            </span>
          )}
        </div>

        <div className={styles.tableWrap}>
          <table className={shared.table}>
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Designation &amp; Dept</th>
                <th>Role &amp; Permissions</th>
                <th>Status</th>
                <th>Member Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "3rem 1rem",
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                      ? "No administrators match the active filters."
                      : "No administrators found. Use the form above to grant administrator access."}
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((a) => {
                  const isSelf = a.user_id === selfId;
                  const roleMeta = getRoleMeta(a.role);
                  const designationDisplay = a.designation || "Not set";
                  const initialLetter = (a.full_name || a.email || "A").charAt(0).toUpperCase();

                  return (
                    <tr key={a.user_id}>
                      {/* Administrator Info */}
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatarInitial}>{initialLetter}</div>
                          <div className={styles.userInfoCol}>
                            <div className={styles.emailCell}>
                              <span className={styles.emailText}>{a.email ?? "—"}</span>
                              {isSelf && <span className={styles.youBadge}>You</span>}
                            </div>
                            <span className={styles.nameText}>{a.full_name ?? "Administrator"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Designation & Department */}
                      <td>
                        <div className={styles.deptCell}>
                          <span className={styles.designationText}>{designationDisplay}</span>
                          {a.department && (
                            <span className={styles.deptBadge}>{a.department}</span>
                          )}
                        </div>
                      </td>

                      {/* Role & Permissions */}
                      <td>
                        {canManageRoles && !isSelf ? (
                          <select
                            className={styles.roleCellSelect}
                            value={a.role}
                            disabled={busy}
                            style={{
                              color: roleMeta.color,
                              borderColor: roleMeta.border,
                              background: roleMeta.bg,
                            }}
                            onChange={(e) => {
                              const newRole = e.target.value as AdminRole;
                              setRoleModalTarget({ user: a, targetRole: newRole });
                            }}
                          >
                            {ADMIN_ROLES.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.shortLabel}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={styles.roleBadge}
                            style={{
                              color: roleMeta.color,
                              background: roleMeta.bg,
                              borderColor: roleMeta.border,
                            }}
                          >
                            {roleMeta.shortLabel}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={[
                            styles.pill,
                            a.is_active ? styles.on : styles.off,
                          ].join(" ")}
                        >
                          <span className={styles.statusDot} />
                          {a.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Member Since */}
                      <td>
                        <span className={styles.dateText}>
                          {a.created_at ? new Date(a.created_at).toLocaleDateString() : "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        {isSelf ? (
                          <span className={styles.selfDisabledText}>Current Session</span>
                        ) : (
                          <div className={styles.rowActions}>
                            {canManageRoles && (
                              <button
                                type="button"
                                className={[shared.btn, shared.ghost, styles.actionBtn].join(" ")}
                                disabled={busy}
                                onClick={() =>
                                  void run(() =>
                                    toggleActive({
                                      data: { targetUserId: a.user_id, active: !a.is_active },
                                    }),
                                  )
                                }
                              >
                                {a.is_active ? "Deactivate" : "Activate"}
                              </button>
                            )}
                            {canManageRoles && (
                              <button
                                type="button"
                                className={[
                                  shared.btn,
                                  shared.ghost,
                                  shared.danger,
                                  styles.actionBtn,
                                ].join(" ")}
                                disabled={busy}
                                onClick={() => setDeleteModalTarget(a)}
                                title="Revoke Administrator Access"
                              >
                                <Trash2 size={13} />
                                <span>Revoke</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROLE CHANGE CONFIRMATION MODAL */}
      {roleModalTarget && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIconWarning}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className={styles.modalTitle}>Change Administrator Role?</h4>
                <p className={styles.modalSub}>
                  You are modifying system permissions for:{" "}
                  <strong>{roleModalTarget.user.email}</strong>
                </p>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setRoleModalTarget(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.roleTransitionRow}>
                <div>
                  <span className={styles.transitionLabel}>Current Role</span>
                  <span
                    className={styles.roleBadge}
                    style={{
                      color: getRoleMeta(roleModalTarget.user.role).color,
                      background: getRoleMeta(roleModalTarget.user.role).bg,
                      borderColor: getRoleMeta(roleModalTarget.user.role).border,
                    }}
                  >
                    {getRoleMeta(roleModalTarget.user.role).shortLabel}
                  </span>
                </div>

                <span className={styles.transitionArrow}>➔</span>

                <div>
                  <span className={styles.transitionLabel}>New Assigned Role</span>
                  <span
                    className={styles.roleBadge}
                    style={{
                      color: getRoleMeta(roleModalTarget.targetRole).color,
                      background: getRoleMeta(roleModalTarget.targetRole).bg,
                      borderColor: getRoleMeta(roleModalTarget.targetRole).border,
                    }}
                  >
                    {getRoleMeta(roleModalTarget.targetRole).shortLabel}
                  </span>
                </div>
              </div>

              <p className={styles.warningNote}>
                {roleModalTarget.targetRole === "super_admin"
                  ? "Granting Super Admin will give this user unrestricted control over all system settings, roles, and administrator accounts."
                  : "Changing this role will immediately adjust this administrator's accessible tabs, mutation capabilities, and invalidate their active session cache."}
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelModalBtn}
                onClick={() => setRoleModalTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmModalBtn}
                onClick={executeRoleChange}
              >
                Confirm Role Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVOKE ADMINISTRATOR ACCESS CONFIRMATION MODAL */}
      {deleteModalTarget && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIconDanger}>
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className={styles.modalTitle}>Revoke Administrator Access?</h4>
                <p className={styles.modalSub}>
                  Remove administrative privileges for <strong>{deleteModalTarget.email}</strong>.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setDeleteModalTarget(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.deleteWarningText}>
                Revoking access will delete this administrator&apos;s panel access record. Their base account in the primary user directory remains intact, but they will no longer be able to log in to the Control Room.
              </p>
              <div className={styles.deleteUserSummary}>
                <div>
                  <strong>Role:</strong> {getRoleMeta(deleteModalTarget.role).label}
                </div>
                <div>
                  <strong>Designation:</strong> {deleteModalTarget.designation || "Not set"}
                </div>
                {deleteModalTarget.department && (
                  <div>
                    <strong>Department:</strong> {deleteModalTarget.department}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelModalBtn}
                onClick={() => setDeleteModalTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmDeleteBtn}
                onClick={executeDeleteAdmin}
              >
                Confirm Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
