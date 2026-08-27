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
  ArrowRight,
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
        {/* 01 — HERO */}
        <div className={styles.hero}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            <span>REVIEWS</span>
          </div>
          <h1 className={styles.heroTitle}>Built With Trust. Proven By Experience.</h1>
          <p className={styles.heroSub}>
            Hear from the clients we build for and the people who build DIMISI from within.
          </p>
          <div className={styles.heroActions}>
            <Link to="/review" className={styles.leaveReviewBtn}>
              <MessageSquarePlus size={18} />
              <span>Leave a Review</span>
            </Link>
          </div>
        </div>

        {/* 02 — REVIEW SUMMARY (Dynamic Statistics from database) */}
        <div className={styles.statsSummaryGrid}>
          <div className={styles.statBox}>
            <span className={styles.statBoxLabel}>TOTAL REVIEWS</span>
            <div className={styles.statBoxValue}>{stats.total}</div>
            <span className={styles.statBoxSub}>Verified records</span>
          </div>

          <div className={styles.statBox}>
            <span className={styles.statBoxLabel}>CLIENT REVIEWS</span>
            <div className={styles.statBoxValue}>{stats.clientTotal ?? 0}</div>
            <span className={styles.statBoxSub}>
              {stats.clientTotal ? `${stats.clientAverage?.toFixed(1)}★ average` : "Direct partners"}
            </span>
          </div>

          <div className={styles.statBox}>
            <span className={styles.statBoxLabel}>EMPLOYEE REVIEWS</span>
            <div className={styles.statBoxValue}>{stats.employeeTotal ?? 0}</div>
            <span className={styles.statBoxSub}>
              {stats.employeeTotal ? `${stats.employeeAverage?.toFixed(1)}★ average` : "Team & Staff"}
            </span>
          </div>

          <div className={[styles.statBox, styles.statBoxRating].join(" ")}>
            <span className={styles.statBoxLabel}>AVERAGE RATING</span>
            <div className={styles.statBoxValue}>
              ★ {stats.average ? stats.average.toFixed(1) : "5.0"}<span className={styles.statRatingMax}>/5</span>
            </div>
            <div className={styles.scoreStars} aria-label={`${stats.average} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  fill={s <= Math.round(stats.average) ? "currentColor" : "none"}
                  strokeWidth={1.5}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 03 — REVIEW TYPE SWITCHER (Segmented Control) */}
        <div className={styles.switcherWrap}>
          <div className={styles.segmentedControl} role="tablist" aria-label="Reviewer Type Switcher">
            <button
              type="button"
              role="tab"
              aria-selected={typeFilter === "all"}
              className={[styles.segBtn, typeFilter === "all" ? styles.segBtnActive : ""].join(" ")}
              onClick={() => {
                setTypeFilter("all");
                handleFilterChange();
              }}
            >
              <Users size={16} />
              <span>ALL REVIEWS</span>
              <span className={styles.segBadge}>{stats.total}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={typeFilter === "client"}
              className={[styles.segBtn, typeFilter === "client" ? styles.segBtnActive : ""].join(" ")}
              onClick={() => {
                setTypeFilter("client");
                handleFilterChange();
              }}
            >
              <Building2 size={16} />
              <span>CLIENTS</span>
              <span className={styles.segBadge}>{stats.clientTotal ?? 0}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={typeFilter === "employee"}
              className={[styles.segBtn, typeFilter === "employee" ? styles.segBtnActive : ""].join(" ")}
              onClick={() => {
                setTypeFilter("employee");
                handleFilterChange();
              }}
            >
              <Code2 size={16} />
              <span>EMPLOYEES</span>
              <span className={styles.segBadge}>{stats.employeeTotal ?? 0}</span>
            </button>
          </div>
        </div>

        {/* 04 — RATING FILTERS & SEARCH ROW */}
        <div className={styles.filterBar}>
          <div className={styles.ratingFilterRow} role="group" aria-label="Filter by star rating">
            <button
              type="button"
              className={[styles.ratingPill, ratingFilter === 0 ? styles.ratingPillActive : ""].join(" ")}
              onClick={() => {
                setRatingFilter(0);
                handleFilterChange();
              }}
            >
              All Ratings
            </button>
            {([5, 4, 3, 2, 1] as const).map((star) => (
              <button
                key={star}
                type="button"
                className={[styles.ratingPill, ratingFilter === star ? styles.ratingPillActive : ""].join(" ")}
                onClick={() => {
                  setRatingFilter(ratingFilter === star ? 0 : star);
                  handleFilterChange();
                }}
              >
                <span>{star}★</span>
                <span className={styles.distSmallCount}>({stats.distribution[star] || 0})</span>
              </button>
            ))}
          </div>

          <div className={styles.searchAndSortWrap}>
            <div className={styles.searchBox}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder={
                  typeFilter === "employee"
                    ? "Search staff by name, role, department..."
                    : "Search reviews by name, company, service..."
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
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as any);
                handleFilterChange();
              }}
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* 05 — DYNAMIC SECTION HEADING */}
        <div className={styles.dynamicSectionHeader}>
          {typeFilter === "employee" ? (
            <div>
              <span className={styles.sectionEyebrow}>INSIDE DIMISI</span>
              <h2 className={styles.sectionHeading}>Built By People Who Believe In The Mission.</h2>
              <p className={styles.sectionDesc}>
                Hear directly from the people building products, technology and experiences at DIMISI.
              </p>
            </div>
          ) : typeFilter === "client" ? (
            <div>
              <span className={styles.sectionEyebrow}>CLIENT EXPERIENCE</span>
              <h2 className={styles.sectionHeading}>Trusted By The People We Build For.</h2>
              <p className={styles.sectionDesc}>
                Real feedback from clients and partners who have worked with DIMISI.
              </p>
            </div>
          ) : (
            <div>
              <span className={styles.sectionEyebrow}>ALL REVIEWS</span>
              <h2 className={styles.sectionHeading}>What People Say About DIMISI</h2>
              <p className={styles.sectionDesc}>
                Real feedback from clients and the people who build DIMISI from within.
              </p>
            </div>
          )}
        </div>

        {/* Featured Reviews Spotlight (When on All Reviews & no filters) */}
        {!ratingFilter && !serviceFilter && !searchQuery && typeFilter === "all" && featured.length > 0 ? (
          <div className={styles.featuredSection}>
            <div className={styles.featuredHeader}>
              <h3 className={styles.featuredHeading}>
                <Flame size={18} color="#ffab2e" style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                Featured Experience
              </h3>
            </div>
            <div className={styles.featuredGrid}>
              {featured.map((item) => {
                const isEmp = item.reviewer_type === "employee";
                return (
                  <div key={`feat-${item.id}`} className={[styles.reviewCard, styles.featuredCard].join(" ")}>
                    <div className={styles.cardTop}>
                      <div className={styles.authorBox}>
                        {item.photo_url ? (
                          <img src={item.photo_url} alt={item.customer_name} className={styles.avatar} />
                        ) : (
                          <div className={[styles.avatarInitials, isEmp ? styles.avatarEmployee : ""].join(" ")}>
                            {item.customer_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className={styles.authorMeta}>
                          <div className={styles.authorNameRow}>
                            <span className={styles.authorName}>{item.customer_name}</span>
                            {isEmp ? (
                              <span className={styles.employeeBadge}>
                                {item.is_verified ? <CheckCircle size={10} /> : null}
                                <span>{item.is_verified ? "VERIFIED EMPLOYEE" : "EMPLOYEE"}</span>
                              </span>
                            ) : (
                              <span className={styles.clientBadge}>
                                {item.is_verified ? <CheckCircle size={10} /> : null}
                                <span>{item.is_verified ? "VERIFIED CLIENT" : "CLIENT"}</span>
                              </span>
                            )}
                          </div>
                          {item.role_or_title ? (
                            <div className={styles.authorRole}>
                              {item.role_or_title}
                              {isEmp && !item.role_or_title.includes("DIMISI") ? " · DIMISI Technologies" : ""}
                            </div>
                          ) : isEmp ? (
                            <div className={styles.authorRole}>DIMISI Technologies</div>
                          ) : item.customer_location ? (
                            <div className={styles.authorLocation}>{item.customer_location}</div>
                          ) : null}
                        </div>
                      </div>

                      <div className={styles.stars} aria-label={`${item.rating} stars`}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={15} fill={s <= item.rating ? "currentColor" : "none"} strokeWidth={1.5} />
                        ))}
                      </div>
                    </div>

                    {item.service_name ? (
                      <span className={[styles.serviceTag, isEmp ? styles.serviceTagEmp : ""].join(" ")}>
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

        {/* 05 — REVIEWS GRID / SKELETON / EMPTY STATES */}
        {isLoading && reviews.length === 0 ? (
          <div className={styles.reviewsGrid}>
            {[1, 2, 3, 4, 5, 6].map((sk) => (
              <div key={sk} className={[styles.reviewCard, styles.skeletonCard].join(" ")}>
                <div className={styles.cardTop}>
                  <div className={styles.authorBox}>
                    <div className={styles.skeletonAvatar} />
                    <div className={styles.authorMeta}>
                      <div className={styles.skeletonLineShort} />
                      <div className={styles.skeletonLineTiny} />
                    </div>
                  </div>
                </div>
                <div className={styles.skeletonLineFull} />
                <div className={styles.skeletonLineFull} />
                <div className={styles.skeletonLineMed} />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle size={44} color="#ffab2e" style={{ margin: "0 auto" }} />
            <h3 className={styles.emptyTitle}>
              {typeFilter === "client"
                ? "No client reviews yet."
                : typeFilter === "employee"
                ? "No employee reviews yet."
                : "No reviews available yet."}
            </h3>
            <p className={styles.emptyText}>
              {typeFilter === "client"
                ? "Be the first to share your experience with DIMISI."
                : typeFilter === "employee"
                ? "The people behind DIMISI will have their say here."
                : searchQuery || ratingFilter || serviceFilter
                ? "Try adjusting your filters or search terms."
                : "Be the first to share your experience with DIMISI Technologies!"}
            </p>
            <Link to="/review" className={styles.leaveReviewBtn}>
              <MessageSquarePlus size={18} />
              <span>Leave a Review</span>
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.reviewsGrid}>
              {reviews.map((item) => {
                const isEmp = item.reviewer_type === "employee";
                return (
                  <div key={item.id} className={[styles.reviewCard, isEmp ? styles.employeeCardBorder : ""].join(" ")}>
                    <div className={styles.cardTop}>
                      <div className={styles.authorBox}>
                        {item.photo_url ? (
                          <img src={item.photo_url} alt={item.customer_name} className={styles.avatar} />
                        ) : (
                          <div className={[styles.avatarInitials, isEmp ? styles.avatarEmployee : ""].join(" ")}>
                            {item.customer_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className={styles.authorMeta}>
                          <div className={styles.authorNameRow}>
                            <span className={styles.authorName}>{item.customer_name}</span>
                            {isEmp ? (
                              <span className={styles.employeeBadge}>
                                {item.is_verified ? <CheckCircle size={10} /> : null}
                                <span>{item.is_verified ? "VERIFIED EMPLOYEE" : "EMPLOYEE"}</span>
                              </span>
                            ) : (
                              <span className={styles.clientBadge}>
                                {item.is_verified ? <CheckCircle size={10} /> : null}
                                <span>{item.is_verified ? "VERIFIED CLIENT" : "CLIENT"}</span>
                              </span>
                            )}
                          </div>
                          {item.role_or_title ? (
                            <div className={styles.authorRole}>
                              {item.role_or_title}
                              {isEmp && !item.role_or_title.includes("DIMISI") ? " · DIMISI Technologies" : ""}
                            </div>
                          ) : isEmp ? (
                            <div className={styles.authorRole}>DIMISI Technologies</div>
                          ) : item.customer_location ? (
                            <div className={styles.authorLocation}>{item.customer_location}</div>
                          ) : null}
                        </div>
                      </div>

                      <div className={styles.stars} aria-label={`${item.rating} stars`}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={15} fill={s <= item.rating ? "currentColor" : "none"} strokeWidth={1.5} />
                        ))}
                      </div>
                    </div>

                    {item.service_name ? (
                      <span className={[styles.serviceTag, isEmp ? styles.serviceTagEmp : ""].join(" ")}>
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

        {/* 06 — SHARE EXPERIENCE */}
        <div className={styles.shareExperienceSection}>
          <div className={styles.shareExpCard}>
            <span className={styles.shareExpBadge}>COMMUNITY VOICES</span>
            <h2 className={styles.shareExpTitle}>Tell Us About Your Experience</h2>
            <p className={styles.shareExpDesc}>
              Whether you are an enterprise partner who partnered with us or a builder creating next-generation software within DIMISI, your reflection matters.
            </p>
            <div className={styles.shareExpButtons}>
              <Link to="/review" className={styles.shareBtnClient}>
                <Building2 size={18} />
                <span>Submit Client Review</span>
              </Link>
              <Link to="/review" className={styles.shareBtnEmployee}>
                <Code2 size={18} />
                <span>Submit Staff Review</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 07 — CTA SECTION */}
        <div className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready To Build What's Next?</h2>
            <p className={styles.ctaSub}>
              Collaborate with our engineers and designers to build AI platforms, high-performance web systems, and mobile architectures.
            </p>
            <Link to="/contact" className={styles.ctaBtn}>
              <span>Start A Conversation</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Report Modal */}
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
