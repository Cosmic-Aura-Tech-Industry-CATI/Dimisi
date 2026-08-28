import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Star,
  CheckCircle2,
  MapPin,
  Sparkles,
  ArrowUpRight,
  MessageSquarePlus,
  Layers,
  RefreshCw,
  AlertTriangle,
  Briefcase,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { getPublicReviews } from "@/lib/reviews.functions";
import type { PublicReview } from "@/lib/reviews.shared";
import styles from "./LiveReviewsMotion.module.css";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.starRow} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={[styles.starIcon, star <= rating ? styles.starFilled : styles.starEmpty].join(" ")}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: PublicReview }) {
  const isEmp = review.reviewer_type === "employee";
  const initials =
    review.customer_name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "DM";

  return (
    <div className={[styles.card, review.is_featured ? styles.cardFeatured : ""].join(" ")}>
      <div className={styles.cardGlow} aria-hidden="true" />

      {/* Top Meta: Stars + Verified Badge */}
      <div className={styles.cardHeader}>
        <StarRating rating={review.rating} />
        {isEmp ? (
          <span className={styles.verifiedBadgeEmp}>
            <Briefcase className={styles.checkIcon} aria-hidden="true" />
            {review.is_verified ? "Verified Staff" : "DIMISI Team"}
          </span>
        ) : (
          <span className={styles.verifiedBadgeClient}>
            <CheckCircle2 className={styles.checkIcon} aria-hidden="true" />
            {review.is_verified ? "Verified Client" : "Client Review"}
          </span>
        )}
      </div>

      {/* Review Text */}
      <p className={styles.reviewText}>“{review.review_text}”</p>

      {/* Service / Department Tag */}
      {(review.service_name || review.employee_department) && (
        <div className={[styles.serviceTag, isEmp ? styles.serviceTagEmp : ""].join(" ")}>
          <Layers className={styles.serviceIcon} aria-hidden="true" />
          <span>{review.service_name || review.employee_department}</span>
        </div>
      )}

      {/* Author Info */}
      <div className={styles.customerRow}>
        {review.photo_url ? (
          <img
            src={review.photo_url}
            alt={review.customer_name}
            className={styles.avatarImg}
            loading="lazy"
            onError={(e) => {
              // Gracefully switch to initials fallback if image fails
              (e.currentTarget as HTMLElement).style.display = "none";
              const fallback = (e.currentTarget as HTMLElement).nextElementSibling;
              if (fallback) (fallback as HTMLElement).style.display = "flex";
            }}
          />
        ) : null}

        <div
          className={[styles.avatarFallback, isEmp ? styles.avatarEmployee : ""].join(" ")}
          style={{ display: review.photo_url ? "none" : "flex" }}
          aria-hidden="true"
        >
          {initials}
        </div>

        <div className={styles.customerMeta}>
          <p className={styles.customerName}>{review.customer_name}</p>
          {review.role_or_title ? (
            <p className={styles.customerRole}>{review.role_or_title}</p>
          ) : review.customer_location ? (
            <p className={styles.customerLoc}>
              <MapPin className={styles.locIcon} aria-hidden="true" />
              {review.customer_location}
            </p>
          ) : (
            <p className={styles.customerLoc}>
              {isEmp ? "DIMISI Technologies" : "Verified Partner"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function LiveReviewsMotion() {
  // Fetch dynamic reviews from the exact single source of truth used across the platform
  const {
    data: serverPayload,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["livePublicReviews"],
    queryFn: () => getPublicReviews({ data: { pageSize: 32, sort: "newest" } }),
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 25, // Auto-sync in real time with Admin Panel
    refetchOnWindowFocus: true,
  });

  // Extract deduplicated list prioritizing featured reviews
  const activeReviews = useMemo(() => {
    const list: PublicReview[] = [];
    const seenIds = new Set<string>();

    if (serverPayload?.featured) {
      for (const item of serverPayload.featured) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          list.push(item);
        }
      }
    }

    if (serverPayload?.reviews) {
      for (const item of serverPayload.reviews) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          list.push(item);
        }
      }
    }

    return list;
  }, [serverPayload]);

  // Split into 2 rows for opposite motion loops
  const { track1, track2 } = useMemo(() => {
    if (!activeReviews.length) {
      return { track1: [], track2: [] };
    }

    const half = Math.ceil(activeReviews.length / 2);
    const row1 = activeReviews.slice(0, half);
    const row2 =
      activeReviews.slice(half).length > 0 ? activeReviews.slice(half) : activeReviews.slice(0, half);

    // Duplicate for seamless 360 loop animation
    return {
      track1: [...row1, ...row1, ...row1],
      track2: [...row2, ...row2, ...row2],
    };
  }, [activeReviews]);

  const totalReviewsCount =
    serverPayload?.stats?.total || serverPayload?.totalApproved || activeReviews.length;
  const avgScore = serverPayload?.stats?.average
    ? serverPayload.stats.average.toFixed(1)
    : "5.0";

  return (
    <section className={styles.section} id="live-reviews" aria-label="Customer & Staff Reviews">
      {/* Background ambient glow */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <Reveal variant="fade">
            <div className={styles.badgeWrap}>
              <span className={styles.pulseDot} aria-hidden="true" />
              <span className={styles.badgeText}>Live Verified Reviews · Real-Time Feed</span>
            </div>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <h2 className={styles.title}>
              What People Say <span className={styles.gradientTitle}>About DIMISI</span>
            </h2>
          </Reveal>

          <Reveal variant="up" delay={140}>
            <p className={styles.subtitle}>
              Unfiltered endorsements from founders, CTOs, and the engineers building DIMISI from within.
              Synchronized dynamically with our verified reviews system in real time.
            </p>
          </Reveal>

          {/* Quick Metrics Bar */}
          {!isLoading && !isError && activeReviews.length > 0 && (
            <Reveal variant="up" delay={180}>
              <div className={styles.metricsBar}>
                <div className={styles.metricItem}>
                  <span className={styles.metricNumber}>{avgScore} / 5.0</span>
                  <span className={styles.metricLabel}>Average Rating</span>
                </div>
                <div className={styles.metricDivider} aria-hidden="true" />
                <div className={styles.metricItem}>
                  <span className={styles.metricNumber}>{totalReviewsCount}+</span>
                  <span className={styles.metricLabel}>Verified Endorsements</span>
                </div>
                <div className={styles.metricDivider} aria-hidden="true" />
                <div className={styles.metricItem}>
                  <span className={styles.metricNumber}>100%</span>
                  <span className={styles.metricLabel}>Published With Consent</span>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* 1. Loading State */}
      {isLoading && (
        <div className={styles.marqueeWrap}>
          <div className={styles.marqueeTrack}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        </div>
      )}

      {/* 2. Error Fallback State */}
      {!isLoading && isError && (
        <div className={styles.container}>
          <div className={styles.stateBox}>
            <AlertTriangle size={36} className={styles.stateIcon} />
            <h3 className={styles.stateTitle}>Unable to load live reviews right now.</h3>
            <p className={styles.stateText}>
              Real-time synchronization encountered a transient issue. The rest of the page remains functional.
            </p>
            <button
              type="button"
              className={styles.retryBtn}
              onClick={() => refetch()}
              aria-label="Retry loading reviews"
            >
              <RefreshCw size={15} />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Empty State */}
      {!isLoading && !isError && activeReviews.length === 0 && (
        <div className={styles.container}>
          <div className={styles.stateBox}>
            <Sparkles size={36} className={styles.stateIcon} />
            <h3 className={styles.stateTitle}>No verified reviews yet.</h3>
            <p className={styles.stateText}>
              Be the first client or team member to share your experience with DIMISI Technologies.
            </p>
            <MagneticButton to="/review">Leave a Review</MagneticButton>
          </div>
        </div>
      )}

      {/* 4. Live Dynamic Scrolling Marquees */}
      {!isLoading && !isError && activeReviews.length > 0 && (
        <>
          {/* Infinite Motion Loop 1 (Left Scrolling) */}
          <div className={styles.marqueeWrap}>
            <div className={styles.marqueeTrack}>
              {track1.map((rev, idx) => (
                <ReviewCard key={`t1-${rev.id}-${idx}`} review={rev} />
              ))}
            </div>
          </div>

          {/* Infinite Motion Loop 2 (Right Scrolling - Opposite Direction) */}
          <div className={[styles.marqueeWrap, styles.marqueeWrapReverse].join(" ")}>
            <div className={[styles.marqueeTrack, styles.trackReverse].join(" ")}>
              {track2.map((rev, idx) => (
                <ReviewCard key={`t2-${rev.id}-${idx}`} review={rev} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Bottom Action Row */}
      <div className={styles.container}>
        <Reveal variant="up" delay={120}>
          <div className={styles.actionRow}>
            <MagneticButton to="/reviews">
              <span>Read all verified reviews</span>
              <ArrowUpRight className={styles.btnArrow} aria-hidden="true" />
            </MagneticButton>
            <MagneticButton to="/review" variant="ghost">
              <MessageSquarePlus className={styles.btnIcon} aria-hidden="true" />
              <span>Leave a review for DIMISI</span>
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
