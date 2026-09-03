import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  BookOpen,
  Sparkles,
  ArrowUpRight,
  Clock,
  Calendar,
  Layers,
  Code2,
  Cpu,
  Flame,
  Construction,
  AlertCircle,
  X,
  ChevronRight,
  User,
  Share2,
  Terminal,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal/Reveal";
import { TiltCard } from "@/components/common/TiltCard/TiltCard";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { getPublicBlogData } from "@/lib/blog.functions";
import type { BlogPostItem } from "@/lib/blog.shared";
import pageStyles from "@/styles/page.module.css";
import styles from "./BlogPage.module.css";

export function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [searchQuery, setSearchQuery] = useState("");

  // Live query synchronizing with DIMISI Admin Panel
  const { data: payload, isLoading } = useQuery({
    queryKey: ["publicBlog"],
    queryFn: () => getPublicBlogData(),
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 25,
  });

  const config = payload?.config || {
    hero_eyebrow: "Blog",
    hero_heading: "Ideas, Insights & Updates",
    hero_subline: "Thoughts on building software, shipping products, and the technology shaping tomorrow.",
    under_development_notice_active: true,
    under_development_notice_heading: "Publication Lab Under Active Development",
    under_development_notice_text: "Blog section under development. Please visit again after some time.",
  };

  const allPosts = payload?.posts || [];
  const featuredPost = payload?.featured_post || null;
  const categories = payload?.categories || [
    "All Posts",
    "Web",
    "Mobile",
    "AI",
    "Cloud",
    "Startups",
    "Technology Trends",
  ];
  const stats = payload?.stats || {
    totalPosts: allPosts.length,
    totalCategories: categories.length - 1,
    avgReadingTime: "8 min",
    latestPublishedDate: new Date().toISOString(),
  };

  // Filtered posts based on category and search query
  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allPosts.filter((post) => {
      const matchCat =
        selectedCategory === "All Posts" ||
        post.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchSearch =
        q === "" ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.author_name.toLowerCase().includes(q) ||
        (post.tags && post.tags.some((t) => t.toLowerCase().includes(q)));

      return matchCat && matchSearch;
    });
  }, [allPosts, selectedCategory, searchQuery]);

  return (
    <div className={pageStyles.page}>
      {/* 1. HERO SECTION WITH EMBEDDED BLOG LOGO GRAPHIC */}
      <section className={styles.heroSection} aria-label="Blog Hero">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContainer}>
          <Reveal variant="fade">
            <div className={styles.heroBadge}>
              <span className={styles.pulseDot} aria-hidden="true" />
              <span className={styles.badgeText}>{config.hero_eyebrow}</span>
            </div>
          </Reveal>

          <Reveal variant="up" delay={50}>
            <div className={styles.headingWithLogoRow}>
              <h1 className={styles.heroTitle}>
                {config.hero_heading.split(" & ")[0]} &amp;{" "}
                <span className={styles.gradientText}>
                  {config.hero_heading.split(" & ")[1] || "Updates"}
                </span>
              </h1>

              {/* Small Blog Graphic Logo Badge */}
              <div className={styles.blogLogoGraphic} title="DIMISI Editorial Journal">
                <div className={styles.logoGlow} />
                <BookOpen className={styles.logoBookIcon} />
                <span className={styles.logoSparkleDot} />
              </div>
            </div>
          </Reveal>

          <Reveal variant="up" delay={100}>
            <p className={styles.heroSubtitle}>{config.hero_subline}</p>
          </Reveal>

          {/* Quick Metrics Bar */}
          <Reveal variant="up" delay={140}>
            <div className={styles.metricsBar}>
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.totalPosts}</span>
                <span className={styles.metricLabel}>Published Articles</span>
              </div>
              <div className={styles.metricDivider} aria-hidden="true" />
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.totalCategories}</span>
                <span className={styles.metricLabel}>Core Disciplines</span>
              </div>
              <div className={styles.metricDivider} aria-hidden="true" />
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>{stats.avgReadingTime}</span>
                <span className={styles.metricLabel}>Avg Read Time</span>
              </div>
              <div className={styles.metricDivider} aria-hidden="true" />
              <div className={styles.metricItem}>
                <span className={styles.metricNum}>Weekly</span>
                <span className={styles.metricLabel}>Editorial Cadence</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. STATUS / UNDER DEVELOPMENT NOTICE WITH CUSTOM ILLUSTRATION */}
      {config.under_development_notice_active && (
        <section className={styles.noticeSection} aria-label="Development Notice">
          <div className={styles.container}>
            <Reveal variant="fade">
              <div className={styles.noticeCard}>
                <div className={styles.noticeIllustrationCol}>
                  <div className={styles.cyberConstructionCanvas}>
                    <div className={styles.radarSweep} />
                    <div className={styles.centerTerminalBox}>
                      <Construction className={styles.constructIcon} />
                    </div>
                    <div className={styles.floatingCodePill1}>
                      <Terminal size={12} className={styles.codeIcon} />
                      <span>MDX Engine // Active</span>
                    </div>
                    <div className={styles.floatingCodePill2}>
                      <Zap size={12} className={styles.codeIcon} />
                      <span>CMS Sync // 100%</span>
                    </div>
                  </div>
                </div>

                <div className={styles.noticeContentCol}>
                  <div className={styles.noticeTagRow}>
                    <span className={styles.noticeStatusDot} />
                    <span className={styles.noticeTagText}>DEVELOPMENT NOTICE</span>
                  </div>

                  <h3 className={styles.noticeHeading}>{config.under_development_notice_heading}</h3>
                  <p className={styles.noticeBodyText}>{config.under_development_notice_text}</p>

                  <div className={styles.noticeFooterActions}>
                    <MagneticButton to="/services" variant="ghost">
                      <span>Explore Our Services</span>
                    </MagneticButton>
                    <MagneticButton to="/work" variant="solid">
                      <span>View Case Studies</span>
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* 3. FEATURED POST SPOTLIGHT */}
      {featuredPost && selectedCategory === "All Posts" && searchQuery === "" && (
        <section className={styles.featuredSection} aria-label="Featured Article">
          <div className={styles.container}>
            <Reveal variant="up">
              <div className={styles.featuredCard}>
                <div className={styles.featuredImageCol}>
                  <img
                    src={featuredPost.cover_image}
                    alt={featuredPost.title}
                    className={styles.featuredCoverImg}
                    loading="lazy"
                  />
                  <div className={styles.featuredImageOverlay} />
                  <span className={styles.featuredBadge}>FEATURED INSIGHT</span>
                </div>

                <div className={styles.featuredInfoCol}>
                  <div className={styles.metaRow}>
                    <span className={styles.categoryPill}>{featuredPost.category}</span>
                    <span className={styles.readTimeText}>
                      <Clock size={13} />
                      <span>{featuredPost.reading_time}</span>
                    </span>
                  </div>

                  <h2 className={styles.featuredTitle}>
                    <Link to="/blog/$slug" params={{ slug: featuredPost.slug }}>
                      {featuredPost.title}
                    </Link>
                  </h2>

                  <p className={styles.featuredExcerpt}>{featuredPost.excerpt}</p>

                  <div className={styles.featuredAuthorFooter}>
                    <div className={styles.authorGroup}>
                      <img
                        src={featuredPost.author_avatar}
                        alt={featuredPost.author_name}
                        className={styles.authorAvatar}
                      />
                      <div>
                        <span className={styles.authorName}>{featuredPost.author_name}</span>
                        <span className={styles.authorRole}>{featuredPost.author_role}</span>
                      </div>
                    </div>

                    <Link
                      to="/blog/$slug"
                      params={{ slug: featuredPost.slug }}
                      className={styles.readMoreFeaturedBtn}
                    >
                      <span>Read Article</span>
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* 4. CATEGORIES & SEARCH TOOLBAR */}
      <section className={styles.listingSection} id="articles" aria-label="Blog Articles">
        <div className={styles.container}>
          <div className={styles.toolbarRow}>
            {/* Category Filter Pills */}
            <div className={styles.categoriesBar}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={[
                    styles.catPill,
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? styles.catPillActive
                      : "",
                  ].join(" ")}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className={styles.searchContainer}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search essays, tags, topics..."
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className={styles.clearBtn}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* 5. RESPONSIVE EDITORIAL CARD GRID */}
          <div className={styles.postsGrid}>
            {filteredPosts.length === 0 ? (
              <div className={styles.emptyStateBox}>
                <BookOpen size={40} className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>No Articles Found</h3>
                <p className={styles.emptySub}>
                  No published essays match "{searchQuery || selectedCategory}". Try selecting another category or check back soon!
                </p>
                <button
                  type="button"
                  className={styles.resetFilterBtn}
                  onClick={() => {
                    setSelectedCategory("All Posts");
                    setSearchQuery("");
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredPosts.map((post, idx) => (
                <Reveal key={post.id} delay={idx * 40} className={styles.gridItem}>
                  <TiltCard className={styles.postCard}>
                    {/* Post Cover Visual */}
                    <div className={styles.cardCoverWrapper}>
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className={styles.cardCoverImg}
                        loading="lazy"
                      />
                      <div className={styles.cardCoverGlow} />
                      <span className={styles.cardCategoryBadge}>{post.category}</span>
                    </div>

                    {/* Card Content */}
                    <div className={styles.cardBody}>
                      <div className={styles.cardMetaRow}>
                        <span className={styles.cardDate}>
                          <Calendar size={12} />
                          <span>
                            {new Date(post.published_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </span>
                        <span className={styles.cardReadTime}>
                          <Clock size={12} />
                          <span>{post.reading_time}</span>
                        </span>
                      </div>

                      <h3 className={styles.cardTitle}>
                        <Link to="/blog/$slug" params={{ slug: post.slug }}>
                          {post.title}
                        </Link>
                      </h3>

                      <p className={styles.cardExcerpt}>{post.excerpt}</p>

                      {/* Card Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className={styles.tagsRow}>
                          {post.tags.slice(0, 3).map((tag, tIdx) => (
                            <span key={tIdx} className={styles.tagChip}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Card Footer */}
                      <div className={styles.cardFooter}>
                        <div className={styles.cardAuthor}>
                          <img
                            src={post.author_avatar}
                            alt={post.author_name}
                            className={styles.cardAuthorAvatar}
                          />
                          <span className={styles.cardAuthorName}>{post.author_name}</span>
                        </div>

                        <Link
                          to="/blog/$slug"
                          params={{ slug: post.slug }}
                          className={styles.cardReadLink}
                        >
                          <span>Read</span>
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
