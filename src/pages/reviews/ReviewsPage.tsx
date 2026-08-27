import { useEffect, useState, useTransition } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Star,
  CheckCircle,
  Flag,
  Search,
  MessageSquarePlus,
  Flame,
  X,
  Send,
  Loader2,
  ThumbsUp,
} from "lucide-react";
import {
  REPORT_REASONS,
  type PublicReview,
  type ReviewStats,
} from "@/lib/reviews.shared";
import { getPublicReviews, reportReview } from "@/lib/reviews.functions";
import styles from "./ReviewsPage.module.css";

export function ReviewsPage() {
  const loadReviews = useServerFn(getPublicReviews);
  const sendReport = useServerFn(reportReview);

  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [featured, setFeatured] = useState<PublicReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    average: 5.0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [services, setServices] = useState<string[]>([]);
  const [totalApproved, setTotalApproved] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Filters & State
  const [page, setPage] = useState(0);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"newest" | "highest" | "lowest">("newest");
  const [isLoading, setIsLoading] = useState(true);

  // Report Modal
  const [reportingReview, setReportingReview] = useState<PublicReview | null>(null);
  const [reportReason, setReportReason] = useState<string>(REPORT_REASONS[0]);
  const [reportMessage, setReportMessage] = useState<string>("");
  const [reporterName, setReporterName] = useState<string>("");
  const [reporterEmail, setReporterEmail] = useState<string>("");
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [isReporting, startReportTransition] = useTransition();

  // Load reviews on filter change
  useEffect(() => {
    let active = true;
    setIsLoading(true);

    loadReviews({
      data: {
        page,
        pageSize: 9,
        rating: ratingFilter,
        service: serviceFilter,
        search: searchQuery,
        sort: sortOrder,
      },
    })
      .then((res) => {
        if (!active) return;
        if (page === 0) {
          setReviews(res.reviews);
        } else {
          setReviews((prev) => [...prev, ...res.reviews]);
        }
        setFeatured(res.featured);
        setStats(res.stats);
        setServices(res.services);
        setTotalApproved(res.totalApproved);
        setHasMore(res.hasMore);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, ratingFilter, serviceFilter, searchQuery, sortOrder, loadReviews]);

  const handleFilterChange = () => {
    setPage(0);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingReview) return;

    startReportTransition(async () => {
      try {
        const res = await sendReport({
          data: {
            reviewId: reportingReview.id,
            reason: reportReason,
            ...(reportMessage ? { message: reportMessage } : {}),
            ...(reporterName ? { reporterName } : {}),
            ...(reporterEmail ? { reporterEmail } : {}),
          },
        });
        setReportSuccess(res.message);
        setTimeout(() => {
          setReportingReview(null);
          setReportSuccess(null);
          setReportMessage("");
        }, 1800);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Could not submit report.");
      }
    });
  };

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DIMISI Technologies Pvt Ltd",
    url: "https://dimisi.in",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: stats.average || 5.0,
      reviewCount: stats.total || 1,
      bestRating: "5",
      worstRating: "1",
    },
    review: reviews.slice(0, 10).map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.customer_name,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: r.review_text,
      datePublished: r.published_at,
    })),
  };

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        {/* Header & Hero */}
        <div className={styles.hero}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            <span>Verified Client Feedback</span>
          </div>
          <h1 className={styles.heroTitle}>Client Outcomes & Endorsements</h1>
          <p className={styles.heroSub}>
            Discover how DIMISI Technologies powers mission-critical platforms, autonomous AI systems, and futuristic digital experiences for partners worldwide.
          </p>
          <div className={styles.heroActions}>
            <Link to="/review" className={styles.leaveReviewBtn}>
              <MessageSquarePlus size={18} />
              <span>Leave a Review</span>
            </Link>
          </div>
        </div>

        {/* Aggregate Stats Card */}
        <div className={styles.statsCard}>
          <div className={styles.scoreBox}>
            <div className={styles.averageScore}>{stats.average.toFixed(1)}</div>
            <div className={styles.scoreStars} aria-label={`${stats.average} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={22}
                  fill={s <= Math.round(stats.average) ? "currentColor" : "none"}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <div className={styles.scoreTotal}>
              Based on {totalApproved} verified {totalApproved === 1 ? "review" : "reviews"}
            </div>
          </div>

          <div className={styles.distributionBox}>
            {([5, 4, 3, 2, 1] as const).map((stars) => {
              const count = stats.distribution[stars] || 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              const isSelected = ratingFilter === stars;
              return (
                <button
                  key={stars}
                  type="button"
                  className={styles.distRow}
                  onClick={() => {
                    setRatingFilter(isSelected ? 0 : stars);
                    handleFilterChange();
                  }}
                  title={`Filter by ${stars} star reviews`}
                >
                  <span className={styles.distLabel}>
                    {stars} <Star size={12} fill="currentColor" />
                  </span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{
                        width: `${pct}%`,
                        background: isSelected
                          ? "linear-gradient(90deg, #6366f1, #818cf8)"
                          : undefined,
                      }}
                    />
                  </div>
                  <span className={styles.distCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Reviews Spotlight (if no filter applied) */}
        {!ratingFilter && !serviceFilter && !searchQuery && featured.length > 0 ? (
          <div className={styles.featuredSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Flame size={20} color="#fbbf24" style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                Featured Highlights
              </h2>
            </div>
            <div className={styles.featuredGrid}>
              {featured.map((item) => (
                <div key={`feat-${item.id}`} className={[styles.reviewCard, styles.featuredCard].join(" ")}>
                  <div className={styles.cardTop}>
                    <div className={styles.authorBox}>
                      {item.photo_url ? (
                        <img src={item.photo_url} alt={item.customer_name} className={styles.avatar} />
                      ) : (
                        <div className={styles.avatarInitials}>
                          {item.customer_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className={styles.authorMeta}>
                        <div className={styles.authorName}>
                          {item.customer_name}
                          <span title="Verified Client" style={{ display: "inline-flex", alignItems: "center" }}>
                            <CheckCircle size={14} className={styles.verifiedIcon} />
                          </span>
                        </div>
                        {item.customer_location ? (
                          <div className={styles.authorLocation}>{item.customer_location}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className={styles.stars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={15} fill={s <= item.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>

                  {item.service_name ? (
                    <span className={styles.serviceTag}>{item.service_name}</span>
                  ) : null}

                  <p className={styles.reviewText}>"{item.review_text}"</p>

                  <div className={styles.cardFoot}>
                    <span className={styles.reviewDate}>
                      {new Date(item.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      type="button"
                      className={styles.reportBtn}
                      onClick={() => setReportingReview(item)}
                    >
                      <Flag size={12} />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Filter Controls Bar */}
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search reviews by keyword or name..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleFilterChange();
                }}
              />
            </div>

            <select
              className={styles.filterSelect}
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(Number(e.target.value));
                handleFilterChange();
              }}
            >
              <option value={0}>All Ratings</option>
              <option value={5}>5 Stars Only</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>

            <select
              className={styles.filterSelect}
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">All Services</option>
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <select
              className={styles.filterSelect}
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as any);
                handleFilterChange();
              }}
            >
              <option value="newest">Sort by: Newest First</option>
              <option value="highest">Sort by: Highest Rating</option>
              <option value="lowest">Sort by: Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Reviews Grid */}
        {reviews.length === 0 && !isLoading ? (
          <div className={styles.emptyState}>
            <CheckCircle size={48} color="#6366f1" style={{ margin: "0 auto" }} />
            <h3 className={styles.emptyTitle}>No matching reviews found</h3>
            <p className={styles.emptyText}>
              {searchQuery || ratingFilter || serviceFilter
                ? "Try adjusting your filters or search keywords."
                : "Be the first to share your experience with DIMISI Technologies!"}
            </p>
            <Link to="/review" className={styles.leaveReviewBtn}>
              <MessageSquarePlus size={18} />
              <span>Submit First Review</span>
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.reviewsGrid}>
              {reviews.map((item) => (
                <div key={item.id} className={styles.reviewCard}>
                  <div className={styles.cardTop}>
                    <div className={styles.authorBox}>
                      {item.photo_url ? (
                        <img src={item.photo_url} alt={item.customer_name} className={styles.avatar} />
                      ) : (
                        <div className={styles.avatarInitials}>
                          {item.customer_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className={styles.authorMeta}>
                        <div className={styles.authorName}>
                          {item.customer_name}
                          <span title="Verified Client" style={{ display: "inline-flex", alignItems: "center" }}>
                            <CheckCircle size={14} className={styles.verifiedIcon} />
                          </span>
                        </div>
                        {item.customer_location ? (
                          <div className={styles.authorLocation}>{item.customer_location}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className={styles.stars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={15} fill={s <= item.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>

                  {item.service_name ? (
                    <span className={styles.serviceTag}>{item.service_name}</span>
                  ) : null}

                  <p className={styles.reviewText}>"{item.review_text}"</p>

                  <div className={styles.cardFoot}>
                    <span className={styles.reviewDate}>
                      {new Date(item.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      type="button"
                      className={styles.reportBtn}
                      onClick={() => setReportingReview(item)}
                      title="Report inappropriate content"
                    >
                      <Flag size={12} />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {hasMore ? (
              <div className={styles.loadMoreWrap}>
                <button
                  type="button"
                  className={styles.loadMoreBtn}
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading Reviews..." : "Load More Reviews"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Report Review Modal */}
      {reportingReview ? (
        <div className={styles.modalBackdrop} onClick={() => setReportingReview(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className={styles.modalTitle}>Report This Review</h3>
              <button
                type="button"
                onClick={() => setReportingReview(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>
            <p className={styles.modalSub}>
              Flagging review by <strong>{reportingReview.customer_name}</strong> for moderation.
            </p>

            {reportSuccess ? (
              <div style={{ padding: "1.5rem", textAlign: "center", color: "#10b981", background: "rgba(16, 185, 129, 0.1)", borderRadius: "10px" }}>
                {reportSuccess}
              </div>
            ) : (
              <form onSubmit={handleReportSubmit}>
                <div className={styles.modalField}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#cbd5e1" }}>
                    Reason for report <span style={{ color: "#f43f5e" }}>*</span>
                  </label>
                  <select
                    className={styles.modalSelect}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                  >
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.modalField}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#cbd5e1" }}>
                    Additional details (Optional)
                  </label>
                  <textarea
                    className={styles.modalTextarea}
                    rows={3}
                    placeholder="Provide additional context for the moderation team..."
                    value={reportMessage}
                    onChange={(e) => setReportMessage(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div className={styles.modalField} style={{ margin: 0 }}>
                    <label style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Your Name (Optional)</label>
                    <input
                      type="text"
                      className={styles.modalInput}
                      placeholder="Your name"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                    />
                  </div>
                  <div className={styles.modalField} style={{ margin: 0 }}>
                    <label style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Your Email (Optional)</label>
                    <input
                      type="email"
                      className={styles.modalInput}
                      placeholder="your@email.com"
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.btnCancel}
                    onClick={() => setReportingReview(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.btnReportSubmit}
                    disabled={isReporting}
                  >
                    {isReporting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                        Submit Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
