import { useState, useTransition } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  X,
  Users,
  Shield,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import {
  createAdminAccount,
  setAdminRole,
  setAdminActive,
  setAdminDesignation,
  deleteUserAccount,
  type AdminUser,
} from "../../server/admin.functions";
import {
  type AdminRole,
  ADMIN_ROLES,
  getRoleMeta,
  isSuperAdmin,
} from "../../lib/rbac.shared";
import { DESIGNATIONS } from "../AdminProfile/AdminProfile";
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
  const create = useServerFn(createAdminAccount);
  const changeRole = useServerFn(setAdminRole);
  const destroy = useServerFn(deleteUserAccount);
  const toggleActive = useServerFn(setAdminActive);
  const saveDesignation = useServerFn(setAdminDesignation);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback State
  const [busy, setBusy] = useState(false);
  const [isPending, startTransition] = useTransition();
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
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  // Handle Create Admin Submission
  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    void run(async () => {
      const res = await create({
        data: { email, password, fullName, designation, role },
      });
      setEmail("");
      setPassword("");
      setFullName("");
      setDesignation("");
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
        data: { userId: targetUser.user_id, role: targetRole },
      });
    });
  };

  // Confirm Delete Administrator Execution
  const executeDeleteAdmin = () => {
    if (!deleteModalTarget) return;
    const targetUser = deleteModalTarget;
    setDeleteModalTarget(null);

    void run(async () => {
      return destroy({ data: { userId: targetUser.user_id } });
    });
  };

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
          <CheckCircle size={16} />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className={styles.errorAlert}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* CREATE ADMIN FORM */}
      <div className={shared.panelCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIconBox}>
            <UserPlus size={18} className={styles.cardIcon} />
          </div>
          <div>
            <h3 className={shared.sectionTitle}>Create an Administrator</h3>
            <p className={shared.sub}>
              Provision a new administrative account with designated organizational title and authoritative system role.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateAdmin}>
          <div className={styles.formGrid}>
            <div className={shared.field}>
              <label className={shared.label} htmlFor="a-name">
                Full Name
              </label>
              <input
                id="a-name"
                className={shared.input}
                type="text"
                placeholder="e.g. Swatantra Soni"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className={shared.field}>
              <label className={shared.label} htmlFor="a-email">
                Account Email *
              </label>
              <input
                id="a-email"
                className={shared.input}
                type="email"
                required
                placeholder="teammate@dimisi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={shared.field}>
              <label className={shared.label} htmlFor="a-pass">
                Password * (min 8 characters)
              </label>
              <div className={styles.passwordInputWrap}>
                <input
                  id="a-pass"
                  className={shared.input}
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.passToggleBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className={shared.field}>
              <label className={shared.label} htmlFor="a-desig">
                Designation (Organizational Title)
              </label>
              <select
                id="a-desig"
                className={styles.select}
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              >
                <option value="">Select designation…</option>
                {DESIGNATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className={shared.field} style={{ gridColumn: "span 2" }}>
              <label className={shared.label} htmlFor="a-role">
                Assigned Role * (Access Level)
              </label>
              <select
                id="a-role"
                className={styles.selectRole}
                value={role}
                onChange={(e) => setRole(e.target.value as AdminRole)}
              >
                {ADMIN_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label} — {r.description}
                  </option>
                ))}
              </select>

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
              </div>
            </div>
          </div>

          <div className={styles.createBtnRow}>
            <button type="submit" className={shared.btn} disabled={busy || isPending}>
              {busy ? "Provisioning…" : "Create Administrator"}
            </button>
          </div>
        </form>
      </div>

      {/* ADMINS LIST TABLE */}
      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h3 className={styles.tableTitle}>
            <Shield size={16} />
            <span>Active Administrators ({admins.length})</span>
          </h3>
        </div>

        <div className={shared.tableWrap}>
          <table className={shared.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Status</th>
                <th>Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => {
                const isSelf = a.user_id === selfId;
                const roleMeta = getRoleMeta(a.role);

                return (
                  <tr key={a.user_id}>
                    <td>
                      <div className={styles.emailCell}>
                        <span className={styles.emailText}>{a.email ?? "—"}</span>
                        {isSelf && <span className={styles.youBadge}>You</span>}
                      </div>
                    </td>
                    <td>
                      <span className={styles.nameText}>{a.full_name ?? "—"}</span>
                    </td>
                    <td>
                      <select
                        className={styles.cellSelect}
                        value={a.designation ?? ""}
                        disabled={busy || !canManageRoles}
                        onChange={(e) =>
                          void run(() =>
                            saveDesignation({
                              data: { userId: a.user_id, designation: e.target.value },
                            }),
                          )
                        }
                      >
                        <option value="">Not set</option>
                        {DESIGNATIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </td>
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
                    <td>
                      <span
                        className={[
                          styles.pill,
                          a.is_active ? styles.on : styles.off,
                        ].join(" ")}
                      >
                        {a.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <span className={styles.dateText}>
                        {new Date(a.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      {isSelf ? (
                        <span className={styles.selfDisabledText}>Current Session</span>
                      ) : (
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={[shared.btn, shared.ghost, styles.actionBtn].join(" ")}
                            disabled={busy}
                            onClick={() =>
                              void run(() =>
                                toggleActive({
                                  data: { userId: a.user_id, active: !a.is_active },
                                }),
                              )
                            }
                          >
                            {a.is_active ? "Deactivate" : "Activate"}
                          </button>
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
                            title="Delete Administrator"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
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
                  You are about to modify system permissions for:{" "}
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
                  : "Changing this role will immediately adjust this administrator's accessible tabs and mutation capabilities."}
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

      {/* DELETE ADMINISTRATOR CONFIRMATION MODAL */}
      {deleteModalTarget && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIconDanger}>
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className={styles.modalTitle}>Delete Administrator Account?</h4>
                <p className={styles.modalSub}>
                  Permanently remove <strong>{deleteModalTarget.email}</strong> from DIMISI Admin.
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
                This action is <strong>irreversible</strong>. The user will be permanently removed
                from the system, profiles, and administrative access records.
              </p>
              <div className={styles.deleteUserSummary}>
                <div>
                  <strong>Role:</strong> {getRoleMeta(deleteModalTarget.role).label}
                </div>
                <div>
                  <strong>Designation:</strong> {deleteModalTarget.designation || "Not set"}
                </div>
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
                Delete Administrator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
