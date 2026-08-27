import { useTransition } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ShieldAlert,
  CheckCircle,
  Archive,
  Trash2,
  Mail,
  Loader2,
  Clock,
} from "lucide-react";
import type { ReviewReport } from "@/lib/reviews.shared";
import { resolveReport } from "@/lib/reviews.functions";
import styles from "./AdminReports.module.css";

export function AdminReports({
  reports,
  onRefresh,
}: {
  reports: ReviewReport[];
  onRefresh: () => void;
}) {
  const resolve = useServerFn(resolveReport);
  const [isPending, startTransition] = useTransition();

  const openReports = reports.filter((r) => r.status === "open");
  const resolvedReports = reports.filter((r) => r.status === "resolved");

  const handleAction = (reportId: string, action: "keep" | "archive" | "delete") => {
    startTransition(async () => {
      try {
        await resolve({
          data: {
            reportId,
            action,
            moderationNotes: `Admin action: ${action}`,
          },
        });
        onRefresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error resolving report.");
      }
    });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <div className={styles.titleBox}>
          <h2>Review Moderation Queue (Reported Reviews)</h2>
          <p>
            Visitor reports require admin review before any content removal to prevent abusive removals.
          </p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Reason & Reporter</th>
                <th>Reported Review Content</th>
                <th>Reported When</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Moderation Resolution</th>
              </tr>
            </thead>
            <tbody>
              {openReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    <CheckCircle size={32} color="#10b981" style={{ margin: "0 auto 0.5rem" }} />
                    <div>All clean! No open moderation reports.</div>
                  </td>
                </tr>
              ) : (
                openReports.map((rep) => (
                  <tr key={rep.id}>
                    <td>
                      <div>
                        <span className={styles.reasonBadge}>
                          <ShieldAlert size={12} />
                          {rep.reason}
                        </span>
                        <div style={{ fontSize: "0.8rem", color: "#ffffff", marginTop: "0.35rem" }}>
                          {rep.reporter_name || "Anonymous Visitor"}
                        </div>
                        {rep.reporter_email ? (
                          <a
                            href={`mailto:${rep.reporter_email}`}
                            style={{ fontSize: "0.74rem", color: "#818cf8", display: "inline-flex", alignItems: "center", gap: "3px" }}
                          >
                            <Mail size={11} />
                            {rep.reporter_email}
                          </a>
                        ) : null}
                        {rep.message ? (
                          <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: "0.3rem 0 0", fontStyle: "italic" }}>
                            "{rep.message}"
                          </p>
                        ) : null}
                      </div>
                    </td>

                    <td>
                      <div style={{ maxWidth: "340px" }}>
                        {rep.review ? (
                          <>
                            <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#ffffff" }}>
                              By {rep.review.customer_name} ({rep.review.rating}★)
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "#cbd5e1", marginTop: "0.2rem" }}>
                              "{rep.review.review_text}"
                            </div>
                          </>
                        ) : (
                          <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Review details unavailable</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.78rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={12} />
                        {new Date(rep.created_at).toLocaleString()}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.76rem", color: "#fbbf24", fontWeight: 600 }}>
                        ● Pending Review
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className={[styles.btnAction, styles.btnKeep].join(" ")}
                          onClick={() => handleAction(rep.id, "keep")}
                          disabled={isPending}
                          title="Review is safe — Dismiss report"
                        >
                          <CheckCircle size={13} />
                          <span>Keep Review</span>
                        </button>
                        <button
                          type="button"
                          className={[styles.btnAction, styles.btnArchive].join(" ")}
                          onClick={() => handleAction(rep.id, "archive")}
                          disabled={isPending}
                          title="Hide from public site"
                        >
                          <Archive size={13} />
                          <span>Archive</span>
                        </button>
                        <button
                          type="button"
                          className={[styles.btnAction, styles.btnDelete].join(" ")}
                          onClick={() => handleAction(rep.id, "delete")}
                          disabled={isPending}
                          title="Permanently remove"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolved reports history */}
      {resolvedReports.length > 0 ? (
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", color: "#94a3b8", marginBottom: "0.75rem" }}>
            Resolved Reports ({resolvedReports.length})
          </h3>
          <div className={styles.tableCard}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Reason</th>
                    <th>Reporter</th>
                    <th>Reported At</th>
                    <th>Resolved At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedReports.map((rep) => (
                    <tr key={rep.id}>
                      <td>{rep.reason}</td>
                      <td>{rep.reporter_name || "Anonymous"}</td>
                      <td>{new Date(rep.created_at).toLocaleDateString()}</td>
                      <td>{rep.resolved_at ? new Date(rep.resolved_at).toLocaleString() : "—"}</td>
                      <td style={{ color: "#34d399", fontWeight: 600 }}>✓ Resolved</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
