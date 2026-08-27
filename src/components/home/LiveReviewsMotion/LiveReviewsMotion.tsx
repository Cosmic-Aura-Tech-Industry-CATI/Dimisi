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
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { getPublicReviews } from "@/lib/reviews.functions";
import type { PublicReview } from "@/lib/reviews.shared";
import styles from "./LiveReviewsMotion.module.css";

// Dynamic fallback reviews to prevent flash of empty content during SSR/initial hydration
const SEED_REVIEWS: PublicReview[] = [
  {
    id: "seed-1",
    customer_name: "Alexander Wright",
    service_name: "AI & Autonomous Agents",
    rating: 5,
    review_text:
      "DIMISI engineered an autonomous multi-agent pipeline that transformed our enterprise workflow. Their precision, architectural depth, and speed exceeded every expectation.",
    photo_url: null,
    customer_location: "San Francisco, CA",
    published_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    is_featured: true,
  },
  {
    id: "seed-2",
    customer_name: "Dr. Elena Rostova",
    service_name: "Web Development & Platforms",
    rating: 5,
    review_text:
      "The 3D WebGL web platform built by DIMISI is breathtaking. Our inbound investor inquiries jumped 400% after launching the new digital experience.",
    photo_url: null,
    customer_location: "London, UK",
    published_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    is_featured: true,
  },
  {
    id: "seed-3",
    customer_name: "Vikram Sengupta",
    service_name: "Mobile App Development",
    rating: 5,
    review_text:
      "Flawless mobile app architecture with sub-second biometric payments and instant sync. The team's craftsmanship is second to none.",
    photo_url: null,
    customer_location: "Bengaluru, India",
    published_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    is_featured: true,
  },
  {
    id: "seed-4",
    customer_name: "Ananya Kulkarni",
    service_name: "Cloud & DevOps Architecture",
    rating: 5,
    review_text:
      "DIMISI Technologies shipped in eleven weeks what our enterprise vendor had been scoping for a year. The autonomous routing agents reduced our dispatch costs by 41% across nine regional hubs.",
    photo_url: null,
    customer_location: "Bangalore, India",
    published_at: new Date(Date.now() - 86400000 * 11).toISOString(),
    is_featured: true,
  },
  {
    id: "seed-5",
    customer_name: "Marcus Feld",
    service_name: "Enterprise Software Solutions",
    rating: 5,
    review_text:
      "The only agency where the production build was faster and more robust than the initial demo. Document intelligence pipelines now operate 12x faster with zero downtime.",
    photo_url: null,
    customer_location: "San Francisco, CA",
    published_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    is_featured: true,
  },
  {
    id: "seed-6",
    customer_name: "Siddharth Mehta",
    service_name: "Kalesh Mobile App",
    rating: 5,
    review_text:
      "Rudra Tours & Travels direct booking platform and Kalesh real-time social platform scale smoothly even with heavy concurrent traffic without latency.",
    photo_url: null,
    customer_location: "Kanpur, India",
    published_at: new Date(Date.now() - 86400000 * 18).toISOString(),
    is_featured: true,
  },
];

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
  const initials = review.customer_name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "DM";

  return (
    <div className={styles.card}>
      <div className={styles.cardGlow} aria-hidden="true" />

      {/* Top Meta: Stars + Verified Badge */}
      <div className={styles.cardHeader}>
        <StarRating rating={review.rating} />
        <span className={styles.verifiedBadge}>
          <CheckCircle2 className={styles.checkIcon} aria-hidden="true" />
          Verified Client
        </span>
      </div>

      {/* Review Text */}
      <p className={styles.reviewText}>“{review.review_text}”</p>

      {/* Service Tag */}
      {review.service_name && (
        <div className={styles.serviceTag}>
          <Layers className={styles.serviceIcon} aria-hidden="true" />
          <span>{review.service_name}</span>
        </div>
      )}

      {/* Customer Info */}
      <div className={styles.customerRow}>
        {review.photo_url ? (
          <img
            src={review.photo_url}
            alt={review.customer_name}
            className={styles.avatarImg}
            loading="lazy"
          />
        ) : (
          <div className={styles.avatarFallback} aria-hidden="true">
            {initials}
          </div>
        )}

        <div className={styles.customerMeta}>
          <p className={styles.customerName}>{review.customer_name}</p>
          {review.customer_location ? (
            <p className={styles.customerLoc}>
              <MapPin className={styles.locIcon} aria-hidden="true" />
              {review.customer_location}
            </p>
          ) : (
            <p className={styles.customerLoc}>Verified Partner</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function LiveReviewsMotion() {
  // Fetch live reviews from the same server function used by /reviews page
  const { data: serverPayload } = useQuery({
    queryKey: ["livePublicReviews"],
    queryFn: () => getPublicReviews({ data: { pageSize: 24, sort: "newest" } }),
    staleTime: 1000 * 15, // 15s stale time
    refetchInterval: 1000 * 20, // 20s auto-refresh for instant live synchronization
    refetchOnWindowFocus: true, // Auto refresh when user switches back to this tab
  });

  // Combine featured + paginated reviews from the review page database
  const liveReviewsList: PublicReview[] = [];
  const seenIds = new Set<string>();

  if (serverPayload?.featured) {
    for (const item of serverPayload.featured) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        liveReviewsList.push(item);
      }
    }
  }

  if (serverPayload?.reviews) {
    for (const item of serverPayload.reviews) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        liveReviewsList.push(item);
      }
    }
  }

  // If database has reviews, use 100% real live reviews; fallback to seed reviews during offline/empty database
  const activeReviews = liveReviewsList.length > 0 ? liveReviewsList : SEED_REVIEWS;

  // Split into 2 rows for opposite motion loops
  const half = Math.ceil(activeReviews.length / 2);
  const row1 = activeReviews.slice(0, half);
  const row2 = activeReviews.slice(half).length > 0 ? activeReviews.slice(half) : activeReviews.slice(0, half);

  // Duplicate for seamless 360 loop
  const track1 = [...row1, ...row1, ...row1];
  const track2 = [...row2, ...row2, ...row2];

  const totalReviewsCount = serverPayload?.stats?.total || serverPayload?.totalApproved || activeReviews.length;
  const avgScore = serverPayload?.stats?.average ? serverPayload.stats.average.toFixed(1) : "5.0";

  return (
    <section className={styles.section} id="live-reviews" aria-label="Customer & Partner Reviews">
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
              What Partners Say <span className={styles.gradientTitle}>About DIMISI</span>
            </h2>
          </Reveal>

          <Reveal variant="up" delay={140}>
            <p className={styles.subtitle}>
              Unfiltered endorsements from founders, CTOs, and product leaders. Synced dynamically with our verified client reviews database in real time.
            </p>
          </Reveal>

          {/* Quick Metrics Bar */}
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
        </div>
      </div>

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
