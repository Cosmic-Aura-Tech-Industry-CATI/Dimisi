import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  X,
  Users,
  CheckCircle2,
  Maximize2,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { getPublicEvents } from "@/lib/events.functions";
import type { CompanyEvent, EventGalleryItem } from "@/lib/events.shared";
import styles from "./HomeEventsGallery.module.css";

const DEFAULT_EVENT_IMG =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";

export function HomeEventsGallery() {
  // Real-time dynamic fetch from existing single source of truth
  const {
    data: payload,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["publicEvents"],
    queryFn: () => getPublicEvents(),
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 25, // Auto-sync with Admin Panel updates
  });

  const rawEvents = payload?.events || [];
  const rawGallery = payload?.galleryItems || [];

  // Curate maximum 3 events with strict priority: Featured -> Upcoming/Ongoing -> Latest
  const { featuredEvent, sideEvents } = useMemo(() => {
    if (!rawEvents.length) {
      return { featuredEvent: null, sideEvents: [] };
    }

    const sorted = [...rawEvents].sort((a, b) => {
      // 1. Featured priority
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;

      // 2. Status priority: ongoing > upcoming > completed
      const weight: Record<string, number> = { ongoing: 0, upcoming: 1, completed: 2 };
      const diff = (weight[a.status] ?? 2) - (weight[b.status] ?? 2);
      if (diff !== 0) return diff;

      // 3. Newest first
      return new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime();
    });

    const curated = sorted.slice(0, 3);
    return {
      featuredEvent: curated[0] || null,
      sideEvents: curated.slice(1, 3),
    };
  }, [rawEvents]);

  // Curate top 4 gallery visual plates
  const curatedGallery = useMemo(() => {
    return rawGallery.slice(0, 4);
  }, [rawGallery]);

  // Modal & Lightbox state
  const [activeModalEvent, setActiveModalEvent] = useState<CompanyEvent | null>(null);
  const [activeLightboxIdx, setActiveLightboxIdx] = useState<number | null>(null);

  // Keyboard navigation & accessibility (ESC to close, Left/Right for Lightbox)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModalEvent(null);
        setActiveLightboxIdx(null);
      } else if (activeLightboxIdx !== null && curatedGallery.length > 0) {
        if (e.key === "ArrowLeft") {
          setActiveLightboxIdx((prev) =>
            prev === null ? 0 : (prev - 1 + curatedGallery.length) % curatedGallery.length,
          );
        } else if (e.key === "ArrowRight") {
          setActiveLightboxIdx((prev) =>
            prev === null ? 0 : (prev + 1) % curatedGallery.length,
          );
        }
      }
    },
    [activeLightboxIdx, curatedGallery],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const activeLightboxItem =
    activeLightboxIdx !== null ? curatedGallery[activeLightboxIdx] : null;

  return (
    <section className={styles.section} id="events-gallery" aria-label="Events & Gallery">
      {/* Background ambient lighting */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <Reveal variant="fade">
            <div className={styles.badgeWrap}>
              <span className={styles.pulseDot} aria-hidden="true" />
              <span className={styles.badgeText}>08 · EVENTS & GALLERY</span>
            </div>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <h2 className={styles.title}>
              Moments That <span className={styles.gradientTitle}>Move Us.</span>
            </h2>
          </Reveal>

          <Reveal variant="up" delay={140}>
            <p className={styles.subtitle}>
              Explore the events, launches, gatherings and visual moments that shape the DIMISI
              journey.
            </p>
          </Reveal>
        </div>

        {/* 1. Loading State */}
        {isLoading && (
          <div className={styles.skeletonLayout}>
            <div className={styles.skeletonFeatured} />
            <div className={styles.sideCardsCol}>
              <div className={styles.skeletonSide} />
              <div className={styles.skeletonSide} />
            </div>
          </div>
        )}

        {/* 2. Error Fallback State */}
        {!isLoading && isError && (
          <div className={styles.stateBox}>
            <AlertTriangle size={36} className={styles.stateIcon} />
            <h3 className={styles.stateTitle}>Unable to load events right now.</h3>
            <p className={styles.stateText}>
              Live synchronization encountered a transient issue. The rest of the platform remains fully functional.
            </p>
            <button
              type="button"
              className={styles.retryBtn}
              onClick={() => refetch()}
              aria-label="Retry loading events"
            >
              <RefreshCw size={15} />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* 3. Empty State */}
        {!isLoading && !isError && !featuredEvent && (
          <div className={styles.stateBox}>
            <Sparkles size={36} className={styles.stateIcon} />
            <h3 className={styles.stateTitle}>No events to showcase right now.</h3>
            <p className={styles.stateText}>
              Check back soon for upcoming DIMISI moments, product launches, and developer summits.
            </p>
            <MagneticButton to="/events">Explore Gallery Archive</MagneticButton>
          </div>
        )}

        {/* 4. Live Dynamic Content */}
        {!isLoading && !isError && featuredEvent && (
          <>
            {/* Top Showcase: Featured Event + 2 Supporting Cards */}
            <div className={styles.eventsLayout}>
              {/* Featured Large Card */}
              <Reveal variant="up" delay={100}>
                <article
                  className={styles.featuredCard}
                  onClick={() => setActiveModalEvent(featuredEvent)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveModalEvent(featuredEvent);
                    }
                  }}
                  aria-label={`View details for ${featuredEvent.title}`}
                >
                  <div className={styles.featuredMediaWrap}>
                    <img
                      src={featuredEvent.cover_image || DEFAULT_EVENT_IMG}
                      alt={featuredEvent.title}
                      className={styles.featuredImg}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_EVENT_IMG;
                      }}
                    />
                    <div className={styles.mediaGradientOverlay} aria-hidden="true" />
                    <div className={styles.featuredTopPills}>
                      <span
                        className={[
                          styles.statusBadge,
                          featuredEvent.status === "upcoming"
                            ? styles.statusUpcoming
                            : featuredEvent.status === "ongoing"
                              ? styles.statusOngoing
                              : styles.statusCompleted,
                        ].join(" ")}
                      >
                        <span className={styles.liveDot} />
                        {featuredEvent.status === "upcoming"
                          ? "Upcoming"
                          : featuredEvent.status === "ongoing"
                            ? "Live Now"
                            : "Concluded"}
                      </span>
                      <span className={styles.categoryTag}>{featuredEvent.category}</span>
                    </div>
                  </div>

                  <div className={styles.featuredBody}>
                    <div className={styles.metaRow}>
                      <span className={styles.metaItem}>
                        <Calendar size={14} />
                        <span>{featuredEvent.date}</span>
                      </span>
                      {featuredEvent.start_time && (
                        <span className={styles.metaItem}>
                          <Clock size={14} />
                          <span>{featuredEvent.start_time}</span>
                        </span>
                      )}
                    </div>

                    <h3 className={styles.featuredTitle}>{featuredEvent.title}</h3>

                    <div className={styles.locationRow}>
                      <MapPin size={14} />
                      <span>{featuredEvent.location}</span>
                    </div>

                    <p className={styles.featuredDesc}>{featuredEvent.description}</p>

                    {featuredEvent.highlights && featuredEvent.highlights.length > 0 && (
                      <ul className={styles.highlightsList}>
                        {featuredEvent.highlights.slice(0, 2).map((hl, i) => (
                          <li key={i} className={styles.highlightItem}>
                            <CheckCircle2 size={15} className={styles.hlIcon} />
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className={styles.cardFooter}>
                      <span className={styles.detailsAction}>
                        <span>View Details</span>
                        <ArrowUpRight size={16} />
                      </span>
                      {featuredEvent.attendees_count ? (
                        <span className={styles.attendeeTag}>
                          <Users size={13} />
                          <span>{featuredEvent.attendees_count.toLocaleString()} expected</span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </article>
              </Reveal>

              {/* 2 Supporting Side Cards */}
              <div className={styles.sideCardsCol}>
                {sideEvents.map((event, idx) => (
                  <Reveal key={event.id || event.slug} delay={180 + idx * 80}>
                    <article
                      className={styles.sideCard}
                      onClick={() => setActiveModalEvent(event)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActiveModalEvent(event);
                        }
                      }}
                      aria-label={`View details for ${event.title}`}
                    >
                      <div className={styles.sideCardTop}>
                        <img
                          src={event.cover_image || DEFAULT_EVENT_IMG}
                          alt={event.title}
                          className={styles.sideCardImg}
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DEFAULT_EVENT_IMG;
                          }}
                        />
                        <div className={styles.mediaGradientOverlay} aria-hidden="true" />
                        <div className={styles.featuredTopPills}>
                          <span
                            className={[
                              styles.statusBadge,
                              event.status === "upcoming"
                                ? styles.statusUpcoming
                                : event.status === "ongoing"
                                  ? styles.statusOngoing
                                  : styles.statusCompleted,
                            ].join(" ")}
                          >
                            <span className={styles.liveDot} />
                            {event.status === "upcoming"
                              ? "Upcoming"
                              : event.status === "ongoing"
                                ? "Live Now"
                                : "Concluded"}
                          </span>
                          <span className={styles.categoryTag}>{event.category}</span>
                        </div>
                      </div>

                      <div className={styles.sideCardBody}>
                        <div className={styles.metaRow}>
                          <span className={styles.metaItem}>
                            <Calendar size={13} />
                            <span>{event.date}</span>
                          </span>
                        </div>
                        <h4 className={styles.sideCardTitle}>{event.title}</h4>
                        <p className={styles.sideCardDesc}>{event.description}</p>
                        <div className={styles.cardFooter}>
                          <span className={styles.detailsAction}>
                            <span>View Details</span>
                            <ArrowUpRight size={15} />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Visual Moments Gallery Strip */}
            {curatedGallery.length > 0 && (
              <div className={styles.gallerySectionWrap}>
                <div className={styles.galleryHeaderRow}>
                  <div>
                    <span className={styles.galleryEyebrow}>VISUAL ARCHIVE</span>
                    <h3 className={styles.gallerySubheading}>Captured Moments & Behind the Code</h3>
                  </div>
                </div>

                <div className={styles.galleryGrid}>
                  {curatedGallery.map((item, idx) => (
                    <Reveal key={item.id} delay={idx * 70}>
                      <div
                        className={styles.galleryCard}
                        onClick={() => setActiveLightboxIdx(idx)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setActiveLightboxIdx(idx);
                          }
                        }}
                        aria-label={`View full photo: ${item.title}`}
                      >
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className={styles.galleryThumb}
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DEFAULT_EVENT_IMG;
                          }}
                        />
                        <div className={styles.galleryOverlay}>
                          <span className={styles.galleryTag}>{item.category}</span>
                          <h5 className={styles.galleryItemTitle}>{item.title}</h5>
                        </div>
                        <div className={styles.galleryZoomIcon} aria-hidden="true">
                          <Maximize2 size={14} />
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom View All CTA */}
            <Reveal variant="up" delay={240}>
              <div className={styles.actionsRow}>
                <MagneticButton to="/events">
                  <span>VIEW ALL EVENTS & GALLERY</span>
                  <ChevronRight size={18} />
                </MagneticButton>
              </div>
            </Reveal>
          </>
        )}
      </div>

      {/* 5. Event Full Details Modal */}
      {activeModalEvent && (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label={activeModalEvent.title}
          onClick={() => setActiveModalEvent(null)}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setActiveModalEvent(null)}
              aria-label="Close event details window"
            >
              <X size={18} />
            </button>

            <div className={styles.modalMediaArea}>
              <img
                src={activeModalEvent.cover_image || DEFAULT_EVENT_IMG}
                alt={activeModalEvent.title}
                className={styles.modalMainImg}
              />
              <div className={styles.mediaGradientOverlay} aria-hidden="true" />
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalHeaderRow}>
                <span className={styles.categoryTag}>{activeModalEvent.category}</span>
                <span
                  className={[
                    styles.statusBadge,
                    activeModalEvent.status === "upcoming"
                      ? styles.statusUpcoming
                      : activeModalEvent.status === "ongoing"
                        ? styles.statusOngoing
                        : styles.statusCompleted,
                  ].join(" ")}
                >
                  <span className={styles.liveDot} />
                  {activeModalEvent.status.toUpperCase()}
                </span>
              </div>

              <h2 className={styles.modalTitle}>{activeModalEvent.title}</h2>

              <div className={styles.scheduleInfoGrid}>
                <div className={styles.scheduleItem}>
                  <Calendar size={18} className={styles.hlIcon} />
                  <div>
                    <span className={styles.scheduleLabel}>Date & Time</span>
                    <p className={styles.scheduleVal}>
                      {activeModalEvent.date}
                      {activeModalEvent.start_time ? ` · ${activeModalEvent.start_time}` : ""}
                    </p>
                  </div>
                </div>

                <div className={styles.scheduleItem}>
                  <MapPin size={18} className={styles.hlIcon} />
                  <div>
                    <span className={styles.scheduleLabel}>Location / Venue</span>
                    <p className={styles.scheduleVal}>{activeModalEvent.location}</p>
                  </div>
                </div>
              </div>

              <p className={styles.briefingText}>
                {activeModalEvent.full_description || activeModalEvent.description}
              </p>

              {activeModalEvent.highlights && activeModalEvent.highlights.length > 0 && (
                <ul className={styles.highlightsList}>
                  {activeModalEvent.highlights.map((hl, i) => (
                    <li key={i} className={styles.highlightItem}>
                      <CheckCircle2 size={16} className={styles.hlIcon} />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className={styles.modalActions}>
                {activeModalEvent.registration_url ? (
                  <MagneticButton to={activeModalEvent.registration_url}>
                    <span>RSVP / Connect With Team</span>
                    <ArrowUpRight size={16} />
                  </MagneticButton>
                ) : (
                  <MagneticButton to="/events">
                    <span>Explore in Events Hub</span>
                    <ArrowUpRight size={16} />
                  </MagneticButton>
                )}
                <button
                  type="button"
                  className={styles.modalSecondaryBtn}
                  onClick={() => setActiveModalEvent(null)}
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Gallery Lightbox Viewer */}
      {activeLightboxItem && (
        <div
          className={styles.lightboxBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label={activeLightboxItem.title}
          onClick={() => setActiveLightboxIdx(null)}
        >
          <div className={styles.lightboxViewer} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setActiveLightboxIdx(null)}
              aria-label="Close image viewer"
            >
              <X size={18} />
            </button>

            <div className={styles.lightboxImgBox}>
              <img
                src={activeLightboxItem.image_url}
                alt={activeLightboxItem.title}
                className={styles.lightboxImg}
              />

              {curatedGallery.length > 1 && (
                <>
                  <button
                    type="button"
                    className={[styles.lightboxNavBtn, styles.lightboxPrev].join(" ")}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLightboxIdx(
                        (activeLightboxIdx! - 1 + curatedGallery.length) % curatedGallery.length,
                      );
                    }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    className={[styles.lightboxNavBtn, styles.lightboxNext].join(" ")}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLightboxIdx((activeLightboxIdx! + 1) % curatedGallery.length);
                    }}
                    aria-label="Next image"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            <div className={styles.lightboxMeta}>
              <div className={styles.lightboxInfoCol}>
                <span className={styles.categoryTag}>{activeLightboxItem.category}</span>
                <h3 className={styles.lightboxTitle}>{activeLightboxItem.title}</h3>
                {activeLightboxItem.caption && (
                  <p className={styles.lightboxCaption}>{activeLightboxItem.caption}</p>
                )}
              </div>
              {curatedGallery.length > 1 && (
                <span className={styles.lightboxCounter}>
                  {activeLightboxIdx! + 1} / {curatedGallery.length}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
