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
  Building2,
  Code2,
  Users,
  Sparkles,
} from "lucide-react";
import {
  REPORT_REASONS,
  type PublicReview,
  type ReviewStats,
  type ReviewType,
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
    clientTotal: 0,
    clientAverage: 5.0,
    employeeTotal: 0,
    employeeAverage: 5.0,
  });
  const [services, setServices] = useState<string[]>([]);
  const [totalApproved, setTotalApproved] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Filters & State
  const [typeFilter, setTypeFilter] = useState<"all" | "client" | "employee">("all");
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
        type: typeFilter,
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
  }, [page, typeFilter, ratingFilter, serviceFilter, searchQuery, sortOrder, loadReviews]);

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
            <span>Verified Client &amp; Staff Reflections</span>
          </div>
          <h1 className={styles.heroTitle}>Client Outcomes &amp; Team Endorsements</h1>
          <p className={styles.heroSub}>
            Discover verified feedback from our enterprise partners worldwide and firsthand reflections from the engineers, architects, and creators building DIMISI Technologies.
          </p>
          <div className={styles.heroActions}>
            <Link to="/review" className={styles.leaveReviewBtn}>
              <MessageSquarePlus size={18} />
              <span>Leave a Review</span>
            </Link>
          </div>
        </div>

        {/* Category Tabs: All / Clients / Employees */}
        <div className={styles.categoryTabsWrap}>
          <div className={styles.categoryTabs} role="tablist" aria-label="Review Categories">
            <button
              type="button"
              role="tab"
              aria-selected={typeFilter === "all"}
              className={[styles.catTab, typeFilter === "all" ? styles.catTabActive : ""].join(" ")}
              onClick={() => {
                setTypeFilter("all");
                handleFilterChange();
              }}
            >
              <Users size={16} />
              <span>All Reviews</span>
              <span className={styles.catCount}>{stats.total}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={typeFilter === "client"}
              className={[styles.catTab, typeFilter === "client" ? styles.catTabActive : ""].join(" ")}
              onClick={() => {
                setTypeFilter("client");
                handleFilterChange();
              }}
            >
              <Building2 size={16} />
              <span>Client Reviews</span>
              <span className={styles.catCount}>{stats.clientTotal ?? 0}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={typeFilter === "employee"}
              className={[styles.catTab, typeFilter === "employee" ? styles.catTabActive : ""].join(" ")}
              onClick={() => {
                setTypeFilter("employee");
                handleFilterChange();
              }}
            >
              <Code2 size={16} />
              <span>Employee &amp; Staff Reviews</span>
              <span className={styles.catCount}>{stats.employeeTotal ?? 0}</span>
            </button>
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
              Based on {totalApproved} verified {totalApproved === 1 ? "endorsement" : "endorsements"}
            </div>

            <div className={styles.subStatsRow}>
              <div className={styles.subStatItem}>
                <span className={styles.subStatLabel}>Clients</span>
                <span className={styles.subStatVal}>{stats.clientTotal ?? 0} ({stats.clientAverage?.toFixed(1) ?? "5.0"}★)</span>
              </div>
              <span className={styles.subStatSep}>·</span>
              <div className={styles.subStatItem}>
                <span className={styles.subStatLabel}>Team &amp; Staff</span>
                <span className={styles.subStatVal}>{stats.employeeTotal ?? 0} ({stats.employeeAverage?.toFixed(1) ?? "5.0"}★)</span>
              </div>
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
                          ? "linear-gradient(90deg, #ff8c1a, #ffa033)"
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
        {!ratingFilter && !serviceFilter && !searchQuery && typeFilter === "all" && featured.length > 0 ? (
          <div className={styles.featuredSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Flame size={20} color="#ff8c1a" style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                Featured Highlights
              </h2>
            </div>
            <div className={styles.featuredGrid}>
              {featured.map((item) => {
                const isEmployee = item.reviewer_type === "employee";
                return (
                  <div key={`feat-${item.id}`} className={[styles.reviewCard, styles.featuredCard].join(" ")}>
                    <div className={styles.cardTop}>
                      <div className={styles.authorBox}>
                        {item.photo_url ? (
                          <img src={item.photo_url} alt={item.customer_name} className={styles.avatar} />
                        ) : (
                          <div className={[styles.avatarInitials, isEmployee ? styles.avatarEmployee : ""].join(" ")}>
                            {item.customer_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className={styles.authorMeta}>
                          <div className={styles.authorName}>
                            {item.customer_name}
                            {isEmployee ? (
                              <span className={styles.employeePill} title="DIMISI Team Member">
                                <Code2 size={12} />
                                <span>DIMISI Team</span>
                              </span>
                            ) : (
                              <span className={styles.clientPill} title="Verified Client">
                                <CheckCircle size={12} />
                                <span>Verified Client</span>
                              </span>
                            )}
                          </div>
                          {item.role_or_title ? (
                            <div className={styles.authorRole}>{item.role_or_title}</div>
                          ) : item.customer_location ? (
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
                      <span className={[styles.serviceTag, isEmployee ? styles.serviceTagEmp : ""].join(" ")}>
                        {item.service_name}
                      </span>
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
                );
              })}
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
                placeholder={
                  typeFilter === "employee"
                    ? "Search staff reviews by role, engineer name, or keyword..."
                    : "Search reviews by keyword, role, or client name..."
                }
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
              <option value="">All Services &amp; Domains</option>
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
            <CheckCircle size={48} color="#ff8c1a" style={{ margin: "0 auto" }} />
            <h3 className={styles.emptyTitle}>No matching reviews found</h3>
            <p className={styles.emptyText}>
              {searchQuery || ratingFilter || serviceFilter || typeFilter !== "all"
                ? "Try adjusting your filters, category tabs, or search keywords."
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
              {reviews.map((item) => {
                const isEmployee = item.reviewer_type === "employee";
                return (
                  <div key={item.id} className={[styles.reviewCard, isEmployee ? styles.employeeCardBorder : ""].join(" ")}>
                    <div className={styles.cardTop}>
                      <div className={styles.authorBox}>
                        {item.photo_url ? (
                          <img src={item.photo_url} alt={item.customer_name} className={styles.avatar} />
                        ) : (
                          <div className={[styles.avatarInitials, isEmployee ? styles.avatarEmployee : ""].join(" ")}>
                            {item.customer_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className={styles.authorMeta}>
                          <div className={styles.authorName}>
                            <span>{item.customer_name}</span>
                            {isEmployee ? (
                              <span className={styles.employeePill} title="DIMISI Team Member">
                                <Code2 size={11} />
                                <span>DIMISI Team</span>
                              </span>
                            ) : (
                              <span className={styles.clientPill} title="Verified Client">
                                <CheckCircle size={11} />
                                <span>Client</span>
                              </span>
                            )}
                          </div>
                          {item.role_or_title ? (
                            <div className={styles.authorRole}>{item.role_or_title}</div>
                          ) : item.customer_location ? (
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
                      <span className={[styles.serviceTag, isEmployee ? styles.serviceTagEmp : ""].join(" ")}>
                        {item.service_name}
                      </span>
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
                );
              })}
            </div>

            {hasMore ? (
              <div className={styles.loadMoreWrap}>
                <button
                  type="button"
                  className={styles.loadMoreBtn}
                  disabled={isLoading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className={styles.spin} />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Load More Reviews</span>
                  )}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Report Inappropriate Review Modal */}
      {reportingReview ? (
        <div className={styles.modalOverlay} onClick={() => setReportingReview(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setReportingReview(null)}
            >
              <X size={18} />
            </button>

            <h3 className={styles.modalTitle}>Report this Review</h3>
            <p className={styles.modalDesc}>
              Report review submitted by <strong>{reportingReview.customer_name}</strong> for moderation.
            </p>

            {reportSuccess ? (
              <div className={styles.reportSuccessBox}>
                <CheckCircle size={20} color="#22c55e" />
                <span>{reportSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className={styles.reportForm}>
                <div className={styles.field}>
                  <label htmlFor="repReason">Reason for Report</label>
                  <select
                    id="repReason"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className={styles.selectInput}
                  >
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label htmlFor="repMsg">Additional Details (Optional)</label>
                  <textarea
                    id="repMsg"
                    rows={3}
                    placeholder="Provide details about why this review should be moderated..."
                    value={reportMessage}
                    onChange={(e) => setReportMessage(e.target.value)}
                    className={styles.textAreaInput}
                  />
                </div>

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label htmlFor="repName">Your Name (Optional)</label>
                    <input
                      id="repName"
                      type="text"
                      placeholder="Jane Doe"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      className={styles.textInput}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="repEmail">Your Email (Optional)</label>
                    <input
                      id="repEmail"
                      type="email"
                      placeholder="jane@company.com"
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                      className={styles.textInput}
                    />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setReportingReview(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitReportBtn}
                    disabled={isReporting}
                  >
                    {isReporting ? (
                      <>
                        <Loader2 size={16} className={styles.spin} />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Submit Report</span>
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
