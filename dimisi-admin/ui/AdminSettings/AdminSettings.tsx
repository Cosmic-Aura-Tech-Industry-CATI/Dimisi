import { useState, useTransition } from "react";
import { Bell, Save, Check, Loader2, Mail } from "lucide-react";
import type { ReviewSettings } from "@/lib/reviews.shared";
import { updateReviewSettings } from "@/lib/reviews.functions";
import styles from "./AdminSettings.module.css";

export function AdminSettings({
  settings,
  onRefresh,
}: {
  settings: ReviewSettings;
  onRefresh: () => void;
}) {
  const saveSettings = updateReviewSettings;

  const [notifyOnSubmit, setNotifyOnSubmit] = useState(settings.notify_on_submit);
  const [notifyOnApprove, setNotifyOnApprove] = useState(settings.notify_on_approve);
  const [notifyOnReject, setNotifyOnReject] = useState(settings.notify_on_reject);
  const [notifyOnReport, setNotifyOnReport] = useState(settings.notify_on_report);
  const [notifySummary, setNotifySummary] = useState(settings.notify_campaign_summary);
  const [email, setEmail] = useState(settings.notify_email || "");

  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await saveSettings({
          data: {
            notifyOnSubmit,
            notifyOnApprove,
            notifyOnReject,
            notifyOnReport,
            notifyCampaignSummary: notifySummary,
            notifyEmail: email,
          },
        });
        setMessage(res.message);
        onRefresh();
        setTimeout(() => setMessage(null), 3000);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error saving notification settings.");
      }
    });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.titleBox}>
        <h2>Review Notification Preferences</h2>
        <p>
          Configure automated email notifications for new submissions, published approvals, moderation reports, and weekly summaries.
        </p>
      </div>

      <form onSubmit={handleSave} className={styles.card}>
        <h3 className={styles.sectionTitle}>
          <Bell size={18} color="#818cf8" style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
          Admin & Customer Notification Triggers
        </h3>

        <div className={styles.toggleList}>
          <label className={styles.toggleItem}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>Notify Admin on New Review Submission</span>
              <span className={styles.toggleDesc}>
                Receive an instant alert whenever a customer completes a review form.
              </span>
            </div>
            <input
              type="checkbox"
              className={styles.switch}
              checked={notifyOnSubmit}
              onChange={(e) => setNotifyOnSubmit(e.target.checked)}
            />
          </label>

          <label className={styles.toggleItem}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>Notify Customer when Review is Approved</span>
              <span className={styles.toggleDesc}>
                Send a confirmation email to the customer with a link to their live review on the website.
              </span>
            </div>
            <input
              type="checkbox"
              className={styles.switch}
              checked={notifyOnApprove}
              onChange={(e) => setNotifyOnApprove(e.target.checked)}
            />
          </label>

          <label className={styles.toggleItem}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>Notify Customer if Review is Rejected</span>
              <span className={styles.toggleDesc}>
                Send a polite email explaining why the review did not meet publishing criteria.
              </span>
            </div>
            <input
              type="checkbox"
              className={styles.switch}
              checked={notifyOnReject}
              onChange={(e) => setNotifyOnReject(e.target.checked)}
            />
          </label>

          <label className={styles.toggleItem}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>Notify Admin on Visitor Report</span>
              <span className={styles.toggleDesc}>
                Immediate alert when a visitor flags a published review as offensive, misleading, or spam.
              </span>
            </div>
            <input
              type="checkbox"
              className={styles.switch}
              checked={notifyOnReport}
              onChange={(e) => setNotifyOnReport(e.target.checked)}
            />
          </label>

          <label className={styles.toggleItem}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>Weekly Campaign Performance Summary</span>
              <span className={styles.toggleDesc}>
                Receive a weekly digest of QR scans, web link visits, and review conversion rates.
              </span>
            </div>
            <input
              type="checkbox"
              className={styles.switch}
              checked={notifySummary}
              onChange={(e) => setNotifySummary(e.target.checked)}
            />
          </label>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            <Mail size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            <span>Admin Recipient Email Address</span>
          </label>
          <input
            type="email"
            className={styles.input}
            placeholder="e.g. hello@dimisi.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
            All administrative review alerts and moderation reports will be dispatched here.
          </span>
        </div>

        {message ? <div className={styles.feedback}>{message}</div> : null}

        <button type="submit" className={styles.btnSave} disabled={isPending}>
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Save size={16} />
              <span>Save Notification Preferences</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
