import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowUpRight,
  Filter,
  Image as ImageIcon,
  CheckCircle2,
  Users,
  ChevronRight,
  ChevronLeft,
  X,
  Layers,
  Send,
  Flame,
  Radio,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { getPublicEvents } from "@/lib/events.functions";
import {
  type CompanyEvent,
  type EventGalleryItem,
  type EventStatus,
  EVENT_STATUSES,
} from "@/lib/events.shared";
import pageStyles from "@/styles/page.module.css";
import styles from "./EventsPage.module.css";

export function EventsPage() {
  // Real-time dynamic query for events and gallery
  const { data: payload, isLoading } = useQuery({
    queryKey: ["publicEvents"],
    queryFn: () => getPublicEvents(),
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 25, // Live synchronization with Admin Panel
  });

  const events = payload?.events || [];
  const featured = payload?.featuredEvent || events[0] || null;
  const galleryItems = payload?.galleryItems || [];
  const stats = payload?.stats || {
    totalEvents: 4,
    upcomingCount: 2,
    completedCount: 2,
    totalGalleryPhotos: 8,
    attendeesServed: 2300,
  };

  // State
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [galleryFilter, setGalleryFilter] = useState<string>("All");

  // Interactive Modals
  const [activeModalEvent, setActiveModalEvent] = useState<CompanyEvent | null>(null);
  const [activeLightboxItem, setActiveLightboxItem] = useState<EventGalleryItem | null>(null);
  const [activeModalImageIdx, setActiveModalImageIdx] = useState(0);

  // Keyboard accessibility for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModalEvent(null);
        setActiveLightboxItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchStatus = statusFilter === "All" || ev.status === statusFilter;
      const matchCategory = categoryFilter === "All" || ev.category === categoryFilter;
      return matchStatus && matchCategory;
    });
  }, [events, statusFilter, categoryFilter]);

  // Filtered Gallery Items
  const filteredGallery = useMemo(() => {
    return galleryItems.filter((g) => {
      if (galleryFilter === "All") return true;
      return g.category === galleryFilter || g.event_title === galleryFilter;
    });
  }, [galleryItems, galleryFilter]);

  const galleryCategories = useMemo(() => {
    const cats = new Set<string>(["All"]);
    galleryItems.forEach((g) => {
      if (g.category) cats.add(g.category);
    });
    return Array.from(cats);
  }, [galleryItems]);

  return (
    <div className={pageStyles.page}>
      {/* 1. CINEMATIC HERO SECTION */}
      <section className={styles.heroSection} aria-label="Events and Gallery Hero">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContainer}>
          <Reveal variant="fade">
            <div className={styles.heroBadge}>
              <span className={styles.livePulse} aria-hidden="true" />
              <span className={styles.badgeText}>DIMISI Orbit · Events & Visual Archive</span>
            </div>
          </Reveal>

          <Reveal variant="up" delay={60}>
            <h1 className={styles.heroTitle}>
              Where Deep Tech Meets <span className={styles.gradientText}>Live Resonance</span>
            </h1>
          </Reveal>

          <Reveal variant="up" delay={120}>
            <p className={styles.heroSubtitle}>
              Experience our product keynotes, research summits, hackathons, and creative visual plates.
              Explore our journey shaping high-concurrency platforms and autonomous intelligence.
            </p>
          </Reveal>

          {/* Quick Metrics Strip */}
          <Reveal variant="up" delay={160}>
            <div className={styles.metricsBar}>
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.upcomingCount}</span>
                <span className={styles.metricLabel}>Upcoming Summits</span>
              </div>
              <div className={styles.metricDivider} aria-hidden="true" />
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.totalEvents}</span>
                <span className={styles.metricLabel}>Total Events</span>
              </div>
              <div className={styles.metricDivider} aria-hidden="true" />
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.attendeesServed.toLocaleString()}+</span>
                <span className={styles.metricLabel}>Global Attendees</span>
              </div>
              <div className={styles.metricDivider} aria-hidden="true" />
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.totalGalleryPhotos}</span>
                <span className={styles.metricLabel}>Visual Plates</span>
              </div>
            </div>
          </Reveal>

          {/* Quick Nav Anchors */}
          <Reveal variant="up" delay={200}>
            <div className={styles.heroActions}>
              <a href="#featured-event" className={styles.anchorPrimary}>
                <span>Featured Showcase</span>
                <ChevronRight className={styles.btnIcon} />
              </a>
              <a href="#events-grid" className={styles.anchorSecondary}>
                <Calendar className={styles.btnIcon} />
                <span>Browse All Events</span>
              </a>
              <a href="#gallery-section" className={styles.anchorSecondary}>
                <ImageIcon className={styles.btnIcon} />
                <span>Visual Gallery</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. FEATURED EVENT STAGE */}
      {featured && (
        <section className={styles.featuredSection} id="featured-event" aria-label="Featured Event">
          <div className={styles.sectionContainer}>
            <Reveal variant="fade">
              <div className={styles.sectionEyebrow}>
                <Sparkles className={styles.amberSparkle} />
                <span>Spotlight Keynote</span>
              </div>
            </Reveal>

            <Reveal variant="up" delay={80}>
              <div className={styles.featuredStage}>
                <div className={styles.featuredImageCol}>
                  <img
                    src={featured.cover_image}
                    alt={featured.title}
                    className={styles.featuredImg}
                  />
                  <div className={styles.featuredImgOverlay} />
                  <div className={styles.featuredStatusTag}>
                    <span className={styles.statusDot} />
                    {featured.status === "upcoming" ? "Upcoming Spotlight" : "Live Feature"}
                  </div>
                </div>

                <div className={styles.featuredContentCol}>
                  <div className={styles.featuredMetaRow}>
                    <span className={styles.categoryBadge}>{featured.category}</span>
                    <span className={styles.dateText}>
                      <Calendar className={styles.inlineIcon} /> {featured.date}
                    </span>
                  </div>

                  <h2 className={styles.featuredTitle}>{featured.title}</h2>

                  <p className={styles.featuredLoc}>
                    <MapPin className={styles.inlineIcon} /> {featured.location}
                  </p>

                  <p className={styles.featuredDesc}>{featured.description}</p>

                  {featured.highlights && featured.highlights.length > 0 && (
                    <div className={styles.highlightsBox}>
                      <h4 className={styles.hlHeader}>Keynote Highlights</h4>
                      <ul className={styles.hlList}>
                        {featured.highlights.slice(0, 3).map((hl, i) => (
                          <li key={i}>
                            <CheckCircle2 className={styles.checkIcon} />
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className={styles.featuredActionRow}>
                    <button
                      type="button"
                      className={styles.viewBriefingBtn}
                      onClick={() => {
                        setActiveModalEvent(featured);
                        setActiveModalImageIdx(0);
                      }}
                    >
                      <span>Explore Full Event Briefing</span>
                      <ArrowUpRight className={styles.btnIcon} />
                    </button>

                    {featured.registration_url && (
                      <MagneticButton to={featured.registration_url} variant="ghost">
                        RSVP / Attend Keynote
                      </MagneticButton>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* 3. ALL EVENTS GRID & FILTERS */}
      <section className={styles.eventsGridSection} id="events-grid" aria-label="Company Events">
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.sectionEyebrow}>
                <Calendar className={styles.amberSparkle} />
                <span>All Company Events</span>
              </div>
            </Reveal>
            <Reveal variant="up" delay={60}>
              <h2 className={styles.sectionTitle}>
                Keynotes, Hackathons & <span className={styles.gradientText}>Team Gatherings</span>
              </h2>
            </Reveal>
            <Reveal variant="up" delay={100}>
              <p className={styles.sectionSub}>
                Filter by schedule status or event format to discover our public and invite-only sessions.
              </p>
            </Reveal>
          </div>

          {/* Filters Bar */}
          <div className={styles.filterToolbar}>
            <div className={styles.statusTabs}>
              {["All", "upcoming", "ongoing", "completed"].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={[
                    styles.statusTabBtn,
                    statusFilter === st ? styles.statusTabBtnActive : "",
                  ].join(" ")}
                  onClick={() => setStatusFilter(st)}
                >
                  {st === "All"
                    ? "All Events"
                    : st === "upcoming"
                      ? "Upcoming"
                      : st === "ongoing"
                        ? "Live Now"
                        : "Concluded"}
                </button>
              ))}
            </div>

            {/* Category Pills */}
            <div className={styles.categoryPills}>
              {[
                "All",
                "Product Launch",
                "Tech Summit",
                "Hackathon",
                "Team Retreat",
              ].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={[
                    styles.catPill,
                    categoryFilter === cat ? styles.catPillActive : "",
                  ].join(" ")}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className={styles.cardsGrid}>
            {filteredEvents.map((ev, index) => (
              <Reveal key={ev.id} delay={index * 60} className={styles.gridItem}>
                <TiltCard className={styles.eventCard}>
                  <div className={styles.cardImageHolder}>
                    <img src={ev.cover_image} alt={ev.title} className={styles.cardImg} />
                    <div className={styles.cardGlow} aria-hidden="true" />
                    <span
                      className={styles.statusChip}
                      style={{
                        background:
                          ev.status === "ongoing"
                            ? "rgba(16, 185, 129, 0.25)"
                            : ev.status === "upcoming"
                              ? "rgba(255, 179, 0, 0.25)"
                              : "rgba(255, 255, 255, 0.12)",
                        borderColor:
                          ev.status === "ongoing"
                            ? "#10b981"
                            : ev.status === "upcoming"
                              ? "var(--dm-amber, #ffb300)"
                              : "rgba(255, 255, 255, 0.3)",
                        color:
                          ev.status === "ongoing"
                            ? "#10b981"
                            : ev.status === "upcoming"
                              ? "var(--dm-amber, #ffb300)"
                              : "rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      {ev.status.toUpperCase()}
                    </span>

                    <span className={styles.photoCount}>
                      <ImageIcon className={styles.miniIcon} /> {ev.images?.length || 1}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardTopMeta}>
                      <span className={styles.cardCat}>{ev.category}</span>
                      <span className={styles.cardDate}>
                        <Calendar className={styles.miniIcon} /> {ev.date}
                      </span>
                    </div>

                    <h3 className={styles.cardTitle}>{ev.title}</h3>

                    <p className={styles.cardLocation}>
                      <MapPin className={styles.miniIcon} /> {ev.location}
                    </p>

                    <p className={styles.cardDesc}>{ev.description}</p>

                    <div className={styles.cardBottom}>
                      <button
                        type="button"
                        className={styles.exploreBtn}
                        onClick={() => {
                          setActiveModalEvent(ev);
                          setActiveModalImageIdx(0);
                        }}
                      >
                        <span>View Details</span>
                        <ArrowUpRight className={styles.arrowIcon} />
                      </button>

                      {ev.attendees_count && (
                        <span className={styles.attendeesTag}>
                          <Users className={styles.miniIcon} /> {ev.attendees_count}+
                        </span>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className={styles.emptyState}>
              <p>No events found matching the selected filter criteria.</p>
              <button
                type="button"
                className={styles.resetFilterBtn}
                onClick={() => {
                  setStatusFilter("All");
                  setCategoryFilter("All");
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. VISUAL GALLERY & MASONRY */}
      <section className={styles.gallerySection} id="gallery-section" aria-label="Visual Gallery">
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.sectionEyebrow}>
                <ImageIcon className={styles.amberSparkle} />
                <span>Visual Studio Archive</span>
              </div>
            </Reveal>
            <Reveal variant="up" delay={60}>
              <h2 className={styles.sectionTitle}>
                Plates, Shaders & <span className={styles.gradientText}>Event Frames</span>
              </h2>
            </Reveal>
            <Reveal variant="up" delay={100}>
              <p className={styles.sectionSub}>
                Curated imagery from our live summits, lighting studies, and interface engineering. Click any frame for high-resolution inspection.
              </p>
            </Reveal>
          </div>

          {/* Gallery Category Filter */}
          <div className={styles.galleryFilterRow}>
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={[
                  styles.galleryFilterBtn,
                  galleryFilter === cat ? styles.galleryFilterBtnActive : "",
                ].join(" ")}
                onClick={() => setGalleryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry / Responsive Grid */}
          <div className={styles.mosaicGrid}>
            {filteredGallery.map((item, idx) => (
              <Reveal
                key={item.id}
                delay={idx * 50}
                className={[
                  styles.mosaicItem,
                  item.aspect_ratio === "tall"
                    ? styles.spanTall
                    : item.aspect_ratio === "wide"
                      ? styles.spanWide
                      : "",
                ].join(" ")}
              >
                <button
                  type="button"
                  className={styles.mosaicFrame}
                  onClick={() => setActiveLightboxItem(item)}
                  aria-label={`Open visual plate ${item.title}`}
                >
                  <img src={item.image_url} alt={item.title} className={styles.mosaicImg} />
                  <div className={styles.mosaicOverlay} />
                  <div className={styles.mosaicInfo}>
                    <span className={styles.mosaicCat}>{item.category}</span>
                    {item.event_title && (
                      <span className={styles.mosaicEvent}>{item.event_title}</span>
                    )}
                    <h3 className={styles.mosaicTitle}>{item.title}</h3>
                  </div>
                  <span className={styles.expandIcon} aria-hidden="true">
                    <ArrowUpRight size={18} />
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. EVENT DETAILS FULL MODAL */}
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
              aria-label="Close event modal"
            >
              <X size={20} />
            </button>

            {/* Modal Image Carousel / Main Viewer */}
            <div className={styles.modalMediaArea}>
              <img
                src={
                  activeModalEvent.images?.[activeModalImageIdx] ||
                  activeModalEvent.cover_image
                }
                alt={activeModalEvent.title}
                className={styles.modalMainImg}
              />
              <div className={styles.modalMediaOverlay} />

              {activeModalEvent.images && activeModalEvent.images.length > 1 && (
                <div className={styles.modalThumbsRow}>
                  {activeModalEvent.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={[
                        styles.modalThumb,
                        activeModalImageIdx === idx ? styles.modalThumbActive : "",
                      ].join(" ")}
                      onClick={() => setActiveModalImageIdx(idx)}
                    >
                      <img src={img} alt="Thumbnail" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Body Details */}
            <div className={styles.modalBody}>
              <div className={styles.modalHeaderRow}>
                <span className={styles.categoryBadge}>{activeModalEvent.category}</span>
                <span
                  className={styles.statusBadge}
                  style={{
                    color:
                      activeModalEvent.status === "ongoing"
                        ? "#10b981"
                        : activeModalEvent.status === "upcoming"
                          ? "var(--dm-amber, #ffb300)"
                          : "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  ● {activeModalEvent.status.toUpperCase()}
                </span>
              </div>

              <h2 className={styles.modalTitle}>{activeModalEvent.title}</h2>

              {/* Schedule Info Grid */}
              <div className={styles.scheduleInfoGrid}>
                <div className={styles.scheduleItem}>
                  <Calendar className={styles.amberSparkle} />
                  <div>
                    <span className={styles.scheduleLabel}>Date & Timing</span>
                    <p className={styles.scheduleVal}>
                      {activeModalEvent.date}
                      {activeModalEvent.start_time ? ` · ${activeModalEvent.start_time}` : ""}
                    </p>
                  </div>
                </div>

                <div className={styles.scheduleItem}>
                  <MapPin className={styles.amberSparkle} />
                  <div>
                    <span className={styles.scheduleLabel}>Venue / Location</span>
                    <p className={styles.scheduleVal}>{activeModalEvent.location}</p>
                    {activeModalEvent.venue_details && (
                      <p className={styles.venueSub}>{activeModalEvent.venue_details}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Description & Highlights */}
              <div className={styles.briefingBlock}>
                <h3 className={styles.briefingHeading}>Event Briefing & Architecture</h3>
                <p className={styles.briefingText}>
                  {activeModalEvent.full_description || activeModalEvent.description}
                </p>
              </div>

              {activeModalEvent.highlights && activeModalEvent.highlights.length > 0 && (
                <div className={styles.modalHighlights}>
                  <h3 className={styles.briefingHeading}>Session Takeaways</h3>
                  <div className={styles.modalHlGrid}>
                    {activeModalEvent.highlights.map((hl, i) => (
                      <div key={i} className={styles.modalHlCard}>
                        <CheckCircle2 className={styles.hlIcon} />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className={styles.modalActions}>
                {activeModalEvent.registration_url ? (
                  <MagneticButton to={activeModalEvent.registration_url}>
                    <span>RSVP / Connect With Team</span>
                    <ArrowUpRight size={16} />
                  </MagneticButton>
                ) : (
                  <MagneticButton to="/contact">
                    <span>Contact Event Organizers</span>
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

      {/* 6. GALLERY LIGHTBOX VIEWER */}
      {activeLightboxItem && (
        <div
          className={styles.lightboxBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label={activeLightboxItem.title}
          onClick={() => setActiveLightboxItem(null)}
        >
          <div className={styles.lightboxViewer} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setActiveLightboxItem(null)}
              aria-label="Close image viewer"
            >
              <X size={22} />
            </button>

            <div className={styles.lightboxImgBox}>
              <img
                src={activeLightboxItem.image_url}
                alt={activeLightboxItem.title}
                className={styles.lightboxImg}
              />
            </div>

            <div className={styles.lightboxMeta}>
              <div className={styles.lightboxTagRow}>
                <span className={styles.categoryBadge}>{activeLightboxItem.category}</span>
                {activeLightboxItem.event_title && (
                  <span className={styles.lightboxEventLink}>
                    Captured from: {activeLightboxItem.event_title}
                  </span>
                )}
              </div>
              <h2 className={styles.lightboxTitle}>{activeLightboxItem.title}</h2>
              <p className={styles.lightboxCaption}>{activeLightboxItem.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
