import { useState, useTransition, useEffect } from "react";
import {
  Bell,
  Save,
  Check,
  Loader2,
  Mail,
  Users,
  Star,
  Flag,
  Shield,
  Calendar,
  ScrollText,
  BarChart3,
  ExternalLink,
  Send,
  Sparkles,
} from "lucide-react";
import type { ReviewSettings } from "@/lib/reviews.shared";
import { updateReviewSettings } from "@/lib/reviews.functions";
import {
  getNotificationSettings,
  saveNotificationSettings,
  triggerTestNotification,
  type NotificationCategory,
  type NotificationSettings,
} from "@/services";
import styles from "./AdminSettings.module.css";

export function AdminSettings({
  settings: legacySettings,
  onRefresh,
}: {
  settings?: ReviewSettings;
  onRefresh: () => void;
}) {
  const [initSettings, setInitSettings] = useState<NotificationSettings>(() =>
    getNotificationSettings(),
  );

  // 7 Core Administrative Triggers
  const [notifyNewLead, setNotifyNewLead] = useState(
    initSettings.notify_new_lead ?? true,
  );
  const [notifyOnSubmit, setNotifyOnSubmit] = useState(
    initSettings.notify_on_submit ?? legacySettings?.notify_on_submit ?? true,
  );
  const [notifyOnReport, setNotifyOnReport] = useState(
    initSettings.notify_on_report ?? legacySettings?.notify_on_report ?? true,
  );
  const [notifyVisitorReport, setNotifyVisitorReport] = useState(
    initSettings.notify_visitor_report ?? true,
  );
  const [notifyEventsGallery, setNotifyEventsGallery] = useState(
    initSettings.notify_events_gallery ?? true,
  );
  const [notifyAdminLogs, setNotifyAdminLogs] = useState(
    initSettings.notify_admin_logs ?? true,
  );
  const [notifyCampaignSummary, setNotifyCampaignSummary] = useState(
    initSettings.notify_campaign_summary ??
      legacySettings?.notify_campaign_summary ??
      true,
  );

  // Customer Options (Review publish/rejection)
  const [notifyOnApprove, setNotifyOnApprove] = useState(
    initSettings.notify_on_approve ?? legacySettings?.notify_on_approve ?? true,
  );
  const [notifyOnReject, setNotifyOnReject] = useState(
    initSettings.notify_on_reject ?? legacySettings?.notify_on_reject ?? false,
  );

  // Dual Email Inboxes
  const [companyEmail] = useState("dimisitechnologiespvtltd@gmail.com");
  const [adminEmail, setAdminEmail] = useState(
    initSettings.admin_email || legacySettings?.notify_email || "",
  );

  // Delivery Channels
  const [channelInApp, setChannelInApp] = useState(
    initSettings.channel_in_app ?? true,
  );
  const [channelEmail, setChannelEmail] = useState(
    initSettings.channel_email ?? true,
  );

  // Status & Feedback
  const [message, setMessage] = useState<string | null>(null);
  const [testToast, setTestToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fresh = getNotificationSettings();
    setInitSettings(fresh);
    if (fresh.admin_email && !adminEmail) {
      setAdminEmail(fresh.admin_email);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await saveNotificationSettings({
          notify_new_lead: notifyNewLead,
          notify_on_submit: notifyOnSubmit,
          notify_on_report: notifyOnReport,
          notify_visitor_report: notifyVisitorReport,
          notify_events_gallery: notifyEventsGallery,
          notify_admin_logs: notifyAdminLogs,
          notify_campaign_summary: notifyCampaignSummary,
          notify_on_approve: notifyOnApprove,
          notify_on_reject: notifyOnReject,
          channel_in_app: channelInApp,
          channel_email: channelEmail,
          company_email: companyEmail,
          admin_email: adminEmail,
        });

        // Also sync legacy review settings for backward compatibility
        await updateReviewSettings({
          data: {
            notify_on_submit: notifyOnSubmit,
            notify_on_approve: notifyOnApprove,
            notify_on_reject: notifyOnReject,
            notify_on_report: notifyOnReport,
            notify_campaign_summary: notifyCampaignSummary,
            notify_email: adminEmail,
          },
        });

        setMessage("Notification triggers & recipient inboxes saved successfully.");
        onRefresh();
        setTimeout(() => setMessage(null), 4000);
      } catch (err) {
        alert(
          err instanceof Error
            ? err.message
            : "Error saving notification settings.",
        );
      }
    });
  };

  const handleTestAlert = (category: NotificationCategory) => {
    const res = triggerTestNotification(category);
    setTestToast(
      `🔔 Test alert created in topbar bell! Dispatched to: ${res.dispatchedEmails.join(", ")}`,
    );
    setTimeout(() => setTestToast(null), 5000);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.titleBox}>
        <h2>Notifications & Alert Control Center</h2>
        <p>
          Configure automated Topbar Bell alerts, dual email dispatches, and
          trigger policies across the administrative command center.
        </p>
      </div>

      <form onSubmit={handleSave} className={styles.card}>
        {/* SECTION 1: 7 Core Admin Triggers */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <Bell size={20} color="#ff7a18" />
            Administrative Triggers & Deep-Link Alerts
          </h3>
          <p className={styles.sectionDesc}>
            Control which operational events trigger notifications in the Topbar Bell and dispatch emails to company inboxes.
          </p>
        </div>

        <div className={styles.toggleList}>
          {/* 1. New Lead Inquiries */}
          <label className={styles.toggleItem}>
            <div className={styles.toggleLeft}>
              <div
                className={styles.triggerIconWrap}
                style={{ background: "rgba(59, 130, 246, 0.16)", color: "#60a5fa" }}
              >
                <Users size={18} />
              </div>
              <div className={styles.toggleLabel}>
                <div className={styles.triggerTitleRow}>
                  <span className={styles.toggleTitle}>New Lead Inquiries</span>
                  <span className={styles.targetBadge}>
                    <ExternalLink size={11} />
                    <span>/dimisi-admin/leads</span>
                  </span>
                </div>
                <p className={styles.toggleDesc}>
                  Receive an instant alert whenever a prospective client submits an inquiry or project request via /contact.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              className={styles.switch}
              checked={notifyNewLead}
              onChange={(e) => setNotifyNewLead(e.target.checked)}
            />
          </label>

          {/* 2. New Review Submission */}
          <label className={styles.toggleItem}>
            <div className={styles.toggleLeft}>
              <div
                className={styles.triggerIconWrap}
                style={{ background: "rgba(245, 158, 11, 0.16)", color: "#fbbf24" }}
              >
                <Star size={18} />
              </div>
              <div className={styles.toggleLabel}>
                <div className={styles.triggerTitleRow}>
                  <span className={styles.toggleTitle}>
                    Notify Admin on New Review Submission
                  </span>
                  <span className={styles.targetBadge}>
                    <ExternalLink size={11} />
                    <span>/dimisi-admin/reviews</span>
                  </span>
                </div>
                <p className={styles.toggleDesc}>
                  Receive an instant alert whenever a customer completes a public or campaign review form.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              className={styles.switch}
              checked={notifyOnSubmit}
              onChange={(e) => setNotifyOnSubmit(e.target.checked)}
            />
          </label>

          {/* 3. Reported Reviews Alert */}
          <label className={styles.toggleItem}>
            <div className={styles.toggleLeft}>
              <div
                className={styles.triggerIconWrap}
                style={{ background: "rgba(239, 68, 68, 0.16)", color: "#f87171" }}
              >
                <Flag size={18} />
              </div>
              <div className={styles.toggleLabel}>
                <div className={styles.triggerTitleRow}>
                  <span className={styles.toggleTitle}>
                    Reported Reviews & Moderation Queue
                  </span>
                  <span className={styles.targetBadge}>
                    <ExternalLink size={11} />
                    <span>/dimisi-admin/reports</span>
                  </span>
                </div>
                <p className={styles.toggleDesc}>
                  Immediate high-priority alert when a visitor flags a published review as offensive, misleading, or spam.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              className={styles.switch}
              checked={notifyOnReport}
              onChange={(e) => setNotifyOnReport(e.target.checked)}
            />
          </label>

          {/* 4. Visitor Security Reports */}
          <label className={styles.toggleItem}>
            <div className={styles.toggleLeft}>
              <div
                className={styles.triggerIconWrap}
                style={{ background: "rgba(6, 182, 212, 0.16)", color: "#22d3ee" }}
              >
                <Shield size={18} />
              </div>
              <div className={styles.toggleLabel}>
                <div className={styles.triggerTitleRow}>
                  <span className={styles.toggleTitle}>
                    Notify Admin on Visitor Report
                  </span>
                  <span className={styles.targetBadge}>
                    <ExternalLink size={11} />
                    <span>/dimisi-admin/reports</span>
                  </span>
                </div>
                <p className={styles.toggleDesc}>
                  Security alert when suspicious visitor behavior, high-frequency anomalies, or abuse reports are triggered.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              className={styles.switch}
              checked={notifyVisitorReport}
              onChange={(e) => setNotifyVisitorReport(e.target.checked)}
            />
          </label>

          {/* 5. Events & Gallery Updates */}
          <label className={styles.toggleItem}>
            <div className={styles.toggleLeft}>
              <div
                className={styles.triggerIconWrap}
                style={{ background: "rgba(168, 85, 247, 0.16)", color: "#c084fc" }}
              >
                <Calendar size={18} />
              </div>
              <div className={styles.toggleLabel}>
                <div className={styles.triggerTitleRow}>
                  <span className={styles.toggleTitle}>
                    Events & Gallery Notification
                  </span>
                  <span className={styles.targetBadge}>
                    <ExternalLink size={11} />
                    <span>/dimisi-admin/events</span>
                  </span>
                </div>
                <p className={styles.toggleDesc}>
                  Alert on new event RSVPs, summit registrations, and new gallery media additions.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              className={styles.switch}
              checked={notifyEventsGallery}
              onChange={(e) => setNotifyEventsGallery(e.target.checked)}
            />
          </label>

          {/* 6. Critical Admin Logs */}
          <label className={styles.toggleItem}>
            <div className={styles.toggleLeft}>
              <div
                className={styles.triggerIconWrap}
                style={{ background: "rgba(16, 185, 129, 0.16)", color: "#34d399" }}
              >
                <ScrollText size={18} />
              </div>
              <div className={styles.toggleLabel}>
                <div className={styles.triggerTitleRow}>
                  <span className={styles.toggleTitle}>
                    Notification for New Admin Log
                  </span>
                  <span className={styles.targetBadge}>
                    <ExternalLink size={11} />
                    <span>/dimisi-admin/logs</span>
                  </span>
                </div>
                <p className={styles.toggleDesc}>
                  Real-time audit alert on significant administrative operations (role grant/revoke, content deletion, system settings change).
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              className={styles.switch}
              checked={notifyAdminLogs}
              onChange={(e) => setNotifyAdminLogs(e.target.checked)}
            />
          </label>

          {/* 7. Weekly Campaign Performance Summary */}
          <label className={styles.toggleItem}>
            <div className={styles.toggleLeft}>
              <div
                className={styles.triggerIconWrap}
                style={{ background: "rgba(99, 102, 241, 0.16)", color: "#818cf8" }}
              >
                <BarChart3 size={18} />
              </div>
              <div className={styles.toggleLabel}>
                <div className={styles.triggerTitleRow}>
                  <span className={styles.toggleTitle}>
                    Weekly Campaign Performance Summary
                  </span>
                  <span className={styles.targetBadge}>
                    <ExternalLink size={11} />
                    <span>/dimisi-admin/campaigns</span>
                  </span>
                </div>
                <p className={styles.toggleDesc}>
                  Receive a weekly analytical digest of QR scans, web link visits, and review conversion rates.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              className={styles.switch}
              checked={notifyCampaignSummary}
              onChange={(e) => setNotifyCampaignSummary(e.target.checked)}
            />
          </label>
        </div>

        {/* SECTION 2: Customer Email Notification Options */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <Mail size={18} color="#818cf8" />
            Customer Direct Email Triggers
          </h3>
          <p className={styles.sectionDesc}>
            Automated confirmation and rejection feedback emails dispatched directly to reviewing customers.
          </p>
        </div>

        <div className={styles.toggleList}>
          <label className={styles.toggleItem}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>
                Notify Customer when Review is Approved
              </span>
              <p className={styles.toggleDesc}>
                Send a confirmation email to the customer with a link to their live review on the website.
              </p>
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
              <span className={styles.toggleTitle}>
                Notify Customer if Review is Rejected
              </span>
              <p className={styles.toggleDesc}>
                Send a polite email explaining why the review did not meet publishing criteria.
              </p>
            </div>
            <input
              type="checkbox"
              className={styles.switch}
              checked={notifyOnReject}
              onChange={(e) => setNotifyOnReject(e.target.checked)}
            />
          </label>
        </div>

        {/* SECTION 3: Dual Recipient Inboxes */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <Mail size={18} color="#34d399" />
            Dual Recipient Email Inboxes
          </h3>
          <p className={styles.sectionDesc}>
            All active notification triggers dispatch parallel email copies to both corporate and administrator inboxes.
          </p>
        </div>

        <div className={styles.emailGrid}>
          {/* Company Gmail */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label}>
                <Mail size={13} />
                <span>Company Corporate Gmail</span>
              </label>
              <span className={styles.corporatePill}>
                <Check size={11} /> Primary Verified
              </span>
            </div>
            <input
              type="email"
              className={`${styles.input} ${styles.inputReadOnly}`}
              value={companyEmail}
              readOnly
            />
            <p className={styles.subText}>
              Permanent centralized corporate inbox for lead ingestion & alerts.
            </p>
          </div>

          {/* Administrator Gmail */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label}>
                <Mail size={13} />
                <span>Administrator Recipient Gmail</span>
              </label>
            </div>
            <input
              type="email"
              className={styles.input}
              placeholder="e.g. admin@dimisi.in"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
            <p className={styles.subText}>
              Secondary administrator inbox receiving simultaneous copies.
            </p>
          </div>
        </div>

        {/* SECTION 4: Live Test Notification Simulation */}
        <div className={styles.testCard}>
          <div className={styles.testHeader}>
            <span className={styles.testTitle}>
              <Sparkles size={15} />
              <span>Interactive Test Simulation</span>
            </span>
            <span className={styles.subText}>Click to test topbar & email dispatch</span>
          </div>

          <div className={styles.testBtnsGrid}>
            <button
              type="button"
              className={styles.testBtn}
              onClick={() => handleTestAlert("lead")}
            >
              <Users size={13} color="#60a5fa" />
              <span>Test Lead Alert</span>
            </button>
            <button
              type="button"
              className={styles.testBtn}
              onClick={() => handleTestAlert("review")}
            >
              <Star size={13} color="#fbbf24" />
              <span>Test Review Alert</span>
            </button>
            <button
              type="button"
              className={styles.testBtn}
              onClick={() => handleTestAlert("report")}
            >
              <Flag size={13} color="#f87171" />
              <span>Test Moderation Alert</span>
            </button>
            <button
              type="button"
              className={styles.testBtn}
              onClick={() => handleTestAlert("event")}
            >
              <Calendar size={13} color="#c084fc" />
              <span>Test Event Alert</span>
            </button>
            <button
              type="button"
              className={styles.testBtn}
              onClick={() => handleTestAlert("log")}
            >
              <ScrollText size={13} color="#34d399" />
              <span>Test Admin Log Alert</span>
            </button>
            <button
              type="button"
              className={styles.testBtn}
              onClick={() => handleTestAlert("campaign")}
            >
              <BarChart3 size={13} color="#818cf8" />
              <span>Test Campaign Digest</span>
            </button>
          </div>

          {testToast && (
            <div className={styles.testToast}>
              <span>{testToast}</span>
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#38bdf8",
                  cursor: "pointer",
                }}
                onClick={() => setTestToast(null)}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* SECTION 5: Save Actions */}
        <div className={styles.actionsBar}>
          <button type="submit" className={styles.btnSave} disabled={isPending}>
            {isPending ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            <span>{isPending ? "Saving Settings…" : "Save Preferences"}</span>
          </button>

          {message && (
            <div className={styles.feedback}>
              <Check size={16} />
              <span>{message}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
