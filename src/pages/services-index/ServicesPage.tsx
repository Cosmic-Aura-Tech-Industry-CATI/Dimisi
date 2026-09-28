import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Zap,
  Target,
  Clock,
  ExternalLink,
  Code2,
  AlertTriangle,
  RefreshCw,
  Search,
  FolderKanban,
  Tag,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { getPublicServicesData } from "@/lib/services.functions";
import { DEFAULT_SERVICE_FALLBACK_IMAGE } from "@/services/service.service";
import type { CompanyService, ServiceCategoryItem } from "@/lib/services.shared";
import pageStyles from "@/styles/page.module.css";
import styles from "./ServicesPage.module.css";

const WHY_DIMISI_POINTS = [
  {
    icon: Target,
    title: "Product Thinking",
    text: "We build like product owners — obsessed with business outcomes, user retention, and high ROI.",
  },
  {
    icon: Zap,
    title: "Startup-Friendly Velocity",
    text: "Lean, fast-paced two-week sprint cycles delivering working software from day zero.",
  },
  {
    icon: ShieldCheck,
    title: "Scalable Architecture",
    text: "Systems engineered with zero tech debt to scale smoothly from user #1 to user #1,000,000.",
  },
  {
    icon: Clock,
    title: "Long-Term SLA Support",
    text: "We stay in your corner post-launch with 24/7 monitoring, security patches, and continuous tuning.",
  },
];

export function ServicesPage() {
  // Live dynamic query synced with DIMISI Admin Panel & Express Backend API
  const {
    data: payload,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["publicServices"],
    queryFn: () => getPublicServicesData(),
  });

  const services: CompanyService[] = useMemo(() => payload?.services || [], [payload?.services]);
  const categoryItems: ServiceCategoryItem[] = useMemo(() => payload?.categoryItems || [], [payload?.categoryItems]);

  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dedicated Featured Services array for the top Featured Spotlight section
  const featuredServices = useMemo(() => {
    return services
      .filter((s) => s.is_active && s.is_featured)
      .sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999));
  }, [services]);

  const featuredCount = featuredServices.length;

  // Calculate service counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    services.forEach((s) => {
      const cat = s.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
      counts[cat.toLowerCase()] = (counts[cat.toLowerCase()] || 0) + 1;
      if (s.category_id) {
        counts[s.category_id] = (counts[s.category_id] || 0) + 1;
        counts[s.category_id.toLowerCase()] = (counts[s.category_id.toLowerCase()] || 0) + 1;
      }
    });
    return counts;
  }, [services]);

  // Filter services by selected category and search input, with priority sorting for featured
  const filteredServices = useMemo(() => {
    const list = services.filter((service) => {
      // 1. Category Filter (supports 'featured', 'all', or specific category)
      if (selectedCat === "featured") {
        if (!service.is_featured) return false;
      } else if (selectedCat !== "all") {
        const catNameLower = service.category?.toLowerCase() || "";
        const targetLower = selectedCat.toLowerCase();
        const catId = service.category_id;
        const matchesCategory =
          catNameLower === targetLower ||
          service.category === selectedCat ||
          catId === selectedCat ||
          (catId && catId.toLowerCase() === targetLower);
        if (!matchesCategory) {
          return false;
        }
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = service.title?.toLowerCase().includes(query);
        const taglineMatch = service.tagline?.toLowerCase().includes(query);
        const summaryMatch = service.summary?.toLowerCase().includes(query);
        const featureMatch = service.features?.some((f) => f.toLowerCase().includes(query));
        const techMatch = service.tech_stack?.some((t) => t.toLowerCase().includes(query));
        return titleMatch || taglineMatch || summaryMatch || featureMatch || techMatch;
      }

      return true;
    });

    // 3. Priority Sort: Featured services first, then by order_index
    return [...list].sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return (a.order_index ?? 999) - (b.order_index ?? 999);
    });
  }, [services, selectedCat, searchQuery]);

  const stats = payload?.stats || {
    totalServices: services.length,
    totalCategories: categoryItems.length,
    uptimeSla: "99.99%",
    satisfactionScore: "4.9/5",
  };

  const handleSelectCategory = (catNameOrId: string) => {
    setSelectedCat(catNameOrId);
    const targetElement = document.getElementById("services-roster");
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={pageStyles.page}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection} aria-label="Our Services Hero">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContainer}>
          <Reveal variant="fade">
            <div className={styles.heroBadge}>
              <span className={styles.pulseDot} aria-hidden="true" />
              <span className={styles.badgeText}>Our Services</span>
            </div>
          </Reveal>

          <Reveal variant="up" delay={60}>
            <h1 className={styles.heroTitle}>
              Solutions Built for <span className={styles.gradientText}>Business Growth</span>
            </h1>
          </Reveal>

          <Reveal variant="up" delay={120}>
            <p className={styles.heroSubtitle}>
              We deliver tailored digital solutions, intelligent workflows, and scalable architectures
              engineered for high performance and real-world business needs.
            </p>
          </Reveal>

          {/* Quick Metrics Bar */}
          <Reveal variant="up" delay={160}>
            <div className={styles.metricsBar}>
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.totalServices || services.length}+</span>
                <span className={styles.metricLabel}>Core Disciplines</span>
              </div>
              <div className={styles.metricDivider} aria-hidden="true" />
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.totalCategories || categoryItems.length}+</span>
                <span className={styles.metricLabel}>Service Categories</span>
              </div>
              <div className={styles.metricDivider} aria-hidden="true" />
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.uptimeSla}</span>
                <span className={styles.metricLabel}>Platform SLA</span>
              </div>
              <div className={styles.metricDivider} aria-hidden="true" />
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>100%</span>
                <span className={styles.metricLabel}>Outcome-Driven</span>
              </div>
            </div>
          </Reveal>

          {/* Hero CTAs */}
          <Reveal variant="up" delay={200}>
            <div className={styles.heroActions}>
              <MagneticButton to="/contact">
                <span>Discuss Your Business Requirements</span>
                <ArrowUpRight size={18} />
              </MagneticButton>

              {featuredServices.length > 0 && (
                <a href="#featured-spotlight" className={styles.secondaryAnchor}>
                  <span>⭐ Featured Capabilities ({featuredServices.length})</span>
                  <ChevronRight size={16} />
                </a>
              )}

              <a href="#services-roster" className={styles.secondaryAnchor}>
                <span>Explore All Services</span>
                <ChevronRight size={16} />
              </a>

              <a href="#categories-showcase" className={styles.secondaryAnchor}>
                <span>View Service Categories</span>
                <ChevronRight size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. DEDICATED FEATURED CAPABILITIES SPOTLIGHT SECTION (ABOVE CORE CAPABILITIES) */}
      {featuredServices.length > 0 && searchQuery === "" && selectedCat === "all" && (
        <section className={styles.featuredSection} id="featured-spotlight" aria-label="Featured Capabilities Spotlight">
          <div className={styles.container}>
            <div className={styles.sectionHeaderCenter}>
              <Reveal variant="fade">
                <div className={styles.featuredEyebrow}>
                  <Sparkles size={14} className={styles.featuredAmberIcon} />
                  <span>Flagship Spotlight · Curated Disciplines</span>
                </div>
              </Reveal>
              <Reveal variant="up" delay={60}>
                <h2 className={styles.featuredSectionTitle}>
                  Featured <span className={styles.gradientText}>Engineering Capabilities</span>
                </h2>
              </Reveal>
              <Reveal variant="up" delay={100}>
                <p className={styles.sectionSub}>
                  Flagship services spotlighted by our architecture team for high velocity, proven scalability, and transformative business impact.
                </p>
              </Reveal>
            </div>

            {/* Featured Cards Spotlight Grid */}
            <div className={styles.featuredGrid}>
              {featuredServices.map((service, index) => (
                <Reveal key={`featured-${service.id}`} delay={index * 50} className={styles.featuredCol}>
                  <TiltCard className={styles.featuredSpotlightCard}>
                    <div className={styles.spotlightCardGlow} aria-hidden="true" />

                    {/* Media Header */}
                    <div className={styles.spotlightMediaHolder}>
                      <img
                        src={service.hero_image || DEFAULT_SERVICE_FALLBACK_IMAGE}
                        alt={service.title}
                        className={styles.spotlightImg}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.src !== DEFAULT_SERVICE_FALLBACK_IMAGE) {
                            target.src = DEFAULT_SERVICE_FALLBACK_IMAGE;
                          }
                        }}
                      />
                      <div className={styles.spotlightImgOverlay} />
                      <div className={styles.cardBadgeCluster}>
                        <span className={styles.cardCatBadge}>{service.category}</span>
                        <span className={styles.cardFeaturedBadge}>
                          <Sparkles size={11} className={styles.featuredStarIcon} />
                          <span>Featured Spotlight</span>
                        </span>
                      </div>
                      <span className={styles.spotlightIndexTag}>
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Spotlight Body */}
                    <div className={styles.spotlightBody}>
                      <h3 className={styles.spotlightTitle}>{service.title}</h3>
                      {service.tagline && (
                        <p className={styles.spotlightTagline}>{service.tagline}</p>
                      )}
                      <p className={styles.spotlightSummary}>{service.summary}</p>

                      {/* Key Features */}
                      {service.features && service.features.length > 0 && (
                        <ul className={styles.spotlightFeatures}>
                          {service.features.slice(0, 3).map((feat) => (
                            <li key={feat} className={styles.spotlightFeatureItem}>
                              <CheckCircle2 className={styles.spotlightCheckIcon} size={14} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Footer Actions */}
                      <div className={styles.spotlightFooter}>
                        <Link
                          to="/services/$slug"
                          params={{ slug: service.slug }}
                          className={styles.spotlightPrimaryLink}
                        >
                          <span>Explore Architecture</span>
                          <ArrowUpRight size={16} />
                        </Link>

                        <Link
                          to="/contact"
                          search={{ service: service.slug }}
                          className={styles.spotlightInquireLink}
                        >
                          <span>Inquire Now →</span>
                        </Link>
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. DYNAMIC SERVICES GRID SECTION (CORE ENGINEERING CAPABILITIES) */}
      <section className={styles.servicesSection} id="services-roster" aria-label="Core Services">
        <div className={styles.container}>
          <div className={styles.sectionHeaderCenter}>
            <Reveal variant="fade">
              <div className={styles.sectionEyebrow}>
                <Layers className={styles.amberSparkle} />
                <span>Core Engineering Capabilities</span>
              </div>
            </Reveal>
            <Reveal variant="up" delay={60}>
              <h2 className={styles.sectionTitle}>
                Tailored Services <span className={styles.gradientText}>Engineered For Impact</span>
              </h2>
            </Reveal>
            <Reveal variant="up" delay={100}>
              <p className={styles.sectionSub}>
                From rapid MVP execution to enterprise multi-cloud orchestration, explore our full spectrum
                of software, design, and intelligent automation services.
              </p>
            </Reveal>
          </div>

          {/* Interactive Filter Toolbar (All Services + Featured Only) & Quick Search */}
          {services.length > 0 && (
            <div className={styles.filterToolbar}>
              <div className={styles.categoryPillList} role="tablist" aria-label="Filter Services">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedCat === "all"}
                  className={[styles.categoryPill, selectedCat === "all" ? styles.categoryPillActive : ""].join(" ")}
                  onClick={() => setSelectedCat("all")}
                >
                  <span>All Services</span>
                  <span className={styles.categoryPillCount}>{services.length}</span>
                </button>

                {featuredCount > 0 && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedCat === "featured"}
                    className={[
                      styles.categoryPill,
                      styles.featuredCategoryPill,
                      selectedCat === "featured" ? styles.categoryPillActive : "",
                    ].join(" ")}
                    onClick={() => setSelectedCat(selectedCat === "featured" ? "all" : "featured")}
                  >
                    <Sparkles size={12} className={styles.featuredTabStar} />
                    <span>Featured</span>
                    <span className={styles.categoryPillCount}>{featuredCount}</span>
                  </button>
                )}
              </div>

              {/* Quick Search */}
              <div className={styles.searchBox}>
                <Search size={15} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search capabilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  aria-label="Search services"
                />
              </div>
            </div>
          )}

          {/* LOADING STATE SKELETONS */}
          {isLoading && (!payload || services.length === 0) && (
            <div className={styles.servicesGrid}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className={styles.gridItem}>
                  <div className={styles.skeletonCard}>
                    <div className={styles.skeletonImageHolder} />
                    <div className={styles.skeletonContent}>
                      <div className={[styles.skeletonLine, styles.skeletonTitle].join(" ")} />
                      <div className={[styles.skeletonLine, styles.skeletonTagline].join(" ")} />
                      <div className={styles.skeletonLine} style={{ width: "95%" }} />
                      <div className={styles.skeletonLine} style={{ width: "80%" }} />
                      <div className={[styles.skeletonLine, styles.skeletonPill].join(" ")} />
                      <div
                        className={[styles.skeletonLine, styles.skeletonPill].join(" ")}
                        style={{ width: "70%" }}
                      />
                    </div>
                    <div className={styles.skeletonFooter}>
                      <div className={styles.skeletonLine} style={{ width: "40%" }} />
                      <div className={styles.skeletonLine} style={{ width: "20%" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ERROR STATE */}
          {isError && services.length === 0 && (
            <div className={styles.stateBox}>
              <div className={[styles.stateIconBox, styles.stateIconError].join(" ")}>
                <AlertTriangle size={28} />
              </div>
              <h3 className={styles.stateTitle}>Unable to load services</h3>
              <p className={styles.stateText}>
                We are having trouble retrieving the live services roster right now. Please verify your connection or try again.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className={styles.retryBtn}
              >
                <RefreshCw size={16} />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!isLoading && !isError && filteredServices.length === 0 && (
            <div className={styles.stateBox}>
              <div className={styles.stateIconBox}>
                <Layers size={28} />
              </div>
              <h3 className={styles.stateTitle}>
                {searchQuery || selectedCat !== "all"
                  ? "No matching services found"
                  : "No services available at the moment"}
              </h3>
              <p className={styles.stateText}>
                {searchQuery || selectedCat !== "all"
                  ? "Try adjusting your category filter or search keywords to view other capabilities."
                  : "Our engineering disciplines are being updated. Check back shortly or discuss tailored business requirements directly with our architecture team."}
              </p>
              {searchQuery || selectedCat !== "all" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCat("all");
                    setSearchQuery("");
                  }}
                  className={styles.retryBtn}
                >
                  <RefreshCw size={15} />
                  <span>Reset All Filters</span>
                </button>
              ) : (
                <MagneticButton to="/contact">
                  <span>Discuss Custom Requirements</span>
                  <ArrowUpRight size={18} />
                </MagneticButton>
              )}
            </div>
          )}

          {/* Live Services Grid with Visual Imagery */}
          {filteredServices.length > 0 && (
            <div className={styles.servicesGrid}>
              {filteredServices.map((service, index) => (
                <Reveal key={service.id} delay={index * 40} className={styles.gridItem}>
                  <TiltCard
                    className={[
                      styles.serviceCard,
                      service.is_featured ? styles.featuredCard : "",
                    ].join(" ")}
                  >
                    {/* Card Visual Header with Image */}
                    <div className={styles.cardImageHolder}>
                      <img
                        src={service.hero_image || DEFAULT_SERVICE_FALLBACK_IMAGE}
                        alt={service.title}
                        className={styles.cardImg}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.src !== DEFAULT_SERVICE_FALLBACK_IMAGE) {
                            target.src = DEFAULT_SERVICE_FALLBACK_IMAGE;
                          }
                        }}
                      />
                      <div className={styles.cardImgOverlay} />
                      <div className={styles.cardBadgeCluster}>
                        <span className={styles.cardCatBadge}>{service.category}</span>
                        {service.is_featured && (
                          <span className={styles.cardFeaturedBadge}>
                            <Sparkles size={11} className={styles.featuredStarIcon} />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>
                      <span className={styles.cardIndexTag}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className={styles.cardContent}>
                      <h3 className={styles.serviceName}>{service.title}</h3>
                      {service.tagline && (
                        <p className={styles.serviceTagline}>{service.tagline}</p>
                      )}
                      <p className={styles.serviceDesc}>{service.summary}</p>

                      {/* Feature / Deliverable Pills */}
                      {service.features && service.features.length > 0 && (
                        <ul className={styles.featuresList}>
                          {service.features.slice(0, 4).map((feat) => (
                            <li key={feat} className={styles.featureItem}>
                              <CheckCircle2 className={styles.checkIcon} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className={styles.cardFooter}>
                      <Link
                        to="/services/$slug"
                        params={{ slug: service.slug }}
                        className={styles.serviceLink}
                      >
                        <span>View Full Service Details</span>
                        <ArrowUpRight className={styles.linkArrow} />
                      </Link>

                      <Link
                        to="/contact"
                        search={{ service: service.slug }}
                        className={styles.inquireLink}
                      >
                        Inquire →
                      </Link>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. WHY CHOOSE US REASSURANCE STRIP */}
      <section className={styles.whySection} aria-label="Why Partner with DIMISI">
        <div className={styles.container}>
          <div className={styles.whyGrid}>
            {WHY_DIMISI_POINTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={idx * 60} className={styles.whyCol}>
                  <div className={styles.whyCard}>
                    <div className={styles.whyIconBox}>
                      <Icon className={styles.whyIcon} />
                    </div>
                    <h4 className={styles.whyTitle}>{item.title}</h4>
                    <p className={styles.whyText}>{item.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SERVICE CATEGORIES SHOWCASE SECTION */}
      {categoryItems.length > 0 && (
        <section className={styles.categoriesSection} id="categories-showcase" aria-label="Service Categories">
          <div className={styles.container}>
            <div className={styles.sectionHeaderCenter}>
              <Reveal variant="fade">
                <div className={styles.sectionEyebrow}>
                  <Sparkles className={styles.amberSparkle} />
                  <span>Disciplines & Categories</span>
                </div>
              </Reveal>
              <Reveal variant="up" delay={60}>
                <h2 className={styles.sectionTitle}>
                  Explore Our <span className={styles.gradientText}>Service Categories</span>
                </h2>
              </Reveal>
              <Reveal variant="up" delay={100}>
                <p className={styles.sectionSub}>
                  Structured capabilities designed to take your digital products from conceptual architecture
                  to global production scale.
                </p>
              </Reveal>
            </div>

            <div className={styles.categoriesGrid}>
              {categoryItems.map((cat, index) => {
                const count = categoryCounts[cat.name] || categoryCounts[cat.name.toLowerCase()] || 0;
                return (
                  <Reveal key={cat.id} delay={index * 50} className={styles.categoryShowcaseCol}>
                    <div className={styles.categoryShowcaseCard}>
                      <div className={styles.catCardTop}>
                        <div className={styles.catIconBox}>
                          <FolderKanban size={22} />
                        </div>
                        <span className={styles.catOrderBadge}>ORDER #{cat.order_index}</span>
                      </div>

                      <h3 className={styles.catCardTitle}>{cat.name}</h3>
                      <p className={styles.catCardDesc}>{cat.description}</p>

                      <div className={styles.catCardFooter}>
                        <span className={styles.catCountTag}>
                          {count} {count === 1 ? "Capability" : "Capabilities"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSelectCategory(cat.name)}
                          className={styles.catExploreBtn}
                        >
                          <span>Explore Services</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. CLOSING CALL TO ACTION SECTION */}
      <section className={styles.ctaSection} aria-label="Closing Call To Action">
        <div className={styles.container}>
          <Reveal variant="up">
            <div className={styles.ctaCard}>
              <div className={styles.ctaGlow} aria-hidden="true" />
              <div className={styles.ctaIconBadge}>
                <MessageSquare className={styles.ctaIcon} />
              </div>

              <h2 className={styles.ctaTitle}>Need a Tailored Technical Solution?</h2>

              <p className={styles.ctaSub}>
                We partner with engineering teams and visionary founders to build resilient systems.
                Tell us about your business goals and let's engineer what's next.
              </p>

              <div className={styles.ctaButtonRow}>
                <MagneticButton to="/contact">
                  <span>Discuss Your Requirements</span>
                  <ArrowUpRight size={18} />
                </MagneticButton>

                <MagneticButton to="/contact" variant="ghost">
                  <span>Book an Architecture Consultation</span>
                </MagneticButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
