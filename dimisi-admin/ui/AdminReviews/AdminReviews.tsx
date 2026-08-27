import { useState, useTransition } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Star,
  CheckCircle,
  XCircle,
  Archive,
  RotateCcw,
  Trash2,
  Edit3,
  Eye,
  Search,
  Flame,
  X,
  Send,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldAlert,
} from "lucide-react";
import {
  DIMISI_SERVICES,
  type AdminReview,
  type ReviewStatus,
} from "@/lib/reviews.shared";
import {
  updateReviewStatus,
  updateReviewContent,
  toggleReviewFeatured,
  deleteReview,
} from "@/lib/reviews.functions";
import styles from "./AdminReviews.module.css";

export function AdminReviews({
  reviews,
  onRefresh,
}: {
  reviews: AdminReview[];
  onRefresh: () => void;
}) {
  const changeStatus = useServerFn(updateReviewStatus);
  const editContent = useServerFn(updateReviewContent);
  const setFeatured = useServerFn(toggleReviewFeatured);
  const removeReview = useServerFn(deleteReview);

  const [statusTab, setStatusTab] = useState<"all" | ReviewStatus>("all");
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // Modals
  const [viewingReview, setViewingReview] = useState<AdminReview | null>(null);
  const [rejectingReview, setRejectingReview] = useState<AdminReview | null>(null);
  const [rejectReason, setRejectReason] = useState("Does not meet Dimisi review standards or authenticity criteria.");
  const [notifyCustomerOnReject, setNotifyCustomerOnReject] = useState(true);

  const [editingReview, setEditingReview] = useState<AdminReview | null>(null);
  const [editText, setEditText] = useState("");
  const [editName, setEditName] = useState("");
  const [editService, setEditService] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editRating, setEditRating] = useState(5);

  const [deletingReview, setDeletingReview] = useState<AdminReview | null>(null);

  const [isPending, startTransition] = useTransition();

  // Filtered rows
  const filtered = reviews.filter((r) => {
    if (statusTab !== "all" && r.status !== statusTab) return false;
    if (ratingFilter > 0 && Math.round(r.rating) !== ratingFilter) return false;
    if (serviceFilter && r.service_name !== serviceFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        r.customer_name.toLowerCase().includes(q) ||
        r.review_text.toLowerCase().includes(q) ||
        (r.customer_email && r.customer_email.toLowerCase().includes(q)) ||
        (r.customer_location && r.customer_location.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;
  const rejectedCount = reviews.filter((r) => r.status === "rejected").length;
  const archivedCount = reviews.filter((r) => r.status === "archived").length;

  const handleApprove = (rev: AdminReview) => {
    startTransition(async () => {
      try {
        await changeStatus({ data: { reviewId: rev.id, status: "approved" } });
        onRefresh();
        if (viewingReview?.id === rev.id) setViewingReview(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error approving review.");
      }
    });
  };

  const handleRejectConfirm = () => {
    if (!rejectingReview) return;
    startTransition(async () => {
      try {
        await changeStatus({
          data: {
            reviewId: rejectingReview.id,
            status: "rejected",
            moderationReason: rejectReason,
            notifyCustomer: notifyCustomerOnReject,
          },
        });
        setRejectingReview(null);
        onRefresh();
        if (viewingReview?.id === rejectingReview.id) setViewingReview(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error rejecting review.");
      }
    });
  };

  const handleArchive = (rev: AdminReview) => {
    startTransition(async () => {
      try {
        await changeStatus({ data: { reviewId: rev.id, status: "archived" } });
        onRefresh();
        if (viewingReview?.id === rev.id) setViewingReview(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error archiving review.");
      }
    });
  };

  const handleRestore = (rev: AdminReview) => {
    startTransition(async () => {
      try {
        await changeStatus({ data: { reviewId: rev.id, status: "approved" } });
        onRefresh();
        if (viewingReview?.id === rev.id) setViewingReview(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error restoring review.");
      }
    });
  };

  const handleToggleFeatured = (rev: AdminReview) => {
    startTransition(async () => {
      try {
        await setFeatured({ data: { reviewId: rev.id, isFeatured: !rev.is_featured } });
        onRefresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error setting featured status.");
      }
    });
  };

  const handleEditOpen = (rev: AdminReview) => {
    setEditingReview(rev);
    setEditText(rev.review_text);
    setEditName(rev.customer_name);
    setEditService(rev.service_name || "");
    setEditLocation(rev.customer_location || "");
    setEditRating(rev.rating);
  };

  const handleEditSave = () => {
    if (!editingReview) return;
    startTransition(async () => {
      try {
        await editContent({
          data: {
            reviewId: editingReview.id,
            customerName: editName,
            reviewText: editText,
            ...(editService ? { serviceName: editService } : {}),
            ...(editLocation ? { customerLocation: editLocation } : {}),
            rating: editRating,
          },
        });
        setEditingReview(null);
        onRefresh();
        if (viewingReview?.id === editingReview.id) setViewingReview(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error updating review.");
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingReview) return;
    startTransition(async () => {
      try {
        await removeReview({ data: { reviewId: deletingReview.id } });
        setDeletingReview(null);
        onRefresh();
        if (viewingReview?.id === deletingReview.id) setViewingReview(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error deleting review.");
      }
    });
  };

  return (
    <div className={styles.wrap}>
      {/* Top Status Tabs */}
      <div className={styles.topBar}>
        <div className={styles.statusTabs}>
          <button
            type="button"
            className={[styles.statusTab, statusTab === "all" ? styles.statusTabActive : ""].join(" ")}
            onClick={() => setStatusTab("all")}
          >
            <span>All Reviews</span>
            <span className={styles.tabBadge}>{reviews.length}</span>
          </button>
          <button
            type="button"
            className={[styles.statusTab, statusTab === "pending" ? styles.statusTabActive : ""].join(" ")}
            onClick={() => setStatusTab("pending")}
          >
            <span>Pending</span>
            <span className={[styles.tabBadge, pendingCount > 0 ? styles.tabBadgeActive : ""].join(" ")}>
              {pendingCount}
            </span>
          </button>
          <button
            type="button"
            className={[styles.statusTab, statusTab === "approved" ? styles.statusTabActive : ""].join(" ")}
            onClick={() => setStatusTab("approved")}
          >
            <span>Approved</span>
            <span className={styles.tabBadge}>{approvedCount}</span>
          </button>
          <button
            type="button"
            className={[styles.statusTab, statusTab === "rejected" ? styles.statusTabActive : ""].join(" ")}
            onClick={() => setStatusTab("rejected")}
          >
            <span>Rejected</span>
            <span className={styles.tabBadge}>{rejectedCount}</span>
          </button>
          <button
            type="button"
            className={[styles.statusTab, statusTab === "archived" ? styles.statusTabActive : ""].join(" ")}
            onClick={() => setStatusTab("archived")}
          >
            <span>Archived</span>
            <span className={styles.tabBadge}>{archivedCount}</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className={styles.filtersRow}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by customer, review content, email, location..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={ratingFilter}
          onChange={(e) => setRatingFilter(Number(e.target.value))}
        >
          <option value={0}>All Star Ratings</option>
          <option value={5}>5 Stars</option>
          <option value={4}>4 Stars</option>
          <option value={3}>3 Stars</option>
          <option value={2}>2 Stars</option>
          <option value={1}>1 Star</option>
        </select>

        <select
          className={styles.filterSelect}
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
        >
          <option value="">All Services</option>
          {DIMISI_SERVICES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Reviews Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Rating</th>
                <th>Service & Snippet</th>
                <th>Status</th>
                <th>Campaign</th>
                <th>Submitted</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    No reviews found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((rev) => (
                  <tr key={rev.id}>
                    <td>
                      <div className={styles.customerCell}>
                        {rev.customer_photo_url ? (
                          <img src={rev.customer_photo_url} alt="" className={styles.avatar} />
                        ) : (
                          <div className={styles.avatarInitials}>
                            {rev.customer_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className={styles.customerName}>{rev.customer_name}</div>
                          <div className={styles.customerEmail}>{rev.customer_email || rev.customer_phone || "No direct contact"}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className={styles.stars}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={13} fill={s <= rev.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </td>

                    <td>
                      <div style={{ maxWidth: "260px" }}>
                        {rev.service_name ? (
                          <span style={{ fontSize: "0.72rem", color: "#818cf8", fontWeight: 600, display: "block" }}>
                            {rev.service_name}
                          </span>
                        ) : null}
                        <span style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>
                          {rev.review_text.length > 70 ? `${rev.review_text.slice(0, 70)}…` : rev.review_text}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={[
                          styles.statusPill,
                          rev.status === "pending"
                            ? styles.pillPending
                            : rev.status === "approved"
                            ? styles.pillApproved
                            : rev.status === "rejected"
                            ? styles.pillRejected
                            : styles.pillArchived,
                        ].join(" ")}
                      >
                        {rev.status}
                        {rev.is_featured ? (
                          <span title="Featured on website" style={{ display: "inline-flex", alignItems: "center" }}>
                            <Flame size={11} color="#fbbf24" />
                          </span>
                        ) : null}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                        {rev.campaign_name || "Direct Link"}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        {new Date(rev.submitted_at).toLocaleDateString()}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className={styles.actionsCell} style={{ justifyContent: "flex-end" }}>
                        {/* Quick View */}
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => setViewingReview(rev)}
                          title="View Full Details"
                        >
                          <Eye size={13} />
                        </button>

                        {/* Status specific actions */}
                        {rev.status === "pending" ? (
                          <>
                            <button
                              type="button"
                              className={[styles.actionBtn, styles.btnApprove].join(" ")}
                              onClick={() => handleApprove(rev)}
                              disabled={isPending}
                              title="Approve Review"
                            >
                              <CheckCircle size={13} />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              className={[styles.actionBtn, styles.btnReject].join(" ")}
                              onClick={() => setRejectingReview(rev)}
                              disabled={isPending}
                              title="Reject Review"
                            >
                              <XCircle size={13} />
                            </button>
                          </>
                        ) : rev.status === "approved" ? (
                          <>
                            <button
                              type="button"
                              className={styles.actionBtn}
                              onClick={() => handleToggleFeatured(rev)}
                              style={{ color: rev.is_featured ? "#fbbf24" : "#94a3b8" }}
                              title={rev.is_featured ? "Remove Featured" : "Mark as Featured"}
                            >
                              <Flame size={13} fill={rev.is_featured ? "currentColor" : "none"} />
                            </button>
                            <button
                              type="button"
                              className={styles.actionBtn}
                              onClick={() => handleArchive(rev)}
                              title="Archive / Hide"
                            >
                              <Archive size={13} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => handleRestore(rev)}
                            title="Restore Review"
                          >
                            <RotateCcw size={13} />
                            <span>Restore</span>
                          </button>
                        )}

                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => handleEditOpen(rev)}
                          title="Edit text/formatting"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => setDeletingReview(rev)}
                          style={{ color: "#f43f5e" }}
                          title="Delete Permanently"
                        >
                          <Trash2 size={13} />
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

      {/* Review Detail Modal */}
      {viewingReview ? (
        <div className={styles.modalBackdrop} onClick={() => setViewingReview(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Review Moderation Details</h3>
              <button
                type="button"
                onClick={() => setViewingReview(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailGrid}>
                <div>
                  <div className={styles.detailLabel}>Customer Name</div>
                  <div className={styles.detailVal}>{viewingReview.customer_name}</div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Status</div>
                  <div className={styles.detailVal} style={{ textTransform: "capitalize" }}>
                    {viewingReview.status} {viewingReview.is_featured ? "🔥 Featured" : ""}
                  </div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Email Address</div>
                  <div className={styles.detailVal}>
                    {viewingReview.customer_email ? (
                      <a href={`mailto:${viewingReview.customer_email}`} style={{ color: "#818cf8" }}>
                        <Mail size={12} style={{ display: "inline", marginRight: "4px" }} />
                        {viewingReview.customer_email}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Phone Number</div>
                  <div className={styles.detailVal}>
                    {viewingReview.customer_phone ? (
                      <a href={`tel:${viewingReview.customer_phone}`} style={{ color: "#818cf8" }}>
                        <Phone size={12} style={{ display: "inline", marginRight: "4px" }} />
                        {viewingReview.customer_phone}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Location</div>
                  <div className={styles.detailVal}>
                    <MapPin size={12} style={{ display: "inline", marginRight: "4px" }} />
                    {viewingReview.customer_location || "Not specified"}
                  </div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Rating</div>
                  <div className={styles.detailVal}>
                    {viewingReview.rating} / 5 Stars
                  </div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Submitted At</div>
                  <div className={styles.detailVal}>
                    <Clock size={12} style={{ display: "inline", marginRight: "4px" }} />
                    {new Date(viewingReview.submitted_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Consent Record</div>
                  <div className={styles.detailVal} style={{ color: "#34d399" }}>
                    ✓ Granted & Logged
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.detailLabel}>Customer Written Review</div>
            <div className={styles.reviewTextFull}>"{viewingReview.review_text}"</div>

            {viewingReview.moderation_reason ? (
              <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "8px", color: "#fca5a5", fontSize: "0.85rem", marginBottom: "1rem" }}>
                <strong>Moderation Reason:</strong> {viewingReview.moderation_reason}
              </div>
            ) : null}

            <div className={styles.modalActions}>
              {viewingReview.status === "pending" ? (
                <>
                  <button
                    type="button"
                    className={[styles.actionBtn, styles.btnApprove].join(" ")}
                    onClick={() => handleApprove(viewingReview)}
                    disabled={isPending}
                  >
                    <CheckCircle size={14} />
                    <span>Approve & Publish</span>
                  </button>
                  <button
                    type="button"
                    className={[styles.actionBtn, styles.btnReject].join(" ")}
                    onClick={() => setRejectingReview(viewingReview)}
                    disabled={isPending}
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                </>
              ) : viewingReview.status === "approved" ? (
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => handleArchive(viewingReview)}
                >
                  <Archive size={14} />
                  <span>Archive / Hide</span>
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => handleRestore(viewingReview)}
                >
                  <RotateCcw size={14} />
                  <span>Restore</span>
                </button>
              )}

              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => handleEditOpen(viewingReview)}
              >
                <Edit3 size={14} />
                <span>Edit Review</span>
              </button>

              <button
                type="button"
                className={styles.actionBtn}
                style={{ color: "#f43f5e" }}
                onClick={() => setDeletingReview(viewingReview)}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Reject Modal */}
      {rejectingReview ? (
        <div className={styles.modalBackdrop} onClick={() => setRejectingReview(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle} style={{ color: "#f87171" }}>
                Reject Review Submission
              </h3>
              <button
                type="button"
                onClick={() => setRejectingReview(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: "0.88rem", color: "#94a3b8", marginBottom: "1rem" }}>
              Provide the moderation reason for rejecting the review by <strong>{rejectingReview.customer_name}</strong>.
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: "0.4rem" }}>
                Reason for Rejection
              </label>
              <textarea
                className={styles.searchInput}
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ width: "100%", padding: "0.6rem" }}
              />
            </div>

            {rejectingReview.customer_email ? (
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.84rem", color: "#cbd5e1", cursor: "pointer", marginBottom: "1.25rem" }}>
                <input
                  type="checkbox"
                  checked={notifyCustomerOnReject}
                  onChange={(e) => setNotifyCustomerOnReject(e.target.checked)}
                />
                <span>Send polite notification email to customer ({rejectingReview.customer_email})</span>
              </label>
            ) : null}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => setRejectingReview(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={[styles.actionBtn, styles.btnReject].join(" ")}
                onClick={handleRejectConfirm}
                disabled={isPending}
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit Review Modal */}
      {editingReview ? (
        <div className={styles.modalBackdrop} onClick={() => setEditingReview(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit Review (Formatting & Typo Fix)</h3>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1rem" }}>
              Note: Changes are logged in the admin audit trail. Do not alter the customer's intended rating or sentiment.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Customer Name</label>
                <input
                  type="text"
                  className={styles.searchInput}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Rating</label>
                <select
                  className={styles.filterSelect}
                  value={editRating}
                  onChange={(e) => setEditRating(Number(e.target.value))}
                  style={{ width: "100%", padding: "0.5rem" }}
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <option key={s} value={s}>
                      {s} Stars
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Service Name</label>
                <input
                  type="text"
                  className={styles.searchInput}
                  value={editService}
                  onChange={(e) => setEditService(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Location</label>
                <input
                  type="text"
                  className={styles.searchInput}
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Review Text</label>
              <textarea
                className={styles.searchInput}
                rows={5}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={{ width: "100%", padding: "0.6rem", minHeight: "100px" }}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => setEditingReview(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={[styles.actionBtn, styles.btnApprove].join(" ")}
                onClick={handleEditSave}
                disabled={isPending}
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deletingReview ? (
        <div className={styles.modalBackdrop} onClick={() => setDeletingReview(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle} style={{ color: "#f43f5e" }}>
                <ShieldAlert size={20} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                Permanent Deletion
              </h3>
              <button
                type="button"
                onClick={() => setDeletingReview(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: "0.9rem", color: "#e2e8f0", lineHeight: "1.6" }}>
              Are you sure you want to permanently delete the review by <strong>{deletingReview.customer_name}</strong>?
            </p>
            <p style={{ fontSize: "0.82rem", color: "#fca5a5" }}>
              This action cannot be undone. An audit log record will be preserved.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => setDeletingReview(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={[styles.actionBtn, styles.btnReject].join(" ")}
                onClick={handleDeleteConfirm}
                disabled={isPending}
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
